"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

const orderSteps = [
  { label: "Pembayaran diterima", detail: "QRIS · otomatis" },
  { label: "Akun disiapkan sistem", detail: "±30 detik" },
  { label: "Produk terkirim", detail: "< 5 menit" },
];

/** Mockup kartu pesanan pada hero — memberi gambaran alur belanja. */
export function HeroMockup() {
  const reduceMotion = useReducedMotion();

  const float = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          animate: { y: [0, -10, 0] },
          transition: {
            duration: 5.5,
            delay,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: reduceMotion ? 1 : 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
      className="relative mx-auto w-full max-w-md lg:max-w-lg"
    >
      {/* Kartu bayangan di belakang */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-4 rotate-2 rounded-2xl border border-primary/10 bg-primary/5"
      />

      {/* Kartu utama */}
      <div className="relative rounded-2xl border bg-card/95 p-5 shadow-card backdrop-blur md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Zap className="size-4" fill="currentColor" strokeWidth={0} />
            </span>
            <div>
              <p className="font-heading text-sm font-semibold leading-tight">
                TopinzPedia Store
              </p>
              <p className="text-xs text-muted-foreground">Order #INV-8127</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>

        {/* Item pesanan */}
        <div className="mt-5 flex items-center gap-3 rounded-xl border bg-muted/50 p-3.5">
          <Image
            src="/brands/chatgpt.svg"
            alt=""
            width={44}
            height={44}
            unoptimized
            className="size-11 rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">ChatGPT Plus</p>
            <p className="text-xs text-muted-foreground">Private · 1 Bulan</p>
          </div>
          <p className="font-heading text-sm font-bold text-primary">
            Rp95.000
          </p>
        </div>

        {/* Status pengiriman */}
        <ul className="mt-5 space-y-3">
          {orderSteps.map((step, index) => (
            <motion.li
              key={step.label}
              initial={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.35, duration: 0.45, ease: EASE }}
              className="flex items-center gap-3"
            >
              <CheckCircle2 className="size-4.5 shrink-0 text-emerald-500" />
              <span className="flex-1 text-sm">{step.label}</span>
              <span className="text-xs text-muted-foreground">
                {step.detail}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* Metode pembayaran */}
        <div className="mt-5 flex items-center gap-2 border-t pt-4">
          <span className="text-xs text-muted-foreground">Pembayaran:</span>
          <ul className="flex flex-wrap gap-1.5">
            {["QRIS", "DANA", "OVO", "GoPay"].map((method) => (
              <li
                key={method}
                className="rounded-md border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Badge mengambang: instant delivery */}
      <motion.div
        {...float(0.4)}
        className="absolute -right-3 -top-7 flex items-center gap-2.5 rounded-xl border bg-card p-3 shadow-card sm:-right-6"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Zap className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold leading-tight">
            Instant Delivery
          </p>
          <p className="text-[11px] text-muted-foreground">Otomatis 24/7</p>
        </div>
      </motion.div>

      {/* Badge mengambang: garansi */}
      <motion.div
        {...float(1.6)}
        className="absolute -bottom-6 -left-3 flex items-center gap-2.5 rounded-xl border bg-card p-3 shadow-card sm:-left-6"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <p className="text-xs font-semibold leading-tight">Garansi Aktif</p>
          <p className="text-[11px] text-muted-foreground">
            Selama masa berlangganan
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
