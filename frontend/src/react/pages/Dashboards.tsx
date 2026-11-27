import React, { useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMateri } from "../context/MateriContext";
import { useQuiz } from "../context/QuizContext";
import { Materi } from "../types/materi";
import { SoalQuiz } from "../types/quiz";
import { MateriDetailModal } from "../components/MateriDetailModal";
import { useMentor } from "../context/MentorContext";
import { SiswaBinaan, SoalReview } from "../types/mentor";
import { BeriCatatanModal } from "../components/BeriCatatanModal";
import { EditQuestionModal } from "../components/EditQuestionModal";
import { RejectReasonModal } from "../components/RejectReasonModal";
import { DragonMascot } from "../components/DragonMascot";
import { KodeUndanganModal } from "../components/KodeUndanganModal";
import { RiwayatSiswaModal } from "../components/RiwayatSiswaModal";
import {
  LogOut,
  School,
  BookCheck,
  KeyRound,
  Activity,
  Users,
  Flame,
  Trophy,
  Target,
  ArrowRight,
  Clock,
  Shuffle,
  ShieldAlert,
  CheckCircle,
  FileText,
  BarChart2,
  ChevronRight,
  ChevronDown,
  Star,
  UploadCloud,
  FileUp,
  Layers,
  Trash2,
  Plus,
  BookOpen,
  CheckCircle2,
  Zap,
  Copy,
  Check,
  MessageSquare,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Ticket,
} from "lucide-react";

export const SdDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { materiList, deleteMateri, uploadMateri } = useMateri();
  const { startSession } = useQuiz();
  const { getSiswaByNama } = useMentor();

  const currentSiswa = user?.name ? getSiswaByNama(user.name) : undefined;
  const connectedCode = currentSiswa?.kodeUndanganTerhubung;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadProgressStep, setUploadProgressStep] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detailMateriId, setDetailMateriId] = useState<number | null>(null);
  const [isKodeModalOpen, setIsKodeModalOpen] = useState(false);

  const sdMateriList = materiList.filter((m) => m.tingkat === "SD");
  const detailMateri = materiList.find((m) => m.id === detailMateriId) || null;

  const handleDirectUpload = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    const validExtensions = [".pdf", ".docx", ".txt"];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      setUploadError("Format berkas ditolak. Hanya berkas .pdf, .docx, atau .txt yang diperbolehkan.");
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`Ukuran berkas terlalu besar (${sizeMb} MB). Batas maksimal adalah 10 MB.`);
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setIsUploading(true);
    setUploadFileName(file.name);
    setUploadProgressStep("Mengekstrak dokumen & AI merangkum materi SD...");

    try {
      const newMateri = await uploadMateri(file, "", "SD");
      setDetailMateriId(newMateri.id);
      setUploadSuccess(`Berhasil! Modul "${file.name}" langsung diunggah dan dirangkum oleh AI.`);
      setTimeout(() => setUploadSuccess(null), 6000);
    } catch (err: any) {
      setUploadError(err?.message || "Gagal mengunggah dan mengekstrak berkas materi.");
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgressStep("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleDirectUpload(e.target.files[0]);
    }
  };

  const handleStartPracticeFromMateri = (materi: Materi) => {
    const questions: SoalQuiz[] = [];
    materi.bagianMateri.forEach((bm) => {
      (bm.generatedSoal || []).forEach((s) => {
        questions.push({
          id: s.id,
          tingkat: materi.tingkat,
          bagianMateriId: bm.id,
          topik: bm.judulBagian || materi.judul,
          pertanyaan: s.pertanyaan,
          opsi: s.opsi.map((o) => ({ label: o.label, teks: o.teks })),
          kunciJawabanIndex: s.opsi.findIndex((o) => o.isBenar) !== -1 ? s.opsi.findIndex((o) => o.isBenar) : 0,
          pembahasan: s.pembahasan || `Pembahasan materi ${materi.judul}.`,
          kesulitan: s.tingkatKesulitan,
        });
      });
    });

    startSession("ACAK", 10, "SD", questions, materi.mataPelajaran || materi.judul, materi.judul);
    navigate("/latihan/quiz");
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 md:p-10 text-slate-800">
      {/* Hidden Native File Input for Direct Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#B8CFB3] border-b-4 border-b-[#84A282]/50 shadow-lg shadow-black/8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#B8CFB3]/40 rounded-xl text-[#60795e] border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] shadow-sm">
              <BookCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsKodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#FEFAF3] hover:bg-[#F6E2E9]/50 text-[#739071] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] text-xs font-bold transition shadow-sm active:translate-y-0.5"
              title={
                connectedCode
                  ? `Terhubung ke Guru via ${connectedCode}`
                  : "Masukkan Kode Undangan Guru"
              }
            >
              <KeyRound className="w-4 h-4 text-[#84A282]" />
              <span className="hidden sm:inline">
                {connectedCode ? `Kode: ${connectedCode}` : "Kode Undangan"}
              </span>
              {connectedCode && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <Link
              to="/evaluasi"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#FEFAF3] hover:bg-[#F6E2E9]/50 text-[#739071] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] text-xs font-bold transition shadow-sm active:translate-y-0.5"
            >
              <Target className="w-4 h-4 text-[#84A282]" />
              <span>Rapor Evaluasi</span>
            </Link>
            <button
              onClick={() => {
                if (sdMateriList.length === 0) {
                  setUploadError("Silakan unggah berkas modul PDF terlebih dahulu sebelum memulai latihan!");
                  fileInputRef.current?.click();
                  return;
                }
                navigate("/latihan");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#84A282] hover:bg-[#739071] text-white rounded-xl text-xs font-bold border-b-2 border-b-[#60795e] shadow-md shadow-[#84A282]/30 active:translate-y-0.5 transition"
            >
              <span>Mulai CBT Adaptif</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#60795e] hover:bg-[#4e634d] disabled:opacity-60 text-white rounded-xl text-xs font-bold border-b-2 border-b-[#40523e] shadow-sm active:translate-y-0.5 transition"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Unggah Modul PDF</span>
                </>
              )}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition border border-rose-200 border-b-2 border-b-rose-300 shadow-sm active:translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative z-10 space-y-2 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-black">Halo, {user?.name || "Siswa SD"}!</h1>
            <p className="text-[#FEFAF3]/90 text-xs sm:text-sm">
              Kamu terdaftar di <b>{(user as any)?.grade || "Kelas 4 SD"}</b>. Orang Tua pendamping:{" "}
              <b>{(user as any)?.parentName || "-"}</b>.{" "}
              {sdMateriList.length === 0
                ? "Ayo unggah materi pelajaran (PDF) pertama kamu di bawah ini untuk belajar bersama naga SoalKu!"
                : "Ayo buka modul belajarmu atau pilih latihan ceria hari ini!"}
            </p>
          </div>
          <div className="hidden sm:block shrink-0 relative z-10 mr-2 my-0">
            <DragonMascot variant="sitting" className="w-28 sm:w-32 drop-shadow-md hover:scale-105 transition-transform" />
          </div>
        </div>

        {/* Catatan Pembimbing Guru */}
        {currentSiswa?.catatanGuru && (
          <div className="p-4 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] flex items-start gap-3 shadow-sm">
            <div className="p-2 rounded-xl bg-[#84A282]/20 text-[#60795e] shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#60795e] uppercase tracking-wider block">
                Pesan Bimbingan Guru ({currentSiswa.guruPembimbing || "Wali Kelas"}):
              </span>
              <p className="text-xs text-slate-800 font-medium italic">
                “{currentSiswa.catatanGuru}”
              </p>
            </div>
          </div>
        )}

        {/* Direct Upload Dropzone Card for SD */}
        <div className="bg-white rounded-3xl p-6 border border-[#B8CFB3] shadow-sm space-y-4">
          <div className="border-b border-[#B8CFB3]/40 pb-3">
            <h3 className="text-base font-bold text-slate-800">
              Pusat Unggah Modul Belajar Siswa (PDF / DOCX)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih atau seret berkas materi pelajaran (Maks 10 MB) untuk langsung diringkas otomatis oleh AI ramah anak.
            </p>
          </div>

          {/* Upload Status Alerts */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-[#FEFAF3] border border-[#84A282] rounded-xl text-xs font-semibold text-[#60795e] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#84A282] shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <div
            onClick={() => {
              if (!isUploading) fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0] && !isUploading) {
                handleDirectUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center gap-2 ${isDragging
                ? "border-[#84A282] bg-[#F6E2E9]/60 scale-[1.01]"
                : "border-[#B8CFB3] hover:border-[#84A282] bg-[#FEFAF3]/60 hover:bg-[#F6E2E9]/40"
              }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-12 h-12 rounded-2xl bg-[#84A282]/20 text-[#60795e] border border-[#84A282] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#84A282]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Sedang Mengunggah & Meringkas: {uploadFileName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{uploadProgressStep}</p>
                </div>
                <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#84A282] h-full w-2/3 animate-pulse rounded-full"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#B8CFB3]/30 text-[#60795e] border border-[#B8CFB3] flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>
                {isDragging && (
                  <p className="text-xs font-bold text-[#60795e]">
                    Lepaskan Berkas di Sini Untuk Langsung Mengunggah
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modul Belajar Siswa SD (Tampil saat berkas modul telah diunggah) */}
        {sdMateriList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Modul Belajar Mandiri SD</h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sdMateriList.map((materi) => (
                <div
                  key={materi.id}
                  className="bg-white rounded-2xl p-5 border border-[#B8CFB3] shadow-sm hover:shadow-md hover:border-[#84A282] transition flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-[#F6E2E9] text-[#60795e] border border-[#B8CFB3]/60">
                        {materi.bab} • {materi.mataPelajaran}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#60795e] transition-colors">
                      {materi.judul}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {materi.deskripsi}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#B8CFB3]/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setDetailMateriId(materi.id)}
                      className="flex-1 py-2 bg-[#FEFAF3] hover:bg-[#84A282] text-[#60795e] hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#B8CFB3] transition shadow-sm"
                    >
                      <span>Buka Modul</span>
                    </button>
                    <button
                      onClick={() => deleteMateri(materi.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Hapus Modul"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <MateriDetailModal
        materi={detailMateri}
        isOpen={!!detailMateri}
        onClose={() => setDetailMateriId(null)}
        onStartPractice={handleStartPracticeFromMateri}
      />

      {/* Modal Kode Undangan Guru */}
      <KodeUndanganModal
        isOpen={isKodeModalOpen}
        onClose={() => setIsKodeModalOpen(false)}
        studentTingkat="SD"
        onSuccess={(msg) => setUploadSuccess(msg)}
      />
    </div>
  );
};

export const SmpDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { materiList, deleteMateri, uploadMateri } = useMateri();
  const { startSession, startRemedialSession } = useQuiz();
  const { topikEvaluasiList, getSiswaByNama } = useMentor();

  const currentSiswa = user?.name ? getSiswaByNama(user.name) : undefined;
  const connectedCode = currentSiswa?.kodeUndanganTerhubung;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadProgressStep, setUploadProgressStep] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detailMateriId, setDetailMateriId] = useState<number | null>(null);
  const [isKodeModalOpen, setIsKodeModalOpen] = useState(false);

  const smpMateriList = materiList.filter((m) => m.tingkat === "SMP");
  const detailMateri = materiList.find((m) => m.id === detailMateriId) || null;

  const lastRiwayat = currentSiswa?.riwayatPengerjaan?.[0];
  const isLastFailed = lastRiwayat ? lastRiwayat.skor < 70 : false;
  const isStudentRemedial =
    currentSiswa &&
    (currentSiswa.statusRemedial === "Perlu Remedial" ||
      currentSiswa.statusRemedial === "Bimbingan" ||
      currentSiswa.akurasiRataRata < 70 ||
      isLastFailed);

  const topikKelemahanAktif =
    topikEvaluasiList.find(
      (t) => !t.statusPenguasaan.startsWith("Tuntas") && t.persentaseAkurasi < 70
    ) ||
    (isStudentRemedial
      ? {
          id: 999999,
          namaTopik:
            lastRiwayat?.topik ||
            currentSiswa?.topikKelemahan?.replace(/\s*\(\d+%\)/, "") ||
            "Evaluasi Materi Terakhir",
          mataPelajaran: lastRiwayat?.mapel || "Latihan Adaptif",
          tingkat: "SMP" as const,
          totalDikerjakan: lastRiwayat?.totalSoal || 20,
          totalBenar: lastRiwayat?.totalBenar || 0,
          persentaseAkurasi: lastRiwayat?.skor ?? currentSiswa?.akurasiRataRata ?? 0,
          statusPenguasaan: "Perlu Remedial" as const,
          rekomendasiAksi: `Skor latihan terakhir: ${lastRiwayat?.skor ?? 0}% (Belum tuntas KKM 70). Fokus latihan remedial adaptif telah disiapkan untuk butir soal yang keliru.`,
        }
      : undefined);

  const totalSoalDikerjakan = (currentSiswa?.riwayatPengerjaan || []).reduce(
    (acc, r) => acc + (r.totalSoal || 0),
    0
  );
  const akurasiSiswa = currentSiswa?.akurasiRataRata || 0;

  const handleDirectUpload = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    const validExtensions = [".pdf", ".docx", ".txt"];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      setUploadError("Format berkas ditolak. Hanya berkas .pdf, .docx, atau .txt yang diperbolehkan.");
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`Ukuran berkas terlalu besar (${sizeMb} MB). Batas maksimal adalah 10 MB.`);
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setIsUploading(true);
    setUploadFileName(file.name);
    setUploadProgressStep("Mengekstrak dokumen & menyusun modul CBT SMP via AI...");

    try {
      const newMateri = await uploadMateri(file, "", "SMP");
      setDetailMateriId(newMateri.id);
      setUploadSuccess(`Berhasil! Modul "${file.name}" langsung diunggah dan siap dipelajari.`);
      setTimeout(() => setUploadSuccess(null), 6000);
    } catch (err: any) {
      setUploadError(err?.message || "Gagal mengunggah dan memproses modul.");
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgressStep("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleDirectUpload(e.target.files[0]);
    }
  };

  const handleStartPracticeFromMateri = (materi: Materi) => {
    const questions: SoalQuiz[] = [];
    materi.bagianMateri.forEach((bm) => {
      (bm.generatedSoal || []).forEach((s) => {
        questions.push({
          id: s.id,
          tingkat: materi.tingkat,
          bagianMateriId: bm.id,
          topik: bm.judulBagian || materi.judul,
          pertanyaan: s.pertanyaan,
          opsi: s.opsi.map((o) => ({ label: o.label, teks: o.teks })),
          kunciJawabanIndex: s.opsi.findIndex((o) => o.isBenar) !== -1 ? s.opsi.findIndex((o) => o.isBenar) : 0,
          pembahasan: s.pembahasan || `Pembahasan materi ${materi.judul}.`,
          kesulitan: s.tingkatKesulitan,
        });
      });
    });

    startSession("ACAK", 20, "SMP", questions, materi.mataPelajaran || materi.judul, materi.judul);
    navigate("/latihan/quiz");
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-4 sm:p-6 md:p-10">
      {/* Hidden Native File Input for Direct Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#B8CFB3] border-b-4 border-b-[#84A282]/50 shadow-lg shadow-black/8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#B8CFB3]/40 rounded-xl text-[#60795e] border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] shadow-sm">
              <BookCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsKodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#FEFAF3] hover:bg-[#F6E2E9]/50 text-[#739071] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] text-xs font-bold transition shadow-sm active:translate-y-0.5"
              title={
                connectedCode
                  ? `Terhubung ke Guru via ${connectedCode}`
                  : "Masukkan Kode Undangan Guru"
              }
            >
              <KeyRound className="w-4 h-4 text-[#84A282]" />
              <span className="hidden sm:inline">
                {connectedCode ? `Kode: ${connectedCode}` : "Kode Undangan"}
              </span>
              {connectedCode && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <Link
              to="/evaluasi"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#FEFAF3] hover:bg-[#F6E2E9]/50 text-[#739071] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] text-xs font-bold transition shadow-sm active:translate-y-0.5"
            >
              <Target className="w-4 h-4 text-[#84A282]" />
              <span>Rapor Evaluasi</span>
            </Link>
            <button
              onClick={() => {
                if (smpMateriList.length === 0) {
                  setUploadError("Silakan unggah berkas modul PDF terlebih dahulu sebelum memulai latihan!");
                  fileInputRef.current?.click();
                  return;
                }
                navigate("/latihan");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#84A282] hover:bg-[#739071] text-white rounded-xl text-xs font-bold border-b-2 border-b-[#60795e] shadow-md shadow-[#84A282]/30 active:translate-y-0.5 transition"
            >
              <span>Mulai CBT Adaptif</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#60795e] hover:bg-[#4e634d] disabled:opacity-60 text-white rounded-xl text-xs font-bold border-b-2 border-b-[#40523e] shadow-sm active:translate-y-0.5 transition"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Unggah Modul PDF</span>
                </>
              )}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold transition border border-rose-200 border-b-2 border-b-rose-300 shadow-sm active:translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Welcome Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
                {(user as any)?.grade || "Kelas 8 SMP"} • NISN: {(user as any)?.nisn || "-"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">Dasbor Belajar Siswa</h1>
              <p className="text-[#FEFAF3]/90 text-xs sm:text-sm max-w-lg">
                {smpMateriList.length === 0
                  ? "Selamat datang! Unggah berkas modul pelajaran (PDF) untuk memulai rangkuman dan latihan soal adaptif AI."
                  : currentSiswa && currentSiswa.totalLatihan > 0
                  ? `Target Belajar: ${currentSiswa.totalLatihan} sesi latihan selesai. Terus tingkatkan capaian belajarmu!`
                  : "Modul siap dipelajari. Buka modul di bawah atau mulai latihan untuk menguji pemahaman!"}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-md">
              <div className="text-center">
                <span className="text-2xl font-black text-white">{akurasiSiswa > 0 ? `${akurasiSiswa}%` : "0%"}</span>
                <p className="text-[10px] text-[#FEFAF3]/80">Akurasi Rata-rata</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <span className="text-2xl font-black text-white">{totalSoalDikerjakan}</span>
                <p className="text-[10px] text-[#FEFAF3]/80">Soal Dikerjakan</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Weakness Recommendation Card (hanya muncul setelah murid mengerjakan latihan soal) */}
        {currentSiswa && currentSiswa.totalLatihan > 0 && (
          topikKelemahanAktif ? (
            <div className="p-5 rounded-2xl bg-[#F6E2E9]/60 border border-[#B8CFB3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#60795e] uppercase tracking-wider">
                      Rekomendasi AI • Target Remedial Pekan Ini
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F6E2E9] text-rose-700 border border-[#B8CFB3]">
                      Akurasi {topikKelemahanAktif.persentaseAkurasi}% • Perlu Remedial
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-0.5">
                    {topikKelemahanAktif.namaTopik} ({topikKelemahanAktif.mataPelajaran})
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {topikKelemahanAktif.rekomendasiAksi}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  startRemedialSession("SMP", topikKelemahanAktif.namaTopik);
                  navigate("/latihan/quiz");
                }}
                className="px-4 py-2.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition shadow-sm"
              >
                <span>Latihan Remedial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Status Remedial • Semua Target Tuntas!
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                      Lulus KKM (&gt;= 70)
                    </span>
                  </div>
                  <h3 className="font-bold text-emerald-950 text-base mt-0.5">
                    Hebat! Tidak Ada Materi Remedial yang Tertunda
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    Seluruh materi yang sebelumnya perlu evaluasi telah Anda selesaikan dengan nilai di atas 70. Laporan kelulusan telah tercatat di Dasbor Guru.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigate("/latihan/pilih?mode=ACAK");
                }}
                className="px-4 py-2.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition shadow-sm"
              >
                <span>Latihan Pengayaan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )
        )}

        {/* Catatan Pembimbing Guru */}
        {currentSiswa?.catatanGuru && (
          <div className="p-4 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] flex items-start gap-3 shadow-sm">
            <div className="p-2 rounded-xl bg-[#84A282]/20 text-[#60795e] shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#60795e] uppercase tracking-wider block">
                Pesan Bimbingan Guru ({currentSiswa.guruPembimbing || "Wali Kelas"}):
              </span>
              <p className="text-xs text-slate-800 font-medium italic">
                “{currentSiswa.catatanGuru}”
              </p>
            </div>
          </div>
        )}

        {/* Direct Upload Dropzone Card for SMP */}
        <div className="p-6 rounded-3xl bg-white border border-[#B8CFB3] shadow-sm space-y-4">
          <div className="border-b border-[#B8CFB3]/60 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Modul Instan AI (Dropzone Dokumen)
            </h3>
            <p className="text-xs text-slate-500">
              Unggah berkas PDF atau DOCX (Maks 10 MB) untuk diekstraksi langsung menjadi butir soal CBT dan ringkasan mandiri.
            </p>
          </div>

          {/* Upload Status Alerts */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-[#FEFAF3] border border-[#84A282] rounded-xl text-xs font-semibold text-[#60795e] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#84A282] shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <div
            onClick={() => {
              if (!isUploading) fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0] && !isUploading) {
                handleDirectUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center gap-2 ${isDragging
                ? "border-[#84A282] bg-[#F6E2E9]/60 scale-[1.01]"
                : "border-[#B8CFB3] hover:border-[#84A282] bg-[#FEFAF3] hover:bg-[#F6E2E9]/20"
              }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-12 h-12 rounded-2xl bg-[#84A282]/20 text-[#60795e] border border-[#84A282] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#84A282]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Sedang Mengunggah & Meringkas: {uploadFileName}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{uploadProgressStep}</p>
                </div>
                <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#84A282] h-full w-2/3 animate-pulse rounded-full"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#B8CFB3]/40 text-[#60795e] border border-[#B8CFB3] flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>
                {isDragging && (
                  <p className="text-xs font-bold text-[#60795e]">
                    Lepaskan Berkas di Sini Untuk Langsung Mengunggah
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modul Sedang Dipelajari SMP (Tampil saat berkas modul telah diunggah) */}
        {smpMateriList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Modul Sedang Dipelajari</h3>
                <p className="text-xs text-slate-500">Hasil ekstraksi berkas materi dan kurikulum adaptif</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {smpMateriList.map((materi) => (
                <div
                  key={materi.id}
                  className="p-5 rounded-2xl bg-white border border-[#B8CFB3] hover:border-[#84A282] transition flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-[#F6E2E9] text-[#739071] border border-[#B8CFB3]">
                        {materi.bab} • {materi.mataPelajaran}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base group-hover:text-[#84A282] transition-colors">
                      {materi.judul}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {materi.deskripsi}
                    </p>

                    {/* Akurasi bar */}
                    {materi.akurasi > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Penguasaan Materi</span>
                          <span className={`font-bold ${materi.akurasi < 50 ? "text-amber-400" : "text-[#60795e]"}`}>
                            {materi.akurasi}%
                          </span>
                        </div>
                        <div className="w-full bg-[#e8e2d8] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${materi.akurasi < 50 ? "bg-amber-400" : "bg-emerald-400"
                              }`}
                            style={{ width: `${materi.akurasi}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#B8CFB3]/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setDetailMateriId(materi.id)}
                      className="flex-1 py-2 bg-[#F6E2E9] hover:bg-[#F6E2E9]/80 border border-[#B8CFB3] text-[#739071] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Ringkasan & Soal AI</span>
                    </button>
                    <button
                      onClick={() => deleteMateri(materi.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      title="Hapus Modul"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Modes */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Pilihan Mode Latihan Kilat</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div
              onClick={() => {
                if (smpMateriList.length === 0) {
                  setUploadError("Silakan unggah berkas modul PDF terlebih dahulu sebelum memulai latihan!");
                  fileInputRef.current?.click();
                  return;
                }
                navigate("/latihan/pilih?mode=ACAK");
              }}
              className="p-5 rounded-2xl bg-white border border-[#B8CFB3] hover:border-[#84A282] shadow-sm transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#B8CFB3]/40 text-[#60795e] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Shuffle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Mode Acak</h4>
              <p className="text-xs text-slate-600 mt-1 mb-4">Mengacak butir soal di seluruh bab kurikulum.</p>
              <span className="text-xs font-bold text-[#84A282] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Mulai Sesi <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => {
                if (smpMateriList.length === 0) {
                  setUploadError("Silakan unggah berkas modul PDF terlebih dahulu sebelum memulai simulasi ujian!");
                  fileInputRef.current?.click();
                  return;
                }
                navigate("/latihan/pilih?mode=BERWAKTU");
              }}
              className="p-5 rounded-2xl bg-white border border-[#B8CFB3] hover:border-[#84A282] shadow-sm transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#B8CFB3]/40 text-[#60795e] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Mode Berwaktu</h4>
              <p className="text-xs text-slate-600 mt-1 mb-4">Simulasi ujian ketat dengan countdown live 15 menit.</p>
              <span className="text-xs font-bold text-[#84A282] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Mulai Ujian <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => {
                if (smpMateriList.length === 0) {
                  setUploadError("Silakan unggah berkas modul PDF terlebih dahulu sebelum memulai latihan!");
                  fileInputRef.current?.click();
                  return;
                }
                navigate("/latihan/pilih?mode=FOKUS_KELEMAHAN");
              }}
              className="p-5 rounded-2xl bg-white border border-[#B8CFB3] hover:border-[#84A282] shadow-sm transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F6E2E9] text-[#739071] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Fokus Kelemahan</h4>
              <p className="text-xs text-slate-600 mt-1 mb-4">Prioritas butir materi dengan kesalahan terbanyak.</p>
              <span className="text-xs font-bold text-[#84A282] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Perbaiki Nilai <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <MateriDetailModal
        materi={detailMateri}
        isOpen={!!detailMateri}
        onClose={() => setDetailMateriId(null)}
        onStartPractice={handleStartPracticeFromMateri}
      />

      {/* Modal Kode Undangan Guru */}
      <KodeUndanganModal
        isOpen={isKodeModalOpen}
        onClose={() => setIsKodeModalOpen(false)}
        studentTingkat="SMP"
        onSuccess={(msg) => setUploadSuccess(msg)}
      />
    </div>
  );
};

export const GuruDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    soalList,
    siswaList,
    kodeUndanganList,
    approveSoal,
    rejectSoal,
    editSoal,
    createKodeUndangan,
    deleteKodeUndangan,
    salinKodeUndangan,
    getPendingCount,
    updateCatatanSiswa,
  } = useMentor();

  const [selectedSiswaForNote, setSelectedSiswaForNote] = useState<SiswaBinaan | null>(null);
  const [selectedSiswaForHistory, setSelectedSiswaForHistory] = useState<SiswaBinaan | null>(null);
  const [editingSoal, setEditingSoal] = useState<SoalReview | null>(null);
  const [rejectingSoal, setRejectingSoal] = useState<SoalReview | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dashboardFilterMapel, setDashboardFilterMapel] = useState<string>("SEMUA");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [guruJenjang, setGuruJenjang] = useState<"SD" | "SMP">(() => {
    const userJenjang = (user as any)?.jenjang;
    if (userJenjang === "SD" || userJenjang === "SMP") return userJenjang;
    return "SD";
  });

  // Tipe Tampilan Peran Guru: Wali Kelas vs Guru Mata Pelajaran
  const [roleMode, setRoleMode] = useState<"WALI_KELAS" | "GURU_MAPEL">("WALI_KELAS");

  // Mapel tetap milik guru dari profil register
  const teacherSubject = (user as any)?.mapelAjar || (user as any)?.subject || "Matematika";

  // State untuk form pembuatan tiket baru
  const [ticketType, setTicketType] = useState<"WALI_KELAS" | "GURU_MAPEL">("WALI_KELAS");
  const [kelasTiketInput, setKelasTiketInput] = useState<string>(
    guruJenjang === "SD" ? "Kelas 4" : "Kelas 7"
  );

  const handleCreateNewCode = () => {
    const creator = user?.name || "Guru Pembimbing";
    const userEmail = (user as any)?.email;
    const userId = user?.id;
    const prefix = ticketType === "WALI_KELAS" ? "WALI" : "MAPEL";
    const mapel = ticketType === "GURU_MAPEL" ? teacherSubject : undefined;
    const kelas = ticketType === "WALI_KELAS" ? kelasTiketInput : undefined;

    const newCode = createKodeUndangan(
      guruJenjang,
      prefix,
      creator,
      userEmail,
      userId,
      ticketType,
      mapel,
      kelas
    );
    showToast(`Kode Tiket ${newCode.kode} (${ticketType === "WALI_KELAS" ? "Wali Kelas" : `Mapel ${mapel}`}) berhasil diterbitkan!`);
  };

  const handleDeleteCode = (idOrKode: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kode tiket ini?")) {
      deleteKodeUndangan(idOrKode);
      showToast("Kode tiket berhasil dihapus.");
    }
  };

  const handleQuickApprove = (soalId: number) => {
    approveSoal(soalId, user?.name || "Bu Ratna Kumalasari, S.Pd.");
    showToast("Soal berhasil disetujui masuk ke Bank Soal Siswa!");
  };

  // 1. Filter kode tiket yang HANYA milik guru ini dan HANYA untuk jenjang guru ini (SD atau SMP)
  const myKodeList = useMemo(() => {
    return kodeUndanganList.filter((k) => {
      // Jenjang tiket harus cocok dengan jenjang guru saat ini (atau SEMUA)
      if (k.targetTingkat !== "SEMUA" && k.targetTingkat !== guruJenjang) return false;

      // Tiket harus dibuat oleh guru yang sedang login
      const uEmail = (user as any)?.email?.toLowerCase().trim();
      const uName = user?.name?.toLowerCase().trim();
      const uId = user?.id;

      const matchId = Boolean(uId && k.guruId && k.guruId === uId);
      const matchEmail = Boolean(uEmail && k.guruEmail && k.guruEmail.toLowerCase().trim() === uEmail);
      const matchName = Boolean(uName && k.dibuatOleh && k.dibuatOleh.toLowerCase().trim() === uName);

      return matchId || matchEmail || matchName;
    });
  }, [kodeUndanganList, guruJenjang, user]);

  // 2. Filter siswa aktif:
  // - Jenjang siswa HARUS sama dengan jenjang guru saat ini (SD vs SMP)
  // - Siswa harus sudah menyelesaikan kuis/latihan (riwayat > 0)
  // - Siswa harus terhubung ke kode tiket milik guru ini atau ke akun guru ini
  const activeStudents = useMemo(() => {
    return siswaList.filter((s) => {
      if (s.tingkat !== guruJenjang) return false;

      const hasWorked = (s.riwayatPengerjaan && s.riwayatPengerjaan.length > 0) || (s.totalLatihan || 0) > 0;
      if (!hasWorked) return false;

      const uEmail = (user as any)?.email?.toLowerCase().trim();
      const uName = user?.name?.toLowerCase().trim();
      const uId = user?.id;

      const matchKode = Boolean(
        s.kodeUndanganTerhubung &&
        myKodeList.some((k) => k.kode.toUpperCase() === s.kodeUndanganTerhubung?.toUpperCase())
      );
      const matchEmail = Boolean(uEmail && s.guruEmail && s.guruEmail.toLowerCase().trim() === uEmail);
      const matchName = Boolean(uName && s.guruPembimbing && s.guruPembimbing.toLowerCase().trim() === uName);
      const matchId = Boolean(uId && s.guruId && s.guruId === uId);

      return matchKode || matchEmail || matchName || matchId;
    });
  }, [siswaList, guruJenjang, myKodeList, user]);

  const [filterMapelSiswa, setFilterMapelSiswa] = useState<string>("SEMUA");

  // Standar kurikulum per jenjang
  const standardMapelList = useMemo(() => {
    if (guruJenjang === "SD") {
      return [
        "IPAS",
        "Matematika",
        "Bahasa Indonesia",
        "Bahasa Inggris",
        "Pendidikan Pancasila",
        "PAI",
      ];
    }
    return [
      "IPA Terpadu",
      "Matematika",
      "Bahasa Inggris",
      "Bahasa Indonesia",
      "IPS Terpadu",
      "Informatika",
      "PAI",
    ];
  }, [guruJenjang]);

  // Kumpulkan semua mapel untuk siswa binaan
  const availableSiswaMapel = useMemo(() => {
    const list = new Set<string>();
    standardMapelList.forEach((m) => list.add(m));
    activeStudents.forEach((s) => {
      s.riwayatPengerjaan?.forEach((rw) => {
        if (rw.mapel) list.add(rw.mapel);
      });
    });
    return Array.from(list);
  }, [activeStudents, standardMapelList]);

  // Helper untuk membersihkan raw hash atau ID panjang pada judul topik kelemahan
  const cleanTopicDisplay = (topik: string) => {
    if (!topik) return "Belum ada riwayat";
    return topik.replace(/[A-Za-z0-9_-]{16,}/g, "Modul Adaptif");
  };

  // Filter siswa binaan berdasarkan peran (Wali Kelas vs Guru Mapel) dan dropdown kategori mapel
  const displayStudents = useMemo(() => {
    // Jika dalam mode Guru Mata Pelajaran, hanya saring pengerjaan mapel yang diampu
    const activeMapelTarget =
      roleMode === "GURU_MAPEL"
        ? (user as any)?.mapelAjar || "Matematika"
        : filterMapelSiswa;

    if (activeMapelTarget === "SEMUA" && roleMode === "WALI_KELAS") {
      return activeStudents;
    }

    const target = activeMapelTarget.toLowerCase().trim();

    return activeStudents
      .map((siswa) => {
        const historyForMapel = (siswa.riwayatPengerjaan || []).filter((r) => {
          const m = (r.mapel || "").toLowerCase();
          return m === target || m.includes(target) || target.includes(m);
        });

        if (historyForMapel.length === 0) return null;

        const totalSoal = historyForMapel.reduce((sum, h) => sum + (h.totalSoal || 0), 0);
        const totalBenar = historyForMapel.reduce((sum, h) => sum + (h.totalBenar || 0), 0);
        const akurasiMapel = totalSoal > 0 ? Math.round((totalBenar / totalSoal) * 100) : 0;

        const worstSession = [...historyForMapel].sort((a, b) => a.skor - b.skor)[0];
        const rawTopik = worstSession.topik || worstSession.mapel;
        const cleanTopik = cleanTopicDisplay(rawTopik);
        const topikKelemahanMapel =
          worstSession.skor < 70 ? `${cleanTopik} (${worstSession.skor}%)` : "Tidak ada (Tuntas)";
        const statusRemedialMapel: "Perlu Remedial" | "Bimbingan" | "Tuntas" =
          akurasiMapel >= 70 ? "Tuntas" : "Perlu Remedial";

        return {
          ...siswa,
          totalLatihan: historyForMapel.length,
          akurasiRataRata: akurasiMapel,
          topikKelemahan: topikKelemahanMapel,
          statusRemedial: statusRemedialMapel,
          riwayatPengerjaan: historyForMapel,
        };
      })
      .filter(Boolean) as SiswaBinaan[];
  }, [activeStudents, filterMapelSiswa, roleMode, user]);

  const avgAkurasi =
    activeStudents.length > 0
      ? (activeStudents.reduce((acc, s) => acc + (s.akurasiRataRata || 0), 0) / activeStudents.length).toFixed(1) + "%"
      : "0%";

  const pendingQuestions = soalList.filter(
    (s) => s.statusReview === "MENUNGGU" && (!s.tingkat || s.tingkat === guruJenjang)
  );
  const pendingCount = pendingQuestions.length;

  const availablePendingMapel = useMemo(() => {
    const list = new Set<string>();
    standardMapelList.forEach((m) => list.add(m));
    pendingQuestions.forEach((s) => {
      if (s.mataPelajaran) list.add(s.mataPelajaran);
    });
    return Array.from(list);
  }, [pendingQuestions, standardMapelList]);

  const filteredPendingQuestions = pendingQuestions.filter((s) => {
    if (dashboardFilterMapel === "SEMUA") return true;
    const target = dashboardFilterMapel.toLowerCase().trim();
    const mapel = (s.mataPelajaran || "").toLowerCase().trim();
    return mapel === target || mapel.includes(target) || target.includes(mapel);
  });

  const handleCopyKode = (kode: string) => {
    salinKodeUndangan(kode);
    setCopiedCode(kode);
    showToast(`Kode ${kode} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Sesuai permintaan pengguna: Jika guru awal-awal login (belum ada murid yang mengerjakan soal),
  // HANYA ada card pembuatan kode tiket saja.
  if (activeStudents.length === 0) {
    return (
      <div className="min-h-screen bg-transparent text-slate-800 p-4 sm:p-6 md:p-10 relative">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-[#84A282] text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border border-[#B8CFB3] animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Navbar */}
          <div className="flex items-center justify-between bg-white border border-[#B8CFB3] border-b-4 border-b-[#84A282]/50 rounded-2xl p-4 shadow-lg shadow-black/8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#B8CFB3]/40 text-[#60795e] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{user?.name || "Guru Pembimbing"}</h2>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#84A282] text-white">
                    Guru {guruJenjang}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Panel Guru {guruJenjang} • {(user as any)?.subject || (guruJenjang === "SD" ? "Guru Kelas SD" : "Guru Mata Pelajaran SMP")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 border-b-2 border-b-rose-300 rounded-xl text-xs font-semibold transition shadow-sm active:translate-y-0.5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>

          {/* SINGLE CARD: Pembuatan & Manajemen Kode Tiket Siswa */}
          <div className="bg-white border border-[#B8CFB3] border-b-4 border-b-[#84A282]/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B8CFB3]/60 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#B8CFB3]/40 text-[#60795e] flex items-center justify-center border border-[#B8CFB3] shadow-sm shrink-0">
                  <Ticket className="w-6 h-6 text-[#84A282]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Pembuatan Kode Tiket Bimbingan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Buat kode tiket kelas jenjang {guruJenjang} untuk dibagikan kepada murid Anda
                  </p>
                </div>
              </div>

              <button
                onClick={handleCreateNewCode}
                className="px-4 py-2.5 bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#84A282]/20 active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Kode Tiket Baru</span>
              </button>
            </div>

            {/* Form Pilihan Tipe Tiket: Wali Kelas vs Guru Mapel */}
            <div className="p-4 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Tipe Kode Tiket yang Diterbitkan:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTicketType("WALI_KELAS")}
                  className={`p-3 rounded-xl border text-left transition ${
                    ticketType === "WALI_KELAS"
                      ? "bg-white border-[#84A282] shadow-sm ring-2 ring-[#84A282]/30"
                      : "bg-[#FEFAF3]/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">Tiket Wali Kelas</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Menghubungkan siswa untuk seluruh mata pelajaran di kelas Anda.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTicketType("GURU_MAPEL")}
                  className={`p-3 rounded-xl border text-left transition ${
                    ticketType === "GURU_MAPEL"
                      ? "bg-white border-[#84A282] shadow-sm ring-2 ring-[#84A282]/30"
                      : "bg-[#FEFAF3]/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">Tiket Guru Mata Pelajaran</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Khusus untuk mata pelajaran spesifik yang Anda ajar.
                  </p>
                </button>
              </div>

              {ticketType === "GURU_MAPEL" ? (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">Mata Pelajaran:</span>
                  <div className="px-3.5 py-1.5 bg-[#FEFAF3] border border-[#B8CFB3] rounded-xl text-xs font-bold text-[#60795e]">
                    {teacherSubject}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    (Sesuai mata pelajaran yang Anda daftarkan saat registrasi)
                  </span>
                </div>
              ) : (
                <div className="pt-2 flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-700">Kelas Binaan:</label>
                  <select
                    value={kelasTiketInput}
                    onChange={(e) => setKelasTiketInput(e.target.value)}
                    className="bg-white border border-[#B8CFB3] text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#84A282]/40"
                  >
                    {guruJenjang === "SD" ? (
                      <>
                        <option value="Kelas 4">Kelas 4 SD</option>
                        <option value="Kelas 5">Kelas 5 SD</option>
                        <option value="Kelas 6">Kelas 6 SD</option>
                      </>
                    ) : (
                      <>
                        <option value="Kelas 7">Kelas 7 SMP</option>
                        <option value="Kelas 8">Kelas 8 SMP</option>
                        <option value="Kelas 9">Kelas 9 SMP</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* List of Created Ticket Codes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Daftar Kode Tiket Aktif ({myKodeList.length})
                </h4>
              </div>

              {myKodeList.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FEFAF3] border border-dashed border-[#B8CFB3] space-y-3">
                  <Ticket className="w-10 h-10 text-[#84A282] mx-auto opacity-70" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Belum Ada Kode Tiket Dibuat ({guruJenjang})</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Klik tombol <strong>+ Buat Kode Tiket Baru ({guruJenjang})</strong> di atas untuk membuat kode tiket bimbingan jenjang {guruJenjang} pertama Anda.
                    </p>
                  </div>
                  <button
                    onClick={handleCreateNewCode}
                    className="px-4 py-2 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Kode Tiket Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {myKodeList.map((k) => (
                    <div
                      key={k.id}
                      className="p-4 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] hover:border-[#84A282] space-y-3 transition shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-slate-900 tracking-wider text-base">
                          {k.kode}
                        </span>
                        <span className="text-[10px] font-bold text-[#60795e] bg-white border border-[#B8CFB3] px-2.5 py-0.5 rounded-full">
                          {k.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-[#B8CFB3]/40">
                        <span>Jenjang: {k.targetTingkat}</span>
                        <span>Berlaku: {k.expiredAt}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleCopyKode(k.kode)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border shadow-sm ${
                            copiedCode === k.kode
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : "bg-white hover:bg-[#FEFAF3] text-slate-700 border-[#B8CFB3]"
                          }`}
                        >
                          {copiedCode === k.kode ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Kode</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCode(k.id)}
                          title="Hapus Kode Tiket"
                          className="p-2 rounded-xl text-rose-500 hover:text-white bg-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 transition shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-4 sm:p-6 md:p-10 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#84A282] text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border border-[#B8CFB3] animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#B8CFB3] border-b-4 border-b-[#84A282]/50 rounded-2xl p-4 shadow-lg shadow-black/8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#B8CFB3]/40 text-[#60795e] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#84A282] text-white">
                  Guru {guruJenjang}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {roleMode === "WALI_KELAS"
                  ? `Mode Wali Kelas (Kelas ${(user as any)?.kelasWali || "4 SD"}) • Memantau Seluruh Mata Pelajaran`
                  : `Mode Guru Mapel • Fokus Mata Pelajaran ${(user as any)?.mapelAjar || "Matematika"}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Toggle Switcher Mode: Wali Kelas vs Guru Mata Pelajaran */}
            <div className="flex items-center bg-[#FEFAF3] p-1 rounded-xl border border-[#B8CFB3] shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setRoleMode("WALI_KELAS");
                  showToast("Beralih ke Pandangan Wali Kelas (Semua Mapel)");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  roleMode === "WALI_KELAS"
                    ? "bg-[#84A282] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Wali Kelas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleMode("GURU_MAPEL");
                  showToast(`Beralih ke Pandangan Guru ${(user as any)?.mapelAjar || "Matematika"}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  roleMode === "GURU_MAPEL"
                    ? "bg-[#84A282] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Guru Mapel ({(user as any)?.mapelAjar || "Matematika"})</span>
              </button>
            </div>

            <Link
              to="/mentor/review"
              className="relative px-3.5 py-2 rounded-xl bg-[#F6E2E9] border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] text-[#739071] hover:bg-[#F6E2E9]/80 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
            >
              <span>Review Bank Soal</span>
            </Link>

            <Link
              to="/evaluasi"
              className="px-3.5 py-2 rounded-xl bg-[#B8CFB3]/40 border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] text-[#60795e] hover:bg-[#B8CFB3]/60 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
            >
              <Target className="w-3.5 h-3.5 text-[#84A282]" />
              <span className="hidden sm:inline">Rapor Evaluasi</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 border-b-2 border-b-rose-300 rounded-xl text-xs font-semibold transition shadow-sm active:translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Hero Banner (Sesuai MentorDashboardView.java) */}
        <div className="rounded-3xl bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  Halo, {user?.name || "Guru Pembimbing"}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl leading-relaxed">
                  Guru {guruJenjang} • {(user as any)?.subject || (guruJenjang === "SD" ? "Guru Kelas SD" : "Guru Mata Pelajaran SMP")} • Pantau titik kelemahan materi tiap anak binaan dan setujui bank soal hasil ekstraksi AI.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-center min-w-[95px] backdrop-blur-md">
                  <span className="text-2xl font-black text-emerald-300 block">{activeStudents.length}</span>
                  <span className="text-[10px] font-bold text-emerald-100 uppercase">Siswa Binaan</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-center min-w-[95px] backdrop-blur-md">
                  <span className="text-2xl font-black text-emerald-200 block">{avgAkurasi}</span>
                  <span className="text-[10px] font-bold text-emerald-100 uppercase">Akurasi Kelas</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-center min-w-[95px] backdrop-blur-md">
                  <span className="text-2xl font-black text-amber-300 block">{pendingCount}</span>
                  <span className="text-[10px] font-bold text-amber-100 uppercase">Menunggu Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Ringkasan Progres Seluruh Siswa Binaan (Use Case 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#B8CFB3]/60 pb-3.5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#60795e]" />
                      <span>Ringkasan Progres Seluruh Siswa Binaan</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hasil latihan dicatat per bagian materi untuk memetakan titik kelemahan tiap anak
                    </p>
                  </div>

                  {/* Dropdown Kategori Mata Pelajaran Siswa */}
                  <div className="relative min-w-[210px]">
                    <select
                      value={filterMapelSiswa}
                      onChange={(e) => setFilterMapelSiswa(e.target.value)}
                      className="w-full bg-[#FEFAF3] hover:bg-[#F6E2E9]/40 border border-[#B8CFB3] text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#84A282]/30 focus:border-[#84A282] transition appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="SEMUA">Semua Mata Pelajaran ({activeStudents.length} Siswa)</option>
                      {availableSiswaMapel.map((mapel) => (
                        <option key={mapel} value={mapel}>
                          {mapel}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#739071] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-3">
                  {activeStudents.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#B8CFB3]/40 text-[#60795e] flex items-center justify-center mx-auto border border-[#B8CFB3]">
                        <Ticket className="w-7 h-7 text-[#84A282]" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1.5">
                        <h4 className="text-base font-bold text-slate-800">
                          Belum Ada Siswa Terhubung
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Bagikan kode tiket bimbingan kepada murid Anda. Setelah murid menautkan kode undangan dan mulai mengerjakan latihan soal atau kuis, data progres, nilai, serta riwayat pengerjaannya akan otomatis muncul di sini.
                        </p>
                      </div>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        {myKodeList.length > 0 ? (
                          <button
                            onClick={() => handleCopyKode(myKodeList[0].kode)}
                            className="px-4 py-2 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-sm active:translate-y-0.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Kode Tiket Aktif ({myKodeList[0].kode})</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleCreateNewCode}
                            className="px-4 py-2 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-sm active:translate-y-0.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Buat Kode Tiket Sekarang ({guruJenjang})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : displayStudents.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#FEFAF3] border border-dashed border-[#B8CFB3] space-y-3">
                      <p className="text-sm font-bold text-slate-800">
                        Belum Ada Siswa yang Mengerjakan Mata Pelajaran "{filterMapelSiswa}"
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Siswa binaan Anda belum memiliki riwayat latihan pada mata pelajaran ini.
                      </p>
                      <button
                        onClick={() => setFilterMapelSiswa("SEMUA")}
                        className="px-4 py-2 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold transition shadow-sm"
                      >
                        Tampilkan Semua Mata Pelajaran
                      </button>
                    </div>
                  ) : (
                    displayStudents.map((siswa) => {
                      const isRemedial = siswa.statusRemedial === "Perlu Remedial";
                      const isBimbingan = siswa.statusRemedial === "Bimbingan";
                      const isTuntas = siswa.statusRemedial === "Tuntas";

                      return (
                        <div
                          key={siswa.id}
                          className="p-4 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] hover:border-[#84A282] transition space-y-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm ${
                                  isRemedial ? "bg-rose-600" : isBimbingan ? "bg-amber-600" : "bg-emerald-600"
                                }`}
                              >
                                {siswa.nama.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900">{siswa.nama}</h4>
                                  {siswa.kodeUndanganTerhubung && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#B8CFB3]/40 text-[#60795e] font-mono text-[9px] font-bold">
                                      {siswa.kodeUndanganTerhubung}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  {siswa.kelas} • {siswa.totalLatihan} Bab Tuntas Dikerjakan
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                isRemedial
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : isBimbingan
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {isTuntas ? "✓ Tuntas / Lulus" : siswa.statusRemedial}
                            </span>
                          </div>

                          {/* Accuracy bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">
                                Fokus Kelemahan: <b className="text-slate-800">{cleanTopicDisplay(siswa.topikKelemahan)}</b>
                              </span>
                              <span
                                className={`font-black ${
                                  isRemedial
                                    ? "text-rose-500"
                                    : isBimbingan
                                    ? "text-amber-500"
                                    : "text-[#60795e]"
                                }`}
                              >
                                Akurasi: {siswa.akurasiRataRata}%
                              </span>
                            </div>
                            <div className="w-full bg-[#e8e2d8] rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  isRemedial
                                    ? "bg-rose-500"
                                    : isBimbingan
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${siswa.akurasiRataRata}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Catatan Guru & Action Buttons */}
                          <div className="p-2.5 rounded-xl bg-white border border-[#B8CFB3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                            <p className="text-slate-700 italic text-[11px] line-clamp-1 flex-1">
                              “{siswa.catatanGuru}”
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => setSelectedSiswaForHistory(siswa)}
                                className="px-3 py-1.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
                                title="Pantau riwayat modul siswa"
                              >
                                <Activity className="w-3.5 h-3.5" />
                                <span>Pantau ({siswa.riwayatPengerjaan?.length || 0})</span>
                              </button>
                              <button
                                onClick={() => setSelectedSiswaForNote(siswa)}
                                className="px-3 py-1.5 rounded-xl bg-[#FEFAF3] hover:bg-[#F6E2E9]/60 text-[#60795e] text-xs font-bold border border-[#B8CFB3] transition flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Catatan</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Antrean Review Soal Cepat & Kode Undangan */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Antrean Review Cepat (Use Case 5) */}
            <div className="bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#B8CFB3]/60 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Antrean Review Soal AI ({pendingQuestions.length})
                  </h3>
                </div>
                <Link
                  to="/mentor/review"
                  className="text-xs font-bold text-[#60795e] hover:text-[#4e634d] flex items-center gap-1 transition"
                >
                  <span>Buka Bank Soal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Subject Category Dropdown Filter */}
              <div className="flex items-center gap-2 pb-1">
                <div className="relative flex-1">
                  <select
                    value={dashboardFilterMapel}
                    onChange={(e) => setDashboardFilterMapel(e.target.value)}
                    className="w-full bg-[#FEFAF3] hover:bg-[#F6E2E9]/40 border border-[#B8CFB3] text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#84A282]/30 focus:border-[#84A282] transition appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="SEMUA">
                      Semua Mata Pelajaran ({pendingQuestions.length})
                    </option>
                    {availablePendingMapel.map((mapel) => {
                      const count = pendingQuestions.filter((s) => s.mataPelajaran === mapel).length;
                      return (
                        <option key={mapel} value={mapel}>
                          {mapel} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#739071] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {filteredPendingQuestions.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#60795e] mx-auto" />
                  <p className="text-xs text-slate-700 font-semibold">
                    {dashboardFilterMapel === "SEMUA"
                      ? "Semua butir soal AI telah ditinjau!"
                      : `Semua soal untuk mapel ${dashboardFilterMapel} telah ditinjau!`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Bank soal aktif untuk siswa telah termutakhirkan secara lengkap.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPendingQuestions.slice(0, 3).map((soal) => (
                    <div
                      key={soal.id}
                      className="p-4 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] hover:border-[#84A282] space-y-3 text-xs shadow-sm transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#60795e] bg-[#F6E2E9] px-2.5 py-0.5 rounded-full border border-[#B8CFB3]">
                          {soal.tingkat} • {soal.mataPelajaran}
                        </span>
                        <span className="text-[10px] text-[#739071] font-bold bg-white px-2 py-0.5 rounded-full border border-[#B8CFB3]">
                          AI: {soal.aiConfidence}%
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-relaxed">
                        {soal.pertanyaan}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-[#B8CFB3]/60">
                        <button
                          onClick={() => setEditingSoal(soal)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FEFAF3] text-slate-700 text-xs font-semibold border border-[#B8CFB3] transition shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setRejectingSoal(soal)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition shadow-sm"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleQuickApprove(soal.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold shadow-sm transition"
                        >
                          Setujui
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredPendingQuestions.length > 3 && (
                    <Link
                      to="/mentor/review"
                      className="block text-center text-xs font-bold text-[#84A282] hover:text-[#60795e] pt-1"
                    >
                      +{filteredPendingQuestions.length - 3} soal lainnya menunggu kurasi di Bank Soal →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* 2. Manajemen Kode Undangan (Use Case 6) */}
            <div className="bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#B8CFB3]/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manajemen Kode Undangan</h3>
                </div>
                <button
                  onClick={handleCreateNewCode}
                  className="px-3 py-1 bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Kode</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sesuai PRD Asumsi A3: Kode sekali pakai berlaku 7 hari untuk mengundang siswa ke bimbingan.
              </p>

              {/* Pilihan Tipe Tiket (Wali Kelas vs Guru Mapel) */}
              <div className="p-3 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTicketType("WALI_KELAS")}
                    className={`px-3 py-2 rounded-xl border text-left text-xs font-bold transition ${
                      ticketType === "WALI_KELAS"
                        ? "bg-white border-[#84A282] text-slate-900 shadow-sm ring-1 ring-[#84A282]/40"
                        : "bg-transparent border-slate-200 text-slate-500 hover:bg-white"
                    }`}
                  >
                    Tiket Wali Kelas
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketType("GURU_MAPEL")}
                    className={`px-3 py-2 rounded-xl border text-left text-xs font-bold transition ${
                      ticketType === "GURU_MAPEL"
                        ? "bg-white border-[#84A282] text-slate-900 shadow-sm ring-1 ring-[#84A282]/40"
                        : "bg-transparent border-slate-200 text-slate-500 hover:bg-white"
                    }`}
                  >
                    Tiket Guru Mapel
                  </button>
                </div>
                {ticketType === "GURU_MAPEL" ? (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-600 font-medium">Mapel:</span>
                    <span className="px-2.5 py-0.5 bg-white border border-[#B8CFB3] rounded-lg font-bold text-[#60795e]">
                      {teacherSubject}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-600 font-medium">Kelas:</span>
                    <select
                      value={kelasTiketInput}
                      onChange={(e) => setKelasTiketInput(e.target.value)}
                      className="bg-white border border-[#B8CFB3] text-xs font-bold rounded-lg px-2 py-1 focus:outline-none"
                    >
                      {guruJenjang === "SD" ? (
                        <>
                          <option value="Kelas 1">Kelas 1 SD</option>
                          <option value="Kelas 2">Kelas 2 SD</option>
                          <option value="Kelas 3">Kelas 3 SD</option>
                          <option value="Kelas 4">Kelas 4 SD</option>
                          <option value="Kelas 5">Kelas 5 SD</option>
                          <option value="Kelas 6">Kelas 6 SD</option>
                        </>
                      ) : (
                        <>
                          <option value="Kelas 7">Kelas 7 SMP</option>
                          <option value="Kelas 8">Kelas 8 SMP</option>
                          <option value="Kelas 9">Kelas 9 SMP</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                {myKodeList.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-2">
                    <Ticket className="w-8 h-8 text-[#84A282] mx-auto" />
                    <p className="text-xs text-slate-700 font-semibold">
                      Belum ada kode tiket aktif ({guruJenjang})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Klik tombol <strong>+ Buat Kode</strong> di atas untuk membuat kode tiket bimbingan jenjang {guruJenjang} pertama Anda.
                    </p>
                  </div>
                ) : (
                  myKodeList.map((k) => (
                    <div
                      key={k.id}
                      className="p-3.5 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] hover:border-[#84A282] flex items-center justify-between gap-3 text-xs transition shadow-sm"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-800 tracking-wider text-sm block">
                          {k.kode}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {k.targetTingkat} • Berlaku: {k.expiredAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#60795e] bg-white border border-[#B8CFB3] px-2.5 py-0.5 rounded-full">
                          {k.status}
                        </span>
                        <button
                          onClick={() => handleCopyKode(k.kode)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
                            copiedCode === k.kode
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : "bg-white hover:bg-[#FEFAF3] text-slate-700 border-[#B8CFB3]"
                          }`}
                        >
                          {copiedCode === k.kode ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCode(k.id)}
                          title="Hapus Kode Tiket"
                          className="p-1.5 rounded-xl text-rose-500 hover:text-white bg-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 transition shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student History & Monitoring Modal */}
      <RiwayatSiswaModal
        isOpen={!!selectedSiswaForHistory}
        onClose={() => setSelectedSiswaForHistory(null)}
        siswa={selectedSiswaForHistory}
        onSaveCatatan={(siswaId, catatan) => {
          updateCatatanSiswa(siswaId, catatan);
          showToast("Catatan bimbingan berhasil diperbarui!");
        }}
      />

      {/* Note Modal */}
      <BeriCatatanModal
        isOpen={!!selectedSiswaForNote}
        onClose={() => setSelectedSiswaForNote(null)}
        siswa={selectedSiswaForNote}
        onSave={(siswaId, catatan) => {
          updateCatatanSiswa(siswaId, catatan);
          showToast("Catatan bimbingan berhasil diperbarui!");
        }}
      />

      {/* Edit Modal */}
      <EditQuestionModal
        isOpen={!!editingSoal}
        onClose={() => setEditingSoal(null)}
        soal={editingSoal}
        onSave={(soalId, updated) => {
          editSoal(soalId, updated);
          showToast("Perubahan soal berhasil disimpan!");
        }}
      />

      {/* Reject Modal */}
      <RejectReasonModal
        isOpen={!!rejectingSoal}
        onClose={() => setRejectingSoal(null)}
        soal={rejectingSoal}
        onConfirmReject={(soalId, alasan) => {
          rejectSoal(soalId, alasan, user?.name || "Bu Ratna Kumalasari, S.Pd.");
          showToast("Soal telah ditolak.");
        }}
      />
    </div>
  );
};

