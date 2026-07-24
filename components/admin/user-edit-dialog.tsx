"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { adminUpdateUserAction } from "@/lib/actions/users";
import type { UserRowDTO } from "@/lib/services/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Dialog admin: edit profil, email, password, dan saldo user. */
export function UserEditDialog({ user }: { user: UserRowDTO }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    password: "",
    balance: String(user.balance),
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: user.name,
        username: user.username,
        email: user.email,
        password: "",
        balance: String(user.balance),
      });
    }
  }, [open, user]);

  function patch(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await adminUpdateUserAction(user.id, {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        balance: Number(form.balance),
      });
      if (result.ok) {
        toast.success(`Data ${form.name} berhasil diperbarui.`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Terjadi kesalahan.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Edit ${user.name}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User — {user.name}</DialogTitle>
          <DialogDescription>
            Ubah profil, email, password, atau saldo. Perubahan saldo tercatat
            di riwayat wallet user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ue-name">Nama</Label>
              <Input
                id="ue-name"
                required
                value={form.name}
                onChange={(e) => patch("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ue-username">Username</Label>
              <Input
                id="ue-username"
                required
                value={form.username}
                onChange={(e) => patch("username", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ue-email">Email</Label>
            <Input
              id="ue-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ue-password">Password Baru</Label>
              <PasswordInput
                id="ue-password"
                placeholder="Kosongkan bila tetap"
                value={form.password}
                onChange={(e) => patch("password", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ue-balance">Saldo (Rp)</Label>
              <Input
                id="ue-balance"
                type="number"
                min={0}
                required
                value={form.balance}
                onChange={(e) => patch("balance", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
