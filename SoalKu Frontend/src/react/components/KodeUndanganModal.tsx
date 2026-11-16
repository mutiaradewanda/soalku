import React, { useState } from "react";
import { KeyRound, X, Check, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useMentor } from "../context/MentorContext";

interface KodeUndanganModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentTingkat: "SD" | "SMP";
  onSuccess?: (message: string) => void;
}

export const KodeUndanganModal: React.FC<KodeUndanganModalProps> = ({
  isOpen,
  onClose,
  studentTingkat,
  onSuccess,
}) => {
  const { kodeUndanganList, redeemKodeUndangan } = useMentor();
  const [kodeInput, setKodeInput] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const relevantCodes = kodeUndanganList.filter(
    (k) => k.status === "AKTIF" && (k.targetTingkat === studentTingkat || k.targetTingkat === "SEMUA")
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!kodeInput.trim()) {
      setFeedback({
        type: "error",
        message: "Silakan ketik atau pilih kode undangan dari guru.",
      });
      return;
    }

    const result = redeemKodeUndangan(kodeInput, studentTingkat);
    if (result.success) {
      setFeedback({ type: "success", message: result.message });
      if (onSuccess) {
        onSuccess(result.message);
      }
      setTimeout(() => {
        setFeedback(null);
        setKodeInput("");
        onClose();
      }, 1600);
    } else {
      setFeedback({ type: "error", message: result.message });
    }
  };

  const handleSelectChip = (kode: string) => {
    setKodeInput(kode);
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="max-w-md w-full bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-2xl text-slate-800 space-y-5 relative">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-[#B8CFB3]/60 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B8CFB3]/40 text-[#60795e] flex items-center justify-center border border-[#B8CFB3]">
              <KeyRound className="w-5 h-5 text-[#84A282]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Masukkan Kode Undangan</h3>
              <p className="text-xs text-slate-500">
                Hubungkan akun dengan kelas bimbingan guru ({studentTingkat})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setFeedback(null);
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-[#FEFAF3] transition"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kode Akses Kelas Guru
            </label>
            <div className="relative">
              <input
                type="text"
                value={kodeInput}
                onChange={(e) => {
                  setKodeInput(e.target.value.toUpperCase());
                  if (feedback) setFeedback(null);
                }}
                placeholder={studentTingkat === "SD" ? "GURU-SD-2026" : "GURU-SMP-2026"}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FEFAF3] border border-[#B8CFB3] text-sm font-mono font-bold tracking-wider text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#84A282]/30 focus:border-[#84A282] transition"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Dapatkan kode bimbingan resmi dari wali kelas atau guru mata pelajaran Anda.
            </p>
          </div>

          {/* Quick Active Code Suggestions */}
          {relevantCodes.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Pilihan Kode Aktif Tersedia:
              </span>
              <div className="flex flex-wrap gap-2">
                {relevantCodes.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => handleSelectChip(k.kode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                      kodeInput === k.kode
                        ? "bg-[#84A282] text-white border-[#739071] shadow-sm"
                        : "bg-[#FEFAF3] hover:bg-[#F6E2E9]/60 text-[#60795e] border-[#B8CFB3]"
                    }`}
                  >
                    {k.kode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#B8CFB3]/60">
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-[#FEFAF3] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold shadow-md shadow-[#84A282]/20 flex items-center gap-1.5 transition active:translate-y-0.5"
            >
              <span>Hubungkan Kelas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KodeUndanganModal;
