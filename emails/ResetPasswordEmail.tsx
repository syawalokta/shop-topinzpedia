import * as React from "react";

import { EmailLayout, styles } from "./EmailLayout";

interface Props {
  name: string;
  url: string;
  supportEmail: string;
}

export function ResetPasswordEmail({ name, url, supportEmail }: Props) {
  return (
    <EmailLayout title={`Halo ${name}, reset password kamu`} supportEmail={supportEmail}>
      <p style={styles.text}>
        Kami menerima permintaan reset password untuk akunmu. Klik tombol di
        bawah untuk membuat password baru.
      </p>
      <div style={styles.buttonWrap}>
        <a href={url} style={styles.button}>
          Reset Password
        </a>
      </div>
      <p style={styles.linkFallback}>
        Atau salin tautan ini ke browser:
        <br />
        {url}
      </p>
      <p style={styles.text}>
        ⏰ Tautan reset berlaku selama <strong>30 menit</strong>. Bila bukan
        kamu yang meminta, abaikan email ini — password lamamu tetap aman.
      </p>
    </EmailLayout>
  );
}
