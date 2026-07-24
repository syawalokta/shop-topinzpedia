"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, ShieldQuestion } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  refreshCaptchaAction,
  registerAction,
} from "@/lib/actions/auth-user";
import type { CaptchaChallenge } from "@/lib/captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

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
    captchaAnswer: z.string().min(1, "Jawab captcha terlebih dahulu"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

type RegisterValues = z.infer<typeof registerFormSchema>;

interface RegisterFormProps {
  initialCaptcha: CaptchaChallenge;
}

export function RegisterForm({ initialCaptcha }: RegisterFormProps) {
  const router = useRouter();
  const [captcha, setCaptcha] = useState(initialCaptcha);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { acceptTerms: false, captchaAnswer: "" },
  });

  async function refreshCaptcha() {
    setCaptcha(await refreshCaptchaAction());
    setValue("captchaAnswer", "");
  }

  async function onSubmit(values: RegisterValues) {
    const result = await registerAction({
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      acceptTerms: values.acceptTerms,
      captchaToken: captcha.token,
      captchaAnswer: values.captchaAnswer,
    });

    if (!result.ok) {
      toast.error(result.error ?? "Registrasi gagal.");
      if (result.captcha) {
        setCaptcha(result.captcha);
        setValue("captchaAnswer", "");
      }
      return;
    }

    // Tanpa auto-login — arahkan ke halaman login agar user masuk manual.
    if (result.needVerify) {
      toast.success("Akun dibuat! Cek email kamu untuk verifikasi.");
      router.push("/login?registered=1&verify=1");
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

      {/* Captcha sederhana — anti-bot tanpa layanan eksternal */}
      <div className="space-y-2 rounded-xl border bg-muted/40 p-3.5">
        <Label htmlFor="captchaAnswer" className="gap-1.5">
          <ShieldQuestion className="size-4 text-primary" aria-hidden />
          Captcha: berapa hasil {captcha.question}?
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="captchaAnswer"
            inputMode="numeric"
            placeholder="Jawaban"
            className="bg-card"
            aria-invalid={Boolean(errors.captchaAnswer)}
            {...register("captchaAnswer")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={refreshCaptcha}
            aria-label="Ganti soal captcha"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
        {fieldError(errors.captchaAnswer?.message)}
      </div>

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
