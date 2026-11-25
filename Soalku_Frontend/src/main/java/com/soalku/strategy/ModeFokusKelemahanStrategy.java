package com.soalku.strategy;

import com.soalku.model.ModeLatihan;
import com.soalku.model.RiwayatJawaban;
import com.soalku.model.SesiLatihan;
import com.soalku.model.Soal;

import java.util.*;

/**
 * Mode Fokus Kelemahan (Adaptive AI Strategy).
 * Menganalisis riwayat jawaban salah siswa berdasarkan tag topik (bagian_materi_id),
 * lalu mengutamakan butir soal dari topik-topik dengan tingkat kesalahan tertinggi.
 */
public class ModeFokusKelemahanStrategy implements LatihanStrategy {

    @Override
    public ModeLatihan getMode() {
        return ModeLatihan.FOKUS_KELEMAHAN;
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
        // Hitung persentase salah per bagianMateriId sesuai rumus PRD:
        // Bobot sebuah soal = 0.1 + persentase salah pada bagian materinya.
        // Bagian yang belum pernah dicoba diberi persentase salah awal 0.5 agar tetap muncul.
        Map<Integer, Integer> totalMencoba = new HashMap<>();
        Map<Integer, Integer> totalSalah = new HashMap<>();

        if (riwayatSiswa != null) {
            for (RiwayatJawaban r : riwayatSiswa) {
                int bmId = r.getBagianMateriId();
                totalMencoba.put(bmId, totalMencoba.getOrDefault(bmId, 0) + 1);
                if (!r.isBenar()) {
                    totalSalah.put(bmId, totalSalah.getOrDefault(bmId, 0) + 1);
                }
            }
        }

        // Urutkan soal berdasarkan bobot kelemahan siswa
        List<Soal> poolDisetujui = new ArrayList<>(bankSoal.stream()
                .filter(s -> s.getStatusReview() == com.soalku.model.StatusReview.DISETUJUI)
                .toList());

        poolDisetujui.sort((s1, s2) -> {
            double bobot1 = hitungBobotBagian(s1.getBagianMateriId(), totalMencoba, totalSalah);
            double bobot2 = hitungBobotBagian(s2.getBagianMateriId(), totalMencoba, totalSalah);
            return Double.compare(bobot2, bobot1); // Bobot tertinggi duluan
        });

        int n = Math.min(jumlahSoal, poolDisetujui.size());
        List<Soal> terpilih = new ArrayList<>(poolDisetujui.subList(0, n));

        String idSesi = "#CBT-BIO-" + (1000 + (int) (Math.random() * 9000));
        SesiLatihan sesi = new SesiLatihan(
                8824,
                siswaId,
                ModeLatihan.FOKUS_KELEMAHAN,
                idSesi,
                judulModul != null ? judulModul : "IPA Terpadu • Biologi Sistem Pencernaan",
                kelasTingkat != null ? kelasTingkat : "Kelas 8 SMP",
                terpilih.size(),
                15 // 15 menit
        );
        sesi.setDaftarSoal(terpilih);
        return sesi;
    }

    private double hitungBobotBagian(int bagianMateriId, Map<Integer, Integer> totalMencoba, Map<Integer, Integer> totalSalah) {
        int coba = totalMencoba.getOrDefault(bagianMateriId, 0);
        if (coba == 0) {
            // Belum pernah dicoba: persentase salah awal 0.5
            return 0.1 + 0.5;
        }
        int salah = totalSalah.getOrDefault(bagianMateriId, 0);
        double persentaseSalah = (double) salah / coba;
        return 0.1 + persentaseSalah;
    }
}
