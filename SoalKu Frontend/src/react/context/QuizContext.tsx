import React, { createContext, useContext, useState, useEffect } from "react";
import { ModeLatihan, SesiLatihan, SoalQuiz, JawabanUser } from "../types/quiz";

interface QuizContextType {
  currentSession: SesiLatihan | null;
  startSession: (
    mode: ModeLatihan,
    jumlahSoal: number,
    tingkat?: "SD" | "SMP",
    customQuestions?: SoalQuiz[]
  ) => SesiLatihan;
  answerQuestion: (soalId: number, opsiIndex: number) => void;
  toggleRaguRagu: (soalId: number) => void;
  decrementTimer: () => void;
  finishSession: (isViolationAutoSubmit?: boolean, totalPelanggaran?: number) => SesiLatihan;
  restartSession: () => SesiLatihan;
  clearSession: () => void;
}

// Bank Soal Standard SMP sesuai PRD dan DataRepository
const BANK_SOAL_SMP: SoalQuiz[] = [
  {
    id: 1,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Manakah fungsi utama dari getah lambung dalam proses pencernaan mekanik dan kimiawi?",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Mengubah amilum menjadi maltosa" },
      { label: "B", teks: "Membunuh kuman penyakit dan mengaktifkan pepsinogen" },
      { label: "C", teks: "Menetralkan asam yang berasal dari kerongkongan" },
      { label: "D", teks: "Mengemulsikan lemak menjadi asam lemak" },
    ],
    kunciJawabanIndex: 1,
    pembahasan: "Getah lambung mengandung asam klorida (HCl) yang berfungsi mematikan kuman patogen serta mengaktifkan enzim pepsinogen menjadi pepsin aktif.",
    tipsAdaptif: "Getah lambung ber-pH asam (1-2) untuk membunuh bakteri patogen.",
  },
  {
    id: 2,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Enzim renin yang terdapat di dalam getah lambung anak mamalia berfungsi untuk...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Mengendapkan protein kasein dari susu" },
      { label: "B", teks: "Memecah karbohidrat kompleks" },
      { label: "C", teks: "Menguraikan lemak menjadi gliserol" },
      { label: "D", teks: "Membentuk lapisan mukosa lambung" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Enzim renin berfungsi mengendapkan protein kasein susu agar dapat dicerna lebih lanjut oleh pepsin.",
    tipsAdaptif: "Renin = Kasein Susu (pada lambung mamalia muda).",
  },
  {
    id: 3,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Lapisan lendir (mukus) yang tebal pada dinding ventrikulus berfungsi krusial untuk...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Melindungi dinding lambung dari korosi asam klorida (HCl) dan pepsin" },
      { label: "B", teks: "Mempercepat laju penyerapan air dan ion mineral" },
      { label: "C", teks: "Mencegah makanan masuk ke saluran empedu" },
      { label: "D", teks: "Mengaktifkan hormon kolesistokinin" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Lapisan mukus melindungi sel-sel epitel mukosa lambung dari autolisis akibat asam lambung dan enzim proteolitik.",
    tipsAdaptif: "Mukus tebal = perisai alami dinding lambung dari asam HCl.",
  },
  {
    id: 4,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Bahan makanan yang mengalami pencernaan kimiawi pertama kali di rongga mulut adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Karbohidrat (Amilum)" },
      { label: "B", teks: "Protein hewani" },
      { label: "C", teks: "Lemak nabati" },
      { label: "D", teks: "Vitamin larut air" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Di rongga mulut terdapat enzim ptialin (amilase ludah) yang memecah amilum menjadi maltosa.",
    tipsAdaptif: "Mulut = Ptialin = Pemecah Amilum pertama.",
  },
  {
    id: 5,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Gerakan meremas dan mendorong gumpalan makanan (bolus) di sepanjang esofagus disebut gerak...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Peristaltik" },
      { label: "B", teks: "Osilasi" },
      { label: "C", teks: "Brown" },
      { label: "D", teks: "Segmentasi" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Gerak peristaltik adalah kontraksi ritmis otot polos sirkuler dan longitudinal di saluran cerna.",
    tipsAdaptif: "Peristaltik = dorongan ritmis bolus makanan.",
  },
  {
    id: 6,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Zat empedu yang dihasilkan oleh hepar (hati) disimpan sementara di dalam kantung empedu berfungsi untuk...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Mengemulsikan lemak agar mudah dicerna oleh lipase" },
      { label: "B", teks: "Memecah protein menjadi asam amino bebas" },
      { label: "C", teks: "Menurunkan kadar gula darah sewaktu" },
      { label: "D", teks: "Membunuh bakteri di usus buntu" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Garam empedu bersifat amfifatik dan mengemulsi lemak menjadi droplet kecil agar enzim lipase pankreas dapat bekerja optimal.",
    tipsAdaptif: "Empedu = Emulsi Lemak.",
  },
  {
    id: 7,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan:
      "Perhatikan gambar organ pencernaan berikut! Enzim pepsin dan asam klorida (HCl) yang berfungsi mengaktifkan pepsinogen serta membunuh kuman penyakit dihasilkan pada bagian organ yang ditunjukkan oleh nomor...",
    kesulitan: "SEDANG",
    hasDiagram: true,
    opsi: [
      { label: "A", teks: "Mulut — Organ nomor (1)" },
      { label: "B", teks: "Lambung — Organ nomor (2)" },
      { label: "C", teks: "Hati — Organ nomor (3)" },
      { label: "D", teks: "Usus Halus — Organ nomor (4)" },
    ],
    kunciJawabanIndex: 1, // B
    pembahasan:
      "Organ nomor (2) adalah ventrikulus (lambung). Di dinding lambung terdapat sel utama penghasil pepsinogen dan sel parietal penghasil HCl yang saling bekerja sama mematangkan enzim pepsin aktif.",
    tipsAdaptif:
      "Ingat singkatan enzim getah lambung dengan rumus: [R - P - L]\n• Renin: mengendapkan kasein susu\n• Pepsin: memecah protein jadi pepton\n• Lambung asam (HCl): desinfektan kuman patogen",
    jembatanKeledai: "Jembatan Keledai: [R - P - L] -> Renin, Pepsin, Lambung (asam HCl)",
    insightKelemahan:
      "Berdasarkan performa terakhirmu, kamu sering tertukar fungsi pepsin (lambung) dengan tripsin (usus halus). Cermati organ nomor (2)!",
  },
  {
    id: 8,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan:
      "Bagian organ yang memiliki vili-vili kecil mikroskopis untuk memperluas bidang penyerapan nutrisi makanan adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Ventrikulus (Lambung)" },
      { label: "B", teks: "Intestinum (Usus Halus)" },
      { label: "C", teks: "Hepar (Hati)" },
      { label: "D", teks: "Esofagus" },
    ],
    kunciJawabanIndex: 1,
    pembahasan: "Vili dan mikrovili berada di mukosa usus halus (jejenum dan ileum) untuk memperluas bidang penyerapan nutrisi ke kapiler darah dan pembuluh kil.",
    tipsAdaptif: "Vili = Usus Halus (penyerapan nutrisi maksimal).",
  },
  {
    id: 9,
    tingkat: "SMP",
    bagianMateriId: 103,
    topik: "Fungsi Bilik Jantung & Katup Aorta",
    pertanyaan:
      "Mengapa dinding bilik kiri (ventrikel sinister) jantung manusia jauh lebih tebal dibandingkan bilik kanan?",
    kesulitan: "SULIT",
    opsi: [
      { label: "A", teks: "Karena hanya memompa darah ke organ paru-paru yang dekat" },
      { label: "B", teks: "Karena memerlukan tekanan tinggi untuk memompa darah kaya O2 ke seluruh tubuh" },
      { label: "C", teks: "Karena menerima darah yang mengandung banyak CO2 dari seluruh tubuh" },
      { label: "D", teks: "Karena katup trikuspidalis bekerja lebih lambat saat sistol" },
    ],
    kunciJawabanIndex: 1,
    pembahasan: "Bilik kiri bertugas memompa darah ke sirkulasi sistemik ke seluruh penjuru tubuh manusia sehingga membutuhkan miokardium yang jauh lebih tebal dan kuat.",
    tipsAdaptif: "Bilik Kiri = Otot Paling Tebal (pompa ke seluruh tubuh).",
  },
  {
    id: 10,
    tingkat: "SMP",
    bagianMateriId: 103,
    topik: "Fungsi Bilik Jantung & Katup Aorta",
    pertanyaan: "Kerusakan atau kebocoran pada katup aorta dapat mengakibatkan aliran darah kembali ke...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Bilik Kiri (Ventrikel Sinister)" },
      { label: "B", teks: "Serambi Kanan (Atrium Dekster)" },
      { label: "C", teks: "Paru-Paru (Pulmo)" },
      { label: "D", teks: "Vena Kava Superior" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Katup semilunaris aorta terletak di antara bilik kiri dan aorta. Jika bocor, darah akan mengalami regurgitasi kembali ke ventrikel kiri saat fase diastol.",
    tipsAdaptif: "Katup Aorta = Gerbang satu arah dari Bilik Kiri ke Aorta.",
  },
];

// Bank Soal SD
const BANK_SOAL_SD: SoalQuiz[] = [
  {
    id: 101,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Bagian Tumbuhan & Fotosintesis",
    pertanyaan: "Bagian tumbuhan yang bertugas menyerap air dan zat hara dari dalam tanah adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Akar tumbuhan" },
      { label: "B", teks: "Daun hijau" },
      { label: "C", teks: "Bunga berwarna cerah" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Akar berada di bawah tanah untuk menyerap air dan mineral serta menopang tegaknya tumbuhan.",
    tipsAdaptif: "Akar = Menyerap air di dalam tanah.",
  },
  {
    id: 102,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Bagian Tumbuhan & Fotosintesis",
    pertanyaan: "Zat hijau pada daun yang membantu proses fotosintesis dengan sinar matahari disebut...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Klorofil" },
      { label: "B", teks: "Karbohidrat" },
      { label: "C", teks: "Oksigen" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Klorofil adalah pigmen hijau daun yang menangkap energi cahaya matahari untuk memasak makanan.",
    tipsAdaptif: "Klorofil = zat hijau daun pembuat makanan.",
  },
  {
    id: 103,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Organ Tubuh Manusia",
    pertanyaan: "Organ tubuh yang berdetak memompa darah ke seluruh tubuh kita adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Jantung" },
      { label: "B", teks: "Lambung" },
      { label: "C", teks: "Paru-paru" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Jantung manusia memompa darah beroksigen tanpa henti setiap hari.",
    tipsAdaptif: "Jantung = pompa darah tubuh.",
  },
  {
    id: 104,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Pencernaan Makanan",
    pertanyaan: "Makanan yang kita makan pertama kali dikunyah di dalam...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Mulut" },
      { label: "B", teks: "Lambung" },
      { label: "C", teks: "Usus" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Gigi dan lidah di mulut mengunyah makanan agar halus sebelum ditelan.",
    tipsAdaptif: "Mulut = awal mula makanan dikunyah.",
  },
  {
    id: 105,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Matematika Ceria",
    pertanyaan: "Ibu membeli 3 kantong jeruk. Setiap kantong berisi 8 buah jeruk. Berapa total jeruk Ibu?",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "24 buah jeruk" },
      { label: "B", teks: "21 buah jeruk" },
      { label: "C", teks: "18 buah jeruk" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "3 kantong × 8 buah = 24 buah jeruk.",
    tipsAdaptif: "3 × 8 = 24.",
  },
];

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<SesiLatihan | null>(() => {
    try {
      const saved = localStorage.getItem("soalku_active_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentSession) {
      try {
        localStorage.setItem("soalku_active_session", JSON.stringify(currentSession));
      } catch (e) {
        console.error("Gagal menyimpan sesi ke localStorage", e);
      }
    } else {
      localStorage.removeItem("soalku_active_session");
    }
  }, [currentSession]);

  const startSession = (
    mode: ModeLatihan,
    jumlahSoal: number,
    tingkat: "SD" | "SMP" = "SMP",
    customQuestions?: SoalQuiz[]
  ): SesiLatihan => {
    let pool = customQuestions && customQuestions.length > 0
      ? [...customQuestions]
      : tingkat === "SD"
      ? [...BANK_SOAL_SD]
      : [...BANK_SOAL_SMP];

    // Algoritma Strategi PRD Section 10:
    if (mode === "ACAK") {
      pool = pool.sort(() => Math.random() - 0.5);
    } else if (mode === "FOKUS_KELEMAHAN") {
      // Prioritaskan soal dengan kelemahan / insight adaptif atau peredaran darah
      pool = pool.sort((a, b) => {
        const aWeak = a.insightKelemahan || a.bagianMateriId === 103 ? 1 : 0;
        const bWeak = b.insightKelemahan || b.bagianMateriId === 103 ? 1 : 0;
        return bWeak - aWeak;
      });
    }

    const selectedQuestions = pool.slice(0, Math.min(jumlahSoal, pool.length));

    // Waktu: Mode Berwaktu = 15 Menit (900s), Mode lain = 25 Menit (1500s)
    const totalWaktu = mode === "BERWAKTU" ? 900 : 1500;

    const initialJawaban: Record<number, JawabanUser> = {};
    selectedQuestions.forEach((q) => {
      initialJawaban[q.id] = {
        soalId: q.id,
        selectedOpsiIndex: null,
        isRaguRagu: false,
      };
    });

    const session: SesiLatihan = {
      idSesi: `#CBT-BIO-${Math.floor(1000 + Math.random() * 9000)}`,
      mode,
      tingkat,
      mapel: tingkat === "SD" ? "IPAS & Matematika" : "IPA Terpadu • Biologi Sistem Pencernaan",
      subjek: tingkat === "SD" ? "Kelas 4 SD" : "Kelas 8 SMP",
      waktuDetikSisa: totalWaktu,
      totalDetik: totalWaktu,
      daftarSoal: selectedQuestions,
      jawabanMap: initialJawaban,
      status: "BERLANGSUNG",
      skor: 0,
      totalBenar: 0,
      totalSalah: 0,
      totalRagu: 0,
      totalDijawab: 0,
      streakBenar: 4, // Initial display streak
      xpDidapat: 0,
      waktuMulai: Date.now(),
    };

    setCurrentSession(session);
    return session;
  };

  const answerQuestion = (soalId: number, opsiIndex: number) => {
    setCurrentSession((prev) => {
      if (!prev || prev.status === "SELESAI") return prev;

      const currentJawaban = prev.jawabanMap[soalId] || {
        soalId,
        selectedOpsiIndex: null,
        isRaguRagu: false,
      };

      const updatedJawabanMap = {
        ...prev.jawabanMap,
        [soalId]: {
          ...currentJawaban,
          selectedOpsiIndex: opsiIndex,
        },
      };

      const totalDijawab = Object.values(updatedJawabanMap).filter(
        (j) => j.selectedOpsiIndex !== null
      ).length;

      return {
        ...prev,
        jawabanMap: updatedJawabanMap,
        totalDijawab,
      };
    });
  };

  const toggleRaguRagu = (soalId: number) => {
    setCurrentSession((prev) => {
      if (!prev || prev.status === "SELESAI") return prev;

      const current = prev.jawabanMap[soalId] || {
        soalId,
        selectedOpsiIndex: null,
        isRaguRagu: false,
      };

      const updated = {
        ...current,
        isRaguRagu: !current.isRaguRagu,
      };

      const updatedMap = {
        ...prev.jawabanMap,
        [soalId]: updated,
      };

      const totalRagu = Object.values(updatedMap).filter((j) => j.isRaguRagu).length;

      return {
        ...prev,
        jawabanMap: updatedMap,
        totalRagu,
      };
    });
  };

  const decrementTimer = () => {
    setCurrentSession((prev) => {
      if (!prev || prev.status === "SELESAI") return prev;
      if (prev.waktuDetikSisa <= 1) {
        return finishSessionInternal(prev);
      }
      return {
        ...prev,
        waktuDetikSisa: prev.waktuDetikSisa - 1,
      };
    });
  };

  const finishSessionInternal = (
    session: SesiLatihan,
    isViolationAutoSubmit?: boolean,
    totalPelanggaran?: number
  ): SesiLatihan => {
    let benar = 0;
    let salah = 0;

    session.daftarSoal.forEach((soal) => {
      const jawaban = session.jawabanMap[soal.id];
      if (jawaban && jawaban.selectedOpsiIndex === soal.kunciJawabanIndex) {
        benar++;
      } else {
        salah++;
      }
    });

    const total = session.daftarSoal.length;
    const skor = total > 0 ? Math.round((benar / total) * 100) : 0;
    const xp = isViolationAutoSubmit ? 0 : benar * 30 + 50;

    const completedSession: SesiLatihan = {
      ...session,
      status: "SELESAI",
      skor,
      totalBenar: benar,
      totalSalah: salah,
      totalDijawab: Object.values(session.jawabanMap).filter((j) => j.selectedOpsiIndex !== null).length,
      totalRagu: Object.values(session.jawabanMap).filter((j) => j.isRaguRagu).length,
      xpDidapat: xp,
      waktuSelesai: Date.now(),
      isAutoSubmitPelanggaran: isViolationAutoSubmit || false,
      totalPelanggaran: totalPelanggaran !== undefined ? totalPelanggaran : (session.totalPelanggaran || 0),
    };

    return completedSession;
  };

  const finishSession = (isViolationAutoSubmit?: boolean, totalPelanggaran?: number): SesiLatihan => {
    if (!currentSession) throw new Error("Tidak ada sesi ujian aktif");
    const finished = finishSessionInternal(currentSession, isViolationAutoSubmit, totalPelanggaran);
    setCurrentSession(finished);
    return finished;
  };

  const restartSession = (): SesiLatihan => {
    if (!currentSession) throw new Error("Tidak ada sesi untuk diulang");
    return startSession(currentSession.mode, currentSession.daftarSoal.length, currentSession.tingkat);
  };

  const clearSession = () => {
    setCurrentSession(null);
    localStorage.removeItem("soalku_active_session");
  };

  return (
    <QuizContext.Provider
      value={{
        currentSession,
        startSession,
        answerQuestion,
        toggleRaguRagu,
        decrementTimer,
        finishSession,
        restartSession,
        clearSession,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz harus digunakan di dalam QuizProvider");
  }
  return context;
};
