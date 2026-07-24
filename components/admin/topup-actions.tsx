"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { approveTopupAction, rejectTopupAction } from "@/lib/actions/topups";
import { formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface TopupActionsProps {
  topupId: string;
  amount: number;
  userName: string;
}

/** Tombol Approve/Reject topup dengan dialog konfirmasi + catatan. */
export function TopupActions({ topupId, amount, userName }: TopupActionsProps) {
  const router = useRouter();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function run(action: "approve" | "reject") {
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveTopupAction(topupId, note)
          : await rejectTopupAction(topupId, note);

      if (result.ok) {
        toast.success(
          action === "approve"
            ? `Topup ${formatIDR(amount)} disetujui — saldo user bertambah.`
            : "Topup ditolak."
        );
        setApproveOpen(false);
        setRejectOpen(false);
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Terjadi kesalahan.");
      }
    });
  }

  const noteField = (
    <div className="space-y-2">
      <Label htmlFor={`note-${topupId}`}>Catatan admin (opsional)</Label>
      <Textarea
        id={`note-${topupId}`}
        rows={2}
        maxLength={200}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="mis. dana sudah diterima / bukti tidak valid"
      />
    </div>
  );

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Approve */}
      <Dialog
        open={approveOpen}
        onOpenChange={(open) => {
          setApproveOpen(open);
          if (!open) setNote("");
        }}
      >
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="h-8 rounded-full bg-emerald-600 px-3 hover:bg-emerald-600/90"
          >
            <Check className="size-3.5" />
            Approve
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setujui topup ini?</DialogTitle>
            <DialogDescription>
              Saldo {userName} akan bertambah{" "}
              <strong className="text-foreground">{formatIDR(amount)}</strong>{" "}
              dan tercatat di riwayat wallet. Tindakan ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {noteField}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              onClick={() => run("approve")}
              disabled={pending}
              className="bg-emerald-600 hover:bg-emerald-600/90"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Ya, Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject */}
      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setNote("");
        }}
      >
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-full px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-3.5" />
            Reject
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak topup ini?</DialogTitle>
            <DialogDescription>
              Saldo {userName} tidak akan berubah. Sertakan alasan agar user
              paham.
            </DialogDescription>
          </DialogHeader>
          {noteField}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Batal
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => run("reject")}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <X className="size-4" />
              )}
              Ya, Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
