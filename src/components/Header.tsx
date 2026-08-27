"use client";

import React from "react";
import { UserProfile } from "@/lib/types";
import { APP_CONFIG } from "@/lib/constants";
import { LogOut, ShieldCheck, User, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  isMockMode?: boolean;
}

export function Header({ user, onLogout, isMockMode }: HeaderProps) {
  const isAdmin = user?.role === "Admin";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-800/40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-lg backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Brand & Logo Area */}
          <div className="flex items-center gap-3.5">
            {/* Official Government / Marine Emblem */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-md shadow-emerald-950/40 ring-2 ring-emerald-300/30">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-emerald-950/80 text-white">
                <svg
                  className="h-7 w-7 text-emerald-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Fish + Waves Logo Graphic */}
                  <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z" />
                  <path d="M18 12h.01" />
                  <path d="M2 16c1.5-2 3.5-2 5 0 1.5 2 3.5 2 5 0" />
                  <path d="M2 8c1.5-2 3.5-2 5 0 1.5 2 3.5 2 5 0" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans sm:text-2xl">
                  {APP_CONFIG.name}
                </span>
                <span className="hidden rounded-full bg-emerald-700/60 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-emerald-200 border border-emerald-600/50 md:inline-block">
                  v1.0
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-100/90 sm:text-sm">
                <Building2 className="h-3.5 w-3.5 text-emerald-300 hidden sm:inline" />
                <span>{APP_CONFIG.fullName}</span>
              </div>
            </div>
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Active User Information & Badge */}
            <div className="flex items-center gap-2.5 bg-emerald-950/40 rounded-xl px-3 py-1.5 border border-emerald-700/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700/60 text-emerald-200 ring-1 ring-emerald-400/30">
                {isAdmin ? (
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                ) : (
                  <User className="h-4 w-4 text-emerald-200" />
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-slate-100 truncate max-w-[140px]">
                  {user?.email || "tamu@gunungkidul.go.id"}
                </span>
                <span className="text-[10px] font-semibold text-emerald-300">
                  {isAdmin ? "Administrator" : "Pegawai / Pengguna"}
                </span>
              </div>
              <Badge
                variant={isAdmin ? "admin" : "user"}
                className={`text-[11px] font-bold ${
                  isAdmin
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                    : "bg-emerald-400/20 text-emerald-200 border-emerald-400/30"
                }`}
              >
                {user?.role || "User"}
              </Badge>
            </div>

            {/* Logout Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="border-emerald-700/50 bg-emerald-950/50 text-emerald-100 hover:bg-rose-950/80 hover:text-rose-200 hover:border-rose-700/60 transition gap-1.5 font-medium shadow-none"
              title="Keluar dari sistem"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
