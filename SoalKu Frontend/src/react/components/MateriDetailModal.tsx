import React, { useState } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  School,
  CheckCircle2,
  RefreshCw,
  FileText,
  Layers,
  HelpCircle,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Materi, BagianMateri } from "../types/materi";
import { useMateri } from "../context/MateriContext";

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
  const { regenerateBagianMateri } = useMateri();
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  if (!isOpen || !materi) return null;

  const handleRegenerate = async (bagianId: number, judul: string) => {
    setRegeneratingId(bagianId);
    setSuccessToast(null);
    try {
      await regenerateBagianMateri(materi.id, bagianId);
      setSuccessToast(`Soal dan variasi kognitif untuk "${judul}" berhasil di-generate ulang!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch {
      // ignore
    } finally {
      setRegeneratingId(null);
    }
  };

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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F6E2E9] text-[#60795e] border border-[#B8CFB3]">
                  {materi.tingkat} • {materi.bab}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  {materi.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">{materi.judul}</h2>
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

        {/* Success Toast */}
        {successToast && (
          <div className="bg-[#84A282] text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

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
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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

          {/* Bagian Materi / Unit Topik (Sesuai PRD Section 6.1 & 10) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#84A282]" />
                <span>Unit Topik & Butir Soal Terbentuk ({materi.bagianMateri.length} Bagian)</span>
              </h4>
              <span className="text-[11px] text-slate-400">Dapat di-generate ulang per bagian</span>
            </div>

            <div className="space-y-3">
              {materi.bagianMateri.map((bagian) => {
                const isRegenerating = regeneratingId === bagian.id;
                const isExpanded = expandedSection === bagian.id;
                const soalList = bagian.generatedSoal || [];

                return (
                  <div
                    key={bagian.id}
                    className="rounded-2xl border border-[#B8CFB3] bg-white overflow-hidden shadow-sm hover:border-slate-300 transition"
                  >
                    {/* Top Row Bagian Card */}
                    <div className="p-4 bg-[#FEFAF3] border-b border-[#B8CFB3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#F6E2E9] text-[#60795e] border border-[#B8CFB3] font-mono font-bold text-xs">
                          Unit #{bagian.urutan}
                        </span>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{bagian.judulBagian}</h5>
                          <p className="text-[11px] text-slate-500">
                            Status: <span className="text-[#60795e] font-bold">{bagian.status}</span> •{" "}
                            {soalList.length} butir latihan
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Tombol Regenerate PRD Section 10 */}
                        <button
                          type="button"
                          onClick={() => handleRegenerate(bagian.id, bagian.judulBagian)}
                          disabled={isRegenerating}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F6E2E9] border border-[#B8CFB3] text-[#60795e] text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                          <span>{isRegenerating ? "Meregenerasi..." : "Generate Ulang"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedSection(isExpanded ? null : bagian.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 transition"
                          title="Lihat Butir Soal"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Ringkasan Unit Topik */}
                    <div className="p-4 text-xs text-slate-700 leading-relaxed border-b border-[#B8CFB3]/60 bg-white">
                      <span className="font-semibold text-slate-900">Ringkasan Unit: </span>
                      {bagian.teksRingkasan}
                    </div>

                    {/* Soal Preview */}
                    {soalList.length > 0 && (
                      <div className="p-4 bg-[#FEFAF3] space-y-3">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          Preview Latihan Soal Adaptif AI:
                        </span>
                        {soalList.map((soal) => (
                          <div key={soal.id} className="p-3 rounded-xl bg-white border border-[#B8CFB3] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">{soal.pertanyaan}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEFAF3] border border-[#B8CFB3] text-slate-700">
                                {soal.tingkatKesulitan}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                              {soal.opsi.map((opsi) => (
                                <div
                                  key={opsi.label}
                                  className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                                    opsi.isBenar
                                      ? "bg-[#B8CFB3]/25 border-[#84A282] text-[#60795e] font-semibold"
                                      : "bg-[#FEFAF3] border-[#B8CFB3] text-slate-700"
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                      opsi.isBenar ? "bg-[#84A282] text-white" : "bg-white border border-[#B8CFB3] text-slate-600"
                                    }`}
                                  >
                                    {opsi.label}
                                  </span>
                                  <span>{opsi.teks}</span>
                                </div>
                              ))}
                            </div>
                            {soal.pembahasan && (
                              <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                                Kunci Jawaban: {soal.kunciJawaban} • {soal.pembahasan}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-white border-t border-[#B8CFB3] flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-600">
            Modul ini siap dikerjakan dalam mode Acak, Berwaktu, atau Fokus Kelemahan.
          </p>
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
