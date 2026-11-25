import React from "react";
import {
  X,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Materi } from "../types/materi";

interface MateriDetailModalProps {
  materi: Materi | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: (materi: Materi) => void;
}

export const MateriDetailModal: React.FC<MateriDetailModalProps> = ({
  materi,
  isOpen,
  onClose,
  onStartPractice,
}) => {
  if (!isOpen || !materi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#B8CFB3] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#60795e] px-6 py-5 text-white flex items-center justify-between border-b border-[#B8CFB3]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{materi.judul}</h2>
              <p className="text-xs text-[#FEFAF3]/80">
                {materi.mataPelajaran} • Diunggah {materi.tanggalUpload}
                {materi.ukuranFileKb ? ` (${materi.ukuranFileKb} KB)` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto bg-[#FEFAF3]">
          {/* Ringkasan Utama */}
          <div className="p-5 rounded-2xl bg-white border border-[#B8CFB3] shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#60795e] uppercase tracking-wider">
              <span>Ringkasan Ekstraksi AI (Bahasa Ramah {materi.tingkat})</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {materi.deskripsi}
            </p>
          </div>

          {/* Poin Kunci & Jembatan Keledai */}
          {materi.poinKunci && materi.poinKunci.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span>Poin Kunci & Rumus Pintas AI</span>
              </h4>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {materi.poinKunci.map((poin, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-[#B8CFB3]/70 shadow-sm text-xs text-slate-700 font-medium flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-300 text-slate-500 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{poin}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-white border-t border-[#B8CFB3] flex items-center justify-end shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                if (onStartPractice) onStartPractice(materi);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
            >
              <span>Mulai Latihan dari Modul Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
