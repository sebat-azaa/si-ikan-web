export type DocumentCategory =
  | 'DPA'
  | 'LAPORAN KEUANGAN DAN CALK'
  | 'LKJIP'
  | 'LPPD'
  | 'MONEV'
  | 'PERJANJIAN KINERJA'
  | 'RENJA'
  | 'RENSTRA'
  | 'RKA';

export type UserRole = 'Admin' | 'User';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  year: string;
  file_url: string;
  file_size?: number;
  created_by?: string;
  created_at: string;
}

export interface FilterState {
  searchQuery: string;
  category: DocumentCategory | 'ALL';
  year: string | 'ALL';
}
