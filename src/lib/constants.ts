import { DocumentCategory } from './types';

export const APP_CONFIG = {
  name: 'SI-IKAN',
  longName: 'Sistem Informasi Integrasi Keuangan, Anggaran & Perencanaan',
  agencyName: 'Dinas Kelautan dan Perikanan',
  regionName: 'Kabupaten Gunungkidul',
  fullName: 'SI-IKAN - Dinas Kelautan dan Perikanan Kab. Gunungkidul',
  address: 'Jl. Kasatrian No. 24, Wonosari, Gunungkidul, D.I. Yogyakarta 55812',
};

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'DPA',
  'LAPORAN KEUANGAN DAN CALK',
  'LKJIP',
  'LPPD',
  'MONEV',
  'PERJANJIAN KINERJA',
  'RENJA',
  'RENSTRA',
  'RKA',
];

export const DOCUMENT_YEARS: string[] = [
  '2024',
  '2025',
  '2026',
  '2027',
  '2028',
];

export const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'DPA': {
    bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    text: 'text-emerald-700',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  'LAPORAN KEUANGAN DAN CALK': {
    bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    text: 'text-blue-700',
    border: 'border-blue-200 dark:border-blue-800',
  },
  'LKJIP': {
    bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
    text: 'text-purple-700',
    border: 'border-purple-200 dark:border-purple-800',
  },
  'LPPD': {
    bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    text: 'text-indigo-700',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  'MONEV': {
    bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    text: 'text-amber-700',
    border: 'border-amber-200 dark:border-amber-800',
  },
  'PERJANJIAN KINERJA': {
    bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
    text: 'text-teal-700',
    border: 'border-teal-200 dark:border-teal-800',
  },
  'RENJA': {
    bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
    text: 'text-cyan-700',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  'RENSTRA': {
    bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    text: 'text-emerald-800',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  'RKA': {
    bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    text: 'text-rose-700',
    border: 'border-rose-200 dark:border-rose-800',
  },
};

const DYNAMIC_PALETTES = [
  { bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', text: 'text-violet-700', border: 'border-violet-200 dark:border-violet-800' },
  { bg: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300', text: 'text-fuchsia-700', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
  { bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', text: 'text-sky-700', border: 'border-sky-200 dark:border-sky-800' },
  { bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300', text: 'text-orange-700', border: 'border-orange-200 dark:border-orange-800' },
  { bg: 'bg-lime-50 text-lime-700 dark:bg-lime-950/50 dark:text-lime-300', text: 'text-lime-700', border: 'border-lime-200 dark:border-lime-800' },
  { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', text: 'text-slate-700', border: 'border-slate-300 dark:border-slate-700' },
];

export function getCategoryBadgeStyle(category: string): { bg: string; text: string; border: string } {
  if (CATEGORY_STYLES[category]) {
    return CATEGORY_STYLES[category];
  }
  // Deterministic color selection for custom categories
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DYNAMIC_PALETTES.length;
  return DYNAMIC_PALETTES[index];
}
