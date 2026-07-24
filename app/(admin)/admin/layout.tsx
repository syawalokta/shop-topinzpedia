import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Panel Admin",
    template: "%s — Admin TopinzPedia",
  },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Layout dasar segmen /admin — hanya menambahkan Toaster.
 * Shell sidebar ada di route group (dashboard) agar halaman login
 * tetap tampil bersih tanpa navigasi.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster richColors position="top-center" />
    </>
  );
}
