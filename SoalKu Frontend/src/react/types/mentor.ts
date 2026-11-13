export type StatusReview = "MENUNGGU" | "DISETUJUI" | "DITOLAK";

export interface OpsiReview {
  label: string;
  teks: string;
  isBenar: boolean;
}

export interface SoalReview {
  id: number;
  pertanyaan: string;
  tingkat: "SD" | "SMP";
  mataPelajaran: string;
  topik: string;
  modulAsal: string;
  tingkatKesulitan: "MUDAH" | "SEDANG" | "SULIT";
  opsi: OpsiReview[];
  pembahasan: string;
  tipsAdaptif?: string;
  aiConfidence: number; // e.g. 96 (%)
  statusReview: StatusReview;
  catatanReviewer?: string;
  tanggalDibuat: string;
  reviewer?: string;
}

export interface SiswaBinaan {
  id: string;
  nama: string;
  kelas: string;
  tingkat: "SD" | "SMP";
  avatarColor: string;
  totalLatihan: number;
  akurasiRataRata: number;
  topikKelemahan: string;
  statusRemedial: "Perlu Remedial" | "Bimbingan" | "Tuntas";
  catatanGuru: string;
  terakhirAktif: string;
}

export interface KodeUndangan {
  id: string;
  kode: string;
  status: "AKTIF" | "DIGUNAKAN" | "KEDALUWARSA";
  expiredAt: string;
  dibuatOleh: string;
  targetTingkat: "SD" | "SMP" | "SEMUA";
  totalDipakai: number;
}

export interface TopikEvaluasi {
  id: number;
  bagianMateriId: number;
  namaTopik: string;
  mataPelajaran: string;
  tingkat: "SD" | "SMP";
  totalDikerjakan: number;
  totalBenar: number;
  persentaseAkurasi: number;
  statusPenguasaan: "Perlu Remedial" | "Perlu Penguatan" | "Tuntas & Sangat Baik";
  rekomendasiAksi: string;
  tipsPenguatan: string;
}
