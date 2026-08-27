"use client";

import React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { DocumentItem } from "@/lib/types";
import { FileText, Download, ExternalLink } from "lucide-react";

interface PdfViewerModalProps {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (doc: DocumentItem) => void;
}

export function PdfViewerModal({
  document,
  open,
  onOpenChange,
  onDownload,
}: PdfViewerModalProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-base">
              {document.title}
            </DialogTitle>
            <DialogDescription>
              Kategori: {document.category} • Tahun: {document.year}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="relative h-[65vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
        <iframe
          src={`${document.file_url}#toolbar=1&navpanes=0`}
          title={document.title}
          className="h-full w-full border-0"
        />
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => window.open(document.file_url, "_blank")}
          className="gap-1.5"
        >
          <ExternalLink className="h-4 w-4" />
          Buka di Tab Baru
        </Button>
        <Button
          variant="gov"
          onClick={() => onDownload(document)}
          className="gap-1.5"
        >
          <Download className="h-4 w-4" />
          Unduh File PDF
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
