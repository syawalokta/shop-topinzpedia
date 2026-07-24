import nodemailer from "nodemailer";

import { SITE } from "../constants";

/**
 * Service email berbasis SMTP (nodemailer).
 * Konfigurasi via env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
 * EMAIL_FROM. Bila belum diset, fitur email otomatis nonaktif
 * (register auto-verified & reset password memberi tahu user).
 */

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

function getTransport() {
  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(120deg,#2563eb,#1e40af);padding:20px 28px;">
      <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">⚡ ${SITE.name}</p>
    </div>
    <div style="padding:28px;">
      <h1 style="margin:0 0 12px;font-size:18px;">${title}</h1>
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#64748b;">Email ini dikirim otomatis oleh ${SITE.name}. Bila kamu tidak merasa melakukan permintaan ini, abaikan saja.</p>
    </div>
  </div>
</body></html>`;
}

function button(url: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:bold;font-size:14px;">${label}</a></p>
  <p style="font-size:12px;color:#64748b;word-break:break-all;">Atau salin tautan ini ke browser:<br/>${url}</p>`;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  url: string
): Promise<void> {
  await getTransport().sendMail({
    from: process.env.EMAIL_FROM ?? `${SITE.name} <${process.env.SMTP_USER}>`,
    to,
    subject: `Verifikasi akun ${SITE.name} kamu`,
    html: layout(
      `Halo ${name}, verifikasi email kamu 👋`,
      `<p style="font-size:14px;line-height:1.6;color:#334155;">Terima kasih sudah mendaftar di ${SITE.name}. Klik tombol di bawah untuk memverifikasi akunmu (berlaku 24 jam):</p>${button(url, "Verifikasi Akun")}`
    ),
  });
}

export async function sendResetPasswordEmail(
  to: string,
  name: string,
  url: string
): Promise<void> {
  await getTransport().sendMail({
    from: process.env.EMAIL_FROM ?? `${SITE.name} <${process.env.SMTP_USER}>`,
    to,
    subject: `Reset password akun ${SITE.name}`,
    html: layout(
      `Halo ${name}, reset password kamu`,
      `<p style="font-size:14px;line-height:1.6;color:#334155;">Kami menerima permintaan reset password. Klik tombol di bawah untuk membuat password baru (berlaku 30 menit):</p>${button(url, "Reset Password")}`
    ),
  });
}
