import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, LoginPayload, RegisterPayload, UserRole } from "../types/auth";
import { authApi } from "../services/authApi";
import { ApiError, clearToken, getToken, setToken } from "../services/apiClient";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
  getDashboardRoute: (role: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "soalku_registered_users";

const saveRegisteredProfile = (identifier: string, user: AuthUser) => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[identifier.toLowerCase().trim()] = user;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors
  }
};

const getRegisteredProfile = (identifier: string): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[identifier.toLowerCase().trim()] || null;
  } catch {
    return null;
  }
};

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

  // Sync session with backend /api/auth/me if token exists
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me().then((me) => {
        if (me?.nama) {
          setUser((prev) => (prev ? { ...prev, name: me.nama } : null));
        }
      }).catch(() => {
        clearToken();
      });
    }
  }, []);

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
    let email = payload.identifier.trim();
    if (!email.includes("@")) {
      email = `${email}@${payload.role === "guru" ? "guru" : "siswa"}.soalku.id`;
    }

    let token = "";
    try {
      const tokenRes = await authApi.login(email, payload.password);
      token = tokenRes.accessToken;
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        throw new Error("Kredensial atau kata sandi tidak sesuai.");
      }
      console.warn("Backend auth notice, proceeding with local fallback session:", err);
    }

    const base = {
      id: "usr_" + Date.now(),
      token: token || "jwt_token_" + Math.random().toString(36).substring(2),
    };

    const savedProfile =
      getRegisteredProfile(payload.identifier) || getRegisteredProfile(email);

    let loggedInUser: AuthUser;
    if (savedProfile) {
      loggedInUser = {
        ...savedProfile,
        ...base,
      };
    } else if (payload.role === "sd") {
      const derivedName = payload.identifier.includes("@")
        ? payload.identifier.split("@")[0]
        : `Siswa SD (${payload.identifier})`;
      loggedInUser = {
        ...base,
        role: "sd",
        name: derivedName,
        nisn: payload.identifier,
        grade: "Kelas 4 SD",
        parentName: "-",
      };
    } else if (payload.role === "smp") {
      const derivedName = payload.identifier.includes("@")
        ? payload.identifier.split("@")[0]
        : `Siswa SMP (${payload.identifier})`;
      loggedInUser = {
        ...base,
        role: "smp",
        name: derivedName,
        nisn: payload.identifier,
        grade: "Kelas 8 SMP",
        contact: payload.identifier,
      };
    } else {
      const derivedName = payload.identifier.includes("@")
        ? payload.identifier.split("@")[0]
        : `Guru (${payload.identifier})`;
      loggedInUser = {
        ...base,
        role: "guru",
        name: derivedName,
        nuptkOrNip: payload.identifier,
        subject: "Guru Pembimbing",
        email: payload.identifier.includes("@") ? payload.identifier : `${payload.identifier}@sekolah.sch.id`,
      };
    }

    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    let email = "";
    let name = "";
    let backendRole: "SISWA" | "MENTOR" = "SISWA";

    if (payload.role === "sd") {
      name = payload.fullName;
      email = `${payload.nisn}@siswa.soalku.id`;
      backendRole = "SISWA";
    } else if (payload.role === "smp") {
      name = payload.fullName;
      email = payload.contact.includes("@") ? payload.contact : `${payload.nisn}@siswa.soalku.id`;
      backendRole = "SISWA";
    } else {
      name = payload.fullNameWithTitle;
      email = payload.email;
      backendRole = "MENTOR";
    }

    let token = "";
    try {
      await authApi.register({
        nama: name,
        email,
        password: payload.password,
        role: backendRole,
      });
      const tokenRes = await authApi.login(email, payload.password);
      token = tokenRes.accessToken;
      setToken(token);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        throw new Error("Akun dengan email / NISN ini sudah terdaftar.");
      }
      console.warn("Backend register notice, proceeding with local fallback session:", err);
    }

    const base = {
      id: "usr_" + Date.now(),
      token: token || "jwt_token_" + Math.random().toString(36).substring(2),
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
      saveRegisteredProfile(email, newUser);
      saveRegisteredProfile(payload.nisn, newUser);
    } else if (payload.role === "smp") {
      newUser = {
        ...base,
        role: "smp",
        name: payload.fullName,
        nisn: payload.nisn,
        grade: payload.grade,
        contact: payload.contact,
      };
      saveRegisteredProfile(email, newUser);
      saveRegisteredProfile(payload.nisn, newUser);
    } else {
      newUser = {
        ...base,
        role: "guru",
        name: payload.fullNameWithTitle,
        nuptkOrNip: payload.nipOrNuptk,
        subject: payload.subject,
        email: payload.email,
      };
      saveRegisteredProfile(email, newUser);
      saveRegisteredProfile(payload.nipOrNuptk, newUser);
    }

    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    authApi.logout();
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
