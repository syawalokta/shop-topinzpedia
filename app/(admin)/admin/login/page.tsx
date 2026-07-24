import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/login-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login Admin",
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="absolute -top-32 right-1/4 -z-10 size-[420px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/4 -z-10 size-[380px] rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="mb-8 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-soft">
          <Zap className="size-4.5" fill="currentColor" strokeWidth={0} />
        </span>
        <span className="font-heading text-xl font-bold tracking-tight">
          Topinz<span className="text-primary">Pedia</span>
        </span>
        <Badge variant="secondary">Admin</Badge>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Panel Admin</CardTitle>
          <CardDescription>
            Masukkan kunci admin untuk mengelola produk, varian, dan kategori.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Kembali ke situs
        </Link>
      </div>
    </div>
  );
}
