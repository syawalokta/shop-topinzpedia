import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/** Buku besar mutasi saldo — setiap perubahan saldo tercatat di sini. */
const WalletTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    /** Referensi bebas: invoice transaksi, id topup, dsb. */
    reference: { type: String, default: "", index: true },
  },
  { timestamps: true }
);

export type WalletTransactionDoc = InferSchemaType<
  typeof WalletTransactionSchema
>;

const WalletTransaction: Model<WalletTransactionDoc> =
  (models.WalletTransaction as Model<WalletTransactionDoc>) ??
  model<WalletTransactionDoc>("WalletTransaction", WalletTransactionSchema);

export default WalletTransaction;
