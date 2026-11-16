import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Shuffle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  School,
  BookOpen,
  Layers,
  HelpCircle,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { ModeLatihan } from "../types/quiz";

export const PilihLatihanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, getDashboardRoute } = useAuth();
  const { startSession } = useQuiz();

  const modeParam = searchParams.get("mode") as ModeLatihan | null;
  const initialMode: ModeLatihan =
    modeParam && ["ACAK", "BERWAKTU", "FOKUS_KELEMAHAN"].includes(modeParam)
      ? modeParam
      : "FOKUS_KELEMAHAN";

  const [selectedMode, setSelectedMode] = useState<ModeLatihan>(initialMode);
  const [tingkat, setTingkat] = useState<"SD" | "SMP">(user?.role === "sd" ? "SD" : "SMP");
  const [selectedJumlah, setSelectedJumlah] = useState<number>(user?.role === "sd" ? 10 : 20);

  const handleStartExam = () => {
    startSession(selectedMode, selectedJumlah, tingkat);
    navigate("/latihan/quiz");
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#B8CFB3]/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F6E2E9]/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Navigation Top */}
        <div className="flex items-center justify-between">
          <Link
            to={user ? getDashboardRoute(user.role) : "/"}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-[#84A282] transition px-3 py-1.5 rounded-xl bg-white border border-[#B8CFB3] shadow-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </Link>
        </div>

        {/* Banner Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black">Konfigurasi Mode Sesi Belajar</h1>
            <p className="text-[#FEFAF3]/90 text-xs sm:text-sm max-w-xl">
              Pilih metode simulasi yang paling sesuai dengan target belajarmu hari ini, kemudian tentukan jumlah butir soal latihan.
            </p>
          </div>
        </div>

        {/* 1. Pilih Strategi Mode Latihan */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            1. Pilih Strategi Mode Latihan (Strategy Pattern)
          </label>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Mode Fokus Kelemahan */}
            <div
              onClick={() => setSelectedMode("FOKUS_KELEMAHAN")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedMode === "FOKUS_KELEMAHAN"
                  ? "bg-[#F6E2E9]/60 border-[#84A282] text-slate-900 shadow-md scale-[1.01]"
                  : "bg-white border-[#B8CFB3]/60 hover:border-[#84A282] text-slate-700 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6E2E9] text-[#739071] flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  {selectedMode === "FOKUS_KELEMAHAN" && (
                    <span className="w-5 h-5 rounded-full bg-[#84A282] text-white flex items-center justify-center text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base">Fokus Kelemahan</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Algoritma adaptif memprioritaskan butir materi dengan frekuensi kesalahan tertinggi (Peredaran Darah & Enzim Lambung).
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#739071] bg-[#F6E2E9] px-2 py-0.5 rounded-full mt-4 self-start border border-[#B8CFB3]">
                Paling Direkomendasikan AI
              </span>
            </div>

            {/* Mode Berwaktu */}
            <div
              onClick={() => setSelectedMode("BERWAKTU")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedMode === "BERWAKTU"
                  ? "bg-[#B8CFB3]/30 border-[#84A282] text-slate-900 shadow-md scale-[1.01]"
                  : "bg-white border-[#B8CFB3]/60 hover:border-[#84A282] text-slate-700 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B8CFB3]/40 text-[#60795e] flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  {selectedMode === "BERWAKTU" && (
                    <span className="w-5 h-5 rounded-full bg-[#84A282] text-white flex items-center justify-center text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base">Mode Berwaktu</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Simulasi ujian ketat dengan hitung mundur timer live (15 menit) melatih ketangkasan dan manajemen waktu ujian.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#60795e] bg-[#B8CFB3]/30 px-2 py-0.5 rounded-full mt-4 self-start border border-[#B8CFB3]">
                Simulasi Ujian CBT
              </span>
            </div>

            {/* Mode Acak */}
            <div
              onClick={() => setSelectedMode("ACAK")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedMode === "ACAK"
                  ? "bg-[#FEFAF3] border-[#84A282] text-slate-900 shadow-md scale-[1.01]"
                  : "bg-white border-[#B8CFB3]/60 hover:border-[#84A282] text-slate-700 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#84A282]/20 text-[#60795e] flex items-center justify-center">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  {selectedMode === "ACAK" && (
                    <span className="w-5 h-5 rounded-full bg-[#84A282] text-white flex items-center justify-center text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base">Mode Acak</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Mengacak seluruh butir soal yang telah disetujui kurikulum di seluruh topik tanpa batas waktu terburu-buru.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#60795e] bg-[#84A282]/10 px-2 py-0.5 rounded-full mt-4 self-start border border-[#B8CFB3]">
                Latihan Mandiri
              </span>
            </div>
          </div>
        </div>

        {/* 2. Pilih Jumlah Butir Soal */}
        <div className="p-6 rounded-3xl bg-white border border-[#B8CFB3] shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            2. Tentukan Jumlah Butir Soal Sesi Ini
          </label>

          <div className="grid grid-cols-3 gap-3">
            {(tingkat === "SD" ? [5, 10, 15] : [10, 15, 20]).map((jumlah) => (
              <button
                key={jumlah}
                type="button"
                onClick={() => setSelectedJumlah(jumlah)}
                className={`p-4 rounded-2xl border font-bold text-sm transition-all flex flex-col items-center gap-1 ${
                  selectedJumlah === jumlah
                    ? "bg-[#84A282] border-[#739071] text-white shadow-md scale-[1.02]"
                    : "bg-[#FEFAF3] border-[#B8CFB3] text-slate-700 hover:text-slate-900 hover:border-[#84A282]"
                }`}
              >
                <span className="text-xl">{jumlah} Soal</span>
                <span className="text-[10px] font-normal opacity-90">
                  {jumlah === 5
                    ? "Sesi Cepat"
                    : (tingkat === "SD" && jumlah === 10) || (tingkat === "SMP" && jumlah === 20)
                    ? "Standar Modul"
                    : "Komprehensif"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Pool Soal & Ringkasan Konfigurasi */}
        <div className="p-5 rounded-2xl bg-white border border-[#B8CFB3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#60795e] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#84A282]" />
              <span>Pool Soal Siap Digunakan (Status DISETUJUI Mentor)</span>
            </span>
            <p className="text-xs text-slate-500">
              Konfigurasi: {selectedJumlah} Soal • Mode {selectedMode} • Jenjang {tingkat} (
              {tingkat === "SD" ? "3 Opsi Jawaban" : "4 Opsi Jawaban"})
            </p>
          </div>

          <button
            onClick={handleStartExam}
            className="px-7 py-3.5 rounded-2xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-sm shadow-md shadow-[#84A282]/20 flex items-center justify-center gap-2.5 transition shrink-0"
          >
            <span>Mulai Sesi Ujian Latihan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PilihLatihanPage;
