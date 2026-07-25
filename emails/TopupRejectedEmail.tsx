import * as React from "react";

import { EmailLayout, Row, styles } from "./EmailLayout";

interface Props {
  name: string;
  amount: string;
  reason: string;
  supportEmail: string;
}

export function TopupRejectedEmail({
  name,
  amount,
  reason,
  supportEmail,
}: Props) {
  return (
    <EmailLayout title={`Topup ditolak, ${name}`} supportEmail={supportEmail}>
      <p style={styles.text}>
        Mohon maaf, pengajuan topup kamu belum bisa kami setujui.
      </p>
      <table style={styles.table}>
        <tbody>
          <Row label="Nominal" value={amount} />
          <Row label="Alasan" value={reason || "Bukti pembayaran tidak valid"} />
        </tbody>
      </table>
      <p style={styles.text}>
        Saldo kamu tidak berubah. Silakan ajukan ulang dengan bukti transfer
        yang benar, atau hubungi support bila merasa ini keliru.
      </p>
    </EmailLayout>
  );
}
