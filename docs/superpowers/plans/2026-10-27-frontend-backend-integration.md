# Frontend & Backend Integration (Fase 1: Fondasi API & Autentikasi) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghubungkan frontend React dengan backend Spring Boot untuk autentikasi nyata (Register, Login, JWT, Profil), mengonfigurasi CORS dan Vite proxy, serta memverifikasi seluruh komponen dengan audit dan pengujian terstruktur.

**Architecture:** Menggunakan dual-connectivity (Vite development proxy untuk `/api` dan backend Spring Security CORS configuration) untuk komunikasi tanpa hambatan. Mengimplementasikan modul HTTP client terpusat (`apiClient.ts`) dengan injeksi JWT Bearer otomatis dan error handling terstruktur, mengintegrasikan service autentikasi (`authApi.ts`) dengan `AuthContext`, serta memetakan role frontend (`sd`, `smp`, `guru`) ke role backend (`SISWA`, `MENTOR`).

**Tech Stack:** Java 21, Spring Boot 3, Spring Security 6, PostgreSQL, React 18, Vite, TypeScript, TailwindCSS.

**Spec:** [docs/superpowers/specs/2026-10-27-frontend-backend-integration-design.md](file:///c:/Users/HP%20VICTUS/Downloads/soalku/docs/superpowers/specs/2026-10-27-frontend-backend-integration-design.md)

## Global Constraints

- Backend menggunakan Java 21 dan Spring Boot standard convention (constructor injection, DTOs terpisah dari Entity).
- Keamanan backend: JWT Bearer stateless, CSRF disabled, endpoint publik terbatas pada `/api/auth/register`, `/api/auth/login`, dan `/actuator/health`.
- Format kredensial backend: Password min 8 dan max 72 karakter, email harus valid (`@Email`).
- Frontend menggunakan TypeScript strict mode; `npm run build` (`tsc && vite build`) harus lulus tanpa error.
- Tidak boleh memutus test suite yang ada di backend (`mvn test` pada `backend/web-api` harus tetap 100% lulus).
- Hasil pengujian dan audit harus dilaporkan secara terstruktur dalam bentuk tabel ringkasan.

## Review Focus

1. Browser CORS Preflight (`OPTIONS /api/**`) ditolak atau menghasilkan status 401: Harus diizinkan tanpa autentikasi (`permitAll`) dan mengembalikan header CORS lengkap.
2. Registrasi dengan password < 8 karakter atau email tidak valid: Harus ditolak dengan pesan error yang jelas dan spesifik di UI frontend.
3. Token kedaluwarsa atau invalid pada saat boot aplikasi (`GET /api/auth/me` return 401): Sesi lokal harus dibersihkan secara otomatis tanpa melempar unhandled exception.
4. Input registrasi siswa SD tanpa email eksplisit: Harus ditangani secara deterministik (format `${nisn}@siswa.soalku.id` atau input email) agar validasi `@Email` backend terpenuhi.
5. Pemutusan token/logout: Header Authorization tidak boleh tersisa di storage setelah logout.

---

### Task 1: Konfigurasi CORS pada Backend Spring Security

**Files:**
- Modify: `backend/web-api/src/main/java/id/soalku/auth/SecurityConfiguration.java`
- Create: `backend/web-api/src/test/java/id/soalku/auth/CorsSecurityTest.java`

**Interfaces:**
- Consumes: Spring Security `HttpSecurity`, `CorsConfigurationSource`
- Produces: `CorsConfigurationSource` Bean, header `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`

- [ ] **Step 1: Tulis test pengujian CORS & Preflight**
  Buat `backend/web-api/src/test/java/id/soalku/auth/CorsSecurityTest.java` yang memverifikasi bahwa request `OPTIONS /api/auth/login` dari origin `http://localhost:5173` mengembalikan status 200/OK dengan header `Access-Control-Allow-Origin: http://localhost:5173`.

- [ ] **Step 2: Jalankan test untuk memverifikasi test gagal (CORS belum terkonfigurasi)**
  Jalankan: `mvn test -pl web-api -Dtest=CorsSecurityTest`
  Ekspektasi: FAIL (header CORS belum ada atau status bukan 200).

- [ ] **Step 3: Implementasikan konfigurasi CORS di `SecurityConfiguration.java`**
  - Tambahkan Bean `CorsConfigurationSource corsConfigurationSource()` dengan allowed origins (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`), allowed methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`), allowed headers (`Authorization`, `Content-Type`, `Idempotency-Key`, `X-Requested-With`, `Accept`), dan exposed headers (`Authorization`, `Location`).
  - Tambahkan `http.cors(cors -> cors.configurationSource(corsConfigurationSource()))` dan `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`.

- [ ] **Step 4: Jalankan test untuk memverifikasi test lulus**
  Jalankan: `mvn test -pl web-api -Dtest=CorsSecurityTest`
  Ekspektasi: PASS (CORS headers sesuai).

- [ ] **Step 5: Verifikasi regresi pada `AuthIT`**
  Jalankan: `mvn test -pl web-api -Dtest=AuthIT`
  Ekspektasi: PASS (semua test keamanan dan auth yang ada tetap lulus).

- [ ] **Step 6: Commit**
  ```bash
  git add backend/web-api/src/main/java/id/soalku/auth/SecurityConfiguration.java backend/web-api/src/test/java/id/soalku/auth/CorsSecurityTest.java
  git commit -m "feat(security): configure cors and preflight permissions"
  ```

---

### Task 2: Konfigurasi Development Proxy pada Frontend Vite

**Files:**
- Modify: `SoalKu Frontend/vite.config.ts`

**Interfaces:**
- Consumes: URL Backend (`http://localhost:8080`)
- Produces: Forwarding request `/api` ke `http://localhost:8080`

- [ ] **Step 1: Tambahkan konfigurasi proxy pada `vite.config.ts`**
  Modifikasi `SoalKu Frontend/vite.config.ts` pada blok `server`:
  ```ts
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  }
  ```

- [ ] **Step 2: Verifikasi konfigurasi syntax dengan build check**
  Jalankan di folder `SoalKu Frontend`: `npm run build`
  Ekspektasi: Build berhasil tanpa error.

- [ ] **Step 3: Commit**
  ```bash
  git add "SoalKu Frontend/vite.config.ts"
  git commit -m "feat(frontend): add vite development proxy for /api"
  ```

---

### Task 3: Modul HTTP Client Terpusat (`apiClient.ts`)

**Files:**
- Create: `SoalKu Frontend/src/react/services/apiClient.ts`

**Interfaces:**
- Consumes: browser `fetch`, `localStorage`
- Produces:
  - `class ApiError extends Error { status: number; code?: string; details?: any; }`
  - `getToken(): string | null`
  - `setToken(token: string): void`
  - `clearToken(): void`
  - `apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T>`

- [ ] **Step 1: Implementasikan `apiClient.ts`**
  - Implementasikan class `ApiError` dengan properti `status`, `code`, dan `details`.
  - Implementasikan utilitas token (`getToken`, `setToken`, `clearToken`).
  - Implementasikan fungsi `apiFetch<T>`:
    - Base URL default: `""` (menggunakan path relatif agar melalui Vite proxy `/api`, atau `import.meta.env.VITE_API_BASE_URL` jika ada).
    - Melampirkan `Authorization: Bearer <token>` bila token ada.
    - Melampirkan `Content-Type: application/json` jika body berupa string JSON.
    - Mengatur `AbortController` dengan timeout 15 detik.
    - Menangkap respons non-OK (4xx, 5xx), parsing JSON body error (`message`, `error`, `status`), dan melemparkan `ApiError`.
    - Jika status 401 dan bukan pada endpoint `/api/auth/login`, otomatis panggil `clearToken()`.

- [ ] **Step 2: Verifikasi type safety dengan `tsc`**
  Jalankan di folder `SoalKu Frontend`: `npm run build`
  Ekspektasi: PASS tanpa compile error.

- [ ] **Step 3: Commit**
  ```bash
  git add "SoalKu Frontend/src/react/services/apiClient.ts"
  git commit -m "feat(frontend): create centralized apiClient with jwt handling"
  ```

---

### Task 4: Service Autentikasi & Refactoring AuthContext serta Form

**Files:**
- Create: `SoalKu Frontend/src/react/services/authApi.ts`
- Modify: `SoalKu Frontend/src/react/context/AuthContext.tsx`
- Modify: `SoalKu Frontend/src/react/components/AuthPage.tsx`
- Modify: `SoalKu Frontend/src/react/types/auth.ts`

**Interfaces:**
- Consumes: `apiFetch` dari `apiClient.ts`, kontrak `/api/auth/*`
- Produces:
  - `authApi.login(email, password): Promise<TokenResponse>`
  - `authApi.register(request): Promise<UserResponse>`
  - `authApi.me(): Promise<UserResponse>`
  - `useAuth(): { user, isAuthenticated, login, register, logout, getDashboardRoute }`

- [ ] **Step 1: Buat `authApi.ts`**
  - Definisikan tipe DTO: `BackendLoginRequest`, `BackendRegisterRequest`, `BackendTokenResponse`, `BackendUserResponse`.
  - Fungsi `login(email, password)`: `POST /api/auth/login`.
  - Fungsi `register(payload)`: `POST /api/auth/register`.
  - Fungsi `getMe()`: `GET /api/auth/me`.

- [ ] **Step 2: Perbarui `AuthContext.tsx`**
  - Ganti simulasi `setTimeout` dan data hardcoded dengan pemanggilan `authApi.login` dan `authApi.register`.
  - Pemetaan Role:
    - Jika role frontend adalah `guru`, set role backend ke `MENTOR`.
    - Jika role frontend adalah `sd` atau `smp`, set role backend ke `SISWA`.
  - Sesi Awal (`useEffect` mount):
    - Jika token ada di storage, panggil `authApi.getMe()`.
    - Jika valid, perbarui state `user`.
    - Jika gagal (misal token expired/401), panggil `logout()` dan bersihkan storage.
  - Simpan token di `setToken()` saat login/register berhasil.
  - Hapus token di `clearToken()` saat logout.

- [ ] **Step 3: Sesuaikan Form Kredensial di `AuthPage.tsx`**
  - Pastikan validasi password minimal 8 karakter di sisi klien sebelum submit.
  - Untuk login: Menangani input email atau identifier. Jika siswa menginput NISN murni, format ke `${nisn}@siswa.soalku.id`.
  - Untuk registrasi SD: Sediakan input email atau fallback otomatis deterministik `${nisn}@siswa.soalku.id`.
  - Tampilkan pesan error aktual dari backend (`ApiError.message`) pada alert banner di UI.

- [ ] **Step 4: Verifikasi kompilasi frontend**
  Jalankan di folder `SoalKu Frontend`: `npm run build`
  Ekspektasi: PASS (0 errors).

- [ ] **Step 5: Commit**
  ```bash
  git add "SoalKu Frontend/src/react/services/authApi.ts" "SoalKu Frontend/src/react/context/AuthContext.tsx" "SoalKu Frontend/src/react/components/AuthPage.tsx" "SoalKu Frontend/src/react/types/auth.ts"
  git commit -m "feat(auth): connect real backend authentication in context and form"
  ```

---

### Task 5: End-to-End Audit, Testing Menyeluruh & Laporan Ringkasan

**Files:**
- Create: `backend/web-api/src/test/java/id/soalku/auth/FrontendIntegrationIT.java` (atau script pengujian integrasi E2E)
- Create: Dokumen laporan pengujian

**Interfaces:**
- Consumes: Backend live/test server, Frontend production bundle
- Produces: Matrix hasil pengujian dan laporan audit komprehensif

- [ ] **Step 1: Tulis Integration Test E2E di backend `FrontendIntegrationIT.java`**
  - Test skenario registrasi siswa baru & verifikasi data tersimpan di database.
  - Test skenario login siswa & verifikasi diterbitkannya JWT access token.
  - Test skenario akses `/api/auth/me` menggunakan token & verifikasi data profil.
  - Test skenario penolakan request dengan token palsu atau kedaluwarsa (401).
  - Test skenario registrasi guru baru (role MENTOR) & verifikasi hak aksesnya.

- [ ] **Step 2: Jalankan audit penuh backend**
  Jalankan: `mvn test -pl web-api`
  Ekspektasi: Semua test suite (AuthIT, CorsSecurityTest, FrontendIntegrationIT) lulus 100%.

- [ ] **Step 3: Jalankan audit penuh frontend**
  Jalankan: `npm run build` di `SoalKu Frontend`
  Ekspektasi: TypeScript compile dan Vite bundle sukses tanpa peringatan fatal.

- [ ] **Step 4: Commit test dan hasil audit**
  ```bash
  git add backend/web-api/src/test/java/id/soalku/auth/FrontendIntegrationIT.java
  git commit -m "test(integration): add e2e integration test suite for frontend-backend auth"
  ```

- [ ] **Step 5: Susun Ringkasan Hasil Audit dan Testing**
  Buat laporan ringkasan dalam bentuk tabel yang merangkum:
  - Status build & test backend (jumlah test, status pass/fail).
  - Status build frontend.
  - Matrix pengujian endpoint & skenario autentikasi.
