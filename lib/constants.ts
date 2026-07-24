import {
  BadgeCheck,
  Bot,
  Clapperboard,
  Cloud,
  Gamepad2,
  Headset,
  Lock,
  Scissors,
  ShieldCheck,
  Sparkles,
  Tag,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { SortKey } from "../types";

export const SITE = {
  name: "TopinzPedia",
  tagline: "Akun Premium Digital Murah, Aman & Otomatis",
  description:
    "TopinzPedia adalah digital store terpercaya untuk akun premium ChatGPT, Netflix, Spotify, Canva Pro, dan puluhan produk digital lainnya. Pembayaran mudah, pengiriman otomatis, dan bergaransi penuh.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "6281234567890",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
] as const;

/** Daftar kategori statis — dipakai footer & fallback icon (sinkron dengan seed) */
export const STATIC_CATEGORIES = [
  { name: "AI", slug: "ai" },
  { name: "Streaming", slug: "streaming" },
  { name: "Editing", slug: "editing" },
  { name: "Gaming", slug: "gaming" },
  { name: "VPN", slug: "vpn" },
  { name: "Cloud", slug: "cloud" },
] as const;

/** Pemetaan slug kategori -> ikon Lucide */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  ai: Bot,
  streaming: Clapperboard,
  editing: Scissors,
  gaming: Gamepad2,
  vpn: ShieldCheck,
  cloud: Cloud,
};

export const FALLBACK_CATEGORY_ICON: LucideIcon = Sparkles;

export const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Produk dikirim otomatis ke WhatsApp/email kamu dalam hitungan menit setelah pembayaran terverifikasi.",
  },
  {
    icon: BadgeCheck,
    title: "Garansi Produk",
    description:
      "Semua produk bergaransi penuh selama masa aktif. Ada kendala akun? Kami ganti tanpa ribet.",
  },
  {
    icon: Wallet,
    title: "Pembayaran Lengkap",
    description:
      "QRIS, e-wallet, transfer bank, hingga pulsa — pilih metode pembayaran yang paling nyaman untukmu.",
  },
  {
    icon: Headset,
    title: "Support Cepat",
    description:
      "Tim support responsif siap membantu setiap hari, dari pagi sampai tengah malam.",
  },
  {
    icon: Tag,
    title: "Harga Terjangkau",
    description:
      "Harga termurah di kelasnya dengan kualitas produk yang selalu terjaga dan stok yang stabil.",
  },
  {
    icon: Lock,
    title: "Aman & Terpercaya",
    description:
      "Ribuan transaksi berhasil setiap bulan dengan data pelanggan yang selalu terlindungi.",
  },
];

export const STEPS = [
  {
    step: "01",
    title: "Pilih Produk",
    description:
      "Jelajahi katalog, bandingkan varian, lalu pilih produk yang paling sesuai kebutuhanmu.",
  },
  {
    step: "02",
    title: "Lakukan Pembayaran",
    description:
      "Bayar lewat QRIS, e-wallet, atau transfer bank sesuai nominal pesananmu.",
  },
  {
    step: "03",
    title: "Produk Dikirim",
    description:
      "Detail akun langsung dikirim otomatis ke kamu. Tinggal login dan nikmati fitur premiumnya!",
  },
];

export const FAQS = [
  {
    q: "Apakah akun premium di TopinzPedia legal dan aman?",
    a: "Aman. Semua produk bersumber dari langganan resmi yang dikelola tim kami. Kamu akan menerima detail akun yang siap dipakai, lengkap dengan panduan penggunaan agar akun tetap aman selama masa aktif.",
  },
  {
    q: "Berapa lama proses pengiriman setelah pembayaran?",
    a: "Mayoritas pesanan terkirim otomatis dalam 1–5 menit setelah pembayaran terverifikasi. Untuk produk tertentu yang diproses manual, maksimal 1×24 jam (biasanya jauh lebih cepat).",
  },
  {
    q: "Apa bedanya akun Sharing dan Private?",
    a: "Akun Sharing dipakai bersama beberapa pengguna dengan profil masing-masing — harganya lebih hemat. Akun Private sepenuhnya milikmu sendiri: lebih leluasa, bisa ganti password, dan cocok untuk penggunaan intensif.",
  },
  {
    q: "Bagaimana cara klaim garansi jika akun bermasalah?",
    a: "Cukup hubungi admin via WhatsApp dengan menyertakan nomor invoice. Selama masih dalam masa garansi, akun bermasalah akan kami perbaiki atau ganti baru maksimal 1×24 jam.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kami menerima QRIS (semua e-wallet & m-banking), DANA, OVO, GoPay, ShopeePay, transfer bank (BCA, BRI, Mandiri), hingga pulsa. Pembayaran dikonfirmasi otomatis.",
  },
  {
    q: "Apakah bisa perpanjang setelah masa aktif habis?",
    a: "Tentu! Kamu tinggal order ulang varian yang sama sebelum masa aktif berakhir, dan tim kami akan memperpanjang di akun yang sama bila memungkinkan. Admin juga akan mengingatkanmu menjelang masa aktif habis.",
  },
];

export const PAYMENT_METHODS = [
  "QRIS",
  "DANA",
  "OVO",
  "GoPay",
  "ShopeePay",
  "BCA",
  "BRI",
  "Mandiri",
  "Pulsa",
] as const;

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Terpopuler" },
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga Terendah" },
  { value: "price-desc", label: "Harga Tertinggi" },
  { value: "rating", label: "Rating Tertinggi" },
];

/** Brand yang ditampilkan pada Brand Section landing page */
export const BRANDS = [
  { name: "ChatGPT", logo: "/brands/chatgpt.svg" },
  { name: "Gemini", logo: "/brands/gemini.svg" },
  { name: "Spotify", logo: "/brands/spotify.svg" },
  { name: "Netflix", logo: "/brands/netflix.svg" },
  { name: "Canva", logo: "/brands/canva.svg" },
  { name: "Adobe", logo: "/brands/adobe.svg" },
  { name: "Notion", logo: "/brands/notion.svg" },
  { name: "Disney+", logo: "/brands/disney.svg" },
  { name: "CapCut", logo: "/brands/capcut.svg" },
  { name: "YouTube", logo: "/brands/youtube.svg" },
] as const;
