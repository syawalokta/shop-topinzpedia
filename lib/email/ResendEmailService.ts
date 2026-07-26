import { Resend } from "resend";

import { InvoiceEmail } from "../../emails/InvoiceEmail";
import { PurchaseSuccessEmail } from "../../emails/PurchaseSuccessEmail";
import { ResetPasswordEmail } from "../../emails/ResetPasswordEmail";
import { TestEmail } from "../../emails/TestEmail";
import { TopupApprovedEmail } from "../../emails/TopupApprovedEmail";
import { TopupRejectedEmail } from "../../emails/TopupRejectedEmail";
import { VerificationEmail } from "../../emails/VerificationEmail";
import type {
  EmailService,
  InvoiceEmailData,
  PurchaseEmailData,
  SendEmailInput,
  TopupApprovedData,
  TopupRejectedData,
} from "./EmailService";

/**
 * Implementasi EmailService berbasis Resend API.
 *
 * Konfigurasi via environment variable (JANGAN hardcode):
 *   RESEND_API_KEY=re_xxxxxxxxx   <- ganti dengan API key Resend milikmu
 *   DEFAULT_EMAIL_FROM=no-reply@topinzpedia.my.id
 *   SUPPORT_EMAIL=support@topinzpedia.my.id
 *
 * Bila RESEND_API_KEY kosong: pengiriman dilewati (tidak crash)
 * dengan warning "Resend belum dikonfigurasi." di server log.
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function supportEmail(): string {
  return process.env.SUPPORT_EMAIL ?? "support@topinzpedia.my.id";
}

function fromAddress(): string {
  const from = process.env.DEFAULT_EMAIL_FROM ?? "no-reply@topinzpedia.my.id";
  return from.includes("<") ? from : `TopinzPedia <${from}>`;
}

export class ResendEmailService implements EmailService {
  private client: Resend | null = null;

  private getClient(): Resend | null {
    if (!isEmailConfigured()) return null;
    if (!this.client) {
      // API key SELALU dari environment variable
      this.client = new Resend(process.env.RESEND_API_KEY);
    }
    return this.client;
  }

  async sendEmail(input: SendEmailInput): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      console.warn("Resend belum dikonfigurasi.");
      return false;
    }

    try {
      const { error } = await client.emails.send({
        from: fromAddress(),
        to: input.to,
        subject: input.subject,
        react: input.react,
      });
      if (error) {
        console.error("[email/resend] gagal:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[email/resend] gagal:", err);
      return false;
    }
  }

  sendVerificationEmail(to: string, name: string, url: string) {
    return this.sendEmail({
      to,
      subject: "Verifikasi akun TopinzPedia kamu",
      react: VerificationEmail({ name, url, supportEmail: supportEmail() }),
    });
  }

  sendResetPassword(to: string, name: string, url: string) {
    return this.sendEmail({
      to,
      subject: "Reset password akun TopinzPedia",
      react: ResetPasswordEmail({ name, url, supportEmail: supportEmail() }),
    });
  }

  sendInvoice(to: string, data: InvoiceEmailData) {
    return this.sendEmail({
      to,
      subject: `Invoice ${data.invoice} — TopinzPedia`,
      react: InvoiceEmail({ ...data, supportEmail: supportEmail() }),
    });
  }

  sendPurchaseSuccess(to: string, data: PurchaseEmailData) {
    return this.sendEmail({
      to,
      subject: `Pembelian berhasil — ${data.invoice}`,
      react: PurchaseSuccessEmail({ ...data, supportEmail: supportEmail() }),
    });
  }

  sendTopupApproved(to: string, data: TopupApprovedData) {
    return this.sendEmail({
      to,
      subject: "Topup saldo kamu disetujui ✅",
      react: TopupApprovedEmail({ ...data, supportEmail: supportEmail() }),
    });
  }

  sendTopupRejected(to: string, data: TopupRejectedData) {
    return this.sendEmail({
      to,
      subject: "Pengajuan topup kamu ditolak",
      react: TopupRejectedEmail({ ...data, supportEmail: supportEmail() }),
    });
  }

  sendTest(to: string) {
    return this.sendEmail({
      to,
      subject: "Tes Email — TopinzPedia",
      react: TestEmail({
        supportEmail: supportEmail(),
        sentAt: new Date().toLocaleString("id-ID"),
      }),
    });
  }
}
