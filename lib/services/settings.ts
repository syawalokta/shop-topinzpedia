import { connectDB } from "../db";
import { PaymentSetting, SiteSetting } from "../../models";

/** Service pengaturan situs & pembayaran (dokumen singleton). */

export interface PaymentSettingsDTO {
  wallet: { enabled: boolean };
  manualTransfer: {
    enabled: boolean;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  qris: { enabled: boolean; qrImage: string; qrisPublicId: string };
}

export interface SiteSettingsDTO {
  googleAuthEnabled: boolean;
  registrationEnabled: boolean;
  /** Wajib verifikasi email saat register (hanya efektif bila SMTP terpasang) */
  emailVerificationEnabled: boolean;
  /** true bila env GOOGLE_CLIENT_ID + SECRET terpasang */
  googleConfigured: boolean;
  /** true bila env SMTP terpasang */
  mailConfigured: boolean;
  /** Banner promo landing page (opsional) */
  landingBanner: { url: string; publicId: string };
}

const paymentDefaults: PaymentSettingsDTO = {
  wallet: { enabled: true },
  manualTransfer: {
    enabled: true,
    bankName: "BCA",
    accountNumber: "1234567890",
    accountName: "TopinzPedia",
  },
  qris: { enabled: false, qrImage: "", qrisPublicId: "" },
};

export async function getPaymentSettings(): Promise<PaymentSettingsDTO> {
  try {
    await connectDB();
    const doc = await PaymentSetting.findOneAndUpdate(
      { key: "payment" },
      { $setOnInsert: paymentDefaults },
      { upsert: true, returnDocument: "after" }
    ).lean();

    return {
      wallet: { enabled: doc?.wallet?.enabled ?? true },
      manualTransfer: {
        enabled: doc?.manualTransfer?.enabled ?? false,
        bankName: doc?.manualTransfer?.bankName ?? "",
        accountNumber: doc?.manualTransfer?.accountNumber ?? "",
        accountName: doc?.manualTransfer?.accountName ?? "",
      },
      qris: {
        enabled: doc?.qris?.enabled ?? false,
        qrImage: doc?.qris?.qrImage ?? "",
        qrisPublicId: doc?.qris?.qrisPublicId ?? "",
      },
    };
  } catch (error) {
    console.error("[services/settings] fallback payment defaults:", error);
    return paymentDefaults;
  }
}

export async function updatePaymentSettings(
  input: Omit<PaymentSettingsDTO, never>
): Promise<void> {
  await connectDB();
  await PaymentSetting.findOneAndUpdate(
    { key: "payment" },
    { $set: input },
    { upsert: true }
  );
}

export async function getSiteSettings(): Promise<SiteSettingsDTO> {
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const mailConfigured = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );

  try {
    await connectDB();
    const doc = await SiteSetting.findOneAndUpdate(
      { key: "site" },
      {
        $setOnInsert: {
          googleAuthEnabled: false,
          registrationEnabled: true,
          emailVerificationEnabled: false,
        },
      },
      { upsert: true, returnDocument: "after" }
    ).lean();

    return {
      googleAuthEnabled: doc?.googleAuthEnabled ?? false,
      registrationEnabled: doc?.registrationEnabled ?? true,
      emailVerificationEnabled: doc?.emailVerificationEnabled ?? false,
      googleConfigured,
      mailConfigured,
      landingBanner: {
        url: doc?.landingBanner?.url ?? "",
        publicId: doc?.landingBanner?.publicId ?? "",
      },
    };
  } catch (error) {
    console.error("[services/settings] fallback site defaults:", error);
    return {
      googleAuthEnabled: false,
      registrationEnabled: true,
      emailVerificationEnabled: false,
      googleConfigured,
      mailConfigured,
      landingBanner: { url: "", publicId: "" },
    };
  }
}

export async function updateSiteSettings(input: {
  googleAuthEnabled: boolean;
  registrationEnabled: boolean;
  emailVerificationEnabled: boolean;
  landingBanner: { url: string; publicId: string };
}): Promise<void> {
  await connectDB();
  await SiteSetting.findOneAndUpdate(
    { key: "site" },
    { $set: input },
    { upsert: true }
  );
}
