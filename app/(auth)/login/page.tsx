import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { getSiteSettings } from "@/lib/services/settings";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Masuk ke akun TopinzPedia untuk membeli produk, mengelola saldo, dan melihat riwayat transaksi.",
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ callbackUrl }, user, settings] = await Promise.all([
    searchParams,
    getSessionUser(),
    getSiteSettings(),
  ]);

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  const googleEnabled = settings.googleAuthEnabled && settings.googleConfigured;

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Selamat datang kembali 👋</CardTitle>
          <CardDescription>
            Masuk untuk membeli produk, topup saldo, dan melihat riwayat
            transaksimu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm googleEnabled={googleEnabled} callbackUrl={callbackUrl} />
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
