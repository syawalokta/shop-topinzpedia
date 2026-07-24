import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PRIVACY_SLUG } from "@/lib/legal-content";
import { getPage } from "@/lib/services/pages";
import { LegalRenderer } from "@/components/shared/legal-renderer";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi TopinzPedia — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
};

export default async function PrivacyPage() {
  const page = await getPage(PRIVACY_SLUG);
  if (!page) notFound();
  return <LegalRenderer page={page} />;
}
