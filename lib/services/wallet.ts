import { Types } from "mongoose";

import { connectDB } from "../db";
import { buildPaged, pageSkip, type Paged } from "../pagination";
import { Wallet, WalletTransaction } from "../../models";

/** Service wallet — SEMUA mutasi saldo wajib lewat sini. */

export interface WalletTxDTO {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference: string;
  createdAt: string;
}

/** Pastikan user punya wallet (idempotent) lalu kembalikan saldonya. */
export async function getOrCreateWallet(
  userId: string
): Promise<{ balance: number }> {
  await connectDB();
  const doc = await Wallet.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { $setOnInsert: { balance: 0 } },
    { upsert: true, returnDocument: "after" }
  ).lean();
  return { balance: doc?.balance ?? 0 };
}

/** Tambah saldo + catat mutasi (dipakai approve topup & refund). */
export async function creditWallet(
  userId: string,
  amount: number,
  description: string,
  reference = ""
): Promise<void> {
  await connectDB();
  await Wallet.updateOne(
    { userId: new Types.ObjectId(userId) },
    { $inc: { balance: amount }, $setOnInsert: {} },
    { upsert: true }
  );
  await WalletTransaction.create({
    userId,
    type: "credit",
    amount,
    description,
    reference,
  });
}

/**
 * Potong saldo secara ATOMIK hanya bila mencukupi.
 * Mengembalikan false bila saldo kurang — tanpa race condition.
 */
export async function debitWalletIfSufficient(
  userId: string,
  amount: number,
  description: string,
  reference = ""
): Promise<boolean> {
  await connectDB();
  const updated = await Wallet.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), balance: { $gte: amount } },
    { $inc: { balance: -amount } },
    { returnDocument: "after" }
  );
  if (!updated) return false;

  await WalletTransaction.create({
    userId,
    type: "debit",
    amount,
    description,
    reference,
  });
  return true;
}

export async function listWalletTransactions(
  userId: string,
  page = 1,
  perPage = 10
): Promise<Paged<WalletTxDTO>> {
  await connectDB();
  const filter = { userId: new Types.ObjectId(userId) };

  const [docs, total] = await Promise.all([
    WalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean(),
    WalletTransaction.countDocuments(filter),
  ]);

  const items: WalletTxDTO[] = docs.map((doc) => ({
    id: String(doc._id),
    type: doc.type as "credit" | "debit",
    amount: doc.amount,
    description: doc.description,
    reference: doc.reference,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  }));

  return buildPaged(items, total, page, perPage);
}

/** Total saldo seluruh user — untuk statistik admin. */
export async function totalUserBalance(): Promise<number> {
  await connectDB();
  const agg = (await Wallet.aggregate([
    { $group: { _id: null, total: { $sum: "$balance" } } },
  ])) as { total: number }[];
  return agg[0]?.total ?? 0;
}
