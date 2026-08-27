"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Mail,
  ShieldCheck,
  Building2,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle,
  HelpCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Silakan masukkan email dan kata sandi.");
      return;
    }

    setIsLoading(true);

    try {
      if (!supabaseConfigured) {
        // If Supabase credentials are not yet set in .env.local, use local session simulation
        toast.info("Mode Demo/Pengujian Aktif: Masuk tanpa koneksi live Supabase.");
        const role = email.toLowerCase().includes("admin") ? "Admin" : "User";
        localStorage.setItem(
          "siikan_demo_user",
          JSON.stringify({
            id: "demo-user-id",
            email,
            role,
          })
        );
        router.push("/");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Berhasil masuk ke SI-IKAN!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(
        err.message === "Invalid login credentials"
          ? "Kombinasi email atau kata sandi salah. Silakan periksa kembali."
          : err.message || "Terjadi kesalahan saat masuk ke sistem."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: "Admin" | "User") => {
    if (role === "Admin") {
      setEmail("admin.dkp@gunungkidulkab.go.id");
      setPassword("AdminGunungkidul#2025");
    } else {
      setEmail("pegawai.dkp@gunungkidulkab.go.id");
      setPassword("PegawaiDKP#2025");
    }
    setErrorMessage(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 lg:flex-row">
      {/* Left Column: Official Government Hero Banner */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 p-8 text-white lg:p-12">
        {/* Background decorative patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-lg shadow-emerald-950/50">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-emerald-950 text-white">
              <svg
                className="h-7 w-7 text-emerald-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z" />
                <path d="M18 12h.01" />
                <path d="M2 16c1.5-2 3.5-2 5 0 1.5 2 3.5 2 5 0" />
                <path d="M2 8c1.5-2 3.5-2 5 0 1.5 2 3.5 2 5 0" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              {APP_CONFIG.name}
            </h1>
            <p className="text-xs font-medium text-emerald-300">
              {APP_CONFIG.agencyName}
            </p>
          </div>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 my-12 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-900/60 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Portal Repositori Terintegrasi</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
            Sistem Informasi Integrasi Kinerja, Anggaran & Perencanaan
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl leading-relaxed">
            Platform tata kelola arsip digital terpusat untuk dokumen perencanaan
            (DPA, LKJIP, RENJA, RENSTRA, LPPD, MONEV, RKA) pada Dinas Kelautan dan
            Perikanan Kabupaten Gunungkidul.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-lg">
            <div className="flex items-center gap-2.5 rounded-lg bg-emerald-900/40 p-3 border border-emerald-700/30">
              <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-emerald-100">
                Pencarian & Filter Multi-Kategori
              </span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg bg-emerald-900/40 p-3 border border-emerald-700/30">
              <UserCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-emerald-100">
                Hak Akses Pegawai & Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-emerald-300/70 border-t border-emerald-800/40 pt-4 gap-2">
          <span>{APP_CONFIG.regionName} • D.I. Yogyakarta</span>
          <span>© 2025 Dinas Kelautan dan Perikanan</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-12 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-2 text-left">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Masuk ke SI-IKAN
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Gunakan akun resmi Dinas Kelautan dan Perikanan untuk mengakses dokumen.
            </p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Alamat Email Kedinasan
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="nama@gunungkidulkab.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 text-sm font-medium"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 text-sm font-medium"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              variant="gov"
              size="lg"
              disabled={isLoading}
              className="w-full text-sm font-bold tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Masuk ke Portal"
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-2">
              <HelpCircle className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Akses Cepat Mode Uji Coba:</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mb-3">
              Klik salah satu tombol di bawah untuk mengisi kredensial contoh secara otomatis:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill("Admin")}
                className="text-xs bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-medium"
              >
                Akun Admin (CRUD)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill("User")}
                className="text-xs bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-medium"
              >
                Akun Pegawai (Read Only)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
