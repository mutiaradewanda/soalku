export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const TOKEN_KEY = "soalku_access_token";
const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage errors in private browsing
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If unauthorized, clean up token (except when attempting login)
    if (response.status === 401 && !endpoint.includes("/api/auth/login")) {
      clearToken();
    }

    let data: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      const errorMsg =
        data?.message ||
        data?.error ||
        `Permintaan gagal dengan status ${response.status} (${response.statusText})`;
      throw new ApiError(errorMsg, response.status, data?.code || data?.error, data);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === "AbortError") {
      throw new ApiError("Koneksi ke server timeout (melebihi 15 detik)", 408, "TIMEOUT");
    }
    throw new ApiError(err.message || "Gagal menghubungi server", 0, "NETWORK_ERROR");
  }
}
