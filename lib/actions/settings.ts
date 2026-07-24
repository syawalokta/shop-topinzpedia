"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "../authz";
import { isDbConfigured } from "../db";
import {
  updatePaymentSettings,
  updateSiteSettings,
} from "../services/settings";
import { settingsSchema, type SettingsInput } from "../validations";
import type { ActionResult } from "../../types";

/** Simpan pengaturan pembayaran + auth dari panel admin. */
export async function updateSettingsAction(
  input: SettingsInput
): Promise<ActionResult> {
  if (!(await getAdminSession())) return { ok: false, error: "Akses ditolak." };
  if (!isDbConfigured()) {
    return { ok: false, error: "Database belum dikonfigurasi." };
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data pengaturan tidak valid.",
    };
  }

  try {
    await updatePaymentSettings({
      wallet: { enabled: parsed.data.walletEnabled },
      manualTransfer: {
        enabled: parsed.data.manualTransferEnabled,
        bankName: parsed.data.bankName,
        accountNumber: parsed.data.accountNumber,
        accountName: parsed.data.accountName,
      },
      qris: {
        enabled: parsed.data.qrisEnabled,
        qrImage: parsed.data.qrisImage,
      },
    });
    await updateSiteSettings({
      googleAuthEnabled: parsed.data.googleAuthEnabled,
      registrationEnabled: parsed.data.registrationEnabled,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/dashboard/topup");
    revalidatePath("/login");
    revalidatePath("/register");
    return { ok: true };
  } catch (error) {
    console.error("[actions/settings] update gagal:", error);
    return { ok: false, error: "Gagal menyimpan pengaturan." };
  }
}
