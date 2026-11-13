import React, { useState, useEffect } from "react";
import { X, Save, Edit3 } from "lucide-react";
import { SoalReview } from "../types/mentor";

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  soal: SoalReview | null;
  onSave: (soalId: number, updatedData: Partial<SoalReview>) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  soal,
  onSave,
}) => {
  if (!isOpen || !soal) return null;

  const [pertanyaan, setPertanyaan] = useState(soal.pertanyaan);
  const [opsiList, setOpsiList] = useState(soal.opsi);
  const [pembahasan, setPembahasan] = useState(soal.pembahasan);
  const [tipsAdaptif, setTipsAdaptif] = useState(soal.tipsAdaptif || "");
  const [tingkatKesulitan, setTingkatKesulitan] = useState<"MUDAH" | "SEDANG" | "SULIT">(soal.tingkatKesulitan);

  useEffect(() => {
    if (soal) {
      setPertanyaan(soal.pertanyaan);
      setOpsiList(soal.opsi);
      setPembahasan(soal.pembahasan);
      setTipsAdaptif(soal.tipsAdaptif || "");
      setTingkatKesulitan(soal.tingkatKesulitan);
    }
  }, [soal]);

  const handleOpsiTeksChange = (index: number, newTeks: string) => {
    const updated = [...opsiList];
    updated[index] = { ...updated[index], teks: newTeks };
    setOpsiList(updated);
  };

  const handleSetKunciJawaban = (index: number) => {
    const updated = opsiList.map((op, idx) => ({
      ...op,
      isBenar: idx === index,
    }));
    setOpsiList(updated);
  };

  const handleSave = () => {
    onSave(soal.id, {
      pertanyaan,
      opsi: opsiList,
      pembahasan,
      tipsAdaptif: tipsAdaptif.trim() || undefined,
      tingkatKesulitan,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white border border-[#B8CFB3] rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-800 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#B8CFB3]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B8CFB3]/30 text-[#60795e] flex items-center justify-center border border-[#B8CFB3]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Butir Soal AI</h3>
              <p className="text-xs text-slate-500">
                Sesuaikan teks soal, opsi jawaban, dan kunci sebelum disetujui ke Bank Soal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-[#FEFAF3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Metadata info */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-[#F6E2E9] text-[#60795e] font-bold border border-[#B8CFB3]">
              {soal.tingkat} • {soal.opsi.length} Opsi
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#FEFAF3] text-slate-700 font-medium border border-[#B8CFB3]">
              {soal.topik}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#FEFAF3] text-slate-700 font-medium border border-[#B8CFB3]">
              {soal.mataPelajaran}
            </span>
          </div>

          {/* Tingkat Kesulitan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Tingkat Kesulitan Soal:</label>
            <div className="flex items-center gap-2">
              {(["MUDAH", "SEDANG", "SULIT"] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setTingkatKesulitan(diff)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    tingkatKesulitan === diff
                      ? diff === "MUDAH"
                        ? "bg-[#84A282] text-white border-[#739071]"
                        : diff === "SEDANG"
                        ? "bg-[#60795e] text-white border-[#4e634d]"
                        : "bg-rose-700 text-white border-rose-800"
                      : "bg-[#FEFAF3] text-slate-600 border-[#B8CFB3] hover:text-slate-900"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Teks Pertanyaan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Teks Pertanyaan:</label>
            <textarea
              rows={3}
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              className="w-full bg-[#FEFAF3] border border-[#B8CFB3] rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#84A282] transition leading-relaxed resize-none"
            />
          </div>

          {/* Opsi Jawaban */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Pilihan Ganda (Klik radio untuk menandai Kunci Jawaban):</span>
              <span className="text-[11px] text-[#60795e] font-normal">Kunci ditandai hijau</span>
            </label>

            <div className="space-y-2">
              {opsiList.map((op, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                    op.isBenar
                      ? "bg-[#B8CFB3]/25 border-[#84A282]"
                      : "bg-[#FEFAF3] border-[#B8CFB3]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSetKunciJawaban(idx)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition ${
                      op.isBenar
                        ? "bg-[#84A282] text-white shadow-sm"
                        : "bg-white border border-[#B8CFB3] text-slate-600 hover:text-slate-900"
                    }`}
                    title="Jadikan sebagai kunci jawaban benar"
                  >
                    {op.label}
                  </button>

                  <input
                    type="text"
                    value={op.teks}
                    onChange={(e) => handleOpsiTeksChange(idx, e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs text-slate-900 focus:outline-none px-1"
                    placeholder={`Teks opsi ${op.label}...`}
                  />

                  {op.isBenar && (
                    <span className="text-[10px] font-bold text-[#60795e] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#B8CFB3]">
                      Kunci Benar
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pembahasan AI */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Pembahasan Materi AI:</label>
            <textarea
              rows={2}
              value={pembahasan}
              onChange={(e) => setPembahasan(e.target.value)}
              className="w-full bg-[#FEFAF3] border border-[#B8CFB3] rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#84A282] transition leading-relaxed resize-none"
            />
          </div>

          {/* Tips Adaptif */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Tips Rumus Cepat / Jembatan Keledai (Opsional):</span>
            </label>
            <input
              type="text"
              value={tipsAdaptif}
              onChange={(e) => setTipsAdaptif(e.target.value)}
              className="w-full bg-[#FEFAF3] border border-[#B8CFB3] rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#84A282] transition"
              placeholder="Contoh: Rumus Cepat [R-P-L]..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#B8CFB3]/60">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FEFAF3] hover:bg-[#F6E2E9] text-slate-700 border border-[#B8CFB3] transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#84A282] hover:bg-[#739071] text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
