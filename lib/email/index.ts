import { ResendEmailService, isEmailConfigured } from "./ResendEmailService";
import type { EmailService } from "./EmailService";

export * from "./EmailService";
export { isEmailConfigured };

let instance: EmailService | null = null;

/** Email service aktif (Resend). Singleton. */
export function getEmailService(): EmailService {
  if (!instance) instance = new ResendEmailService();
  return instance;
}
