# 03 — Struktur Folder & Arsitektur

## Arsitektur Berlapis

```
UI (Client/Server Component)
        │  memanggil
        ▼
Server Action  (lib/actions/*)  ← guard role + validasi Zod
        │  memanggil
        ▼
Service / Repository (lib/services/*, lib/data/*)  ← logika bisnis + query
        │  memakai
        ▼
Model Mongoose (models/*)  ← skema & akses DB
```

Layanan eksternal dibungkus abstraction:
- `lib/storage/*` → Cloudinary / Local (gambar)
- `lib/email/*` → Resend (email)
- `lib/captcha.ts` → Math / Turnstile

## Pohon Folder

```
app/
  (site)/                     # Halaman publik (Navbar + Footer)
    page.tsx                  #   Landing page
    products/                 #   Katalog + [slug] detail
    syarat-ketentuan/         #   Halaman legal (dari DB)
    kebijakan-privasi/
    layout.tsx
  (auth)/                     # Login, register, lupa/reset password,
    login/ register/          #   verify-email, email-sent (layout minimal)
    forgot-password/ reset-password/
    verify-email/ email-sent/
  (user)/dashboard/           # Dashboard user (sidebar)
    page.tsx                  #   Ringkasan (saldo, transaksi terbaru)
    wallet/ topup/            #   Wallet + topup
    transactions/[invoice]/   #   Riwayat + detail transaksi
    settings/                 #   Profil, avatar, kontak, ubah password
  (admin)/admin/              # Panel admin (middleware role=admin)
    (dashboard)/              #   Shell sidebar admin
      page.tsx                #     Dashboard statistik + grafik
      products/ categories/   #     CRUD produk (+varian), kategori
      stock/ stock/import/    #     Kelola stok + bulk import
      topups/ transactions/   #     Kelola topup, transaksi
      users/ pages/ settings/ #     Kelola user, halaman legal, pengaturan
  api/
    auth/[...nextauth]/       # Handler Auth.js
    products/ categories/     # REST publik (read-only)
  logout/route.ts            # Logout bersih (hapus cookie)
  layout.tsx, error.tsx, not-found.tsx, sitemap.ts, robots.ts, icon.svg

components/
  ui/                         # shadcn/ui primitives (button, dialog, dst)
  layout/                     # Navbar, Footer, ThemeProvider/Toggle
  home/                       # Section landing page
  products/                   # Card, grid, filter, variant-selector, skeleton
  admin/                      # Sidebar, form/dialog CRUD, toolbar, dsb
  dashboard/                  # Sidebar user, topup form, settings, download txt
  auth/                       # login/register/forgot/reset form
  shared/                     # motion, captcha-field, image-upload, dsb

lib/
  actions/                    # Server Actions (mutasi) — semua "use server"
  services/                   # Logika bisnis (wallet, checkout, topup, stock,
                              #   users, transactions, settings, account, pages)
  data/                       # Data-access publik + admin + fallback statis
  storage/                    # StorageService + Cloudinary/Local
  email/                      # EmailService + Resend
  db.ts                       # Koneksi Mongoose (cached)
  authz.ts                    # getSessionUser / getAdminSession
  captcha.ts                  # Math + Turnstile + verifikasi terpusat
  validations.ts              # Skema Zod terpusat
  constants.ts                # Konfigurasi situs, nav, FAQ, brands
  legal-content.ts            # Konten awal S&K + Privasi
  pagination.ts, utils.ts

emails/                       # Template email React (branding #2563EB)
models/                       # Skema Mongoose (lihat 04-database.md)
hooks/                        # useScrolled, useDebouncedCallback
types/                        # DTO & tipe bersama + next-auth.d.ts
scripts/seed.ts               # Seeder database
middleware.ts                 # Guard /admin/* (role admin) & /dashboard/*
auth.ts                       # Konfigurasi Auth.js (providers, callbacks)
next.config.ts                # Security headers + config
```

## Konvensi

- **Server Action** selalu diawali `"use server"`, mengembalikan
  `ActionResult` (`{ ok, error?, emailFailed? }`) atau tipe khusus.
- **Guard**: action admin memanggil `getAdminSession()`, action user
  memanggil `getSessionUser()` di awal.
- **Validasi**: parse input dengan skema dari `lib/validations.ts`.
- **Revalidasi**: setelah mutasi, `revalidatePath()` halaman terdampak.
- **DTO**: service mengembalikan objek polos (bukan dokumen Mongoose) agar
  aman diserialisasi ke Client Component.
