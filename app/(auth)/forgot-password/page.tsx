import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getPublicCaptcha } from "@/lib/captcha";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Lupa Password",
};

export default async function ForgotPasswordPage() {
  const captcha = await getPublicCaptcha();
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Lupa Password? 🔑</CardTitle>
          <CardDescription>
            Masukkan email terdaftar — kami kirimkan tautan untuk membuat
            password baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm initialCaptcha={captcha} />
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
