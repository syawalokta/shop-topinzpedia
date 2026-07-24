import { Types } from "mongoose";

import { connectDB } from "../db";
import { buildPaged, pageSkip, type Paged } from "../pagination";
import { creditWallet } from "./wallet";
import { Topup } from "../../models";

/** Service topup manual (transfer bank / QRIS statis). */

export interface TopupDTO {
  id: string;
  amount: number;
  method: string;
  proofImage: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string;
  createdAt: string;
  processedAt: string | null;
  user?: { name: string; email: string; username: string };
}

interface LeanTopup {
  _id: Types.ObjectId;
  userId: Types.ObjectId | { name?: string; email?: string; username?: string };
  amount: number;
  method: string;
  proofImage: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  adminNote: string;
  processedAt: Date | null;
  createdAt?: Date;
}

function toDTO(doc: LeanTopup): TopupDTO {
  const populated =
    doc.userId && typeof doc.userId === "object" && "email" in doc.userId
      ? (doc.userId as { name?: string; email?: string; username?: string })
      : null;

  return {
    id: String(doc._id),
    amount: doc.amount,
    method: doc.method,
    proofImage: doc.proofImage,
    note: doc.note,
    status: doc.status,
    adminNote: doc.adminNote,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    processedAt: doc.processedAt ? doc.processedAt.toISOString() : null,
    ...(populated
      ? {
          user: {
            name: populated.name ?? "",
            email: populated.email ?? "",
            username: populated.username ?? "",
          },
        }
      : {}),
  };
}

export async function createTopup(
  userId: string,
  input: {
    amount: number;
    method: "manual_transfer" | "qris";
    proofImage: string;
    note: string;
  }
): Promise<TopupDTO> {
  await connectDB();
  const doc = await Topup.create({ userId, ...input, status: "pending" });
  return toDTO(doc.toObject() as unknown as LeanTopup);
}

export async function listUserTopups(
  userId: string,
  page = 1,
  perPage = 10
): Promise<Paged<TopupDTO>> {
  await connectDB();
  const filter = { userId: new Types.ObjectId(userId) };
  const [docs, total] = await Promise.all([
    Topup.find(filter)
      .sort({ createdAt: -1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean(),
    Topup.countDocuments(filter),
  ]);
  return buildPaged(
    (docs as unknown as LeanTopup[]).map(toDTO),
    total,
    page,
    perPage
  );
}

export async function adminListTopups(params: {
  status?: string;
  page?: number;
  perPage?: number;
}): Promise<Paged<TopupDTO>> {
  await connectDB();
  const { status, page = 1, perPage = 10 } = params;
  const filter: Record<string, unknown> = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const [docs, total] = await Promise.all([
    Topup.find(filter)
      .populate("userId", "name email username")
      .sort({ status: 1, createdAt: -1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean(),
    Topup.countDocuments(filter),
  ]);

  return buildPaged(
    (docs as unknown as LeanTopup[]).map(toDTO),
    total,
    page,
    perPage
  );
}

/**
 * Approve topup — atomik (hanya dari status pending) agar tidak
 * bisa di-approve dua kali. Saldo bertambah + tercatat di ledger.
 */
export async function approveTopup(
  topupId: string,
  adminNote = ""
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  if (!Types.ObjectId.isValid(topupId)) {
    return { ok: false, error: "ID topup tidak valid." };
  }

  const doc = await Topup.findOneAndUpdate(
    { _id: topupId, status: "pending" },
    { status: "approved", adminNote, processedAt: new Date() },
    { new: true }
  );
  if (!doc) {
    return { ok: false, error: "Topup tidak ditemukan atau sudah diproses." };
  }

  await creditWallet(
    String(doc.userId),
    doc.amount,
    "Topup saldo disetujui admin",
    `topup:${String(doc._id)}`
  );
  return { ok: true };
}

export async function rejectTopup(
  topupId: string,
  adminNote = ""
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  if (!Types.ObjectId.isValid(topupId)) {
    return { ok: false, error: "ID topup tidak valid." };
  }

  const doc = await Topup.findOneAndUpdate(
    { _id: topupId, status: "pending" },
    { status: "rejected", adminNote, processedAt: new Date() },
    { new: true }
  );
  if (!doc) {
    return { ok: false, error: "Topup tidak ditemukan atau sudah diproses." };
  }
  return { ok: true };
}

export async function topupStats(): Promise<{
  pendingCount: number;
  totalApproved: number;
}> {
  await connectDB();
  const [pendingCount, approvedAgg] = await Promise.all([
    Topup.countDocuments({ status: "pending" }),
    Topup.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]) as Promise<{ total: number }[]>,
  ]);
  return { pendingCount, totalApproved: approvedAgg[0]?.total ?? 0 };
}
