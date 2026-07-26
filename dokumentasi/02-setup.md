# 02 — Setup & Environment

## Prasyarat

- Node.js 20+
- MongoDB (lokal, atau MongoDB Atlas gratis)
- (Opsional) akun Resend, Cloudinary, Cloudflare Turnstile, Google OAuth

## Menjalankan Lokal

```bash
# 1. Instal dependensi
npm install

# 2. Siapkan environment
cp .env.example .env.local
# lalu isi minimal MONGODB_URI + AUTH_SECRET

# 3. Seed database (kategori, produk, stok, akun admin & demo)
npm run seed

# 4. Jalankan
npm run dev      # http://localhost:3000
```

Perintah lain:

```bash
npm run build    # build produksi
npm start        # jalankan hasil build
npm run lint     # ESLint
```

## Akun Hasil Seed

| Akun | Login | Password | Role |
| --- | --- | --- | --- |
| Admin | `admin@topinzpedia.com` | `SEED_ADMIN_PASSWORD` (default `admin12345`) | admin |
| Demo | `demo@topinzpedia.com` | `demo12345` (saldo Rp200.000) | user |

## Environment Variables

### Wajib

| Variabel | Fungsi |
| --- | --- |
| `MONGODB_URI` | Connection string MongoDB. Tanpa ini, situs publik jalan dengan data statis, tetapi auth/wallet/admin tidak berfungsi. |
| `AUTH_SECRET` | Secret Auth.js — `openssl rand -base64 32`. **Tanpa ini login gagal/stuck.** |

### Auth

| Variabel | Fungsi |
| --- | --- |
| `AUTH_TRUST_HOST` | Set `true` di Railway/VPS (di luar Vercel). |
| `AUTH_URL` | URL publik situs (disarankan di VPS), mis. `https://topinzpedia.my.id`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login Google (opsional). Aktifkan juga toggle di Admin → Pengaturan. |
| `SEED_ADMIN_PASSWORD` | Password akun admin saat `npm run seed`. |

### Email (Resend)

| Variabel | Fungsi |
| --- | --- |
| `RESEND_API_KEY` | API key Resend (`re_xxxxxxxxx`). Kosong → email dilewati (log "Resend belum dikonfigurasi."), akun baru auto-verified. |
| `DEFAULT_EMAIL_FROM` | Alamat pengirim, mis. `no-reply@topinzpedia.my.id`. |
| `SUPPORT_EMAIL` | Email support yang ditampilkan di footer email. |

### Storage (Cloudinary)

| Variabel | Fungsi |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Penyimpanan gambar. Kosong → fallback lokal `public/uploads` (dev only). |

### Captcha (Cloudflare Turnstile — opsional)

| Variabel | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key default (bisa juga diatur dari Admin → Pengaturan). |
| `TURNSTILE_SECRET_KEY` | Secret key default. |

> Captcha juga bisa dikonfigurasi penuh dari **Admin → Pengaturan → Captcha**
> tanpa menyentuh env. Nilai di DB diprioritaskan; env dipakai sebagai fallback.

### Situs

| Variabel | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publik (SEO, sitemap, tautan email). |
| `NEXT_PUBLIC_WHATSAPP` | Nomor WA admin (format internasional tanpa `+`). |

## Catatan Mode Fallback

Aplikasi dirancang **tidak crash** meski layanan eksternal belum diisi:

- Tanpa `MONGODB_URI` → halaman publik pakai data statis (`lib/data/fallback-data.ts`).
- Tanpa `CLOUDINARY_*` → upload ke `public/uploads` (tidak persisten di serverless).
- Tanpa `RESEND_API_KEY` → email dilewati, akun baru langsung terverifikasi.
- Tanpa Turnstile → captcha matematika bawaan.
