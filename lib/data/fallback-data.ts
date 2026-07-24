import type { CategoryDTO, ProductDetail, VariantDTO } from "../../types";

/**
 * ==========================================================================
 * KATALOG SUMBER (Single Source of Truth)
 * --------------------------------------------------------------------------
 * Dipakai oleh dua hal:
 *  1. scripts/seed.ts  -> mengisi MongoDB dengan data ini
 *  2. Fallback statis  -> dipakai data layer bila MONGODB_URI tidak diset
 *     atau database sedang tidak bisa dijangkau, sehingga website tetap
 *     berfungsi penuh dalam mode demo.
 * ==========================================================================
 */

export interface SeedVariant {
  name: string;
  price: number;
  stock: number;
  duration: string;
  warranty: string;
  description: string;
  active: boolean;
}

export interface SeedProduct {
  name: string;
  slug: string;
  /** slug kategori */
  category: string;
  logo: string;
  banner: string;
  accent: string;
  description: string;
  features: string[];
  rating: number;
  sold: number;
  status: "active" | "inactive";
  /** usia produk (hari) — untuk variasi urutan "Terbaru" */
  daysAgo: number;
  variants: SeedVariant[];
}

export const seedCategories = [
  { name: "AI", slug: "ai", icon: "bot", order: 1 },
  { name: "Streaming", slug: "streaming", icon: "clapperboard", order: 2 },
  { name: "Editing", slug: "editing", icon: "scissors", order: 3 },
  { name: "Gaming", slug: "gaming", icon: "gamepad-2", order: 4 },
  { name: "VPN", slug: "vpn", icon: "shield-check", order: 5 },
  { name: "Cloud", slug: "cloud", icon: "cloud", order: 6 },
];

export const seedProducts: SeedProduct[] = [
  {
    name: "ChatGPT Plus",
    slug: "chatgpt-plus",
    category: "ai",
    logo: "/brands/chatgpt.svg",
    banner: "",
    accent: "#10a37f",
    description:
      "Akses model GPT terbaru dari OpenAI dengan respons lebih cepat, kuota lebih besar, dan fitur premium seperti advanced reasoning, analisis file, serta pembuatan gambar. Cocok untuk pelajar, pekerja kreatif, hingga developer yang butuh asisten AI andal setiap hari.",
    features: [
      "Akses model GPT terbaru & tercepat",
      "Kuota pesan jauh lebih besar dari akun gratis",
      "Advanced reasoning & analisis file",
      "Upload gambar, dokumen, dan pembuatan gambar AI",
      "Prioritas akses saat server ramai",
    ],
    rating: 4.9,
    sold: 12500,
    status: "active",
    daysAgo: 120,
    variants: [
      {
        name: "Sharing",
        price: 25000,
        stock: 84,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Satu akun dipakai bergantian maksimal 5 pengguna.",
        active: true,
      },
      {
        name: "Private",
        price: 95000,
        stock: 27,
        duration: "1 Bulan",
        warranty: "Full Garansi",
        description: "Akun pribadi 100% milikmu, bebas atur sendiri.",
        active: true,
      },
      {
        name: "Private",
        price: 265000,
        stock: 11,
        duration: "3 Bulan",
        warranty: "Full Garansi",
        description: "Akun pribadi dengan masa aktif lebih panjang & hemat.",
        active: true,
      },
    ],
  },
  {
    name: "Gemini Advanced",
    slug: "gemini-advanced",
    category: "ai",
    logo: "/brands/gemini.svg",
    banner: "",
    accent: "#4285f4",
    description:
      "Google AI Pro dengan model Gemini paling canggih, terintegrasi langsung dengan Gmail, Docs, dan ekosistem Google lainnya. Termasuk bonus penyimpanan Google One untuk menunjang produktivitasmu.",
    features: [
      "Akses model Gemini paling canggih",
      "Terintegrasi dengan Gmail, Docs & Drive",
      "Bonus penyimpanan Google One 2TB",
      "Analisis dokumen & data lebih dalam",
      "Akses fitur eksperimental lebih awal",
    ],
    rating: 4.8,
    sold: 6800,
    status: "active",
    daysAgo: 45,
    variants: [
      {
        name: "Invite Family",
        price: 30000,
        stock: 40,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Diundang ke family plan, aktif di email pribadimu.",
        active: true,
      },
      {
        name: "Invite Family",
        price: 80000,
        stock: 25,
        duration: "3 Bulan",
        warranty: "Full Garansi",
        description: "Lebih hemat untuk pemakaian rutin tiga bulan.",
        active: true,
      },
      {
        name: "Invite Family",
        price: 250000,
        stock: 9,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Paling hemat — setara Rp20.800/bulan.",
        active: true,
      },
    ],
  },
  {
    name: "Notion Plus + AI",
    slug: "notion-ai",
    category: "ai",
    logo: "/brands/notion.svg",
    banner: "",
    accent: "#0f172a",
    description:
      "Workspace favorit untuk catatan, project management, dan dokumentasi — kini dengan Notion AI yang siap merangkum, menulis ulang, dan menjawab pertanyaan dari isi workspace-mu.",
    features: [
      "Notion AI tanpa batas pemakaian wajar",
      "Unlimited blocks & file upload",
      "Kolaborasi tim dengan riwayat versi",
      "Integrasi Slack, GitHub, dan lainnya",
    ],
    rating: 4.7,
    sold: 2100,
    status: "active",
    daysAgo: 90,
    variants: [
      {
        name: "Member Workspace",
        price: 40000,
        stock: 30,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Bergabung sebagai member workspace premium.",
        active: true,
      },
      {
        name: "Member Workspace",
        price: 325000,
        stock: 8,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Setahun penuh produktif dengan harga hemat.",
        active: true,
      },
    ],
  },
  {
    name: "Perplexity Pro",
    slug: "perplexity-pro",
    category: "ai",
    logo: "/brands/perplexity.svg",
    banner: "",
    accent: "#20808d",
    description:
      "Mesin jawab AI dengan sitasi sumber real-time. Versi Pro membuka model terbaik, pencarian tanpa batas, serta upload file untuk riset yang lebih dalam dan akurat.",
    features: [
      "Pro Search tanpa batas harian",
      "Pilihan model AI terbaik",
      "Upload & analisis file",
      "Jawaban dengan sitasi sumber terpercaya",
    ],
    rating: 4.8,
    sold: 1900,
    status: "active",
    daysAgo: 12,
    variants: [
      {
        name: "Private",
        price: 35000,
        stock: 26,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Akun pribadi penuh, langsung aktif.",
        active: true,
      },
      {
        name: "Private",
        price: 275000,
        stock: 10,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Setahun riset tanpa batas dengan harga terbaik.",
        active: true,
      },
    ],
  },
  {
    name: "Netflix Premium",
    slug: "netflix-premium",
    category: "streaming",
    logo: "/brands/netflix.svg",
    banner: "",
    accent: "#e50914",
    description:
      "Nonton film, series, dan dokumenter favorit dalam kualitas hingga 4K Ultra HD tanpa iklan. Tersedia pilihan profil sharing yang hemat maupun akun private untuk kenyamanan maksimal.",
    features: [
      "Kualitas streaming hingga 4K + HDR",
      "Bebas iklan, bisa download offline",
      "Profil sendiri dengan PIN pengaman",
      "Akses semua katalog Netflix Indonesia",
      "Support semua perangkat (TV, HP, laptop)",
    ],
    rating: 4.9,
    sold: 25400,
    status: "active",
    daysAgo: 300,
    variants: [
      {
        name: "Sharing 1 Profil",
        price: 27000,
        stock: 120,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "1 profil pribadi dalam akun bersama, 1 perangkat.",
        active: true,
      },
      {
        name: "Semi Private",
        price: 45000,
        stock: 45,
        duration: "1 Bulan",
        warranty: "Full Garansi",
        description: "1 profil untuk 2 perangkat, lebih fleksibel.",
        active: true,
      },
      {
        name: "Private",
        price: 120000,
        stock: 15,
        duration: "1 Bulan",
        warranty: "Full Garansi",
        description: "Seluruh akun milikmu — semua profil bebas diatur.",
        active: true,
      },
    ],
  },
  {
    name: "Spotify Premium",
    slug: "spotify-premium",
    category: "streaming",
    logo: "/brands/spotify.svg",
    banner: "",
    accent: "#1db954",
    description:
      "Dengarkan jutaan lagu dan podcast tanpa iklan, dengan kualitas audio maksimal dan mode offline. Premium diaktifkan langsung di akun Spotify milikmu sendiri — playlist aman, tidak perlu ganti akun.",
    features: [
      "Diaktifkan di akun pribadimu sendiri",
      "Bebas iklan & skip lagu sepuasnya",
      "Download lagu untuk mode offline",
      "Kualitas audio hingga Very High",
    ],
    rating: 4.9,
    sold: 18200,
    status: "active",
    daysAgo: 280,
    variants: [
      {
        name: "Individual",
        price: 20000,
        stock: 150,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Upgrade premium di email Spotify kamu sendiri.",
        active: true,
      },
      {
        name: "Individual",
        price: 38000,
        stock: 80,
        duration: "2 Bulan",
        warranty: "Full Garansi",
        description: "Dua bulan nonstop dengan harga lebih hemat.",
        active: true,
      },
      {
        name: "Individual",
        price: 55000,
        stock: 60,
        duration: "3 Bulan",
        warranty: "Full Garansi",
        description: "Paket paling favorit — setara Rp18.300/bulan.",
        active: true,
      },
    ],
  },
  {
    name: "YouTube Premium",
    slug: "youtube-premium",
    category: "streaming",
    logo: "/brands/youtube.svg",
    banner: "",
    accent: "#ff0000",
    description:
      "Nikmati YouTube dan YouTube Music tanpa iklan, bisa diputar di background, dan download video untuk ditonton offline. Diaktifkan via undangan family plan ke email kamu sendiri.",
    features: [
      "100% bebas iklan di semua video",
      "Background play & Picture-in-Picture",
      "YouTube Music Premium termasuk",
      "Download video untuk offline",
      "Aktif di email pribadimu sendiri",
    ],
    rating: 4.8,
    sold: 15600,
    status: "active",
    daysAgo: 200,
    variants: [
      {
        name: "Invite Family",
        price: 12000,
        stock: 90,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Diundang ke family plan resmi, langsung aktif.",
        active: true,
      },
      {
        name: "Invite Family",
        price: 33000,
        stock: 55,
        duration: "3 Bulan",
        warranty: "Full Garansi",
        description: "Tiga bulan bebas iklan dengan harga hemat.",
        active: true,
      },
      {
        name: "Invite Family",
        price: 115000,
        stock: 20,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Setahun penuh — setara Rp9.600/bulan.",
        active: true,
      },
    ],
  },
  {
    name: "Disney+ Hotstar",
    slug: "disney-hotstar",
    category: "streaming",
    logo: "/brands/disney.svg",
    banner: "",
    accent: "#113ccf",
    description:
      "Streaming film Disney, Marvel, Star Wars, Pixar, hingga serial lokal favorit dalam satu aplikasi. Pilihan tepat untuk tontonan keluarga dengan kualitas hingga 4K.",
    features: [
      "Katalog Disney, Marvel & Star Wars lengkap",
      "Kualitas streaming hingga 4K",
      "Bisa download untuk nonton offline",
      "Cocok untuk tontonan keluarga",
    ],
    rating: 4.7,
    sold: 7300,
    status: "active",
    daysAgo: 150,
    variants: [
      {
        name: "Sharing",
        price: 25000,
        stock: 70,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "1 profil dalam akun bersama, hemat maksimal.",
        active: true,
      },
      {
        name: "Private",
        price: 55000,
        stock: 25,
        duration: "1 Bulan",
        warranty: "Full Garansi",
        description: "Akun penuh milikmu sendiri.",
        active: true,
      },
      {
        name: "Private",
        price: 150000,
        stock: 10,
        duration: "3 Bulan",
        warranty: "Full Garansi",
        description: "Tiga bulan nonton sepuasnya, lebih hemat.",
        active: true,
      },
    ],
  },
  {
    name: "Canva Pro",
    slug: "canva-pro",
    category: "editing",
    logo: "/brands/canva.svg",
    banner: "",
    accent: "#00c4cc",
    description:
      "Buka seluruh fitur premium Canva: jutaan template, background remover, brand kit, hingga Magic Studio AI. Wajib punya untuk content creator, pelaku UMKM, dan tim desain.",
    features: [
      "100+ juta foto, video & elemen premium",
      "Background remover sekali klik",
      "Magic Studio AI (Magic Write, Magic Edit)",
      "Brand kit & resize desain otomatis",
      "Penyimpanan cloud 1TB",
    ],
    rating: 4.9,
    sold: 21700,
    status: "active",
    daysAgo: 260,
    variants: [
      {
        name: "Member Team",
        price: 10000,
        stock: 200,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Diundang ke tim Canva Pro, aktif di akunmu.",
        active: true,
      },
      {
        name: "Member Team",
        price: 45000,
        stock: 95,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Setahun penuh desain tanpa batas — best seller!",
        active: true,
      },
      {
        name: "Owner Team",
        price: 95000,
        stock: 30,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Kamu jadi owner tim: kontrol penuh + bisa undang member.",
        active: true,
      },
    ],
  },
  {
    name: "CapCut Pro",
    slug: "capcut-pro",
    category: "editing",
    logo: "/brands/capcut.svg",
    banner: "",
    accent: "#0f0f0f",
    description:
      "Edit video jadi lebih profesional dengan fitur Pro: ribuan efek dan transisi premium, ekspor 4K tanpa watermark, auto-caption akurat, dan AI tools untuk kreator konten.",
    features: [
      "Ekspor hingga 4K tanpa watermark",
      "Ribuan efek, filter & transisi premium",
      "Auto-caption multi bahasa",
      "AI tools: retouch, upscale, background remove",
      "Cloud storage untuk project",
    ],
    rating: 4.8,
    sold: 9800,
    status: "active",
    daysAgo: 60,
    variants: [
      {
        name: "Sharing",
        price: 30000,
        stock: 65,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Akun bersama untuk pemakaian ringan.",
        active: true,
      },
      {
        name: "Private",
        price: 65000,
        stock: 28,
        duration: "1 Bulan",
        warranty: "Full Garansi",
        description: "Akun pribadi — project & cloud milikmu sendiri.",
        active: true,
      },
      {
        name: "Private",
        price: 175000,
        stock: 12,
        duration: "3 Bulan",
        warranty: "Full Garansi",
        description: "Tiga bulan ngonten tanpa batas.",
        active: true,
      },
    ],
  },
  {
    name: "Adobe Creative Cloud",
    slug: "adobe-creative-cloud",
    category: "editing",
    logo: "/brands/adobe.svg",
    banner: "",
    accent: "#fa0f00",
    description:
      "Paket lengkap 20+ aplikasi kreatif profesional: Photoshop, Illustrator, Premiere Pro, After Effects, Lightroom, dan lainnya. Termasuk Adobe Firefly AI dan cloud storage 100GB.",
    features: [
      "20+ aplikasi: Photoshop, Illustrator, Premiere Pro",
      "Adobe Firefly AI generative tools",
      "Cloud storage 100GB",
      "Update versi terbaru otomatis",
      "Bisa dipakai di 2 perangkat",
    ],
    rating: 4.8,
    sold: 5400,
    status: "active",
    daysAgo: 180,
    variants: [
      {
        name: "All Apps",
        price: 95000,
        stock: 22,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Semua aplikasi Adobe aktif di email kamu.",
        active: true,
      },
      {
        name: "All Apps",
        price: 260000,
        stock: 10,
        duration: "3 Bulan",
        warranty: "Full Garansi",
        description: "Tiga bulan berkarya dengan tools profesional.",
        active: true,
      },
      {
        name: "All Apps",
        price: 900000,
        stock: 5,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Setahun penuh — pilihan para profesional.",
        active: true,
      },
    ],
  },
  {
    name: "Xbox Game Pass Ultimate",
    slug: "xbox-game-pass",
    category: "gaming",
    logo: "/brands/xbox.svg",
    banner: "",
    accent: "#107c10",
    description:
      "Akses ratusan game berkualitas untuk console, PC, dan cloud gaming — termasuk rilisan day-one dari Xbox Game Studios, EA Play, dan multiplayer online lengkap.",
    features: [
      "Ratusan game console, PC & cloud",
      "Game baru Xbox Studios sejak hari pertama",
      "EA Play termasuk",
      "Xbox Live Gold multiplayer online",
    ],
    rating: 4.7,
    sold: 3200,
    status: "active",
    daysAgo: 25,
    variants: [
      {
        name: "Ultimate",
        price: 55000,
        stock: 35,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Aktif di akun Microsoft milikmu.",
        active: true,
      },
      {
        name: "Ultimate",
        price: 150000,
        stock: 14,
        duration: "3 Bulan",
        warranty: "Full Garansi",
        description: "Tiga bulan gaming tanpa batas.",
        active: true,
      },
    ],
  },
  {
    name: "NordVPN Premium",
    slug: "nordvpn-premium",
    category: "vpn",
    logo: "/brands/nordvpn.svg",
    banner: "",
    accent: "#4687ff",
    description:
      "VPN tercepat dengan 6.000+ server di 60+ negara. Browsing lebih privat, akses konten global, dan perlindungan Threat Protection dari malware maupun tracker.",
    features: [
      "6.000+ server di 60+ negara",
      "Kecepatan tinggi tanpa buffering",
      "Threat Protection anti malware & tracker",
      "No-logs policy teraudit independen",
      "Support Windows, Mac, Android, iOS",
    ],
    rating: 4.8,
    sold: 4100,
    status: "active",
    daysAgo: 75,
    variants: [
      {
        name: "Sharing",
        price: 15000,
        stock: 75,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Akun bersama, cukup untuk 1-2 perangkat.",
        active: true,
      },
      {
        name: "Private",
        price: 40000,
        stock: 30,
        duration: "1 Bulan",
        warranty: "Full Garansi",
        description: "Akun pribadi hingga 10 perangkat.",
        active: true,
      },
      {
        name: "Private",
        price: 320000,
        stock: 8,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Setahun perlindungan penuh, paling hemat.",
        active: true,
      },
    ],
  },
  {
    name: "Google One 2TB",
    slug: "google-one-2tb",
    category: "cloud",
    logo: "/brands/googleone.svg",
    banner: "",
    accent: "#1a73e8",
    description:
      "Perluas penyimpanan Google Drive, Gmail, dan Google Photos hingga 2TB lewat undangan family plan resmi. Data tetap di akun Google milikmu — aman dan privat.",
    features: [
      "Penyimpanan 2TB untuk Drive, Gmail & Photos",
      "Aktif di akun Google pribadimu",
      "Berbagi dengan hingga 5 anggota keluarga",
      "Fitur premium Google Photos",
    ],
    rating: 4.9,
    sold: 2800,
    status: "active",
    daysAgo: 8,
    variants: [
      {
        name: "Invite Family",
        price: 25000,
        stock: 50,
        duration: "1 Bulan",
        warranty: "Garansi 30 Hari",
        description: "Undangan family plan, storage langsung bertambah.",
        active: true,
      },
      {
        name: "Invite Family",
        price: 120000,
        stock: 20,
        duration: "6 Bulan",
        warranty: "Full Garansi",
        description: "Enam bulan lega tanpa notifikasi penuh.",
        active: true,
      },
      {
        name: "Invite Family",
        price: 200000,
        stock: 15,
        duration: "1 Tahun",
        warranty: "Full Garansi",
        description: "Setahun penuh — setara Rp16.600/bulan.",
        active: true,
      },
    ],
  },
];

/* ========================================================================
 * FALLBACK BUILDER — mengubah katalog di atas menjadi DTO siap pakai
 * ====================================================================== */

/** Tanggal basis deterministik agar hasil render konsisten */
const BASE_DATE = Date.UTC(2026, 6, 1);
const DAY_MS = 86_400_000;

function toCreatedAt(daysAgo: number): string {
  return new Date(BASE_DATE - daysAgo * DAY_MS).toISOString();
}

export function fallbackCategories(): CategoryDTO[] {
  return seedCategories.map((c) => ({
    id: c.slug,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    order: c.order,
  }));
}

export function fallbackProducts(): ProductDetail[] {
  const categoryMap = new Map(seedCategories.map((c) => [c.slug, c.name]));

  return seedProducts.map((p) => {
    const variants: VariantDTO[] = p.variants.map((v, index) => ({
      id: `${p.slug}-v${index + 1}`,
      productId: p.slug,
      ...v,
    }));

    const activePrices = variants
      .filter((v) => v.active)
      .map((v) => v.price);

    return {
      id: p.slug,
      name: p.name,
      slug: p.slug,
      category: {
        name: categoryMap.get(p.category) ?? p.category,
        slug: p.category,
      },
      logo: p.logo,
      banner: p.banner,
      accent: p.accent,
      description: p.description,
      features: p.features,
      rating: p.rating,
      sold: p.sold,
      status: p.status,
      createdAt: toCreatedAt(p.daysAgo),
      startingPrice: activePrices.length ? Math.min(...activePrices) : 0,
      variants,
    };
  });
}
