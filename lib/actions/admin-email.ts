"use server";

import { getAdminSession } from "../authz";
import { getEmailService, isEmailConfigured } from "../email";
import { testEmailSchema } from "../validations";
import type { ActionResult } from "../../types";

/** Kirim email percobaan ke alamat mana pun (admin-only). */
export async function sendTestEmailAction(to: string): Promise<ActionResult> {
  if (!(await getAdminSession())) return { ok: false, error: "Akses ditolak." };

  const parsed = testEmailSchema.safeParse({ to });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Email tidak valid.",
    };
  }

  if (!isEmailConfigured()) {
    return {
      ok: false,
      error:
        "Resend belum dikonfigurasi. Set RESEND_API_KEY di environment server.",
    };
  }

  const sent = await getEmailService().sendTest(parsed.data.to);
  return sent
    ? { ok: true }
    : {
        ok: false,
        error:
          "Gagal mengirim email. Cek RESEND_API_KEY & domain pengirim di Resend.",
      };
}
