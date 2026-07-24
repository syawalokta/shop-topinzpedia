import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Headset,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { SITE } from "@/lib/constants";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { isDbConfigured } from "@/lib/db";
import { getPaymentSettings } from "@/lib/services/settings";
import { getOrCreateWallet } from "@/lib/services/wallet";
import { formatCompact } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/products/product-grid";
import { VariantSelector } from "@/components/products/variant-selector";
import { FadeUp } from "@/components/shared/motion";
import { RatingStars } from "@/components/shared/rating-stars";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // notFound() di generateMetadata dieksekusi sebelum streaming dimulai,
  // sehingga browser menerima status HTTP 404 yang sesungguhnya.
  if (!product) notFound();

  const description = product.description.slice(0, 155);

  return {
    title: `${product.name} Murah & Bergaransi`,
    description,
    openGraph: {
      title: `${product.name} — ${SITE.name}`,
      description,
      url: `${SITE.url}/products/${product.slug}`,
    },
    alternates: {
      canonical: `${SITE.url}/products/${product.slug}`,
    },
  };
}

const trustPoints = [
  { icon: Zap, title: "Proses Instan", detail: "Terkirim dalam hitungan menit" },
  { icon: ShieldCheck, title: "Bergaransi", detail: "Selama masa aktif produk" },
  { icon: Headset, title: "Support Cepat", detail: "Admin siaga setiap hari" },
];

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [related, sessionUser, paymentSettings] = await Promise.all([
    getRelatedProducts(product, 4),
    getSessionUser(),
    getPaymentSettings(),
  ]);

  const dbReady = isDbConfigured();
  const walletEnabled = dbReady && paymentSettings.wallet.enabled;
  const balance =
    sessionUser && dbReady
      ? (await getOrCreateWallet(sessionUser.id)).balance
      : null;
  const prices = product.variants
    .filter((v) => v.active)
    .map((v) => v.price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${SITE.url}${product.logo}`,
    brand: { "@type": "Brand", name: product.name.split(" ")[0] },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: Math.max(1, Math.round(product.sold / 10)),
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "IDR",
      lowPrice: prices.length ? Math.min(...prices) : 0,
      highPrice: prices.length ? Math.max(...prices) : 0,
      offerCount: prices.length,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="container-page pb-20 pt-24 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground md:text-sm">
          <li>
            <Link href="/" className="transition-colors hover:text-primary">
              Beranda
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li>
            <Link
              href="/products"
              className="transition-colors hover:text-primary"
            >
              Products
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li aria-current="page" className="font-medium text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Banner produk */}
      <FadeUp className="mt-6">
        <div
          className="relative overflow-hidden rounded-2xl border bg-card shadow-soft"
          style={{
            backgroundImage: `linear-gradient(120deg, ${product.accent}1f 0%, ${product.accent}0a 45%, transparent 75%)`,
          }}
        >
          <Image
            src={product.logo}
            alt=""
            width={220}
            height={220}
            unoptimized
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 size-56 rotate-12 opacity-[0.06] md:size-64"
          />
          <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center md:p-10">
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl border bg-card p-3 shadow-soft md:size-24">
              <Image
                src={product.logo}
                alt={`Logo ${product.name}`}
                width={72}
                height={72}
                unoptimized
                className="size-14 rounded-xl md:size-16"
              />
            </span>
            <div>
              <Badge
                variant="outline"
                className="bg-card/70 text-xs text-muted-foreground"
              >
                {product.category.name}
              </Badge>
              <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight md:text-4xl">
                {product.name}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <RatingStars rating={product.rating} />
                <span className="font-semibold text-foreground">
                  {product.rating}
                </span>
                <span aria-hidden>·</span>
                <span>{formatCompact(product.sold)}+ terjual</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  Bergaransi
                </span>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Konten utama */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
        <FadeUp delay={0.08} className="min-w-0">
          <section aria-labelledby="deskripsi">
            <h2 id="deskripsi" className="font-heading text-lg font-semibold">
              Deskripsi
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
              {product.description}
            </p>
          </section>

          {product.features.length > 0 ? (
            <section aria-labelledby="fitur" className="mt-8">
              <h2 id="fitur" className="font-heading text-lg font-semibold">
                Yang Kamu Dapatkan
              </h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 rounded-xl border bg-card p-3.5 text-sm shadow-soft"
                  >
                    <CheckCircle2
                      className="mt-0.5 size-4.5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Trust strip */}
          <div className="mt-8 grid gap-3 rounded-lg border bg-muted/40 p-4 sm:grid-cols-3 md:p-5">
            {trustPoints.map((point) => (
              <div key={point.title} className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <point.icon className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold md:text-sm">
                    {point.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground md:text-xs">
                    {point.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Panel varian — sticky di desktop */}
        <FadeUp delay={0.16} className="lg:sticky lg:top-24">
          <VariantSelector
            product={product}
            isAuthed={Boolean(sessionUser)}
            balance={balance}
            walletEnabled={walletEnabled}
          />
        </FadeUp>
      </div>

      {/* Produk serupa */}
      {related.length > 0 ? (
        <section aria-labelledby="produk-serupa" className="mt-16 md:mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                id="produk-serupa"
                className="font-heading text-xl font-bold tracking-tight md:text-2xl"
              >
                Produk Serupa
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Produk lain yang sering dilirik pelanggan.
              </p>
            </div>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-secondary"
            >
              Lihat semua
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
