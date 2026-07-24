"use client";

import { useActionState } from "react";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";

import { loginAdmin, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAdmin,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="key">Kunci Admin</Label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="key"
            name="key"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Masukkan ADMIN_KEY"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Kunci diatur lewat variabel <code className="font-mono">ADMIN_KEY</code> di
          environment server.
        </p>
      </div>

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </div>
      ) : null}

      <Button type="submit" className="w-full rounded-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Memeriksa…
          </>
        ) : (
          "Masuk ke Panel Admin"
        )}
      </Button>
    </form>
  );
}
