-- ==============================================================================
-- SI-IKAN: Sistem Informasi Integrasi Keuangan, Anggaran & Perencanaan
-- Dinas Kelautan dan Perikanan Kabupaten Gunungkidul
-- Database Schema & Security Policies for Supabase (PostgreSQL)
-- ==============================================================================

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'User' CHECK (role IN ('Admin', 'User')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create DOCUMENTS Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'DPA',
        'LAPORAN KEUANGAN DAN CALK',
        'LKJIP',
        'LPPD',
        'MONEV',
        'PERJANJIAN KINERJA',
        'RENJA',
        'RENSTRA',
        'RKA'
    )),
    year TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create indexes for fast filtering and searching
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_year ON public.documents(year);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- 3. Helper Functions for Role Checking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'Admin' OR LOWER(email) LIKE '%admin%')
    )
    OR (LOWER(auth.jwt() ->> 'email') LIKE '%admin%')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to automatically create a Profile entry upon User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE 
      WHEN LOWER(new.email) LIKE '%admin%' THEN 'Admin'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'User')
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE 
      WHEN LOWER(EXCLUDED.email) LIKE '%admin%' THEN 'Admin'
      ELSE public.profiles.role
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles RLS Policies:
-- Users can view their own profile, Admins can view all profiles
CREATE POLICY "Users can view own profile or Admins view all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile (e.g. full_name), but cannot elevate their own role
CREATE POLICY "Users can update own profile name"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Documents RLS Policies:
-- Any authenticated user (Admin or User) can view/read documents
CREATE POLICY "Authenticated users can view documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Only Admins can insert documents
CREATE POLICY "Only Admins can insert documents"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only Admins can delete documents
CREATE POLICY "Only Admins can delete documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 6. SUPABASE STORAGE SETUP
-- Create the 'documents' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  52428800, -- 50 MB max
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- Storage RLS Policies:
-- Authenticated users can view and download files
CREATE POLICY "Authenticated users can download document files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

-- Only Admins can upload files to the documents bucket
CREATE POLICY "Only Admins can upload document files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND public.is_admin()
  );

-- Only Admins can delete files from the documents bucket
CREATE POLICY "Only Admins can delete document files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND public.is_admin()
  );
