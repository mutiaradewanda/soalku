package com.soalku.model;

public class BagianMateri {
    private int id;
    private int materiId;
    private String judulBagian; // Also acts as Tag Topik for weakness tracking
    private String teksRingkasan;
    private int urutan;
    private String status; // DIGENERATE, MENUNGGU, GAGAL_GENERATE

    public BagianMateri(int id, int materiId, String judulBagian, String teksRingkasan, int urutan) {
        this.id = id;
        this.materiId = materiId;
        this.judulBagian = judulBagian;
        this.teksRingkasan = teksRingkasan;
        this.urutan = urutan;
        this.status = "DIGENERATE";
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getMateriId() { return materiId; }
    public void setMateriId(int materiId) { this.materiId = materiId; }

    public String getJudulBagian() { return judulBagian; }
    public void setJudulBagian(String judulBagian) { this.judulBagian = judulBagian; }

    public String getTeksRingkasan() { return teksRingkasan; }
    public void setTeksRingkasan(String teksRingkasan) { this.teksRingkasan = teksRingkasan; }

    public int getUrutan() { return urutan; }
    public void setUrutan(int urutan) { this.urutan = urutan; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
