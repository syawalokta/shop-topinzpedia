/**
 * Seed database dengan katalog TopinzPedia.
 *
 * Cara pakai:
 *   MONGODB_URI="mongodb://..." npm run seed
 *   (tanpa MONGODB_URI akan memakai mongodb://127.0.0.1:27017/topinzpedia)
 */
import mongoose from "mongoose";

import { Category, Product, Variant } from "../models";
import { seedCategories, seedProducts } from "../lib/data/fallback-data";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/topinzpedia";

const DAY_MS = 86_400_000;

async function main() {
  console.log("→ Menghubungkan ke MongoDB…");
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB ?? "topinzpedia",
    serverSelectionTimeoutMS: 8000,
  });

  console.log("→ Membersihkan koleksi lama…");
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Variant.deleteMany({}),
  ]);

  console.log("→ Menanam kategori…");
  const categories = await Category.insertMany(seedCategories);
  const categoryMap = new Map(categories.map((c) => [c.slug, c._id]));

  console.log("→ Menanam produk & varian…");
  let variantCount = 0;

  for (const seed of seedProducts) {
    const { variants, category, daysAgo, ...rest } = seed;

    const categoryId = categoryMap.get(category);
    if (!categoryId) {
      throw new Error(`Kategori "${category}" tidak ditemukan untuk ${seed.name}`);
    }

    const product = await Product.create({
      ...rest,
      category: categoryId,
      createdAt: new Date(Date.now() - daysAgo * DAY_MS),
    });

    await Variant.insertMany(
      variants.map((v) => ({ ...v, productId: product._id }))
    );
    variantCount += variants.length;
  }

  console.log(
    `✓ Seed selesai: ${categories.length} kategori, ${seedProducts.length} produk, ${variantCount} varian`
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("✗ Seed gagal:", error);
  process.exit(1);
});
