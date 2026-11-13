package com.soalku.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SesiLatihan {
    private int id;
    private int siswaId;
    private ModeLatihan mode;
    private String idSesiFormatted; // e.g. "#CBT-BIO-8824"
    private String judulModul; // e.g. "IPA Terpadu • Biologi Sistem Pencernaan"
    private String kelasTingkat; // e.g. "Kelas 8 SMP"
    private LocalDateTime mulaiAt;
    private LocalDateTime selesaiAt;
    private int totalSoal;
    private int waktuDetikSisa;
    private int streakSaatIni;
    private List<Soal> daftarSoal;
    private Map<Integer, Integer> jawabanMap; // soalId -> opsiId
    private Map<Integer, Boolean> raguMap; // soalId -> boolean isRagu

    public SesiLatihan(int id, int siswaId, ModeLatihan mode, String idSesiFormatted, String judulModul, String kelasTingkat, int totalSoal, int durasiMenit) {
        this.id = id;
        this.siswaId = siswaId;
        this.mode = mode;
        this.idSesiFormatted = idSesiFormatted;
        this.judulModul = judulModul;
        this.kelasTingkat = kelasTingkat;
        this.totalSoal = totalSoal;
        this.waktuDetikSisa = durasiMenit * 60;
        this.streakSaatIni = 4;
        this.mulaiAt = LocalDateTime.now();
        this.daftarSoal = new ArrayList<>();
        this.jawabanMap = new HashMap<>();
        this.raguMap = new HashMap<>();
    }

    public int hitungJumlahTerjawab() {
        return jawabanMap.size();
    }

    public int hitungJumlahRagu() {
        int count = 0;
        for (Boolean b : raguMap.values()) {
            if (Boolean.TRUE.equals(b)) count++;
        }
        return count;
    }

    public int hitungSkorBenar() {
        int benar = 0;
        for (Soal s : daftarSoal) {
            Integer dipilih = jawabanMap.get(s.getId());
            if (dipilih != null && s.cekJawaban(dipilih)) {
                benar++;
            }
        }
        return benar;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSiswaId() { return siswaId; }
    public void setSiswaId(int siswaId) { this.siswaId = siswaId; }

    public ModeLatihan getMode() { return mode; }
    public void setMode(ModeLatihan mode) { this.mode = mode; }

    public String getIdSesiFormatted() { return idSesiFormatted; }
    public void setIdSesiFormatted(String idSesiFormatted) { this.idSesiFormatted = idSesiFormatted; }

    public String getJudulModul() { return judulModul; }
    public void setJudulModul(String judulModul) { this.judulModul = judulModul; }

    public String getKelasTingkat() { return kelasTingkat; }
    public void setKelasTingkat(String kelasTingkat) { this.kelasTingkat = kelasTingkat; }

    public LocalDateTime getMulaiAt() { return mulaiAt; }
    public void setMulaiAt(LocalDateTime mulaiAt) { this.mulaiAt = mulaiAt; }

    public LocalDateTime getSelesaiAt() { return selesaiAt; }
    public void setSelesaiAt(LocalDateTime selesaiAt) { this.selesaiAt = selesaiAt; }

    public int getTotalSoal() { return totalSoal; }
    public void setTotalSoal(int totalSoal) { this.totalSoal = totalSoal; }

    public int getWaktuDetikSisa() { return waktuDetikSisa; }
    public void setWaktuDetikSisa(int waktuDetikSisa) { this.waktuDetikSisa = waktuDetikSisa; }

    public int getStreakSaatIni() { return streakSaatIni; }
    public void setStreakSaatIni(int streakSaatIni) { this.streakSaatIni = streakSaatIni; }

    public List<Soal> getDaftarSoal() { return daftarSoal; }
    public void setDaftarSoal(List<Soal> daftarSoal) { this.daftarSoal = daftarSoal; }

    public Map<Integer, Integer> getJawabanMap() { return jawabanMap; }
    public Map<Integer, Boolean> getRaguMap() { return raguMap; }
}
