import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  School,
  BookOpen,
  ArrowRight,
  Loader2,
  FileCheck,
} from "lucide-react";
import { useMateri } from "../context/MateriContext";
import { TingkatMateri } from "../types/materi";

interface UploadMateriModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTingkat?: TingkatMateri;
  onSuccess?: () => void;
}

export const UploadMateriModal: React.FC<UploadMateriModalProps> = ({
  isOpen,
  onClose,
  defaultTingkat = "SMP",
  onSuccess,
}) => {
  const { uploadMateri } = useMateri();

  const [tingkat, setTingkat] = useState<TingkatMateri>(defaultTingkat);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [bahasaPengantar, setBahasaPengantar] = useState<"SESUAI_MODUL" | "INDONESIA">("SESUAI_MODUL");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = [".pdf", ".docx", ".txt"];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      setErrorMessage(
        "Format berkas ditolak. Sesuai spesifikasi PRD Section 11, hanya berkas .pdf, .docx, atau .txt yang diperbolehkan."
      );
      setSelectedFile(null);
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(
        `Ukuran berkas terlalu besar (${sizeMb} MB). Batas maksimal yang diizinkan adalah 10 MB.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = (sampleName: string, sampleText: string) => {
    setErrorMessage(null);
    const dummyFile = new File([sampleText], sampleName, { type: "application/pdf" });
    setSelectedFile(dummyFile);
    setManualText(sampleText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !manualText.trim()) {
      setErrorMessage("Silakan pilih berkas PDF/DOCX atau tempelkan materi teks terlebih dahulu.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressPercent(20);
    setProgressStep("Mengekstrak teks dokumen PDF via PDFBox & parser...");

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProgressPercent(55);
      setProgressStep("Menghubungi AI Gemini Engine untuk memecah bagian topik...");

      await new Promise((r) => setTimeout(r, 700));
      setProgressPercent(85);
      setProgressStep("Menyusun ringkasan sederhana & butir soal berjenjang...");

      await uploadMateri(selectedFile, manualText, tingkat, undefined, bahasaPengantar);

      setProgressPercent(100);
      setProgressStep("Selesai! Materi berhasil diekstraksi ke modul belajar.");
      await new Promise((r) => setTimeout(r, 400));

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses dokumen materi.");
    } finally {
      setIsProcessing(false);
      setProgressStep("");
      setProgressPercent(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#B8CFB3] flex flex-col">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight leading-snug">Unggah Materi & Ringkas AI</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/20 text-[#FEFAF3]">
                  PRD Sec. 6.1
                </span>
              </div>
              <p className="text-xs text-[#FEFAF3]/90">Ekstraksi berkas dokumen PDF/DOCX (Maks 10 MB)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FEFAF3] flex items-center justify-center transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-[#FEFAF3]">
          {/* Target Tingkat Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Target Jenjang Pembelajaran
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTingkat("SD")}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  tingkat === "SD"
                    ? "bg-[#F6E2E9] text-[#60795e] border-[#B8CFB3] shadow-sm"
                    : "bg-white text-slate-600 border-[#B8CFB3] hover:bg-[#FEFAF3]"
                }`}
              >
                <School className="w-4 h-4 text-[#84A282]" />
                <span>Siswa SD (3 Opsi Jawaban)</span>
              </button>

              <button
                type="button"
                onClick={() => setTingkat("SMP")}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  tingkat === "SMP"
                    ? "bg-[#84A282] text-white border-[#739071] shadow-sm"
                    : "bg-white text-slate-600 border-[#B8CFB3] hover:bg-[#FEFAF3]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Siswa SMP (4 Opsi Jawaban)</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Berkas Dokumen Materi
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#84A282] bg-[#F6E2E9]/60 scale-[1.01]"
                  : selectedFile
                  ? "border-[#84A282] bg-[#B8CFB3]/25"
                  : "border-[#B8CFB3] hover:border-[#84A282] bg-white hover:bg-[#FEFAF3]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#B8CFB3]/40 text-[#60795e] flex items-center justify-center border border-[#B8CFB3]">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                    <p className="text-xs text-[#60795e] font-medium">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses AI
                    </p>
                  </div>
                  <span className="text-[11px] text-[#84A282] hover:underline font-semibold mt-1">
                    Klik untuk mengganti berkas
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#B8CFB3]/30 text-[#60795e] flex items-center justify-center border border-[#B8CFB3]">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Tarik & lepas berkas PDF atau DOCX ke sini
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Atau klik untuk memilih berkas dari komputer Anda</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-[#FEFAF3] border border-[#B8CFB3] px-2.5 py-0.5 rounded-full mt-1">
                    Maksimal 10 MB (.pdf, .docx, .txt)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Sample Selector */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Coba Berkas Contoh Cepat (1 Klik):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSampleSelect(
                    "Modul_IPA_Sistem_Peredaran_Darah.pdf",
                    "Sistem peredaran darah manusia mengalirkan oksigen dan nutrisi. Otot bilik kiri tebal dan katup aorta menjaga aliran darah."
                  )
                }
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F6E2E9] text-[11px] font-semibold text-slate-700 transition border border-[#B8CFB3]"
              >
                Sistem Peredaran Darah.pdf
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSampleSelect(
                    "Biologi_Sistem_Pencernaan_Manusia.pdf",
                    "Pencernaan manusia melibatkan lambung (enzim pepsin, renin, HCl) dan penyerapan usus halus."
                  )
                }
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F6E2E9] text-[11px] font-semibold text-slate-700 transition border border-[#B8CFB3]"
              >
                Sistem Pencernaan.pdf
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSampleSelect(
                    "Aljabar_Kuadrat_Faktorisasi.pdf",
                    "Faktorisasi selisih kuadrat a² - b² = (a+b)(a-b) menyederhanakan perhitungan matematika aljabar."
                  )
                }
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F6E2E9] text-[11px] font-semibold text-slate-700 transition border border-[#B8CFB3]"
              >
                Aljabar Faktorisasi.pdf
              </button>
            </div>
          </div>

          {/* Optional Text Paste Fallback */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Atau Tempelkan (Paste) Teks Catatan Materi Langsung:
            </label>
            <textarea
              rows={2}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Ketik atau tempelkan ringkasan materi pelajaran di sini jika tidak menggunakan berkas..."
              className="w-full p-3 rounded-xl border border-[#B8CFB3] bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#84A282]"
            />
          </div>

          {/* Opsi Pilihan Bahasa Pengantar Soal & Ringkasan */}
          <div className="p-3.5 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              Bahasa yang digunakan untuk ringkasan & soal:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                  bahasaPengantar === "SESUAI_MODUL"
                    ? "bg-white border-[#84A282] ring-2 ring-[#84A282]/30 shadow-sm"
                    : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="bahasaPengantar"
                  value="SESUAI_MODUL"
                  checked={bahasaPengantar === "SESUAI_MODUL"}
                  onChange={() => setBahasaPengantar("SESUAI_MODUL")}
                  className="text-[#84A282] focus:ring-[#84A282]"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Sesuai Dokumen Modul</span>
                  <span className="text-[10px] text-slate-500">
                    Contoh: Jika teks modul Bahasa Inggris, soal & ringkasan otomatis Bahasa Inggris.
                  </span>
                </div>
              </label>

              <label
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                  bahasaPengantar === "INDONESIA"
                    ? "bg-white border-[#84A282] ring-2 ring-[#84A282]/30 shadow-sm"
                    : "bg-white/60 border-slate-200 hover:bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="bahasaPengantar"
                  value="INDONESIA"
                  checked={bahasaPengantar === "INDONESIA"}
                  onChange={() => setBahasaPengantar("INDONESIA")}
                  className="text-[#84A282] focus:ring-[#84A282]"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Terjemahkan ke Bahasa Indonesia</span>
                  <span className="text-[10px] text-slate-500">
                    Soal, opsi, dan ulasan penjelasan diterjemahkan ke Bahasa Indonesia yang ramah.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progress Bar Animation */}
          {isProcessing && (
            <div className="p-3.5 bg-white rounded-2xl border border-[#B8CFB3] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#60795e]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#84A282]" />
                  {progressStep}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#FEFAF3] rounded-full h-2 overflow-hidden border border-[#B8CFB3]/60">
                <div
                  className="bg-[#84A282] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#B8CFB3]/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-[#F6E2E9] border border-[#B8CFB3] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold shadow-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses AI...</span>
                </>
              ) : (
                <>
                  <span>Mulai Ekstraksi & Ringkas AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
