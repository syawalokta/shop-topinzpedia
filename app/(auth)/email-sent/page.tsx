import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Cek Email Kamu" };

interface EmailSentPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function EmailSentPage({
  searchParams,
}: EmailSentPageProps) {
  const { email } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-7" aria-hidden />
          </span>
          <CardTitle className="mt-2 text-xl">Cek Email Kamu 📬</CardTitle>
          <CardDescription>
            Kami sudah mengirim tautan verifikasi
            {email ? (
              <>
                {" "}
                ke <strong className="text-foreground">{email}</strong>
              </>
            ) : null}
            . Klik tautan di email tersebut untuk mengaktifkan akunmu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border bg-muted/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
            💡 Tidak menemukan emailnya? Cek folder <strong>Spam</strong> atau{" "}
            <strong>Promosi</strong>. Tautan berlaku selama 24 jam — kamu bisa
            minta kirim ulang dari halaman login.
          </div>
          <Button asChild className="w-full rounded-full">
            <Link href="/login">Ke Halaman Login</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-full">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
