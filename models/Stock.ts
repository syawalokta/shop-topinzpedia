import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * Satu dokumen = satu akun siap kirim.
 * Stok varian TIDAK lagi berupa angka — dihitung dari
 * jumlah dokumen berstatus "available" pada koleksi ini.
 */
const StockSchema = new Schema(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
      index: true,
    },
    /** Isi akun bebas format (email, password, pin, catatan, dll.) */
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
  },
  { timestamps: true }
);

StockSchema.index({ variantId: 1, status: 1 });

export type StockDoc = InferSchemaType<typeof StockSchema>;

const Stock: Model<StockDoc> =
  (models.Stock as Model<StockDoc>) ?? model<StockDoc>("Stock", StockSchema);

export default Stock;
