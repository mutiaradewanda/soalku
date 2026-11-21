import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Sparkles,
  School,
  BookOpen,
  GraduationCap,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ArrowLeft,
  Phone,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthMode, UserRole } from "../types/auth";
import { RoleSelectionModal } from "./RoleSelectionModal";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, getDashboardRoute } = useAuth();

  const roleParam = searchParams.get("role") as UserRole | null;
  const modeParam = searchParams.get("mode") as AuthMode | null;

  const validRole = roleParam && ["sd", "smp", "guru"].includes(roleParam) ? roleParam : "sd";
  const [role, setRole] = useState<UserRole>(validRole);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(!roleParam);
  const [mode, setMode] = useState<AuthMode>(initialMode || (modeParam === "register" ? "register" : "login"));
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (roleParam && ["sd", "smp", "guru"].includes(roleParam)) {
      setRole(roleParam);
      setShowRoleModal(false);
    }
  }, [roleParam]);

  // Form Fields State
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    // SD
    sdName: "",
    sdNisn: "",
    sdGrade: "Kelas 4 SD",
    sdParentName: "",
    // SMP
    smpName: "",
    smpNisn: "",
    smpGrade: "Kelas 8 SMP",
    smpContact: "",
    // Guru
    guruNameWithTitle: "",
    guruNip: "",
    guruSubject: "",
    guruEmail: "",
    guruJenjang: "SMP" as "SD" | "SMP",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  const themeConfig = {
    sd: {
      headerBg: "bg-gradient-to-r from-[#B8CFB3] via-[#84A282] to-[#739071]",
      accentButton: "bg-[#84A282] hover:bg-[#739071] text-white shadow-[#84A282]/25",
      activeTab: "bg-[#84A282] text-white shadow-md shadow-[#84A282]/30",
      focusRing: "focus:ring-[#84A282]",
      badge: "Siswa SD (Kelas 1 - 6)",
      icon: <School className="w-5 h-5 text-[#FEFAF3]" />,
      subtext: "Portal Belajar Ceria & Latihan Adaptif",
    },
    smp: {
      headerBg: "bg-gradient-to-r from-[#739071] via-[#84A282] to-[#60795e]",
      accentButton: "bg-[#84A282] hover:bg-[#739071] text-white shadow-[#84A282]/25",
      activeTab: "bg-[#84A282] text-white shadow-md shadow-[#84A282]/30",
      focusRing: "focus:ring-[#84A282]",
      badge: "Siswa SMP (Kelas 7 - 9)",
      icon: <BookOpen className="w-5 h-5 text-[#FEFAF3]" />,
      subtext: "Portal Belajar & Latihan CBT Adaptif Terukur",
    },
    guru: {
      headerBg: "bg-gradient-to-r from-[#60795e] via-[#4e634d] to-[#3d4e3c]",
      accentButton: "bg-[#84A282] hover:bg-[#739071] text-white shadow-[#84A282]/25",
      activeTab: "bg-[#60795e] text-white shadow-md shadow-[#60795e]/30",
      focusRing: "focus:ring-[#84A282]",
      badge: "Pendidik & Pengajar",
      icon: <GraduationCap className="w-5 h-5 text-[#B8CFB3]" />,
      subtext: "Portal Manajemen Bank Soal & Evaluasi Pengajar",
    },
  }[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (form.password.length < 8) {
        throw new Error("Kata sandi minimal 8 karakter.");
      }

      if (mode === "login") {
        if (!form.identifier.trim() || !form.password) {
          throw new Error("Lengkapi kredensial akun dan kata sandi.");
        }
        const loggedUser = await login({
          role,
          identifier: form.identifier,
          password: form.password,
          jenjang: role === "guru" ? form.guruJenjang : undefined,
        });
        navigate(getDashboardRoute(loggedUser.role));
      } else {
        // Mode Register Dinamis
        if (role === "sd") {
          if (!form.sdName.trim() || !form.sdNisn.trim() || !form.sdParentName.trim() || !form.password) {
            throw new Error("Nama lengkap, NISN/ID, Kelas, dan Nama Orang Tua wajib diisi.");
          }
          const newUser = await register({
            role: "sd",
            fullName: form.sdName,
            nisn: form.sdNisn,
            grade: form.sdGrade,
            parentName: form.sdParentName,
            password: form.password,
          });
          navigate(getDashboardRoute(newUser.role));
        } else if (role === "smp") {
          if (!form.smpName.trim() || !form.smpNisn.trim() || !form.smpContact.trim() || !form.password) {
            throw new Error("Nama lengkap, NISN, Kelas, dan Email/No HP wajib diisi.");
          }
          const newUser = await register({
            role: "smp",
            fullName: form.smpName,
            nisn: form.smpNisn,
            grade: form.smpGrade,
            contact: form.smpContact,
            password: form.password,
          });
          navigate(getDashboardRoute(newUser.role));
        } else {
          if (
            !form.guruNameWithTitle.trim() ||
            !form.guruNip.trim() ||
            !form.guruSubject.trim() ||
            !form.guruEmail.trim() ||
            !form.password
          ) {
            throw new Error("Nama beserta gelar, NIP/NUPTK, Mata Pelajaran, dan Email wajib diisi.");
          }
          const newUser = await register({
            role: "guru",
            fullNameWithTitle: form.guruNameWithTitle,
            nipOrNuptk: form.guruNip,
            subject: form.guruSubject,
            email: form.guruEmail,
            jenjang: form.guruJenjang,
            password: form.password,
          });
          navigate(getDashboardRoute(newUser.role));
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses autentikasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FEFAF3] relative py-10">
      {/* Back to Home Link */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-start text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#84A282] transition font-medium px-3 py-1.5 rounded-lg bg-white border border-[#B8CFB3]/60 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Modal Awal Pemilihan Role */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onSelectRole={(selected) => {
          setRole(selected);
          setShowRoleModal(false);
          setErrorMessage(null);
        }}
        onClose={() => setShowRoleModal(false)}
      />

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col transition-all">
        {/* Header Kartu */}
        <div className={`${themeConfig.headerBg} p-7 text-white text-center relative overflow-hidden transition-all duration-300`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
                {themeConfig.icon}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRoleModal(true)}
              className="text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-xl transition"
            >
              ← Ganti Portal
            </button>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">SoalKu</h2>
          <p className="mt-1 text-xs text-white/90 max-w-sm mx-auto">{themeConfig.subtext}</p>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          {/* Notifikasi Error */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 2 & 3. Form Input */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "login" ? (
              /* LOGIN */
              <>
                {role === "guru" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Jenjang Guru</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, guruJenjang: "SD" }))}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                          form.guruJenjang === "SD"
                            ? "bg-[#84A282] text-white border-[#739071] shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Guru SD (Kelas 1-6)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, guruJenjang: "SMP" }))}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                          form.guruJenjang === "SMP"
                            ? "bg-[#84A282] text-white border-[#739071] shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Guru SMP (Kelas 7-9)
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {role === "sd"
                      ? "NISN / ID Siswa SD"
                      : role === "smp"
                      ? "Email Siswa / NISN SMP"
                      : "Email Resmi Guru / NIP / NUPTK"}
                  </label>
                  <div className="relative">
                    {role === "guru" ? (
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    ) : (
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    )}
                    <input
                      type="text"
                      name="identifier"
                      value={form.identifier}
                      onChange={handleInputChange}
                      placeholder={
                        role === "sd"
                          ? "Contoh: 0012345678"
                          : role === "smp"
                          ? "nama@sekolah.sch.id atau 10 digit NISN"
                          : "nama.guru@sekolah.sch.id atau NIP"
                      }
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      placeholder="Masukkan kata sandi akun"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* REGISTER DINAMIS PER ROLE */
              <>
                {/* FIELD SISWA SD */}
                {role === "sd" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap Siswa</label>
                      <input
                        type="text"
                        name="sdName"
                        value={form.sdName}
                        onChange={handleInputChange}
                        placeholder="Contoh: Aditya Bintang Pratama"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">NISN / ID Siswa</label>
                        <input
                          type="text"
                          name="sdNisn"
                          value={form.sdNisn}
                          onChange={handleInputChange}
                          placeholder="0012345678"
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Kelas (1 - 6)</label>
                        <select
                          name="sdGrade"
                          value={form.sdGrade}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        >
                          {[1, 2, 3, 4, 5, 6].map((k) => (
                            <option key={k} value={`Kelas ${k} SD`}>
                              Kelas {k} SD
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                      <input
                        type="text"
                        name="sdParentName"
                        value={form.sdParentName}
                        onChange={handleInputChange}
                        placeholder="Nama lengkap ayah / ibu / wali"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                      />
                    </div>
                  </>
                )}

                {/* FIELD SISWA SMP */}
                {role === "smp" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap Siswa</label>
                      <input
                        type="text"
                        name="smpName"
                        value={form.smpName}
                        onChange={handleInputChange}
                        placeholder="Contoh: Arya Pratama Putra"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">NISN Siswa</label>
                        <input
                          type="text"
                          name="smpNisn"
                          value={form.smpNisn}
                          onChange={handleInputChange}
                          placeholder="10 digit NISN"
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Kelas (7 - 9)</label>
                        <select
                          name="smpGrade"
                          value={form.smpGrade}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        >
                          <option value="Kelas 7 SMP">Kelas 7 SMP</option>
                          <option value="Kelas 8 SMP">Kelas 8 SMP</option>
                          <option value="Kelas 9 SMP">Kelas 9 SMP</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email / No. HP Aktif</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="smpContact"
                          value={form.smpContact}
                          onChange={handleInputChange}
                          placeholder="email@sekolah.sch.id atau 0812xxxx"
                          className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* FIELD GURU */}
                {role === "guru" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        name="guruNameWithTitle"
                        value={form.guruNameWithTitle}
                        onChange={handleInputChange}
                        placeholder="Contoh: Dra. Ratna Kumalasari, M.Pd."
                        className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Jenjang Guru</label>
                        <select
                          name="guruJenjang"
                          value={form.guruJenjang}
                          onChange={handleInputChange}
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        >
                          <option value="SD">Guru SD (Sekolah Dasar)</option>
                          <option value="SMP">Guru SMP (Sekolah Menengah)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Mata Pelajaran</label>
                        <input
                          type="text"
                          name="guruSubject"
                          value={form.guruSubject}
                          onChange={handleInputChange}
                          placeholder={form.guruJenjang === "SD" ? "Contoh: Guru Kelas / IPAS" : "Contoh: IPA Terpadu"}
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">NIP / NUPTK</label>
                        <input
                          type="text"
                          name="guruNip"
                          value={form.guruNip}
                          onChange={handleInputChange}
                          placeholder="Nomor NIP / NUPTK"
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Email Resmi Sekolah</label>
                        <input
                          type="email"
                          name="guruEmail"
                          value={form.guruEmail}
                          onChange={handleInputChange}
                          placeholder="nama.guru@sekolah.sch.id"
                          className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Minimal 8 karakter"
                    minLength={8}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 ${themeConfig.focusRing}`}
                  />
                </div>
              </>
            )}

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${themeConfig.accentButton} disabled:opacity-60`}
            >
              <span>
                {isSubmitting
                  ? "Memproses..."
                  : mode === "login"
                  ? `Masuk Sebagai ${role === "sd" ? "Siswa SD" : role === "smp" ? "Siswa SMP" : "Guru"}`
                  : `Daftar Akun ${role === "sd" ? "Siswa SD" : role === "smp" ? "Siswa SMP" : `Guru ${form.guruJenjang}`}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Switch Mode */}
          <div className="pt-2 border-t border-slate-100 text-center">
            {mode === "login" ? (
              <p className="text-xs text-slate-500">
                Belum punya akun {role.toUpperCase()}?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#60795e] hover:text-[#4e634d] hover:underline ml-1"
                >
                  Daftar sekarang
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#60795e] hover:text-[#4e634d] hover:underline ml-1"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
