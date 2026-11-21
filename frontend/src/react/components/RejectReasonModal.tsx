import React, { useState } from "react";
import { SoalReview } from "../types/mentor";
import { X, XCircle } from "lucide-react";

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  soal: SoalReview | null;
  onConfirmReject: (soalId: number, alasan: string) => void;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  soal,
  onConfirmReject,
}) => {
  const [alasan, setAlasan] = useState("");

  if (!isOpen || !soal) return null;

  const quickReasons = [
    "Materi berada di luar cakupan Kurikulum & Silabus KD tingkat ini.",
    "Rumusan pertanyaan ambigu dan opsi jawaban tidak memiliki pembeda jelas.",
    "Kunci jawaban yang di-generate AI tidak tepat secara konsep ilmiah.",
    "Tingkat kesulitan tidak proporsional dengan tingkat pendidikan siswa.",
  ];

  const handleConfirm = () => {
    const finalReason = alasan.trim() || "Ditolak oleh kurator mentor tanpa catatan spesifik.";
    onConfirmReject(soal.id, finalReason);
    setAlasan("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="max-w-md w-full bg-white border border-rose-300 rounded-3xl p-6 shadow-2xl text-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#B8CFB3]/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F6E2E9] text-rose-800 flex items-center justify-center border border-rose-200">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tolak Butir Soal AI</h3>
              <p className="text-xs text-slate-500">Soal #{soal.id} • {soal.tingkat}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-[#FEFAF3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Snippet */}
        <div className="p-3 rounded-xl bg-[#FEFAF3] border border-[#B8CFB3] text-xs text-slate-700 line-clamp-2 leading-relaxed">
          "{soal.pertanyaan}"
        </div>

        {/* Reason Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Alasan Penolakan Soal:
          </label>
          <textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            rows={3}
            className="w-full bg-[#FEFAF3] border border-[#B8CFB3] rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-400 transition resize-none leading-relaxed"
            placeholder="Jelaskan alasan mengapa soal ini belum layak dipublikasikan ke siswa..."
          />
        </div>

        {/* Quick Reason Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600">Pilihan Alasan Cepat:</span>
          <div className="flex flex-col gap-1.5">
            {quickReasons.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAlasan(qr)}
                className="text-[11px] p-2.5 rounded-xl bg-[#FEFAF3] hover:bg-[#F6E2E9] text-slate-700 border border-[#B8CFB3] transition text-left"
              >
                {qr}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#B8CFB3]/60">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FEFAF3] hover:bg-[#F6E2E9] text-slate-700 border border-[#B8CFB3] transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <XCircle className="w-4 h-4" />
            <span>Konfirmasi Tolak</span>
          </button>
        </div>
      </div>
    </div>
  );
};
