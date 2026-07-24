"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { resetPasswordAction } from "@/lib/actions/auth-user";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await resetPasswordAction({
        token,
        password,
        confirmPassword: confirm,
      });
      if (result.ok) {
        toast.success("Password berhasil direset!");
        router.push("/login?reset=1");
      } else {
        toast.error(result.error ?? "Gagal mereset password.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password">Password Baru</Label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 karakter"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Ulangi Password Baru</Label>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Ketik ulang password"
        />
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Menyimpan…
          </>
        ) : (
          "Simpan Password Baru"
        )}
      </Button>
    </form>
  );
}
