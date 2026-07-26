# 01 — Overview TopinzPedia

Dokumentasi teknis lengkap untuk **TopinzPedia**, digital store akun premium
(ChatGPT, Netflix, Spotify, Canva, dll) dengan sistem wallet, checkout saldo,
auto-delivery stok per-akun, panel admin, dan autentikasi berbasis role.

Dokumentasi ini ditujukan untuk developer (atau AI assistant) yang akan
melanjutkan pengembangan. Baca berurutan:

| File | Isi |
| --- | --- |
| `01-overview.md` | Ringkasan produk, fitur, tech stack (file ini) |
| `02-setup.md` | Cara menjalankan lokal + seluruh environment variable |
| `03-struktur.md` | Struktur folder & arsitektur berlapis |
| `04-database.md` | Seluruh skema MongoDB (models) + relasi |
| `05-workflow.md` | Alur bisnis: auth, wallet, checkout, topup, email, dll |
| `06-admin.md` | Panduan fitur panel admin |
| `07-security.md` | Model keamanan & hardening |
| `08-deployment.md` | Ringkas deploy (detail di /DEPLOYMENT.md root) |

## Apa itu TopinzPedia

Toko digital di mana:

1. **Pengunjung** melihat landing page + katalog produk (publik).
2. **User** mendaftar, mendapat **wallet** (saldo), lalu **topup** saldo
   (transfer manual + upload bukti → disetujui admin).
3. User **membeli** produk dengan memotong saldo. Sistem otomatis mengirim
   **1 akun stok** (email/password/pin) dan menampilkannya di invoice +
   file `.txt` yang bisa diunduh.
4. **Admin** mengelola produk, varian, stok, kategori, topup, transaksi,
   user, halaman legal, dan pengaturan (pembayaran, captcha, auth, email).

## Fitur Utama

- **Landing page** premium (hero, brand marquee, features, kategori, cara beli, FAQ)
- **Katalog** dengan search, filter kategori, sort, pagination
- **Detail produk** dengan pemilih varian (plan) + stok real-time
- **Auth (Auth.js v5)**: register, login (email/username), Google (opsional),
  verifikasi email (opsional), reset password, role admin/buyer/user
- **Wallet**: saldo + buku besar mutasi (`WalletTransaction`)
- **Topup manual**: nominal + metode + upload bukti → approve/reject admin
- **Checkout saldo + auto-delivery**: klaim stok atomik anti race-condition,
  refund otomatis bila stok habis
- **Stok per-akun**: 1 dokumen `Stock` = 1 akun; bulk import; hitung stok otomatis
- **Panel admin** lengkap: dashboard statistik + grafik, CRUD, kelola semua entitas
- **Email (Resend)**: verifikasi, reset password, invoice, notifikasi topup, tes email
- **Upload gambar (Cloudinary)**: logo, banner, kategori, avatar, bukti, QRIS
- **Captcha**: math (bawaan) atau Cloudflare Turnstile (dari panel admin)
- **Halaman legal** (S&K, Privasi) yang dapat diedit admin
- **Dark mode**, responsif, SEO (metadata, sitemap, robots, JSON-LD)

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Bahasa | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) |
| Animasi | Framer Motion |
| Database | MongoDB + Mongoose |
| Auth | Auth.js (NextAuth v5, JWT session) |
| Form & Validasi | React Hook Form + Zod |
| Email | Resend + template React |
| Storage gambar | Cloudinary (fallback lokal saat dev) |
| Captcha | Math HMAC (bawaan) / Cloudflare Turnstile |
| Ikon | Lucide React |
| Notifikasi UI | Sonner (toast) |

## Prinsip Arsitektur

1. **Berlapis**: UI → Server Action → Service/Repository → Model. Komponen
   tidak pernah query DB atau upload langsung.
2. **Abstraction untuk layanan eksternal**: `lib/storage` (Cloudinary),
   `lib/email` (Resend) — mudah ditukar implementasinya.
3. **Validasi terpusat**: semua input divalidasi Zod di `lib/validations.ts`.
4. **Aman by default**: guard role di setiap action, operasi uang atomik,
   captcha + rate limit, security headers.
5. **Tetap hidup tanpa konfigurasi**: tanpa DB → data statis; tanpa Cloudinary
   → storage lokal; tanpa Resend → email dilewati; tanpa Turnstile → math captcha.
