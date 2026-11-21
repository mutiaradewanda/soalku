import React, { createContext, useContext, useState, useEffect } from "react";
import {
  SoalReview,
  SiswaBinaan,
  KodeUndangan,
  TopikEvaluasi,
  StatusReview,
} from "../types/mentor";

interface MentorContextType {
  soalList: SoalReview[];
  siswaList: SiswaBinaan[];
  kodeUndanganList: KodeUndangan[];
  topikEvaluasiList: TopikEvaluasi[];

  // Soal Review Actions
  approveSoal: (soalId: number, reviewer?: string) => void;
  rejectSoal: (soalId: number, alasan: string, reviewer?: string) => void;
  editSoal: (soalId: number, updatedData: Partial<SoalReview>) => void;
  bulkApproveSoal: (soalIds: number[], reviewer?: string) => void;
  bulkRejectSoal: (soalIds: number[], alasan: string, reviewer?: string) => void;
  resetBankSoal: () => void;

  // Siswa Binaan Actions
  updateCatatanSiswa: (siswaId: string, catatan: string) => void;
  updateStatusRemedial: (siswaId: string, status: "Perlu Remedial" | "Bimbingan" | "Tuntas") => void;
  catatHasilRemedial: (
    siswaNama: string,
    topikNama: string,
    skor: number
  ) => { isLulus: boolean; message: string };
  catatAktivitasSiswa: (
    siswaNama: string,
    sesi: {
      idSesi: string;
      tingkat: "SD" | "SMP";
      mapel: string;
      mode: string;
      skor: number;
      totalBenar: number;
      totalSalah: number;
      totalSoal: number;
      topik?: string;
    }
  ) => void;
  getSiswaByNama: (nama: string) => SiswaBinaan | undefined;

  // Kode Undangan Actions
  createKodeUndangan: (
    targetTingkat?: "SD" | "SMP" | "SEMUA",
    customPrefix?: string,
    dibuatOleh?: string
  ) => KodeUndangan;
  salinKodeUndangan: (kode: string) => void;
  redeemKodeUndangan: (
    kode: string,
    studentTingkat?: "SD" | "SMP",
    studentNama?: string
  ) => { success: boolean; message: string; kodeObj?: KodeUndangan };

  // Helper getters
  getPendingCount: () => number;
  getApprovedCount: () => number;
  getRejectedCount: () => number;
}

const STORAGE_KEY_SOAL = "soalku_bank_soal_review";
const STORAGE_KEY_SISWA = "soalku_siswa_binaan";
const STORAGE_KEY_KODE = "soalku_kode_undangan";
const STORAGE_KEY_TOPIK = "soalku_mentor_topik_evaluasi";

const INITIAL_SOAL_LIST: SoalReview[] = [
  {
    id: 12,
    pertanyaan:
      "Enzim renin berfungsi menggumpalkan protein susu (kasein). Pada bayi mamalia dan manusia, sekresi enzim renin berlangsung sangat aktif karena...",
    tingkat: "SMP",
    mataPelajaran: "IPA Biologi",
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    modulAsal: "Modul 4.1 - Biologi Sistem Pencernaan",
    tingkatKesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Bayi belum memiliki gigi geligi untuk mengunyah", isBenar: false },
      { label: "B", teks: "Sumber asupan nutrisi utama bayi adalah ASI / susu", isBenar: true },
      { label: "C", teks: "Dinding lambung bayi belum mampu memproduksi cairan asam klorida (HCl)", isBenar: false },
      { label: "D", teks: "Usus halus bayi belum berkembang secara sempurna", isBenar: false },
    ],
    pembahasan:
      "Enzim renin disekresikan secara optimal oleh lambung bayi untuk mengendapkan kasein susu agar dapat dicerna lebih lanjut oleh pepsin sebelum masuk ke duodenum.",
    tipsAdaptif: "Rumus Cepat: Renin = R-e-n-i-n (Reaksi Endapan Nutrisi ASI/Susu).",
    aiConfidence: 96,
    statusReview: "MENUNGGU",
    tanggalDibuat: "2026-10-24 10:15",
  },
  {
    id: 13,
    pertanyaan:
      "Tekanan darah sistolik pada manusia dicatat saat ruang bilik jantung (ventrikel) sedang mengalami...",
    tingkat: "SMP",
    mataPelajaran: "IPA Fisika & Biologi",
    topik: "Fungsi Bilik Jantung & Katup Aorta",
    modulAsal: "Modul 4.2 - Sistem Peredaran Darah Manusia",
    tingkatKesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Kontraksi maksimal untuk memompa darah keluar ke pembuluh arteri", isBenar: true },
      { label: "B", teks: "Relaksasi dan menerima aliran darah balik dari atrium", isBenar: false },
      { label: "C", teks: "Penutupan katup bikuspidalis secara pasif saat pengisian", isBenar: false },
      { label: "D", teks: "Pembekuan trombosit di dalam arteri pulmonalis", isBenar: false },
    ],
    pembahasan:
      "Tekanan sistolik dihasilkan akibat kontraksi otot ventrikel (bilik) jantung yang mendesak darah keluar melalui katup semilunaris aorta.",
    tipsAdaptif: "Sistol = Sempit/Sembur (Kontraksi). Diastol = Diam/Datar (Relaksasi).",
    aiConfidence: 94,
    statusReview: "MENUNGGU",
    tanggalDibuat: "2026-10-24 10:45",
  },
  {
    id: 14,
    pertanyaan:
      "Pada proses fotosintesis tumbuhan hijau, zat yang dihasilkan dan dilepaskan ke udara bebas untuk pernapasan makhluk hidup adalah...",
    tingkat: "SD",
    mataPelajaran: "Ilmu Pengetahuan Alam",
    topik: "Tumbuhan Hijau & Fotosintesis",
    modulAsal: "Modul Bab 2 - Tumbuhan Sahabat Kita",
    tingkatKesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Gas Karbondioksida (CO2)", isBenar: false },
      { label: "B", teks: "Gas Oksigen (O2)", isBenar: true },
      { label: "C", teks: "Gas Nitrogen Bebas", isBenar: false },
    ],
    pembahasan:
      "Fotosintesis menyerap karbon dioksida dan air dengan bantuan cahaya matahari dan klorofil, menghasilkan glukosa dan melepaskan gas oksigen (O2).",
    tipsAdaptif: "Fotosintesis: Menghirup Racun (CO2), Menghembuskan Berkah Hidup (Oksigen O2).",
    aiConfidence: 98,
    statusReview: "MENUNGGU",
    tanggalDibuat: "2026-10-24 11:20",
  },
  {
    id: 15,
    pertanyaan:
      "Enzim ptialin (amilase mulut) yang bekerja pada suasana pH netral di rongga mulut bertugas menguraikan amilum menjadi senyawa...",
    tingkat: "SMP",
    mataPelajaran: "IPA Terpadu",
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    modulAsal: "Modul 4.1 - Biologi Sistem Pencernaan",
    tingkatKesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Maltosa (Disakarida)", isBenar: true },
      { label: "B", teks: "Asam Lemak dan Gliserol", isBenar: false },
      { label: "C", teks: "Asam Amino Polipeptida", isBenar: false },
      { label: "D", teks: "Asam Klorida (HCl)", isBenar: false },
    ],
    pembahasan:
      "Ptialin menguraikan karbohidrat kompleks (polisakarida/amilum) menjadi disakarida sederhana seperti maltosa sebelum ditelan menuju lambung.",
    tipsAdaptif: "Mulut = M-P-M (Mulut - Ptialin - Maltosa)",
    aiConfidence: 95,
    statusReview: "MENUNGGU",
    tanggalDibuat: "2026-10-24 11:40",
  },
  {
    id: 7,
    pertanyaan:
      "Perhatikan gambar organ pencernaan berikut! Enzim pepsin dan asam klorida (HCl) yang berfungsi mengaktifkan pepsinogen serta membunuh kuman penyakit dihasilkan pada bagian organ yang ditunjukkan oleh nomor...",
    tingkat: "SMP",
    mataPelajaran: "IPA Biologi",
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    modulAsal: "Modul 4.1 - Biologi Sistem Pencernaan",
    tingkatKesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Mulut — Organ nomor (1)", isBenar: false },
      { label: "B", teks: "Lambung — Organ nomor (2)", isBenar: true },
      { label: "C", teks: "Hati — Organ nomor (3)", isBenar: false },
      { label: "D", teks: "Usus Halus — Organ nomor (4)", isBenar: false },
    ],
    pembahasan:
      "Organ nomor (2) adalah Lambung (Ventrikulus). Dinding mukosa lambung memiliki kelenjar lambung yang menghasilkan getah lambung berisi HCl, pepsinogen, dan renin.",
    tipsAdaptif: "Ingat singkatan [R-P-L]: Renin, Pepsin, Lambung (HCl)",
    aiConfidence: 99,
    statusReview: "DISETUJUI",
    tanggalDibuat: "2026-10-23 09:00",
    reviewer: "Bu Ratna Kumalasari, S.Pd.",
  },
  {
    id: 9,
    pertanyaan:
      "Mengapa dinding otot bilik kiri (ventrikel sinister) jantung berukuran jauh lebih tebal dan elastis dibandingkan dinding bilik kanan?",
    tingkat: "SMP",
    mataPelajaran: "IPA Biologi",
    topik: "Fungsi Bilik Jantung & Katup Aorta",
    modulAsal: "Modul 4.2 - Sistem Peredaran Darah Manusia",
    tingkatKesulitan: "SULIT",
    opsi: [
      { label: "A", teks: "Karena hanya bertugas memompa darah dekat menuju organ paru-paru", isBenar: false },
      { label: "B", teks: "Karena memerlukan gaya dorong bertekanan tinggi untuk mengalirkan darah ke seluruh organ tubuh", isBenar: true },
      { label: "C", teks: "Karena menerima darah kotor dengan kandungan gas CO2 yang pekat", isBenar: false },
      { label: "D", teks: "Karena katup trikuspidalis bekerja lebih lambat", isBenar: false },
    ],
    pembahasan:
      "Bilik kiri memompa darah bersih kaya O2 ke seluruh peredaran sistemik (seluruh tubuh), sehingga membutuhkan miokardium yang jauh lebih tebal dibanding bilik kanan yang hanya memompa ke paru-paru.",
    tipsAdaptif: "Bilik Kiri = Keliling Tubuh (Beban Besar -> Otot Tebal)",
    aiConfidence: 97,
    statusReview: "DISETUJUI",
    tanggalDibuat: "2026-10-23 09:30",
    reviewer: "Bu Ratna Kumalasari, S.Pd.",
  },
  {
    id: 16,
    pertanyaan:
      "Tentukan rumus kimia asam lambung dalam skala molalitas standar tanpa melibatkan reaksi pengikatan enzim!",
    tingkat: "SMP",
    mataPelajaran: "IPA Terpadu",
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    modulAsal: "Modul 4.1 - Biologi Sistem Pencernaan",
    tingkatKesulitan: "SULIT",
    opsi: [
      { label: "A", teks: "H2SO4 pekat 2 Molar", isBenar: false },
      { label: "B", teks: "HCl 0.1 N pekat", isBenar: false },
      { label: "C", teks: "CH3COOH 5%", isBenar: false },
      { label: "D", teks: "HNO3 pekat", isBenar: false },
    ],
    pembahasan: "Pertanyaan ditolak karena materi berada di luar cakupan Kurikulum IPA SMP Bab 4.",
    aiConfidence: 54,
    statusReview: "DITOLAK",
    catatanReviewer: "Materi stoikiometri molalitas asam terlalu rumit untuk siswa SMP kelas 8. Tidak relevan dengan indikator KD Biologi.",
    tanggalDibuat: "2026-10-23 14:00",
    reviewer: "Bu Ratna Kumalasari, S.Pd.",
  },
  {
    id: 17,
    pertanyaan:
      "Faktorkan bentuk aljabar selisih dua kuadrat berikut secara tepat: 9x² - 16y² = ...",
    tingkat: "SMP",
    mataPelajaran: "Matematika",
    topik: "Faktorisasi Aljabar Bentuk Kuadrat",
    modulAsal: "Modul 3.2 - Aljabar & Faktorisasi",
    tingkatKesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "(3x - 4y)(3x + 4y)", isBenar: true },
      { label: "B", teks: "(3x - 4y)(3x - 4y)", isBenar: false },
      { label: "C", teks: "(9x - 16y)(x + y)", isBenar: false },
      { label: "D", teks: "(3x + 16y)(3x - y)", isBenar: false },
    ],
    pembahasan:
      "Bentuk a² - b² dapat difaktorkan menjadi (a - b)(a + b). Di sini a = 3x dan b = 4y, sehingga faktornya adalah (3x - 4y)(3x + 4y).",
    tipsAdaptif: "Rumus Cepat: a² - b² = (a - b)(a + b).",
    aiConfidence: 97,
    statusReview: "MENUNGGU",
    tanggalDibuat: "2026-10-25 08:30",
  },
  {
    id: 18,
    pertanyaan:
      "Sudut pandang pengarang yang menggunakan kata ganti orang pertama seperti 'aku' atau 'saya' sebagai pelaku utama dalam cerpen disebut sudut pandang...",
    tingkat: "SMP",
    mataPelajaran: "B. Indonesia",
    topik: "Unsur Intrinsik Cerpen & Sudut Pandang",
    modulAsal: "Modul Bab 5 - Teks Cerita Pendek",
    tingkatKesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Orang pertama tokoh utama", isBenar: true },
      { label: "B", teks: "Orang ketiga serba tahu", isBenar: false },
      { label: "C", teks: "Orang ketiga pengamat", isBenar: false },
      { label: "D", teks: "Orang kedua jamak", isBenar: false },
    ],
    pembahasan:
      "Penggunaan kata ganti 'aku' atau 'saya' di mana tokoh tersebut menjadi pusat penceritaan dan mengalami peristiwa utama disebut sudut pandang orang pertama tokoh utama.",
    tipsAdaptif: "Kata kunci: 'Aku' / 'Saya' = Orang Pertama.",
    aiConfidence: 98,
    statusReview: "MENUNGGU",
    tanggalDibuat: "2026-10-25 09:15",
  },
];

const INITIAL_SISWA_LIST: SiswaBinaan[] = [];

const INITIAL_KODE_UNDANGAN: KodeUndangan[] = [];

const INITIAL_TOPIK_EVALUASI: TopikEvaluasi[] = [
  {
    id: 1,
    bagianMateriId: 103,
    namaTopik: "Fungsi Bilik Jantung & Katup Aorta",
    mataPelajaran: "IPA Biologi",
    tingkat: "SMP",
    totalDikerjakan: 24,
    totalBenar: 10,
    persentaseAkurasi: 42,
    statusPenguasaan: "Perlu Remedial",
    rekomendasiAksi: "Pelajari kembali skema sirkulasi peredaran darah ganda dan fungsi katup semilunaris aorta.",
    tipsPenguatan: "Bilik Kiri = Tekanan Besar ke Seluruh Tubuh (Otot Paling Tebal). Katup Aorta = Mencegah darah balik ke Bilik Kiri.",
  },
  {
    id: 2,
    bagianMateriId: 101,
    namaTopik: "Enzim Lambung & Organ Pencernaan Manusia",
    mataPelajaran: "IPA Biologi",
    tingkat: "SMP",
    totalDikerjakan: 36,
    totalBenar: 20,
    persentaseAkurasi: 56,
    statusPenguasaan: "Perlu Remedial",
    rekomendasiAksi: "Fokus pada pemisahan enzim getah lambung (pepsin, renin, HCl) vs enzim usus halus pankreas (tripsin, amilase, lipase).",
    tipsPenguatan: "Gunakan rumus [R-P-L]: Renin endapkan kasein, Pepsin ubah protein ke pepton, Lambung asam (HCl).",
  },
  {
    id: 3,
    bagianMateriId: 104,
    namaTopik: "Faktorisasi Aljabar Bentuk Kuadrat",
    mataPelajaran: "Matematika",
    tingkat: "SMP",
    totalDikerjakan: 28,
    totalBenar: 20,
    persentaseAkurasi: 71,
    statusPenguasaan: "Perlu Penguatan",
    rekomendasiAksi: "Tingkatkan latihan faktorisasi bentuk selisih kuadrat a^2 - b^2 = (a-b)(a+b).",
    tipsPenguatan: "Selisih dua kuadrat selalu memiliki akar faktor berlawanan tanda.",
  },
  {
    id: 4,
    bagianMateriId: 105,
    namaTopik: "Unsur Intrinsik Cerpen & Sudut Pandang",
    mataPelajaran: "B. Indonesia",
    tingkat: "SMP",
    totalDikerjakan: 22,
    totalBenar: 19,
    persentaseAkurasi: 86,
    statusPenguasaan: "Tuntas & Sangat Baik",
    rekomendasiAksi: "Penguasaan konsep sudah sangat prima. Siap untuk soal HOTS pembanding dua teks sastra.",
    tipsPenguatan: "Sudut pandang orang pertama ditandai kata ganti 'Aku' / 'Saya' sebagai tokoh pelaku.",
  },
  {
    id: 5,
    bagianMateriId: 102,
    namaTopik: "Proses Penyerapan Nutrisi di Usus Halus",
    mataPelajaran: "IPA Biologi",
    tingkat: "SMP",
    totalDikerjakan: 18,
    totalBenar: 16,
    persentaseAkurasi: 89,
    statusPenguasaan: "Tuntas & Sangat Baik",
    rekomendasiAksi: "Pemahaman vili usus dan kapiler limfa sangat baik. Pertahankan konsistensi.",
    tipsPenguatan: "Glukosa diserap kapiler darah, asam lemak diserap pembuluh kil / limfa.",
  },
];

const MentorContext = createContext<MentorContextType | undefined>(undefined);

export const MentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soalList, setSoalList] = useState<SoalReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOAL);
      if (saved) {
        const parsed: SoalReview[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((s) => s.id));
        const missing = INITIAL_SOAL_LIST.filter((s) => !existingIds.has(s.id));
        return [...parsed, ...missing];
      }
      return INITIAL_SOAL_LIST;
    } catch {
      return INITIAL_SOAL_LIST;
    }
  });

  const [siswaList, setSiswaList] = useState<SiswaBinaan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SISWA);
      if (saved) {
        const parsed: SiswaBinaan[] = JSON.parse(saved);
        // Purge legacy mock dummy students
        return parsed.filter(
          (s) => !["sis-1", "sis-2", "sis-3", "sis-4", "sis-5", "sis-6"].includes(s.id)
        );
      }
      return INITIAL_SISWA_LIST;
    } catch {
      return INITIAL_SISWA_LIST;
    }
  });

  const [kodeUndanganList, setKodeUndanganList] = useState<KodeUndangan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KODE);
      if (saved) {
        const parsed: KodeUndangan[] = JSON.parse(saved);
        // Purge legacy mock codes
        return parsed.filter(
          (k) => !["kod-1", "kod-2", "kod-3"].includes(k.id)
        );
      }
      return INITIAL_KODE_UNDANGAN;
    } catch {
      return INITIAL_KODE_UNDANGAN;
    }
  });

  const [topikEvaluasiList, setTopikEvaluasiList] = useState<TopikEvaluasi[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOPIK);
      return saved ? JSON.parse(saved) : INITIAL_TOPIK_EVALUASI;
    } catch {
      return INITIAL_TOPIK_EVALUASI;
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SOAL, JSON.stringify(soalList));
  }, [soalList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SISWA, JSON.stringify(siswaList));
  }, [siswaList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_KODE, JSON.stringify(kodeUndanganList));
  }, [kodeUndanganList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPIK, JSON.stringify(topikEvaluasiList));
  }, [topikEvaluasiList]);

  // Actions
  const approveSoal = (soalId: number, reviewer: string = "Bu Ratna Kumalasari, S.Pd.") => {
    setSoalList((prev) =>
      prev.map((s) =>
        s.id === soalId
          ? {
              ...s,
              statusReview: "DISETUJUI",
              reviewer,
            }
          : s
      )
    );
  };

  const rejectSoal = (
    soalId: number,
    alasan: string,
    reviewer: string = "Bu Ratna Kumalasari, S.Pd."
  ) => {
    setSoalList((prev) =>
      prev.map((s) =>
        s.id === soalId
          ? {
              ...s,
              statusReview: "DITOLAK",
              catatanReviewer: alasan,
              reviewer,
            }
          : s
      )
    );
  };

  const editSoal = (soalId: number, updatedData: Partial<SoalReview>) => {
    setSoalList((prev) =>
      prev.map((s) => (s.id === soalId ? { ...s, ...updatedData } : s))
    );
  };

  const bulkApproveSoal = (soalIds: number[], reviewer: string = "Bu Ratna Kumalasari, S.Pd.") => {
    setSoalList((prev) =>
      prev.map((s) =>
        soalIds.includes(s.id)
          ? { ...s, statusReview: "DISETUJUI", reviewer }
          : s
      )
    );
  };

  const bulkRejectSoal = (
    soalIds: number[],
    alasan: string,
    reviewer: string = "Bu Ratna Kumalasari, S.Pd."
  ) => {
    setSoalList((prev) =>
      prev.map((s) =>
        soalIds.includes(s.id)
          ? { ...s, statusReview: "DITOLAK", catatanReviewer: alasan, reviewer }
          : s
      )
    );
  };

  const resetBankSoal = () => {
    setSoalList(INITIAL_SOAL_LIST);
    setSiswaList(INITIAL_SISWA_LIST);
    setKodeUndanganList(INITIAL_KODE_UNDANGAN);
    localStorage.removeItem(STORAGE_KEY_SOAL);
    localStorage.removeItem(STORAGE_KEY_SISWA);
    localStorage.removeItem(STORAGE_KEY_KODE);
  };

  const updateCatatanSiswa = (siswaId: string, catatan: string) => {
    setSiswaList((prev) =>
      prev.map((sis) => (sis.id === siswaId ? { ...sis, catatanGuru: catatan } : sis))
    );
  };

  const updateStatusRemedial = (
    siswaId: string,
    status: "Perlu Remedial" | "Bimbingan" | "Tuntas"
  ) => {
    setSiswaList((prev) =>
      prev.map((sis) => (sis.id === siswaId ? { ...sis, statusRemedial: status } : sis))
    );
  };

  const catatHasilRemedial = (
    siswaNama: string,
    topikNama: string,
    skor: number
  ) => {
    const isLulus = skor >= 70;

    // 1. Update Siswa Binaan
    setSiswaList((prev) => {
      let found = false;
      const updated = prev.map((siswa) => {
        const isTarget =
          siswa.nama.toLowerCase().includes(siswaNama.toLowerCase()) ||
          siswaNama.toLowerCase().includes(siswa.nama.toLowerCase()) ||
          siswa.id === siswaNama;

        if (isTarget) {
          found = true;
          if (isLulus) {
            return {
              ...siswa,
              statusRemedial: "Tuntas" as const,
              topikKelemahan: "Tidak ada (Tuntas Remedial)",
              akurasiRataRata: Math.max(siswa.akurasiRataRata, skor),
              totalLatihan: siswa.totalLatihan + 1,
              terakhirAktif: "Baru saja",
              catatanGuru: `Siswa telah menyelesaikan remedial topik "${topikNama}" dengan nilai ${skor} (LULUS >= 70). Status dinyatakan Tuntas & sudah tidak remedial lagi.`,
            };
          } else {
            return {
              ...siswa,
              totalLatihan: siswa.totalLatihan + 1,
              terakhirAktif: "Baru saja",
              catatanGuru: `Siswa telah mengikuti remedial topik "${topikNama}" dengan nilai ${skor} (< 70). Masih memerlukan bimbingan ulang.`,
            };
          }
        }
        return siswa;
      });

      // Jika tidak ada nama spesifik yang cocok, perbarui profil siswa aktif pertama
      if (!found && updated.length > 0 && isLulus) {
        updated[0] = {
          ...updated[0],
          statusRemedial: "Tuntas" as const,
          topikKelemahan: "Tidak ada (Tuntas Remedial)",
          akurasiRataRata: Math.max(updated[0].akurasiRataRata, skor),
          totalLatihan: updated[0].totalLatihan + 1,
          terakhirAktif: "Baru saja",
          catatanGuru: `Siswa telah menyelesaikan remedial topik "${topikNama}" dengan nilai ${skor} (LULUS >= 70). Status dinyatakan Tuntas & sudah tidak remedial lagi.`,
        };
      }
      return updated;
    });

    // 2. Update Topik Evaluasi
    setTopikEvaluasiList((prev) => {
      let topicFound = false;
      const updated = prev.map((t) => {
        const isTargetTopik =
          t.namaTopik.toLowerCase().includes(topikNama.toLowerCase()) ||
          topikNama.toLowerCase().includes(t.namaTopik.toLowerCase()) ||
          (topikNama.toLowerCase().includes("peredaran darah") && t.namaTopik.toLowerCase().includes("jantung")) ||
          (topikNama.toLowerCase().includes("enzim") && t.namaTopik.toLowerCase().includes("lambung"));

        if (isTargetTopik) {
          topicFound = true;
          if (isLulus) {
            return {
              ...t,
              persentaseAkurasi: Math.max(t.persentaseAkurasi, skor),
              statusPenguasaan: "Tuntas & Sangat Baik" as const,
              totalBenar: t.totalBenar + Math.round((skor / 100) * 5),
              totalDikerjakan: t.totalDikerjakan + 5,
              rekomendasiAksi: `Siswa telah menuntaskan remedial dengan nilai ${skor} (>= 70). Seluruh indikator kompetensi telah tuntas.`,
            };
          } else {
            return {
              ...t,
              totalBenar: t.totalBenar + Math.round((skor / 100) * 5),
              totalDikerjakan: t.totalDikerjakan + 5,
            };
          }
        }
        return t;
      });

      // Jika topik tidak persis cocok tetapi siswa lulus remedial, tuntaskan topik terlemah
      if (!topicFound && isLulus) {
        // Cari topik dengan akurasi terendah yang masih remedial
        const lowestIndex = updated.findIndex((t) => t.statusPenguasaan === "Perlu Remedial");
        if (lowestIndex !== -1) {
          updated[lowestIndex] = {
            ...updated[lowestIndex],
            persentaseAkurasi: Math.max(updated[lowestIndex].persentaseAkurasi, skor),
            statusPenguasaan: "Tuntas & Sangat Baik" as const,
            totalBenar: updated[lowestIndex].totalBenar + Math.round((skor / 100) * 5),
            totalDikerjakan: updated[lowestIndex].totalDikerjakan + 5,
            rekomendasiAksi: `Siswa telah menuntaskan remedial dengan nilai ${skor} (>= 70). Seluruh indikator kompetensi telah tuntas.`,
          };
        }
      }
      return updated;
    });

    return {
      isLulus,
      message: isLulus
        ? `Remedial dinyatakan LULUS (Nilai ${skor} >= 70). Status telah diubah menjadi Tuntas!`
        : `Nilai remedial ${skor} belum mencapai batas kelulusan 70.`,
    };
  };

  const getSiswaByNama = (nama: string): SiswaBinaan | undefined => {
    const clean = nama.toLowerCase().trim();
    return siswaList.find(
      (s) =>
        s.nama.toLowerCase().trim() === clean ||
        s.nama.toLowerCase().includes(clean) ||
        clean.includes(s.nama.toLowerCase())
    );
  };

  const catatAktivitasSiswa = (
    siswaNama: string,
    sesi: {
      idSesi: string;
      tingkat: "SD" | "SMP";
      mapel: string;
      mode: string;
      skor: number;
      totalBenar: number;
      totalSalah: number;
      totalSoal: number;
      topik?: string;
    }
  ) => {
    const isLulus = sesi.skor >= 70;
    const nowTime =
      "Hari ini, " +
      new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const topikTitle = sesi.topik || sesi.mapel || "Modul Latihan Adaptif";

    const newRiwayat = {
      id: "rw-" + Date.now(),
      idSesi: sesi.idSesi,
      tanggal: nowTime,
      mapel: sesi.mapel,
      topik: topikTitle,
      mode: sesi.mode,
      skor: sesi.skor,
      totalSoal: sesi.totalSoal,
      totalBenar: sesi.totalBenar,
      totalSalah: sesi.totalSalah,
      akurasi: sesi.totalSoal > 0 ? Math.round((sesi.totalBenar / sesi.totalSoal) * 100) : 0,
      status: sesi.skor >= 75 ? ("Lulus" as const) : sesi.skor >= 60 ? ("Cukup" as const) : ("Remedial" as const),
    };

    setSiswaList((prev) => {
      let found = false;
      const updated = prev.map((siswa) => {
        const isTarget =
          siswa.nama.toLowerCase().trim() === siswaNama.toLowerCase().trim() ||
          siswa.nama.toLowerCase().includes(siswaNama.toLowerCase()) ||
          siswaNama.toLowerCase().includes(siswa.nama.toLowerCase());

        if (isTarget) {
          found = true;
          const oldRiwayat = siswa.riwayatPengerjaan || [];
          const updatedRiwayat = [newRiwayat, ...oldRiwayat];
          const totalLatihanBaru = (siswa.totalLatihan || 0) + 1;
          const newAkurasi = Math.round(
            ((siswa.akurasiRataRata || 0) * (siswa.totalLatihan || 0) + sesi.skor) / totalLatihanBaru
          );

          let newStatusRemedial: "Perlu Remedial" | "Bimbingan" | "Tuntas" = siswa.statusRemedial;
          let newTopikKelemahan = siswa.topikKelemahan;
          let catatanOtomatis = siswa.catatanGuru;

          if (isLulus) {
            newStatusRemedial = "Tuntas";
            catatanOtomatis = `Menyelesaikan ${sesi.mapel} (${sesi.mode}) dengan nilai ${sesi.skor} (${sesi.totalBenar}/${sesi.totalSoal} benar). Capaian sangat bagus!`;
            if (siswa.topikKelemahan.toLowerCase().includes(topikTitle.toLowerCase())) {
              newTopikKelemahan = "Tidak ada (Tuntas)";
            }
          } else {
            newStatusRemedial = sesi.skor < 50 ? "Perlu Remedial" : "Bimbingan";
            newTopikKelemahan = `${topikTitle} (${sesi.skor}%)`;
            catatanOtomatis = `Perlu penguatan materi pada topik ${topikTitle}. Nilai latihan: ${sesi.skor}.`;
          }

          return {
            ...siswa,
            totalLatihan: totalLatihanBaru,
            akurasiRataRata: newAkurasi,
            statusRemedial: newStatusRemedial,
            topikKelemahan: newTopikKelemahan,
            terakhirAktif: nowTime,
            catatanGuru: catatanOtomatis,
            riwayatPengerjaan: updatedRiwayat,
          };
        }
        return siswa;
      });

      if (!found) {
        let connectedCode: string | undefined = undefined;
        let connectedGuru: string | undefined = undefined;
        try {
          const raw = localStorage.getItem("soalku_connected_teacher");
          if (raw) {
            const parsed = JSON.parse(raw);
            connectedCode = parsed.kode;
            connectedGuru = parsed.guru;
          }
        } catch {}

        const newSiswaObj: SiswaBinaan = {
          id: "sis-" + Date.now(),
          nama: siswaNama,
          kelas: sesi.tingkat === "SD" ? "Kelas 4 SD" : "Kelas 8-A SMP",
          tingkat: sesi.tingkat,
          avatarColor: sesi.tingkat === "SD" ? "bg-amber-500" : "bg-[#84A282]",
          totalLatihan: 1,
          akurasiRataRata: sesi.skor,
          topikKelemahan: isLulus ? "Tidak ada (Tuntas)" : `${topikTitle} (${sesi.skor}%)`,
          statusRemedial: isLulus ? ("Tuntas" as const) : ("Bimbingan" as const),
          catatanGuru: `Siswa baru terhubung via kode guru. Telah mengerjakan modul ${topikTitle} dengan nilai ${sesi.skor}.`,
          terakhirAktif: nowTime,
          kodeUndanganTerhubung: connectedCode,
          guruPembimbing: connectedGuru,
          riwayatPengerjaan: [newRiwayat],
        };
        return [newSiswaObj, ...prev];
      }

      return updated;
    });

    // Sinkronkan ke TopikEvaluasi guru jika topik sesuai
    setTopikEvaluasiList((prev) =>
      prev.map((te) => {
        if (
          te.tingkat === sesi.tingkat &&
          (te.namaTopik.toLowerCase().includes(topikTitle.toLowerCase()) ||
            topikTitle.toLowerCase().includes(te.namaTopik.toLowerCase()))
        ) {
          const totalDikerjakan = te.totalDikerjakan + sesi.totalSoal;
          const totalBenar = te.totalBenar + sesi.totalBenar;
          const persentaseAkurasi = Math.round((totalBenar / totalDikerjakan) * 100);
          return {
            ...te,
            totalDikerjakan,
            totalBenar,
            persentaseAkurasi,
            statusPenguasaan:
              persentaseAkurasi >= 75
                ? ("Tuntas & Sangat Baik" as const)
                : persentaseAkurasi >= 60
                ? ("Perlu Penguatan" as const)
                : ("Perlu Remedial" as const),
          };
        }
        return te;
      })
    );
  };

  const createKodeUndangan = (
    targetTingkat: "SD" | "SMP" | "SEMUA" = "SMP",
    customPrefix: string = "GURU",
    dibuatOleh: string = "Guru Pembimbing"
  ): KodeUndangan => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newKode: KodeUndangan = {
      id: `kod-${Date.now()}`,
      kode: `${customPrefix}-${targetTingkat}-${randomSuffix}`,
      status: "AKTIF",
      expiredAt: "7 Hari (Sekali Pakai)",
      dibuatOleh,
      targetTingkat,
      totalDipakai: 0,
    };

    setKodeUndanganList((prev) => [newKode, ...prev]);
    return newKode;
  };

  const salinKodeUndangan = (kode: string) => {
    navigator.clipboard?.writeText(kode);
  };

  const redeemKodeUndangan = (
    kodeInput: string,
    studentTingkat?: "SD" | "SMP",
    studentNama?: string
  ): { success: boolean; message: string; kodeObj?: KodeUndangan } => {
    const clean = kodeInput.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: "Silakan masukkan kode undangan." };
    }

    const found = kodeUndanganList.find((k) => k.kode.toUpperCase() === clean);
    if (!found) {
      return {
        success: false,
        message: "Kode undangan tidak ditemukan atau belum didaftarkan guru.",
      };
    }

    if (found.status !== "AKTIF") {
      return {
        success: false,
        message: "Kode undangan ini sudah tidak aktif.",
      };
    }

    if (studentTingkat && found.targetTingkat !== "SEMUA" && found.targetTingkat !== studentTingkat) {
      return {
        success: false,
        message: `Kode ini khusus untuk jenjang ${found.targetTingkat}. Akun Anda terdaftar di jenjang ${studentTingkat}.`,
      };
    }

    // Increment usage
    setKodeUndanganList((prev) =>
      prev.map((k) => (k.id === found.id ? { ...k, totalDipakai: (k.totalDipakai || 0) + 1 } : k))
    );

    // Hubungkan siswa ke profil guru
    const targetName = studentNama || (studentTingkat === "SD" ? "Adit Pratama" : "Arya Pratama");
    setSiswaList((prev) => {
      let foundStudent = false;
      const updated = prev.map((s) => {
        if (
          s.nama.toLowerCase().trim() === targetName.toLowerCase().trim() ||
          s.nama.toLowerCase().includes(targetName.toLowerCase()) ||
          targetName.toLowerCase().includes(s.nama.toLowerCase())
        ) {
          foundStudent = true;
          return {
            ...s,
            kodeUndanganTerhubung: found.kode,
            guruPembimbing: found.dibuatOleh,
            terakhirAktif: "Baru saja terhubung",
          };
        }
        return s;
      });

      if (!foundStudent) {
        const newStudent: SiswaBinaan = {
          id: "sis-" + Date.now(),
          nama: targetName,
          kelas: studentTingkat === "SD" ? "Kelas 4 SD" : "Kelas 8-A SMP",
          tingkat: studentTingkat || "SMP",
          avatarColor: studentTingkat === "SD" ? "bg-amber-500" : "bg-[#84A282]",
          totalLatihan: 0,
          akurasiRataRata: 0,
          topikKelemahan: "Belum ada riwayat",
          statusRemedial: "Bimbingan",
          catatanGuru: `Siswa baru terhubung melalui kode undangan ${found.kode}.`,
          terakhirAktif: "Baru saja terhubung",
          kodeUndanganTerhubung: found.kode,
          guruPembimbing: found.dibuatOleh,
          riwayatPengerjaan: [],
        };
        return [newStudent, ...prev];
      }
      return updated;
    });

    try {
      localStorage.setItem(
        "soalku_connected_teacher",
        JSON.stringify({
          kode: found.kode,
          guru: found.dibuatOleh,
          tingkat: found.targetTingkat,
          studentName: targetName,
          connectedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error("Gagal menyimpan koneksi guru ke localStorage", e);
    }

    return {
      success: true,
      message: `Selamat! Kamu berhasil terhubung ke kelas bimbingan ${found.dibuatOleh}! Nilai modul akan otomatis masuk ke laporan guru.`,
      kodeObj: found,
    };
  };

  const getPendingCount = () => soalList.filter((s) => s.statusReview === "MENUNGGU").length;
  const getApprovedCount = () => soalList.filter((s) => s.statusReview === "DISETUJUI").length;
  const getRejectedCount = () => soalList.filter((s) => s.statusReview === "DITOLAK").length;

  return (
    <MentorContext.Provider
      value={{
        soalList,
        siswaList,
        kodeUndanganList,
        topikEvaluasiList,
        approveSoal,
        rejectSoal,
        editSoal,
        bulkApproveSoal,
        bulkRejectSoal,
        resetBankSoal,
        updateCatatanSiswa,
        updateStatusRemedial,
        catatHasilRemedial,
        catatAktivitasSiswa,
        getSiswaByNama,
        createKodeUndangan,
        salinKodeUndangan,
        redeemKodeUndangan,
        getPendingCount,
        getApprovedCount,
        getRejectedCount,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
};

export const useMentor = () => {
  const context = useContext(MentorContext);
  if (!context) {
    throw new Error("useMentor must be used within a MentorProvider");
  }
  return context;
};
