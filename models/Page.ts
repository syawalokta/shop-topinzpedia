import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * Halaman statis yang bisa diedit (Syarat & Ketentuan, Kebijakan Privasi).
 * Konten memakai format markdown ringan: baris "## " menjadi sub-judul,
 * paragraf dipisah baris kosong, "- " menjadi butir daftar.
 */
const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);

export type PageDoc = InferSchemaType<typeof PageSchema>;

const Page: Model<PageDoc> =
  (models.Page as Model<PageDoc>) ?? model<PageDoc>("Page", PageSchema);

export default Page;
