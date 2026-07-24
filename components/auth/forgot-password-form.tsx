"use client";

import { useState } from "react";
import { Loader2, RotateCcw, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";

import {
  forgotPasswordAction,
  refreshCaptchaAction,
} from "@/lib/actions/auth-user";
import type { CaptchaChallenge } from "@/lib/captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm({
  initialCaptcha,
}: {
  initialCaptcha: CaptchaChallenge;
}) {
  const [captcha, setCaptcha] = useState(initialCaptcha);
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function refreshCaptcha() {
    setCaptcha(await refreshCaptchaAction());
    setAnswer("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await forgotPasswordAction({
        email,
        captchaToken: captcha.token,
        captchaAnswer: answer,
      });
      if (result.ok) {
        setSent(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
        if (result.captcha) {
          setCaptcha(result.captcha);
          setAnswer("");
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

      <div className="space-y-2 rounded-xl border bg-muted/40 p-3.5">
        <Label htmlFor="forgot-captcha" className="gap-1.5">
          <ShieldQuestion className="size-4 text-primary" aria-hidden />
          Captcha: berapa hasil {captcha.question}?
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="forgot-captcha"
            inputMode="numeric"
            required
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Jawaban"
            className="bg-card"
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
      </div>

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
