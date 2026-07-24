import type { Metadata } from "next";

import { isDbConfigured } from "@/lib/db";
import { listEditablePages } from "@/lib/services/pages";
import { DbNotice } from "@/components/admin/db-notice";
import { PageEditor } from "@/components/admin/page-editor";

export const metadata: Metadata = {
  title: "Kelola Halaman",
};

export default async function AdminPagesPage() {
  if (!isDbConfigured()) {
    return <DbNotice />;
  }

  const pages = await listEditablePages();

  return (
    <>
      <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Kelola Halaman
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Edit konten Syarat &amp; Ketentuan dan Kebijakan Privasi — perubahan
        langsung tampil di situs.
      </p>

      <div className="mt-7">
        <PageEditor pages={pages} />
      </div>
    </>
  );
}
