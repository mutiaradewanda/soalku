import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, LayoutDashboard, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const NotFoundPage: React.FC = () => {
  const { user, isAuthenticated, getDashboardRoute } = useAuth();

  return (
    <div className="min-h-screen bg-transparent text-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B8CFB3]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white border border-[#B8CFB3] rounded-3xl p-8 sm:p-10 shadow-xl text-center relative z-10 space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F6E2E9] border border-[#B8CFB3] flex items-center justify-center text-[#60795e]">
          <AlertTriangle className="w-10 h-10 text-[#84A282]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-[#60795e] uppercase px-3 py-1 bg-[#F6E2E9] border border-[#B8CFB3] rounded-full">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Maaf, tautan atau halaman yang Anda tuju mungkin salah ketik, telah dihapus, atau sedang dalam perbaikan.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#FEFAF3] text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-[#B8CFB3] shadow-sm transition"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          {isAuthenticated && user ? (
            <Link
              to={getDashboardRoute(user.role)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Buka Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#84A282] hover:bg-[#739071] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Masuk Portal</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
