import React, { useState, useRef } from "react";
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
import {
  LogOut,
  School,
  BookCheck,
  KeyRound,
  Users,
  Flame,
  Trophy,
  Target,
  Sparkles,
  ArrowRight,
  Clock,
  Shuffle,
  ShieldAlert,
  CheckCircle,
  FileText,
  BarChart2,
  ChevronRight,
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
} from "lucide-react";

export const SdDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { materiList, deleteMateri, uploadMateri } = useMateri();
  const { startSession } = useQuiz();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadProgressStep, setUploadProgressStep] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detailMateri, setDetailMateri] = useState<Materi | null>(null);
  const [isKodeModalOpen, setIsKodeModalOpen] = useState(false);

  const sdMateriList = materiList.filter((m) => m.tingkat === "SD");

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
      await uploadMateri(file, "", "SD");
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
          topik: bm.judulBagian,
          pertanyaan: s.pertanyaan,
          opsi: s.opsi.map((o) => ({ label: o.label, teks: o.teks })),
          kunciJawabanIndex: s.opsi.findIndex((o) => o.isBenar) !== -1 ? s.opsi.findIndex((o) => o.isBenar) : 0,
          pembahasan: s.pembahasan || "Pembahasan materi terpadu dari modul ekstraksi AI.",
          kesulitan: s.tingkatKesulitan,
        });
      });
    });

    if (questions.length > 0) {
      startSession("ACAK", questions.length, materi.tingkat, questions);
    } else {
      startSession("ACAK", 5, materi.tingkat);
    }
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
              title="Masukkan Kode Undangan Guru"
            >
              <KeyRound className="w-4 h-4 text-[#84A282]" />
              <span className="hidden sm:inline">Kode Undangan</span>
            </button>
            <Link
              to="/evaluasi"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#FEFAF3] hover:bg-[#F6E2E9]/50 text-[#739071] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] text-xs font-bold transition shadow-sm active:translate-y-0.5"
            >
              <Target className="w-4 h-4 text-[#84A282]" />
              <span>Rapor Evaluasi</span>
            </Link>
            <button
              onClick={() => navigate("/latihan")}
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
            <h1 className="text-2xl sm:text-3xl font-black">Halo, {user?.name || "Adit Pratama"}!</h1>
            <p className="text-[#FEFAF3]/90 text-xs sm:text-sm">
              Kamu terdaftar di <b>{(user as any)?.grade || "Kelas 4 SD"}</b>. Orang Tua pendamping:{" "}
              <b>{(user as any)?.parentName || "Bpk. Bambang Pamungkas"}</b>. Ayo unggah materi atau pilih latihan ceria hari ini!
            </p>
          </div>
          <div className="hidden sm:block shrink-0 relative z-10 mr-2 my-0">
            <DragonMascot variant="sitting" className="w-28 sm:w-32 drop-shadow-md hover:scale-105 transition-transform" />
          </div>
        </div>

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

        {/* Modul Belajar Siswa SD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Modul Belajar Mandiri SD</h3>
          </div>

          {sdMateriList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#B8CFB3] text-slate-500 text-xs">
              Belum ada materi SD. Silakan unggah dokumen PDF baru melalui tombol di atas!
            </div>
          ) : (
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
                      onClick={() => setDetailMateri(materi)}
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
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <MateriDetailModal
        materi={detailMateri}
        isOpen={!!detailMateri}
        onClose={() => setDetailMateri(null)}
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
  const { startSession } = useQuiz();
  const { topikEvaluasiList } = useMentor();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadProgressStep, setUploadProgressStep] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detailMateri, setDetailMateri] = useState<Materi | null>(null);
  const [isKodeModalOpen, setIsKodeModalOpen] = useState(false);

  const smpMateriList = materiList.filter((m) => m.tingkat === "SMP");
  const topikKelemahanAktif = topikEvaluasiList.find(
    (t) => !t.statusPenguasaan.startsWith("Tuntas") && t.persentaseAkurasi < 70
  );

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
      await uploadMateri(file, "", "SMP");
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
          topik: bm.judulBagian,
          pertanyaan: s.pertanyaan,
          opsi: s.opsi.map((o) => ({ label: o.label, teks: o.teks })),
          kunciJawabanIndex: s.opsi.findIndex((o) => o.isBenar) !== -1 ? s.opsi.findIndex((o) => o.isBenar) : 0,
          pembahasan: s.pembahasan || "Pembahasan materi terpadu dari modul ekstraksi AI.",
          kesulitan: s.tingkatKesulitan,
        });
      });
    });

    if (questions.length > 0) {
      startSession("ACAK", questions.length, materi.tingkat, questions);
    } else {
      startSession("ACAK", 10, materi.tingkat);
    }
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
              title="Masukkan Kode Undangan Guru"
            >
              <KeyRound className="w-4 h-4 text-[#84A282]" />
              <span className="hidden sm:inline">Kode Undangan</span>
            </button>
            <Link
              to="/evaluasi"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#FEFAF3] hover:bg-[#F6E2E9]/50 text-[#739071] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] text-xs font-bold transition shadow-sm active:translate-y-0.5"
            >
              <Target className="w-4 h-4 text-[#84A282]" />
              <span>Rapor Evaluasi</span>
            </Link>
            <button
              onClick={() => navigate("/latihan")}
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
                {(user as any)?.grade || "Kelas 8 SMP"} • NISN: {(user as any)?.nisn || "0098765432"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">Dasbor Belajar Siswa</h1>
              <p className="text-[#FEFAF3]/90 text-xs sm:text-sm max-w-lg">
                Target Harian Anda: 3 dari 4 Bab Selesai (75%). Selesaikan simulasi CBT adaptif untuk menjaga streak!
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/20 p-4 rounded-2xl border border-white/30 backdrop-blur-md">
              <div className="text-center">
                <span className="text-2xl font-black text-white">82%</span>
                <p className="text-[10px] text-[#FEFAF3]/80">Akurasi Rata-rata</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <span className="text-2xl font-black text-white">128</span>
                <p className="text-[10px] text-[#FEFAF3]/80">Soal Dikerjakan</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Weakness Recommendation Card */}
        {topikKelemahanAktif ? (
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
                navigate("/latihan/pilih?mode=FOKUS_KELEMAHAN");
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

        {/* Modul Sedang Dipelajari SMP */}
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
                    onClick={() => setDetailMateri(materi)}
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

        {/* Practice Modes */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Pilihan Mode Latihan Kilat</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div
              onClick={() => navigate("/latihan/pilih?mode=ACAK")}
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
              onClick={() => navigate("/latihan/pilih?mode=BERWAKTU")}
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
              onClick={() => navigate("/latihan/pilih?mode=FOKUS_KELEMAHAN")}
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
        onClose={() => setDetailMateri(null)}
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
    salinKodeUndangan,
    getPendingCount,
    updateCatatanSiswa,
  } = useMentor();

  const [selectedSiswaForNote, setSelectedSiswaForNote] = useState<SiswaBinaan | null>(null);
  const [editingSoal, setEditingSoal] = useState<SoalReview | null>(null);
  const [rejectingSoal, setRejectingSoal] = useState<SoalReview | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dashboardFilterMapel, setDashboardFilterMapel] = useState<string>("SEMUA");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pendingQuestions = soalList.filter((s) => s.statusReview === "MENUNGGU");
  const pendingCount = getPendingCount();

  const availablePendingMapel = Array.from(
    new Set(pendingQuestions.map((s) => s.mataPelajaran))
  ).filter(Boolean);

  const filteredPendingQuestions = pendingQuestions.filter(
    (s) => dashboardFilterMapel === "SEMUA" || s.mataPelajaran === dashboardFilterMapel
  );

  const handleCopyKode = (kode: string) => {
    salinKodeUndangan(kode);
    setCopiedCode(kode);
    showToast(`Kode ${kode} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateNewCode = () => {
    const newCode = createKodeUndangan("SMP", "GURU");
    showToast(`Kode Undangan ${newCode.kode} berhasil diterbitkan!`);
  };

  const handleQuickApprove = (soalId: number) => {
    approveSoal(soalId, user?.name || "Bu Ratna Kumalasari, S.Pd.");
    showToast("Soal berhasil disetujui masuk ke Bank Soal Siswa!");
  };

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
        <div className="flex items-center justify-between bg-white border border-[#B8CFB3] border-b-4 border-b-[#84A282]/50 rounded-2xl p-4 shadow-lg shadow-black/8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#B8CFB3]/40 text-[#60795e] rounded-xl border border-[#B8CFB3] border-b-2 border-b-[#B8CFB3] shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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
                  Halo, {user?.name || "Bu Ratna Kumalasari, S.Pd."}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl leading-relaxed">
                  Wali Kelas & Guru IPA Terpadu • Pantau titik kelemahan materi tiap anak binaan dan setujui bank soal hasil ekstraksi AI.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-center min-w-[95px] backdrop-blur-md">
                  <span className="text-2xl font-black text-emerald-300 block">{siswaList.length}</span>
                  <span className="text-[10px] font-bold text-emerald-100 uppercase">Siswa Binaan</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-center min-w-[95px] backdrop-blur-md">
                  <span className="text-2xl font-black text-[#60795e] block">84.4%</span>
                  <span className="text-[10px] font-bold text-cyan-100 uppercase">Akurasi Kelas</span>
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
                <div className="flex items-center justify-between border-b border-[#B8CFB3]/60 pb-3.5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#60795e]" />
                      <span>Ringkasan Progres Seluruh Siswa Binaan</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hasil latihan dicatat per bagian materi untuk memetakan titik kelemahan tiap anak
                    </p>
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-3">
                  {siswaList.map((siswa) => {
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
                              Fokus Kelemahan: <b className="text-slate-800">{siswa.topikKelemahan}</b>
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

                        {/* Catatan Guru Row */}
                        <div className="p-2.5 rounded-xl bg-white border border-[#B8CFB3] flex items-center justify-between gap-3 text-xs">
                          <p className="text-slate-700 italic text-[11px] line-clamp-1 flex-1">
                            “{siswa.catatanGuru}”
                          </p>
                          <button
                            onClick={() => setSelectedSiswaForNote(siswa)}
                            className="px-3 py-1.5 rounded-xl bg-[#FEFAF3] hover:bg-[#F6E2E9]/60 text-[#60795e] text-xs font-bold border border-[#B8CFB3] transition flex items-center gap-1.5 shrink-0 shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Beri Catatan</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

              {/* Subject Category Pills */}
              {availablePendingMapel.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  <button
                    onClick={() => setDashboardFilterMapel("SEMUA")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                      dashboardFilterMapel === "SEMUA"
                        ? "bg-[#84A282] text-white border-[#739071] shadow-sm"
                        : "bg-[#FEFAF3] text-slate-600 border-[#B8CFB3] hover:text-slate-900"
                    }`}
                  >
                    Semua ({pendingQuestions.length})
                  </button>
                  {availablePendingMapel.map((mapel) => {
                    const count = pendingQuestions.filter((s) => s.mataPelajaran === mapel).length;
                    return (
                      <button
                        key={mapel}
                        onClick={() => setDashboardFilterMapel(mapel)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                          dashboardFilterMapel === mapel
                            ? "bg-[#84A282] text-white border-[#739071] shadow-sm"
                            : "bg-[#FEFAF3] text-slate-600 border-[#B8CFB3] hover:text-slate-900"
                        }`}
                      >
                        {mapel} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

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
                Sesuai PRD Asumsi A3: Kode sekali pakai berlaku 7 hari untuk mengundang siswa ke bimbingan atau rekan pengawas baru.
              </p>

              <div className="space-y-2.5">
                {kodeUndanganList.map((k) => (
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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

