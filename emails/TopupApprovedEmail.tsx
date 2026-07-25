import * as React from "react";

import { EmailLayout, Row, styles } from "./EmailLayout";

interface Props {
  name: string;
  amount: string;
  newBalance: string;
  date: string;
  supportEmail: string;
}

export function TopupApprovedEmail({
  name,
  amount,
  newBalance,
  date,
  supportEmail,
}: Props) {
  return (
    <EmailLayout title={`Topup disetujui, ${name}! ✅`} supportEmail={supportEmail}>
      <p style={styles.text}>
        Pengajuan topup kamu telah diverifikasi dan saldo sudah masuk ke
        wallet. Selamat berbelanja!
      </p>
      <table style={styles.table}>
        <tbody>
          <Row label="Nominal Topup" value={amount} />
          <Row label="Saldo Baru" value={newBalance} />
          <Row label="Tanggal" value={date} />
        </tbody>
      </table>
    </EmailLayout>
  );
}
