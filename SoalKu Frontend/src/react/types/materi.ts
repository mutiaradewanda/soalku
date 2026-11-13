export type TingkatMateri = "SD" | "SMP";

export type StatusMateri = "DIEKSTRAK" | "DIGENERATE" | "GAGAL_GENERATE";

export interface OpsiJawaban {
  label: "A" | "B" | "C" | "D";
  teks: string;
  isBenar: boolean;
}

export interface SoalMateri {
  id: number;
  bagianMateriId: number;
  pertanyaan: string;
  opsi: OpsiJawaban[];
  kunciJawaban: string;
  pembahasan?: string;
  tingkatKesulitan: "MUDAH" | "SEDANG" | "SULIT";
}

export interface BagianMateri {
  id: number;
  materiId: number;
  judulBagian: string;
  teksRingkasan: string;
  urutan: number;
  status: StatusMateri;
  generatedSoal?: SoalMateri[];
}

export interface Materi {
  id: number;
  judul: string;
  tingkat: TingkatMateri;
  bab: string;
  mataPelajaran: string;
  deskripsi: string;
  akurasi: number;
  status: StatusMateri;
  namaFileAsli?: string;
  ukuranFileKb?: number;
  tanggalUpload: string;
  poinKunci: string[];
  bagianMateri: BagianMateri[];
}
