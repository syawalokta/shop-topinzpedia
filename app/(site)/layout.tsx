import { getSessionUser } from "@/lib/authz";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

/**
 * Layout untuk seluruh halaman publik (landing, katalog, detail produk).
 * Navbar menerima info sesi agar tombol Login/Dashboard menyesuaikan.
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar
        user={user ? { name: user.name, role: user.role } : null}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
