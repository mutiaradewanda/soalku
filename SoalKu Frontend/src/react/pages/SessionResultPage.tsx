import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Home,
  BookOpen,
  Sparkles,
  Flame,
  Target,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";
import { useMentor } from "../context/MentorContext";
import { DragonMascot } from "../components/DragonMascot";

export const SessionResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSession, restartSession, clearSession } = useQuiz();
  const { user, getDashboardRoute } = useAuth();
  const { catatHasilRemedial } = useMentor();

  const [filterMode, setFilterMode] = useState<"ALL" | "SALAH" | "BENAR">("ALL");
  const [expandedSoalId, setExpandedSoalId] = useState<number | null>(null);
  const [hasRecordedRemedial, setHasRecordedRemedial] = useState(false);

  // Standar KKM 70: Nilai 70 ke atas dinyatakan tuntas / lulus remedial
  const skor = currentSession?.skor || 0;
  const isLulus = skor >= 70;

  useEffect(() => {
    if (currentSession && !hasRecordedRemedial) {
      const studentName = user?.name || "Arya Pratama";
      const topic = currentSession.daftarSoal[0]?.topik || currentSession.subjek || "Sistem Peredaran Darah";
      catatHasilRemedial(studentName, topic, currentSession.skor);
      setHasRecordedRemedial(true);
    }
  }, [currentSession, hasRecordedRemedial, user, catatHasilRemedial]);

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-transparent text-slate-800 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-slate-600 font-medium">Belum ada data sesi latihan yang diselesaikan.</p>
          <Link
            to="/latihan"
            className="px-5 py-2.5 bg-[#84A282] hover:bg-[#739071] rounded-xl text-white font-bold text-xs inline-block shadow-sm"
          >
            Mulai Latihan Baru
          </Link>
        </div>
      </div>
    );
  }

  const { totalBenar, totalSalah, totalRagu, totalDijawab, xpDidapat, daftarSoal, jawabanMap } =
    currentSession;

  const filteredSoal = daftarSoal.filter((soal) => {
    const jwb = jawabanMap[soal.id];
    const isBenar = jwb?.selectedOpsiIndex === soal.kunciJawabanIndex;
    if (filterMode === "SALAH") return !isBenar;
    if (filterMode === "BENAR") return isBenar;
    return true;
  });

  const handleRestart = () => {
    restartSession();
    navigate("/latihan/quiz");
  };

  const handleBackToDashboard = () => {
    clearSession();
    navigate(user ? getDashboardRoute(user.role) : "/");
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B8CFB3]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Top Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-[#84A282] transition px-3 py-1.5 rounded-xl bg-white border border-[#B8CFB3] shadow-sm font-medium"
          >
            <Home className="w-4 h-4" />
            <span>Ke Dasbor Siswa</span>
          </button>

          <span className="text-xs font-semibold text-[#84A282] bg-[#F6E2E9] border border-[#B8CFB3] px-3 py-1 rounded-full">
            {currentSession.idSesi} • Selesai
          </span>
        </div>

        {/* Anti-Cheat Violation Banner (jika terdeteksi auto-submit atau pelanggaran) */}
        {currentSession.isAutoSubmitPelanggaran && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 sm:p-5 flex items-start gap-4 text-rose-700 shadow-sm">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0 border border-rose-200">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Sesi Dihentikan Otomatis oleh Sistem CBT</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                  3 Pelanggaran Terdeteksi
                </span>
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed">
                Ujian Anda telah di-submit secara otomatis karena terdeteksi meninggalkan halaman pengerjaan (berpindah tab browser atau jendela aplikasi lain) sebanyak 3 kali. Hasil jawaban yang sudah diisi tetap dinilai.
              </p>
            </div>
          </div>
        )}

        {Boolean(currentSession.totalPelanggaran && currentSession.totalPelanggaran > 0 && !currentSession.isAutoSubmitPelanggaran) && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-center gap-3 text-amber-800 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <b>Catatan Integritas:</b> Terdeteksi {currentSession.totalPelanggaran} kali peringatan perpindahan fokus jendela selama ujian.
            </span>
          </div>
        )}

        {/* Status Kelulusan Remedial Box */}
        {isLulus ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 border border-emerald-300">
                  ✓ LULUS / TUNTAS (NILAI &gt;= 70)
                </span>
                <span className="text-xs font-bold text-emerald-900">
                  Laporan Otomatis Terkirim ke Guru
                </span>
              </div>
              <h3 className="font-bold text-emerald-950 text-sm">
                Selamat! Anda Dinyatakan Lulus Remedial dengan Nilai {skor}
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Nilai yang awalnya berstatus <b>Perlu Remedial</b> kini telah resmi diperbarui menjadi <b>TUNTAS</b>. Riwayat nilai telah disinkronkan ke Dasbor Guru bahwa Anda sudah tidak remidi lagi.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-800 border border-amber-300">
                  BELUM MENCAPAI KKM 70 (NILAI: {skor})
                </span>
              </div>
              <h3 className="font-bold text-amber-950 text-sm">
                Nilai Remedial Belum Memenuhi Syarat Kelulusan Minimal 70
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Status materi saat ini masih memerlukan penguatan. Silakan pelajari kembali ringkasan materi dan ulangi remedial hingga nilai di atas 70.
              </p>
            </div>
          </div>
        )}

        {/* 1. Header Banner Skor Akhir (Sesuai SessionResultView.java) */}
        <div className="rounded-3xl bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                <span>HASIL SESI UJIAN • {currentSession.mode.replace("_", " ")}</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  {isLulus ? "Kerja Bagus! Penguasaan Materi Tuntas" : "Perlu Remedial Pada Materi Tertentu"}
                </h1>
                <p className="text-[#FEFAF3]/90 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
                  {isLulus
                    ? "Hasil evaluasi menunjukkan nilai Anda telah memenuhi kriteria kelulusan (>= 70). Status remedial telah ditutup dan tuntas!"
                    : "Nilai di bawah 70. Algoritma AI telah mencatat butir soal yang keliru ke dalam Rapor Evaluasi untuk penguatan adaptif."}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="px-3 py-1 rounded-full bg-[#F6E2E9] text-[#739071] text-xs font-bold border border-[#B8CFB3] flex items-center gap-1.5">
                  <span>+{xpDidapat} XP Diperoleh</span>
                </span>
                <span className="text-xs text-[#FEFAF3]">
                  {currentSession.subjek} • {currentSession.mapel}
                </span>
              </div>
            </div>

            {/* Score Big Display & Mascot */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block shrink-0">
                <DragonMascot
                  variant="walking"
                  className="w-28 sm:w-32 drop-shadow-md hover:scale-105 transition-transform"
                />
              </div>

              <div className="bg-white/20 p-6 rounded-3xl border border-white/30 backdrop-blur-md text-center min-w-[160px] shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FEFAF3] block">
                  Skor Akhir
                </span>
                <p className="text-5xl sm:text-6xl font-black tracking-tight text-white my-1">
                  {skor}
                </p>
                <span className="text-[11px] font-bold text-[#F6E2E9] block">
                  {totalBenar} dari {daftarSoal.length} Soal Benar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Stats Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#B8CFB3]/30 border border-[#84A282]/40 text-center">
            <span className="text-2xl font-black text-[#60795e] block">{totalBenar}</span>
            <span className="text-xs text-slate-600 font-semibold">Jawaban Benar</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6E2E9] border border-[#B8CFB3] text-center">
            <span className="text-2xl font-black text-rose-700 block">{totalSalah}</span>
            <span className="text-xs text-slate-600 font-semibold">Jawaban Salah</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-2xl font-black text-amber-700 block">{totalRagu}</span>
            <span className="text-xs text-slate-600 font-semibold">Sempat Ragu</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#B8CFB3] text-center shadow-sm">
            <span className="text-2xl font-black text-[#84A282] block">{skor}%</span>
            <span className="text-xs text-slate-600 font-semibold">Tingkat Akurasi</span>
          </div>
        </div>

        {/* 3. Review & Pembahasan Soal */}
        <div className="bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#B8CFB3]/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#84A282]" />
                <span>Analisis Butir Soal & Kunci Jawaban</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tinjau kunci jawaban benar dan pembahasan komprehensif dari AI
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FEFAF3] rounded-xl border border-[#B8CFB3]">
              <button
                onClick={() => setFilterMode("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterMode === "ALL" ? "bg-[#84A282] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua ({daftarSoal.length})
              </button>
              <button
                onClick={() => setFilterMode("SALAH")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterMode === "SALAH" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Salah ({totalSalah})
              </button>
              <button
                onClick={() => setFilterMode("BENAR")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterMode === "BENAR" ? "bg-[#60795e] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Benar ({totalBenar})
              </button>
            </div>
          </div>

          {/* List Soal Review */}
          <div className="space-y-3">
            {filteredSoal.map((soal, idx) => {
              const jwb = jawabanMap[soal.id];
              const isBenar = jwb?.selectedOpsiIndex === soal.kunciJawabanIndex;
              const isExpanded = expandedSoalId === soal.id || filterMode === "SALAH";
              const userOpsi = jwb?.selectedOpsiIndex !== null && jwb?.selectedOpsiIndex !== undefined
                ? soal.opsi[jwb.selectedOpsiIndex]
                : null;
              const kunciOpsi = soal.opsi[soal.kunciJawabanIndex];

              return (
                <div
                  key={soal.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all bg-white ${
                    isBenar
                      ? "border-[#B8CFB3] shadow-sm"
                      : "border-rose-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isBenar
                            ? "bg-[#B8CFB3]/40 text-[#60795e] border border-[#B8CFB3]"
                            : "bg-[#F6E2E9] text-rose-800 border border-rose-300"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              isBenar
                                ? "bg-[#B8CFB3] text-[#243822] border-[#84A282]"
                                : "bg-[#F6E2E9] text-rose-900 border-rose-300"
                            }`}
                          >
                            {isBenar ? "Jawaban Benar" : "Perlu Evaluasi"}
                          </span>
                          <span className="text-[11px] text-slate-600 font-semibold">{soal.topik}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {soal.pertanyaan}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedSoalId(isExpanded ? null : soal.id)}
                      className="p-1 text-slate-500 hover:text-slate-800 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Pembahasan */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#B8CFB3]/50 space-y-3 text-xs">
                      {/* Jawaban Anda vs Kunci */}
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div
                          className={`p-2.5 rounded-xl border ${
                            isBenar
                              ? "bg-white border-[#B8CFB3] text-[#60795e]"
                              : "bg-white border-rose-300 text-rose-700"
                          }`}
                        >
                          <span className="font-bold text-[10px] uppercase tracking-wider block text-slate-500">
                            Jawaban Anda:
                          </span>
                          <span className="font-medium">
                            {userOpsi ? `${userOpsi.label}. ${userOpsi.teks}` : "Belum dijawab"}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-[#84A282] text-[#60795e]">
                          <span className="font-bold text-[10px] uppercase tracking-wider block text-slate-500">
                            Kunci Jawaban Benar:
                          </span>
                          <span className="font-medium">
                            {kunciOpsi.label}. {kunciOpsi.teks}
                          </span>
                        </div>
                      </div>

                      {/* Penjelasan */}
                      <div className="p-3 rounded-xl bg-white border border-[#B8CFB3] text-slate-800 space-y-1 shadow-sm">
                        <span className="font-bold text-[#60795e] block">Pembahasan Materi AI:</span>
                        <p className="leading-relaxed text-slate-700">{soal.pembahasan}</p>
                      </div>

                      {/* Tips Hafalan */}
                      {soal.tipsAdaptif && (
                        <div className="p-2.5 rounded-xl bg-[#F6E2E9]/60 border border-[#B8CFB3] text-slate-800">
                          <span className="font-bold text-[11px] text-[#60795e] block">Tips Rumus Cepat:</span>
                          <p className="text-[11px] text-slate-700 whitespace-pre-line">{soal.tipsAdaptif}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleBackToDashboard}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#FEFAF3] text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-[#B8CFB3] shadow-sm transition"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dasbor Siswa</span>
          </button>

          <button
            onClick={handleRestart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#84A282]/20 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Latihan (Sesi Baru)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionResultPage;
