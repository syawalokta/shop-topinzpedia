import * as React from "react";

import { EmailLayout, Row, styles } from "./EmailLayout";

interface Props {
  name: string;
  invoice: string;
  productName: string;
  variantName: string;
  date: string;
  total: string;
  detailUrl: string;
  supportEmail: string;
}

export function PurchaseSuccessEmail({
  name,
  invoice,
  productName,
  variantName,
  date,
  total,
  detailUrl,
  supportEmail,
}: Props) {
  return (
    <EmailLayout title={`Pembelian berhasil, ${name}! 🎉`} supportEmail={supportEmail}>
      <p style={styles.text}>
        Pesananmu sudah dibayar dan akun premium telah dikirim otomatis.
        Lihat detail akunmu melalui tombol di bawah.
      </p>
      <table style={styles.table}>
        <tbody>
          <Row label="Invoice" value={invoice} />
          <Row label="Produk" value={productName} />
          <Row label="Variant" value={variantName} />
          <Row label="Tanggal" value={date} />
          <Row label="Total" value={total} />
        </tbody>
      </table>
      <div style={styles.buttonWrap}>
        <a href={detailUrl} style={styles.button}>
          Lihat Detail Pembelian
        </a>
      </div>
    </EmailLayout>
  );
}
