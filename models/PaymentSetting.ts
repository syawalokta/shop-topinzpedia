import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * Pengaturan metode pembayaran (dokumen tunggal).
 * Arsitektur siap ditambah gateway: QRIS, Midtrans, Tripay, Duitku —
 * cukup tambah sub-dokumen baru + provider di service checkout/topup.
 */
const PaymentSettingSchema = new Schema(
  {
    key: { type: String, default: "payment", unique: true },
    wallet: {
      enabled: { type: Boolean, default: true },
    },
    manualTransfer: {
      enabled: { type: Boolean, default: true },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      accountName: { type: String, default: "" },
    },
    qris: {
      enabled: { type: Boolean, default: false },
      qrImage: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export type PaymentSettingDoc = InferSchemaType<typeof PaymentSettingSchema>;

const PaymentSetting: Model<PaymentSettingDoc> =
  (models.PaymentSetting as Model<PaymentSettingDoc>) ??
  model<PaymentSettingDoc>("PaymentSetting", PaymentSettingSchema);

export default PaymentSetting;
