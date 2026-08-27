import React from "react";
import { FileText, FolderTree, CalendarCheck, ShieldCheck } from "lucide-react";
import { DocumentItem } from "@/lib/types";

interface StatsCardsProps {
  documents: DocumentItem[];
}

export function StatsCards({ documents }: StatsCardsProps) {
  const totalDocs = documents.length;
  const categoriesCount = new Set(documents.map((d) => d.category)).size;
  const yearsCount = new Set(documents.map((d) => d.year)).size;
  
  // Find latest year
  const years = documents.map((d) => parseInt(d.year, 10)).filter((y) => !isNaN(y));
  const latestYear = years.length > 0 ? Math.max(...years) : 2025;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Documents Card */}
      <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-500/10 via-white to-white p-4 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Arsip Dokumen
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {totalDocs}
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Berkas PDF
            </span>
          </div>
        </div>
      </div>

      {/* Categories Active */}
      <div className="flex items-center gap-4 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-500/10 via-white to-white p-4 shadow-sm dark:border-teal-900 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
          <FolderTree className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Kategori Laporan
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {categoriesCount}
            </span>
            <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
              / 9 Kategori
            </span>
          </div>
        </div>
      </div>

      {/* Latest Fiscal Year */}
      <div className="flex items-center gap-4 rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-500/10 via-white to-white p-4 shadow-sm dark:border-cyan-900 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20">
          <CalendarCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tahun Anggaran Aktif
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {latestYear}
            </span>
            <span className="text-xs font-medium text-cyan-700 dark:text-cyan-400">
              ({yearsCount} Periode)
            </span>
          </div>
        </div>
      </div>

      {/* System Integrity & Security */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-500/10 via-white to-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700 text-white shadow-md shadow-slate-700/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Akses & Keamanan
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
              Role-Based RLS
            </span>
            <span className="text-xs font-medium text-emerald-600">
              ● Terproteksi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
