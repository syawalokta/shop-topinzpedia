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
  (auth)/login/         # Halaman login (layout minimal)
  api/                  # REST endpoint (products, categories)
  sitemap.ts, robots.ts # SEO
components/
  ui/                   # shadcn/ui primitives
  layout/               # Navbar, Footer, theme
  home/                 # Section landing page
  products/             # Card, grid, filter, varian, skeleton
  shared/               # Motion primitives, heading, rating
lib/
  db.ts                 # Koneksi Mongoose (cached)
  data/                 # Data-access layer + katalog seed/fallback
  constants.ts          # Konfigurasi situs, nav, FAQ, dsb.
models/                 # Category, Product, Variant, Transaction
hooks/                  # useScrolled, useDebouncedCallback
types/                  # DTO & tipe bersama
scripts/seed.ts         # Seeder database
```

## 🗺️ Roadmap (struktur sudah disiapkan)

- [ ] Dashboard admin — route group `(admin)` + REST API yang sudah ada
- [ ] Authentication (Auth.js) — halaman login & model `Transaction.userId` siap
- [ ] CRUD produk/varian/kategori dari dashboard
- [ ] Payment gateway (Midtrans/Xendit) — model `Transaction` sudah tersedia
- [ ] Riwayat transaksi & dashboard pelanggan

## 📝 Catatan

- **Nomor WhatsApp** default hanyalah placeholder — ganti lewat `NEXT_PUBLIC_WHATSAPP`.
- **Logo brand** di `public/brands/` adalah badge monogram generik agar repo bebas aset berhak cipta; ganti dengan aset resmi bila diperlukan.
- Field `Product.accent` (hex) dipakai untuk pewarnaan banner detail produk secara dinamis.
