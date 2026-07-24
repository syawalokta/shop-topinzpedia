import { Types } from "mongoose";

import { connectDB } from "../db";
import { escapeRegex } from "../utils";
import { buildPaged, pageSkip, type Paged } from "../pagination";
import { availableCountByVariant } from "../services/stock";
import { Category, Product, Variant } from "../../models";

/**
 * Data layer khusus panel admin.
 * Berbeda dengan lib/data/products.ts (publik), fungsi di sini:
 *  - menampilkan SEMUA status (termasuk inactive)
 *  - tidak memakai fallback statis — CRUD memang membutuhkan database
 */

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  logo: string;
  status: "active" | "inactive";
  rating: number;
  sold: number;
  categoryName: string;
  variantCount: number;
  minPrice: number | null;
  createdAt: string;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  category: string; // ObjectId string — untuk nilai Select pada form
  logo: string;
  banner: string;
  accent: string;
  description: string;
  features: string[];
  rating: number;
  sold: number;
  status: "active" | "inactive";
}

export interface AdminVariantRow {
  id: string;
  name: string;
  price: number;
  /** Dihitung dari koleksi Stock (status available) */
  availableStock: number;
  duration: string;
  warranty: string;
  description: string;
  active: boolean;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  productCount: number;
}

interface LeanProductAdmin {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: { name: string; slug: string } | null;
  logo: string;
  banner: string;
  accent: string;
  description: string;
  features: string[];
  rating: number;
  sold: number;
  status: "active" | "inactive";
  createdAt?: Date;
}

export async function adminListProducts(
  params: {
    q?: string;
    category?: string;
    status?: string;
    page?: number;
    perPage?: number;
  } = {}
): Promise<Paged<AdminProductRow>> {
  await connectDB();
  const { q, category, status, page = 1, perPage = 10 } = params;

  const filter: Record<string, unknown> = {};
  if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };
  if (status && ["active", "inactive"].includes(status)) filter.status = status;
  if (category) {
    const cat = await Category.findOne({ slug: category }).select("_id").lean();
    filter.category = cat ? cat._id : new Types.ObjectId();
  }

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean() as unknown as Promise<LeanProductAdmin[]>,
    Product.countDocuments(filter),
  ]);

  const variantStats = (await Variant.aggregate([
    { $match: { productId: { $in: docs.map((d) => d._id) } } },
    {
      $group: {
        _id: "$productId",
        count: { $sum: 1 },
        min: { $min: "$price" },
      },
    },
  ])) as { _id: Types.ObjectId; count: number; min: number }[];

  const statMap = new Map(
    variantStats.map((s) => [String(s._id), { count: s.count, min: s.min }])
  );

  const items = docs.map((doc) => {
    const stat = statMap.get(String(doc._id));
    return {
      id: String(doc._id),
      name: doc.name,
      slug: doc.slug,
      logo: doc.logo,
      status: doc.status,
      rating: doc.rating,
      sold: doc.sold,
      categoryName: doc.category?.name ?? "—",
      variantCount: stat?.count ?? 0,
      minPrice: stat?.min ?? null,
      createdAt: (doc.createdAt ?? new Date()).toISOString(),
    };
  });

  return buildPaged(items, total, page, perPage);
}

export async function adminGetProduct(
  id: string
): Promise<AdminProductDetail | null> {
  if (!Types.ObjectId.isValid(id)) return null;

  await connectDB();

  const doc = (await Product.findById(id).lean()) as unknown as
    | (Omit<LeanProductAdmin, "category"> & { category: Types.ObjectId })
    | null;
  if (!doc) return null;

  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    category: String(doc.category),
    logo: doc.logo,
    banner: doc.banner,
    accent: doc.accent,
    description: doc.description,
    features: doc.features ?? [],
    rating: doc.rating,
    sold: doc.sold,
    status: doc.status,
  };
}

export async function adminListVariants(
  productId: string
): Promise<AdminVariantRow[]> {
  if (!Types.ObjectId.isValid(productId)) return [];

  await connectDB();

  const docs = (await Variant.find({ productId })
    .sort({ price: 1 })
    .lean()) as unknown as {
    _id: Types.ObjectId;
    name: string;
    price: number;
    duration: string;
    warranty: string;
    description: string;
    active: boolean;
  }[];

  const counts = await availableCountByVariant(docs.map((d) => d._id));

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    price: doc.price,
    availableStock: counts.get(String(doc._id)) ?? 0,
    duration: doc.duration,
    warranty: doc.warranty,
    description: doc.description,
    active: doc.active,
  }));
}

interface LeanCategoryAdmin {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

async function categoryCounts(): Promise<Map<string, number>> {
  const counts = (await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ])) as { _id: Types.ObjectId; count: number }[];
  return new Map(counts.map((c) => [String(c._id), c.count]));
}

/** Seluruh kategori (untuk opsi Select pada form). */
export async function adminListCategories(): Promise<AdminCategoryRow[]> {
  await connectDB();

  const [docs, countMap] = await Promise.all([
    Category.find().sort({ order: 1 }).lean() as unknown as Promise<
      LeanCategoryAdmin[]
    >,
    categoryCounts(),
  ]);

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon,
    order: doc.order,
    productCount: countMap.get(String(doc._id)) ?? 0,
  }));
}

/** Kategori dengan pencarian + pagination (halaman kelola kategori). */
export async function adminListCategoriesPaged(params: {
  q?: string;
  page?: number;
  perPage?: number;
}): Promise<Paged<AdminCategoryRow>> {
  await connectDB();
  const { q, page = 1, perPage = 10 } = params;

  const filter: Record<string, unknown> = {};
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: regex }, { slug: regex }];
  }

  const [docs, total, countMap] = await Promise.all([
    Category.find(filter)
      .sort({ order: 1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean() as unknown as Promise<LeanCategoryAdmin[]>,
    Category.countDocuments(filter),
    categoryCounts(),
  ]);

  const items = docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon,
    order: doc.order,
    productCount: countMap.get(String(doc._id)) ?? 0,
  }));

  return buildPaged(items, total, page, perPage);
}

/** Statistik katalog dasar + produk terlaris (dashboard admin). */
export async function getCatalogStats(): Promise<{
  productCount: number;
  categoryCount: number;
  variantCount: number;
  totalSold: number;
  topProducts: { id: string; name: string; sold: number; logo: string }[];
}> {
  await connectDB();

  const [productCount, categoryCount, variantCount, soldAgg, topDocs] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Variant.countDocuments(),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: "$sold" } } },
      ]) as Promise<{ total: number }[]>,
      Product.find({ status: "active" })
        .sort({ sold: -1 })
        .limit(5)
        .select("name sold logo")
        .lean() as unknown as Promise<
        { _id: Types.ObjectId; name: string; sold: number; logo: string }[]
      >,
    ]);

  return {
    productCount,
    categoryCount,
    variantCount,
    totalSold: soldAgg[0]?.total ?? 0,
    topProducts: topDocs.map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      sold: doc.sold,
      logo: doc.logo,
    })),
  };
}
