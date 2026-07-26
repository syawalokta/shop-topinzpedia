"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordAction } from "@/lib/actions/auth-user";
import type { PublicCaptcha } from "@/lib/captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CaptchaField,
  type CaptchaValue,
} from "@/components/shared/captcha-field";

export function ForgotPasswordForm({
  initialCaptcha,
}: {
  initialCaptcha: PublicCaptcha;
}) {
  const [captcha, setCaptcha] = useState(initialCaptcha);
  const [captchaValue, setCaptchaValue] = useState<CaptchaValue>({
    token: initialCaptcha.math?.token ?? "",
    answer: "",
  });
  const [captchaReset, setCaptchaReset] = useState(0);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await forgotPasswordAction({
        email,
        captchaToken: captchaValue.token,
        captchaAnswer: captchaValue.answer,
      });
      if (result.ok) {
        setSent(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
        if (result.captcha) {
          setCaptcha(result.captcha);
          setCaptchaValue({
            token: result.captcha.math?.token ?? "",
            answer: "",
          });
          setCaptchaReset((n) => n + 1);
        }
      }
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p
        role="status"
        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-relaxed text-emerald-700 dark:text-emerald-400"
      >
        Bila email terdaftar, tautan reset password sudah kami kirim (berlaku
        30 menit). Cek inbox atau folder spam kamu.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email Terdaftar</Label>
        <Input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="kamu@email.com"
        />
      </div>

      <CaptchaField
        config={captcha}
        onChange={setCaptchaValue}
        resetSignal={captchaReset}
      />

      <Button type="submit" className="w-full rounded-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mengirim…
          </>
        ) : (
          "Kirim Tautan Reset"
        )}
      </Button>
    </form>
  );
}
