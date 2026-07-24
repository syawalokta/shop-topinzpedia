# 🚀 Panduan Deploy TopinzPedia

Panduan instalasi production untuk **Railway (rekomendasi)**, **VPS**, dan Vercel — termasuk penyebab umum masalah "stuck di halaman login".

> ✅ **Rekomendasi: Railway** — jalan sebagai server Node penuh (tanpa batasan serverless). Gambar tersimpan di **Cloudinary** (set env `CLOUDINARY_*`), jadi tidak bergantung filesystem.

---

## 0. Persiapan (wajib untuk semua platform)

### a. MongoDB Atlas (gratis)

1. Buat akun di [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Create Cluster** (tier M0 gratis)
2. **Database Access** → buat user + password
3. **Network Access** → **Add IP Address** → `0.0.0.0/0` (allow from anywhere — wajib untuk Vercel/Railway yang IP-nya dinamis)
4. **Connect → Drivers** → salin connection string:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/topinzpedia?retryWrites=true&w=majority
   ```

### b. Environment Variables

| Variabel | Wajib? | Nilai |
| --- | --- | --- |
| `MONGODB_URI` | ✅ | Connection string Atlas di atas |
| `AUTH_SECRET` | ✅ | Hasil `openssl rand -base64 32` — **tanpa ini login PASTI gagal/stuck** |
| `AUTH_TRUST_HOST` | ✅ (Railway/VPS) | `true` — Vercel tidak butuh |
| `AUTH_URL` | Disarankan (VPS) | URL publik situs, mis. `https://topinzpedia.my.id` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL publik situs (SEO/sitemap) |
| `NEXT_PUBLIC_WHATSAPP` | ✅ | Nomor WA admin tanpa `+`, mis. `62812xxxx` |
| `SEED_ADMIN_PASSWORD` | Disarankan | Password akun admin saat seed |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Opsional | Untuk Login Google |
| `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM` | Disarankan | Verifikasi email & reset password. Tanpa ini: akun baru auto-verified, reset password nonaktif |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | ✅ Production | Penyimpanan gambar (logo, banner, bukti, QRIS, avatar). Tanpa ini: fallback lokal `public/uploads` (dev only) |

> ⚠️ **Gejala `AUTH_SECRET` belum diset:** register berhasil tapi login gagal/stuck, halaman `/login` blank, atau error "Configuration". Set variabelnya lalu **redeploy/restart**.

### c. Seed database production

Jalankan sekali dari komputermu (arahkan ke Atlas):

```bash
MONGODB_URI="mongodb+srv://..." SEED_ADMIN_PASSWORD="password-kuat" npm run seed
```

Login admin: `admin@topinzpedia.com` / password di atas.

---

## 1. Deploy ke Vercel (paling mudah)

1. Push repo ke GitHub (sudah ✅)
2. [vercel.com/new](https://vercel.com/new) → **Import** `shop-topinzpedia` → framework terdeteksi otomatis (Next.js)
3. Isi **Environment Variables** (tabel di atas — `AUTH_TRUST_HOST` tidak perlu)
4. **Deploy** → selesai. Tambahkan custom domain di **Settings → Domains**

**Catatan khusus Vercel:**
- ⚠️ **Upload file (bukti transfer, logo, QR) tidak persisten** — filesystem serverless bersifat sementara. Untuk production serius, pindahkan driver `lib/storage.ts` ke **Vercel Blob** (`npm i @vercel/blob`, ganti isi `saveUploadedImage` dengan `put()`) atau Cloudinary. Struktur kode sudah disiapkan agar hanya satu file itu yang berubah.
- Cron/proses background tidak ada — tidak masalah untuk fitur saat ini.

## 2. Deploy ke Railway

1. [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo** → pilih `shop-topinzpedia`
2. Railway otomatis mendeteksi Next.js (build: `npm run build`, start: `npm start`)
3. **Variables** → isi env (termasuk `AUTH_TRUST_HOST=true`)
4. **Settings → Networking → Generate Domain** (atau custom domain)
5. **Agar upload persisten:** tambahkan **Volume** → mount path `/app/public/uploads`

> Alternatif: tambahkan juga service **MongoDB** dari Railway template dan pakai `MONGO_URL`-nya sebagai `MONGODB_URI`.

## 3. Deploy ke VPS (Ubuntu 22.04/24.04)

```bash
# 1. Instal Node.js 20+ & pm2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm i -g pm2

# 2. Clone & build
git clone https://github.com/syawalokta/shop-topinzpedia.git
cd shop-topinzpedia
npm install
cp .env.example .env.local && nano .env.local   # isi semua env (AUTH_URL=https://domainmu)
npm run seed        # sekali saja
npm run build

# 3. Jalankan dengan pm2
pm2 start npm --name topinzpedia -- start
pm2 save && pm2 startup   # auto-start saat reboot
```

**Nginx reverse proxy** (`/etc/nginx/sites-available/topinzpedia`):

```nginx
server {
    server_name topinzpedia.my.id;
    listen 80;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;   # PENTING untuk cookie auth
        client_max_body_size 5M;                      # upload bukti transfer
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/topinzpedia /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS (wajib — cookie sesi production butuh https)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d topinzpedia.my.id
```

**Update versi baru di VPS:**

```bash
cd shop-topinzpedia && git pull && npm install && npm run build && pm2 restart topinzpedia
```

## 4. Login Google (opsional)

1. [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials → Create OAuth Client ID** (Web application)
2. **Authorized redirect URI:** `https://DOMAINMU/api/auth/callback/google`
3. Isi `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` di env → redeploy
4. Aktifkan toggle **Login dengan Google** di **Admin → Pengaturan**

---

## 🩺 Troubleshooting

| Gejala | Penyebab & solusi |
| --- | --- |
| Redirect bolak-balik `/login` ↔ `/dashboard` (loop 307 di log) | Versi lama punya bug pembacaan cookie `__Secure-` di middleware — **sudah diperbaiki**; pastikan memakai kode terbaru. Sesi lama yang rusak bisa dibersihkan dengan membuka **`/logout`** |
| Terjebak login / sesi aneh | Buka **`https://DOMAINMU/logout`** — menghapus semua cookie sesi lalu kembali ke beranda |
| Login/register stuck, halaman `/login` blank atau error "Configuration" | `AUTH_SECRET` belum diset → set lalu restart. Di VPS/Railway pastikan juga `AUTH_TRUST_HOST=true` |
| Login sukses tapi terpental balik ke `/login` | Situs diakses via `http://` (cookie secure tidak tersimpan) → pasang HTTPS; atau header `X-Forwarded-Proto` tidak diteruskan Nginx (lihat config di atas) |
| Halaman lambat/timeout, data kosong | `MONGODB_URI` salah atau IP belum di-allowlist di Atlas (**Network Access → 0.0.0.0/0**) |
| `UntrustedHost` di log | Set `AUTH_TRUST_HOST=true` (dan/atau `AUTH_URL=https://domainmu`) |
| Upload gambar 404/ hilang setelah redeploy (Vercel) | Filesystem serverless tidak persisten → pindah ke Vercel Blob/Cloudinary (`lib/storage.ts`), atau pakai Railway Volume/VPS |
| Tombol Google tidak muncul | Env Google belum terpasang di server ATAU toggle di Admin → Pengaturan belum dinyalakan |
| Lupa password admin | Jalankan ulang `npm run seed` (⚠️ reset seluruh data) atau ubah manual hash di koleksi `users` |
