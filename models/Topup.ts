import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const TopupSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    method: {
      type: String,
      enum: ["manual_transfer", "qris"],
      default: "manual_transfer",
    },
    /** URL bukti transfer (Cloudinary secure_url) */
    proofImage: { type: String, default: "" },
    proofPublicId: { type: String, default: "" },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    /** Catatan admin saat approve/reject */
    adminNote: { type: String, default: "" },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type TopupDoc = InferSchemaType<typeof TopupSchema>;

const Topup: Model<TopupDoc> =
  (models.Topup as Model<TopupDoc>) ?? model<TopupDoc>("Topup", TopupSchema);

export default Topup;
