import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { APP_CONFIG } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SI-IKAN - Dinas Kelautan dan Perikanan Kab. Gunungkidul",
  description:
    "Sistem Informasi Integrasi Kinerja, Anggaran dan Perencanaan (SI-IKAN) - Dinas Kelautan dan Perikanan Kabupaten Gunungkidul",
  keywords: [
    "SI-IKAN",
    "DKP Gunungkidul",
    "Dinas Kelautan dan Perikanan",
    "DPA",
    "LKJIP",
    "RENJA",
    "RENSTRA",
    "Gunungkidul",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-slate-50 antialiased selection:bg-emerald-200 selection:text-emerald-900 text-slate-900`}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
