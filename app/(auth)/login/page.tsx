import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MailCheck,
  XCircle,
} from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { getPublicCaptcha } from "@/lib/captcha";
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
  searchParams: Promise<{
    callbackUrl?: string;
    registered?: string;
    verify?: string;
    verified?: string;
    verifyError?: string;
    reset?: string;
  }>;
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: "success" | "error";
  icon: typeof CheckCircle2;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={
        tone === "success"
          ? "mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm leading-relaxed text-emerald-700 dark:text-emerald-400"
          : "mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm leading-relaxed text-destructive"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, user, settings] = await Promise.all([
    searchParams,
    getSessionUser(),
    getSiteSettings(),
  ]);

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  const googleEnabled = settings.googleAuthEnabled && settings.googleConfigured;
  const captcha = await getPublicCaptcha();

  return (
    <div className="w-full max-w-md">
      {params.registered && params.verify ? (
        <Banner tone="success" icon={MailCheck}>
          Akun berhasil dibuat! Kami sudah mengirim <strong>email
          verifikasi</strong> — klik tautan di dalamnya dulu, baru login di
          sini. (Cek juga folder spam.)
        </Banner>
      ) : params.registered ? (
        <Banner tone="success" icon={CheckCircle2}>
          Akun berhasil dibuat! Silakan login dengan email/username dan
          password yang barusan kamu daftarkan.
        </Banner>
      ) : null}

      {params.verified ? (
        <Banner tone="success" icon={CheckCircle2}>
          Email berhasil diverifikasi! Sekarang kamu bisa login ke dashboard.
        </Banner>
      ) : null}

      {params.verifyError ? (
        <Banner tone="error" icon={XCircle}>
          Tautan verifikasi tidak valid atau sudah kedaluwarsa. Login lalu
          gunakan tombol &ldquo;Kirim Ulang Email Verifikasi&rdquo;.
        </Banner>
      ) : null}

      {params.reset ? (
        <Banner tone="success" icon={CheckCircle2}>
          Password berhasil direset! Silakan login dengan password barumu.
        </Banner>
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
          <LoginForm
            googleEnabled={googleEnabled}
            callbackUrl={params.callbackUrl}
            captcha={captcha}
          />
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
