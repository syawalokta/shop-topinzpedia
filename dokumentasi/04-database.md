# 04 — Database (MongoDB / Mongoose)

Semua model ada di `models/` dan diekspor via `models/index.ts` (import dari
sini agar seluruh skema terdaftar sebelum `populate`). Koneksi di-cache di
`lib/db.ts` (aman untuk serverless & hot-reload).

## Diagram Relasi (ringkas)

```
User 1───1 Wallet
User 1───* WalletTransaction
User 1───* Topup
User 1───* Transaction
User 1───* Stock (sebagai buyer, setelah membeli)

Category 1───* Product
Product  1───* Variant
Variant  1───* Stock

PaymentSetting  (singleton, key: "payment")
SiteSetting     (singleton, key: "site")
Page            (slug unik: syarat-ketentuan, kebijakan-privasi)
Token           (verifikasi email & reset password, TTL auto-hapus)
```

## Model

### User (`models/User.ts`)
| Field | Tipe | Catatan |
| --- | --- | --- |
| name | string | Nama lengkap |
| username | string unik (lowercase) | |
| email | string unik (lowercase) | |
| passwordHash | string \| null | bcrypt; null untuk akun Google |
| role | "admin" \| "buyer" \| "user" | buyer otomatis setelah beli |
| provider | "credentials" \| "google" | |
| image | string | avatar dari OAuth |
| avatarUrl / avatarPublicId | string | avatar via Cloudinary |
| socials | { whatsapp, telegram } | kontak opsional |
| emailVerified | Date \| null | terisi saat verifikasi email |
| loginAttempts | number | untuk rate limit |
| lockUntil | Date \| null | terkunci sampai waktu ini |

### Wallet (`models/Wallet.ts`)
`userId` (unik), `balance` (number ≥ 0). Satu wallet per user.

### WalletTransaction (`models/WalletTransaction.ts`)
Buku besar mutasi saldo — **setiap perubahan saldo wajib mencatat di sini**.
`userId`, `type` ("credit"|"debit"), `amount`, `description`, `reference`
(mis. invoice / `topup:<id>` / `admin:<id>`).

### Category (`models/Category.ts`)
`name`, `slug` (unik), `icon` (nama Lucide), `image`/`imagePublicId`
(opsional), `order` (urutan tampil, otomatis increment).

### Product (`models/Product.ts`)
`name`, `slug` (unik), `category` (ref), `logo`/`logoPublicId`,
`banner`/`bannerPublicId`, `accent` (hex), `description`, `features[]`,
`rating`, `sold` (**otomatis** +1 tiap pembelian, bukan input manual),
`status` ("active"|"inactive").

### Variant (`models/Variant.ts`)
`productId` (ref), `name` (mis. "1 Bulan Sharing"), `price`, `duration`,
`warranty`, `description`, `active`.
**Catatan penting:** TIDAK ada field `stock` angka — stok dihitung dari
jumlah dokumen `Stock` berstatus `available`.

### Stock (`models/Stock.ts`) — 1 dokumen = 1 akun
`variantId` (ref), `content` (teks bebas: email/password/pin),
`status` ("available"|"reserved"|"sold"), `buyerId`, `transactionId`.
Index gabungan `{ variantId, status }` untuk klaim cepat.

### Transaction (`models/Transaction.ts`)
`invoice` (unik), `userId`, `productId`, `variantId`, `paymentMethod`
("wallet"; siap QRIS/gateway), `paymentStatus`
("pending"|"paid"|"failed"|"refunded"), `total`, `deliveredContent`
(salinan `Stock.content`), `productName`/`variantName` (snapshot).

### Topup (`models/Topup.ts`)
`userId`, `amount`, `method` ("manual_transfer"|"qris"),
`proofImage`/`proofPublicId` (bukti via Cloudinary), `note`,
`status` ("pending"|"approved"|"rejected"), `adminNote`, `processedAt`.

### PaymentSetting (`models/PaymentSetting.ts`) — singleton
`wallet.enabled`, `manualTransfer` {enabled, bankName, accountNumber,
accountName}, `qris` {enabled, qrImage, qrisPublicId}.

### SiteSetting (`models/SiteSetting.ts`) — singleton
`googleAuthEnabled`, `registrationEnabled`, `emailVerificationEnabled`,
`landingBanner` {url, publicId},
`captcha` {provider "math"|"turnstile", turnstileSiteKey, turnstileSecretKey}.

### Page (`models/Page.ts`)
`slug` unik, `title`, `content` (markdown ringan). Untuk S&K & Privasi.
Auto-seed konten default saat pertama diakses.

### Token (`models/Token.ts`)
`userId`, `tokenHash` (sha256 — token asli hanya di email), `type`
("verify-email"|"reset-password"), `expiresAt` (TTL index auto-hapus).

## Seed

`scripts/seed.ts` (`npm run seed`) mengisi: 6 kategori, 14 produk, ~39 varian,
~95 stok akun demo, PaymentSetting + SiteSetting default, 2 halaman legal,
serta akun admin & demo. **Seed menghapus semua koleksi terlebih dahulu.**
