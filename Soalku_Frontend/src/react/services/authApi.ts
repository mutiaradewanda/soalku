import { apiFetch, setToken, clearToken } from "./apiClient";

export interface BackendLoginRequest {
  email: string;
  password: string;
}

export interface BackendRegisterRequest {
  nama: string;
  email: string;
  password: string;
  role: "SISWA" | "MENTOR";
  kodeUndangan?: string;
}

export interface BackendTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface BackendUserResponse {
  id: number;
  nama: string;
  email: string;
  role: "SISWA" | "MENTOR";
}

export const authApi = {
  async login(email: string, password: string): Promise<BackendTokenResponse> {
    const res = await apiFetch<BackendTokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.accessToken);
    return res;
  },

  async register(payload: BackendRegisterRequest): Promise<BackendUserResponse> {
    return apiFetch<BackendUserResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async me(): Promise<BackendUserResponse> {
    return apiFetch<BackendUserResponse>("/api/auth/me", {
      method: "GET",
    });
  },

  logout(): void {
    clearToken();
  },
};
