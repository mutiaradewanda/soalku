package com.soalku.strategy;

import com.soalku.model.ModeLatihan;
import com.soalku.model.RiwayatJawaban;
import com.soalku.model.SesiLatihan;
import com.soalku.model.Soal;

import java.util.List;

/**
 * Strategy Design Pattern untuk mode latihan siswa.
 * Memisahkan algoritma seleksi soal dan konfigurasi sesi (Acak, Berwaktu, Fokus Kelemahan).
 */
public interface LatihanStrategy {
    ModeLatihan getMode();

    SesiLatihan inisialisasiSesi(
            int siswaId,
            String judulModul,
            String kelasTingkat,
            List<Soal> bankSoal,
            List<RiwayatJawaban> riwayatSiswa,
            int jumlahSoal
    );
}
