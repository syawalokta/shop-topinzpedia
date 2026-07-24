"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession, getSessionUser } from "../authz";
import { isDbConfigured } from "../db";
import { saveUploadedImage } from "../storage";
import {
  approveTopup,
  createTopup,
  rejectTopup,
} from "../services/topup";
import { getPaymentSettings } from "../services/settings";
import { topupSchema } from "../validations";
import type { ActionResult } from "../../types";

/** User mengajukan topup manual + upload bukti transfer. */
export async function createTopupAction(
  formData: FormData
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Silakan login terlebih dahulu." };
  if (!isDbConfigured()) {
    return { ok: false, error: "Database belum dikonfigurasi." };
  }

  const parsed = topupSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
    note: String(formData.get("note") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data topup tidak valid.",
    };
  }

  // Pastikan metode yang dipilih memang aktif
  const settings = await getPaymentSettings();
  if (
    (parsed.data.method === "manual_transfer" &&
      !settings.manualTransfer.enabled) ||
    (parsed.data.method === "qris" && !settings.qris.enabled)
  ) {
    return { ok: false, error: "Metode pembayaran ini sedang nonaktif." };
  }

  const proof = formData.get("proof");
  const upload = await saveUploadedImage(
    proof instanceof File ? proof : null,
    "proofs"
  );
  if (!upload.ok) {
    return { ok: false, error: `Bukti transfer: ${upload.error}` };
  }

  try {
    await createTopup(user.id, {
      amount: parsed.data.amount,
      method: parsed.data.method,
      note: parsed.data.note,
      proofImage: upload.url,
    });
    revalidatePath("/dashboard/topup");
    revalidatePath("/admin/topups");
    return { ok: true };
  } catch (error) {
    console.error("[actions/topups] create gagal:", error);
    return { ok: false, error: "Gagal mengajukan topup." };
  }
}

export async function approveTopupAction(
  topupId: string,
  adminNote = ""
): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, error: "Akses ditolak." };

  try {
    const result = await approveTopup(topupId, adminNote);
    if (!result.ok) return { ok: false, error: result.error };
    revalidatePath("/admin/topups");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("[actions/topups] approve gagal:", error);
    return { ok: false, error: "Gagal menyetujui topup." };
  }
}

export async function rejectTopupAction(
  topupId: string,
  adminNote = ""
): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, error: "Akses ditolak." };

  try {
    const result = await rejectTopup(topupId, adminNote);
    if (!result.ok) return { ok: false, error: result.error };
    revalidatePath("/admin/topups");
    return { ok: true };
  } catch (error) {
    console.error("[actions/topups] reject gagal:", error);
    return { ok: false, error: "Gagal menolak topup." };
  }
}
