package com.soalku.strategy;

import com.soalku.model.ModeLatihan;
import com.soalku.model.RiwayatJawaban;
import com.soalku.model.SesiLatihan;
import com.soalku.model.Soal;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ModeAcakStrategy implements LatihanStrategy {

    @Override
    public ModeLatihan getMode() {
        return ModeLatihan.ACAK;
    }

    @Override
    public SesiLatihan inisialisasiSesi(
            int siswaId,
            String judulModul,
            String kelasTingkat,
            List<Soal> bankSoal,
            List<RiwayatJawaban> riwayatSiswa,
            int jumlahSoal
    ) {
        List<Soal> copy = new ArrayList<>(bankSoal.stream()
                .filter(s -> s.getStatusReview() == com.soalku.model.StatusReview.DISETUJUI)
                .toList());
        Collections.shuffle(copy);

        int n = Math.min(jumlahSoal, copy.size());
        List<Soal> terpilih = new ArrayList<>(copy.subList(0, n));

        String idSesi = "#CBT-RND-" + (1000 + (int) (Math.random() * 9000));
        SesiLatihan sesi = new SesiLatihan(
                (int) (System.currentTimeMillis() % 100000),
                siswaId,
                ModeLatihan.ACAK,
                idSesi,
                judulModul != null ? judulModul : "IPA Terpadu • Latihan Soal Acak",
                kelasTingkat != null ? kelasTingkat : "Kelas 8 SMP",
                terpilih.size(),
                15 // 15 menit
        );
        sesi.setDaftarSoal(terpilih);
        return sesi;
    }
}
