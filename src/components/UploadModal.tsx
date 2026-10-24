// "use client"

import React, { useState, useRef } from "react";
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
import { DocumentCategory } from "@/lib/types";
import { formatBytes, isSupportedDocument } from "@/lib/utils";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Plus,
  Check,
  Tag,
  FolderUp,
  FolderArchive,
  Files,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export interface UploadBatchItem {
  file: File;
  title: string;
  category: DocumentCategory;
  year: string;
}

export interface UploadProgress {
  current: number;
  total: number;
  currentFileName: string;
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: (newDoc: UploadBatchItem) => Promise<void>;
  onUploadBatch?: (
    items: UploadBatchItem[],
    onProgress?: (progress: UploadProgress) => void
  ) => Promise<void>;
  availableCategories?: string[];
  onAddNewCategory?: (newCategory: string) => Promise<void> | void;
}

export function UploadModal({
  open,
  onOpenChange,
  onUploadSuccess,
  onUploadBatch,
  availableCategories,
  onAddNewCategory,
}: UploadModalProps) {
  const [localCustomCategories, setLocalCustomCategories] = useState<string[]>([]);
  const categoriesList = Array.from(
    new Set([...(availableCategories || DOCUMENT_CATEGORIES), ...localCustomCategories])
  );

  // Upload Mode: 'single' (File Tunggal) or 'folder' (Folder / Bulk)
  const [uploadMode, setUploadMode] = useState<"single" | "folder">("single");

  // Single File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  // Folder / Multiple Files State
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<File[]>([]);
  const [filteredOutCount, setFilteredOutCount] = useState(0);

  // Common Metadata
  const [category, setCategory] = useState<string>("DPA");
  const [year, setYear] = useState("2025");

  // UI / Submission States
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Category Creation States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Input Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedFolderFiles([]);
    setFilteredOutCount(0);
    setTitle("");
    setCategory(categoriesList[0] || "DPA");
    setYear("2025");
    setErrorMsg(null);
    setIsSubmitting(false);
    setUploadProgress(null);
    setIsAddingCategory(false);
    setNewCategoryInput("");
    setCategoryError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
    if (multiFileInputRef.current) multiFileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onOpenChange(false);
  };

  const handleConfirmNewCategory = async () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      setCategoryError("Nama kategori tidak boleh kosong.");
      return;
    }
    if (trimmed.length < 2) {
      setCategoryError("Nama kategori minimal 2 karakter.");
      return;
    }

    const formatted = trimmed.toUpperCase();

    // Check if category already exists in current list
    const existing = categoriesList.find(
      (c) => c.toLowerCase() === formatted.toLowerCase()
    );

    if (existing) {
      setCategory(existing);
      setIsAddingCategory(false);
      setNewCategoryInput("");
      setCategoryError(null);
      toast.info(`Kategori "${existing}" sudah ada dan otomatis dipilih.`);
      return;
    }

    try {
      setIsSavingCategory(true);
      if (onAddNewCategory) {
        await onAddNewCategory(formatted);
      }
      setLocalCustomCategories((prev) => [...prev, formatted]);
      setCategory(formatted);
      setIsAddingCategory(false);
      setNewCategoryInput("");
      setCategoryError(null);
      toast.success(`Kategori "${formatted}" berhasil ditambahkan dan dipilih!`);
    } catch (err: any) {
      setCategoryError(err?.message || "Gagal menambahkan kategori baru.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // 1. Single File Selection Handler
  const handleFileSelection = (file: File) => {
    if (!isSupportedDocument(file)) {
      setErrorMsg(
        "Hanya file format PDF, Excel (.pdf, .xlsx, .xls) yang diperbolehkan."
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("Ukuran file tidak boleh melebihi 50 MB.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    if (!title.trim()) {
      setTitle(file.name);
    }
  };

  // 2. Folder & Multi‑File Selection Handler (supports PDF & Excel)
  const handleFolderSelection = (filesList: FileList | File[]) => {
    const rawFiles = Array.from(filesList);
    if (rawFiles.length === 0) return;

    // Keep only supported documents (PDF, XLSX, XLS)
    const supportedFiles = rawFiles.filter(isSupportedDocument);
    const nonSupported = rawFiles.length - supportedFiles.length;
    setFilteredOutCount(nonSupported);

    if (supportedFiles.length === 0) {
      setErrorMsg(
        `Tidak ditemukan file format PDF atau Excel yang diperbolehkan. ${nonSupported} file tidak didukung diabaikan.`
      );
      setSelectedFolderFiles([]);
      return;
    }

    // Check size limit (max 50MB per file)
    const oversized = supportedFiles.filter((f) => f.size > 50 * 1024 * 1024);
    if (oversized.length > 0) {
      setErrorMsg(`Terdapat ${oversized.length} file yang melebihi batas 50 MB.`);
      return;
    }

    setErrorMsg(null);
    setSelectedFolderFiles(supportedFiles);
  };

  // Drag & drop handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (uploadMode === "folder" || e.dataTransfer.files.length > 1) {
        setUploadMode("folder");
        handleFolderSelection(e.dataTransfer.files);
      } else {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let itemsToUpload: UploadBatchItem[] = [];

    if (uploadMode === "single") {
      if (!selectedFile) {
        setErrorMsg("Silakan pilih berkas PDF atau Excel terlebih dahulu.");
        return;
      }
      if (!title.trim()) {
        setErrorMsg("Nama / Judul Dokumen tidak boleh kosong.");
        return;
      }
      itemsToUpload = [
        {
          file: selectedFile,
          title: title.trim(),
          category: category as DocumentCategory,
          year,
        },
      ];
    } else {
      // Folder / Bulk mode
      if (selectedFolderFiles.length === 0) {
        setErrorMsg(
          "Silakan pilih folder berisi berkas PDF atau Excel terlebih dahulu."
        );
        return;
      }
      // Use each file's original name as the document title
      itemsToUpload = selectedFolderFiles.map((file) => ({
        file,
        title: file.name,
        category: category as DocumentCategory,
        year,
      }));
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setUploadProgress({
        current: 0,
        total: itemsToUpload.length,
        currentFileName: itemsToUpload[0].file.name,
      });

      if (onUploadBatch) {
        await onUploadBatch(itemsToUpload, (prog) => {
          setUploadProgress(prog);
        });
      } else if (onUploadSuccess && itemsToUpload.length === 1) {
        await onUploadSuccess(itemsToUpload[0]);
      }

      handleClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengunggah dokumen. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const totalFolderSize = selectedFolderFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Unggah Dokumen Arsip</DialogTitle>
            <DialogDescription>
              Unggah laporan arsip perorangan atau seluruh folder berisi berkas PDF / Excel sekaligus ke repositori SI-IKAN.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload Mode Switcher (Single File vs Folder / Bulk) */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setUploadMode("single");
              setErrorMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all ${
              uploadMode === "single"
                ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-900 dark:text-emerald-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Berkas Tunggal</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setUploadMode("folder");
              setErrorMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-lg transition-all ${
              uploadMode === "folder"
                ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-900 dark:text-emerald-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <FolderUp className="h-3.5 w-3.5" />
            <span>Unggah Folder (Banyak Berkas)</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MODE 1: SINGLE FILE UPLOAD */}
        {uploadMode === "single" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Berkas PDF / Excel <span className="text-rose-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls"
                className="hidden"
                disabled={isSubmitting}
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2 dark:bg-emerald-950 dark:text-emerald-400">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Klik untuk memilih file PDF atau Excel atau seret ke sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Format: <span className="font-semibold text-slate-600 dark:text-slate-300">PDF, Excel (.pdf, .xlsx, .xls)</span>, Maksimal 50 MB
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
                        {formatBytes(selectedFile.size)} • File siap diunggah
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSubmitting}
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
                disabled={isSubmitting}
                required
                className="text-sm font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Gunakan format penamaan standar kedinasan agar mudah dicari.
              </p>
            </div>
          </div>
        )}

        {/* MODE 2: FOLDER (BULK) UPLOAD */}
        {uploadMode === "folder" && (
          <div className="space-y-3">
            {/* Hidden Input for Folder selection */}
            <input
              ref={folderInputRef}
              type="file"
              multiple
              {...({ webkitdirectory: "", directory: "" } as any)}
              className="hidden"
              disabled={isSubmitting}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFolderSelection(e.target.files);
                }
              }}
            />

            {/* Hidden Input for Multi-file fallback selection */}
            <input
              ref={multiFileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls"
              className="hidden"
              disabled={isSubmitting}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFolderSelection(e.target.files);
                }
              }}
            />

            {selectedFolderFiles.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/70"
                    : "border-slate-300 bg-slate-50/50 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-900/40"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 mb-2 dark:bg-teal-950 dark:text-teal-400 shadow-sm">
                  <FolderUp className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Pilih Folder Berisi Berkas PDF / Excel
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Sistem akan secara otomatis memindai seluruh folder dan menyaring semua file PDF, Excel (.pdf, .xlsx, .xls). File selain yang didukung akan otomatis diabaikan.
                </p>
                {/* Folder & Multi-File Trigger Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <Button
                    type="button"
                    variant="gov"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => folderInputRef.current?.click()}
                    className="gap-1.5 font-bold shadow-sm"
                  >
                    <FolderArchive className="h-4 w-4" />
                    <span>Pilih Folder</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => multiFileInputRef.current?.click()}
                    className="gap-1.5 font-semibold text-xs"
                  >
                    <Files className="h-4 w-4 text-slate-600" />
                    <span>Pilih Banyak File</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Summary Card */}
                <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/70 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                      <FolderArchive className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                        <span>{selectedFolderFiles.length} File Siap Diunggah</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                        Total Ukuran: {formatBytes(totalFolderSize)}
                        {filteredOutCount > 0 && (
                          <span className="text-slate-500 ml-1.5">
                            ({filteredOutCount} file tidak didukung diabaikan)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setSelectedFolderFiles([]);
                      setFilteredOutCount(0);
                      if (folderInputRef.current) folderInputRef.current.value = "";
                      if (multiFileInputRef.current) multiFileInputRef.current.value = "";
                    }}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                  >
                    Pilih Ulang
                  </button>
                </div>

                {/* Scrollable File List Preview */}
                <div className="rounded-xl border border-slate-200 bg-white/90 p-2.5 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 px-1 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-600" />
                      Daftar Berkas Terpilih ({selectedFolderFiles.length})
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Format: .PDF / .XLSX / .XLS
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100 dark:divide-slate-800/80">
                    {selectedFolderFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 px-1 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="text-[10px] font-bold text-slate-400 font-mono w-5 shrink-0">
                            {idx + 1}.
                          </span>
                          <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {file.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {formatBytes(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auto Title Notice */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs text-slate-600 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400 flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    <strong>Judul Otomatis:</strong> Nama asli masing-masing file akan digunakan sebagai judul dokumen di repositori.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category & Year Row (Shared by both modes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Category Dropdown & Custom Category Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Kategori Dokumen <span className="text-rose-500">*</span>
              </label>
              {!isAddingCategory ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsAddingCategory(true);
                    setNewCategoryInput("");
                    setCategoryError(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                  title="Tambah kategori baru jika belum tersedia di daftar"
                >
                  <Plus className="h-3 w-3" />
                  <span>+ Tambah Baru</span>
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Tambah Kategori
                </span>
              )}
            </div>

            {!isAddingCategory ? (
              <Select
                value={category}
                disabled={isSubmitting}
                onChange={(e) => {
                  if (e.target.value === "__NEW_CATEGORY__") {
                    setIsAddingCategory(true);
                    setNewCategoryInput("");
                    setCategoryError(null);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                required
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__NEW_CATEGORY__" className="font-semibold text-emerald-700">
                  + Tambah Kategori Baru...
                </option>
              </Select>
            ) : (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-2 space-y-1.5 dark:border-emerald-800 dark:bg-emerald-950/40 animate-in fade-in-50 duration-200">
                <div className="flex gap-1.5">
                  <Input
                    type="text"
                    placeholder="Nama kategori baru..."
                    value={newCategoryInput}
                    onChange={(e) => {
                      setNewCategoryInput(e.target.value);
                      if (categoryError) setCategoryError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleConfirmNewCategory();
                      } else if (e.key === "Escape") {
                        setIsAddingCategory(false);
                        setNewCategoryInput("");
                        setCategoryError(null);
                      }
                    }}
                    autoFocus
                    className="h-8 text-xs bg-white dark:bg-slate-900 font-semibold uppercase tracking-wide focus:ring-1 focus:ring-emerald-500"
                  />
                  <Button
                    type="button"
                    variant="gov"
                    size="sm"
                    onClick={handleConfirmNewCategory}
                    disabled={!newCategoryInput.trim() || isSavingCategory}
                    className="h-8 px-2.5 text-xs font-bold shrink-0 gap-1 shadow-sm"
                    title="Simpan kategori baru"
                  >
                    {isSavingCategory ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Simpan</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryInput("");
                      setCategoryError(null);
                    }}
                    disabled={isSavingCategory}
                    className="h-8 px-2 text-xs text-slate-500 hover:text-slate-700 shrink-0"
                    title="Batal"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {categoryError && (
                  <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                    {categoryError}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Tekan <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[9px]">Enter</kbd> untuk simpan, <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[9px]">Esc</kbd> untuk batal.
                </p>
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tahun Anggaran <span className="text-rose-500">*</span>
            </label>
            <Select
              value={year}
              disabled={isSubmitting}
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

        {/* Progress Bar / UX Feedback during Upload */}
        {isSubmitting && uploadProgress && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 space-y-2 dark:border-emerald-800 dark:bg-emerald-950/60 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-100">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                Mengunggah Dokumen: {uploadProgress.current} dari {uploadProgress.total} file
              </span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300">
                {uploadProgress.total > 0
                  ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-2.5 dark:bg-emerald-900/60 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    uploadProgress.total > 0
                      ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting} variant="emerald">
            {isSubmitting ? "Mengunggah..." : "Unggah"}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
