import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

const VariantSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    duration: { type: String, default: "30 Hari" },
    warranty: { type: String, default: "Garansi 30 Hari" },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type VariantDoc = InferSchemaType<typeof VariantSchema>;

const Variant: Model<VariantDoc> =
  (models.Variant as Model<VariantDoc>) ??
  model<VariantDoc>("Variant", VariantSchema);

export default Variant;
