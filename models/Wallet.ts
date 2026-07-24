import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const WalletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export type WalletDoc = InferSchemaType<typeof WalletSchema>;

const Wallet: Model<WalletDoc> =
  (models.Wallet as Model<WalletDoc>) ??
  model<WalletDoc>("Wallet", WalletSchema);

export default Wallet;
