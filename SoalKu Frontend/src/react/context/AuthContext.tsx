import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, LoginPayload, RegisterPayload, UserRole } from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
  getDashboardRoute: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("soalku_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("soalku_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("soalku_auth_user");
    }
  }, [user]);

  const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case "sd":
        return "/dashboard/sd";
      case "smp":
        return "/dashboard/smp";
      case "guru":
        return "/dashboard/guru";
    }
  };

  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    // Simulasi delay network
    await new Promise((resolve) => setTimeout(resolve, 300));

    const base = {
      id: "usr_" + Date.now(),
      token: "jwt_token_" + Math.random().toString(36).substring(2),
    };

    let loggedInUser: AuthUser;
    if (payload.role === "sd") {
      loggedInUser = {
        ...base,
        role: "sd",
        name: "Adit Pratama",
        nisn: payload.identifier,
        grade: "Kelas 4 SD",
        parentName: "Bpk. Bambang Pamungkas",
      };
    } else if (payload.role === "smp") {
      loggedInUser = {
        ...base,
        role: "smp",
        name: "Arya Pratama",
        nisn: payload.identifier,
        grade: "Kelas 8 SMP",
        contact: payload.identifier,
      };
    } else {
      loggedInUser = {
        ...base,
        role: "guru",
        name: "Bu Ratna Kumalasari, S.Pd.",
        nuptkOrNip: payload.identifier,
        subject: "IPA Terpadu & Biologi",
        email: payload.identifier.includes("@") ? payload.identifier : "ratna@sekolah.sch.id",
      };
    }

    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const base = {
      id: "usr_" + Date.now(),
      token: "jwt_token_" + Math.random().toString(36).substring(2),
    };

    let newUser: AuthUser;
    if (payload.role === "sd") {
      newUser = {
        ...base,
        role: "sd",
        name: payload.fullName,
        nisn: payload.nisn,
        grade: payload.grade,
        parentName: payload.parentName,
      };
    } else if (payload.role === "smp") {
      newUser = {
        ...base,
        role: "smp",
        name: payload.fullName,
        nisn: payload.nisn,
        grade: payload.grade,
        contact: payload.contact,
      };
    } else {
      newUser = {
        ...base,
        role: "guru",
        name: payload.fullNameWithTitle,
        nuptkOrNip: payload.nipOrNuptk,
        subject: payload.subject,
        email: payload.email,
      };
    }

    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("soalku_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
