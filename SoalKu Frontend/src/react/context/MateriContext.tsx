import React, { createContext, useContext, useState, useEffect } from "react";
import { Materi, BagianMateri, TingkatMateri } from "../types/materi";
import { extractAndProcessDocument } from "../services/aiExtractionService";

interface MateriContextType {
  materiList: Materi[];
  activeMateri: Materi | null;
  setActiveMateri: (materi: Materi | null) => void;
  uploadMateri: (
    file: File | null,
    manualText: string,
    tingkat: TingkatMateri,
    customTitle?: string
  ) => Promise<Materi>;
  deleteMateri: (id: number) => void;
  regenerateBagianMateri: (materiId: number, bagianId: number) => Promise<void>;
  resetToDefaultMateri: () => void;
}

const SEED_MATERI_LIST: Materi[] = [
  {
    id: 1,
    judul: "Biologi Sistem Pencernaan",
    tingkat: "SMP",
    bab: "Bab 4.1",
    mataPelajaran: "IPA Biologi",
    deskripsi:
      "Fungsi enzim pepsin, renin, ptialin, serta penyerapan nutrisi oleh vili usus halus dalam sistem pencernaan manusia.",
    akurasi: 40,
    status: "DIGENERATE",
    namaFileAsli: "Modul_IPA_Sistem_Pencernaan_Kelas8.pdf",
    ukuranFileKb: 420,
    tanggalUpload: "20 Okt 2026",
    poinKunci: [
      "Enzim ptialin di mulut mengubah amilum menjadi maltosa.",
      "Getah lambung memproduksi Pepsin, Renin, dan HCl [R-P-L].",
      "Vili usus halus memaksimalkan bidang penyerapan nutrisi makanan.",
    ],
    bagianMateri: [
      {
        id: 101,
        materiId: 1,
        judulBagian: "Enzim Lambung & Organ Pencernaan Manusia",
        teksRingkasan:
          "Enzim pepsin dan HCl diproduksi oleh dinding lambung untuk mencerna protein dan membunuh kuman patogen.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: [
          {
            id: 1001,
            bagianMateriId: 101,
            pertanyaan: "Bagian lambung memproduksi asam lambung (HCl) yang berfungsi untuk...",
            opsi: [
              { label: "A", teks: "Membunuh bakteri patogen dan mengaktifkan pepsin", isBenar: true },
              { label: "B", teks: "Mengubah amilum menjadi glukosa", isBenar: false },
              { label: "C", teks: "Mengemulsikan lemak makanan", isBenar: false },
              { label: "D", teks: "Menyerap vitamin dan mineral ke darah", isBenar: false },
            ],
            kunciJawaban: "A",
            pembahasan: "Asam klorida (HCl) berfungsi menciptakan suasana asam untuk membunuh bakteri serta mengaktifkan pepsinogen.",
            tingkatKesulitan: "MUDAH",
          },
        ],
      },
      {
        id: 102,
        materiId: 1,
        judulBagian: "Proses Penyerapan di Usus Halus",
        teksRingkasan:
          "Vili pada jonjot usus halus menyerap nutrisi makanan seperti glukosa, asam amino, dan asam lemak.",
        urutan: 2,
        status: "DIGENERATE",
        generatedSoal: [
          {
            id: 1002,
            bagianMateriId: 102,
            pertanyaan: "Struktur pada dinding usus halus yang berfungsi memperluas bidang penyerapan nutrisi adalah...",
            opsi: [
              { label: "A", teks: "Vili (jonjot-jonjot usus)", isBenar: true },
              { label: "B", teks: "Katup pylorus lambung", isBenar: false },
              { label: "C", teks: "Kelenjar ludah sublingual", isBenar: false },
              { label: "D", teks: "Kantong empedu", isBenar: false },
            ],
            kunciJawaban: "A",
            pembahasan: "Vili atau jonjot usus halus memperbesar luas permukaan penyerapan nutrisi hingga puluhan kali lipat.",
            tingkatKesulitan: "SEDANG",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    judul: "Aljabar Dasar & Faktorisasi",
    tingkat: "SMP",
    bab: "Bab 3.2",
    mataPelajaran: "Matematika",
    deskripsi:
      "Penyederhanaan suku sejenis, aturan tanda kurung, dan faktorisasi kuadrat selisih dua kuadrat a² - b² = (a+b)(a-b).",
    akurasi: 78,
    status: "DIGENERATE",
    namaFileAsli: "Aljabar_Dasar_SMP_Kelas8.pdf",
    ukuranFileKb: 310,
    tanggalUpload: "21 Okt 2026",
    poinKunci: [
      "Variabel adalah lambang pengganti nilai yang belum diketahui.",
      "Operasi penjumlahan/pengurangan hanya bisa dilakukan pada suku yang sejenis.",
      "Rumus kuadrat sekawan: a² - b² = (a + b)(a - b).",
    ],
    bagianMateri: [
      {
        id: 201,
        materiId: 2,
        judulBagian: "Faktorisasi Bentuk Kuadrat Selisih",
        teksRingkasan:
          "Bentuk selisih kuadrat a² - b² selalu dapat difaktorkan menjadi (a+b)(a-b) secara praktis.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: [
          {
            id: 2001,
            bagianMateriId: 201,
            pertanyaan: "Bentuk faktorisasi dari x² - 49 adalah...",
            opsi: [
              { label: "A", teks: "(x + 7)(x - 7)", isBenar: true },
              { label: "B", teks: "(x - 7)(x - 7)", isBenar: false },
              { label: "C", teks: "(x + 7)(x + 7)", isBenar: false },
              { label: "D", teks: "(x - 49)(x + 1)", isBenar: false },
            ],
            kunciJawaban: "A",
            pembahasan: "x² - 49 = x² - 7² = (x + 7)(x - 7).",
            tingkatKesulitan: "SEDANG",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    judul: "Sistem Peredaran Darah Manusia",
    tingkat: "SMP",
    bab: "Bab 4.2",
    mataPelajaran: "IPA Terpadu (Biologi)",
    deskripsi:
      "Fungsi bilik jantung, katup aorta, dan sirkulasi peredaran darah ganda tertutup manusia.",
    akurasi: 42,
    status: "DIGENERATE",
    namaFileAsli: "Peredaran_Darah_Manusia.pdf",
    ukuranFileKb: 540,
    tanggalUpload: "22 Okt 2026",
    poinKunci: [
      "Jantung memiliki 4 ruang utama (2 serambi dan 2 bilik).",
      "Bilik kiri memompa darah ke seluruh tubuh melewati katup aorta.",
      "Peredaran darah ganda terdiri dari peredaran darah besar dan kecil.",
    ],
    bagianMateri: [
      {
        id: 301,
        materiId: 3,
        judulBagian: "Fungsi Bilik Jantung & Katup Aorta",
        teksRingkasan:
          "Bilik kiri memiliki otot paling tebal untuk memompa darah ke seluruh tubuh melalui katup aorta.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: [
          {
            id: 3001,
            bagianMateriId: 301,
            pertanyaan: "Mengapa dinding otot bilik kiri jantung lebih tebal daripada bilik kanan?",
            opsi: [
              { label: "A", teks: "Memompa darah beroksigen ke seluruh jaringan tubuh", isBenar: true },
              { label: "B", teks: "Hanya memompa darah menuju paru-paru", isBenar: false },
              { label: "C", teks: "Menerima darah langsung dari saluran pencernaan", isBenar: false },
              { label: "D", teks: "Menampung darah kotor dari vena", isBenar: false },
            ],
            kunciJawaban: "A",
            pembahasan: "Bilik kiri memerlukan kekuatan kontraksi tinggi untuk menyalurkan darah ke seluruh organ tubuh manusia.",
            tingkatKesulitan: "SEDANG",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    judul: "Mengenal Bagian Tumbuhan & Fotosintesis",
    tingkat: "SD",
    bab: "Bab 2.1",
    mataPelajaran: "IPAS Ceria",
    deskripsi:
      "Fungsi akar, batang, daun, bunga, dan proses fotosintesis pada daun hijau dibantu sinar matahari.",
    akurasi: 85,
    status: "DIGENERATE",
    namaFileAsli: "IPAS_Kelas4_Bagian_Tumbuhan.pdf",
    ukuranFileKb: 280,
    tanggalUpload: "23 Okt 2026",
    poinKunci: [
      "Akar menyerap air dan zat hara dari dalam tanah.",
      "Daun memiliki klorofil hijau untuk memasak makanan (fotosintesis).",
      "Sinar matahari dan air membantu tumbuhan menghasilkan oksigen segar.",
    ],
    bagianMateri: [
      {
        id: 401,
        materiId: 4,
        judulBagian: "Dapur Tumbuhan: Fotosintesis Daun",
        teksRingkasan:
          "Daun tumbuhan menggunakan zat hijau klorofil dan cahaya matahari untuk membuat makanan sendiri.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: [
          {
            id: 4001,
            bagianMateriId: 401,
            pertanyaan: "Bagian tumbuhan yang bertugas menyerap air dan zat hara dari dalam tanah adalah...",
            opsi: [
              { label: "A", teks: "Akar", isBenar: true },
              { label: "B", teks: "Daun", isBenar: false },
              { label: "C", teks: "Bunga", isBenar: false },
            ],
            kunciJawaban: "A",
            pembahasan: "Akar tumbuhan berada di dalam tanah dan bertugas menyerap air dan nutrisi tanah.",
            tingkatKesulitan: "MUDAH",
          },
        ],
      },
    ],
  },
];

const MateriContext = createContext<MateriContextType | undefined>(undefined);

export const MateriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [materiList, setMateriList] = useState<Materi[]>(() => {
    try {
      const saved = localStorage.getItem("soalku_materi_list");
      return saved ? JSON.parse(saved) : SEED_MATERI_LIST;
    } catch {
      return SEED_MATERI_LIST;
    }
  });

  const [activeMateri, setActiveMateri] = useState<Materi | null>(() => {
    return materiList.length > 0 ? materiList[0] : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem("soalku_materi_list", JSON.stringify(materiList));
    } catch (e) {
      console.error("Gagal menyimpan materi ke localStorage", e);
    }
  }, [materiList]);

  const uploadMateri = async (
    file: File | null,
    manualText: string,
    tingkat: TingkatMateri,
    customTitle?: string
  ): Promise<Materi> => {
    let fileName = customTitle || "Materi Mandiri Siswa.pdf";
    let fileSizeKb = 150;
    let contentToProcess = manualText;

    if (file) {
      fileName = file.name;
      fileSizeKb = Math.round(file.size / 1024);

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        try {
          contentToProcess = await file.text();
        } catch {
          contentToProcess = manualText;
        }
      }
    }

    const newMateri = await extractAndProcessDocument(
      fileName,
      contentToProcess || fileName,
      tingkat,
      fileSizeKb
    );

    setMateriList((prev) => [newMateri, ...prev]);
    setActiveMateri(newMateri);
    return newMateri;
  };

  const deleteMateri = (id: number) => {
    setMateriList((prev) => prev.filter((m) => m.id !== id));
    if (activeMateri?.id === id) {
      setActiveMateri(null);
    }
  };

  const regenerateBagianMateri = async (materiId: number, bagianId: number) => {
    // Delay simulasi AI regeneration
    await new Promise((resolve) => setTimeout(resolve, 600));

    setMateriList((prev) =>
      prev.map((m) => {
        if (m.id !== materiId) return m;

        const updatedBagian = m.bagianMateri.map((bm) => {
          if (bm.id !== bagianId) return bm;

          const newSoalId = Date.now();
          const regeneratedSoal: typeof bm.generatedSoal = [
            {
              id: newSoalId,
              bagianMateriId: bm.id,
              pertanyaan: `[Variasi AI Baru] Berdasarkan konsep ${bm.judulBagian}, manakah pernyataan analisis yang paling akurat?`,
              opsi:
                m.tingkat === "SD"
                  ? [
                      { label: "A", teks: "Materi ini dapat diterapkan dalam kehidupan harian dengan baik", isBenar: true },
                      { label: "B", teks: "Materi ini bertentangan dengan fakta sains alam", isBenar: false },
                      { label: "C", teks: "Hasil pengamatan tidak memiliki kegunaan", isBenar: false },
                    ]
                  : [
                      { label: "A", teks: "Mekanisme proses ini menjaga homeostasis dan keseimbangan sistemik tubuh", isBenar: true },
                      { label: "B", teks: "Proses ini berlangsung secara pasif tanpa memerlukan energi seluler", isBenar: false },
                      { label: "C", teks: "Terjadi penurunan drastis pada laju metabolisme basal organ", isBenar: false },
                      { label: "D", teks: "Reaksi ini mengeliminasi seluruh enzim pencernaan", isBenar: false },
                    ],
              kunciJawaban: "A",
              pembahasan: "Butir soal telah di-generate ulang dengan variasi tingkat kognitif analitis baru.",
              tingkatKesulitan: "SEDANG",
            },
          ];

          return {
            ...bm,
            status: "DIGENERATE" as const,
            teksRingkasan: `${bm.teksRingkasan} (Telah diperbarui oleh AI Gemini Engine)`,
            generatedSoal: regeneratedSoal,
          };
        });

        const updatedMateri = { ...m, bagianMateri: updatedBagian };
        if (activeMateri?.id === materiId) {
          setActiveMateri(updatedMateri);
        }
        return updatedMateri;
      })
    );
  };

  const resetToDefaultMateri = () => {
    setMateriList(SEED_MATERI_LIST);
    setActiveMateri(SEED_MATERI_LIST[0]);
    localStorage.removeItem("soalku_materi_list");
  };

  return (
    <MateriContext.Provider
      value={{
        materiList,
        activeMateri,
        setActiveMateri,
        uploadMateri,
        deleteMateri,
        regenerateBagianMateri,
        resetToDefaultMateri,
      }}
    >
      {children}
    </MateriContext.Provider>
  );
};

export const useMateri = () => {
  const context = useContext(MateriContext);
  if (!context) {
    throw new Error("useMateri harus digunakan di dalam MateriProvider");
  }
  return context;
};
