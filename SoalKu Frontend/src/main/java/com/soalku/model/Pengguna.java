package com.soalku.model;

import java.time.LocalDateTime;

public class Pengguna {
    private int id;
    private String nama;
    private String email;
    private String passwordHash;
    private Role role;
    private String deskripsiPeran; // e.g. "Siswa SMP Kelas 8" or "Wali Kelas • Guru IPA Terpadu"
    private int streakHari;
    private int xpPekanIni;
    private int targetHarianSelesai;
    private int targetHarianTotal;
    private int kuotaAITutor;
    private String namaOrangTua;
    private String kelas;
    private String nisn;
    private String noHp;
    private String nuptk;
    private String mataPelajaran;
    private LocalDateTime createdAt;

    public Pengguna(int id, String nama, String email, Role role, String deskripsiPeran) {
        this.id = id;
        this.nama = nama;
        this.email = email;
        this.role = role;
        this.deskripsiPeran = deskripsiPeran;
        this.streakHari = 5;
        this.xpPekanIni = 1450;
        this.targetHarianSelesai = 3;
        this.targetHarianTotal = 4;
        this.kuotaAITutor = 82;
        this.createdAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNama() { return nama; }
    public void setNama(String nama) { this.nama = nama; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDeskripsiPeran() { return deskripsiPeran; }
    public void setDeskripsiPeran(String deskripsiPeran) { this.deskripsiPeran = deskripsiPeran; }

    public int getStreakHari() { return streakHari; }
    public void setStreakHari(int streakHari) { this.streakHari = streakHari; }

    public int getXpPekanIni() { return xpPekanIni; }
    public void setXpPekanIni(int xpPekanIni) { this.xpPekanIni = xpPekanIni; }

    public int getTargetHarianSelesai() { return targetHarianSelesai; }
    public void setTargetHarianSelesai(int targetHarianSelesai) { this.targetHarianSelesai = targetHarianSelesai; }

    public int getTargetHarianTotal() { return targetHarianTotal; }
    public void setTargetHarianTotal(int targetHarianTotal) { this.targetHarianTotal = targetHarianTotal; }

    public int getKuotaAITutor() { return kuotaAITutor; }
    public void setKuotaAITutor(int kuotaAITutor) { this.kuotaAITutor = kuotaAITutor; }

    public String getNamaOrangTua() { return namaOrangTua; }
    public void setNamaOrangTua(String namaOrangTua) { this.namaOrangTua = namaOrangTua; }

    public String getKelas() { return kelas; }
    public void setKelas(String kelas) { this.kelas = kelas; }

    public String getNisn() { return nisn; }
    public void setNisn(String nisn) { this.nisn = nisn; }

    public String getNoHp() { return noHp; }
    public void setNoHp(String noHp) { this.noHp = noHp; }

    public String getNuptk() { return nuptk; }
    public void setNuptk(String nuptk) { this.nuptk = nuptk; }

    public String getMataPelajaran() { return mataPelajaran; }
    public void setMataPelajaran(String mataPelajaran) { this.mataPelajaran = mataPelajaran; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
