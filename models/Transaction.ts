import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const TransactionSchema = new Schema(
  {
    invoice: { type: String, required: true, unique: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
    /** "wallet" — nanti mudah ditambah: qris, midtrans, tripay, duitku */
    paymentMethod: { type: String, default: "wallet" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    total: { type: Number, required: true, min: 0 },
    /** Isi akun yang terkirim ke pembeli (salinan dari Stock.content) */
    deliveredContent: { type: String, default: "" },
    /** Snapshot nama untuk riwayat (tahan terhadap penghapusan produk) */
    productName: { type: String, default: "" },
    variantName: { type: String, default: "" },
  },
  { timestamps: true }
);

export type TransactionDoc = InferSchemaType<typeof TransactionSchema>;

const Transaction: Model<TransactionDoc> =
  (models.Transaction as Model<TransactionDoc>) ??
  model<TransactionDoc>("Transaction", TransactionSchema);

export default Transaction;
