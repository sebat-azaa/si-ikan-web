"use client";

import React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { DocumentItem } from "@/lib/types";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (doc: DocumentItem) => Promise<void>;
}

export function DeleteConfirmModal({
  document,
  open,
  onOpenChange,
  onConfirmDelete,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!document) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(document);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isDeleting && onOpenChange(v)}>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-rose-950 dark:text-rose-100">
              Konfirmasi Hapus Dokumen
            </DialogTitle>
            <DialogDescription>
              Tindakan ini permanen dan akan menghapus metadata serta berkas PDF dari server.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">
          Dokumen yang akan dihapus:
        </p>
        <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100 break-all text-sm">
          {document.title}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span>Kategori: <strong>{document.category}</strong></span>
          <span>•</span>
          <span>Tahun: <strong>{document.year}</strong></span>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="min-w-[120px]"
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Menghapus...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Ya, Hapus Dokumen
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
