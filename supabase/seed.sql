-- ==============================================================================
-- Sample Initial Seed Data for SI-IKAN
-- Dinas Kelautan dan Perikanan Kabupaten Gunungkidul
-- ==============================================================================

-- Sample Document Records (Government Reports across categories & years)
INSERT INTO public.documents (id, title, category, year, file_url, file_size, created_at)
VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'DPA-SKPD_DKP_Gunungkidul_TA_2024_Final.pdf',
    'DPA',
    '2024',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    2457600,
    NOW() - INTERVAL '45 days'
  ),
  (
    'a1b2c3d4-0002-4000-8000-000000000002',
    'DPA-Perubahan_DKP_Gunungkidul_TA_2024.pdf',
    'DPA',
    '2024',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    3145728,
    NOW() - INTERVAL '30 days'
  ),
  (
    'a1b2c3d4-0003-4000-8000-000000000003',
    'DPA-Murni_DKP_Gunungkidul_TA_2025.pdf',
    'DPA',
    '2025',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    1887436,
    NOW() - INTERVAL '5 days'
  ),
  (
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Laporan_Keuangan_dan_CALK_Audited_2024.pdf',
    'LAPORAN KEUANGAN DAN CALK',
    '2024',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    5242880,
    NOW() - INTERVAL '60 days'
  ),
  (
    'a1b2c3d4-0005-4000-8000-000000000005',
    'LKJIP_Laporan_Kinerja_Instansi_Pemerintah_DKP_2024.pdf',
    'LKJIP',
    '2024',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    4194304,
    NOW() - INTERVAL '20 days'
  ),
  (
    'a1b2c3d4-0006-4000-8000-000000000006',
    'LKJIP_Dinas_Kelautan_dan_Perikanan_Tahun_2025.pdf',
    'LKJIP',
    '2025',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    3845120,
    NOW() - INTERVAL '2 days'
  ),
  (
    'a1b2c3d4-0007-4000-8000-000000000007',
    'LPPD_Laporan_Penyelenggaraan_Pemerintahan_Daerah_2024.pdf',
    'LPPD',
    '2024',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    2987123,
    NOW() - INTERVAL '15 days'
  ),
  (
    'a1b2c3d4-0008-4000-8000-000000000008',
    'Laporan_Monev_Triwulan_IV_TA_2024_Kelautan_Perikanan.pdf',
    'MONEV',
    '2024',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    1677721,
    NOW() - INTERVAL '10 days'
  ),
  (
    'a1b2c3d4-0009-4000-8000-000000000009',
    'Perjanjian_Kinerja_Pejabat_Struktural_Tahun_2025.pdf',
    'PERJANJIAN KINERJA',
    '2025',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    1258291,
    NOW() - INTERVAL '8 days'
  ),
  (
    'a1b2c3d4-0010-4000-8000-000000000010',
    'RENJA_Rencana_Kerja_DKP_Gunungkidul_TA_2025.pdf',
    'RENJA',
    '2025',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    4718592,
    NOW() - INTERVAL '12 days'
  ),
  (
    'a1b2c3d4-0011-4000-8000-000000000011',
    'Rancangan_Awal_RENJA_TA_2026_DKP_Gunungkidul.pdf',
    'RENJA',
    '2026',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    2097152,
    NOW() - INTERVAL '1 day'
  ),
  (
    'a1b2c3d4-0012-4000-8000-000000000012',
    'RENSTRA_Rencana_Strategis_DKP_Gunungkidul_2021-2026.pdf',
    'RENSTRA',
    '2024',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    6815744,
    NOW() - INTERVAL '80 days'
  ),
  (
    'a1b2c3d4-0013-4000-8000-000000000013',
    'RKA_Rencana_Kerja_dan_Anggaran_DKP_TA_2025.pdf',
    'RKA',
    '2025',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    3460300,
    NOW() - INTERVAL '18 days'
  )
ON CONFLICT (id) DO NOTHING;
