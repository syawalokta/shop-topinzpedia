import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * Role pengguna:
 * - admin : akses penuh panel admin
 * - buyer : pernah melakukan pembelian
 * - user  : terdaftar, belum pernah membeli
 */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    /** Kosong untuk akun OAuth (Google) */
    passwordHash: { type: String, default: null },
    role: {
      type: String,
      enum: ["admin", "buyer", "user"],
      default: "user",
      index: true,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) ?? model<UserDoc>("User", UserSchema);

export default User;
