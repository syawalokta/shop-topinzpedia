import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TERMS_SLUG } from "@/lib/legal-content";
import { getPage } from "@/lib/services/pages";
import { LegalRenderer } from "@/components/shared/legal-renderer";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan layanan TopinzPedia — akun, saldo, transaksi, garansi, dan kebijakan lainnya.",
};

export default async function TermsPage() {
  const page = await getPage(TERMS_SLUG);
  if (!page) notFound();
  return <LegalRenderer page={page} />;
}
