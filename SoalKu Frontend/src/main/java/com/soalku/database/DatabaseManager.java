package com.soalku.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseManager {
    private static final String DB_URL = "jdbc:sqlite:soalku.db";
    private static DatabaseManager instance;

    private DatabaseManager() {
        initDatabase();
    }

    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }

    private void initDatabase() {
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            // 1. Tabel Pengguna
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS pengguna (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nama TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT,
                    role TEXT NOT NULL, -- SISWA / MENTOR
                    deskripsi_peran TEXT,
                    streak_hari INTEGER DEFAULT 5,
                    xp_pekan_ini INTEGER DEFAULT 1450,
                    kuota_ai INTEGER DEFAULT 82,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """);

            // 2. Tabel Kode Undangan
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS kode_undangan (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    kode TEXT UNIQUE NOT NULL,
                    dibuat_oleh INTEGER,
                    status TEXT DEFAULT 'AKTIF',
                    expired_at TIMESTAMP,
                    FOREIGN KEY (dibuat_oleh) REFERENCES pengguna(id)
                );
            """);

            // 3. Tabel Materi
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS materi (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    judul TEXT NOT NULL,
                    tingkat TEXT NOT NULL, -- SD / SMP
                    bab_nomor TEXT,
                    mata_pelajaran TEXT,
                    deskripsi TEXT,
                    persentase_kelulusan INTEGER DEFAULT 0,
                    file_path TEXT,
                    diunggah_oleh INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (diunggah_oleh) REFERENCES pengguna(id)
                );
            """);

            // 4. Tabel Bagian Materi (Topik / Tag Kelemahan)
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS bagian_materi (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    materi_id INTEGER NOT NULL,
                    judul_bagian TEXT NOT NULL,
                    teks_ringkasan TEXT,
                    urutan INTEGER DEFAULT 1,
                    FOREIGN KEY (materi_id) REFERENCES materi(id)
                );
            """);

            // 5. Tabel Gambar Materi
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS gambar_materi (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    materi_id INTEGER NOT NULL,
                    bagian_materi_id INTEGER,
                    file_path TEXT NOT NULL,
                    caption TEXT,
                    FOREIGN KEY (materi_id) REFERENCES materi(id),
                    FOREIGN KEY (bagian_materi_id) REFERENCES bagian_materi(id)
                );
            """);

            // 6. Tabel Soal
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS soal (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bagian_materi_id INTEGER NOT NULL,
                    tipe TEXT NOT NULL, -- SD / SMP
                    pertanyaan TEXT NOT NULL,
                    gambar_id INTEGER,
                    tingkat_kesulitan TEXT DEFAULT 'SEDANG',
                    status_review TEXT DEFAULT 'MENUNGGU', -- MENUNGGU / DISETUJUI / DITOLAK
                    direview_oleh INTEGER,
                    tips_adaptif TEXT,
                    jembatan_keledai TEXT,
                    insight_kelemahan TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (bagian_materi_id) REFERENCES bagian_materi(id),
                    FOREIGN KEY (gambar_id) REFERENCES gambar_materi(id),
                    FOREIGN KEY (direview_oleh) REFERENCES pengguna(id)
                );
            """);

            // 7. Tabel Opsi Jawaban
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS opsi_jawaban (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    soal_id INTEGER NOT NULL,
                    label TEXT NOT NULL, -- A, B, C, D
                    teks_opsi TEXT NOT NULL,
                    is_benar INTEGER DEFAULT 0,
                    FOREIGN KEY (soal_id) REFERENCES soal(id)
                );
            """);

            // 8. Tabel Sesi Latihan
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS sesi_latihan (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    siswa_id INTEGER NOT NULL,
                    mode TEXT NOT NULL, -- ACAK / BERWAKTU / FOKUS_KELEMAHAN
                    id_sesi_formatted TEXT,
                    mulai_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    selesai_at TIMESTAMP,
                    FOREIGN KEY (siswa_id) REFERENCES pengguna(id)
                );
            """);

            // 9. Tabel Riwayat Jawaban
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS riwayat_jawaban (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sesi_id INTEGER NOT NULL,
                    soal_id INTEGER NOT NULL,
                    bagian_materi_id INTEGER NOT NULL,
                    opsi_dipilih INTEGER,
                    is_benar INTEGER NOT NULL,
                    is_ragu INTEGER DEFAULT 0,
                    dijawab_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sesi_id) REFERENCES sesi_latihan(id),
                    FOREIGN KEY (soal_id) REFERENCES soal(id),
                    FOREIGN KEY (opsi_dipilih) REFERENCES opsi_jawaban(id),
                    FOREIGN KEY (bagian_materi_id) REFERENCES bagian_materi(id)
                );
            """);

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
