"use client";

import React from "react";
import { Search, Filter, Calendar, RotateCcw, FileSpreadsheet } from "lucide-react";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Button } from "./ui/button";
import { DOCUMENT_CATEGORIES, DOCUMENT_YEARS } from "@/lib/constants";
import { DocumentCategory, FilterState } from "@/lib/types";

interface DocumentFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
  totalAll: number;
}

export function DocumentFilters({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  totalAll,
}: DocumentFiltersProps) {
  const isFiltered =
    filters.searchQuery.trim() !== "" ||
    filters.category !== "ALL" ||
    filters.year !== "ALL";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 items-end">
        {/* Search Bar (By Document Title / Filename) */}
        <div className="lg:col-span-5 flex flex-col space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-emerald-600" />
            Cari Dokumen / Nama File
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Ketik kata kunci nama berkas atau laporan..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="pl-9 pr-4 bg-slate-50/50 border-slate-300 focus:bg-white transition"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Category Dropdown Filter */}
        <div className="lg:col-span-3 flex flex-col space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-emerald-600" />
            Kategori Laporan
          </label>
          <Select
            value={filters.category}
            onChange={(e) =>
              onFilterChange({
                category: e.target.value as DocumentCategory | "ALL",
              })
            }
            className="bg-slate-50/50 border-slate-300 focus:bg-white text-sm"
          >
            <option value="ALL">Semua Kategori ({DOCUMENT_CATEGORIES.length})</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        {/* Year Dropdown Filter */}
        <div className="lg:col-span-2 flex flex-col space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            Tahun Anggaran
          </label>
          <Select
            value={filters.year}
            onChange={(e) => onFilterChange({ year: e.target.value })}
            className="bg-slate-50/50 border-slate-300 focus:bg-white text-sm"
          >
            <option value="ALL">Semua Tahun</option>
            {DOCUMENT_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
          </Select>
        </div>

        {/* Action / Reset Controls */}
        <div className="lg:col-span-2 flex items-center gap-2">
          {isFiltered && (
            <Button
              variant="outline"
              size="default"
              onClick={onReset}
              className="w-full text-xs font-medium text-slate-600 hover:text-slate-900 border-slate-300 hover:bg-slate-100 dark:border-slate-700"
              title="Reset semua filter pencarian"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Reset Filter
            </Button>
          )}
          {!isFiltered && (
            <div className="w-full flex items-center justify-center py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <span>Menampilkan {totalAll} Dokumen</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Info / Results bar */}
      {isFiltered && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              Ditemukan {totalResults} dari total {totalAll} dokumen
            </span>
            {filters.category !== "ALL" && (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                Kategori: {filters.category}
              </span>
            )}
            {filters.year !== "ALL" && (
              <span className="rounded bg-teal-100 px-2 py-0.5 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                Tahun: {filters.year}
              </span>
            )}
          </div>
          <button
            onClick={onReset}
            className="text-xs text-emerald-600 hover:underline font-medium"
          >
            Hapus penyaringan
          </button>
        </div>
      )}
    </div>
  );
}
