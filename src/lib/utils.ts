import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes?: number, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDateIndo(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getRoleFromEmail(email?: string | null): "Admin" | "User" {
  if (!email) return "User";
  return email.toLowerCase().includes("admin") ? "Admin" : "User";
}

export function getFileExtension(filenameOrUrl?: string): string {
  if (!filenameOrUrl) return "";
  const clean = filenameOrUrl.split("?")[0].split("#")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

export function isExcelFile(filenameOrUrl?: string): boolean {
  const ext = getFileExtension(filenameOrUrl);
  return ext === "xlsx" || ext === "xls";
}

export function isPdfFile(filenameOrUrl?: string): boolean {
  const ext = getFileExtension(filenameOrUrl);
  return ext === "pdf";
}

export function isSupportedDocument(file: { name: string; type?: string }): boolean {
  const ext = getFileExtension(file.name);
  if (ext === "pdf" || ext === "xlsx" || ext === "xls") return true;
  if (
    file.type === "application/pdf" ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel"
  ) {
    return true;
  }
  return false;
}

export function getDocumentViewUrl(doc: { file_url: string; title?: string }): string {
  const isExcel = isExcelFile(doc.title || doc.file_url);
  if (isExcel) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.file_url)}`;
  }
  return doc.file_url;
}

