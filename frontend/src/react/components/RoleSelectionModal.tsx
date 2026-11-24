import React from "react";
import { User, School, BookOpen, GraduationCap, ChevronRight, X } from "lucide-react";
import { UserRole } from "../types/auth";
import { DragonMascot } from "./DragonMascot";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRole) => void;
  onClose?: () => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onSelectRole,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header Modal/Card: Sage Hijau, Avatar, Judul, Tombol Close */}
        <div className="bg-[#60795e] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
              <DragonMascot variant="logo" className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight leading-snug">Portal Akses Masuk</h3>
              <p className="text-xs text-[#FEFAF3]/80">Sistem Autentikasi SoalKu</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition"
              aria-label="Tutup modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body Modal/Card */}
        <div className="p-6 md:p-7 space-y-4 bg-[#FEFAF3]">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Pilih Akses Masuk Portal</h4>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">Silakan pilih jenis portal akun Anda:</p>
          </div>

          {/* List Pilihan Role Vertikal */}
          <div className="space-y-3 pt-1">
            {/* 1. Siswa SD */}
            <button
              type="button"
              onClick={() => onSelectRole("sd")}
              className="w-full p-4 rounded-2xl border border-[#B8CFB3] hover:border-[#84A282] hover:bg-[#F6E2E9]/40 bg-white flex items-center justify-between transition-all group shadow-sm hover:shadow-md cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#F6E2E9] border border-[#B8CFB3] text-[#739071] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-[#84A282] transition-colors">
                    Siswa SD
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#84A282] group-hover:translate-x-1 transition-all" />
            </button>

            {/* 2. Siswa SMP */}
            <button
              type="button"
              onClick={() => onSelectRole("smp")}
              className="w-full p-4 rounded-2xl border border-[#B8CFB3] hover:border-[#84A282] hover:bg-[#B8CFB3]/20 bg-white flex items-center justify-between transition-all group shadow-sm hover:shadow-md cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#B8CFB3]/40 border border-[#B8CFB3] text-[#60795e] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-[#84A282] transition-colors">
                    Siswa SMP
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#84A282] group-hover:translate-x-1 transition-all" />
            </button>

            {/* 3. Guru */}
            <button
              type="button"
              onClick={() => onSelectRole("guru")}
              className="w-full p-4 rounded-2xl border border-[#B8CFB3] hover:border-[#84A282] hover:bg-[#F6E2E9]/40 bg-white flex items-center justify-between transition-all group shadow-sm hover:shadow-md cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#84A282]/20 border border-[#B8CFB3] text-[#60795e] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-[#84A282] transition-colors">
                    Guru
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#84A282] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
