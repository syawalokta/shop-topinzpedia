"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";

import { setUserRoleAction } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRoleDialogProps {
  user: { id: string; name: string; role: string };
}

/** Dialog admin untuk mengubah role user. */
export function UserRoleDialog({ user }: UserRoleDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(user.role);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await setUserRoleAction(user.id, role);
      if (result.ok) {
        toast.success(`Role ${user.name} diubah menjadi ${role}.`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Terjadi kesalahan.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setRole(user.role);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Ubah role ${user.name}`}
        >
          <UserCog className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Role — {user.name}</DialogTitle>
          <DialogDescription>
            Admin punya akses penuh panel. Buyer adalah user yang pernah
            membeli (otomatis), tapi bisa diubah manual di sini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="role-select">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User — pelanggan biasa</SelectItem>
              <SelectItem value="buyer">Buyer — pernah membeli</SelectItem>
              <SelectItem value="admin">Admin — akses penuh</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Batal
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={pending || role === user.role}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              "Simpan Role"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
