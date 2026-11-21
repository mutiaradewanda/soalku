import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Target,
  Sparkles,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Flame,
  Award,
  Layers,
  ChevronRight,
  ShieldAlert,
  MessageSquare,
} from "lucide-react";
import { useMentor } from "../context/MentorContext";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";
import { TopikEvaluasi } from "../types/mentor";

export const EvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, getDashboardRoute } = useAuth();
  const { topikEvaluasiList, siswaList } = useMentor();
  const { startSession } = useQuiz();

  const [filterTingkat, setFilterTingkat] = useState<"SEMUA" | "SMP" | "SD">("SEMUA");
  const [filterMapel, setFilterMapel] = useState<string>("SEMUA");

  // Get current logged in student's notes if available
  const currentStudent =
    siswaList.find((s) => user?.name && s.nama.toLowerCase().includes(user.name.toLowerCase())) ||
    siswaList.find((s) => (user?.role === "sd" ? s.nama.toLowerCase().includes("adit") : s.nama.toLowerCase().includes("arya"))) ||
    siswaList[0];

  const mapelOptions = Array.from(new Set(topikEvaluasiList.map((t) => t.mataPelajaran)));

  const filteredTopik = topikEvaluasiList
    .filter((t) => {
      if (filterTingkat !== "SEMUA" && t.tingkat !== filterTingkat) return false;
      if (filterMapel !== "SEMUA" && t.mataPelajaran !== filterMapel) return false;
      return true;
    })
    .sort((a, b) => a.persentaseAkurasi - b.persentaseAkurasi); // Terlemah di urutan paling atas

  const totalDikerjakan = topikEvaluasiList.reduce((acc, t) => acc + t.totalDikerjakan, 0);
  const totalBenar = topikEvaluasiList.reduce((acc, t) => acc + t.totalBenar, 0);
  const akurasiRataRata = totalDikerjakan > 0 ? Math.round((totalBenar / totalDikerjakan) * 100) : 0;
  const topikRemedialCount = topikEvaluasiList.filter(
    (t) => !t.statusPenguasaan.startsWith("Tuntas") && t.persentaseAkurasi < 70
  ).length;

  const handleLaunchRemedial = (topik: TopikEvaluasi) => {
    // Sesuai aturan: SD 10 soal dan SMP 20 soal untuk sesi fokus kelemahan / remedial
    const targetCount = topik.tingkat === "SD" ? 10 : 20;
    startSession("FOKUS_KELEMAHAN", targetCount, topik.tingkat);
    navigate("/latihan/quiz");
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B8CFB3]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Top Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(user ? getDashboardRoute(user.role) : "/")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#84A282] transition px-3.5 py-2 rounded-xl bg-white border border-[#B8CFB3] shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </button>

          <div className="flex items-center gap-2">
            {user?.role === "guru" ? (
              <Link
                to="/mentor/review"
                className="text-xs font-bold text-[#60795e] hover:text-[#4e634d] bg-[#B8CFB3]/40 border border-[#B8CFB3] px-3.5 py-2 rounded-xl transition shadow-sm"
              >
                Review Bank Soal AI
              </Link>
            ) : (
              <Link
                to="/latihan"
                className="text-xs font-bold text-white bg-[#84A282] hover:bg-[#739071] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Mulai Sesi Latihan Baru</span>
              </Link>
            )}
          </div>
        </div>

        {/* 1. Header Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black">
              Analisis Titik Kelemahan & Rapor Belajar Siswa
            </h1>

            <p className="text-[#FEFAF3]/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Algoritma adaptif SoalKu mengelompokkan riwayat jawaban salah per bagian materi (tag topik) agar siswa dan guru dapat fokus pada kompetensi dasar yang paling membutuhkan pengulangan dan remedial.
            </p>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20">
                <span className="text-2xl font-black text-white block">{totalDikerjakan}</span>
                <span className="text-[11px] text-[#FEFAF3]/80 font-medium">Total Soal Dikerjakan</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20">
                <span className="text-2xl font-black text-white block">{akurasiRataRata}%</span>
                <span className="text-[11px] text-[#FEFAF3]/80 font-medium">Akurasi Rata-rata</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20">
                <span className="text-2xl font-black text-[#F6E2E9] block">{topikRemedialCount} Topik</span>
                <span className="text-[11px] text-[#FEFAF3]/80 font-medium">Perlu Remedial Intensif</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20">
                <span className="text-2xl font-black text-white block">Level PAS</span>
                <span className="text-[11px] text-[#FEFAF3]/80 font-medium">Status Kesiapan Ujian</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Catatan Bimbingan Guru Terkini */}
        {currentStudent && (
          <div className="p-5 rounded-3xl bg-white border border-[#B8CFB3] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B8CFB3]/30 text-[#60795e] flex items-center justify-center shrink-0 border border-[#B8CFB3]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>Catatan Khusus dari Guru Pembimbing</span>
                  <span className="text-[10px] text-[#60795e] font-semibold px-2 py-0.5 rounded-full bg-[#B8CFB3]/40 border border-[#B8CFB3]">
                    Bu Ratna Kumalasari, S.Pd.
                  </span>
                </h4>
                <span className="text-[11px] text-slate-500">{currentStudent.terakhirAktif}</span>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                “{currentStudent.catatanGuru}”
              </p>
            </div>
          </div>
        )}

        {/* 3. Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 bg-white border border-[#B8CFB3] p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-semibold px-1">Mata Pelajaran:</span>
            <select
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
              className="bg-[#FEFAF3] border border-[#B8CFB3] rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#84A282]"
            >
              <option value="SEMUA">Semua Mata Pelajaran</option>
              {mapelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. List Tingkat Penguasaan Per Tag Topik (Terlemah Dulu) */}
        <div className="bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#B8CFB3]/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tingkat Penguasaan Per Bagian Materi (Diurutkan dari Terlemah)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Topik dengan persentase di bawah 60% ditandai merah dan direkomendasikan untuk remedial kilat
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTopik.map((topik, idx) => {
              const isTuntas = topik.statusPenguasaan.startsWith("Tuntas") || topik.persentaseAkurasi >= 70;
              const isRemedial = !isTuntas && (topik.statusPenguasaan === "Perlu Remedial" || topik.persentaseAkurasi < 70);
              const isPenguatan = !isTuntas && !isRemedial;

              return (
                <div
                  key={topik.id}
                  className={`p-5 rounded-2xl border transition space-y-3.5 ${
                    isRemedial
                      ? "bg-[#FEFAF3] border-rose-300 shadow-sm"
                      : isPenguatan
                      ? "bg-[#FEFAF3] border-amber-300 shadow-sm"
                      : "bg-[#FEFAF3] border-[#B8CFB3] shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isRemedial
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : isPenguatan
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-[#B8CFB3]/40 text-[#60795e] border border-[#B8CFB3]"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#B8CFB3] text-slate-700">
                            {topik.tingkat} • {topik.mataPelajaran}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              isRemedial
                                ? "bg-[#F6E2E9] text-rose-900 border-rose-300"
                                : isPenguatan
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-[#B8CFB3] text-[#243822] border-[#84A282]"
                            }`}
                          >
                            {topik.statusPenguasaan}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{topik.namaTopik}</h4>
                      </div>
                    </div>

                    <div className="text-right sm:self-auto self-end">
                      <span
                        className={`text-2xl font-black ${
                          isRemedial
                            ? "text-rose-600"
                            : isPenguatan
                            ? "text-amber-600"
                            : "text-[#60795e]"
                        }`}
                      >
                        {topik.persentaseAkurasi}%
                      </span>
                      <span className="block text-[11px] text-slate-500 font-medium">
                        {topik.totalBenar} dari {topik.totalDikerjakan} Soal Benar
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#e8e2d8] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isRemedial
                          ? "bg-rose-500"
                          : isPenguatan
                          ? "bg-amber-500"
                          : "bg-[#84A282]"
                      }`}
                      style={{ width: `${topik.persentaseAkurasi}%` }}
                    ></div>
                  </div>

                  {/* AI Recommendation & Fast Action */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#B8CFB3]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                    <div className="space-y-1 flex-1">
                      <p className="text-slate-800 leading-relaxed text-[11.5px]">
                        <b className="text-[#60795e]">Rekomendasi AI:</b> {topik.rekomendasiAksi}
                      </p>
                      <p className="text-slate-700 font-semibold text-[11px]">
                        <b className="text-[#60795e]">Tips Rumus:</b> {topik.tipsPenguatan}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLaunchRemedial(topik)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 transition shadow-sm bg-[#84A282] hover:bg-[#739071] text-white"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isRemedial ? "Latihan Remedial" : "Latihan Penguatan"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Rekomendasi Remedial Box (Khusus Siswa, tidak ditampilkan untuk Guru) */}
        {user?.role !== "guru" && filteredTopik.length > 0 && (
          <div className="rounded-3xl bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black">
                Remedial Topik Terlemah: "{filteredTopik[0].namaTopik}"
              </h3>
              <p className="text-xs text-[#FEFAF3]/90 max-w-xl">
                Tingkatkan nilai akurasi Anda dengan mengerjakan sesi simulasi fokus kelemahan yang diprioritaskan pada butir soal yang sering keliru.
              </p>
            </div>

            <button
              onClick={() => handleLaunchRemedial(filteredTopik[0])}
              className="px-6 py-3 rounded-2xl bg-white text-[#60795e] hover:bg-[#FEFAF3] font-black text-xs flex items-center gap-2 shadow-lg shadow-black/10 shrink-0 transition"
            >
              <span>Mulai Remedial Sekarang</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationPage;
