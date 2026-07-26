# 06 — Panduan Panel Admin

Akses: login dengan akun ber-role `admin` lalu buka `/admin`. Middleware
menolak non-admin (dialihkan ke `/dashboard`).

## Menu

| Menu | Path | Fungsi |
| --- | --- | --- |
| Dashboard | `/admin` | Statistik (saldo user, total topup, stok available/sold, total user), grafik transaksi 14 hari, produk terlaris, transaksi terbaru, topup pending |
| Produk | `/admin/products` | Tabel produk (search + filter kategori/status + pagination), tambah/edit/hapus, "Tambah Varian" global |
| Kategori | `/admin/categories` | CRUD kategori (gambar opsional, urutan otomatis). Hapus diblokir bila masih ada produk |
| Stock | `/admin/stock` | Tabel stok (search konten + filter status/produk/varian), edit/hapus. Stok `sold` terkunci |
| Import Stock | `/admin/stock/import` | Bulk import akun (satu baris = satu akun) |
| Topup | `/admin/topups` | Approve/Reject topup (dialog + catatan), lihat bukti |
| Transaksi | `/admin/transactions` | Semua transaksi (search invoice/produk + filter status) |
| Users | `/admin/users` | Edit user (nama, username, email, password, saldo), ubah role |
| Halaman | `/admin/pages` | Edit konten S&K & Kebijakan Privasi (markdown ringan) |
| Pengaturan | `/admin/settings` | Test email, pembayaran, captcha, auth, banner landing |

## Kelola Produk & Varian

- **Produk**: logo & banner via uploader (upload Cloudinary ATAU tempel URL).
  `sold` tidak diinput manual (otomatis). Status `inactive` menyembunyikan
  dari katalog publik.
- **Varian** = paket/plan (mis. "Private 1 Bulan"). Satu produk banyak varian.
  Tambah varian bisa dari halaman produk (pilih produk dulu) atau halaman
  varian produk. Menghapus produk menghapus varian + stoknya.

## Kelola Stok

- 1 entri = 1 akun. **Bulk import** paling efisien: pilih produk → varian →
  tempel daftar. Format `email:password` dirapikan otomatis; format lain
  disimpan apa adanya. Hasil import menampilkan jumlah berhasil/gagal/total.
- Stok `available` bisa dibeli; `reserved` ditahan; `sold` terkunci.

## Kelola Topup

- Tab filter status. **Approve** → saldo user bertambah + tercatat di ledger
  + email. **Reject** → saldo tidak berubah + email berisi alasan (catatan admin).
- Operasi atomik: satu topup tidak bisa di-approve dua kali.

## Pengaturan (`/admin/settings`)

1. **Tes Kirim Email** — masukkan email mana pun, kirim email percobaan untuk
   memverifikasi konfigurasi Resend. Nonaktif bila `RESEND_API_KEY` kosong.
2. **Metode Pembayaran** — toggle Wallet, Transfer Manual (bank+rekening),
   QRIS (upload QR).
3. **Autentikasi** — toggle Registrasi Terbuka, Wajib Verifikasi Email
   (butuh Resend), Login Google (butuh env Google).
4. **Captcha (Anti-Bot)** — pilih **Math** (bawaan) atau **Cloudflare
   Turnstile**. Untuk Turnstile isi Site Key + Secret Key (dari dashboard
   Cloudflare). Secret disimpan aman & tidak ditampilkan kembali (isi ulang
   hanya bila ingin mengganti).
5. **Landing Page** — banner promo opsional (tampil di bawah hero).

## Mengubah Role User

Admin → Users → ikon role. Buyer diberikan otomatis setelah pembelian
pertama, tapi bisa diubah manual. Admin tidak bisa mengubah role dirinya
sendiri (mencegah terkunci).

## Setup Cloudflare Turnstile (ringkas)

1. dash.cloudflare.com → Turnstile → Add site → domainmu → dapatkan
   **Site Key** + **Secret Key**.
2. Admin → Pengaturan → Captcha → provider **Turnstile** → tempel kedua key
   → Simpan. Halaman login/register/lupa-password langsung memakai widget.
