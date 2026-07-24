import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { generateCaptcha } from "@/lib/captcha";
import { getSiteSettings } from "@/lib/services/settings";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Daftar Akun",
  description:
    "Buat akun TopinzPedia gratis — beli akun premium dengan saldo, dapatkan pengiriman otomatis dan riwayat transaksi lengkap.",
};

export default async function RegisterPage() {
  const [user, settings] = await Promise.all([
    getSessionUser(),
    getSiteSettings(),
  ]);

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  const captcha = generateCaptcha();

  return (
    <div className="w-full max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Buat Akun Baru ✨</CardTitle>
          <CardDescription>
            Gratis dan cepat — langsung dapat wallet untuk belanja produk
            premium dengan pengiriman otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.registrationEnabled ? (
            <RegisterForm initialCaptcha={captcha} />
          ) : (
            <p className="rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
              Registrasi sedang ditutup sementara. Silakan hubungi admin untuk
              informasi lebih lanjut.
            </p>
          )}
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
