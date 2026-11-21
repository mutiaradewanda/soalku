# SoalKu - Adaptive AI Learning (Desktop JavaFX)

Aplikasi Desktop berbasis **Java 21 (LTS)** dan **JavaFX** yang dirancang sesuai dengan spesifikasi Proposal & PRD Final Mata Kuliah Praktikum Pemrograman Berbasis Obyek (PENS 2026), dengan tampilan antarmuka modern, interaktif, dan presisi tinggi sesuai mockup desain.

---

## 📸 Fitur & Antarmuka Utama

1. **Dasbor Belajar Siswa (Student Dashboard)**:
   - Banner sambutan gradien modern (*Halo, Arya Pratama - Siswa SMP Kelas 8*) lengkap dengan *Streak Belajar (5 Hari)*, *XP Pekan Ini (1.450 XP)*, dan *Target Harian (3/4 Bab, 75%)*.
   - **Target Perbaikan Pekan Ini (Rekomendasi AI)**: Indikator akurasi 42% pada materi *Sistem Peredaran Darah Manusia (Fungsi Bilik Jantung & Katup Aorta)* dengan tombol langsung ke latihan kelemahan.
   - **Pilihan Mode Latihan Kilat**: Kartu interaktif untuk *Mode Acak*, *Mode Berwaktu*, dan *Fokus Kelemahan*.
   - **Modul Sedang Dipelajari**: Kartu bab *Aljabar Dasar (Bab 3.2)*, *Biologi Sistem Pencernaan (Bab 4.1)*, dan *Unsur Intrinsik Cerpen (Bab 2.4)*.
   - **Panel Ringkasan Performa**: Grafik donat 82% akurasi rata-rata, 128 soal dikerjakan, 105 benar, dan 23 remedial.
   - **Modul Instan AI (Dropzone)**: Drag & drop berkas PDF/DOCX untuk ringkasan otomatis via Apache PDFBox & Apache POI.
   - **Agenda Ulangan & Pesan Mentor**: Kalender ujian dan catatan dari *Bu Ratna Kumalasari, S.Pd.*

2. **Latihan Soal Interaktif (CBT Mode - Persis Mockup Soal No. 7)**:
   - **Bar Sesi CBT**: Tag *Adaptif AI*, *Mode Fokus Kelemahan*, *ID Sesi #CBT-BIO-8824*, subjek *IPA Terpadu • Biologi Sistem Pencernaan (Kelas 8 SMP)*, *Streak 4 Benar Berturut-turut*, dan hitung mundur live timer *Sisa Waktu: 14:19*.
   - **Visualisasi Anatomi Organ Pencernaan**: Diagram skema saluran dan kelenjar pencernaan dengan nomor penunjuk interaktif (1 Rongga Mulut, 2 Ventrikulus/Lambung, 3 Hepar/Hati, 4 Intestinum/Usus Halus).
   - **Interaksi Opsi Pilihan Ganda**: Opsi A, B, C, D dengan radio button dan status *"Jawaban Anda saat ini tersimpan"*.
   - **Navigasi Soal Grid (1 - 10)**: Indikator status warna real-time (Hijau = Dijawab, Kuning/Oranye = Ragu-ragu, Abu-abu = Belum, Biru = Aktif).
   - **Tips Adaptif AI & Jembatan Keledai**: Rumus hafalan enzim getah lambung *[R - P - L]* (Renin, Pepsin, Lambung asam HCl) serta insight kelemahan spesifik.
   - **Pintasan Keyboard**: Tekan tombol `[A]`, `[B]`, `[C]`, `[D]` untuk memilih opsi dan `[Enter]` untuk menyimpan dan melanjutkan ke soal berikutnya.

3. **Ringkas AI & Ekstraksi Modul**:
   - Ekstraksi teks dari berkas PDF (Apache PDFBox) dan DOCX (Apache POI).
   - Layanan Gemini AI untuk penyederhanaan bahasa materi sesuai jenjang (SD atau SMP).
   - Pembuatan butir soal otomatis berjenjang.

4. **Review & Bank Soal (Portal Guru / Mentor)**:
   - Toggle instan pada sidebar (*Siswa* / *Guru Mode*).
   - Antrean review soal hasil generate AI dengan aksi *Setujui*, *Tolak*, atau *Edit* sebelum masuk ke bank soal siswa.
   - Generator dan manajemen *Kode Undangan Mentor* (misal: `GURU-SMP-2026`).

5. **Evaluasi & Rapor**:
   - Analisis mendalam topik kelemahan siswa berdasarkan agregasi riwayat kesalahan pada `bagian_materi_id` (tag topik).

---

## 🏛️ Penerapan Konsep OOP & Design Pattern

- **Abstraksi & Pewarisan (Inheritance)**:
  - Kelas abstrak [`Soal`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/model/Soal.java) diturunkan ke [`SoalPilihanGandaSD`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/model/SoalPilihanGandaSD.java) dan [`SoalPilihanGandaSMP`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/model/SoalPilihanGandaSMP.java).
- **Polimorfisme (Polymorphism)**:
  - Metode `getMaksimalOpsi()` mengembalikan 3 opsi untuk tingkat SD dan 4 opsi untuk tingkat SMP.
- **Factory Pattern**:
  - [`SoalFactory`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/factory/SoalFactory.java) mengenkapsulasi pembuatan objek soal dan opsi jawaban sesuai aturan bisnis PRD.
- **Strategy Pattern**:
  - Antarmuka [`LatihanStrategy`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/strategy/LatihanStrategy.java) dengan implementasi:
    - [`ModeAcakStrategy`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/strategy/ModeAcakStrategy.java): Mengacak butir soal di seluruh modul.
    - [`ModeBerwaktuStrategy`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/strategy/ModeBerwaktuStrategy.java): Simulasi ujian dengan countdown timer ketat.
    - [`ModeFokusKelemahanStrategy`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/strategy/ModeFokusKelemahanStrategy.java): Algoritma adaptif memprioritaskan butir soal dari materi dengan frekuensi kesalahan tertinggi.
- **Relational Persistence**:
  - [`DatabaseManager`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/src/main/java/com/soalku/database/DatabaseManager.java) menginisialisasi skema basis data relasional (SQLite/PostgreSQL kompatibel) dengan tabel: `pengguna`, `kode_undangan`, `materi`, `bagian_materi`, `gambar_materi`, `soal`, `opsi_jawaban`, `sesi_latihan`, dan `riwayat_jawaban`.

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan sistem Anda telah terpasang **Java 21+** (atau Java 26 yang sudah terinstal).

### Menggunakan Script Cepat (Windows):
Cukup klik ganda atau jalankan:
```bat
run.bat
```

### Menggunakan Maven Wrapper:
```bash
.\mvnw.cmd clean compile javafx:run
```

---

## 🌐 Web Application & Progressive Web App (PWA)

Aplikasi web modern berbasis **Vite + React 18 + TypeScript + TailwindCSS** yang kompatibel penuh dengan spesifikasi PRD, mode CBT anti-cheat, kurasi soal AI guru, dan installable sebagai PWA di Desktop maupun Smartphone.

### Menjalankan Web Secara Lokal:
```bash
npm install
npm run dev
```
Akses di browser pada: `http://localhost:5173/`

### Fitur PWA (Installable App):
- **Web App Manifest**: [`public/manifest.webmanifest`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/public/manifest.webmanifest)
- **Service Worker Offline**: [`public/sw.js`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/public/sw.js)
- **Icon Set**: 192x192, 512x512, maskable, apple-touch-icon, dan vector SVG
- **Install Prompt Otomatis**: Mendeteksi perangkat Android/Desktop dan menyediakan panduan 3-langkah untuk iOS Safari.

### Cara Deploy ke Vercel:
Konfigurasi Vercel SPA telah disiapkan di [`vercel.json`](file:///c:/Users/HP%20VICTUS/Downloads/SoalKu%20frontend/vercel.json).

**Opsi 1: Menggunakan Vercel CLI (1 Perintah)**
```bash
npx vercel
```
Ikuti instruksi singkat di terminal (tekan `Enter` untuk default). Untuk rilis produksi:
```bash
npx vercel --prod
```

**Opsi 2: Hubungkan Repository GitHub ke Dashboard Vercel**
1. Push proyek ke repository GitHub / GitLab.
2. Buka [Vercel Dashboard](https://vercel.com/new).
3. Pilih repository `SoalKu frontend` lalu klik **Import**.
4. Framework otomatis terdeteksi sebagai **Vite**.
5. Klik **Deploy** — selesai! Proyek akan aktif dengan URL HTTPS resmi.

