import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, getDashboardRoute } = useAuth();

  // 1. Jika belum login, tahan di alur login/register dan jangan buka landing page utama
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Jika akun role mencoba akses dashboard role lain, alihkan ke dashboard miliknya
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return <Outlet />;
};
