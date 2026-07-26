"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { registerAction } from "@/lib/actions/auth-user";
import type { PublicCaptcha } from "@/lib/captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  CaptchaField,
  type CaptchaValue,
} from "@/components/shared/captcha-field";

const registerFormSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(60),
    username: z
      .string()
      .regex(
        /^[a-z0-9_]{3,20}$/,
        "Username 3–20 karakter: huruf kecil, angka, underscore"
      ),
    email: z.email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter").max(72),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v, {
      message: "Kamu harus menyetujui Syarat & Ketentuan",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

type RegisterValues = z.infer<typeof registerFormSchema>;

interface RegisterFormProps {
  initialCaptcha: PublicCaptcha;
}

export function RegisterForm({ initialCaptcha }: RegisterFormProps) {
  const router = useRouter();
  const [captcha, setCaptcha] = useState(initialCaptcha);
  const [captchaValue, setCaptchaValue] = useState<CaptchaValue>({
    token: initialCaptcha.math?.token ?? "",
    answer: "",
  });
  const [captchaReset, setCaptchaReset] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { acceptTerms: false },
  });

  async function onSubmit(values: RegisterValues) {
    const result = await registerAction({
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      acceptTerms: values.acceptTerms,
      captchaToken: captchaValue.token,
      captchaAnswer: captchaValue.answer,
    });

    if (!result.ok) {
      toast.error(result.error ?? "Registrasi gagal.");
      if (result.captcha) {
        setCaptcha(result.captcha);
        setCaptchaValue({ token: result.captcha.math?.token ?? "", answer: "" });
        setCaptchaReset((n) => n + 1);
      }
      return;
    }

    if (result.needVerify) {
      toast.success("Akun dibuat! Cek email kamu untuk verifikasi.");
      router.push(`/email-sent?email=${encodeURIComponent(values.email)}`);
    } else {
      toast.success("Akun berhasil dibuat! Silakan login.");
      router.push("/login?registered=1");
    }
  }

  const fieldError = (message?: string) =>
    message ? (
      <p role="alert" className="text-xs font-medium text-destructive">
        {message}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Nama kamu"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {fieldError(errors.name?.message)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            autoComplete="username"
            placeholder="username"
            aria-invalid={Boolean(errors.username)}
            {...register("username")}
          />
          {fieldError(errors.username?.message)}
        </div>
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
          {fieldError(errors.email?.message)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Min. 8 karakter"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {fieldError(errors.password?.message)}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Ulangi Password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Ketik ulang password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          {fieldError(errors.confirmPassword?.message)}
        </div>
      </div>

      <CaptchaField
        config={captcha}
        onChange={setCaptchaValue}
        resetSignal={captchaReset}
      />

      <div className="space-y-1">
        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
            {...register("acceptTerms")}
          />
          <span className="text-muted-foreground">
            Saya menyetujui{" "}
            <Link
              href="/syarat-ketentuan"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              Syarat &amp; Ketentuan
            </Link>{" "}
            serta{" "}
            <Link
              href="/kebijakan-privasi"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              Kebijakan Privasi
            </Link>{" "}
            TopinzPedia.
          </span>
        </label>
        {fieldError(errors.acceptTerms?.message)}
      </div>

      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mendaftarkan…
          </>
        ) : (
          "Daftar"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-primary transition-colors hover:text-secondary"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}
