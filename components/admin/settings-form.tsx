"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateSettingsAction } from "@/lib/actions/settings";
import type {
  PaymentSettingsDTO,
  SiteSettingsDTO,
} from "@/lib/services/settings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";

interface SettingsFormProps {
  payment: PaymentSettingsDTO;
  site: SiteSettingsDTO;
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition-colors",
        checked ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
      />
    </label>
  );
}

/** Form pengaturan pembayaran & autentikasi (panel admin). */
export function SettingsForm({ payment, site }: SettingsFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const [walletEnabled, setWalletEnabled] = useState(payment.wallet.enabled);
  const [mtEnabled, setMtEnabled] = useState(payment.manualTransfer.enabled);
  const [bankName, setBankName] = useState(payment.manualTransfer.bankName);
  const [accountNumber, setAccountNumber] = useState(
    payment.manualTransfer.accountNumber
  );
  const [accountName, setAccountName] = useState(
    payment.manualTransfer.accountName
  );
  const [qrisEnabled, setQrisEnabled] = useState(payment.qris.enabled);
  const [qrisImage, setQrisImage] = useState(payment.qris.qrImage);
  const [qrisPublicId, setQrisPublicId] = useState(payment.qris.qrisPublicId);
  const [landingUrl, setLandingUrl] = useState(site.landingBanner.url);
  const [landingPublicId, setLandingPublicId] = useState(
    site.landingBanner.publicId
  );
  const [googleEnabled, setGoogleEnabled] = useState(site.googleAuthEnabled);
  const [registrationEnabled, setRegistrationEnabled] = useState(
    site.registrationEnabled
  );
  const [verifyEnabled, setVerifyEnabled] = useState(
    site.emailVerificationEnabled
  );
  const [captchaProvider, setCaptchaProvider] = useState(
    site.captcha.provider
  );
  const [turnstileSiteKey, setTurnstileSiteKey] = useState(
    site.captcha.turnstileSiteKey
  );
  const [turnstileSecretKey, setTurnstileSecretKey] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await updateSettingsAction({
        walletEnabled,
        manualTransferEnabled: mtEnabled,
        bankName,
        accountNumber,
        accountName,
        qrisEnabled,
        qrisImage,
        qrisPublicId,
        googleAuthEnabled: googleEnabled,
        registrationEnabled,
        emailVerificationEnabled: verifyEnabled,
        landingBannerUrl: landingUrl,
        landingBannerPublicId: landingPublicId,
        captchaProvider,
        turnstileSiteKey,
        turnstileSecretKey,
      });

      if (result.ok) {
        toast.success("Pengaturan berhasil disimpan.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal menyimpan pengaturan.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Metode pembayaran */}
      <section className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
        <h2 className="font-heading text-base font-semibold">
          Metode Pembayaran
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Aktif/nonaktifkan metode tanpa mengubah kode. Gateway (Midtrans,
          Tripay, Duitku) tinggal ditambahkan di sini nanti.
        </p>

        <div className="mt-4 space-y-3">
          <ToggleRow
            label="Wallet (Saldo)"
            description="Pembayaran utama — checkout memotong saldo user secara otomatis."
            checked={walletEnabled}
            onChange={setWalletEnabled}
          />

          <ToggleRow
            label="Transfer Bank Manual"
            description="User transfer manual lalu upload bukti untuk topup saldo."
            checked={mtEnabled}
            onChange={setMtEnabled}
          />
          {mtEnabled ? (
            <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bankName">Nama Bank</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="BCA"
                  className="bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Nomor Rekening</Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className="bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Atas Nama</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="TopinzPedia"
                  className="bg-card"
                />
              </div>
            </div>
          ) : null}

          <ToggleRow
            label="QRIS"
            description="Tampilkan QR statis pada halaman topup."
            checked={qrisEnabled}
            onChange={setQrisEnabled}
          />
          {qrisEnabled ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <Label className="mb-2 block">QR Image</Label>
              <ImageUpload
                kind="qris"
                value={qrisImage}
                publicId={qrisPublicId}
                onChange={(url, pid) => {
                  setQrisImage(url);
                  setQrisPublicId(pid);
                }}
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* Autentikasi */}
      <section className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
        <h2 className="font-heading text-base font-semibold">Autentikasi</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Kontrol registrasi dan login Google.
        </p>

        <div className="mt-4 space-y-3">
          <ToggleRow
            label="Registrasi Terbuka"
            description="Bila dimatikan, halaman daftar ditutup sementara."
            checked={registrationEnabled}
            onChange={setRegistrationEnabled}
          />
          <ToggleRow
            label="Wajib Verifikasi Email"
            description={
              site.mailConfigured
                ? "User baru harus klik tautan di email sebelum bisa login. Admin selalu dikecualikan."
                : "Butuh RESEND_API_KEY di environment server terlebih dahulu. Selama nonaktif, user baru langsung bisa login."
            }
            checked={verifyEnabled}
            onChange={setVerifyEnabled}
            disabled={!site.mailConfigured}
          />
          <ToggleRow
            label="Login dengan Google"
            description={
              site.googleConfigured
                ? "Tampilkan tombol Google di halaman login."
                : "Butuh env GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET terpasang di server terlebih dahulu."
            }
            checked={googleEnabled}
            onChange={setGoogleEnabled}
            disabled={!site.googleConfigured}
          />
        </div>
      </section>

      {/* Captcha / Keamanan */}
      <section className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
        <h2 className="font-heading text-base font-semibold">
          Captcha (Anti-Bot)
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pilih Math (bawaan, tanpa setup) atau Cloudflare Turnstile (lebih
          kuat). Turnstile butuh Site Key & Secret Key dari dashboard
          Cloudflare.
        </p>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="captcha-provider">Provider Captcha</Label>
            <Select
              value={captchaProvider}
              onValueChange={(v) =>
                setCaptchaProvider(v as "math" | "turnstile")
              }
            >
              <SelectTrigger id="captcha-provider" className="sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="math">Math (bawaan)</SelectItem>
                <SelectItem value="turnstile">Cloudflare Turnstile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {captchaProvider === "turnstile" ? (
            <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ts-site">Site Key</Label>
                <Input
                  id="ts-site"
                  value={turnstileSiteKey}
                  onChange={(e) => setTurnstileSiteKey(e.target.value)}
                  placeholder="0x4AAAAAAA..."
                  className="bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ts-secret">Secret Key</Label>
                <PasswordInput
                  id="ts-secret"
                  value={turnstileSecretKey}
                  onChange={(e) => setTurnstileSecretKey(e.target.value)}
                  placeholder={
                    site.captcha.turnstileConfigured
                      ? "••••••• (tersimpan — isi untuk mengganti)"
                      : "0x4AAAAAAA..."
                  }
                  className="bg-card"
                />
                <p className="text-xs text-muted-foreground">
                  Secret Key disimpan aman & tidak pernah ditampilkan kembali.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Landing page */}
      <section className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
        <h2 className="font-heading text-base font-semibold">Landing Page</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Banner promo opsional — tampil di bawah hero landing page bila diisi.
        </p>
        <div className="mt-4 rounded-xl border bg-muted/30 p-4">
          <Label className="mb-2 block">Banner Landing</Label>
          <ImageUpload
            kind="landing"
            value={landingUrl}
            publicId={landingPublicId}
            onChange={(url, pid) => {
              setLandingUrl(url);
              setLandingPublicId(pid);
            }}
          />
        </div>
      </section>

      <Separator />

      <Button type="submit" disabled={pending} className="rounded-full px-6">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Menyimpan…
          </>
        ) : (
          <>
            <Save className="size-4" />
            Simpan Pengaturan
          </>
        )}
      </Button>
    </form>
  );
}
