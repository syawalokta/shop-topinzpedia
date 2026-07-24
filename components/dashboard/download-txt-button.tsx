"use client";

import { Download } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DownloadTxtButtonProps {
  invoice: string;
  createdAt: string;
  productName: string;
  variantName: string;
  content: string;
}

/** Unduh detail akun sebagai file .txt (dibuat di sisi klien). */
export function DownloadTxtButton({
  invoice,
  createdAt,
  productName,
  variantName,
  content,
}: DownloadTxtButtonProps) {
  function handleDownload() {
    const text = [
      "TopinzPedia",
      "",
      `Invoice: ${invoice}`,
      `Tanggal: ${formatDate(createdAt)}`,
      "",
      `Produk: ${productName}`,
      `Variant: ${variantName}`,
      "",
      "------------------",
      "",
      content,
      "",
      "------------------",
      "",
      "Terima kasih.",
      "",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${invoice}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button onClick={handleDownload} variant="outline" className="rounded-full">
      <Download className="size-4" />
      Download .txt
    </Button>
  );
}
