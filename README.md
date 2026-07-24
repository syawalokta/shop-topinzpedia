# ⚡ TopinzPedia

**Digital store modern untuk akun premium** — ChatGPT Plus, Netflix, Spotify, Canva Pro, dan puluhan produk digital lainnya. Dibangun dengan Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, dan MongoDB (Mongoose).

## ✨ Fitur

- **Landing page** untuk branding & kepercayaan: hero + mockup order, brand marquee, features, kategori, cara pembelian, FAQ accordion, CTA
- **Katalog produk** (`/products`): pencarian (debounced), filter kategori, sort (terpopuler/terbaru/harga/rating) — semua state di URL
- **Detail produk** (`/products/[slug]`): banner beraksen warna brand, pemilih varian interaktif, feature list, produk serupa, tombol *Beli Sekarang* via WhatsApp
- **Desain premium & minimalis**: Poppins + Inter, radius 16px, soft shadow, dark mode, mobile-first (grid 2 kolom → 4 kolom)
- **Animasi halus** dengan Framer Motion (fade-up, stagger, hover) + hormat pada `prefers-reduced-motion`
- **Kualitas produksi**: loading skeleton, empty state, error state, halaman 404, SEO (Metadata API, sitemap, robots, JSON-LD), aksesibilitas
- **Data layer tangguh**: MongoDB via Mongoose dengan **fallback otomatis ke data statis** bila database belum dikonfigurasi — situs tetap hidup dalam mode demo
- **Auth & role** (Auth.js v5): register (nama, username, email, password, captcha, S&K), login email/username, opsi **Login Google** (toggle dari admin), role `admin` / `buyer` / `user` — buyer otomatis setelah pembelian pertama
- **Wallet system**: setiap user punya saldo + ledger `WalletTransaction`; **topup manual** (nominal, metode, upload bukti, catatan) dengan approve/reject admin
- **Checkout saldo + auto delivery**: stok per-akun (1 dokumen = 1 akun), klaim stok atomik anti race-condition, refund otomatis bila kehabisan, halaman invoice dengan detail akun + **download .txt**
- **Dashboard user** (`/dashboard`): saldo, riwayat mutasi, riwayat topup, riwayat pembelian + detail
- **Dashboard admin** (`/admin`): statistik lengkap (saldo user, topup, stok, grafik transaksi 14 hari, produk terlaris), CRUD produk/varian/kategori, **stock management + bulk import**, kelola topup/transaksi/users, pengaturan pembayaran & auth — semua dengan search, filter, dan pagination
- **Upload gambar** (logo/banner/QRIS/bukti transfer) via storage layer lokal — siap dipindah ke Cloudinary/Vercel Blob

## 🧰 Tech Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first tokens) + shadcn/ui |
| Animasi | Framer Motion |
| Database | MongoDB + Mongoose |
| Form & Validasi | React Hook Form + Zod |
| Ikon | Lucide React |

> 📦 **Mau deploy?** Lihat **[DEPLOYMENT.md](./DEPLOYMENT.md)** — panduan lengkap Vercel, Railway, dan VPS (Nginx + PM2 + HTTPS) beserta troubleshooting.

## 🚀 Menjalankan Proyek

**1. Instal dependensi**

```bash
npm install
```

**2. Siapkan environment**

```bash
cp .env.example .env.local
```

| Variabel | Keterangan |
| --- | --- |
| `MONGODB_URI` | Connection string MongoDB (Atlas/lokal). **Opsional** — bila kosong, situs berjalan dengan data demo statis |
| `MONGODB_DB` | Nama database (default: `topinzpedia`) |
| `NEXT_PUBLIC_SITE_URL` | URL publik situs (untuk SEO/sitemap) |
| `NEXT_PUBLIC_WHATSAPP` | Nomor WhatsApp admin, format internasional tanpa `+` (mis. `628123456789`) |
| `AUTH_SECRET` | **Wajib** — secret Auth.js (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | Set `true` bila deploy di luar Vercel |
| `GOOGLE_CLIENT_ID/SECRET` | Opsional — aktifkan Login Google (nyalakan juga di Admin > Pengaturan) |
| `SEED_ADMIN_PASSWORD` | Password akun admin hasil seed (default `admin12345`) |

**3. Seed database** (lewati bila memakai mode demo tanpa MongoDB)

```bash
npm run seed
```

Mengisi 6 kategori, 14 produk, 39 varian, ~95 stok akun demo, pengaturan pembayaran, plus dua akun:

| Akun | Login | Role |
| --- | --- | --- |
| Admin | `admin@topinzpedia.com` / `SEED_ADMIN_PASSWORD` | admin |
| Demo | `demo@topinzpedia.com` / `demo12345` (saldo Rp200.000) | user |

**4. Jalankan**

```bash
npm run dev    # development — http://localhost:3000
npm run build  # production build
npm start      # jalankan hasil build
```

## 📁 Struktur Proyek

```
app/
  (site)/               # Halaman publik (navbar + footer)
    page.tsx            #   Landing page
    products/           #   Katalog + detail produk
  (auth)/login/         # Halaman login pelanggan (placeholder)
  (admin)/admin/        # Panel admin (dilindungi middleware)
    login/              #   Login admin (ADMIN_KEY)
    (dashboard)/        #   Shell sidebar: dashboard, products, categories
  api/                  # REST endpoint (products, categories)
  sitemap.ts, robots.ts # SEO
components/
  ui/                   # shadcn/ui primitives
  layout/               # Navbar, Footer, theme
  home/                 # Section landing page
  products/             # Card, grid, filter, varian, skeleton
  admin/                # Sidebar, form produk, dialog varian/kategori
  shared/               # Motion primitives, heading, rating
lib/
  db.ts                 # Koneksi Mongoose (cached)
  auth.ts               # Helper sesi admin (hash ADMIN_KEY)
  validations.ts        # Skema Zod terpusat (produk, varian, kategori)
  actions/              # Server Actions CRUD + auth admin
  data/                 # Data-access publik + admin + fallback statis
  constants.ts          # Konfigurasi situs, nav, FAQ, dsb.
models/                 # Category, Product, Variant, Transaction
hooks/                  # useScrolled, useDebouncedCallback
types/                  # DTO & tipe bersama
scripts/seed.ts         # Seeder database
middleware.ts           # Guard rute /admin/*
```

## 🔐 Auth, Role & Panel Admin

- **`/register`** — daftar dengan validasi Zod + captcha; **`/login`** — email/username + password, plus tombol Google bila diaktifkan
- Middleware menjaga `/dashboard/*` (semua role) dan `/admin/*` (khusus `admin`) via JWT
- Login sebagai akun admin lalu buka **`/admin`** untuk mengelola semuanya

**Alur uang (wallet)**: user topup → admin approve (saldo bertambah + tercatat di ledger) → user checkout → saldo dipotong atomik → stok diklaim atomik (`available → sold`) → konten akun terkirim ke invoice. Bila stok habis saat race, transaksi `failed` dan saldo di-refund otomatis. Semua query lewat service layer (`lib/services/*`).

**Menambah payment gateway** (QRIS dinamis/Midtrans/Tripay/Duitku): tambah provider di service checkout/topup + toggle di `PaymentSetting` — arsitektur sudah menyiapkannya.

## 🗺️ Roadmap

- [x] Dashboard admin — statistik, grafik transaksi, CRUD lengkap
- [x] Authentication penuh (Auth.js v5) + role admin/buyer/user + Google opsional
- [x] Wallet system, topup manual (approve/reject), checkout saldo
- [x] Stock per-akun + bulk import + auto delivery anti race-condition
- [x] Riwayat transaksi & dashboard pelanggan
- [x] Upload gambar (logo/banner/QRIS/bukti) via storage layer
- [ ] Payment gateway otomatis (QRIS dinamis/Midtrans/Tripay/Duitku)
- [ ] Notifikasi (email/WhatsApp) saat pesanan terkirim
- [ ] Pindah storage upload ke Cloudinary/Vercel Blob untuk serverless

## ⚠️ Catatan Produksi

- Captcha bawaan adalah captcha matematika ber-HMAC (tanpa layanan eksternal). Untuk proteksi lebih kuat, tukar dengan Cloudflare Turnstile di `lib/captcha.ts` + `RegisterForm`.
- Upload tersimpan di `public/uploads` (di-gitignore). Di platform serverless (Vercel), pindahkan driver `lib/storage.ts` ke Blob/Cloudinary.
- Checkout memakai operasi atomik dokumen tunggal — aman di MongoDB standalone maupun Atlas tanpa perlu replica set.

## 📝 Catatan

- **Nomor WhatsApp** default hanyalah placeholder — ganti lewat `NEXT_PUBLIC_WHATSAPP`.
- **Logo brand** di `public/brands/` adalah badge monogram generik agar repo bebas aset berhak cipta; ganti dengan aset resmi bila diperlukan.
- Field `Product.accent` (hex) dipakai untuk pewarnaan banner detail produk secara dinamis.
