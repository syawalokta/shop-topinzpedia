/**
 * Seed database dengan katalog TopinzPedia + data sistem wallet.
 *
 * Cara pakai:
 *   MONGODB_URI="mongodb://..." npm run seed
 *   (tanpa MONGODB_URI akan memakai mongodb://127.0.0.1:27017/topinzpedia)
 *
 * Akun yang dibuat:
 *   admin@topinzpedia.com / SEED_ADMIN_PASSWORD (default: admin12345) — role admin
 *   demo@topinzpedia.com  / demo12345 — role user, saldo Rp200.000
 */
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import {
  Category,
  Page,
  PaymentSetting,
  Product,
  SiteSetting,
  Stock,
  Token,
  Topup,
  Transaction,
  User,
  Variant,
  Wallet,
  WalletTransaction,
} from "../models";
import { seedCategories, seedProducts } from "../lib/data/fallback-data";
import {
  PRIVACY_CONTENT,
  PRIVACY_SLUG,
  PRIVACY_TITLE,
  TERMS_CONTENT,
  TERMS_SLUG,
  TERMS_TITLE,
} from "../lib/legal-content";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/topinzpedia";

const DAY_MS = 86_400_000;

function randomPassword(length = 10): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars.charAt(randomInt(chars.length))).join(
    ""
  );
}

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
    Stock.deleteMany({}),
    Transaction.deleteMany({}),
    Topup.deleteMany({}),
    User.deleteMany({}),
    Wallet.deleteMany({}),
    WalletTransaction.deleteMany({}),
    PaymentSetting.deleteMany({}),
    SiteSetting.deleteMany({}),
    Token.deleteMany({}),
    Page.deleteMany({}),
  ]);

  console.log("→ Menanam kategori…");
  const categories = await Category.insertMany(seedCategories);
  const categoryMap = new Map(categories.map((c) => [c.slug, c._id]));

  console.log("→ Menanam produk, varian & stok…");
  let variantCount = 0;
  let stockCount = 0;

  for (const seed of seedProducts) {
    const { variants, category, daysAgo, ...rest } = seed;

    const categoryId = categoryMap.get(category);
    if (!categoryId) {
      throw new Error(
        `Kategori "${category}" tidak ditemukan untuk ${seed.name}`
      );
    }

    const product = await Product.create({
      ...rest,
      category: categoryId,
      createdAt: new Date(Date.now() - daysAgo * DAY_MS),
    });

    for (const [index, variantSeed] of variants.entries()) {
      // Field `stock` (angka) dari katalog dipakai sebagai petunjuk
      // banyaknya entri Stock yang dibuat (1 entri = 1 akun).
      const { stock: initialStock, ...variantData } = variantSeed;
      const variant = await Variant.create({
        ...variantData,
        productId: product._id,
      });
      variantCount += 1;

      const entries = Math.max(2, Math.min(6, Math.ceil(initialStock / 30)));
      const stocks = Array.from({ length: entries }, (_, i) => ({
        variantId: variant._id,
        status: "available" as const,
        content: [
          `Email: demo.${product.slug}.v${index + 1}.${i + 1}@topinz.dev`,
          `Password: ${randomPassword()}`,
          `PIN: ${1000 + randomInt(9000)}`,
        ].join("\n"),
      }));
      await Stock.insertMany(stocks);
      stockCount += entries;
    }
  }

  console.log("→ Membuat akun admin & demo…");
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const admin = await User.create({
    name: "Admin TopinzPedia",
    username: "admin",
    email: "admin@topinzpedia.com",
    passwordHash: await bcrypt.hash(adminPassword, 10),
    role: "admin",
    provider: "credentials",
    emailVerified: new Date(),
  });
  await Wallet.create({ userId: admin._id, balance: 0 });

  const demo = await User.create({
    name: "Demo Buyer",
    username: "demo",
    email: "demo@topinzpedia.com",
    passwordHash: await bcrypt.hash("demo12345", 10),
    role: "user",
    provider: "credentials",
    emailVerified: new Date(),
  });
  await Wallet.create({ userId: demo._id, balance: 200_000 });
  await WalletTransaction.create({
    userId: demo._id,
    type: "credit",
    amount: 200_000,
    description: "Saldo awal akun demo",
    reference: "seed",
  });

  console.log("→ Menyiapkan pengaturan default…");
  await PaymentSetting.create({
    key: "payment",
    wallet: { enabled: true },
    manualTransfer: {
      enabled: true,
      bankName: "BCA",
      accountNumber: "1234567890",
      accountName: "TopinzPedia",
    },
    qris: { enabled: false, qrImage: "" },
  });
  await SiteSetting.create({
    key: "site",
    googleAuthEnabled: false,
    registrationEnabled: true,
    emailVerificationEnabled: false,
  });

  console.log("→ Menanam halaman legal (S&K + Kebijakan Privasi)…");
  await Page.insertMany([
    { slug: TERMS_SLUG, title: TERMS_TITLE, content: TERMS_CONTENT },
    { slug: PRIVACY_SLUG, title: PRIVACY_TITLE, content: PRIVACY_CONTENT },
  ]);

  console.log(
    `✓ Seed selesai: ${categories.length} kategori, ${seedProducts.length} produk, ${variantCount} varian, ${stockCount} stok, 2 user`
  );
  console.log(
    `  Admin: admin@topinzpedia.com / ${adminPassword} · Demo: demo@topinzpedia.com / demo12345`
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("✗ Seed gagal:", error);
  process.exit(1);
});
