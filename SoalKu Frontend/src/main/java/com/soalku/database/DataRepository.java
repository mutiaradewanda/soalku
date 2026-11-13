package com.soalku.database;

import com.soalku.factory.SoalFactory;
import com.soalku.model.*;

import java.util.*;

public class DataRepository {
    private static DataRepository instance;
    private final List<Pengguna> penggunaList = new ArrayList<>();
    private final List<Materi> materiList = new ArrayList<>();
    private final List<BagianMateri> bagianMateriList = new ArrayList<>();
    private final List<Soal> bankSoal = new ArrayList<>();
    private final List<RiwayatJawaban> riwayatList = new ArrayList<>();
    private final List<KodeUndangan> kodeUndanganList = new ArrayList<>();
    private final List<SiswaBinaan> siswaBinaanList = new ArrayList<>();

    private Pengguna currentSiswaSD;
    private Pengguna currentSiswaSMP;
    private Pengguna currentGuru;
    private Pengguna currentSiswa;
    private Pengguna currentMentor;
    private Role currentActiveRole = Role.SISWA_SMP;

    private DataRepository() {
        seedInitialData();
    }

    public static synchronized DataRepository getInstance() {
        if (instance == null) {
            instance = new DataRepository();
        }
        return instance;
    }

    private void seedInitialData() {
        // 1. Pengguna 3 Role
        currentSiswaSD = new Pengguna(1, "Adit Pratama", "adit@sd.soalku.id", Role.SISWA_SD, "Siswa SD Kelas 4");
        currentSiswaSD.setNisn("0012345678");
        currentSiswaSD.setKelas("4");
        currentSiswaSD.setNamaOrangTua("Bpk. Bambang Pamungkas");
        currentSiswaSD.setStreakHari(3);
        currentSiswaSD.setXpPekanIni(850);
        penggunaList.add(currentSiswaSD);

        currentSiswaSMP = new Pengguna(2, "Arya Pratama", "arya@sekolah.sch.id", Role.SISWA_SMP, "Siswa SMP Kelas 8");
        currentSiswaSMP.setNisn("0098765432");
        currentSiswaSMP.setKelas("8");
        currentSiswaSMP.setNoHp("081234567890");
        currentSiswaSMP.setStreakHari(5);
        currentSiswaSMP.setXpPekanIni(1450);
        currentSiswaSMP.setTargetHarianSelesai(3);
        currentSiswaSMP.setTargetHarianTotal(4);
        currentSiswaSMP.setKuotaAITutor(82);
        penggunaList.add(currentSiswaSMP);

        currentGuru = new Pengguna(3, "Bu Ratna Kumalasari, S.Pd.", "ratna@sekolah.sch.id", Role.GURU, "Wali Kelas • Guru IPA Terpadu");
        currentGuru.setNuptk("198507202010011005");
        currentGuru.setMataPelajaran("IPA Terpadu & Biologi");
        penggunaList.add(currentGuru);

        // Kompatibilitas referensi lama
        currentSiswa = currentSiswaSMP;
        currentMentor = currentGuru;

        // 2. Kode Undangan
        kodeUndanganList.add(new KodeUndangan(1, "GURU-SMP-2026", 2, "AKTIF", java.time.LocalDateTime.now().plusMonths(6)));
        kodeUndanganList.add(new KodeUndangan(2, "GURU-IPA-2026", 2, "AKTIF", java.time.LocalDateTime.now().plusMonths(3)));

        // 2.1 Siswa Binaan Kelas Mentor (Use Case 7: Lihat Progres Siswa)
        siswaBinaanList.add(new SiswaBinaan(1, "Arya Pratama", "Kelas 8-A SMP", 14, 82, "Sistem Peredaran Darah (42%)", "Perlu Remedial", "Cermati kembali aliran vena paru pada ringkasan AI ya."));
        siswaBinaanList.add(new SiswaBinaan(2, "Mutiara Dewanda", "Kelas 8-A SMP", 18, 92, "Tidak ada (Tuntas Semua)", "Tuntas", "Prestasi belajar sangat konsisten, pertahankan!"));
        siswaBinaanList.add(new SiswaBinaan(3, "Dzaky Ahsanal", "Kelas 8-A SMP", 12, 74, "Enzim Lambung & Organ (55%)", "Bimbingan", "Perlu penguatan hafalan enzim getah lambung [R-P-L]."));
        siswaBinaanList.add(new SiswaBinaan(4, "Raffi Azzaky", "Kelas 8-A SMP", 15, 86, "Faktorisasi Aljabar Kuadrat (68%)", "Tuntas", "Pemahaman konsep sudah baik, latihan soal berwaktu ditingkatkan."));
        siswaBinaanList.add(new SiswaBinaan(5, "Mohammad Thoriq", "Kelas 8-A SMP", 16, 88, "Unsur Intrinsik Cerpen (72%)", "Tuntas", "Daya analisis soal cerita sangat baik."));

        // 3. Materi & Bagian Materi
        Materi m1 = new Materi(1, "Biologi Sistem Pencernaan", Tingkat.SMP, "Bab 4.1", "IPA Biologi", "Fungsi enzim pepsin, renin, ptialin, serta penyerapan nutrisi usus halus", 40);
        Materi m2 = new Materi(2, "Aljabar Dasar & Faktorisasi", Tingkat.SMP, "Bab 3.2", "Matematika", "Penyederhanaan suku sejenis, faktorisasi kuadrat selisih dua kuadrat", 78);
        Materi m3 = new Materi(3, "Unsur Intrinsik Cerpen", Tingkat.SMP, "Bab 2.4", "B. Indonesia", "Analisis tema, alur maju-mundur, sudut pandang orang pertama", 85);
        Materi m4 = new Materi(4, "Sistem Peredaran Darah Manusia", Tingkat.SMP, "Bab 4.2", "IPA Terpadu (Biologi)", "Fungsi bilik jantung, katup aorta, dan peredaran darah ganda", 42);

        materiList.addAll(List.of(m1, m2, m3, m4));

        BagianMateri bm1 = new BagianMateri(101, 1, "Enzim Lambung & Organ Pencernaan Manusia", "Enzim pepsin dan HCl diproduksi oleh dinding lambung...", 1);
        BagianMateri bm2 = new BagianMateri(102, 1, "Proses Penyerapan di Usus Halus", "Vili usus halus menyerap nutrisi makanan...", 2);
        BagianMateri bm3 = new BagianMateri(103, 4, "Fungsi Bilik Jantung & Katup Aorta", "Bilik kiri memompa darah kaya O2 ke seluruh tubuh melewati katup aorta...", 1);
        BagianMateri bm4 = new BagianMateri(104, 2, "Faktorisasi Bentuk Kuadrat", "Penyederhanaan aljabar bentuk (a+b)(a-b)...", 1);

        bagianMateriList.addAll(List.of(bm1, bm2, bm3, bm4));

        // 4. Soal Bank (Termasuk Soal No. 7 persis seperti di Gambar Mockup)
        // Soal 1..6
        for (int i = 1; i <= 6; i++) {
            Soal s = SoalFactory.buatSoal(
                    i,
                    Tingkat.SMP,
                    101,
                    "Enzim Lambung & Organ Pencernaan Manusia",
                    "Soal No. " + i + ": Manakah fungsi utama dari getah lambung dalam proses pencernaan mekanik dan kimiawi?",
                    TingkatKesulitan.SEDANG,
                    List.of(
                            "Mengubah amilum menjadi maltosa",
                            "Membunuh kuman penyakit dan mengaktifkan pepsinogen",
                            "Menetralkan asam yang berasal dari kerongkongan",
                            "Mengemulsikan lemak menjadi asam lemak"
                    ),
                    1 // B benar
            );
            s.setStatusReview(StatusReview.DISETUJUI);
            bankSoal.add(s);
        }

        // Soal 7 (Sesuai persis dengan gambar mockup)
        Soal soal7 = SoalFactory.buatSoal(
                7,
                Tingkat.SMP,
                101,
                "Enzim Lambung & Organ Pencernaan Manusia",
                "Perhatikan gambar organ pencernaan berikut! Enzim pepsin dan asam klorida (HCl) yang berfungsi mengaktifkan pepsinogen serta membunuh kuman penyakit dihasilkan pada bagian organ yang ditunjukkan oleh nomor...",
                TingkatKesulitan.SEDANG,
                List.of(
                        "Mulut — Organ nomor (1)",
                        "Lambung — Organ nomor (2)",
                        "Hati — Organ nomor (3)",
                        "Usus Halus — Organ nomor (4)"
                ),
                1 // Jawaban B (Lambung — Organ nomor 2)
        );
        soal7.setStatusReview(StatusReview.DISETUJUI);
        soal7.setTipsAdaptif("Ingat singkatan enzim getah lambung dengan rumus: [R - P - L]\n• Renin: mengendapkan protein kasein susu\n• Pepsin: memecah protein jadi pepton\n• Lambung asam (HCl): desinfektan kuman");
        soal7.setJembatanKeledai("Jembatan Keledai: R-P-L (Renin - Pepsin - Lambung HCl)");
        soal7.setInsightKelemahan("Berdasarkan performa terakhirmu, kamu sering tertukar fungsi pepsin (lambung) dengan tripsin (usus halus).");
        bankSoal.add(soal7);

        // Soal 8..10
        Soal soal8 = SoalFactory.buatSoal(
                8,
                Tingkat.SMP,
                101,
                "Enzim Lambung & Organ Pencernaan Manusia",
                "Bagian organ yang memiliki vili-vili kecil untuk memperluas bidang penyerapan nutrisi adalah...",
                TingkatKesulitan.MUDAH,
                List.of("Ventrikulus", "Intestinum (Usus Halus)", "Hepar (Hati)", "Esofagus"),
                1
        );
        soal8.setStatusReview(StatusReview.DISETUJUI);
        bankSoal.add(soal8);

        Soal soal9 = SoalFactory.buatSoal(
                9,
                Tingkat.SMP,
                103,
                "Fungsi Bilik Jantung & Katup Aorta",
                "Mengapa dinding bilik kiri (ventrikel sinister) jantung lebih tebal dibandingkan bilik kanan?",
                TingkatKesulitan.SULIT,
                List.of(
                        "Karena hanya memompa darah ke organ paru-paru",
                        "Karena memerlukan tekanan tinggi untuk memompa darah kaya O2 ke seluruh tubuh",
                        "Karena menerima darah yang mengandung banyak CO2 dari seluruh tubuh",
                        "Karena katup trikuspidalis bekerja lebih lambat"
                ),
                1
        );
        soal9.setStatusReview(StatusReview.DISETUJUI);
        bankSoal.add(soal9);

        Soal soal10 = SoalFactory.buatSoal(
                10,
                Tingkat.SMP,
                103,
                "Fungsi Bilik Jantung & Katup Aorta",
                "Kerusakan pada katup aorta dapat mengakibatkan aliran darah kembali ke...",
                TingkatKesulitan.SEDANG,
                List.of("Bilik Kiri (Ventrikel Sinister)", "Serambi Kanan", "Paru-Paru", "Vena Kava"),
                0
        );
        soal10.setStatusReview(StatusReview.DISETUJUI);
        bankSoal.add(soal10);

        // Tambah soal SD untuk mendemonstrasikan SoalFactory SD (3 opsi)
        Soal soalSD = SoalFactory.buatSoal(
                11,
                Tingkat.SD,
                101,
                "Organ Tubuh Manusia",
                "Makanan yang kita telan akan masuk ke lambung melalui...",
                TingkatKesulitan.MUDAH,
                List.of("Tenggorokan", "Kerongkongan", "Hidung"),
                1
        );
        soalSD.setStatusReview(StatusReview.DISETUJUI);
        bankSoal.add(soalSD);

        // Tambah soal hasil generate AI yang MENUNGGU review Mentor
        Soal soalReview1 = SoalFactory.buatSoal(
                12,
                Tingkat.SMP,
                101,
                "Enzim Lambung & Organ Pencernaan Manusia",
                "[AI Generated] Enzim renin berfungsi menggumpalkan protein susu (kasein). Pada bayi, enzim ini sangat aktif karena...",
                TingkatKesulitan.SEDANG,
                List.of(
                        "Bayi belum memiliki gigi geligi",
                        "Sumber makanan utama bayi adalah ASI / susu",
                        "Lambung bayi belum mampu memproduksi HCl",
                        "Usus halus bayi belum berkembang sempurna"
                ),
                1
        );
        soalReview1.setStatusReview(StatusReview.MENUNGGU);
        bankSoal.add(soalReview1);

        Soal soalReview2 = SoalFactory.buatSoal(
                13,
                Tingkat.SMP,
                103,
                "Fungsi Bilik Jantung & Katup Aorta",
                "[AI Generated] Tekanan darah sistol dicatat saat ventrikel jantung sedang mengalami...",
                TingkatKesulitan.SEDANG,
                List.of(
                        "Kontraksi dan memompa darah keluar",
                        "Relaksasi dan menerima darah dari atrium",
                        "Penutupan katup bikuspidalis secara pasif",
                        "Pembekuan darah di dalam arteri pulmonalis"
                ),
                0
        );
        soalReview2.setStatusReview(StatusReview.MENUNGGU);
        bankSoal.add(soalReview2);

        // 5. Riwayat Jawaban Siswa (untuk simulasi kelemahan: 7 dari 12 salah pada Bab Sistem Peredaran Darah)
        for (int i = 0; i < 7; i++) {
            riwayatList.add(new RiwayatJawaban(i + 1, 1001, 9, 103, 1, false)); // Salah di 103 (Peredaran darah)
        }
        for (int i = 0; i < 5; i++) {
            riwayatList.add(new RiwayatJawaban(i + 10, 1001, 10, 103, 1, true)); // Benar di 103
        }
        // Riwayat benar di pencernaan
        for (int i = 0; i < 15; i++) {
            riwayatList.add(new RiwayatJawaban(i + 20, 1002, 7, 101, 1, true));
        }
    }

    // Accessors
    public Pengguna getCurrentSiswaSD() { return currentSiswaSD; }
    public Pengguna getCurrentSiswaSMP() { return currentSiswaSMP; }
    public Pengguna getCurrentGuru() { return currentGuru; }
    public Pengguna getCurrentSiswa() { return currentSiswa; }
    public Pengguna getCurrentMentor() { return currentMentor; }
    public Role getCurrentActiveRole() { return currentActiveRole; }
    public void setCurrentActiveRole(Role role) { this.currentActiveRole = role; }

    public List<Materi> getMateriList() { return materiList; }
    public List<BagianMateri> getBagianMateriList() { return bagianMateriList; }
    public List<Soal> getBankSoal() { return bankSoal; }
    public List<RiwayatJawaban> getRiwayatList() { return riwayatList; }
    public List<KodeUndangan> getKodeUndanganList() { return kodeUndanganList; }
    public List<SiswaBinaan> getSiswaBinaanList() { return siswaBinaanList; }

    public boolean validasiKodeUndangan(String kode) {
        if (kode == null || kode.isBlank()) return false;
        String clean = kode.trim().toUpperCase();
        for (KodeUndangan k : kodeUndanganList) {
            if (k.getKode().equalsIgnoreCase(clean) && "AKTIF".equalsIgnoreCase(k.getStatus())) {
                return true;
            }
        }
        return false;
    }

    public void tambahKodeUndangan(String kode, java.time.LocalDateTime expiredAt) {
        int nextId = kodeUndanganList.size() + 1;
        kodeUndanganList.add(new KodeUndangan(nextId, kode.trim().toUpperCase(), currentMentor.getId(), "AKTIF", expiredAt));
    }

    public void editSoal(int soalId, String pertanyaanBaru, List<String> opsiBaru, int kunciIndex, String tipsBaru) {
        for (Soal s : bankSoal) {
            if (s.getId() == soalId) {
                if (pertanyaanBaru != null && !pertanyaanBaru.isBlank()) {
                    s.setPertanyaan(pertanyaanBaru.trim());
                }
                if (tipsBaru != null) {
                    s.setTipsAdaptif(tipsBaru.trim());
                }
                if (opsiBaru != null && !opsiBaru.isEmpty()) {
                    List<OpsiJawaban> existingOpsi = s.getOpsiList();
                    for (int i = 0; i < Math.min(existingOpsi.size(), opsiBaru.size()); i++) {
                        existingOpsi.get(i).setTeksOpsi(opsiBaru.get(i));
                        existingOpsi.get(i).setBenar(i == kunciIndex);
                    }
                }
                break;
            }
        }
    }

    public void updateCatatanSiswa(int siswaId, String catatan) {
        for (SiswaBinaan sb : siswaBinaanList) {
            if (sb.getId() == siswaId) {
                sb.setCatatanGuru(catatan);
                break;
            }
        }
    }

    public List<Soal> getSoalMenungguReview() {
        List<Soal> list = new ArrayList<>();
        for (Soal s : bankSoal) {
            if (s.getStatusReview() == StatusReview.MENUNGGU) {
                list.add(s);
            }
        }
        return list;
    }

    public void setujuiSoal(int soalId) {
        for (Soal s : bankSoal) {
            if (s.getId() == soalId) {
                s.setStatusReview(StatusReview.DISETUJUI);
                s.setDireviewOleh(currentMentor.getId());
                break;
            }
        }
    }

    public void tolakSoal(int soalId) {
        for (Soal s : bankSoal) {
            if (s.getId() == soalId) {
                s.setStatusReview(StatusReview.DITOLAK);
                s.setDireviewOleh(currentMentor.getId());
                break;
            }
        }
    }

    public List<Soal> getSoalDisetujui() {
        List<Soal> list = new ArrayList<>();
        for (Soal s : bankSoal) {
            if (s.getStatusReview() == StatusReview.DISETUJUI) {
                list.add(s);
            }
        }
        return list;
    }

    public List<Soal> getSoalDisetujuiByTingkat(Tingkat tingkat) {
        List<Soal> list = new ArrayList<>();
        for (Soal s : bankSoal) {
            if (s.getStatusReview() == StatusReview.DISETUJUI && s.getTingkat() == tingkat) {
                list.add(s);
            }
        }
        return list;
    }

    public void tambahMateri(Materi m, List<BagianMateri> bagianList) {
        materiList.add(m);
        if (bagianList != null) {
            bagianMateriList.addAll(bagianList);
        }
    }

    public void regenerateBagianMateri(int bagianMateriId) {
        for (BagianMateri bm : bagianMateriList) {
            if (bm.getId() == bagianMateriId) {
                bm.setStatus("DIGENERATE");
                // Tambahkan atau pastikan ada soal draft MENUNGGU untuk bagian ini
                boolean hasWaiting = bankSoal.stream()
                        .anyMatch(s -> s.getBagianMateriId() == bagianMateriId && s.getStatusReview() == StatusReview.MENUNGGU);
                if (!hasWaiting) {
                    Soal newSoal = SoalFactory.buatSoal(
                            (int) (System.currentTimeMillis() % 10000) + 50,
                            Tingkat.SMP,
                            bagianMateriId,
                            bm.getJudulBagian(),
                            "[Regenerate AI] Butir soal evaluasi pemahaman untuk materi " + bm.getJudulBagian() + ": Manakah pernyataan yang paling tepat?",
                            TingkatKesulitan.SEDANG,
                            List.of("Pernyataan konsep dasar A", "Pernyataan konsep dasar B (Kunci)", "Pernyataan konsep dasar C", "Pernyataan konsep dasar D"),
                            1
                    );
                    newSoal.setStatusReview(StatusReview.MENUNGGU);
                    newSoal.setTipsAdaptif("Perhatikan hubungan sebab-akibat pada teks modul bagian ini.");
                    bankSoal.add(newSoal);
                }
                break;
            }
        }
    }

    public void simpanRiwayat(SesiLatihan sesi) {
        for (Map.Entry<Integer, Integer> entry : sesi.getJawabanMap().entrySet()) {
            int soalId = entry.getKey();
            Integer opsiId = entry.getValue();

            Soal soal = bankSoal.stream().filter(s -> s.getId() == soalId).findFirst().orElse(null);
            if (soal != null) {
                boolean benar = (opsiId != null) && soal.cekJawaban(opsiId);
                RiwayatJawaban r = new RiwayatJawaban(
                        (int) (System.currentTimeMillis() % 1000000),
                        sesi.getId(),
                        soalId,
                        soal.getBagianMateriId(),
                        opsiId,
                        benar
                );
                Boolean ragu = sesi.getRaguMap().get(soalId);
                r.setRagu(Boolean.TRUE.equals(ragu));
                riwayatList.add(r);
            }
        }
    }
}
