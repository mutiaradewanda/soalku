package com.soalku.model;

import java.time.LocalDateTime;

public class Materi {
    private int id;
    private String judul;
    private Tingkat tingkat;
    private String babNomor; // e.g. "Bab 4.1"
    private String mataPelajaran; // e.g. "IPA Terpadu (Biologi)"
    private String deskripsi;
    private int persentaseKelulusan;
    private String status; // DIUNGGAH, DIEKSTRAK, DIGENERATE, GAGAL_GENERATE
    private String pesanError;
    private String filePath;
    private int diunggahOleh;
    private LocalDateTime createdAt;

    public Materi(int id, String judul, Tingkat tingkat, String babNomor, String mataPelajaran, String deskripsi, int persentaseKelulusan) {
        this.id = id;
        this.judul = judul;
        this.tingkat = tingkat;
        this.babNomor = babNomor;
        this.mataPelajaran = mataPelajaran;
        this.deskripsi = deskripsi;
        this.persentaseKelulusan = persentaseKelulusan;
        this.status = "DIGENERATE";
        this.pesanError = null;
        this.createdAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getJudul() { return judul; }
    public void setJudul(String judul) { this.judul = judul; }

    public Tingkat getTingkat() { return tingkat; }
    public void setTingkat(Tingkat tingkat) { this.tingkat = tingkat; }

    public String getBabNomor() { return babNomor; }
    public void setBabNomor(String babNomor) { this.babNomor = babNomor; }

    public String getMataPelajaran() { return mataPelajaran; }
    public void setMataPelajaran(String mataPelajaran) { this.mataPelajaran = mataPelajaran; }

    public String getDeskripsi() { return deskripsi; }
    public void setDeskripsi(String deskripsi) { this.deskripsi = deskripsi; }

    public int getPersentaseKelulusan() { return persentaseKelulusan; }
    public void setPersentaseKelulusan(int persentaseKelulusan) { this.persentaseKelulusan = persentaseKelulusan; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPesanError() { return pesanError; }
    public void setPesanError(String pesanError) { this.pesanError = pesanError; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public int getDiunggahOleh() { return diunggahOleh; }
    public void setDiunggahOleh(int diunggahOleh) { this.diunggahOleh = diunggahOleh; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
