import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Edit3,
  Check,
  Search,
  Filter,
  ArrowLeft,
  Layers,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { useMentor } from "../context/MentorContext";
import { useAuth } from "../context/AuthContext";
import { SoalReview, StatusReview } from "../types/mentor";
import { EditQuestionModal } from "../components/EditQuestionModal";
import { RejectReasonModal } from "../components/RejectReasonModal";

export const MentorReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    soalList,
    approveSoal,
    rejectSoal,
    editSoal,
    bulkApproveSoal,
    getPendingCount,
    getApprovedCount,
    getRejectedCount,
    resetBankSoal,
  } = useMentor();

  const [activeTab, setActiveTab] = useState<StatusReview>("MENUNGGU");
  const [filterMapel, setFilterMapel] = useState<string>("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [editTargetSoal, setEditTargetSoal] = useState<SoalReview | null>(null);
  const [rejectTargetSoal, setRejectTargetSoal] = useState<SoalReview | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleApprove = (soalId: number) => {
    approveSoal(soalId, user?.name || "Bu Ratna Kumalasari, S.Pd.");
    showNotification("Soal berhasil disetujui dan ditambahkan ke Bank Soal Siswa!");
  };

  const handleRejectConfirm = (soalId: number, alasan: string) => {
    rejectSoal(soalId, alasan, user?.name || "Bu Ratna Kumalasari, S.Pd.");
    showNotification("Soal telah ditolak dan dicatat ke log penolakan.");
  };

  const handleBulkApprove = () => {
    const pendingIds = soalList.filter((s) => s.statusReview === "MENUNGGU").map((s) => s.id);
    if (pendingIds.length > 0) {
      bulkApproveSoal(pendingIds, user?.name || "Bu Ratna Kumalasari, S.Pd.");
      showNotification(`Berhasil menyetujui sekaligus ${pendingIds.length} butir soal AI!`);
    }
  };

  const guruJenjang = ((user as any)?.jenjang === "SD" ? "SD" : "SMP") as "SD" | "SMP";

  // Distinct subjects in the question bank for this jenjang
  const availableMapelList = Array.from(
    new Set(
      soalList
        .filter((s) => !s.tingkat || s.tingkat === guruJenjang)
        .map((s) => s.mataPelajaran)
    )
  ).filter(Boolean);

  // Filtered list
  const filteredList = soalList.filter((s) => {
    if (s.tingkat && s.tingkat !== guruJenjang) return false;
    if (s.statusReview !== activeTab) return false;
    if (filterMapel !== "SEMUA" && s.mataPelajaran !== filterMapel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPertanyaan = s.pertanyaan.toLowerCase().includes(q);
      const matchTopik = s.topik.toLowerCase().includes(q);
      const matchMapel = s.mataPelajaran.toLowerCase().includes(q);
      if (!matchPertanyaan && !matchTopik && !matchMapel) return false;
    }
    return true;
  });

  // Group filtered questions by subject for structured visual separation
  const groupedByMapel = filteredList.reduce<Record<string, SoalReview[]>>((acc, soal) => {
    const mapel = soal.mataPelajaran || "Lainnya";
    if (!acc[mapel]) acc[mapel] = [];
    acc[mapel].push(soal);
    return acc;
  }, {});

  const pendingCount = soalList.filter((s) => s.statusReview === "MENUNGGU" && (!s.tingkat || s.tingkat === guruJenjang)).length;
  const approvedCount = soalList.filter((s) => s.statusReview === "DISETUJUI" && (!s.tingkat || s.tingkat === guruJenjang)).length;
  const rejectedCount = soalList.filter((s) => s.statusReview === "DITOLAK" && (!s.tingkat || s.tingkat === guruJenjang)).length;

  return (
    <div className="min-h-screen bg-transparent text-slate-800 p-4 sm:p-6 md:p-10 relative">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#84A282] text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border border-[#739071] animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/guru"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#84A282] transition px-3.5 py-2 rounded-xl bg-white border border-[#B8CFB3] shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor Guru</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/evaluasi"
              className="text-xs font-bold text-[#60795e] hover:text-[#4e634d] bg-[#F6E2E9] border border-[#B8CFB3] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lihat Rapor Evaluasi Siswa</span>
            </Link>

            <button
              onClick={resetBankSoal}
              className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-[#B8CFB3] px-3 py-2 rounded-xl transition shadow-sm"
              title="Reset data review ke kondisi awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#84A282] via-[#739071] to-[#60795e] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black">
              Review Soal AI & Manajemen Bank Soal
            </h1>

            <p className="text-[#FEFAF3]/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Sesuai spesifikasi PRD SoalKu: Seluruh butir soal yang diekstraksi secara otomatis oleh model AI dari modul PDF wajib dikurasi oleh pendidik profesional sebelum dapat diakses oleh siswa SD & SMP pada sesi latihan.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md">
                <span className="text-2xl font-black text-[#F6E2E9] block">{pendingCount}</span>
                <span className="text-[11px] text-[#FEFAF3]/80 font-medium">Menunggu Review</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md">
                <span className="text-2xl font-black text-white block">{approvedCount}</span>
                <span className="text-[11px] text-[#FEFAF3]/80 font-medium">Disetujui Masuk Bank</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md">
                <span className="text-2xl font-black text-[#F6E2E9] block">{rejectedCount}</span>
                <span className="text-[11px] text-[#FEFAF3]/80 font-medium">Ditolak / Diperbaiki</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md">
                <span className="text-2xl font-black text-white block">{soalList.length}</span>
                <span className="text-[11px] text-[#FEFAF3]/80 font-medium">Total Soal Terdata</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Tab Bar & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#B8CFB3] p-2.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 p-1 bg-[#FEFAF3] rounded-xl border border-[#B8CFB3]">
            <button
              onClick={() => setActiveTab("MENUNGGU")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "MENUNGGU"
                  ? "bg-[#84A282] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("DISETUJUI")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "DISETUJUI"
                  ? "bg-[#60795e] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Disetujui ({approvedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("DITOLAK")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "DITOLAK"
                  ? "bg-rose-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Ditolak ({rejectedCount})</span>
            </button>
          </div>

          {activeTab === "MENUNGGU" && pendingCount > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-[#84A282] hover:bg-[#739071] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              <span>Setujui Semua Soal Menunggu ({pendingCount})</span>
            </button>
          )}
        </div>

        {/* 3. Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik, pertanyaan, atau mata pelajaran..."
            className="w-full bg-white border border-[#B8CFB3] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#84A282] transition shadow-sm"
          />
        </div>

        {/* 4. Kategori Mata Pelajaran Bar (Pemisah Mata Pelajaran) */}
        <div className="bg-white border border-[#B8CFB3] rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#84A282]" />
              <span>Kategori Mata Pelajaran:</span>
            </span>
            {filterMapel !== "SEMUA" && (
              <button
                onClick={() => setFilterMapel("SEMUA")}
                className="text-xs font-bold text-[#84A282] hover:underline self-start sm:self-auto"
              >
                Tampilkan Semua Mata Pelajaran
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <button
              onClick={() => setFilterMapel("SEMUA")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                filterMapel === "SEMUA"
                  ? "bg-[#84A282] text-white border-[#739071] shadow-sm"
                  : "bg-[#FEFAF3] text-slate-700 border-[#B8CFB3] hover:bg-[#F6E2E9]/60"
              }`}
            >
              <span>Semua Pelajaran</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  filterMapel === "SEMUA"
                    ? "bg-white/25 text-white"
                    : "bg-[#B8CFB3]/40 text-[#60795e]"
                }`}
              >
                {soalList.filter((s) => s.statusReview === activeTab).length}
              </span>
            </button>

            {availableMapelList.map((mapel) => {
              const countInTab = soalList.filter(
                (s) => s.mataPelajaran === mapel && s.statusReview === activeTab
              ).length;
              return (
                <button
                  key={mapel}
                  onClick={() => setFilterMapel(mapel)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                    filterMapel === mapel
                      ? "bg-[#84A282] text-white border-[#739071] shadow-sm"
                      : "bg-[#FEFAF3] text-slate-700 border-[#B8CFB3] hover:bg-[#F6E2E9]/60"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{mapel}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      filterMapel === mapel
                        ? "bg-white/25 text-white"
                        : "bg-[#B8CFB3]/40 text-[#60795e]"
                    }`}
                  >
                    {countInTab}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Question Cards Grouped by Subject Category */}
        <div className="space-y-6">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#B8CFB3] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#B8CFB3]/30 text-[#60795e] flex items-center justify-center mx-auto border border-[#B8CFB3]">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Tidak ada butir soal ditemukan</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === "MENUNGGU"
                  ? "Semua butir soal AI telah ditinjau dan dikurasi!"
                  : `Tidak ada soal pada status ${activeTab.toLowerCase()} untuk kriteria pencarian ini.`}
              </p>
            </div>
          ) : (
            Object.entries(groupedByMapel).map(([mapelName, items]) => (
              <div key={mapelName} className="space-y-3.5">
                {/* Subject Category Header Separator */}
                <div className="flex items-center justify-between bg-gradient-to-r from-[#FEFAF3] via-white to-[#FEFAF3] border border-[#B8CFB3] px-4 py-2.5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#84A282]/20 text-[#60795e] flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        Kategori: {mapelName}
                      </h3>
                      <span className="text-[10px] text-slate-500">
                        Memisahkan butir soal mata pelajaran {mapelName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#60795e] bg-white border border-[#B8CFB3] px-3 py-1 rounded-full shadow-sm">
                    {items.length} Butir Soal
                  </span>
                </div>

                {/* Question Cards in this Subject Category */}
                <div className="space-y-4">
                  {items.map((soal) => {
                    const kunciOpsi = soal.opsi.find((o) => o.isBenar);

                    return (
                      <div
                        key={soal.id}
                        className={`p-6 rounded-3xl border transition shadow-sm space-y-4 bg-white ${
                          soal.statusReview === "MENUNGGU"
                            ? "border-[#B8CFB3] hover:border-[#84A282]"
                            : soal.statusReview === "DISETUJUI"
                            ? "border-[#84A282]/60"
                            : "border-rose-300"
                        }`}
                      >
                        {/* Card Header Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#B8CFB3]/60 pb-3.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-[#B8CFB3]/30 border border-[#B8CFB3] text-[#60795e] font-bold text-xs flex items-center justify-center">
                              #{soal.id}
                            </span>

                            <span className="text-xs font-semibold text-slate-700">
                              {soal.mataPelajaran} • {soal.topik}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                soal.tingkatKesulitan === "MUDAH"
                                  ? "bg-[#FEFAF3] border-[#B8CFB3] text-[#60795e]"
                                  : soal.tingkatKesulitan === "SEDANG"
                                  ? "bg-[#B8CFB3]/40 border-[#B8CFB3] text-[#60795e]"
                                  : "bg-rose-100 border-rose-300 text-rose-800"
                              }`}
                            >
                              {soal.tingkatKesulitan}
                            </span>

                            <span className="text-[10.5px] font-bold text-[#60795e] bg-[#FEFAF3] border border-[#B8CFB3] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span>AI {soal.aiConfidence}%</span>
                            </span>
                          </div>
                        </div>

                        {/* Pertanyaan */}
                        <div>
                          <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                            {soal.pertanyaan}
                          </p>
                        </div>

                        {/* Opsi Jawaban Grid */}
                        <div className="grid sm:grid-cols-2 gap-2 text-xs">
                          {soal.opsi.map((op, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-2xl border flex items-start gap-2.5 transition ${
                                op.isBenar
                                  ? "bg-[#B8CFB3]/25 border-[#84A282] text-[#60795e] font-semibold"
                                  : "bg-[#FEFAF3] border-[#B8CFB3] text-slate-700"
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                                  op.isBenar
                                    ? "bg-[#84A282] text-white"
                                    : "bg-white border border-[#B8CFB3] text-slate-700"
                                }`}
                              >
                                {op.label}
                              </span>
                              <div className="flex-1">
                                <span>{op.teks}</span>
                                {op.isBenar && (
                                  <span className="block text-[10px] font-bold text-[#60795e] mt-0.5 uppercase tracking-wider">
                                    Kunci Jawaban Benar
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pembahasan & Tips */}
                        <div className="p-3.5 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] text-xs space-y-1.5 shadow-sm">
                          <div className="flex items-center gap-1.5 text-[#60795e] font-bold">
                            <Lightbulb className="w-4 h-4 text-[#84A282]" />
                            <span>Pembahasan AI:</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed text-[11.5px]">{soal.pembahasan}</p>

                          {soal.tipsAdaptif && (
                            <div className="pt-1.5 text-[#84A282] font-semibold text-[11px] flex items-start gap-1.5">
                              <span className="font-bold">Tips Rumus Cepat:</span>
                              <span>{soal.tipsAdaptif}</span>
                            </div>
                          )}
                        </div>

                        {/* Rejection Note (jika status DITOLAK) */}
                        {soal.statusReview === "DITOLAK" && (
                          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block">Alasan Penolakan Kurator:</span>
                              <p className="text-[11.5px] text-rose-700">{soal.catatanReviewer}</p>
                            </div>
                          </div>
                        )}

                        {/* Reviewer Note (jika disetujui) */}
                        {soal.statusReview === "DISETUJUI" && (
                          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                            <span className="flex items-center gap-1.5 text-[#60795e] font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-[#84A282]" />
                              <span>Disetujui oleh: {soal.reviewer || "Kurator Mentor"}</span>
                            </span>
                            <span className="text-[11px] text-slate-500">Tersedia di Bank Soal Siswa</span>
                          </div>
                        )}

                        {/* Card Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#B8CFB3]/60">
                          <button
                            onClick={() => setEditTargetSoal(soal)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FEFAF3] hover:bg-[#F6E2E9] text-slate-700 border border-[#B8CFB3] flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#60795e]" />
                            <span>Edit Soal</span>
                          </button>

                          {soal.statusReview === "MENUNGGU" && (
                            <>
                              <button
                                onClick={() => setRejectTargetSoal(soal)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F6E2E9] hover:bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 transition shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Tolak Soal</span>
                              </button>

                              <button
                                onClick={() => handleApprove(soal.id)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84A282] hover:bg-[#739071] text-white flex items-center gap-1.5 shadow-sm transition"
                              >
                                <Check className="w-4 h-4" />
                                <span>Setujui Masuk Bank Soal</span>
                              </button>
                            </>
                          )}

                          {soal.statusReview === "DITOLAK" && (
                            <button
                              onClick={() => handleApprove(soal.id)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84A282] hover:bg-[#739071] text-white flex items-center gap-1.5 shadow-sm transition"
                            >
                              <Check className="w-4 h-4" />
                              <span>Tinjau Ulang & Setujui</span>
                            </button>
                          )}

                          {soal.statusReview === "DISETUJUI" && (
                            <button
                              onClick={() => setRejectTargetSoal(soal)}
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-[#B8CFB3] hover:border-rose-300 flex items-center gap-1.5 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Batalkan Persetujuan</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <EditQuestionModal
        soal={editTargetSoal}
        isOpen={!!editTargetSoal}
        onClose={() => setEditTargetSoal(null)}
        onSave={(soalId, updated) => {
          editSoal(soalId, updated);
          setEditTargetSoal(null);
          showNotification("Perubahan butir soal berhasil disimpan!");
        }}
      />

      <RejectReasonModal
        soal={rejectTargetSoal}
        isOpen={!!rejectTargetSoal}
        onClose={() => setRejectTargetSoal(null)}
        onConfirmReject={handleRejectConfirm}
      />
    </div>
  );
};

export default MentorReviewPage;
