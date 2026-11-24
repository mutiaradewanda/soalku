import React, { createContext, useContext, useState, useEffect } from "react";
import { Materi, TingkatMateri } from "../types/materi";
import { extractAndProcessDocument } from "../services/aiExtractionService";

interface MateriContextType {
  materiList: Materi[];
  activeMateri: Materi | null;
  setActiveMateri: (materi: Materi | null) => void;
  uploadMateri: (
    file: File | null,
    manualText: string,
    tingkat: TingkatMateri,
    customTitle?: string,
    bahasaPengantar?: "SESUAI_MODUL" | "INDONESIA"
  ) => Promise<Materi>;
  deleteMateri: (id: number) => void;
  regenerateBagianMateri: (materiId: number, bagianId: number) => Promise<void>;
  resetToDefaultMateri: () => void;
}

// Awal login siswa bersih tanpa modul bawaan/dummy
const SEED_MATERI_LIST: Materi[] = [];

const DUMMY_TITLES = [
  "biologi sistem pencernaan",
  "aljabar dasar & faktorisasi",
  "aljabar dasar dan faktorisasi",
  "sistem peredaran darah manusia",
  "mengenal bagian tumbuhan & fotosintesis",
  "mengenal bagian tumbuhan dan fotosintesis",
  "tumbuhan sahabat kita",
];

const MateriContext = createContext<MateriContextType | undefined>(undefined);

export const MateriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [materiList, setMateriList] = useState<Materi[]>(() => {
    try {
      const saved = localStorage.getItem("soalku_materi_list");
      if (saved) {
        const parsed: Materi[] = JSON.parse(saved);
        // Bersihkan modul mock/dummy bawaan (ids: 1, 2, 3, 4 atau judul dummy)
        return parsed.filter(
          (m) =>
            ![1, 2, 3, 4].includes(m.id) &&
            !DUMMY_TITLES.includes(m.judul.toLowerCase().trim())
        );
      }
      return SEED_MATERI_LIST;
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
    customTitle?: string,
    bahasaPengantar: "SESUAI_MODUL" | "INDONESIA" = "SESUAI_MODUL"
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
      fileSizeKb,
      file,
      bahasaPengantar
    );

    setMateriList((prev) => {
      const updated = [newMateri, ...prev];
      try {
        localStorage.setItem("soalku_materi_list", JSON.stringify(updated));
      } catch (e) {
        console.error("Gagal menyimpan materi ke localStorage", e);
      }
      return updated;
    });
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
    setMateriList([]);
    setActiveMateri(null);
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
