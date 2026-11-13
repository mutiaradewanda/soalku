import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DragonMascot } from "../components/DragonMascot";

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, getDashboardRoute } = useAuth();

  return (
    <div className="min-h-screen bg-transparent text-slate-800 selection:bg-[#B8CFB3] selection:text-slate-900">
      {/* Navigation Bar */}
      <header className="relative z-20 border-b border-[#B8CFB3] border-b-2 border-b-[#84A282]/30 bg-[#FEFAF3]/95 backdrop-blur-md sticky top-0 shadow-lg shadow-black/8">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Soal<span className="text-[#84A282]">Ku</span>
            </span>
            <DragonMascot
              variant="logo"
              className="w-8 h-8 group-hover:scale-110 transition-transform"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-medium">
            <a href="#portal" className="hover:text-[#84A282] transition-colors">
              Portal
            </a>
            <a href="#fitur" className="hover:text-[#84A282] transition-colors">
              Fitur
            </a>
            <a href="#keunggulan" className="hover:text-[#84A282] transition-colors">
              Keunggulan
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <Link
                to={getDashboardRoute(user.role)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-sm font-semibold transition-colors border-b-2 border-b-[#60795e] shadow-md shadow-[#84A282]/30 active:translate-y-0.5"
              >
                <span>Dashboard ({user.name.split(" ")[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-slate-700 hover:text-[#84A282] font-semibold transition-colors rounded-xl bg-white/70 hover:bg-[#F6E2E9]/40 shadow-sm border border-[#B8CFB3]/40 border-b-2 border-b-[#B8CFB3] active:translate-y-0.5"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold rounded-xl bg-[#84A282] hover:bg-[#739071] text-white transition-colors border-b-2 border-b-[#60795e] shadow-md shadow-[#84A282]/30 active:translate-y-0.5"
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.15] text-slate-900">
                Kuasai Materi Sulit dengan{" "}
                <span className="text-[#84A282]">
                  Latihan Adaptif Cerdas
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                SoalKu secara otomatis mendeteksi topik kelemahan belajar siswa SD
                dan SMP, menyajikan soal berjenjang presisi, serta membantu guru
                membuat bank soal instan melalui kecerdasan buatan.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/register"
                  className="px-7 py-3.5 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-colors shadow-sm"
                >
                  <span>Mulai Latihan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl border border-[#B8CFB3] bg-white hover:bg-[#FEFAF3] text-slate-700 hover:text-slate-900 text-sm font-bold text-center transition-colors shadow-sm"
                >
                  Masuk Akun Demo
                </Link>
              </div>

              {/* 3 Metric Stats */}
              <div className="mt-12 pt-6 border-t border-[#B8CFB3]/50 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <p className="text-2xl font-black text-slate-900">82%</p>
                  <p className="mt-0.5 text-xs text-slate-500 font-semibold">Akurasi Rata-rata</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">10.000+</p>
                  <p className="mt-0.5 text-xs text-slate-500 font-semibold">Bank Soal</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">3 Mode</p>
                  <p className="mt-0.5 text-xs text-slate-500 font-semibold">Acak, Timer, Kelemahan</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive AI Mockup & Mascot */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              {/* Background Doodles */}
              <div className="absolute -top-6 -right-4 text-[#84A282]/20 font-serif text-3xl select-none pointer-events-none">
                x + y
              </div>

              <div className="relative space-y-4">
                {/* 1. Preview Soal Mode Adaptif AI Card */}
                <div className="bg-white border border-[#B8CFB3] rounded-3xl p-5 sm:p-6 shadow-md relative z-10 max-w-md">
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      Berapa hasil dari 3/4 + 1/2?
                    </p>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 bg-[#FEFAF3]">
                        A. 4/6
                      </div>
                      <div className="p-2.5 rounded-xl border border-[#84A282] bg-[#84A282] text-white font-bold text-xs flex items-center justify-between shadow-sm relative">
                        <span>B. 1 1/4 (Satu seperempat)</span>
                        <span className="w-5 h-5 rounded-full bg-white text-[#84A282] flex items-center justify-center text-xs font-black">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                        {/* Cursor Hand pointer */}
                        <div className="absolute -bottom-3 -right-2 text-slate-900 drop-shadow-md">
                          <svg className="w-6 h-6 fill-slate-900 stroke-white stroke-2" viewBox="0 0 24 24">
                            <path d="M4 4l7 17 2.5-6.5L20 12 4 4z" />
                          </svg>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 bg-[#FEFAF3]">
                        C. 3/8
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Level Up Card (Overlapping Top Right) */}
                <div className="absolute -top-5 -right-3 sm:-right-6 bg-white border border-[#B8CFB3] rounded-2xl p-3 shadow-lg z-20 min-w-[140px] text-center space-y-1">
                  <span className="text-xs font-black text-[#84A282] block">+10 XP</span>
                  <p className="text-[10px] font-bold text-slate-800 leading-tight">
                    Tingkat Kesulitan Naik!
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">(Sedang → Sulit)</p>
                  <div className="w-full bg-[#FEFAF3] rounded-full h-1.5 overflow-hidden border border-[#B8CFB3]/60 mt-1">
                    <div className="bg-[#84A282] h-1.5 rounded-full w-3/4"></div>
                  </div>
                </div>

                {/* 2. Dashboard SoalKu Card with Dragon Mascots */}
                <div className="relative pt-6">
                  <div className="bg-white border border-[#B8CFB3] rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 relative z-10 max-w-[85%] mx-auto">
                    <div className="flex items-center justify-between border-b border-[#B8CFB3]/40 pb-2">
                      <h4 className="text-xs font-bold text-slate-800">Dashboard SoalKu</h4>
                      <span className="text-[10px] text-[#84A282] font-semibold">Aktif</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="p-3 rounded-2xl bg-[#FEFAF3] border border-[#B8CFB3] text-center space-y-1">
                        <div className="w-10 h-10 mx-auto rounded-full border-4 border-[#84A282] border-t-transparent flex items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-700">82%</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">Rata-rata</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#84A282] text-white text-center space-y-1">
                        <div className="w-8 h-8 mx-auto rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] text-white/90 font-medium block">Tuntas</span>
                      </div>
                    </div>
                  </div>

                  {/* Mascot 1: Baby Dragon hugging pencil on the left */}
                  <div className="absolute -bottom-5 -left-4 sm:-left-8 z-20">
                    <DragonMascot
                      variant="pencil"
                      className="w-24 sm:w-28 drop-shadow-md hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Mascot 2: Baby Dragon standing and waving happily on the right */}
                  <div className="absolute -bottom-6 -right-3 sm:-right-8 z-20">
                    <DragonMascot
                      variant="waving"
                      className="w-28 sm:w-36 drop-shadow-md hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Section */}
      <section id="portal" className="py-24 border-t border-[#B8CFB3]/40 bg-white/50 relative z-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Dirancang untuk Setiap Kebutuhan Belajar
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed font-medium">
              Setiap portal dirancang dengan tampilan dan fitur yang tepat sesuai
              tahapan perkembangan belajar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card SD */}
            <div className="rounded-3xl bg-[#FEFAF3] border border-[#B8CFB3] hover:border-[#84A282] p-8 flex flex-col justify-between transition-colors shadow-sm">
              <div>
                <span className="text-xs font-bold text-[#60795e] uppercase tracking-wider bg-[#F6E2E9] px-2.5 py-1 rounded-full border border-[#B8CFB3]">
                  Kelas 1 – 6
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-3">
                  Portal Siswa SD
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Lingkungan belajar ramah anak, dilengkapi visual gambar materi
                  serta keterlibatan pendampingan orang tua.
                </p>
                <ul className="space-y-2.5 text-sm text-slate-600 mb-8 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    3 Pilihan Opsi Sederhana (A, B, C)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    Pendampingan Data Orang Tua
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    Gamifikasi Bintang &amp; XP
                  </li>
                </ul>
              </div>
              <Link
                to="/login?role=sd"
                className="w-full py-3 rounded-xl border border-[#B8CFB3] bg-white hover:bg-[#F6E2E9] text-slate-800 text-sm text-center font-bold transition-colors shadow-sm"
              >
                Masuk Portal SD
              </Link>
            </div>

            {/* Card SMP */}
            <div className="rounded-3xl bg-white border-2 border-[#84A282] p-8 flex flex-col justify-between transition-colors shadow-md relative">
              <div className="absolute -top-3 left-8 bg-[#84A282] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Populer
              </div>
              <div>
                <span className="text-xs font-bold text-[#60795e] uppercase tracking-wider bg-[#B8CFB3]/40 px-2.5 py-1 rounded-full border border-[#B8CFB3]">
                  Kelas 7 – 9
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-3">
                  Portal Siswa SMP
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Simulasi CBT sesungguhnya dengan 4 opsi pilihan ganda,
                  jembatan keledai AI, dan target fokus kelemahan.
                </p>
                <ul className="space-y-2.5 text-sm text-slate-600 mb-8 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    Latihan Berwaktu &amp; Ragu-ragu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    Jembatan Keledai &amp; Tips Cepat
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    Analisis Akurasi Topik Otomatis
                  </li>
                </ul>
              </div>
              <Link
                to="/login?role=smp"
                className="w-full py-3 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white text-sm text-center font-bold transition-colors shadow-sm"
              >
                Masuk Portal SMP
              </Link>
            </div>

            {/* Card Guru */}
            <div className="rounded-3xl bg-[#FEFAF3] border border-[#B8CFB3] hover:border-[#84A282] p-8 flex flex-col justify-between transition-colors shadow-sm">
              <div>
                <span className="text-xs font-bold text-[#60795e] uppercase tracking-wider bg-[#F6E2E9] px-2.5 py-1 rounded-full border border-[#B8CFB3]">
                  Pendidik &amp; Mentor
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-4 mb-3">
                  Portal Guru
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Kelola bank soal secara efisien, review soal yang di-generate
                  AI otomatis, dan pantau perkembangan siswa.
                </p>
                <ul className="space-y-2.5 text-sm text-slate-600 mb-8 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    Review Antrean Bank Soal
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    Generator Kode Undangan Kelas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#84A282]"></span>
                    Evaluasi Analisis Rapor Siswa
                  </li>
                </ul>
              </div>
              <Link
                to="/login?role=guru"
                className="w-full py-3 rounded-xl border border-[#B8CFB3] bg-white hover:bg-[#F6E2E9] text-slate-800 text-sm text-center font-bold transition-colors shadow-sm"
              >
                Masuk Portal Guru
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className="py-24 border-t border-[#B8CFB3]/40 relative z-10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Kecerdasan Buatan yang Benar-benar Membantu
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed font-medium">
              Mulai dari deteksi kelemahan hingga ekstraksi modul dokumen untuk
              mempermudah belajar mengajar.
            </p>
          </div>

          <div id="keunggulan" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#B8CFB3] hover:border-[#84A282] transition-colors shadow-sm">
              <h4 className="font-bold text-slate-900 text-base mb-3">
                Algoritma Fokus Kelemahan
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Secara adaptif menghitung rasio salah dan menyajikan soal
                penguatan di materi yang paling butuh perbaikan.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#B8CFB3] hover:border-[#84A282] transition-colors shadow-sm">
              <h4 className="font-bold text-slate-900 text-base mb-3">
                Simulasi CBT Responsif
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Navigasi butir nomor cepat, status ragu-ragu, hitung mundur
                timer, serta shortcut keyboard praktis.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#B8CFB3] hover:border-[#84A282] transition-colors shadow-sm">
              <h4 className="font-bold text-slate-900 text-base mb-3">
                Ringkas Dokumen
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload bahan ajar PDF atau DOCX, lalu AI mengekstraksi inti
                materi dan menghasilkan butir soal otomatis.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#B8CFB3] hover:border-[#84A282] transition-colors shadow-sm">
              <h4 className="font-bold text-slate-900 text-base mb-3">
                Rapor Evaluasi Komprehensif
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Grafik akurasi, perbandingan topik remedial, dan histori
                kemajuan belajar yang terstruktur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner with Mascot */}
      <section className="py-20 border-t border-[#B8CFB3]/40 bg-[#F6E2E9]/40 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="max-w-3xl mx-auto bg-white border border-[#B8CFB3] rounded-3xl p-8 sm:p-12 shadow-md relative">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              <div className="w-28 sm:w-36 shrink-0">
                <DragonMascot
                  variant="cheering"
                  className="w-full drop-shadow-sm hover:scale-105 transition-transform"
                />
              </div>

              <div className="space-y-3 text-center sm:text-left flex-1">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Siap Meningkatkan Nilai &amp; Pemahaman Belajarmu?
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Ayo bergabung sekarang bersama maskot naga cerdas SoalKu. Cukup
                  daftar akun baru atau masuk akun demo dalam hitungan detik!
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-6 py-3 bg-[#84A282] hover:bg-[#739071] text-white font-bold rounded-xl text-xs transition-colors shadow-sm text-center"
                  >
                    Daftar Sekarang — Gratis
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-6 py-3 border border-[#B8CFB3] bg-white hover:bg-[#FEFAF3] text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-sm text-center"
                  >
                    Masuk Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#B8CFB3]/40 py-10 text-sm text-slate-600 relative z-10 bg-[#FEFAF3]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DragonMascot variant="logo" className="w-6 h-6" />
            <span className="font-bold text-slate-900">SoalKu</span>
            <span>© 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login?role=sd" className="hover:text-[#84A282] transition-colors">
              Portal SD
            </Link>
            <Link to="/login?role=smp" className="hover:text-[#84A282] transition-colors">
              Portal SMP
            </Link>
            <Link to="/login?role=guru" className="hover:text-[#84A282] transition-colors">
              Portal Guru
            </Link>
            <Link to="/auth" className="hover:text-[#84A282] transition-colors">
              Login / Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
