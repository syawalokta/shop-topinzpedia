import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    "Masuk ke akun TopinzPedia untuk melihat riwayat transaksi dan mengelola pesananmu.",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Selamat datang kembali 👋</CardTitle>
          <CardDescription>
            Masuk untuk melihat riwayat transaksi dan mengelola pesananmu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <span className="font-medium text-foreground">
              Registrasi segera hadir
            </span>
          </p>
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
