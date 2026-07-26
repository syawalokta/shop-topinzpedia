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
    /** Wajib verifikasi email saat register (butuh SMTP). Default: OFF */
    emailVerificationEnabled: { type: Boolean, default: false },
    /** Banner promo landing page (opsional) via StorageService */
    landingBanner: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    /**
     * Captcha: "math" (bawaan, tanpa layanan eksternal) atau
     * "turnstile" (Cloudflare Turnstile). Key diisi dari panel admin.
     */
    captcha: {
      provider: {
        type: String,
        enum: ["math", "turnstile"],
        default: "math",
      },
      turnstileSiteKey: { type: String, default: "" },
      turnstileSecretKey: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export type SiteSettingDoc = InferSchemaType<typeof SiteSettingSchema>;

const SiteSetting: Model<SiteSettingDoc> =
  (models.SiteSetting as Model<SiteSettingDoc>) ??
  model<SiteSettingDoc>("SiteSetting", SiteSettingSchema);

export default SiteSetting;
