package com.soalku.model;

/**
 * Implementasi Soal untuk tingkat SD.
 * Sesuai PRD: Memiliki 3 pilihan jawaban (A, B, C) dengan struktur kalimat sederhana.
 */
public class SoalPilihanGandaSD extends Soal {

    public SoalPilihanGandaSD(int id, int bagianMateriId, String topik, String pertanyaan, TingkatKesulitan tingkatKesulitan) {
        super(id, bagianMateriId, topik, pertanyaan, tingkatKesulitan);
    }

    @Override
    public int getMaksimalOpsi() {
        return 3; // PRD: 3 opsi untuk SD (A, B, C)
    }

    @Override
    public Tingkat getTingkat() {
        return Tingkat.SD;
    }
}
