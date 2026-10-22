"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DocumentItem } from "@/lib/types";
import { getCategoryBadgeStyle } from "@/lib/constants";
import {
  Tag,
  Pencil,
  Check,
  X,
  Search,
  AlertTriangle,
  FileText,
  Loader2,
  FolderSync,
} from "lucide-react";
import { toast } from "sonner";

interface ManageCategoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  documents: DocumentItem[];
  onRenameCategory: (oldCategory: string, newCategory: string) => Promise<void>;
}

export function ManageCategoriesModal({
  open,
  onOpenChange,
  categories,
  documents,
  onRenameCategory,
}: ManageCategoriesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [renameInput, setNewRenameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Count documents per category
  const documentCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    documents.forEach((doc) => {
      map[doc.category] = (map[doc.category] || 0) + 1;
    });
    return map;
  }, [documents]);

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleStartEdit = (category: string) => {
    setEditingCategory(category);
    setNewRenameInput(category);
    setErrorMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewRenameInput("");
    setErrorMsg(null);
  };

  const handleConfirmRename = async (oldCategory: string) => {
    const trimmed = renameInput.trim();
    if (!trimmed) {
      setErrorMsg("Nama kategori tidak boleh kosong.");
      return;
    }
    if (trimmed.length < 2) {
      setErrorMsg("Nama kategori minimal 2 karakter.");
      return;
    }

    const formatted = trimmed.toUpperCase();

    if (formatted === oldCategory) {
      handleCancelEdit();
      return;
    }

    // Check if new category name already exists
    const duplicate = categories.find(
      (c) => c.toLowerCase() === formatted.toLowerCase() && c !== oldCategory
    );
    if (duplicate) {
      setErrorMsg(`Kategori "${duplicate}" sudah ada.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onRenameCategory(oldCategory, formatted);
      handleCancelEdit();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal mengubah nama kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleCancelEdit();
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Kelola & Ubah Nama Kategori</DialogTitle>
            <DialogDescription>
              Ubah nama kategori laporan. Semua arsip dokumen terkait akan otomatis diperbarui secara berantai (cascading).
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4">
        {/* Search Categories */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Cari kategori laporan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Global Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Categories List */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada kategori yang cocok dengan pencarian.
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const badgeStyle = getCategoryBadgeStyle(cat);
              const count = documentCountMap[cat] || 0;
              const isEditing = editingCategory === cat;

              return (
                <div
                  key={cat}
                  className="pt-2 first:pt-0 pb-2 transition-colors rounded-xl"
                >
                  {!isEditing ? (
                    <div className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/60">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.border}`}
                        >
                          {cat}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {count} Berkas
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(cat)}
                        className="h-7 px-2.5 text-xs text-slate-600 hover:text-emerald-700 hover:border-emerald-300 gap-1 shrink-0"
                        title={`Ubah nama kategori ${cat}`}
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Ubah Nama</span>
                      </Button>
                    </div>
                  ) : (
                    /* Inline Edit Mode */
                    <div className="p-3 rounded-xl border border-teal-300 bg-teal-50/60 dark:border-teal-800 dark:bg-teal-950/30 space-y-2.5 animate-in fade-in-50">
                      <div className="flex items-center justify-between text-xs font-bold text-teal-800 dark:text-teal-300">
                        <span className="flex items-center gap-1.5">
                          <Pencil className="h-3.5 w-3.5 text-teal-600" />
                          Ubah Nama Kategori: {cat}
                        </span>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Cascading Notice */}
                      <div className="flex items-start gap-2 rounded-lg bg-white/80 p-2.5 text-[11px] text-teal-900 dark:bg-slate-900/80 dark:text-teal-200 border border-teal-200/80 dark:border-teal-900">
                        <FolderSync className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                        <span>
                          <strong>Pembaruan Berantai:</strong> Mengubah nama kategori ini akan secara otomatis memperbarui <strong>{count} dokumen</strong> yang saat ini menggunakan kategori <strong>&quot;{cat}&quot;</strong>.
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setNewRenameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleConfirmRename(cat);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                          disabled={isSubmitting}
                          placeholder="Masukkan nama baru..."
                          className="h-8 text-xs bg-white dark:bg-slate-900 font-semibold uppercase tracking-wide"
                        />
                        <Button
                          type="button"
                          variant="gov"
                          size="sm"
                          onClick={() => handleConfirmRename(cat)}
                          disabled={isSubmitting || !renameInput.trim()}
                          className="h-8 px-3 text-xs font-bold shrink-0 gap-1 bg-teal-700 hover:bg-teal-800 text-white"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>Simpan</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isSubmitting}
                          className="h-8 px-2 text-xs text-slate-500 hover:text-slate-700 shrink-0"
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Tutup
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
