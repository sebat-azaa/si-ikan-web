# SI-IKAN (Sistem Informasi Integrasi Keuangan, Anggaran & Perencanaan)
### Dinas Kelautan dan Perikanan Kabupaten Gunungkidul

![SI-IKAN Banner](https://img.shields.io/badge/SI--IKAN-DKP%20Gunungkidul-047857?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14%20(App%20Router)-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Emerald%20Gov%20Theme-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20Database%20%7C%20Storage-3ECF8E?style=for-the-badge&logo=supabase)

---

## 📌 Ringkasan Sistem

**SI-IKAN** adalah sistem repositori dokumen terpadu berbasis web yang dirancang khusus untuk memfasilitasi pengelolaan arsip laporan perencanaan, anggaran, dan kinerja kedinasan di lingkungan **Dinas Kelautan dan Perikanan Kabupaten Gunungkidul**.

Berbeda dengan sistem berbasis folder hierarkis yang rumit, SI-IKAN menerapkan **Arsitektur Berbasis Tag & Metadata** (kategori laporan & tahun anggaran) yang mempermudah pencarian dan pengunduhan berkas dalam hitungan detik.

---

## 🌟 Fitur Utama & Matriks Hak Akses

| Fitur | Pegawai (User) | Administrator (Admin) |
| :--- | :---: | :---: |
| **Login Resmi & Proteksi Rute** | ✅ | ✅ |
| **Lihat Tabel Data Arsip Laporan** | ✅ | ✅ |
| **Pencarian Nama Dokumen/Berkas** | ✅ | ✅ |
| **Filter Berdasarkan Kategori Laporan** | ✅ | ✅ |
| **Filter Berdasarkan Tahun Anggaran** | ✅ | ✅ |
| **Unduh Berkas PDF** | ✅ | ✅ |
| **Unggah Dokumen PDF Baru** | ❌ *(Disembunyikan)* | ✅ |
| **Hapus Dokumen Arsip** | ❌ *(Disembunyikan)* | ✅ |

---

## 📑 Kategori Dokumen Resmi

1. **DPA** (Dokumen Pelaksanaan Anggaran)
2. **LAPORAN KEUANGAN DAN CALK** (Catatan atas Laporan Keuangan)
3. **LKJIP** (Laporan Kinerja Instansi Pemerintah)
4. **LPPD** (Laporan Penyelenggaraan Pemerintahan Daerah)
5. **MONEV** (Monitoring dan Evaluasi)
6. **PERJANJIAN KINERJA**
7. **RENJA** (Rencana Kerja)
8. **RENSTRA** (Rencana Strategis)
9. **RKA** (Rencana Kerja dan Anggaran)

---

## 🏗️ Struktur Proyek

```
siikan/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root Layout & Sonner Toaster
│   │   ├── globals.css             # Tailwind styling & Emerald Gov theme
│   │   ├── page.tsx                # Main Dashboard (Filters, Table, Admin Modals)
│   │   ├── login/
│   │   │   └── page.tsx            # Official DKP Gunungkidul Login Page
│   │   └── auth/callback/
│   │       └── route.ts            # Supabase Auth Session Callback
│   ├── components/
│   │   ├── Header.tsx              # Official Top Navigation Bar & User Profile Badge
│   │   ├── StatsCards.tsx          # Summary Statistics Cards
│   │   ├── DocumentFilters.tsx     # 3 Search & Filtering Controls
│   │   ├── DocumentTable.tsx       # Responsive Data Table with Role Permissions
│   │   ├── UploadModal.tsx         # Admin Upload Dialog (PDF validation, Metadata)
│   │   ├── DeleteConfirmModal.tsx  # Admin Delete Confirmation Dialog
│   │   ├── PdfViewerModal.tsx      # In-browser PDF Viewer
│   │   └── ui/                     # Shadcn-inspired UI components
│   ├── lib/
│   │   ├── constants.ts            # Categories, Years, DKP Branding
│   │   ├── types.ts                # TypeScript Interfaces & Definitions
│   │   ├── utils.ts                # Date formatting, Byte formatting, Class merging
│   │   ├── mockData.ts             # Sample Realistic Initial Dataset
│   │   └── supabase/
│   │       ├── client.ts           # Supabase Browser Client
│   │       ├── server.ts           # Supabase Server Client
│   │       └── middleware.ts       # Auth Refresh & Route Protection
│   └── middleware.ts               # Next.js Middleware Gatekeeper
├── supabase/
│   ├── schema.sql                  # PostgreSQL Schema, RLS, Storage & Trigger
│   └── seed.sql                    # Initial Sample Dataset
├── .env.example                    # Template Environment Variables
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Panduan Menjalankan Proyek

### 1. Prasyarat
- Node.js versi 18+ atau 20+
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lalu isi kredensial dari project Supabase Anda (Project Settings -> API):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Eksekusi SQL di Supabase
Buka **SQL Editor** di Dashboard Supabase Anda, lalu:
1. Jalankan isi file [`supabase/schema.sql`](supabase/schema.sql) untuk membuat tabel `profiles`, `documents`, storage bucket `documents`, dan policy Row-Level Security (RLS).
2. (Opsional) Jalankan isi file [`supabase/seed.sql`](supabase/seed.sql) untuk mengisi data dokumen awal.

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## ☁️ Panduan Deployment ke Vercel

1. Push repositori ini ke GitHub / GitLab.
2. Buka [Vercel Dashboard](https://vercel.com) dan pilih **Add New Project**.
3. Import repositori `siikan`.
4. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Klik **Deploy**. Selesai!
"# si-ikan-web" 
