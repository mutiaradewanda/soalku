import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Lightbulb,
  BrainCircuit,
  Flag,
  Shield,
  ShieldAlert,
  Maximize,
  Minimize,
  Lock,
  AlertOctagon,
} from "lucide-react";
import { useQuiz } from "../context/QuizContext";
import { DigestiveDiagram } from "../components/DigestiveDiagram";

const MAX_VIOLATIONS = 3;

export const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSession, answerQuestion, toggleRaguRagu, decrementTimer, finishSession } = useQuiz();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Anti-Cheat & CBT Security States
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState<boolean>(false);
  const [violationsCount, setViolationsCount] = useState<number>(0);
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [latestViolationReason, setLatestViolationReason] = useState<string>("");
  const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);

  const lastViolationTimeRef = useRef<number>(0);

  // If no session exists, redirect to /latihan
  useEffect(() => {
    if (!currentSession) {
      navigate("/latihan");
    }
  }, [currentSession, navigate]);

  // Live Timer Countdown
  useEffect(() => {
    if (!currentSession || currentSession.status === "SELESAI") return;

    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, decrementTimer]);

  // Request Fullscreen Function
  const requestFullscreenMode = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setShowFullscreenWarning(false);
      }
    } catch (err) {
      console.warn("Fullscreen request requires user gesture or was blocked:", err);
    }
  };

  // 1. Fullscreen Change Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (!inFullscreen && currentSession && currentSession.status === "BERLANGSUNG" && !isAutoSubmitting) {
        setShowFullscreenWarning(true);
      } else {
        setShowFullscreenWarning(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [currentSession, isAutoSubmitting]);

  // 2. Tab-Switch & Blur Detection (Page Visibility API & window.onblur)
  useEffect(() => {
    const recordViolation = (reason: string) => {
      if (!currentSession || currentSession.status !== "BERLANGSUNG" || isAutoSubmitting) return;

      const now = Date.now();
      // Debounce 2 seconds so blur + visibilitychange don't trigger dual count
      if (now - lastViolationTimeRef.current < 2000) return;
      lastViolationTimeRef.current = now;

      setViolationsCount((prev) => {
        const next = prev + 1;
        setLatestViolationReason(reason);

        if (next >= MAX_VIOLATIONS) {
          setIsAutoSubmitting(true);
          setTimeout(() => {
            finishSession(true, next);
            navigate("/latihan/hasil");
          }, 2000);
        } else {
          setShowViolationModal(true);
        }

        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation("Terdeteksi berpindah tab browser lain atau meminimalkan jendela ujian.");
      }
    };

    const handleWindowBlur = () => {
      recordViolation("Terdeteksi kehilangan fokus jendela (membuka aplikasi lain atau Alt+Tab).");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [currentSession, isAutoSubmitting, finishSession, navigate]);

  // 3. Prevent Copy-Paste, Context Menu & DevTools Shortcuts (Anti Copy-Cheat)
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDevTools = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("copy", preventClipboard);
    document.addEventListener("cut", preventClipboard);
    document.addEventListener("paste", preventClipboard);
    window.addEventListener("keydown", preventDevTools);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("copy", preventClipboard);
      document.removeEventListener("cut", preventClipboard);
      document.removeEventListener("paste", preventClipboard);
      window.removeEventListener("keydown", preventDevTools);
    };
  }, []);

  // 4. Prevent Tab Close / Reload (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentSession && currentSession.status === "BERLANGSUNG") {
        e.preventDefault();
        e.returnValue = "Ujian sedang berlangsung. Jawaban Anda mungkin hilang jika keluar.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentSession]);

  // Keyboard Shortcuts: A, B, C, D to pick option, Enter to save & advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentSession || currentSession.status === "SELESAI" || showFullscreenWarning || showViolationModal)
        return;

      const currentSoal = currentSession.daftarSoal[currentIndex];
      if (!currentSoal) return;

      const key = e.key.toUpperCase();
      if (key === "A" && currentSoal.opsi.length >= 1) {
        answerQuestion(currentSoal.id, 0);
      } else if (key === "B" && currentSoal.opsi.length >= 2) {
        answerQuestion(currentSoal.id, 1);
      } else if (key === "C" && currentSoal.opsi.length >= 3) {
        answerQuestion(currentSoal.id, 2);
      } else if (key === "D" && currentSoal.opsi.length >= 4) {
        answerQuestion(currentSoal.id, 3);
      } else if (key === "ENTER") {
        if (currentIndex < currentSession.daftarSoal.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setShowConfirmModal(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentSession, answerQuestion, showFullscreenWarning, showViolationModal]);

  if (!currentSession) return null;

  const totalSoal = currentSession.daftarSoal.length;
  const currentSoal = currentSession.daftarSoal[currentIndex];
  const userJawaban = currentSession.jawabanMap[currentSoal?.id];

  // Format timer MM:SS
  const minutes = Math.floor(currentSession.waktuDetikSisa / 60);
  const seconds = currentSession.waktuDetikSisa % 60;
  const timerFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Counts
  const dijawabCount = Object.values(currentSession.jawabanMap).filter(
    (j) => j.selectedOpsiIndex !== null && !j.isRaguRagu
  ).length;
  const raguCount = Object.values(currentSession.jawabanMap).filter((j) => j.isRaguRagu).length;
  const belumCount = totalSoal - (dijawabCount + raguCount);

  const handleFinish = () => {
    finishSession(false, violationsCount);
    navigate("/latihan/hasil");
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex flex-col justify-between select-none relative overflow-x-hidden">
      {/* 1. Bar Sesi CBT Header */}
      <header className="bg-white/95 border-b border-[#B8CFB3] sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-md shadow-black/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sesi info */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F6E2E9] text-[#739071] border border-[#B8CFB3] flex items-center gap-1 shadow-sm">
              <span>Adaptif AI</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#B8CFB3]/40 text-[#60795e] border border-[#B8CFB3] shadow-sm">
              {currentSession.mode.replace("_", " ")}
            </span>
            <span className="font-mono text-xs text-slate-500 font-bold">{currentSession.idSesi}</span>

            {/* Anti-Cheat Violation Badge */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition shadow-sm ${
                violationsCount === 0
                  ? "bg-[#B8CFB3]/30 border-[#84A282] text-[#60795e]"
                  : violationsCount === 1
                  ? "bg-amber-500/20 border-amber-400 text-amber-700"
                  : "bg-rose-500/20 border-rose-400 text-rose-700 animate-pulse"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Pelanggaran: {violationsCount} / {MAX_VIOLATIONS}</span>
            </div>
          </div>

          {/* Fullscreen, Streak, Timer, Selesaikan Button */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Fullscreen Button */}
            <button
              onClick={requestFullscreenMode}
              className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                isFullscreen
                  ? "bg-[#FEFAF3] border-[#B8CFB3] text-[#84A282]"
                  : "bg-[#F6E2E9] border-[#B8CFB3] text-[#739071] hover:bg-[#F6E2E9]/80"
              }`}
              title={isFullscreen ? "Layar Penuh Aktif" : "Aktifkan Layar Penuh"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span className="hidden sm:inline text-[11px]">
                {isFullscreen ? "Fullscreen" : "Layar Penuh"}
              </span>
            </button>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEFAF3] rounded-xl border border-[#B8CFB3] text-xs font-bold text-amber-600">
              <span>{currentSession.streakBenar} Benar Berturut</span>
            </div>

            {/* Timer Countdown */}
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                currentSession.waktuDetikSisa < 120
                  ? "bg-rose-500/20 border-rose-500 text-rose-600 animate-pulse"
                  : "bg-[#FEFAF3] border-[#B8CFB3] text-[#739071]"
              }`}
            >
              <Clock className="w-4 h-4 text-[#84A282]" />
              <span>Sisa Waktu: {timerFormatted}</span>
            </div>

            {/* Tombol Selesaikan Ujian */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-1.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs shadow-md shadow-[#84A282]/20 transition"
            >
              Selesaikan Ujian
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main CBT Exam Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 grid lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Kartu Soal Utama & Anatomi */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white border border-[#B8CFB3] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Soal Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B8CFB3]/60 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#84A282] text-white font-black text-sm flex items-center justify-center shadow-sm">
                  {currentIndex + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Soal No. {currentIndex + 1} dari {totalSoal}</h3>
                  <p className="text-[11px] text-slate-500">{currentSoal?.topik}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    currentSoal?.kesulitan === "MUDAH"
                      ? "bg-[#B8CFB3]/40 border-[#84A282] text-[#60795e]"
                      : currentSoal?.kesulitan === "SEDANG"
                      ? "bg-[#F6E2E9] border-[#B8CFB3] text-[#739071]"
                      : "bg-rose-50 border-rose-300 text-rose-600"
                  }`}
                >
                  Kesulitan: {currentSoal?.kesulitan}
                </span>

                <button
                  onClick={() => toggleRaguRagu(currentSoal.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    userJawaban?.isRaguRagu
                      ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                      : "bg-[#FEFAF3] border-[#B8CFB3] text-slate-600 hover:bg-[#F6E2E9]/40"
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{userJawaban?.isRaguRagu ? "Ragu-ragu (Aktif)" : "Ragu-ragu"}</span>
                </button>
              </div>
            </div>

            {/* Pertanyaan */}
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
              {currentSoal?.pertanyaan}
            </p>

            {/* Visualisasi Skema Anatomi Organ (Jika Soal No. 7 / hasDiagram) */}
            {currentSoal?.hasDiagram && (
              <div className="pt-1">
                <DigestiveDiagram />
              </div>
            )}

            {/* Pilihan Ganda Opsi A, B, C, D */}
            <div className="space-y-3 pt-2">
              {currentSoal?.opsi.map((opsi, idx) => {
                const isSelected = userJawaban?.selectedOpsiIndex === idx;
                return (
                  <div
                    key={opsi.label}
                    onClick={() => answerQuestion(currentSoal.id, idx)}
                    className={`p-4 rounded-2xl border text-sm font-medium cursor-pointer transition-all flex items-center gap-3.5 group ${
                      isSelected
                        ? "bg-[#F6E2E9]/70 border-[#84A282] text-slate-900 shadow-md shadow-[#84A282]/10"
                        : "bg-white border-[#B8CFB3]/60 text-slate-700 hover:bg-[#FEFAF3] hover:border-[#84A282]"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                        isSelected
                          ? "bg-[#84A282] text-white shadow-sm"
                          : "bg-[#FEFAF3] border border-[#B8CFB3] text-slate-600 group-hover:bg-[#B8CFB3]/30 group-hover:text-slate-900"
                      }`}
                    >
                      {opsi.label}
                    </span>
                    <span className="flex-1 leading-relaxed">{opsi.teks}</span>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      [{opsi.label}]
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Feedback Jawaban Tersimpan */}
            {userJawaban?.selectedOpsiIndex !== null && (
              <div className="flex items-center gap-2 text-xs text-[#60795e] font-semibold pt-1">
                <CheckCircle2 className="w-4 h-4 text-[#84A282]" />
                <span>
                  Jawaban Anda saat ini tersimpan: Opsi {currentSoal.opsi[userJawaban.selectedOpsiIndex]?.label}
                </span>
              </div>
            )}

            {/* Navigasi Soal Bawah */}
            <div className="flex items-center justify-between pt-4 border-t border-[#B8CFB3]/60">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#B8CFB3] hover:bg-[#FEFAF3] disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Soal Sebelumnya</span>
              </button>

              {currentIndex < totalSoal - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#84A282]/20 transition"
                >
                  <span>Simpan & Lanjut</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#60795e] hover:bg-[#4e634d] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#60795e]/20 transition"
                >
                  <span>Selesaikan & Lihat Hasil</span>
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Panel Tips Adaptif AI & Jembatan Keledai (Sesuai Mockup) */}
          {(currentSoal?.tipsAdaptif || currentSoal?.jembatanKeledai) && (
            <div className="p-5 rounded-2xl bg-[#F6E2E9]/50 border border-[#B8CFB3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#60795e] uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-[#84A282]" />
                  <span>Tips Adaptif AI & Jembatan Keledai</span>
                </span>
                <span className="text-[10px] text-[#739071] font-mono font-semibold">Rumus Cepat</span>
              </div>

              {currentSoal.jembatanKeledai && (
                <p className="text-xs font-bold text-[#60795e]">
                  {currentSoal.jembatanKeledai}
                </p>
              )}

              {currentSoal.tipsAdaptif && (
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {currentSoal.tipsAdaptif}
                </p>
              )}

              {currentSoal.insightKelemahan && (
                <p className="text-[11px] text-[#739071] italic pt-1 border-t border-[#B8CFB3]/60">
                  Insight AI: {currentSoal.insightKelemahan}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Grid Navigasi Nomor Soal & Status */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Navigasi Butir Soal</h4>
              <p className="text-xs text-slate-500">Klik nomor untuk berpindah langsung</p>
            </div>

            {/* Status Counter */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#B8CFB3]/30 border border-[#84A282]/30">
                <span className="font-extrabold text-[#60795e] text-base">{dijawabCount}</span>
                <p className="text-[10px] text-slate-600 font-medium">Dijawab</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6E2E9] border border-[#B8CFB3]">
                <span className="font-extrabold text-amber-700 text-base">{raguCount}</span>
                <p className="text-[10px] text-slate-600 font-medium">Ragu-ragu</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FEFAF3] border border-[#B8CFB3]">
                <span className="font-extrabold text-slate-500 text-base">{belumCount}</span>
                <p className="text-[10px] text-slate-500 font-medium">Belum</p>
              </div>
            </div>

            {/* Grid Tombol Nomor Soal (1 - 10) */}
            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {currentSession.daftarSoal.map((soal, idx) => {
                const jwb = currentSession.jawabanMap[soal.id];
                const isCurrent = currentIndex === idx;
                const isAnswered = jwb?.selectedOpsiIndex !== null;
                const isRagu = jwb?.isRaguRagu;

                let btnStyle = "bg-[#FEFAF3] border-[#B8CFB3] text-slate-700"; // Belum
                if (isRagu) {
                  btnStyle = "bg-amber-400 border-amber-500 text-slate-950 font-black";
                } else if (isAnswered) {
                  btnStyle = "bg-[#84A282] border-[#739071] text-white font-black shadow-sm";
                }

                return (
                  <button
                    key={soal.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl border text-xs font-bold transition-all relative flex items-center justify-center ${btnStyle} ${
                      isCurrent ? "ring-2 ring-[#84A282] ring-offset-2 ring-offset-white scale-105" : ""
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#84A282]"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pintasan Keyboard & Keamanan Info */}
            <div className="pt-3 border-t border-[#B8CFB3]/60 text-xs text-slate-600 space-y-2">
              <div>
                <span className="font-bold text-slate-800 text-[11px] block">Pintasan Keyboard:</span>
                <p className="text-[11px] mt-0.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#FEFAF3] border border-[#B8CFB3] text-[#739071] font-mono text-[10px]">A</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#FEFAF3] border border-[#B8CFB3] text-[#739071] font-mono text-[10px]">B</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#FEFAF3] border border-[#B8CFB3] text-[#739071] font-mono text-[10px]">C</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#FEFAF3] border border-[#B8CFB3] text-[#739071] font-mono text-[10px]">D</kbd> : Opsi •{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#FEFAF3] border border-[#B8CFB3] text-[#739071] font-mono text-[10px]">Enter</kbd> : Lanjut
                </p>
              </div>

              <div className="pt-2 border-t border-[#B8CFB3]/40 flex items-center gap-2 text-[10px] text-slate-500">
                <Shield className="w-3.5 h-3.5 text-[#84A282] shrink-0" />
                <span>Pengawas CBT Aktif • Proteksi Copy, Tab Switch & Fullscreen</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. MODAL: Fullscreen Warning Lock Overlay (Metode 1) */}
      {showFullscreenWarning && !isAutoSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white border border-[#B8CFB3] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#B8CFB3]/30 border border-[#B8CFB3] flex items-center justify-center text-[#60795e]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#60795e] bg-[#F6E2E9] border border-[#B8CFB3] px-3 py-1 rounded-full">
                Penguncian Layar CBT
              </span>
              <h3 className="text-xl font-black text-slate-900">Mode Layar Penuh Dinonaktifkan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Demi menjaga integritas ujian, Anda wajib berada dalam mode layar penuh. Seluruh kontrol ujian dijeda sementara hingga mode layar penuh diaktifkan kembali.
              </p>
            </div>

            <button
              onClick={requestFullscreenMode}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Maximize className="w-4 h-4" />
              <span>Kembali ke Mode Layar Penuh</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL: Violation Warning Popup (Metode 2) */}
      {showViolationModal && !isAutoSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white border border-rose-300 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F6E2E9] border border-rose-200 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F6E2E9] text-rose-800 border border-rose-300">
                  Peringatan Pelanggaran #{violationsCount} dari {MAX_VIOLATIONS}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">Terdeteksi Berpindah Halaman!</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {latestViolationReason}
              </p>
              <p className="text-[11px] text-rose-800 mt-2 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                Perhatian: Jika Anda berpindah tab/aplikasi sebanyak <b>{MAX_VIOLATIONS} kali</b>, ujian akan otomatis <b>di-submit paksa</b> oleh sistem.
              </p>
            </div>

            <button
              onClick={() => {
                setShowViolationModal(false);
                requestFullscreenMode();
              }}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
            >
              Saya Mengerti & Lanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL: Auto-Submit Disqualification Notification (Metode 3) */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white border border-rose-300 rounded-3xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 animate-bounce">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Batas Pelanggaran Terlampaui (3/3)</h3>
              <p className="text-xs text-rose-700 font-semibold">
                Sesi Ujian Dihentikan & Dikumpulkan Otomatis
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda telah meninggalkan halaman ujian sebanyak 3 kali. Sesuai regulasi integritas CBT, sesi ujian Anda otomatis diakhiri dan dicatat ke dalam rapor pengawas.
            </p>

            <div className="pt-2">
              <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-[11px] text-slate-500 mt-2">Menyimpan dan mengalihkan ke lembar evaluasi...</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Normal Finish Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F6E2E9] border border-[#B8CFB3] text-[#739071] flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Selesaikan Sesi Latihan?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Anda telah menjawab <b>{dijawabCount}</b> dari <b>{totalSoal}</b> butir soal ({raguCount} ragu-ragu).
                Jawaban Anda akan dinilai dan dimasukkan ke dalam Rapor Evaluasi Adaptif.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#FEFAF3] hover:bg-[#F6E2E9]/40 text-slate-700 border border-[#B8CFB3] transition"
              >
                Periksa Kembali
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#84A282] hover:bg-[#739071] text-white shadow-sm transition"
              >
                Ya, Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
