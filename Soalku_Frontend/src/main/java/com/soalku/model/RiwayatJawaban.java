package com.soalku.model;

import java.time.LocalDateTime;

public class RiwayatJawaban {
    private int id;
    private int sesiId;
    private int soalId;
    private int bagianMateriId; // Tag Topik for weakness grouping
    private Integer opsiDipilih;
    private boolean isBenar;
    private boolean isRagu;
    private LocalDateTime dijawabAt;

    public RiwayatJawaban(int id, int sesiId, int soalId, int bagianMateriId, Integer opsiDipilih, boolean isBenar) {
        this.id = id;
        this.sesiId = sesiId;
        this.soalId = soalId;
        this.bagianMateriId = bagianMateriId;
        this.opsiDipilih = opsiDipilih;
        this.isBenar = isBenar;
        this.isRagu = false;
        this.dijawabAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSesiId() { return sesiId; }
    public void setSesiId(int sesiId) { this.sesiId = sesiId; }

    public int getSoalId() { return soalId; }
    public void setSoalId(int soalId) { this.soalId = soalId; }

    public int getBagianMateriId() { return bagianMateriId; }
    public void setBagianMateriId(int bagianMateriId) { this.bagianMateriId = bagianMateriId; }

    public Integer getOpsiDipilih() { return opsiDipilih; }
    public void setOpsiDipilih(Integer opsiDipilih) { this.opsiDipilih = opsiDipilih; }

    public boolean isBenar() { return isBenar; }
    public void setBenar(boolean benar) { isBenar = benar; }

    public boolean isRagu() { return isRagu; }
    public void setRagu(boolean ragu) { isRagu = ragu; }

    public LocalDateTime getDijawabAt() { return dijawabAt; }
    public void setDijawabAt(LocalDateTime dijawabAt) { this.dijawabAt = dijawabAt; }
}
