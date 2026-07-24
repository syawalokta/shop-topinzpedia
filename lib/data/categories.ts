import { connectDB, isDbConfigured } from "../db";
import { Category, Product } from "../../models";
import { fallbackCategories, fallbackProducts } from "./fallback-data";
import type { CategoryDTO } from "../../types";

interface LeanCategory {
  _id: unknown;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

function toCategoryDTO(doc: LeanCategory, productCount?: number): CategoryDTO {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon,
    order: doc.order,
    ...(productCount !== undefined ? { productCount } : {}),
  };
}

function fallbackWithCount(): CategoryDTO[] {
  const products = fallbackProducts();
  return fallbackCategories().map((c) => ({
    ...c,
    productCount: products.filter(
      (p) => p.category.slug === c.slug && p.status === "active"
    ).length,
  }));
}

/** Seluruh kategori, terurut sesuai field `order`. */
export async function getCategories(): Promise<CategoryDTO[]> {
  if (!isDbConfigured()) return fallbackCategories();

  try {
    await connectDB();
    const docs = (await Category.find()
      .sort({ order: 1 })
      .lean()) as unknown as LeanCategory[];
    return docs.map((d) => toCategoryDTO(d));
  } catch (error) {
    console.error("[data/categories] fallback ke data statis:", error);
    return fallbackCategories();
  }
}

/** Kategori + jumlah produk aktif — untuk section kategori di landing page. */
export async function getCategoriesWithCount(): Promise<CategoryDTO[]> {
  if (!isDbConfigured()) return fallbackWithCount();

  try {
    await connectDB();

    const [docs, counts] = await Promise.all([
      Category.find().sort({ order: 1 }).lean() as unknown as Promise<
        LeanCategory[]
      >,
      Product.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]) as Promise<{ _id: unknown; count: number }[]>,
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    return docs.map((d) => toCategoryDTO(d, countMap.get(String(d._id)) ?? 0));
  } catch (error) {
    console.error("[data/categories] fallback ke data statis:", error);
    return fallbackWithCount();
  }
}
