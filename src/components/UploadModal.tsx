"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { DOCUMENT_CATEGORIES, DOCUMENT_YEARS } from "@/lib/constants";
import { DocumentCategory } from "@/lib/types";
import { formatBytes } from "@/lib/utils";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (newDoc: {
    file: File;
    title: string;
    category: DocumentCategory;
    year: string;
  }) => Promise<void>;
}

export function UploadModal({
  open,
  onOpenChange,
  onUploadSuccess,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("DPA");
  const [year, setYear] = useState("2025");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setCategory("DPA");
    setYear("2025");
    setErrorMsg(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onOpenChange(false);
  };

  const handleFileSelection = (file: File) => {
    // PDF Validation Check
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Hanya file format PDF (.pdf) yang diperbolehkan.");
      return;
    }

    // Size limit check (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("Ukuran file tidak boleh melebihi 50 MB.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    // Autofill title if empty
    if (!title.trim()) {
      setTitle(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Silakan pilih berkas PDF terlebih dahulu.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Nama / Judul Dokumen tidak boleh kosong.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onUploadSuccess({
        file: selectedFile,
        title: title.trim(),
        category,
        year,
      });
      handleClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengunggah dokumen. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Unggah Dokumen Arsip Baru</DialogTitle>
            <DialogDescription>
              Tambahkan laporan kinerja, anggaran, atau perencanaan ke dalam repositori SI-IKAN.
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

        {/* PDF File Picker / Drag & Drop Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Berkas PDF <span className="text-rose-500">*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelection(e.target.files[0]);
              }
            }}
          />

          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/70"
                  : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 dark:border-slate-700 dark:hover:bg-slate-800/40"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2 dark:bg-emerald-950 dark:text-emerald-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Klik untuk memilih file atau seret file PDF ke sini
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Format yang didukung: <span className="font-semibold text-slate-600 dark:text-slate-300">PDF (.pdf)</span>, Maksimal 50 MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-900 dark:bg-emerald-950/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formatBytes(selectedFile.size)} • PDF siap diunggah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                title="Batalkan pilihan file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Nama / Judul Dokumen <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Contoh: DPA-SKPD_DKP_Gunungkidul_TA_2025_Final.pdf"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-sm font-medium"
          />
          <p className="text-[11px] text-slate-400">
            Gunakan format penamaan standar kedinasan agar mudah dicari.
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
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              required
            >
              {DOCUMENT_CATEGORIES.map((cat) => (
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
            disabled={isSubmitting || !selectedFile || !title.trim()}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 mr-2" />
                Simpan Dokumen
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
