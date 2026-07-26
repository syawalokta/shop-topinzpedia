# 05 — Workflow / Alur Bisnis

## 1. Registrasi & Verifikasi Email

```
User isi form register (nama, username, email, password, captcha, setuju S&K)
  → registerAction (lib/actions/auth-user.ts)
     → validasi Zod + verifyCaptchaFromSettings
     → registerUser (buat User + Wallet saldo 0)
     → JIKA emailVerificationEnabled && Resend aktif:
          kirim email verifikasi → redirect /email-sent
        SELAIN ITU:
          emailVerified = now → redirect /login?registered=1
```

- Verifikasi email **opsional** (default OFF), diatur di Admin → Pengaturan.
- Token verifikasi: hash disimpan di `Token`, tautan `/verify-email?token=...`
  memanggil `verifyEmailToken` (berlaku 24 jam, sekali pakai).
- Link di email di-handle halaman `app/(auth)/verify-email/page.tsx`.

## 2. Login (+ Captcha + Rate Limit)

```
signIn("credentials", { identifier, password, captchaToken, captchaAnswer })
  → authorize (auth.ts):
     1. verifyCaptchaFromSettings  (math atau Turnstile)
     2. cek lockUntil (terkunci?) → error "locked"
     3. bandingkan bcrypt; gagal → loginAttempts++;
        5x gagal → lockUntil = now+5menit
     4. JIKA role != admin && belum verified && fitur verifikasi aktif → "unverified"
     5. sukses → reset attempts → JWT (berisi role, username)
  → LoginForm redirect: admin → /admin, lainnya → /dashboard (getPostLoginPath)
```

- Admin **dikecualikan** dari kewajiban verifikasi email.
- Rate limit: 5 percobaan salah → kunci 5 menit (field `loginAttempts`/`lockUntil`).

## 3. Reset Password

```
/forgot-password → forgotPasswordAction (captcha + email)
  → requestPasswordReset: buat Token reset (30 menit), kirim email
  → /reset-password?token=... → resetPasswordAction → set passwordHash baru
```
Respons selalu generik (anti user-enumeration).

## 4. Topup Saldo (Manual)

```
User: /dashboard/topup → pilih nominal + metode + upload bukti
  → createTopupAction: upload bukti ke Cloudinary → Topup status "pending"
Admin: /admin/topups → Approve / Reject (dialog konfirmasi + catatan)
  → approveTopup: atomik (pending→approved) → creditWallet (+saldo, catat ledger)
                  → email "Topup Approved"
  → rejectTopup:  atomik (pending→rejected) → saldo TIDAK berubah
                  → email "Topup Rejected"
```

## 5. Checkout Saldo + Auto Delivery (inti)

`purchaseWithWallet` (`lib/services/checkout.ts`) — aman tanpa transaction
multi-dokumen (jalan di MongoDB standalone):

```
1. Cek wallet aktif + varian valid + ada stok "available"
2. debitWalletIfSufficient (ATOMIK: findOneAndUpdate balance>=harga)
   gagal → "Saldo tidak mencukupi"
3. Buat Transaction "pending"
4. Klaim 1 Stock available (ATOMIK: findOneAndUpdate status→sold, isi buyer/txn)
   4a. dapat stok → Transaction "paid" + deliveredContent
                  → Product.sold +1 → role user→buyer
                  → email "Purchase Success"
   4b. TIDAK dapat (kalah race / habis) → Transaction "failed"
                  → creditWallet refund penuh → pesan "stok habis, saldo kembali"
```

- Kegagalan email **tidak** membatalkan transaksi (toast "Gagal mengirim
  email, namun proses berhasil.").
- Invoice + detail akun tampil di `/dashboard/transactions/[invoice]`,
  bisa diunduh sebagai `.txt`.

## 6. Stok

- **Bulk import** (`/admin/stock/import`): tempel banyak baris; format
  `email:password` otomatis dirapikan menjadi `Email: ...\nPassword: ...`.
- Stok varian **dihitung** dari `Stock` (status available) — tidak ada angka
  manual. Ditampilkan di halaman varian & katalog.
- Stok berstatus `sold` tidak bisa diedit/dihapus (jejak pembelian).

## 7. Email (Resend)

Semua via `getEmailService()` (`lib/email`). Jenis: verifikasi, reset password,
purchase success, invoice, topup approved/rejected, test email. Bila
`RESEND_API_KEY` kosong → dilewati + log warning (tidak crash).

## 8. Gambar (Cloudinary)

Semua via `getStorage()` (`lib/storage`). Upload → `{ url, publicId }`
disimpan di DB. **Replace** otomatis hapus file lama; **delete entity** ikut
hapus file (anti-orphan). Tanpa env Cloudinary → fallback `public/uploads`.

## 9. Captcha

`getPublicCaptcha()` (server) menentukan provider aktif lalu dikirim ke
`<CaptchaField>`. Verifikasi terpusat di `verifyCaptchaFromSettings()`
(math HMAC atau Turnstile siteverify). Ganti provider dari Admin → Pengaturan.
