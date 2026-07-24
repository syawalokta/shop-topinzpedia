"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  identifier: z.string().min(3, "Isi email atau username"),
  password: z.string().min(1, "Isi password"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  googleEnabled: boolean;
  callbackUrl?: string;
}

export function LoginForm({ googleEnabled, callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    const result = await signIn("credentials", {
      identifier: values.identifier,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Email/username atau password salah.");
      return;
    }

    toast.success("Berhasil masuk. Selamat datang kembali!");
    router.push(target);
    router.refresh();
  }

  return (
    <div className="space-y-4">
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
