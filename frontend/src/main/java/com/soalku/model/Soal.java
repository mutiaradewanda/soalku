package com.soalku.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Abstraksi dasar untuk entitas Soal sesuai PRD.
 * Mengimplementasikan prinsip Object-Oriented Programming (OOP)
 * dengan polimorfisme pada jumlah opsi dan validasi jawaban.
 */
public abstract class Soal {
    protected int id;
    protected int bagianMateriId;
    protected String topik;
    protected String pertanyaan;
    protected Integer gambarId;
    protected String gambarPath;
    protected StatusReview statusReview;
    protected Integer direviewOleh;
    protected TingkatKesulitan tingkatKesulitan;
    protected List<OpsiJawaban> opsiList;
    protected LocalDateTime createdAt;

    // Adaptif AI helpers
    protected String tipsAdaptif;
    protected String jembatanKeledai;
    protected String insightKelemahan;

    public Soal(int id, int bagianMateriId, String topik, String pertanyaan, TingkatKesulitan tingkatKesulitan) {
        this.id = id;
        this.bagianMateriId = bagianMateriId;
        this.topik = topik;
        this.pertanyaan = pertanyaan;
        this.tingkatKesulitan = tingkatKesulitan;
        this.statusReview = StatusReview.MENUNGGU;
        this.opsiList = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Polimorfik: Mendapatkan jumlah opsi yang diperbolehkan
     * (3 opsi untuk SD, 4 opsi untuk SMP).
     */
    public abstract int getMaksimalOpsi();

    public abstract Tingkat getTingkat();

    public void addOpsi(OpsiJawaban opsi) {
        if (opsiList.size() < getMaksimalOpsi()) {
            opsiList.add(opsi);
        } else {
            throw new IllegalStateException("Soal tingkat " + getTingkat() + " maksimal hanya memiliki " + getMaksimalOpsi() + " opsi jawaban.");
        }
    }

    public boolean cekJawaban(int opsiId) {
        for (OpsiJawaban opsi : opsiList) {
            if (opsi.getId() == opsiId) {
                return opsi.isBenar();
            }
        }
        return false;
    }

    public OpsiJawaban getKunciJawaban() {
        for (OpsiJawaban opsi : opsiList) {
            if (opsi.isBenar()) return opsi;
        }
        return null;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBagianMateriId() { return bagianMateriId; }
    public void setBagianMateriId(int bagianMateriId) { this.bagianMateriId = bagianMateriId; }

    public String getTopik() { return topik; }
    public void setTopik(String topik) { this.topik = topik; }

    public String getPertanyaan() { return pertanyaan; }
    public void setPertanyaan(String pertanyaan) { this.pertanyaan = pertanyaan; }

    public Integer getGambarId() { return gambarId; }
    public void setGambarId(Integer gambarId) { this.gambarId = gambarId; }

    public String getGambarPath() { return gambarPath; }
    public void setGambarPath(String gambarPath) { this.gambarPath = gambarPath; }

    public StatusReview getStatusReview() { return statusReview; }
    public void setStatusReview(StatusReview statusReview) { this.statusReview = statusReview; }

    public Integer getDireviewOleh() { return direviewOleh; }
    public void setDireviewOleh(Integer direviewOleh) { this.direviewOleh = direviewOleh; }

    public TingkatKesulitan getTingkatKesulitan() { return tingkatKesulitan; }
    public void setTingkatKesulitan(TingkatKesulitan tingkatKesulitan) { this.tingkatKesulitan = tingkatKesulitan; }

    public List<OpsiJawaban> getOpsiList() { return opsiList; }
    public void setOpsiList(List<OpsiJawaban> opsiList) { this.opsiList = opsiList; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getTipsAdaptif() { return tipsAdaptif; }
    public void setTipsAdaptif(String tipsAdaptif) { this.tipsAdaptif = tipsAdaptif; }

    public String getJembatanKeledai() { return jembatanKeledai; }
    public void setJembatanKeledai(String jembatanKeledai) { this.jembatanKeledai = jembatanKeledai; }

    public String getInsightKelemahan() { return insightKelemahan; }
    public void setInsightKelemahan(String insightKelemahan) { this.insightKelemahan = insightKelemahan; }
}
