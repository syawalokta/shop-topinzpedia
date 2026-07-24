import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    /** Warna aksen brand (hex) — dipakai untuk banner & dekorasi UI */
    accent: { type: String, default: "#2563eb" },
    description: { type: String, default: "" },
    features: { type: [String], default: [] },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    sold: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

export type ProductDoc = InferSchemaType<typeof ProductSchema>;

const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ??
  model<ProductDoc>("Product", ProductSchema);

export default Product;
