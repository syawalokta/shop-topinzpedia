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
- **Dashboard admin** (`/admin`): statistik toko + CRUD lengkap produk, varian, dan kategori — Server Actions + Zod, dilindungi middleware berbasis `ADMIN_KEY`

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
| `ADMIN_KEY` | Kunci login panel admin `/admin` — **wajib nilai rahasia yang kuat**. Bila kosong, panel admin terkunci |

**3. Seed database** (lewati bila memakai mode demo tanpa MongoDB)

```bash
npm run seed
```

Mengisi 6 kategori, 14 produk, dan 40+ varian contoh.

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

## 🔐 Panel Admin

1. Set `ADMIN_KEY` di `.env.local`, lalu buka **`/admin`**
2. Login dengan kunci tersebut — sesi berlaku 7 hari (cookie httpOnly berisi hash SHA-256, bukan kuncinya)
3. Kelola dari sana: **produk** (tambah/edit/hapus + status aktif), **varian harga** per produk, dan **kategori** (hapus terlindungi bila masih ada produk)

Semua mutasi memakai Server Actions dengan validasi Zod dan otomatis me-revalidate halaman publik terkait. Panel admin membutuhkan database (fallback statis hanya untuk situs publik).

## 🗺️ Roadmap

- [x] Dashboard admin — route group `(admin)` dengan statistik toko
- [x] CRUD produk/varian/kategori dari dashboard (Server Actions + Zod)
- [x] Proteksi admin berbasis `ADMIN_KEY` (middleware + cookie hash)
- [ ] Authentication penuh (Auth.js) — menggantikan `ADMIN_KEY`, plus akun pelanggan
- [ ] Payment gateway (Midtrans/Xendit) — model `Transaction` sudah tersedia
- [ ] Riwayat transaksi & dashboard pelanggan

## 📝 Catatan

- **Nomor WhatsApp** default hanyalah placeholder — ganti lewat `NEXT_PUBLIC_WHATSAPP`.
- **Logo brand** di `public/brands/` adalah badge monogram generik agar repo bebas aset berhak cipta; ganti dengan aset resmi bila diperlukan.
- Field `Product.accent` (hex) dipakai untuk pewarnaan banner detail produk secara dinamis.
