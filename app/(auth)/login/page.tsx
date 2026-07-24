import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

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
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ callbackUrl, registered }, user, settings] = await Promise.all([
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
      {registered ? (
        <div
          role="status"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm leading-relaxed text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          Akun berhasil dibuat! Silakan login dengan email/username dan
          password yang barusan kamu daftarkan.
        </div>
      ) : null}
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
