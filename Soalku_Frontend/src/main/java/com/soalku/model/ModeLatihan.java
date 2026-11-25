package com.soalku.model;

public enum ModeLatihan {
    ACAK("Mode Acak", "Latihan variatif seimbang dari seluruh silabus untuk mengasah ingatan jangka panjang.", "15 Soal • 15 Mnt"),
    BERWAKTU("Mode Berwaktu", "Simulasi kondisi tes sesungguhnya dengan batas waktu ketat & hitung mundur per butir soal.", "25 Soal • 20 Mnt"),
    FOKUS_KELEMAHAN("Fokus Kelemahan", "Algoritma menyaring soal yang paling sering salah dijawab sampai kamu benar-benar tuntas.", "10 Soal Adaptif");

    private final String displayName;
    private final String description;
    private final String badge;

    ModeLatihan(String displayName, String description, String badge) {
        this.displayName = displayName;
        this.description = description;
        this.badge = badge;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public String getBadge() {
        return badge;
    }
}
