# 07 — Keamanan (Security Model)

Ringkasan kontrol keamanan yang sudah diterapkan dan hal yang perlu dijaga
saat melanjutkan pengembangan.

## Autentikasi & Sesi

- **Auth.js v5 (JWT)**. Password di-hash **bcrypt** (cost 10); tidak pernah
  disimpan/ditampilkan dalam bentuk asli.
- Session token JWT ditandatangani `AUTH_SECRET`. Cookie `httpOnly`,
  `sameSite=lax`, `secure` di production (nama `__Secure-authjs.session-token`).
- **Middleware** (`middleware.ts`) menjaga:
  - `/admin/*` → wajib role `admin` (non-admin dialihkan ke `/dashboard`).
  - `/dashboard/*` → wajib login.
  - Membaca cookie secure & non-secure (hindari redirect loop di HTTPS).
  - Membersihkan cookie sesi yang rusak (id non-ObjectId).
- `/logout` menghapus semua cookie sesi (termasuk `__Secure-`/`__Host-`
  dengan atribut yang benar) — escape hatch bila sesi bermasalah.

## Otorisasi (Server Actions)

- Setiap action admin memanggil `getAdminSession()` di awal; action user
  memanggil `getSessionUser()`. Tidak ada action mutasi tanpa guard.
- **IDOR dicegah**: user hanya mengakses datanya sendiri
  (`getTransactionByInvoice` cek `userId` kecuali admin; topup/checkout pakai
  id sesi, bukan input).
- `deleteImageAction` memvalidasi `publicId` harus berada di folder sesuai
  `kind` (cegah hapus file sembarangan).
- Admin tidak bisa mengubah role dirinya sendiri.

## Anti-Bot & Rate Limit

- **Captcha** di login, register, lupa password — Math HMAC (jawaban tak
  pernah dikirim ke klien) atau **Cloudflare Turnstile** (siteverify server-side).
- **Rate limit login**: 5 percobaan gagal → akun terkunci 5 menit
  (`loginAttempts` / `lockUntil`). Cek dilakukan SEBELUM verifikasi password
  final, dan verifikasi email dicek SETELAH password benar (tidak membocorkan
  status akun).
- Respons **anti user-enumeration** pada forgot-password & resend verification
  (selalu generik).

## Integritas Uang (Wallet)

- Potong saldo **atomik**: `findOneAndUpdate({ balance: { $gte } }, { $inc })`
  — tidak ada race condition saldo minus.
- Klaim stok **atomik**: `findOneAndUpdate({ status: "available" }, → sold)`
  — dua pembeli bersamaan tidak dapat stok yang sama; yang kalah otomatis
  di-refund dan transaksi `failed`.
- Approve/Reject topup atomik (hanya dari `pending`) — tak bisa dobel.
- **Setiap perubahan saldo tercatat** di `WalletTransaction` (audit trail).

## HTTP Security Headers (`next.config.ts`)

- `Content-Security-Policy` (izinkan Turnstile, gambar HTTPS, style inline).
- `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` (anti clickjacking).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- `Strict-Transport-Security` (HSTS), `poweredByHeader: false`.

## Validasi Input

- Semua input mutasi divalidasi **Zod** (`lib/validations.ts`) di server —
  jangan percaya validasi klien saja.
- Upload dibatasi tipe (jpg/png/webp; svg khusus logo) & ukuran (5MB).

## Token Email

- Token verifikasi/reset disimpan sebagai **hash sha256**; token asli hanya
  ada di tautan email. Sekali pakai, TTL (24 jam / 30 menit), auto-hapus.

## Checklist saat menambah fitur baru

1. Action mutasi → panggil guard (`getAdminSession`/`getSessionUser`) di awal.
2. Validasi semua input dengan Zod.
3. Untuk data milik user → filter dengan id sesi, jangan percaya id dari klien.
4. Operasi saldo/stok → gunakan operasi atomik + catat ledger.
5. Jangan mengembalikan secret (API key, secret captcha, passwordHash) ke klien.
6. `revalidatePath` setelah mutasi agar cache tidak basi.

## Yang perlu diperhatikan (bukan bug, tapi catatan)

- Rate limit login berbasis akun (per user), bukan per IP. Untuk proteksi
  brute-force terdistribusi, tambahkan rate limit per-IP di edge (mis.
  Cloudflare) — Turnstile sudah sangat membantu.
- Secret Turnstile disimpan di DB (SiteSetting). Akses DB = akses secret;
  batasi akses database production.
