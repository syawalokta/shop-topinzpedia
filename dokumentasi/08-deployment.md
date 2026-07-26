# 08 — Deployment (Ringkas)

Panduan lengkap ada di **`/DEPLOYMENT.md`** (root). Ini ringkasannya.

## Rekomendasi: Railway

TopinzPedia berjalan sebagai server Node penuh (Server Actions, upload, email),
jadi **Railway** direkomendasikan dibanding Vercel (serverless).

### Langkah

1. **MongoDB Atlas** (M0 gratis) → buat cluster, user, allow IP `0.0.0.0/0`,
   salin connection string.
2. **Railway** → New Project → Deploy from GitHub → pilih repo.
3. **Variables** → isi env (lihat `02-setup.md`), minimal:
   ```
   MONGODB_URI=...
   AUTH_SECRET=...            # openssl rand -base64 32
   AUTH_TRUST_HOST=true
   NEXT_PUBLIC_SITE_URL=https://domainmu
   NEXT_PUBLIC_WHATSAPP=62...
   RESEND_API_KEY=re_...      # opsional (email)
   DEFAULT_EMAIL_FROM=no-reply@domainmu
   SUPPORT_EMAIL=support@domainmu
   CLOUDINARY_CLOUD_NAME=...  # opsional (gambar persisten)
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
4. **Generate Domain** (atau custom domain).
5. **Seed** sekali dari lokal ke Atlas:
   ```bash
   MONGODB_URI="mongodb+srv://..." SEED_ADMIN_PASSWORD="rahasia" npm run seed
   ```

## Layanan Eksternal (opsional tapi disarankan)

| Layanan | Untuk | Konfigurasi |
| --- | --- | --- |
| MongoDB Atlas | Database | `MONGODB_URI` |
| Resend | Email | `RESEND_API_KEY`, `DEFAULT_EMAIL_FROM`, `SUPPORT_EMAIL` + verifikasi domain |
| Cloudinary | Gambar persisten | `CLOUDINARY_*` |
| Cloudflare Turnstile | Captcha kuat | Admin → Pengaturan → Captcha (atau env) |
| Google Cloud | Login Google | `GOOGLE_CLIENT_ID/SECRET` + redirect `/api/auth/callback/google` |

## Checklist Rilis

- [ ] `AUTH_SECRET` terisi (tanpa ini login gagal/stuck).
- [ ] `AUTH_TRUST_HOST=true` di Railway/VPS.
- [ ] HTTPS aktif (cookie sesi production butuh secure).
- [ ] `npm run seed` sudah dijalankan ke DB production (sekali).
- [ ] Ganti password admin default.
- [ ] (Jika email) domain terverifikasi di Resend; jangan pakai
      `onboarding@resend.dev` di production.
- [ ] (Jika gambar) `CLOUDINARY_*` terisi agar upload persisten.

## Troubleshooting cepat

| Gejala | Solusi |
| --- | --- |
| Login stuck / loop | Set `AUTH_SECRET` + `AUTH_TRUST_HOST=true`, buka `/logout`, pastikan HTTPS |
| Data kosong / timeout | `MONGODB_URI` salah / IP belum di-allowlist Atlas |
| Upload hilang setelah redeploy | Set `CLOUDINARY_*` (jangan andalkan storage lokal di serverless) |
| Email tak terkirim | `RESEND_API_KEY` kosong/salah, domain belum verified — tes via Admin → Pengaturan → Tes Kirim Email |
| Build gagal "two parallel pages" | Pastikan tidak ada file route lama tersisa di GitHub (push_files tidak menghapus; hapus manual) |
