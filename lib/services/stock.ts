import { Types } from "mongoose";

import { connectDB } from "../db";
import { escapeRegex } from "../utils";
import { buildPaged, pageSkip, type Paged } from "../pagination";
import { Stock, Variant } from "../../models";

/** Service stok — 1 dokumen Stock = 1 akun siap kirim. */

export interface StockDTO {
  id: string;
  content: string;
  status: "available" | "reserved" | "sold";
  createdAt: string;
  variant: { id: string; name: string; duration: string };
  product: { id: string; name: string };
  buyer: { name: string; email: string } | null;
}

interface LeanStockRow {
  _id: Types.ObjectId;
  content: string;
  status: "available" | "reserved" | "sold";
  createdAt?: Date;
  variantId: {
    _id: Types.ObjectId;
    name: string;
    duration: string;
    productId: { _id: Types.ObjectId; name: string } | null;
  } | null;
  buyerId: { name?: string; email?: string } | null;
}

export async function adminListStock(params: {
  q?: string;
  status?: string;
  productId?: string;
  variantId?: string;
  page?: number;
  perPage?: number;
}): Promise<Paged<StockDTO>> {
  await connectDB();
  const { q, status, productId, variantId, page = 1, perPage = 10 } = params;

  const filter: Record<string, unknown> = {};

  if (status && ["available", "reserved", "sold"].includes(status)) {
    filter.status = status;
  }
  if (variantId && Types.ObjectId.isValid(variantId)) {
    filter.variantId = new Types.ObjectId(variantId);
  } else if (productId && Types.ObjectId.isValid(productId)) {
    const variantIds = await Variant.find({ productId })
      .select("_id")
      .lean();
    filter.variantId = { $in: variantIds.map((v) => v._id) };
  }
  if (q) {
    filter.content = { $regex: escapeRegex(q), $options: "i" };
  }

  const [docs, total] = await Promise.all([
    Stock.find(filter)
      .populate({
        path: "variantId",
        select: "name duration productId",
        populate: { path: "productId", select: "name" },
      })
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean(),
    Stock.countDocuments(filter),
  ]);

  const items: StockDTO[] = (docs as unknown as LeanStockRow[]).map((doc) => ({
    id: String(doc._id),
    content: doc.content,
    status: doc.status,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    variant: doc.variantId
      ? {
          id: String(doc.variantId._id),
          name: doc.variantId.name,
          duration: doc.variantId.duration,
        }
      : { id: "", name: "—", duration: "" },
    product: doc.variantId?.productId
      ? {
          id: String(doc.variantId.productId._id),
          name: doc.variantId.productId.name,
        }
      : { id: "", name: "—" },
    buyer: doc.buyerId
      ? { name: doc.buyerId.name ?? "", email: doc.buyerId.email ?? "" }
      : null,
  }));

  return buildPaged(items, total, page, perPage);
}

export async function createStock(
  variantId: string,
  content: string
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  if (!Types.ObjectId.isValid(variantId)) {
    return { ok: false, error: "Varian tidak valid." };
  }
  const exists = await Variant.exists({ _id: variantId });
  if (!exists) return { ok: false, error: "Varian tidak ditemukan." };

  await Stock.create({ variantId, content: content.trim() });
  return { ok: true };
}

export async function updateStock(
  id: string,
  input: { content: string; status: "available" | "reserved" }
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  if (!Types.ObjectId.isValid(id)) {
    return { ok: false, error: "ID stok tidak valid." };
  }

  // Stok yang sudah terjual tidak boleh diubah (jejak pembelian)
  const updated = await Stock.findOneAndUpdate(
    { _id: id, status: { $ne: "sold" } },
    { content: input.content.trim(), status: input.status }
  );
  if (!updated) {
    return {
      ok: false,
      error: "Stok tidak ditemukan atau sudah terjual (tidak bisa diedit).",
    };
  }
  return { ok: true };
}

export async function deleteStock(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  if (!Types.ObjectId.isValid(id)) {
    return { ok: false, error: "ID stok tidak valid." };
  }

  const deleted = await Stock.findOneAndDelete({
    _id: id,
    status: { $ne: "sold" },
  });
  if (!deleted) {
    return {
      ok: false,
      error: "Stok tidak ditemukan atau sudah terjual (tidak bisa dihapus).",
    };
  }
  return { ok: true };
}

export interface BulkImportResult {
  ok: boolean;
  error?: string;
  success: number;
  failed: number;
  total: number;
}

/**
 * Import massal — satu baris = satu akun.
 * Baris berformat "email:password" otomatis dirapikan menjadi
 * "Email: ...\nPassword: ..."; selain itu disimpan apa adanya.
 */
export async function bulkImportStock(
  variantId: string,
  raw: string
): Promise<BulkImportResult> {
  await connectDB();
  if (!Types.ObjectId.isValid(variantId)) {
    return { ok: false, error: "Varian tidak valid.", success: 0, failed: 0, total: 0 };
  }
  const exists = await Variant.exists({ _id: variantId });
  if (!exists) {
    return { ok: false, error: "Varian tidak ditemukan.", success: 0, failed: 0, total: 0 };
  }

  const lines = raw.split("\n").map((line) => line.trim());
  const nonEmpty = lines.filter((line) => line.length > 0);

  const docs: { variantId: string; content: string }[] = [];
  let failed = 0;

  for (const line of nonEmpty) {
    if (line.length < 3) {
      failed += 1;
      continue;
    }
    const match = line.match(/^([^\s:@]+@[^\s:]+)\s*:\s*(.+)$/);
    const content = match
      ? `Email: ${match[1]}\nPassword: ${match[2].trim()}`
      : line;
    docs.push({ variantId, content });
  }

  if (docs.length > 0) {
    await Stock.insertMany(docs);
  }

  return {
    ok: true,
    success: docs.length,
    failed,
    total: nonEmpty.length,
  };
}

/** Jumlah stok "available" per varian — Map<variantId, count>. */
export async function availableCountByVariant(
  variantIds: (string | Types.ObjectId)[]
): Promise<Map<string, number>> {
  await connectDB();
  if (variantIds.length === 0) return new Map();

  const agg = (await Stock.aggregate([
    {
      $match: {
        variantId: { $in: variantIds.map((id) => new Types.ObjectId(String(id))) },
        status: "available",
      },
    },
    { $group: { _id: "$variantId", count: { $sum: 1 } } },
  ])) as { _id: Types.ObjectId; count: number }[];

  return new Map(agg.map((row) => [String(row._id), row.count]));
}

export interface VariantOption {
  id: string;
  productId: string;
  productName: string;
  label: string;
}

/** Opsi varian (dengan nama produk) untuk filter & form import. */
export async function listVariantOptions(): Promise<VariantOption[]> {
  await connectDB();
  const docs = (await Variant.find()
    .populate("productId", "name")
    .sort({ createdAt: 1 })
    .lean()) as unknown as {
    _id: Types.ObjectId;
    name: string;
    duration: string;
    productId: { _id: Types.ObjectId; name: string } | null;
  }[];

  return docs
    .filter((doc) => doc.productId)
    .map((doc) => ({
      id: String(doc._id),
      productId: String(doc.productId?._id),
      productName: doc.productId?.name ?? "—",
      label: `${doc.name} · ${doc.duration}`,
    }));
}

export async function stockStats(): Promise<{
  available: number;
  sold: number;
}> {
  await connectDB();
  const [available, sold] = await Promise.all([
    Stock.countDocuments({ status: "available" }),
    Stock.countDocuments({ status: "sold" }),
  ]);
  return { available, sold };
}
