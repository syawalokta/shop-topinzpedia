"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { createTopupAction } from "@/lib/actions/topups";
import type { PaymentSettingsDTO } from "@/lib/services/settings";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000];

interface TopupFormProps {
  settings: PaymentSettingsDTO;
}

/** Form pengajuan topup manual + upload bukti transfer. */
export function TopupForm({ settings }: TopupFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(
    settings.manualTransfer.enabled ? "manual_transfer" : "qris"
  );
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const methods = [
    ...(settings.manualTransfer.enabled
      ? [{ value: "manual_transfer", label: "Transfer Bank (Manual)" }]
      : []),
    ...(settings.qris.enabled ? [{ value: "qris", label: "QRIS" }] : []),
  ];

  if (methods.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
        Belum ada metode topup yang aktif. Silakan hubungi admin.
      </p>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("method", method);
      const result = await createTopupAction(formData);

      if (result.ok) {
        toast.success(
          "Pengajuan topup terkirim! Saldo masuk setelah disetujui admin."
        );
        formRef.current?.reset();
        setAmount("");
        setFileName("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal mengajukan topup.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Nominal Topup</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={10000}
          step={1000}
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Minimal Rp10.000"
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => setAmount(String(quick))}
              className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {formatIDR(quick)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Metode Pembayaran</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger id="method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {methods.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proof">Bukti Transfer</Label>
        <label
          htmlFor="proof"
          className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed bg-muted/30 p-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <Upload className="size-4 shrink-0" aria-hidden />
          {fileName || "Pilih gambar bukti transfer (PNG/JPG, maks. 2MB)"}
        </label>
        <input
          id="proof"
          name="proof"
          type="file"
          required
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) =>
            setFileName(event.target.files?.[0]?.name ?? "")
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Catatan (opsional)</Label>
        <Textarea
          id="note"
          name="note"
          rows={2}
          maxLength={200}
          placeholder="mis. transfer dari rekening a.n. Budi"
        />
      </div>

      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mengirim…
          </>
        ) : (
          "Ajukan Topup"
        )}
      </Button>
    </form>
  );
}
