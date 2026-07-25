import * as React from "react";

import { EmailLayout, Row, styles } from "./EmailLayout";

interface Props {
  name: string;
  invoice: string;
  productName: string;
  variantName: string;
  price: string;
  date: string;
  paymentMethod: string;
  supportEmail: string;
}

export function InvoiceEmail({
  name,
  invoice,
  productName,
  variantName,
  price,
  date,
  paymentMethod,
  supportEmail,
}: Props) {
  return (
    <EmailLayout title={`Invoice pembelian — ${invoice}`} supportEmail={supportEmail}>
      <p style={styles.text}>
        Halo {name}, berikut rincian invoice pembelianmu di TopinzPedia.
      </p>
      <table style={styles.table}>
        <tbody>
          <Row label="Invoice ID" value={invoice} />
          <Row label="Produk" value={productName} />
          <Row label="Variant" value={variantName} />
          <Row label="Harga" value={price} />
          <Row label="Tanggal" value={date} />
          <Row label="Metode Pembayaran" value={paymentMethod} />
        </tbody>
      </table>
      <p style={styles.text}>
        Simpan email ini sebagai bukti transaksi yang sah.
      </p>
    </EmailLayout>
  );
}
