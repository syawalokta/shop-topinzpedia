import type { Metadata } from "next";

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

/** Layout dasar segmen /admin (guard role ada di middleware). */
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
