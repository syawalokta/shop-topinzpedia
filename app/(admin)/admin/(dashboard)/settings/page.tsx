import type { Metadata } from "next";

import { isDbConfigured } from "@/lib/db";
import {
  getPaymentSettings,
  getSiteSettings,
} from "@/lib/services/settings";
import { DbNotice } from "@/components/admin/db-notice";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default async function AdminSettingsPage() {
  if (!isDbConfigured()) {
    return <DbNotice />;
  }

  const [payment, site] = await Promise.all([
    getPaymentSettings(),
    getSiteSettings(),
  ]);

  return (
    <>
      <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Pengaturan
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kelola metode pembayaran dan opsi autentikasi tanpa menyentuh kode.
      </p>

      <div className="mt-7 max-w-3xl">
        <SettingsForm payment={payment} site={site} />
      </div>
    </>
  );
}
