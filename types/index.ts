/** Status publikasi produk */
export type ProductStatus = "active" | "inactive";

/** Kunci pengurutan katalog */
export type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

/** Parameter pencarian/filter katalog produk */
export interface CatalogQuery {
  q?: string;
  category?: string;
  sort?: SortKey;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  /** Jumlah produk aktif dalam kategori (opsional, untuk landing page) */
  productCount?: number;
}

export interface VariantDTO {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  duration: string;
  warranty: string;
  description: string;
  active: boolean;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
  logo: string;
  banner: string;
  /** Warna aksen brand (hex) untuk banner & dekorasi */
  accent: string;
  description: string;
  features: string[];
  rating: number;
  sold: number;
  status: ProductStatus;
  createdAt: string;
  /** Harga varian termurah — "Harga mulai dari" */
  startingPrice: number;
}

/** Produk lengkap dengan seluruh variannya (halaman detail) */
export interface ProductDetail extends ProductDTO {
  variants: VariantDTO[];
}
