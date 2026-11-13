import React, { useState, useEffect } from "react";
import { SiswaBinaan } from "../types/mentor";
import { X, MessageSquare, Check } from "lucide-react";

interface BeriCatatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: SiswaBinaan | null;
  onSave: (siswaId: string, catatan: string) => void;
}

export const BeriCatatanModal: React.FC<BeriCatatanModalProps> = ({
  isOpen,
  onClose,
  siswa,
  onSave,
}) => {
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    if (siswa) {
      setCatatan(siswa.catatanGuru || "");
    }
  }, [siswa]);

  if (!isOpen || !siswa) return null;

  const handleSave = () => {
    onSave(siswa.id, catatan.trim());
    onClose();
  };

  const quickTemplates = [
    "Cermati kembali aliran vena pulmonalis pada modul ringkasan AI ya.",
    "Perlu penguatan hafalan enzim getah lambung menggunakan rumus cepat [R-P-L].",
    "Prestasi belajar sangat konsisten dan solid, pertahankan prestasimu!",
    "Tingkatkan latihan mode berwaktu untuk melatih kecepatan analisis soal.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="max-w-lg w-full bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-2xl text-slate-800 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#B8CFB3]/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B8CFB3]/30 text-[#60795e] flex items-center justify-center border border-[#B8CFB3]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Beri Catatan Bimbingan Guru</h3>
              <p className="text-xs text-slate-500">
                Pesan untuk <span className="text-[#60795e] font-semibold">{siswa.nama}</span> ({siswa.kelas})
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

        {/* Student Mini Info */}
        <div className="p-3.5 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Titik Fokus Kelemahan:</span>
            <span className="font-bold text-rose-700">{siswa.topikKelemahan}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Rata-rata Akurasi:</span>
            <span className="font-bold text-[#60795e]">{siswa.akurasiRataRata}%</span>
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Pesan Arahan & Motivasi Belajar:
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={4}
            className="w-full bg-[#FEFAF3] border border-[#B8CFB3] rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#84A282] transition resize-none leading-relaxed"
            placeholder="Tuliskan arahan materi atau dorongan belajar..."
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600">Pilihan Rekomendasi Cepat:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCatatan(tmpl)}
                className="text-[10.5px] px-2.5 py-1.5 rounded-lg bg-[#FEFAF3] hover:bg-[#F6E2E9] text-slate-700 border border-[#B8CFB3] transition text-left"
              >
                {tmpl.length > 50 ? tmpl.slice(0, 50) + "..." : tmpl}
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
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#84A282] hover:bg-[#739071] text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Catatan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
