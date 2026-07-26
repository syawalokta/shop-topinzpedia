"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { sendTestEmailAction } from "@/lib/actions/admin-email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Kartu kirim email percobaan ke alamat mana pun (admin-only). */
export function TestEmailCard({ mailConfigured }: { mailConfigured: boolean }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await sendTestEmailAction(email);
      if (result.ok) {
        toast.success(`Email percobaan terkirim ke ${email}.`);
        setEmail("");
      } else {
        toast.error(result.error ?? "Gagal mengirim email.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
      <h2 className="font-heading text-base font-semibold">Tes Kirim Email</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Kirim email percobaan ke alamat mana pun untuk memastikan Resend
        berfungsi.
        {!mailConfigured ? (
          <span className="mt-1 block font-medium text-amber-600 dark:text-amber-400">
            ⚠️ RESEND_API_KEY belum diset — email tidak akan terkirim.
          </span>
        ) : null}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-2">
          <Label htmlFor="test-email">Email Tujuan</Label>
          <Input
            id="test-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tujuan@email.com"
          />
        </div>
        <Button
          type="submit"
          className="rounded-full px-6"
          disabled={pending || !mailConfigured}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mengirim…
            </>
          ) : (
            <>
              <Send className="size-4" />
              Kirim Tes
            </>
          )}
        </Button>
      </form>
    </section>
  );
}
