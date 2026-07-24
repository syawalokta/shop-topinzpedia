import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";

import { isResetTokenValid } from "@/lib/services/account";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reset Password",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const valid = token ? await isResetTokenValid(token) : false;

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Buat Password Baru 🔒</CardTitle>
          <CardDescription>
            {valid
              ? "Masukkan password baru untuk akunmu."
              : "Tautan reset tidak valid."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {valid && token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="space-y-4">
              <p
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm leading-relaxed text-destructive"
              >
                <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                Tautan reset password tidak valid atau sudah kedaluwarsa
                (berlaku 30 menit). Silakan minta tautan baru.
              </p>
              <Button asChild className="w-full rounded-full">
                <Link href="/forgot-password">Minta Tautan Baru</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke login
        </Link>
      </div>
    </div>
  );
}
