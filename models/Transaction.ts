import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * Skema transaksi — disiapkan untuk fitur payment gateway,
 * riwayat transaksi, dan dashboard admin di fase berikutnya.
 */
const TransactionSchema = new Schema(
  {
    invoice: { type: String, required: true, unique: true },
    /** Sementara string bebas (guest/email) — nanti ref ke model User */
    userId: { type: String, default: "guest", index: true },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    paymentMethod: { type: String, default: "qris" },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "delivered", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export type TransactionDoc = InferSchemaType<typeof TransactionSchema>;

const Transaction: Model<TransactionDoc> =
  (models.Transaction as Model<TransactionDoc>) ??
  model<TransactionDoc>("Transaction", TransactionSchema);

export default Transaction;
