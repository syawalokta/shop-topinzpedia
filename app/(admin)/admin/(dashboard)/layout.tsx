import { AdminSidebar, AdminTopbar } from "@/components/admin/sidebar";

/** Halaman admin selalu dirender dinamis agar data CRUD selalu segar. */
export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-svh bg-background lg:pl-60">
      <AdminSidebar />
      <AdminTopbar />
      <main className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</main>
    </div>
  );
}
