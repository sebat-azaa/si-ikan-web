"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { DocumentFilters } from "@/components/DocumentFilters";
import { DocumentTable } from "@/components/DocumentTable";
import { UploadModal, UploadBatchItem, UploadProgress } from "@/components/UploadModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { PdfViewerModal } from "@/components/PdfViewerModal";
import { EditDocumentModal } from "@/components/EditDocumentModal";
import { ManageCategoriesModal } from "@/components/ManageCategoriesModal";
import { Button } from "@/components/ui/button";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import {
  DocumentItem,
  DocumentCategory,
  FilterState,
  UserProfile,
  UserRole,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getRoleFromEmail } from "@/lib/utils";
import { Plus, Loader2, Tag } from "lucide-react";
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
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);
  const [docToEdit, setDocToEdit] = useState<DocumentItem | null>(null);
  const [docToView, setDocToView] = useState<DocumentItem | null>(null);

  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>(DOCUMENT_CATEGORIES);

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

  // 2. Fetch Categories from Supabase, localStorage, and loaded documents
  const fetchCategories = async (currentDocs: DocumentItem[] = []) => {
    try {
      const supabase = createClient();
      let dbCatNames: string[] = [];

      try {
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("name")
          .order("name", { ascending: true });

        if (!catError && catData) {
          dbCatNames = catData.map((c) => c.name);
        }
      } catch (e) {
        // Categories table might not exist yet; fallback silently
      }

      // Check localStorage for persisted categories
      let localCatNames: string[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("siikan_custom_categories");
          if (raw) {
            localCatNames = JSON.parse(raw);
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      // Collect categories present in current documents
      const docCatNames = currentDocs.map((d) => d.category).filter(Boolean);

      const merged = Array.from(
        new Set([
          ...DOCUMENT_CATEGORIES,
          ...dbCatNames,
          ...localCatNames,
          ...docCatNames,
        ])
      );

      setCategories(merged);
    } catch (err) {
      console.warn("Error fetching categories:", err);
    }
  };

  // Add New Category Handler
  const handleAddCategory = async (newCategory: string) => {
    const formatted = newCategory.trim().toUpperCase();
    if (!formatted) return;

    // 1. Immediately update UI state
    setCategories((prev) => {
      if (prev.includes(formatted)) return prev;
      return [...prev, formatted];
    });

    // 2. Persist to localStorage
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("siikan_custom_categories");
        const existing = raw ? JSON.parse(raw) : [];
        if (!existing.includes(formatted)) {
          localStorage.setItem(
            "siikan_custom_categories",
            JSON.stringify([...existing, formatted])
          );
        }
      } catch (err) {
        console.warn("Failed to persist category to localStorage:", err);
      }
    }

    // 3. Persist to Supabase 'categories' table if it exists
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("categories")
        .insert({ name: formatted });
      if (error && error.code !== "23505") {
        console.warn("Could not insert category to Supabase table:", error.message);
      }
    } catch (err) {
      console.warn("Failed to save category to Supabase table:", err);
    }
  };

  // 3. Fetch Real Documents strictly from Supabase
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

      const docs = (data as DocumentItem[]) || [];
      setDocuments(docs);
      await fetchCategories(docs);
    } catch (err: any) {
      console.error("Failed to fetch documents from Supabase:", err);
      toast.error("Gagal mengambil data arsip dari Supabase.");
      setDocuments([]);
      await fetchCategories([]);
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

  // 7. Handle Upload Batch / Single Documents (Admin Only)
  const handleUploadBatch = async (
    items: UploadBatchItem[],
    onProgress?: (progress: UploadProgress) => void
  ) => {
    if (currentUser?.role !== "Admin") {
      toast.error("Hanya Administrator yang memiliki izin mengunggah dokumen.");
      return;
    }

    const supabase = createClient();
    const uploadedDocs: DocumentItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      onProgress?.({
        current: i + 1,
        total: items.length,
        currentFileName: item.file.name,
      });

      try {
        const fileExt = item.file.name.split(".").pop() || "pdf";
        const sanitizedName = item.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-");
        const filePath = `${item.category}/${item.year}/${Date.now()}_${i}_${sanitizedName}.${fileExt}`;

        // 1. Upload to Supabase Storage bucket 'documents'
        const { error: storageError } = await supabase.storage
          .from("documents")
          .upload(filePath, item.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (storageError) {
          throw new Error(`Gagal ke Storage: ${storageError.message}`);
        }

        // 2. Get public URL
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        const fileUrl = urlData.publicUrl;

        // 3. Insert record to 'documents' table
        const { data: newDbDoc, error: dbError } = await supabase
          .from("documents")
          .insert({
            title: item.title,
            category: item.category,
            year: item.year,
            file_url: fileUrl,
            file_size: item.file.size,
            created_by: currentUser?.id,
          })
          .select()
          .single();

        if (dbError) {
          throw new Error(`Gagal ke Database: ${dbError.message}`);
        }

        if (newDbDoc) {
          uploadedDocs.push(newDbDoc as DocumentItem);
        }
      } catch (err: any) {
        console.error(`Gagal mengunggah file ${item.file.name}:`, err);
        errors.push(`${item.file.name}: ${err.message}`);
      }
    }

    // Update documents state immediately
    if (uploadedDocs.length > 0) {
      setDocuments((prev) => [...uploadedDocs, ...prev]);

      // Update categories state if needed
      setCategories((prev) => {
        const batchCategories = items.map((it) => it.category);
        return Array.from(new Set([...prev, ...batchCategories]));
      });
    }

    if (errors.length > 0) {
      if (uploadedDocs.length > 0) {
        toast.warning(
          `Berhasil mengunggah ${uploadedDocs.length} berkas. ${errors.length} berkas gagal.`
        );
      } else {
        throw new Error(`Gagal mengunggah berkas: ${errors.join(", ")}`);
      }
    } else {
      toast.success(
        items.length === 1
          ? `Dokumen "${items[0].title}" berhasil diunggah ke Supabase!`
          : `Berhasil mengunggah ${uploadedDocs.length} berkas PDF ke repositori SI-IKAN!`
      );
    }
  };

  // 8. Handle Edit Document Metadata (Admin Only)
  const handleEditDocumentSuccess = async ({
    id,
    title,
    category,
    year,
  }: {
    id: string;
    title: string;
    category: DocumentCategory;
    year: string;
  }) => {
    if (currentUser?.role !== "Admin") {
      toast.error("Hanya Administrator yang memiliki izin mengedit dokumen.");
      return;
    }

    try {
      const supabase = createClient();
      const { data: updatedDoc, error } = await supabase
        .from("documents")
        .update({
          title,
          category,
          year,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Gagal memperbarui data di database: ${error.message}`);
      }

      // Update state immediately
      if (updatedDoc) {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? (updatedDoc as DocumentItem) : doc))
        );
      }

      // Ensure category is in categories list
      setCategories((prev) => {
        if (prev.includes(category)) return prev;
        return [...prev, category];
      });

      toast.success(`Rincian dokumen "${title}" berhasil diperbarui!`);
    } catch (err: any) {
      console.error("Edit document error:", err);
      toast.error(err.message || "Gagal memperbarui rincian dokumen.");
      throw err;
    }
  };

  // 9. Handle Rename Category with Cascading Update (Admin Only)
  const handleRenameCategory = async (oldCategory: string, newCategory: string) => {
    if (currentUser?.role !== "Admin") {
      toast.error("Hanya Administrator yang memiliki izin mengubah kategori.");
      return;
    }

    const formattedOld = oldCategory.trim().toUpperCase();
    const formattedNew = newCategory.trim().toUpperCase();

    if (!formattedNew || formattedOld === formattedNew) return;

    try {
      const supabase = createClient();

      // 1. Attempt stored procedure 'rename_category' (cascading update)
      let rpcSucceeded = false;
      try {
        const { error: rpcError } = await supabase.rpc("rename_category", {
          old_name: formattedOld,
          new_name: formattedNew,
        });
        if (!rpcError) {
          rpcSucceeded = true;
        } else {
          console.warn("RPC rename_category note/fallback:", rpcError.message);
        }
      } catch (e) {
        console.warn("RPC rename_category exception, falling back to direct table updates:", e);
      }

      // 2. If RPC was not available, run direct cascading table updates
      if (!rpcSucceeded) {
        // Update categories table
        await supabase
          .from("categories")
          .update({ name: formattedNew })
          .eq("name", formattedOld);

        // Cascade update documents table
        const { error: docUpdateError } = await supabase
          .from("documents")
          .update({ category: formattedNew })
          .eq("category", formattedOld);

        if (docUpdateError) {
          throw new Error(`Gagal memperbarui dokumen berantai: ${docUpdateError.message}`);
        }
      }

      // 3. Update frontend category list immediately
      setCategories((prev) =>
        prev.map((c) => (c === formattedOld ? formattedNew : c))
      );

      // 4. Update documents state immediately (all docs with old category get new category)
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.category === formattedOld
            ? { ...doc, category: formattedNew as DocumentCategory }
            : doc
        )
      );

      // 5. If active filter was set to the renamed category, update filter seamlessly
      setFilters((prev) =>
        prev.category === formattedOld
          ? { ...prev, category: formattedNew as DocumentCategory }
          : prev
      );

      // 6. Update localStorage persistent cache
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("siikan_custom_categories");
          if (raw) {
            const saved = JSON.parse(raw) as string[];
            const updated = saved.map((c) => (c === formattedOld ? formattedNew : c));
            localStorage.setItem("siikan_custom_categories", JSON.stringify(updated));
          }
        } catch (e) {
          console.warn("Failed updating localStorage categories:", e);
        }
      }

      toast.success(
        `Kategori "${formattedOld}" berhasil diubah menjadi "${formattedNew}" dan semua dokumen terkait telah diperbarui!`
      );
    } catch (err: any) {
      console.error("Rename category error:", err);
      toast.error(err.message || "Gagal mengubah nama kategori.");
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

          {/* Admin Action Buttons (Hidden for User role) */}
          {isAdmin && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsManageCategoriesOpen(true)}
                className="gap-2 font-bold bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                title="Kelola & Ubah Nama Kategori"
              >
                <Tag className="h-4 w-4 text-emerald-600" />
                <span>Kelola Kategori</span>
              </Button>
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
        <StatsCards documents={documents} totalCategories={categories.length} />

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
          categories={categories}
          isAdmin={isAdmin}
          onManageCategories={() => setIsManageCategoriesOpen(true)}
          totalResults={filteredDocuments.length}
          totalAll={documents.length}
        />

        {/* Document Data Table */}
        <DocumentTable
          documents={filteredDocuments}
          userRole={currentUser?.role || "User"}
          onDownload={handleDownload}
          onDelete={(doc) => setDocToDelete(doc)}
          onEdit={(doc) => setDocToEdit(doc)}
          onView={(doc) => window.open(doc.file_url, "_blank", "noopener,noreferrer")}
          isLoading={isLoadingDocs}
        />
      </main>

      {/* Admin Upload Modal */}
      {isAdmin && (
        <UploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          onUploadBatch={handleUploadBatch}
          availableCategories={categories}
          onAddNewCategory={handleAddCategory}
        />
      )}

      {/* Admin Edit Document Modal */}
      {isAdmin && (
        <EditDocumentModal
          document={docToEdit}
          open={Boolean(docToEdit)}
          onOpenChange={(open) => !open && setDocToEdit(null)}
          onSaveSuccess={handleEditDocumentSuccess}
          availableCategories={categories}
        />
      )}

      {/* Admin Manage Categories Modal */}
      {isAdmin && (
        <ManageCategoriesModal
          open={isManageCategoriesOpen}
          onOpenChange={setIsManageCategoriesOpen}
          categories={categories}
          documents={documents}
          onRenameCategory={handleRenameCategory}
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
