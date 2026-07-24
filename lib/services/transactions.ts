import { Types } from "mongoose";

import { connectDB } from "../db";
import { escapeRegex } from "../utils";
import { buildPaged, pageSkip, type Paged } from "../pagination";
import { Transaction } from "../../models";

/** Service riwayat transaksi pembelian. */

export interface TransactionDTO {
  id: string;
  invoice: string;
  productName: string;
  variantName: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  total: number;
  deliveredContent: string;
  createdAt: string;
  user?: { name: string; email: string };
  productSlug?: string;
  productLogo?: string;
}

interface LeanTransaction {
  _id: Types.ObjectId;
  invoice: string;
  userId: Types.ObjectId | { name?: string; email?: string };
  productId: { slug?: string; logo?: string } | Types.ObjectId | null;
  paymentMethod: string;
  paymentStatus: TransactionDTO["paymentStatus"];
  total: number;
  deliveredContent: string;
  productName: string;
  variantName: string;
  createdAt?: Date;
}

function toDTO(doc: LeanTransaction): TransactionDTO {
  const user =
    doc.userId && typeof doc.userId === "object" && "email" in doc.userId
      ? (doc.userId as { name?: string; email?: string })
      : null;
  const product =
    doc.productId && typeof doc.productId === "object" && "slug" in doc.productId
      ? (doc.productId as { slug?: string; logo?: string })
      : null;

  return {
    id: String(doc._id),
    invoice: doc.invoice,
    productName: doc.productName,
    variantName: doc.variantName,
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    total: doc.total,
    deliveredContent: doc.deliveredContent,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    ...(user ? { user: { name: user.name ?? "", email: user.email ?? "" } } : {}),
    ...(product
      ? { productSlug: product.slug ?? "", productLogo: product.logo ?? "" }
      : {}),
  };
}

export async function listUserTransactions(
  userId: string,
  page = 1,
  perPage = 10
): Promise<Paged<TransactionDTO>> {
  await connectDB();
  const filter = { userId: new Types.ObjectId(userId) };

  const [docs, total] = await Promise.all([
    Transaction.find(filter)
      .populate("productId", "slug logo")
      .sort({ createdAt: -1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return buildPaged(
    (docs as unknown as LeanTransaction[]).map(toDTO),
    total,
    page,
    perPage
  );
}

/** Detail transaksi milik user (atau siapa pun bila admin). */
export async function getTransactionByInvoice(
  invoice: string,
  options: { userId?: string; isAdmin?: boolean }
): Promise<TransactionDTO | null> {
  await connectDB();

  const filter: Record<string, unknown> = { invoice };
  if (!options.isAdmin) {
    if (!options.userId) return null;
    filter.userId = new Types.ObjectId(options.userId);
  }

  const doc = await Transaction.findOne(filter)
    .populate("productId", "slug logo")
    .lean();
  return doc ? toDTO(doc as unknown as LeanTransaction) : null;
}

export async function adminListTransactions(params: {
  q?: string;
  status?: string;
  page?: number;
  perPage?: number;
}): Promise<Paged<TransactionDTO>> {
  await connectDB();
  const { q, status, page = 1, perPage = 10 } = params;

  const filter: Record<string, unknown> = {};
  if (status && ["pending", "paid", "failed", "refunded"].includes(status)) {
    filter.paymentStatus = status;
  }
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ invoice: regex }, { productName: regex }];
  }

  const [docs, total] = await Promise.all([
    Transaction.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return buildPaged(
    (docs as unknown as LeanTransaction[]).map(toDTO),
    total,
    page,
    perPage
  );
}

/** Data grafik: jumlah & nilai transaksi paid per hari (n hari terakhir). */
export async function dailyTransactionSeries(
  days = 14
): Promise<{ date: string; count: number; amount: number }[]> {
  await connectDB();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const agg = (await Transaction.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        amount: { $sum: "$total" },
      },
    },
  ])) as { _id: string; count: number; amount: number }[];

  const map = new Map(agg.map((row) => [row._id, row]));
  const series: { date: string; count: number; amount: number }[] = [];

  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = map.get(key);
    series.push({
      date: key,
      count: row?.count ?? 0,
      amount: row?.amount ?? 0,
    });
  }
  return series;
}
