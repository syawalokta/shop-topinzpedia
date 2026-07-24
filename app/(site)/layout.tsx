import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

/**
 * Layout untuk seluruh halaman publik (landing, katalog, detail produk).
 * Route group terpisah agar mudah menambah group lain di masa depan,
 * mis. (admin) dengan layout dashboard sendiri.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
