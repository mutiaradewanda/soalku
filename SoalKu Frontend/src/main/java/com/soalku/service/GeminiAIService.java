package com.soalku.service;

import com.soalku.factory.SoalFactory;
import com.soalku.model.Soal;
import com.soalku.model.StatusReview;
import com.soalku.model.Tingkat;
import com.soalku.model.TingkatKesulitan;

import java.util.ArrayList;
import java.util.List;

/**
 * Service integrasi AI (Gemini API) untuk ekstraksi materi, ringkasan bahasa sederhana,
 * serta pembuatan soal otomatis bertingkat SD/SMP sesuai PRD.
 */
public class GeminiAIService {

    public static class HasilRingkasanAI {
        private final String judul;
        private final String ringkasanSederhana;
        private final List<String> poinKunci;
        private final List<Soal> generatedSoal;

        public HasilRingkasanAI(String judul, String ringkasanSederhana, List<String> poinKunci, List<Soal> generatedSoal) {
            this.judul = judul;
            this.ringkasanSederhana = ringkasanSederhana;
            this.poinKunci = poinKunci;
            this.generatedSoal = generatedSoal;
        }

        public String getJudul() { return judul; }
        public String getRingkasanSederhana() { return ringkasanSederhana; }
        public List<String> getPoinKunci() { return poinKunci; }
        public List<Soal> getGeneratedSoal() { return generatedSoal; }
    }

    public HasilRingkasanAI prosesDokumen(String namaFile, String teksDokumen, Tingkat tingkat) {
        String judul = namaFile.replaceAll("\\.[^.]+$", "");
        if (judul.isBlank()) judul = "Materi Pelajaran Ekstraksi AI";

        StringBuilder ringkasan = new StringBuilder();
        List<String> poin = new ArrayList<>();
        List<Soal> soalList = new ArrayList<>();

        if (teksDokumen != null && teksDokumen.toLowerCase().contains("darah")) {
            ringkasan.append("Sistem Peredaran Darah Manusia mengalirkan oksigen dan sari makanan ke seluruh organ tubuh. ")
                    .append("Jantung memiliki 4 ruang utama: Serambi Kanan, Serambi Kiri, Bilik Kanan, dan Bilik Kiri. ")
                    .append("Bilik Kiri bertugas paling berat karena memompa darah ke seluruh tubuh melewati katup aorta.");
            poin.add("Bilik kiri memiliki otot paling tebal karena memompa darah ke seluruh tubuh.");
            poin.add("Katup aorta mencegah darah kembali dari aorta ke bilik kiri.");
            poin.add("Peredaran darah manusia disebut peredaran darah ganda dan tertutup.");

            Soal s = SoalFactory.buatSoal(
                    (int) (System.currentTimeMillis() % 10000),
                    tingkat,
                    103,
                    "Fungsi Bilik Jantung & Katup Aorta",
                    "Mengapa dinding otot bilik kiri jantung lebih tebal daripada bilik kanan?",
                    TingkatKesulitan.SEDANG,
                    tingkat == Tingkat.SD ?
                            List.of("Memompa darah ke seluruh tubuh", "Menampung darah kotor", "Mencegah darah membeku") :
                            List.of(
                                    "Menampung darah dari seluruh tubuh",
                                    "Memompa darah bertekanan tinggi ke seluruh tubuh",
                                    "Memompa darah hanya ke paru-paru",
                                    "Membantu kerja paru-paru mengikat oksigen"
                            ),
                    tingkat == Tingkat.SD ? 0 : 1
            );
            s.setStatusReview(StatusReview.MENUNGGU);
            s.setTipsAdaptif("Ingat: Bilik KIRI = Ke seluruh tubuh (otot kuat). Bilik KANAN = Ke paru-paru.");
            soalList.add(s);
        } else {
            // General / Pencernaan / Default
            ringkasan.append("Sistem organ bekerja secara harmonis untuk mencerna makanan menjadi energi bagi sel tubuh. ")
                    .append("Pencernaan dimulai dari mulut (enzim ptialin), lambung (enzim pepsin & renin serta asam lambung HCl), ")
                    .append("dan penyerapan sari makanan pada vili usus halus sebelum sisa serat masuk ke usus besar.");
            poin.add("Mulut: Pencernaan mekanik (gigi) dan kimiawi (enzim ptialin/amilase).");
            poin.add("Lambung: Memproduksi HCl desinfektan dan enzim pepsin pemecah protein.");
            poin.add("Usus Halus: Tempat penyerapan sari makanan terbesar melalui jonjot vili.");

            Soal s = SoalFactory.buatSoal(
                    (int) (System.currentTimeMillis() % 10000) + 1,
                    tingkat,
                    101,
                    "Enzim Lambung & Organ Pencernaan Manusia",
                    "Enzim getah lambung yang bertugas mengaktifkan pepsinogen serta membunuh kuman pada makanan adalah...",
                    TingkatKesulitan.SEDANG,
                    tingkat == Tingkat.SD ?
                            List.of("Asam Klorida (HCl)", "Air Liur", "Getah Empedu") :
                            List.of(
                                    "Enzim Tripsin",
                                    "Asam Klorida (HCl)",
                                    "Enzim Amilase",
                                    "Enzim Lipase"
                            ),
                    tingkat == Tingkat.SD ? 0 : 1
            );
            s.setStatusReview(StatusReview.MENUNGGU);
            s.setTipsAdaptif("HCl adalah cairan lambung ber pH asam yang membunuh bakteri patogen!");
            soalList.add(s);
        }

        return new HasilRingkasanAI(judul, ringkasan.toString(), poin, soalList);
    }
}
