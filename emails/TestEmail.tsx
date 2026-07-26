import * as React from "react";

import { EmailLayout, styles } from "./EmailLayout";

interface Props {
  supportEmail: string;
  sentAt: string;
}

export function TestEmail({ supportEmail, sentAt }: Props) {
  return (
    <EmailLayout title="Tes Email Berhasil ✅" supportEmail={supportEmail}>
      <p style={styles.text}>
        Ini adalah email percobaan dari panel admin TopinzPedia. Jika kamu
        menerima email ini, konfigurasi Resend sudah benar dan sistem email
        berjalan normal.
      </p>
      <p style={styles.text}>
        Dikirim pada: <strong>{sentAt}</strong>
      </p>
    </EmailLayout>
  );
}
