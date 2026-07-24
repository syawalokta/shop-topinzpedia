import { cache } from "react";
import { Types } from "mongoose";

import { connectDB, isDbConfigured } from "../db";
import { escapeRegex } from "../utils";
import { Category, Product, Variant } from "../../models";
import { fallbackProducts } from "./fallback-data";
import type {
  CatalogQuery,
  ProductDTO,
  ProductDetail,
  SortKey,
  VariantDTO,
} from "../../types";

/* ------------------------------------------------------------------ */
/* Tipe internal hasil query .lean()                                    */
/* ------------------------------------------------------------------ */

interface LeanCategoryRef {
  name: string;
  slug: string;
}

interface LeanProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: LeanCategoryRef | null;
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

interface LeanVariant {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  price: number;
  stock: number;
  duration: string;
  warranty: string;
  description: string;
  active: boolean;
}

/* ------------------------------------------------------------------ */
/* Serializer                                                           */
/* ------------------------------------------------------------------ */

function toProductDTO(doc: LeanProduct, startingPrice: number): ProductDTO {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    category: {
      name: doc.category?.name ?? "Lainnya",
      slug: doc.category?.slug ?? "lainnya",
    },
    logo: doc.logo,
    banner: doc.banner,
    accent: doc.accent,
    description: doc.description,
    features: doc.features ?? [],
    rating: doc.rating,
    sold: doc.sold,
    status: doc.status,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    startingPrice,
  };
}

function toVariantDTO(doc: LeanVariant): VariantDTO {
  return {
    id: String(doc._id),
    productId: String(doc.productId),
    name: doc.name,
    price: doc.price,
    stock: doc.stock,
    duration: doc.duration,
    warranty: doc.warranty,
    description: doc.description,
    active: doc.active,
  };
}

/* ------------------------------------------------------------------ */
/* Sorting & filtering (dipakai jalur DB maupun fallback)               */
/* ------------------------------------------------------------------ */

function sortProducts<T extends ProductDTO>(
  products: T[],
  sort: SortKey = "popular"
): T[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "price-asc":
      return list.sort((a, b) => a.startingPrice - b.startingPrice);
    case "price-desc":
      return list.sort((a, b) => b.startingPrice - a.startingPrice);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.sold - a.sold);
    case "popular":
    default:
      return list.sort((a, b) => b.sold - a.sold);
  }
}

function filterFallback(query: CatalogQuery): ProductDTO[] {
  let list: ProductDTO[] = fallbackProducts().filter(
    (p) => p.status === "active"
  );

  if (query.category) {
    list = list.filter((p) => p.category.slug === query.category);
  }

  if (query.q) {
    const q = query.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return sortProducts(list, query.sort);
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

/**
 * Ambil daftar produk aktif sesuai pencarian, kategori, dan urutan.
 * Otomatis fallback ke data statis bila database tidak tersedia.
 */
export async function getProducts(
  query: CatalogQuery = {}
): Promise<ProductDTO[]> {
  if (!isDbConfigured()) return filterFallback(query);

  try {
    await connectDB();

    const filter: Record<string, unknown> = { status: "active" };

    if (query.category) {
      const category = await Category.findOne({ slug: query.category })
        .select("_id")
        .lean();
      if (!category) return [];
      filter.category = category._id;
    }

    if (query.q) {
      filter.name = { $regex: escapeRegex(query.q), $options: "i" };
    }

    const docs = (await Product.find(filter)
      .populate("category", "name slug")
      .lean()) as unknown as LeanProduct[];

    if (!docs.length) return [];

    // Harga termurah per produk dalam satu query aggregate
    const ids = docs.map((d) => d._id);
    const minPrices = (await Variant.aggregate([
      { $match: { productId: { $in: ids }, active: true } },
      { $group: { _id: "$productId", min: { $min: "$price" } } },
    ])) as { _id: unknown; min: number }[];

    const minMap = new Map(minPrices.map((m) => [String(m._id), m.min]));
    const list = docs.map((d) =>
      toProductDTO(d, minMap.get(String(d._id)) ?? 0)
    );

    return sortProducts(list, query.sort);
  } catch (error) {
    console.error("[data/products] fallback ke data statis:", error);
    return filterFallback(query);
  }
}

/**
 * Ambil satu produk beserta seluruh varian aktifnya (halaman detail).
 * Dibungkus React `cache` agar generateMetadata & page hanya query sekali.
 */
export const getProductBySlug = cache(async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  if (!isDbConfigured()) {
    return fallbackProducts().find((p) => p.slug === slug) ?? null;
  }

  try {
    await connectDB();

    const doc = (await Product.findOne({ slug, status: "active" })
      .populate("category", "name slug")
      .lean()) as unknown as LeanProduct | null;

    if (!doc) return null;

    const variantDocs = (await Variant.find({
      productId: doc._id,
      active: true,
    })
      .sort({ price: 1 })
      .lean()) as unknown as LeanVariant[];

    const variants = variantDocs.map(toVariantDTO);
    const startingPrice = variants.length ? variants[0].price : 0;

    return { ...toProductDTO(doc, startingPrice), variants };
  } catch (error) {
    console.error("[data/products] fallback ke data statis:", error);
    return fallbackProducts().find((p) => p.slug === slug) ?? null;
  }
});

/**
 * Produk lain dalam kategori yang sama (untuk section "Produk Serupa").
 */
export async function getRelatedProducts(
  product: ProductDTO,
  limit = 4
): Promise<ProductDTO[]> {
  const sameCategory = await getProducts({
    category: product.category.slug,
    sort: "popular",
  });

  const related = sameCategory.filter((p) => p.slug !== product.slug);

  // Bila kategori terlalu kecil, lengkapi dengan produk terpopuler lain
  if (related.length < limit) {
    const popular = await getProducts({ sort: "popular" });
    for (const p of popular) {
      if (
        related.length >= limit ||
        related.some((r) => r.slug === p.slug) ||
        p.slug === product.slug
      )
        continue;
      related.push(p);
    }
  }

  return related.slice(0, limit);
}
