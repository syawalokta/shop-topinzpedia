import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/authz";
import { UserSidebar, UserTopbar } from "@/components/dashboard/user-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s — Dashboard TopinzPedia",
  },
  robots: { index: false, follow: false },
};

/** Halaman dashboard selalu dinamis (data saldo & transaksi realtime). */
export const dynamic = "force-dynamic";

export default async function UserDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const info = { name: user.name || user.username, role: user.role };

  return (
    <div className="min-h-svh overflow-x-clip bg-background lg:pl-60">
      <UserSidebar user={info} />
      <UserTopbar user={info} />
      <main className="mx-auto w-full min-w-0 max-w-5xl p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
