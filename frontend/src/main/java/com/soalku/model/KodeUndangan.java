package com.soalku.model;

import java.time.LocalDateTime;

public class KodeUndangan {
    private int id;
    private String kode;
    private int dibuatOleh;
    private String status; // "AKTIF", "DIGUNAKAN"
    private LocalDateTime expiredAt;

    public KodeUndangan(int id, String kode, int dibuatOleh, String status, LocalDateTime expiredAt) {
        this.id = id;
        this.kode = kode;
        this.dibuatOleh = dibuatOleh;
        this.status = status;
        this.expiredAt = expiredAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getKode() { return kode; }
    public void setKode(String kode) { this.kode = kode; }

    public int getDibuatOleh() { return dibuatOleh; }
    public void setDibuatOleh(int dibuatOleh) { this.dibuatOleh = dibuatOleh; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getExpiredAt() { return expiredAt; }
    public void setExpiredAt(LocalDateTime expiredAt) { this.expiredAt = expiredAt; }
}
