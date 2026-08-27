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
import { INITIAL_MOCK_DOCUMENTS } from "@/lib/mockData";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getRoleFromEmail } from "@/lib/utils";
import { Plus, Download, FileUp, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const supabaseConfigured = isSupabaseConfigured();

  // User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Documents State
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_MOCK_DOCUMENTS);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

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

  // 1. Authenticate & Fetch Profile
  useEffect(() => {
    let authListener: { unsubscribe: () => void } | null = null;

    async function loadUser() {
      try {
        if (!supabaseConfigured) {
          // Check local storage for demo user
          const stored = localStorage.getItem("siikan_demo_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            const role: UserRole = getRoleFromEmail(parsed.email);
            setCurrentUser({ ...parsed, role });
          } else {
            setCurrentUser({
              id: "demo-admin-id",
              email: "admin.dkp@gunungkidulkab.go.id",
              full_name: "Admin DKP Gunungkidul",
              role: "Admin",
            });
          }
          setIsLoadingAuth(false);
          return;
        }

        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/login");
          return;
        }

        const userEmail = session.user.email || "";
        // Strict authorization: email containing "admin" => 'Admin', else 'User'
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
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadUser();

    return () => {
      authListener?.unsubscribe();
    };
  }, [supabaseConfigured, router]);

  // 2. Fetch Documents from Supabase or Local Storage
  const fetchDocuments = async () => {
    if (!supabaseConfigured) {
      // Check local storage for saved documents
      const savedDocs = localStorage.getItem("siikan_documents");
      if (savedDocs) {
        try {
          setDocuments(JSON.parse(savedDocs));
        } catch {
          setDocuments(INITIAL_MOCK_DOCUMENTS);
        }
      } else {
        setDocuments(INITIAL_MOCK_DOCUMENTS);
      }
      return;
    }

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

      if (data && data.length > 0) {
        setDocuments(data as DocumentItem[]);
      } else {
        setDocuments(INITIAL_MOCK_DOCUMENTS);
      }
    } catch (err: any) {
      console.error("Failed to fetch documents from Supabase:", err);
      toast.error("Gagal mengambil data dari Supabase. Menampilkan data lokal.");
      setDocuments(INITIAL_MOCK_DOCUMENTS);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [supabaseConfigured]);

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
    if (supabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem("siikan_demo_user");
    }
    toast.info("Anda telah keluar dari SI-IKAN.");
    router.push("/login");
  };

  // 5. Handle Download
  const handleDownload = (doc: DocumentItem) => {
    toast.success(`Memulai unduhan: ${doc.title}`);
    // Trigger download
    const link = document.createElement("a");
    link.href = doc.file_url;
    link.download = doc.title;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Handle Delete Document (Admin Only)
  const handleConfirmDelete = async (doc: DocumentItem) => {
    if (currentUser?.role !== "Admin") {
      toast.error("Hanya Administrator yang berwenang menghapus dokumen.");
      return;
    }

    try {
      if (supabaseConfigured) {
        const supabase = createClient();
        
        // 1. Delete from database
        const { error: dbError } = await supabase
          .from("documents")
          .delete()
          .eq("id", doc.id);

        if (dbError) throw dbError;

        // 2. Optionally delete from storage if file_url is a Supabase path
        if (doc.file_url.includes("/storage/v1/object/public/documents/")) {
          const filePath = doc.file_url.split("/documents/")[1];
          if (filePath) {
            await supabase.storage.from("documents").remove([filePath]);
          }
        }
      }

      // Update local state
      const updatedDocs = documents.filter((d) => d.id !== doc.id);
      setDocuments(updatedDocs);
      if (!supabaseConfigured) {
        localStorage.setItem("siikan_documents", JSON.stringify(updatedDocs));
      }

      toast.success(`Dokumen "${doc.title}" berhasil dihapus.`);
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Gagal menghapus dokumen dari server.");
    }
  };

  // 8. Handle Upload New Document (Admin Only)
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

    let fileUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    if (supabaseConfigured) {
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

      fileUrl = urlData.publicUrl;

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
    } else {
      // Local fallback simulation
      const newDoc: DocumentItem = {
        id: `mock-${Date.now()}`,
        title,
        category,
        year,
        file_url: URL.createObjectURL(file),
        file_size: file.size,
        created_at: new Date().toISOString(),
      };
      const updatedDocs = [newDoc, ...documents];
      setDocuments(updatedDocs);
      localStorage.setItem("siikan_documents", JSON.stringify(updatedDocs));
    }

    toast.success(`Dokumen "${title}" berhasil diunggah!`);
  };

  const isAdmin = currentUser?.role === "Admin";

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950">
      {/* Top Header */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        isMockMode={!supabaseConfigured}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-7">
        {/* Banner Alert for offline/demo configuration */}
        {!supabaseConfigured && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-300/80 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Mode Pratinjau Interaktif Aktif:</strong> Anda dapat menguji seluruh fungsi pencarian, filter, unduh, hapus, dan unggah dokumen PDF secara langsung. Hubungkan variabel Supabase di <code className="font-mono font-semibold">.env.local</code> untuk sinkronisasi cloud penuh.
              </span>
            </div>
          </div>
        )}

        {/* Dashboard Title & Admin Upload Action Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              Repositori Dokumen Perencanaan & Kinerja
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
          onView={(doc) => setDocToView(doc)}
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
