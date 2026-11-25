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
    dibuatOleh?: string,
    guruEmail?: string,
    guruId?: string,
    tipeTiket?: "WALI_KELAS" | "GURU_MAPEL",
    mapelTiket?: string,
    kelasTiket?: string
  ) => KodeUndangan;
  deleteKodeUndangan: (idOrKode: string) => void;
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

const INITIAL_SOAL_LIST: SoalReview[] = [];
const INITIAL_SISWA_LIST: SiswaBinaan[] = [];
const INITIAL_KODE_UNDANGAN: KodeUndangan[] = [];
const INITIAL_TOPIK_EVALUASI: TopikEvaluasi[] = [];

const MentorContext = createContext<MentorContextType | undefined>(undefined);

export const MentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soalList, setSoalList] = useState<SoalReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOAL);
      if (saved) {
        const parsed: SoalReview[] = JSON.parse(saved);
        // Hapus soal mock/dummy bawaan
        return parsed.filter((s) => ![7, 9, 12, 13, 14, 15, 16, 17, 18].includes(s.id));
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
        const dummyNames = [
          "arya pratama",
          "mutiara dewanda",
          "dzaky ahsanal",
          "raffi azzaky",
          "mohammad thoriq",
          "adit pratama",
        ];
        return parsed.filter((s) => {
          if (["sis-1", "sis-2", "sis-3", "sis-4", "sis-5", "sis-6"].includes(s.id)) return false;
          if (
            dummyNames.includes(s.nama.toLowerCase().trim()) &&
            (!s.kodeUndanganTerhubung || s.kodeUndanganTerhubung === "GURU-SMP-2026" || s.kodeUndanganTerhubung === "GURU-SD-2026")
          ) {
            return false;
          }
          return true;
        });
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
      if (saved) {
        const parsed: TopikEvaluasi[] = JSON.parse(saved);
        return parsed.filter((t) => ![1, 2, 3, 4, 5].includes(t.id));
      }
      return INITIAL_TOPIK_EVALUASI;
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
              statusRemedial: "Perlu Remedial" as const,
              topikKelemahan: `${topikNama} (${skor}%)`,
              akurasiRataRata: skor,
              totalLatihan: siswa.totalLatihan + 1,
              terakhirAktif: "Baru saja",
              catatanGuru: `Siswa memperoleh nilai ${skor} (< 70 KKM) pada topik "${topikNama}". Diwajibkan mengikuti latihan remedial adaptif.`,
            };
          }
        }
        return siswa;
      });

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
              persentaseAkurasi: skor,
              statusPenguasaan: "Perlu Remedial" as const,
              totalBenar: t.totalBenar + Math.round((skor / 100) * 5),
              totalDikerjakan: t.totalDikerjakan + 5,
              rekomendasiAksi: `Nilai latihan ${skor} (< 70 KKM). Fokus latihan remedial pada butir soal yang keliru (${topikNama}).`,
            };
          }
        }
        return t;
      });

      if (!topicFound) {
        const newTopik: TopikEvaluasi = {
          id: Date.now(),
          bagianMateriId: 101,
          namaTopik: topikNama,
          mataPelajaran: topikNama.toLowerCase().includes("inggris")
            ? "Bahasa Inggris"
            : topikNama.toLowerCase().includes("matematika")
            ? "Matematika"
            : topikNama.toLowerCase().includes("ipa") || topikNama.toLowerCase().includes("darah")
            ? "IPA Terpadu"
            : "Latihan Adaptif",
          tingkat: "SMP",
          totalDikerjakan: 20,
          totalBenar: Math.round((skor / 100) * 20),
          persentaseAkurasi: skor,
          statusPenguasaan: isLulus ? ("Tuntas & Sangat Baik" as const) : ("Perlu Remedial" as const),
          rekomendasiAksi: isLulus
            ? `Siswa telah menuntaskan materi dengan nilai ${skor} (>= 70).`
            : `Nilai latihan ${skor} (< 70 KKM). Diwajibkan mengikuti remedial adaptif untuk memperkuat pemahaman.`,
          tipsPenguatan: "Fokus pada penguasaan butir soal dan kosa kata yang belum tepat dijawab.",
        };
        return [newTopik, ...updated];
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
            newStatusRemedial = "Perlu Remedial";
            newTopikKelemahan = `${topikTitle} (${sesi.skor}%)`;
            catatanOtomatis = `Perlu penguatan materi pada topik ${topikTitle}. Nilai latihan: ${sesi.skor}. Diwajibkan mengikuti latihan remedial.`;
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
        let connectedGuruEmail: string | undefined = undefined;
        let connectedGuruId: string | undefined = undefined;
        try {
          const raw = localStorage.getItem("soalku_connected_teacher");
          if (raw) {
            const parsed = JSON.parse(raw);
            connectedCode = parsed.kode;
            connectedGuru = parsed.guru;
            connectedGuruEmail = parsed.guruEmail;
            connectedGuruId = parsed.guruId;
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
          statusRemedial: isLulus ? ("Tuntas" as const) : ("Perlu Remedial" as const),
          catatanGuru: `Siswa mengerjakan modul ${topikTitle} dengan nilai ${sesi.skor}. ${
            isLulus ? "Capaian tuntas." : "Diwajibkan mengikuti remedial adaptif."
          }`,
          terakhirAktif: nowTime,
          kodeUndanganTerhubung: connectedCode,
          guruPembimbing: connectedGuru,
          guruEmail: connectedGuruEmail,
          guruId: connectedGuruId,
          riwayatPengerjaan: [newRiwayat],
        };
        return [newSiswaObj, ...prev];
      }

      return updated;
    });

    // Sinkronkan ke TopikEvaluasi guru jika topik sesuai
    setTopikEvaluasiList((prev) => {
      let matchFound = false;
      const updated = prev.map((te) => {
        if (
          te.tingkat === sesi.tingkat &&
          (te.namaTopik.toLowerCase().includes(topikTitle.toLowerCase()) ||
            topikTitle.toLowerCase().includes(te.namaTopik.toLowerCase()))
        ) {
          matchFound = true;
          const totalDikerjakan = te.totalDikerjakan + sesi.totalSoal;
          const totalBenar = te.totalBenar + sesi.totalBenar;
          const persentaseAkurasi = Math.round((totalBenar / totalDikerjakan) * 100);
          return {
            ...te,
            totalDikerjakan,
            totalBenar,
            persentaseAkurasi,
            statusPenguasaan:
              persentaseAkurasi >= 70
                ? ("Tuntas & Sangat Baik" as const)
                : ("Perlu Remedial" as const),
            rekomendasiAksi:
              persentaseAkurasi >= 70
                ? "Telah menuntaskan kriteria kelulusan KKM."
                : `Fokus latihan remedial pada butir soal yang keliru (${topikTitle}).`,
          };
        }
        return te;
      });

      if (!matchFound) {
        const newAkurasi = sesi.totalSoal > 0 ? Math.round((sesi.totalBenar / sesi.totalSoal) * 100) : 0;
        const newTopik: TopikEvaluasi = {
          id: Date.now(),
          bagianMateriId: 101,
          namaTopik: topikTitle,
          mataPelajaran: sesi.mapel,
          tingkat: sesi.tingkat,
          totalDikerjakan: sesi.totalSoal,
          totalBenar: sesi.totalBenar,
          persentaseAkurasi: newAkurasi,
          statusPenguasaan: newAkurasi >= 70 ? ("Tuntas & Sangat Baik" as const) : ("Perlu Remedial" as const),
          rekomendasiAksi:
            newAkurasi >= 70
              ? "Telah menuntaskan kriteria kelulusan KKM."
              : `Nilai ${newAkurasi} belum tuntas KKM 70. Fokus latihan remedial pada butir soal yang keliru (${topikTitle}).`,
          tipsPenguatan: "Fokus pada penguasaan butir soal dan kosa kata yang belum tepat dijawab.",
        };
        return [newTopik, ...updated];
      }
      return updated;
    });
  };

  const createKodeUndangan = (
    targetTingkat: "SD" | "SMP" | "SEMUA" = "SMP",
    customPrefix: string = "GURU",
    dibuatOleh: string = "Guru Pembimbing",
    guruEmail?: string,
    guruId?: string,
    tipeTiket: "WALI_KELAS" | "GURU_MAPEL" = "WALI_KELAS",
    mapelTiket?: string,
    kelasTiket?: string
  ): KodeUndangan => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = tipeTiket === "GURU_MAPEL" ? (mapelTiket ? mapelTiket.substring(0, 3).toUpperCase() : "MAPEL") : customPrefix;
    const newKode: KodeUndangan = {
      id: `kod-${Date.now()}`,
      kode: `${prefix}-${targetTingkat}-${randomSuffix}`,
      status: "AKTIF",
      expiredAt: "7 Hari (Sekali Pakai)",
      dibuatOleh,
      guruEmail,
      guruId,
      targetTingkat,
      tipeTiket,
      mapelTiket,
      kelasTiket,
      totalDipakai: 0,
    };

    setKodeUndanganList((prev) => [newKode, ...prev]);
    return newKode;
  };

  const deleteKodeUndangan = (idOrKode: string) => {
    setKodeUndanganList((prev) =>
      prev.filter((k) => k.id !== idOrKode && k.kode !== idOrKode)
    );
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
    const targetName = studentNama || (studentTingkat === "SD" ? "Siswa SD" : "Siswa SMP");
    const targetTingkat = studentTingkat || (found.targetTingkat !== "SEMUA" ? found.targetTingkat : "SMP");

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
            tingkat: targetTingkat,
            kodeUndanganTerhubung: found.kode,
            guruPembimbing: found.dibuatOleh,
            guruEmail: found.guruEmail,
            guruId: found.guruId,
            terakhirAktif: "Baru saja terhubung",
          };
        }
        return s;
      });

      if (!foundStudent) {
        const newStudent: SiswaBinaan = {
          id: "sis-" + Date.now(),
          nama: targetName,
          kelas: targetTingkat === "SD" ? "Kelas 4 SD" : "Kelas 8-A SMP",
          tingkat: targetTingkat,
          avatarColor: targetTingkat === "SD" ? "bg-amber-500" : "bg-[#84A282]",
          totalLatihan: 0,
          akurasiRataRata: 0,
          topikKelemahan: "Belum ada riwayat",
          statusRemedial: "Bimbingan",
          catatanGuru: `Siswa baru terhubung melalui kode undangan ${found.kode}.`,
          terakhirAktif: "Baru saja terhubung",
          kodeUndanganTerhubung: found.kode,
          guruPembimbing: found.dibuatOleh,
          guruEmail: found.guruEmail,
          guruId: found.guruId,
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
          guruEmail: found.guruEmail,
          guruId: found.guruId,
          targetTingkat: found.targetTingkat,
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
        deleteKodeUndangan,
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
