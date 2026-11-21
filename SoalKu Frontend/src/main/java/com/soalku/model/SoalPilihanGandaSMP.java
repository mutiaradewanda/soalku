package com.soalku.model;

/**
 * Implementasi Soal untuk tingkat SMP.
 * Sesuai PRD: Memiliki 4 pilihan jawaban (A, B, C, D).
 */
public class SoalPilihanGandaSMP extends Soal {

    public SoalPilihanGandaSMP(int id, int bagianMateriId, String topik, String pertanyaan, TingkatKesulitan tingkatKesulitan) {
        super(id, bagianMateriId, topik, pertanyaan, tingkatKesulitan);
    }

    @Override
    public int getMaksimalOpsi() {
        return 4; // PRD: 4 opsi untuk SMP (A, B, C, D)
    }

    @Override
    public Tingkat getTingkat() {
        return Tingkat.SMP;
    }
}
