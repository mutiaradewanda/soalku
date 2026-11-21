export type ModeLatihan = "ACAK" | "BERWAKTU" | "FOKUS_KELEMAHAN";

export interface OpsiQuiz {
  label: "A" | "B" | "C" | "D";
  teks: string;
}

export interface SoalQuiz {
  id: number;
  tingkat: "SD" | "SMP";
  bagianMateriId: number;
  topik: string;
  pertanyaan: string;
  opsi: OpsiQuiz[];
  kunciJawabanIndex: number; // 0=A, 1=B, 2=C, 3=D
  pembahasan: string;
  kesulitan: "MUDAH" | "SEDANG" | "SULIT";
  tipsAdaptif?: string;
  jembatanKeledai?: string;
  insightKelemahan?: string;
  hasDiagram?: boolean;
}

export interface JawabanUser {
  soalId: number;
  selectedOpsiIndex: number | null;
  isRaguRagu: boolean;
  waktuPengerjaanDetik?: number;
}

export interface SesiLatihan {
  idSesi: string; // e.g. #CBT-BIO-8824
  mode: ModeLatihan;
  tingkat: "SD" | "SMP";
  mapel: string;
  subjek: string;
  waktuDetikSisa: number;
  totalDetik: number;
  daftarSoal: SoalQuiz[];
  jawabanMap: Record<number, JawabanUser>;
  status: "BERLANGSUNG" | "SELESAI";
  skor: number; // 0 - 100
  totalBenar: number;
  totalSalah: number;
  totalRagu: number;
  totalDijawab: number;
  streakBenar: number;
  xpDidapat: number;
  waktuMulai: number;
  waktuSelesai?: number;
  totalPelanggaran?: number;
  isAutoSubmitPelanggaran?: boolean;
}
