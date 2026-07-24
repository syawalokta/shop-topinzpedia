"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  changePasswordAction,
  updateAvatarAction,
  updateSocialsAction,
} from "@/lib/actions/profile";
import type { ProfileDTO } from "@/lib/services/users";
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
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/shared/image-upload";
import { StatusBadge } from "@/components/shared/status-badge";

/** Kartu profil: info akun (read-only) + avatar. */
export function ProfileCard({ profile }: { profile: ProfileDTO }) {
  const router = useRouter();

  return (
    <section className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
      <h2 className="font-heading text-base font-semibold">Profil</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Info akun kamu. Hubungi admin bila perlu mengubah email/username.
      </p>

      <div className="mt-4">
        <Label className="mb-2 block">Foto Profil</Label>
        <ImageUpload
          kind="avatar"
          value={profile.avatarUrl}
          publicId={profile.avatarPublicId}
          onChange={async (url, pid) => {
            const result = await updateAvatarAction({ url, publicId: pid });
            if (result.ok) router.refresh();
            else toast.error(result.error ?? "Gagal menyimpan avatar.");
          }}
        />
      </div>

      <dl className="mt-5 space-y-2.5 border-t pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Nama</dt>
          <dd className="font-medium">{profile.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Username</dt>
          <dd className="font-medium">@{profile.username}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="break-all font-medium">{profile.email}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Role</dt>
          <dd>
            <StatusBadge status={profile.role} />
          </dd>
        </div>
      </dl>
    </section>
  );
}

/** Form kontak opsional (WhatsApp & Telegram). */
export function SocialsForm({ profile }: { profile: ProfileDTO }) {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState(profile.socials.whatsapp);
  const [telegram, setTelegram] = useState(profile.socials.telegram);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await updateSocialsAction({ whatsapp, telegram });
      if (result.ok) {
        toast.success("Kontak berhasil disimpan.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal menyimpan.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
      <h2 className="font-heading text-base font-semibold">
        Kontak (Opsional)
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Untuk kelengkapan profil — memudahkan admin menghubungimu.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sf-wa">Nomor WhatsApp</Label>
          <Input
            id="sf-wa"
            inputMode="numeric"
            placeholder="mis. 62812345678"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sf-tele">ID / Username Telegram</Label>
          <Input
            id="sf-tele"
            placeholder="mis. @usernamekamu"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" className="rounded-full px-5" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Simpan Kontak
        </Button>
      </form>
    </section>
  );
}

/** Form ubah password dengan dialog persetujuan. */
export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  function requestChange(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak sama.");
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setPending(true);
    try {
      const result = await changePasswordAction({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      if (result.ok) {
        toast.success("Password berhasil diubah.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setConfirmOpen(false);
      } else {
        toast.error(result.error ?? "Gagal mengubah password.");
        setConfirmOpen(false);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
      <h2 className="font-heading text-base font-semibold">Ubah Password</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {hasPassword
          ? "Gunakan password yang kuat dan tidak dipakai di layanan lain."
          : "Akun Google — buat password lewat fitur Lupa Password di halaman login."}
      </p>

      <form onSubmit={requestChange} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cp-old">Password Lama</Label>
          <PasswordInput
            id="cp-old"
            required
            disabled={!hasPassword}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cp-new">Password Baru</Label>
            <PasswordInput
              id="cp-new"
              required
              minLength={8}
              disabled={!hasPassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 karakter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-confirm">Konfirmasi Password Baru</Label>
            <PasswordInput
              id="cp-confirm"
              required
              minLength={8}
              disabled={!hasPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang"
            />
          </div>
        </div>
        <Button
          type="submit"
          size="sm"
          className="rounded-full px-5"
          disabled={!hasPassword || pending}
        >
          <ShieldCheck className="size-4" />
          Ubah Password
        </Button>
      </form>

      {/* Dialog persetujuan */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yakin ubah password?</DialogTitle>
            <DialogDescription>
              Setelah diubah, gunakan password baru untuk login berikutnya.
              Pastikan kamu mengingatnya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Batal
              </Button>
            </DialogClose>
            <Button onClick={handleConfirm} disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              Ya, Ubah Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
