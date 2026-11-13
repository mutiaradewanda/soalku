package com.soalku.model;

/**
 * SiswaBinaan - Model representasi siswa binaan pada Dasbor Mentor
 * Digunakan untuk use case "Lihat Progres Siswa" sesuai Proposal SoalKu.
 */
public class SiswaBinaan {
    private int id;
    private String nama;
    private String kelas;
    private int totalLatihan;
    private int akurasiRataRata;
    private String topikKelemahan;
    private String statusRemedial; // "Perlu Remedial", "Tuntas", "Bimbingan"
    private String catatanGuru;

    public SiswaBinaan(int id, String nama, String kelas, int totalLatihan, int akurasiRataRata, String topikKelemahan, String statusRemedial, String catatanGuru) {
        this.id = id;
        this.nama = nama;
        this.kelas = kelas;
        this.totalLatihan = totalLatihan;
        this.akurasiRataRata = akurasiRataRata;
        this.topikKelemahan = topikKelemahan;
        this.statusRemedial = statusRemedial;
        this.catatanGuru = catatanGuru;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNama() { return nama; }
    public void setNama(String nama) { this.nama = nama; }

    public String getKelas() { return kelas; }
    public void setKelas(String kelas) { this.kelas = kelas; }

    public int getTotalLatihan() { return totalLatihan; }
    public void setTotalLatihan(int totalLatihan) { this.totalLatihan = totalLatihan; }

    public int getAkurasiRataRata() { return akurasiRataRata; }
    public void setAkurasiRataRata(int akurasiRataRata) { this.akurasiRataRata = akurasiRataRata; }

    public String getTopikKelemahan() { return topikKelemahan; }
    public void setTopikKelemahan(String topikKelemahan) { this.topikKelemahan = topikKelemahan; }

    public String getStatusRemedial() { return statusRemedial; }
    public void setStatusRemedial(String statusRemedial) { this.statusRemedial = statusRemedial; }

    public String getCatatanGuru() { return catatanGuru; }
    public void setCatatanGuru(String catatanGuru) { this.catatanGuru = catatanGuru; }
}
