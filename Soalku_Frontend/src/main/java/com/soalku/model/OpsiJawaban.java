package com.soalku.model;

public class OpsiJawaban {
    private int id;
    private int soalId;
    private String label; // "A", "B", "C", "D"
    private String teksOpsi;
    private boolean isBenar;

    public OpsiJawaban(int id, int soalId, String label, String teksOpsi, boolean isBenar) {
        this.id = id;
        this.soalId = soalId;
        this.label = label;
        this.teksOpsi = teksOpsi;
        this.isBenar = isBenar;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSoalId() { return soalId; }
    public void setSoalId(int soalId) { this.soalId = soalId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getTeksOpsi() { return teksOpsi; }
    public void setTeksOpsi(String teksOpsi) { this.teksOpsi = teksOpsi; }

    public boolean isBenar() { return isBenar; }
    public void setBenar(boolean benar) { isBenar = benar; }

    @Override
    public String toString() {
        return label + ". " + teksOpsi;
    }
}
