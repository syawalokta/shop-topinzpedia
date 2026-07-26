"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, ShieldQuestion } from "lucide-react";

import { refreshCaptchaAction } from "@/lib/actions/auth-user";
import type { PublicCaptcha } from "@/lib/captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CaptchaValue {
  token: string;
  answer: string;
}

interface CaptchaFieldProps {
  config: PublicCaptcha;
  onChange: (value: CaptchaValue) => void;
  /** dinaikkan parent untuk mereset widget (mis. setelah submit gagal) */
  resetSignal?: number;
}

/* ---- Turnstile global typing ---- */
declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "auto" | "light" | "dark";
        }
      ) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Turnstile"));
    document.head.appendChild(script);
  });
  return turnstileScriptPromise;
}

/**
 * Field captcha reusable — otomatis menyesuaikan provider aktif:
 * - "turnstile": widget Cloudflare (token dikirim ke server)
 * - "math": soal matematika ber-HMAC (fallback tanpa layanan eksternal)
 */
export function CaptchaField({
  config,
  onChange,
  resetSignal = 0,
}: CaptchaFieldProps) {
  /* ============================ TURNSTILE ============================ */
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (config.provider !== "turnstile" || !config.siteKey) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        // Bersihkan render sebelumnya bila ada
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            /* abaikan */
          }
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: config.siteKey,
          callback: (token) => onChange({ token, answer: "" }),
          "error-callback": () => onChange({ token: "", answer: "" }),
          "expired-callback": () => onChange({ token: "", answer: "" }),
          theme: "auto",
        });
      })
      .catch(() => {
        /* jaringan gagal — biarkan; server akan menolak token kosong */
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* abaikan */
        }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.provider, config.siteKey, resetSignal]);

  /* ============================== MATH ============================== */
  const [challenge, setChallenge] = useState(config.math);
  const [answer, setAnswer] = useState("");

  // Sinkron bila config berganti (mis. captcha baru dari server)
  useEffect(() => {
    if (config.provider === "math") {
      setChallenge(config.math);
      setAnswer("");
    }
  }, [config]);

  const emitMath = useCallback(
    (nextAnswer: string, token: string) => {
      onChange({ token, answer: nextAnswer });
    },
    [onChange]
  );

  async function refreshMath() {
    const fresh = await refreshCaptchaAction();
    if (fresh.provider === "math" && fresh.math) {
      setChallenge(fresh.math);
      setAnswer("");
      onChange({ token: fresh.math.token, answer: "" });
    }
  }

  if (config.provider === "turnstile") {
    return (
      <div className="space-y-2">
        <Label className="gap-1.5">
          <ShieldQuestion className="size-4 text-primary" aria-hidden />
          Verifikasi keamanan
        </Label>
        <div ref={containerRef} className="min-h-[65px]" />
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border bg-muted/40 p-3.5">
      <Label htmlFor="captcha-answer" className="gap-1.5">
        <ShieldQuestion className="size-4 text-primary" aria-hidden />
        Captcha: berapa hasil {challenge?.question ?? "…"}?
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id="captcha-answer"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Jawaban"
          className="bg-card"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            emitMath(event.target.value, challenge?.token ?? "");
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={refreshMath}
          aria-label="Ganti soal captcha"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
