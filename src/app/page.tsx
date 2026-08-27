"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { DocumentFilters } from "@/components/DocumentFilters";
import { DocumentTable } from "@/components/DocumentTable";
import { UploadModal } from "@/components/UploadModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { Button } from "@/components/ui/button";
import {
  DocumentItem,
  DocumentCategory,
  FilterState,
  UserProfile,
  UserRole,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getRoleFromEmail } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();

  // User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Documents State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    category: "ALL",
    year: "ALL",
  });

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [docToView, setDocToView] = useState<DocumentItem | null>(null);

  // 1. Strict Authenticate & Fetch Profile
  useEffect(() => {
    let authListener: { unsubscribe: () => void } | null = null;

    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Strict: If not authenticated, redirect to /login immediately
        if (!session?.user) {
          router.push("/login");
          return;
        }

        const userEmail = session.user.email || "";
        const roleFromEmail = getRoleFromEmail(userEmail);

        // Fetch user profile from 'profiles' table if it exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const role: UserRole = (roleFromEmail === "Admin" || profile?.role === "Admin") ? "Admin" : "User";

        setCurrentUser({
          id: session.user.id,
          email: userEmail,
          full_name: profile?.full_name || session.user.user_metadata?.full_name || userEmail.split("@")[0],
          role: role,
        });

        // Set up real-time auth listener for session changes
        const { data: authData } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (!newSession?.user) {
              router.push("/login");
            } else {
              const email = newSession.user.email || "";
              const activeRole: UserRole = getRoleFromEmail(email);
              setCurrentUser({
                id: newSession.user.id,
                email: email,
                full_name: newSession.user.user_metadata?.full_name || email.split("@")[0],
                role: activeRole,
              });
            }
          }
        );
        authListener = authData.subscription;
      } catch (err) {
        console.error("Error loading user profile:", err);
        router.push("/login");
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadUser();

    return () => {
      authListener?.unsubscribe();
    };
  }, [router]);

  // 2. Fetch Real Documents strictly from Supabase
  const fetchDocuments = async () => {
    try {
      setIsLoadingDocs(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments((data as DocumentItem[]) || []);
    } catch (err: any) {
      console.error("Failed to fetch documents from Supabase:", err);
      toast.error("Gagal mengambil data arsip dari Supabase.");
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 3. Filtered Documents Logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search by title / filename
      if (
        filters.searchQuery.trim() &&
        !doc.title.toLowerCase().includes(filters.searchQuery.toLowerCase().trim())
      ) {
        return false;
      }
      // Filter by category
      if (filters.category !== "ALL" && doc.category !== filters.category) {
        return false;
      }
      // Filter by year
      if (filters.year !== "ALL" && doc.year !== filters.year) {
        return false;
      }
      return true;
    });
  }, [documents, filters]);

  // 4. Logout Handler
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.info("Anda telah keluar dari SI-IKAN.");
    router.push("/login");
  };

  // 5. Handle Download
  const handleDownload = (doc: DocumentItem) => {
    toast.success(`Memulai unduhan: ${doc.title}`);
    const link = document.createElement("a");
    link.href = doc.file_url;
    link.download = doc.title;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. Handle Delete Document (Admin Only)
  const handleConfirmDelete = async (doc: DocumentItem) => {
    if (currentUser?.role !== "Admin") {
      toast.error("Hanya Administrator yang berwenang menghapus dokumen.");
      return;
    }

    try {
      const supabase = createClient();
      
      // 1. Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      // 2. Delete from Supabase storage if file path is in documents bucket
      if (doc.file_url.includes("/storage/v1/object/public/documents/")) {
        const filePath = doc.file_url.split("/documents/")[1];
        if (filePath) {
          await supabase.storage.from("documents").remove([filePath]);
        }
      }

      // Update state
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success(`Dokumen "${doc.title}" berhasil dihapus.`);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Gagal menghapus dokumen dari server Supabase.");
    }
  };

  // 7. Handle Upload New Document (Admin Only)
  const handleUploadSuccess = async ({
    file,
    title,
    category,
    year,
  }: {
    file: File;
    title: string;
    category: DocumentCategory;
    year: string;
  }) => {
    if (currentUser?.role !== "Admin") {
      toast.error("Hanya Administrator yang memiliki izin mengunggah dokumen.");
      return;
    }

    try {
      const supabase = createClient();
      
      // Sanitized filename for storage
      const fileExt = file.name.split(".").pop();
      const sanitizedName = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");
      const filePath = `${category}/${year}/${Date.now()}_${sanitizedName}.${fileExt}`;

      // Upload to Supabase Storage bucket 'documents'
      const { data: storageData, error: storageError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        throw new Error(`Gagal mengunggah ke Storage: ${storageError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Insert record to 'documents' table
      const { data: newDbDoc, error: dbError } = await supabase
        .from("documents")
        .insert({
          title,
          category,
          year,
          file_url: fileUrl,
          file_size: file.size,
          created_by: currentUser?.id,
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Gagal menyimpan data ke database: ${dbError.message}`);
      }

      if (newDbDoc) {
        setDocuments((prev) => [newDbDoc as DocumentItem, ...prev]);
      }

      toast.success(`Dokumen "${title}" berhasil diunggah ke Supabase!`);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Gagal mengunggah dokumen.");
      throw err;
    }
  };

  const isAdmin = currentUser?.role === "Admin";

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-emerald-200">
            Memverifikasi autentikasi sesi SI-IKAN...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950">
      {/* Top Header */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-7">
        {/* Dashboard Title & Admin Upload Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              Repositori Dokumen Keuangan, Anggaran & Perencanaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola dan telusuri dokumen DPA, LPPD, LKJIP, RENJA, RENSTRA, dan laporan lainnya secara terpadu.
            </p>
          </div>

          {/* Admin Upload Document Button (Hidden for User role) */}
          {isAdmin && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="gov"
                size="lg"
                onClick={() => setIsUploadModalOpen(true)}
                className="gap-2 font-bold shadow-md shadow-emerald-900/20"
              >
                <Plus className="h-5 w-5" />
                <span>Unggah Dokumen Baru</span>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats Overview */}
        <StatsCards documents={documents} />

        {/* Document Filters (Search Bar, Category Dropdown, Year Dropdown) */}
        <DocumentFilters
          filters={filters}
          onFilterChange={(newFilters) =>
            setFilters((prev) => ({ ...prev, ...newFilters }))
          }
          onReset={() =>
            setFilters({
              searchQuery: "",
              category: "ALL",
              year: "ALL",
            })
          }
          totalResults={filteredDocuments.length}
          totalAll={documents.length}
        />

        {/* Document Data Table */}
        <DocumentTable
          documents={filteredDocuments}
          userRole={currentUser?.role || "User"}
          onDownload={handleDownload}
          onDelete={(doc) => setDocToDelete(doc)}
          onView={(doc) => window.open(doc.file_url, "_blank", "noopener,noreferrer")}
          isLoading={isLoadingDocs}
        />
      </main>

      {/* Admin Upload Modal */}
      {isAdmin && (
        <UploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Admin Delete Confirmation Modal */}
      {isAdmin && (
        <DeleteConfirmModal
          document={docToDelete}
          open={Boolean(docToDelete)}
          onOpenChange={(open) => !open && setDocToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

      {/* PDF Quick Preview Modal */}
      <PdfViewerModal
        document={docToView}
        open={Boolean(docToView)}
        onOpenChange={(open) => !open && setDocToView(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
