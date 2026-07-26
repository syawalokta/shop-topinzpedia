import type { ReactElement } from "react";

/**
 * Abstraction layer email TopinzPedia.
 * Semua pengiriman email WAJIB lewat interface ini —
 * jangan panggil Resend langsung dari Route Handler,
 * Component, ataupun Server Action.
 */

export interface SendEmailInput {
  to: string;
  subject: string;
  react: ReactElement;
}

export interface PurchaseEmailData {
  name: string;
  invoice: string;
  productName: string;
  variantName: string;
  date: string;
  total: string;
  detailUrl: string;
}

export interface InvoiceEmailData {
  name: string;
  invoice: string;
  productName: string;
  variantName: string;
  price: string;
  date: string;
  paymentMethod: string;
}

export interface TopupApprovedData {
  name: string;
  amount: string;
  newBalance: string;
  date: string;
}

export interface TopupRejectedData {
  name: string;
  amount: string;
  reason: string;
}

/** Semua method mengembalikan true bila email terkirim, false bila dilewati/gagal. */
export interface EmailService {
  sendEmail(input: SendEmailInput): Promise<boolean>;
  sendVerificationEmail(to: string, name: string, url: string): Promise<boolean>;
  sendResetPassword(to: string, name: string, url: string): Promise<boolean>;
  sendInvoice(to: string, data: InvoiceEmailData): Promise<boolean>;
  sendPurchaseSuccess(to: string, data: PurchaseEmailData): Promise<boolean>;
  sendTopupApproved(to: string, data: TopupApprovedData): Promise<boolean>;
  sendTopupRejected(to: string, data: TopupRejectedData): Promise<boolean>;
  sendTest(to: string): Promise<boolean>;
}
