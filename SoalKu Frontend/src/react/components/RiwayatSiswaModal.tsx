import React, { useState } from "react";
import { SiswaBinaan } from "../types/mentor";
import {
  X,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Trophy,
  Activity,
  Layers,
  KeyRound,
  Send,
} from "lucide-react";

interface RiwayatSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: SiswaBinaan | null;
  onSaveCatatan: (siswaId: string, catatan: string) => void;
}

export const RiwayatSiswaModal: React.FC<RiwayatSiswaModalProps> = ({
  isOpen,
  onClose,
  siswa,
  onSaveCatatan,
}) => {
  const [catatanInput, setCatatanInput] = useState("");
  const [catatanSaved, setCatatanSaved] = useState(false);

  React.useEffect(() => {
    if (siswa) {
      setCatatanInput(siswa.catatanGuru || "");
      setCatatanSaved(false);
    }
  }, [siswa]);

  if (!isOpen || !siswa) return null;

  const isRemedial = siswa.statusRemedial === "Perlu Remedial";
  const isBimbingan = siswa.statusRemedial === "Bimbingan";
  const isTuntas = siswa.statusRemedial === "Tuntas";

  const riwayatList = siswa.riwayatPengerjaan || [];

  const handleSaveNote = () => {
    onSaveCatatan(siswa.id, catatanInput.trim());
    setCatatanSaved(true);
    setTimeout(() => setCatatanSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="max-w-2xl w-full bg-white border border-[#B8CFB3] rounded-3xl p-6 shadow-2xl text-slate-800 space-y-5 max-h-[90vh] flex flex-col relative">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-[#B8CFB3]/60 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0 ${
                isRemedial ? "bg-rose-600" : isBimbingan ? "bg-amber-600" : "bg-emerald-600"
              }`}
            >
              {siswa.nama.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{siswa.nama}</h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isRemedial
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : isBimbingan
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {isTuntas ? "✓ Tuntas / Lulus" : siswa.statusRemedial}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{siswa.kelas}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-700">
                  <KeyRound className="w-3.5 h-3.5 text-[#84A282]" />
                  <span>Kode: {siswa.kodeUndanganTerhubung || "GURU-SD-2026"}</span>
                </span>
                <span>•</span>
                <span>Aktif: {siswa.terakhirAktif}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-[#FEFAF3] transition"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] text-center space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Latihan
              </span>
              <p className="text-xl font-extrabold text-slate-900">{siswa.totalLatihan}</p>
              <span className="text-[10px] text-slate-500">Modul Selesai</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] text-center space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Akurasi Rata-Rata
              </span>
              <p
                className={`text-xl font-extrabold ${
                  siswa.akurasiRataRata >= 75
                    ? "text-[#60795e]"
                    : siswa.akurasiRataRata >= 55
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}
              >
                {siswa.akurasiRataRata}%
              </p>
              <span className="text-[10px] text-slate-500">Hasil Pemahaman</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] text-center space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Fokus Kelemahan
              </span>
              <p className="text-xs font-bold text-slate-800 line-clamp-1 pt-1">
                {siswa.topikKelemahan}
              </p>
              <span className="text-[10px] text-slate-500">Perlu Penguatan</span>
            </div>
          </div>

          {/* Monitoring Riwayat Pengerjaan Modul */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#84A282]" />
                <span>Riwayat Pengerjaan Modul Siswa ({riwayatList.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500">Nilai otomatis masuk saat siswa submit</span>
            </div>

            {riwayatList.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-[#FEFAF3] border border-dashed border-[#B8CFB3] space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-700 font-semibold">
                  Belum ada modul yang diselesaikan
                </p>
                <p className="text-[11px] text-slate-500">
                  Saat siswa mengerjakan modul latihan CBT di dasbornya, nilai dan detail soal akan muncul di sini secara otomatis.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {riwayatList.map((riwayat) => {
                  const isLulusRiwayat = riwayat.status === "Lulus";
                  return (
                    <div
                      key={riwayat.id}
                      className="p-3.5 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] hover:border-[#84A282] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{riwayat.mapel}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-[#B8CFB3] text-[10px] font-semibold text-slate-600">
                            Mode: {riwayat.mode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Topik: <span className="font-semibold text-slate-800">{riwayat.topik}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>{riwayat.tanggal}</span>
                          <span>•</span>
                          <span>ID: {riwayat.idSesi}</span>
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#B8CFB3]/50">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-black ${
                              isLulusRiwayat ? "text-[#60795e]" : "text-amber-600"
                            }`}
                          >
                            {riwayat.skor}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">/ 100</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isLulusRiwayat
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          {riwayat.totalBenar}/{riwayat.totalSoal} Soal Benar ({riwayat.status})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Catatan Bimbingan Guru Langsung */}
          <div className="space-y-2 pt-2 border-t border-[#B8CFB3]/60">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#84A282]" />
              <span>Beri Catatan Bimbingan untuk {siswa.nama}</span>
            </label>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={catatanInput}
                onChange={(e) => setCatatanInput(e.target.value)}
                placeholder="Tulis pesan bimbingan atau instruksi penguatan untuk siswa ini..."
                className="w-full bg-[#FEFAF3] border border-[#B8CFB3] rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#84A282]/30 focus:border-[#84A282] transition resize-none"
              />
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-2 bg-[#84A282] hover:bg-[#739071] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 shrink-0 self-end"
              >
                {catatanSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-[#B8CFB3]/60 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FEFAF3] hover:bg-[#F6E2E9]/60 border border-[#B8CFB3] text-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
