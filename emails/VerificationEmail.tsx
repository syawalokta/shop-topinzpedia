import * as React from "react";

import { EmailLayout, styles } from "./EmailLayout";

interface Props {
  name: string;
  url: string;
  supportEmail: string;
}

export function VerificationEmail({ name, url, supportEmail }: Props) {
  return (
    <EmailLayout title={`Halo ${name}, verifikasi email kamu 👋`} supportEmail={supportEmail}>
      <p style={styles.text}>
        Terima kasih sudah mendaftar di TopinzPedia. Klik tombol di bawah untuk
        memverifikasi akunmu dan mulai berbelanja produk premium.
      </p>
      <div style={styles.buttonWrap}>
        <a href={url} style={styles.button}>
          Verifikasi Akun
        </a>
      </div>
      <p style={styles.linkFallback}>
        Atau salin tautan ini ke browser:
        <br />
        {url}
      </p>
      <p style={styles.text}>
        ⏰ Tautan verifikasi berlaku selama <strong>24 jam</strong>.
      </p>
    </EmailLayout>
  );
}
