"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { DOCUMENT_CATEGORIES, DOCUMENT_YEARS } from "@/lib/constants";
import { DocumentCategory, DocumentItem } from "@/lib/types";
import { formatBytes, formatDateIndo } from "@/lib/utils";
import {
  Pencil,
  FileText,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface EditDocumentModalProps {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSuccess: (updatedDoc: {
    id: string;
    title: string;
    category: DocumentCategory;
    year: string;
  }) => Promise<void>;
  availableCategories: string[];
}

export function EditDocumentModal({
  document,
  open,
  onOpenChange,
  onSaveSuccess,
  availableCategories,
}: EditDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("DPA");
  const [year, setYear] = useState("2025");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categoriesList = availableCategories.length > 0 ? availableCategories : DOCUMENT_CATEGORIES;

  // Sync form state when document changes
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setCategory(document.category);
      setYear(document.year);
      setErrorMsg(null);
    }
  }, [document]);

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMsg(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg("Nama / Judul Dokumen tidak boleh kosong.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSaveSuccess({
        id: document.id,
        title: trimmedTitle,
        category: category as DocumentCategory,
        year,
      });
      handleClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memperbarui dokumen. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Pencil className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Edit Rincian Dokumen</DialogTitle>
            <DialogDescription>
              Perbarui judul, kategori, atau tahun anggaran dokumen tanpa perlu mengunggah ulang berkas PDF.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Existing File Info (Preserved) */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                  {document.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                  <span>{document.file_size ? formatBytes(document.file_size) : "PDF"}</span>
                  <span>•</span>
                  <span>Diunggah {formatDateIndo(document.created_at)}</span>
                </div>
              </div>
            </div>

            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0 transition"
              title="Pratinjau berkas saat ini di tab baru"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Lihat PDF</span>
            </a>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 border-t border-slate-200/60 dark:border-slate-800 pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Berkas PDF tersimpan aman di Supabase Storage dan tidak perlu diunggah ulang.</span>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Nama / Judul Dokumen <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-sm font-medium"
            placeholder="Contoh: DPA-SKPD_DKP_Gunungkidul_TA_2025_Final.pdf"
          />
          <p className="text-[11px] text-slate-400">
            Perubahan nama dokumen akan langsung terbarui di tabel data arsip.
          </p>
        </div>

        {/* Category & Year Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Kategori Dokumen <span className="text-rose-500">*</span>
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          {/* Year Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tahun Anggaran <span className="text-rose-500">*</span>
            </label>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            >
              {DOCUMENT_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Footer actions */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="gov"
            disabled={isSubmitting || !title.trim()}
            className="min-w-[150px] bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
