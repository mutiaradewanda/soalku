# Spesifikasi Desain: Integrasi Frontend dan Backend SoalKu (Fase 1: Fondasi API & Autentikasi)

**Tanggal:** 2026-10-27  
**Status:** Disetujui  
**Cakupan:** Fase 1 — Konektivitas Jaringan, Konfigurasi CORS, HTTP Client Terpusat, Autentikasi Nyata (Register, Login, JWT, Profil), Audit, dan Pengujian Terverifikasi.

---

## 1. Latar Belakang & Tujuan

Aplikasi SoalKu terdiri dari:
1. **Backend**: Spring Boot 3 (Java 21), Spring Security OAuth2 Resource Server (JWT), PostgreSQL / Flyway, berjalan pada port `8080`.
2. **Frontend**: React 18, Vite, TypeScript, TailwindCSS, berjalan pada port `5173`.

Sebelumnya, frontend beroperasi secara terisolasi menggunakan data mock di `AuthContext` dan data seed lokal di browser. Tujuan dari Fase 1 ini adalah menghubungkan frontend dan backend secara andal pada level jaringan dan protokol autentikasi, mengeliminasi mock login/register, serta menetapkan fondasi HTTP client yang aman untuk modul-modul berikutnya (Materi, Kuis, Mentor).

---

## 2. Arsitektur Jaringan & Konektivitas

### 2.1 Vite Development Proxy (`SoalKu Frontend/vite.config.ts`)
Untuk memfasilitasi komunikasi lokal yang mulus dan menghindari kendala browser same-origin policy pada lingkungan dev, Vite dikonfigurasi untuk mem-proxy request berawalan `/api` ke backend:
```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: process.env.VITE_BACKEND_URL || 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### 2.2 Backend CORS (`backend/web-api/src/main/java/id/soalku/auth/SecurityConfiguration.java`)
Backend menambahkan konfigurasi `CorsConfigurationSource` untuk mengizinkan request lintas origin dari frontend (lokal dan staging/produksi):
- **Allowed Origins**: `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`.
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
- **Allowed Headers**: `Authorization`, `Content-Type`, `Idempotency-Key`, `X-Requested-With`, `Accept`.
- **Exposed Headers**: `Authorization`, `Location`.
- **Preflight Support**: Mengizinkan `OPTIONS /**` tanpa autentikasi agar preflight browser tidak menghasilkan `401 Unauthorized`.

---

## 3. Kontrak Data & Pemetaan Kredensial

### 3.1 Kontrak Endpoint Backend
1. `POST /api/auth/register` (Publik):
   - Request Body:
     - `nama`: String, wajib, maks 150 karakter.
     - `email`: String, format email valid, wajib, maks 254 karakter.
     - `password`: String, wajib, min 8 dan maks 72 karakter.
     - `role`: Enum `Role` (`SISWA` atau `MENTOR`), wajib.
     - `kodeUndangan`: String, opsional, maks 100 karakter.
   - Respons: `201 Created` dengan `UserResponse` (`id`, `nama`, `email`, `role`).
2. `POST /api/auth/login` (Publik):
   - Request Body:
     - `email`: String, format email valid, wajib.
     - `password`: String, wajib.
   - Respons: `200 OK` dengan `TokenResponse`:
     - `accessToken`: String (JWT signed token).
     - `tokenType`: `"Bearer"`.
     - `expiresIn`: Long (durasi detik, default 900 detik / 15 menit).
3. `GET /api/auth/me` (Terproteksi, Bearer Token):
   - Header: `Authorization: Bearer <accessToken>`.
   - Respons: `200 OK` dengan `UserResponse` (`id`, `nama`, `email`, `role`).

### 3.2 Pemetaan Role & Adaptasi Form Frontend
- **Role Mapping**:
  - Frontend `guru` &rarr; Backend `Role.MENTOR`.
  - Frontend `sd` dan `smp` &rarr; Backend `Role.SISWA`.
- **Adaptasi Kredensial**:
  - Untuk Guru: Form register menyediakan input email secara langsung.
  - Untuk Siswa SD dan SMP:
    - Form register menyediakan input email aktif, atau jika siswa SD hanya mengisi NISN/ID, sistem secara deterministik membentuk format email valid `${nisn}@siswa.soalku.id` agar memenuhi validasi backend `@Email`.
    - Validasi password di frontend diselaraskan dengan backend (minimal 8 karakter).
- **Penyimpanan Metadata Sesi**:
  - Token JWT disimpan di `localStorage` dengan key `soalku_access_token`.
  - Informasi profil terverifikasi (`id`, `nama`, `email`, `role`) serta metadata UI (`jenjang`: `"sd"` | `"smp"` | `"guru"`) disimpan di `localStorage` dengan key `soalku_auth_user`.

---

## 4. Desain Komponen Frontend

### 4.1 Centralized HTTP Client (`src/react/services/apiClient.ts`)
Menyediakan utilitas `apiFetch<T>(endpoint: string, options?: RequestInit)`:
- Melampirkan header `Authorization: Bearer <token>` jika token tersedia di storage.
- Menetapkan `Content-Type: application/json` kecuali jika body berupa `FormData`.
- Mengimplementasikan timeout otomatis (default 15 detik).
- Menangani respons error Spring Boot secara terstruktur (`status`, `error`, `message`, `path`).
- Mengarahkan ke auto-logout jika menerima `401 Unauthorized` pada endpoint terproteksi.

### 4.2 Auth Service (`src/react/services/authApi.ts`)
Berisi fungsi-fungsi spesifik autentikasi:
- `registerUser(payload)` &rarr; memanggil `POST /api/auth/register`.
- `loginUser(email, password)` &rarr; memanggil `POST /api/auth/login`.
- `fetchCurrentUser()` &rarr; memanggil `GET /api/auth/me`.

### 4.3 Refactoring `AuthContext.tsx`
- Menghapus simulasi `setTimeout` dan data mock hardcoded.
- Mengintegrasikan pemanggilan `loginUser` dan `registerUser`.
- Pada saat komponen dimuat (`useEffect` mount), memeriksa apakah ada token tersimpan. Jika ada, panggil `fetchCurrentUser()`. Bila valid, pertahankan state pengguna; jika tidak valid atau kadaluwarsa, hapus token dan reset state.
- Menjaga antarmuka `useAuth()` tetap kompatibel bagi seluruh halaman (Dashboard, ProtectedRoute, dsb).

### 4.4 Penyesuaian `AuthPage.tsx`
- Memastikan field email tersedia/dihasilkan secara valid untuk semua jenis pengguna.
- Menampilkan pesan error spesifik dari backend (misalnya: "Email sudah terdaftar", "Kredensial tidak valid", "Password minimal 8 karakter").

---

## 5. Rencana Audit dan Pengujian (Audit & Testing Strategy)

### 5.1 Backend Verification
- Eksekusi `mvn test` pada modul `backend/web-api` dan modul terkait.
- Memastikan suite pengujian yang sudah ada (`AuthIT`, `SecurityConfigurationTest`, dsb) tetap 100% lulus (green).
- Memverifikasi endpoint `/api/auth/register`, `/api/auth/login`, dan `/api/auth/me` berfungsi secara benar dengan database PostgreSQL.

### 5.2 Frontend Verification
- Eksekusi `npm run build` (`tsc && vite build`) di folder `SoalKu Frontend`.
- Memastikan tidak ada error kompilasi TypeScript atau circular dependency.

### 5.3 End-to-End Integration Smoke Test
- Pengujian Registrasi: Akun Siswa dan Akun Guru baru berhasil dibuat di backend.
- Pengujian Login: Token JWT berhasil diterbitkan dan diterima frontend.
- Pengujian Autentikasi Profil: Token berhasil digunakan untuk memanggil `/api/auth/me`.
- Pengujian Proteksi: Request tanpa token ke endpoint terproteksi ditolak dengan `401 Unauthorized`.
- Pengujian Penanganan Error: Input kredensial yang salah menghasilkan pesan error yang informatif di UI.

### 5.4 Pelaporan Hasil
Menyusun laporan hasil audit dan testing dalam bentuk tabel ringkasan terperinci yang memuat status build backend, status build frontend, dan hasil pengujian integrasi endpoint.
