import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * Token sekali pakai untuk verifikasi email & reset password.
 * Yang disimpan adalah HASH token (sha256) — token asli hanya ada
 * di tautan yang dikirim ke email user.
 */
const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["verify-email", "reset-password"],
      required: true,
      index: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-hapus dokumen kedaluwarsa (TTL index)
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type TokenDoc = InferSchemaType<typeof TokenSchema>;

const Token: Model<TokenDoc> =
  (models.Token as Model<TokenDoc>) ?? model<TokenDoc>("Token", TokenSchema);

export default Token;
