package com.soalku.factory;

import com.soalku.model.*;

import java.util.List;

/**
 * Factory Design Pattern untuk pembuatan objek Soal.
 * Menjamin kepatuhan aturan bisnis PRD:
 * - Soal SD menghasilkan 3 opsi pilihan ganda (A, B, C).
 * - Soal SMP menghasilkan 4 opsi pilihan ganda (A, B, C, D).
 */
public class SoalFactory {

    public static Soal buatSoal(
            int id,
            Tingkat tingkat,
            int bagianMateriId,
            String topik,
            String pertanyaan,
            TingkatKesulitan tingkatKesulitan,
            List<String> teksOpsiList,
            int indexJawabanBenar
    ) {
        Soal soal;
        if (tingkat == Tingkat.SD) {
            soal = new SoalPilihanGandaSD(id, bagianMateriId, topik, pertanyaan, tingkatKesulitan);
        } else {
            soal = new SoalPilihanGandaSMP(id, bagianMateriId, topik, pertanyaan, tingkatKesulitan);
        }

        int maxOpsi = soal.getMaksimalOpsi();
        String[] labels = {"A", "B", "C", "D"};

        for (int i = 0; i < Math.min(teksOpsiList.size(), maxOpsi); i++) {
            boolean isBenar = (i == indexJawabanBenar);
            OpsiJawaban opsi = new OpsiJawaban(
                    (id * 10) + (i + 1),
                    id,
                    labels[i],
                    teksOpsiList.get(i),
                    isBenar
            );
            soal.addOpsi(opsi);
        }

        return soal;
    }
}
