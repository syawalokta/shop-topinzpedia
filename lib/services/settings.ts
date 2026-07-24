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
  qris: { enabled: boolean; qrImage: string };
}

export interface SiteSettingsDTO {
  googleAuthEnabled: boolean;
  registrationEnabled: boolean;
  /** true bila env GOOGLE_CLIENT_ID + SECRET terpasang */
  googleConfigured: boolean;
}

const paymentDefaults: PaymentSettingsDTO = {
  wallet: { enabled: true },
  manualTransfer: {
    enabled: true,
    bankName: "BCA",
    accountNumber: "1234567890",
    accountName: "TopinzPedia",
  },
  qris: { enabled: false, qrImage: "" },
};

export async function getPaymentSettings(): Promise<PaymentSettingsDTO> {
  try {
    await connectDB();
    const doc = await PaymentSetting.findOneAndUpdate(
      { key: "payment" },
      { $setOnInsert: paymentDefaults },
      { upsert: true, new: true }
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

  try {
    await connectDB();
    const doc = await SiteSetting.findOneAndUpdate(
      { key: "site" },
      { $setOnInsert: { googleAuthEnabled: false, registrationEnabled: true } },
      { upsert: true, new: true }
    ).lean();

    return {
      googleAuthEnabled: doc?.googleAuthEnabled ?? false,
      registrationEnabled: doc?.registrationEnabled ?? true,
      googleConfigured,
    };
  } catch (error) {
    console.error("[services/settings] fallback site defaults:", error);
    return {
      googleAuthEnabled: false,
      registrationEnabled: true,
      googleConfigured,
    };
  }
}

export async function updateSiteSettings(input: {
  googleAuthEnabled: boolean;
  registrationEnabled: boolean;
}): Promise<void> {
  await connectDB();
  await SiteSetting.findOneAndUpdate(
    { key: "site" },
    { $set: input },
    { upsert: true }
  );
}
