import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { verifyEmailToken } from "@/lib/services/account";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Verifikasi Email" };

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  let verified = false;
  if (token) {
    try {
      verified = await verifyEmailToken(token);
    } catch (error) {
      console.error("[verify-email] gagal:", error);
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="items-center text-center">
          <span
            className={
              verified
                ? "grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive"
            }
          >
            {verified ? (
              <CheckCircle2 className="size-7" aria-hidden />
            ) : (
              <XCircle className="size-7" aria-hidden />
            )}
          </span>
          <CardTitle className="mt-2 text-xl">
            {verified ? "Email Terverifikasi! 🎉" : "Verifikasi Gagal"}
          </CardTitle>
          <CardDescription>
            {verified
              ? "Akunmu sudah aktif. Silakan login untuk mulai berbelanja produk premium."
              : "Tautan verifikasi tidak valid atau sudah kedaluwarsa (berlaku 24 jam)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {verified ? (
            <Button asChild className="w-full rounded-full">
              <Link href="/login?verified=1">Login Sekarang</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="w-full rounded-full">
                <Link href="/login">Ke Halaman Login</Link>
              </Button>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Gunakan tombol &ldquo;Kirim Ulang Email Verifikasi&rdquo; yang
                muncul saat mencoba login dengan akun belum terverifikasi.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
