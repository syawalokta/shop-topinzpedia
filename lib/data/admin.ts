import { Types } from "mongoose";

import { connectDB } from "../db";
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
  stock: number;
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

export interface DashboardStats {
  productCount: number;
  categoryCount: number;
  variantCount: number;
  totalSold: number;
  recentProducts: {
    id: string;
    name: string;
    categoryName: string;
    status: string;
    sold: number;
    createdAt: string;
  }[];
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

export async function adminListProducts(): Promise<AdminProductRow[]> {
  await connectDB();

  const [docs, variantStats] = await Promise.all([
    Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean() as unknown as Promise<LeanProductAdmin[]>,
    Variant.aggregate([
      {
        $group: {
          _id: "$productId",
          count: { $sum: 1 },
          min: { $min: "$price" },
        },
      },
    ]) as Promise<{ _id: Types.ObjectId; count: number; min: number }[]>,
  ]);

  const statMap = new Map(
    variantStats.map((s) => [String(s._id), { count: s.count, min: s.min }])
  );

  return docs.map((doc) => {
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
    stock: number;
    duration: string;
    warranty: string;
    description: string;
    active: boolean;
  }[];

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    price: doc.price,
    stock: doc.stock,
    duration: doc.duration,
    warranty: doc.warranty,
    description: doc.description,
    active: doc.active,
  }));
}

export async function adminListCategories(): Promise<AdminCategoryRow[]> {
  await connectDB();

  const [docs, counts] = await Promise.all([
    Category.find().sort({ order: 1 }).lean() as unknown as Promise<
      {
        _id: Types.ObjectId;
        name: string;
        slug: string;
        icon: string;
        order: number;
      }[]
    >,
    Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]) as Promise<{ _id: Types.ObjectId; count: number }[]>,
  ]);

  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon,
    order: doc.order,
    productCount: countMap.get(String(doc._id)) ?? 0,
  }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();

  const [productCount, categoryCount, variantCount, soldAgg, recentDocs] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Variant.countDocuments(),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: "$sold" } } },
      ]) as Promise<{ _id: null; total: number }[]>,
      Product.find()
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean() as unknown as Promise<LeanProductAdmin[]>,
    ]);

  return {
    productCount,
    categoryCount,
    variantCount,
    totalSold: soldAgg[0]?.total ?? 0,
    recentProducts: recentDocs.map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      categoryName: doc.category?.name ?? "—",
      status: doc.status,
      sold: doc.sold,
      createdAt: (doc.createdAt ?? new Date()).toISOString(),
    })),
  };
}
