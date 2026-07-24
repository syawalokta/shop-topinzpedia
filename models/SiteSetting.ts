import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/** Pengaturan umum situs (dokumen tunggal) — mis. toggle login Google. */
const SiteSettingSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    googleAuthEnabled: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type SiteSettingDoc = InferSchemaType<typeof SiteSettingSchema>;

const SiteSetting: Model<SiteSettingDoc> =
  (models.SiteSetting as Model<SiteSettingDoc>) ??
  model<SiteSettingDoc>("SiteSetting", SiteSettingSchema);

export default SiteSetting;
