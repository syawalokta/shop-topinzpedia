"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

/**
 * Form login dengan React Hook Form + Zod.
 * Autentikasi sesungguhnya akan dihubungkan pada fase berikutnya
 * (NextAuth/Auth.js) — saat ini menampilkan status "segera hadir".
 */
export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit() {
    // Simulasi request — integrasi auth menyusul di fase berikutnya
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="kamu@email.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Memproses…
          </>
        ) : (
          "Masuk"
        )}
      </Button>

      {submitted ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs leading-relaxed text-primary"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Fitur login & dashboard pelanggan segera hadir! Untuk saat ini,
            silakan order langsung melalui katalog produk atau WhatsApp admin.
          </span>
        </div>
      ) : null}
    </form>
  );
}
