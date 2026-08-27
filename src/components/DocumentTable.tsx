"use client";

import React, { useState } from "react";
import { DocumentItem, UserRole } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/constants";
import { formatDateIndo, formatBytes } from "@/lib/utils";
import {
  FileText,
  Download,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  FileCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface DocumentTableProps {
  documents: DocumentItem[];
  userRole: UserRole;
  onDownload: (doc: DocumentItem) => void;
  onDelete?: (doc: DocumentItem) => void;
  onView?: (doc: DocumentItem) => void;
  isLoading?: boolean;
}

export function DocumentTable({
  documents,
  userRole,
  onDownload,
  onDelete,
  onView,
  isLoading = false,
}: DocumentTableProps) {
  const isAdmin = userRole === "Admin";
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Pagination calculation
  const totalPages = Math.ceil(documents.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = documents.slice(startIndex, startIndex + itemsPerPage);

  // Reset page if documents length shrinks
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [documents.length, totalPages, currentPage]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
          Memuat daftar dokumen arsip SI-IKAN...
        </p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
          Tidak Ada Dokumen yang Ditemukan
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Tidak ada berkas yang cocok dengan filter pencarian Anda. Coba sesuaikan kata kunci, kategori, atau tahun.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Table header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Tabel Data Arsip Dokumen Keuangan, Anggaran & Perencanaan
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Halaman {currentPage} dari {totalPages} ({documents.length} dokumen)
        </span>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="border-b border-slate-200 bg-emerald-900 text-xs uppercase tracking-wider text-emerald-100 dark:border-slate-800">
            <tr>
              <th scope="col" className="px-5 py-3.5 text-center font-semibold w-12">
                No
              </th>
              <th scope="col" className="px-5 py-3.5 font-semibold">
                Nama File / Dokumen
              </th>
              <th scope="col" className="px-5 py-3.5 font-semibold">
                Kategori
              </th>
              <th scope="col" className="px-5 py-3.5 font-semibold text-center w-28">
                Tahun
              </th>
              <th scope="col" className="px-5 py-3.5 font-semibold w-36">
                Tanggal Unggah
              </th>
              <th scope="col" className="px-5 py-3.5 text-center font-semibold w-40">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-normal">
            {paginatedDocs.map((doc, index) => {
              const rowNumber = startIndex + index + 1;
              const categoryStyle = CATEGORY_STYLES[doc.category] || {
                bg: "bg-slate-100 text-slate-800",
                text: "text-slate-800",
                border: "border-slate-300",
              };

              return (
                <tr
                  key={doc.id}
                  className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-slate-800/50"
                >
                  {/* Number */}
                  <td className="px-5 py-4 text-center text-xs font-semibold text-slate-400">
                    {rowNumber}
                  </td>

                  {/* Title / File Name with PDF Icon & Size */}
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 hover:text-emerald-700 transition leading-snug break-all sm:break-normal line-clamp-2">
                          {doc.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium text-slate-400">
                            PDF
                          </span>
                          {doc.file_size ? (
                            <>
                              <span className="text-[10px] text-slate-300">•</span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {formatBytes(doc.file_size)}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category Tag */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${categoryStyle.bg} ${categoryStyle.border}`}
                    >
                      {doc.category}
                    </span>
                  </td>

                  {/* Fiscal Year */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                      {doc.year}
                    </span>
                  </td>

                  {/* Upload Date */}
                  <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDateIndo(doc.created_at)}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Download Button (Available for both Admin and User) */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(doc)}
                        className="h-8 border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs gap-1 shadow-none"
                        title="Unduh file dokumen"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Unduh</span>
                      </Button>

                      {/* Delete Button (STRICTLY Admin Only) */}
                      {isAdmin && onDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(doc)}
                          className="h-8 text-xs gap-1 bg-rose-600 hover:bg-rose-700 shadow-none"
                          title="Hapus dokumen dari arsip"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Hapus</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-300">{startIndex + 1}</span> -{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(startIndex + itemsPerPage, documents.length)}
            </span>{" "}
            dari <span className="font-semibold text-slate-700 dark:text-slate-300">{documents.length}</span> data
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 p-0 text-xs ${
                  currentPage === page
                    ? "bg-emerald-700 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
