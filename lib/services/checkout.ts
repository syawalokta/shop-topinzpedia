import { randomInt } from "crypto";
import { Types } from "mongoose";

import { connectDB } from "../db";
import { creditWallet, debitWalletIfSufficient } from "./wallet";
import { getPaymentSettings } from "./settings";
import { Product, Stock, Transaction, User, Variant } from "../../models";

/**
 * Service checkout dengan pembayaran Wallet.
 *
 * Alur (aman terhadap pembelian bersamaan TANPA multi-document
 * transaction, sehingga jalan di MongoDB standalone maupun Atlas):
 *  1. Potong saldo secara atomik (findOneAndUpdate balance >= harga)
 *  2. Buat Transaction berstatus pending
 *  3. Klaim SATU stock "available" secara atomik -> "sold"
 *  4a. Stok didapat -> transaksi paid + deliveredContent + role buyer
 *  4b. Stok habis (kalah race) -> refund saldo + transaksi failed
 *
 * Menambah gateway (QRIS/Midtrans/Tripay/Duitku) nanti: buat provider
 * baru yang menghasilkan pembayaran, lalu panggil deliverTransaction()
 * yang sama setelah pembayaran terkonfirmasi.
 */

export type CheckoutResult =
  | { ok: true; invoice: string }
  | { ok: false; error: string; code: "AUTH" | "STOCK" | "BALANCE" | "OTHER" };

function generateInvoice(): string {
  const now = new Date();
  const date = [
    now.getFullYear().toString().slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Array.from({ length: 6 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(randomInt(32))
  ).join("");
  return `INV-${date}-${rand}`;
}

export async function purchaseWithWallet(
  userId: string,
  variantId: string
): Promise<CheckoutResult> {
  await connectDB();

  const settings = await getPaymentSettings();
  if (!settings.wallet.enabled) {
    return {
      ok: false,
      code: "OTHER",
      error: "Pembayaran saldo sedang dinonaktifkan. Hubungi admin.",
    };
  }

  if (!Types.ObjectId.isValid(variantId)) {
    return { ok: false, code: "OTHER", error: "Varian tidak valid." };
  }

  const variant = await Variant.findOne({ _id: variantId, active: true }).lean();
  if (!variant) {
    return { ok: false, code: "OTHER", error: "Varian tidak ditemukan." };
  }

  const product = await Product.findOne({
    _id: variant.productId,
    status: "active",
  }).lean();
  if (!product) {
    return { ok: false, code: "OTHER", error: "Produk tidak ditemukan." };
  }

  // Cek cepat ketersediaan stok sebelum memotong saldo
  const hasStock = await Stock.exists({ variantId, status: "available" });
  if (!hasStock) {
    return {
      ok: false,
      code: "STOCK",
      error: "Stok varian ini sedang habis. Coba lagi nanti atau hubungi admin.",
    };
  }

  const price = variant.price;
  const invoice = generateInvoice();
  const label = `${product.name} — ${variant.name} (${variant.duration})`;

  // 1. Potong saldo (atomik)
  const debited = await debitWalletIfSufficient(
    userId,
    price,
    `Pembelian ${label}`,
    invoice
  );
  if (!debited) {
    return {
      ok: false,
      code: "BALANCE",
      error: "Saldo tidak mencukupi. Silakan topup terlebih dahulu.",
    };
  }

  // 2. Buat transaksi pending
  const transaction = await Transaction.create({
    invoice,
    userId,
    productId: product._id,
    variantId: variant._id,
    paymentMethod: "wallet",
    paymentStatus: "pending",
    total: price,
    productName: product.name,
    variantName: `${variant.name} · ${variant.duration}`,
  });

  // 3. Klaim satu stok tertua yang masih available (atomik)
  const stock = await Stock.findOneAndUpdate(
    { variantId: variant._id, status: "available" },
    {
      $set: {
        status: "sold",
        buyerId: new Types.ObjectId(userId),
        transactionId: transaction._id,
      },
    },
    { sort: { createdAt: 1 }, new: true }
  );

  // 4b. Kalah race / stok habis -> kompensasi
  if (!stock) {
    await Transaction.updateOne(
      { _id: transaction._id },
      { paymentStatus: "failed" }
    );
    await creditWallet(
      userId,
      price,
      `Refund ${label} (stok habis)`,
      invoice
    );
    return {
      ok: false,
      code: "STOCK",
      error:
        "Stok habis saat diproses (pembelian bersamaan). Saldo kamu sudah dikembalikan penuh.",
    };
  }

  // 4a. Sukses -> kirim konten & rapikan status
  await Transaction.updateOne(
    { _id: transaction._id },
    { paymentStatus: "paid", deliveredContent: stock.content }
  );
  await Product.updateOne({ _id: product._id }, { $inc: { sold: 1 } });
  // Naikkan role user biasa menjadi buyer (admin tidak diubah)
  await User.updateOne({ _id: userId, role: "user" }, { role: "buyer" });

  return { ok: true, invoice };
}

/** Ringkas: apakah user pernah bertransaksi sukses (untuk statistik). */
export async function countUserPurchases(userId: string): Promise<number> {
  await connectDB();
  return Transaction.countDocuments({ userId, paymentStatus: "paid" });
}

export { generateInvoice };
