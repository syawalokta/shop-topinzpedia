"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailWarning } from "lucide-react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  getPostLoginPath,
  resendVerificationAction,
} from "@/lib/actions/auth-user";
import type { PublicCaptcha } from "@/lib/captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import {
  CaptchaField,
  type CaptchaValue,
} from "@/components/shared/captcha-field";

const loginSchema = z.object({
  identifier: z.string().min(3, "Isi email atau username"),
  password: z.string().min(1, "Isi password"),
});

type LoginValues = z.infer<typeof loginSchema>;

const ERROR_MESSAGES: Record<string, string> = {
  captcha: "Verifikasi captcha gagal. Coba lagi.",
  locked:
    "Terlalu banyak percobaan gagal. Akun dikunci sementara — coba lagi dalam 5 menit.",
  invalid: "Email/username atau password salah.",
};

interface LoginFormProps {
  googleEnabled: boolean;
  callbackUrl?: string;
  captcha: PublicCaptcha;
}

export function LoginForm({
  googleEnabled,
  callbackUrl,
  captcha,
}: LoginFormProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<CaptchaValue>({
    token: captcha.math?.token ?? "",
    answer: "",
  });
  const [captchaReset, setCaptchaReset] = useState(0);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const target =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setUnverified(false);
    const result = await signIn("credentials", {
      identifier: values.identifier,
      password: values.password,
      captchaToken: captchaValue.token,
      captchaAnswer: captchaValue.answer,
      redirect: false,
    });

    if (result?.error) {
      const code = (result as { code?: string }).code ?? "invalid";
      if (code === "unverified") {
        setUnverified(true);
        toast.error(
          "Akun ini belum diverifikasi. Silakan cek email verifikasi untuk login ke dashboard."
        );
      } else {
        toast.error(
          result.error === "Configuration"
            ? "Konfigurasi auth server belum lengkap (cek AUTH_SECRET di environment)."
            : (ERROR_MESSAGES[code] ?? ERROR_MESSAGES.invalid)
        );
      }
      setCaptchaReset((n) => n + 1);
      setCaptchaValue({ token: "", answer: "" });
      return;
    }

    toast.success("Berhasil masuk. Selamat datang kembali!");
    // Bila ada callbackUrl eksplisit, hormati; jika tidak, arahkan
    // sesuai role (admin -> /admin, user -> /dashboard).
    let destination = target;
    if (!callbackUrl) {
      try {
        destination = await getPostLoginPath();
      } catch {
        destination = "/dashboard";
      }
    }
    // Navigasi penuh agar cookie sesi pasti terbaca middleware
    window.location.assign(destination);
  }

  async function handleResend() {
    const identifier = getValues("identifier");
    if (!identifier) {
      toast.error("Isi email/username dulu di form.");
      return;
    }
    setResending(true);
    try {
      const result = await resendVerificationAction(identifier);
      (result.ok ? toast.success : toast.error)(result.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-4">
      {unverified ? (
        <div
          role="alert"
          className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-700 dark:text-amber-400"
        >
          <p className="flex items-start gap-2">
            <MailWarning className="mt-0.5 size-4 shrink-0" aria-hidden />
            Akun ini belum diverifikasi. Silakan cek email verifikasi (termasuk
            folder spam) untuk bisa login ke dashboard.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 rounded-full bg-card text-xs"
            disabled={resending}
            onClick={handleResend}
          >
            {resending ? <Loader2 className="size-3 animate-spin" /> : null}
            Kirim Ulang Email Verifikasi
          </Button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="identifier">Email atau Username</Label>
          <Input
            id="identifier"
            autoComplete="username"
            placeholder="kamu@email.com"
            aria-invalid={Boolean(errors.identifier)}
            {...register("identifier")}
          />
          {errors.identifier ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {errors.identifier.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary transition-colors hover:text-secondary"
            >
              Lupa password?
            </Link>
          </div>
          <PasswordInput
            id="password"
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

        <CaptchaField
          config={captcha}
          onChange={setCaptchaValue}
          resetSignal={captchaReset}
        />

        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Memeriksa…
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      {googleEnabled ? (
        <>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">atau</span>
            <Separator className="flex-1" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            disabled={googleLoading}
            onClick={() => {
              setGoogleLoading(true);
              void signIn("google", { callbackUrl: target });
            }}
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.1 0-5.8-2.1-6.7-5l-3.9 3C3.4 21.3 7.4 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-3.9-3C.5 8.2 0 10 0 12s.5 3.8 1.4 5.4l3.9-3z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C16.9 1 14.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l3.9 3c.9-2.8 3.6-4.9 6.7-4.9z"
                />
              </svg>
            )}
            Masuk dengan Google
          </Button>
        </>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-primary transition-colors hover:text-secondary"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
