import { Materi, BagianMateri, SoalMateri, TingkatMateri } from "../types/materi";

export interface HasilEkstraksiAI {
  judul: string;
  mataPelajaran: string;
  bab: string;
  deskripsi: string;
  poinKunci: string[];
  bagianMateri: BagianMateri[];
}

export const extractAndProcessDocument = async (
  fileName: string,
  rawText: string,
  tingkat: TingkatMateri,
  fileSizeKb: number = 250
): Promise<Materi> => {
  // Simulasi progress AI latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const cleanTitle = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .trim();

  const textLower = (cleanTitle + " " + rawText).toLowerCase();
  const materiId = Date.now();

  let mataPelajaran = "Ilmu Pengetahuan Alam (IPA)";
  let bab = "Bab 1.1";
  let ringkasanUtama = "";
  let poinKunci: string[] = [];
  let bagianList: BagianMateri[] = [];

  if (textLower.includes("darah") || textLower.includes("jantung") || textLower.includes("sirkulasi")) {
    mataPelajaran = tingkat === "SD" ? "IPAS (Ilmu Pengetahuan Alam & Sosial)" : "IPA Biologi Terpadu";
    bab = "Bab 4.2";
    ringkasanUtama =
      tingkat === "SD"
        ? "Darah mengalir ke seluruh tubuh kita membawa oksigen dan makanan. Jantung bertugas memompa darah tanpa henti siang dan malam!"
        : "Sistem peredaran darah manusia merupakan peredaran darah tertutup dan ganda. Jantung memiliki 4 ruang utama di mana bilik kiri memompa darah beroksigen ke seluruh tubuh melewati katup aorta.";

    poinKunci = [
      "Jantung terbagi menjadi 4 ruang: Serambi Kanan, Serambi Kiri, Bilik Kanan, dan Bilik Kiri.",
      "Bilik kiri memiliki otot paling tebal karena memompa darah ke seluruh bagian tubuh.",
      "Katup aorta menjaga agar darah yang sudah dipompa ke aorta tidak mengalir kembali ke bilik kiri.",
      tingkat === "SMP"
        ? "Jembatan Keledai: [P-T-G] -> Peredaran Tertutup dan Ganda."
        : "Jantung manusia berdetak sekitar 70-80 kali setiap menit.",
    ];

    const bmId1 = materiId + 1;
    const bmId2 = materiId + 2;

    bagianList = [
      {
        id: bmId1,
        materiId,
        judulBagian: "Struktur Ruang Jantung & Ketebalan Otot",
        teksRingkasan:
          "Dinding bilik kiri lebih tebal 3 kali lipat dibandingkan bilik kanan karena membutuhkan tekanan hidrostatik tinggi untuk menyalurkan darah ke ujung kepala hingga jari kaki.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: [
          createSoal(
            bmId1 * 10 + 1,
            bmId1,
            "Mengapa otot pada dinding bilik kiri jantung manusia lebih tebal dibandingkan bilik kanan?",
            tingkat === "SD"
              ? [
                  { label: "A", teks: "Karena memompa darah ke seluruh tubuh yang jauh", isBenar: true },
                  { label: "B", teks: "Karena menampung makanan dari lambung", isBenar: false },
                  { label: "C", teks: "Karena hanya memompa darah ke paru-paru", isBenar: false },
                ]
              : [
                  { label: "A", teks: "Membutuhkan tekanan tinggi untuk memompa darah ke seluruh tubuh", isBenar: true },
                  { label: "B", teks: "Hanya menyalurkan darah kotor menuju pulmo", isBenar: false },
                  { label: "C", teks: "Sebagai tempat penampungan pertama darah dari vena kava", isBenar: false },
                  { label: "D", teks: "Menjaga keseimbangan asam basa cairan perikardium", isBenar: false },
                ],
            "A",
            "Bilik kiri memompa darah bersih kaya O2 ke seluruh jaringan tubuh melalui pembuluh aorta.",
            "SEDANG"
          ),
        ],
      },
      {
        id: bmId2,
        materiId,
        judulBagian: "Fungsi Katup Jantung & Pembuluh Aorta",
        teksRingkasan:
          "Katup semilunaris aorta terletak di antara bilik kiri dan pangkal aorta untuk mencegah regurgitasi (aliran balik) darah saat fase diastol relaksasi jantung.",
        urutan: 2,
        status: "DIGENERATE",
        generatedSoal: [
          createSoal(
            bmId2 * 10 + 1,
            bmId2,
            "Fungsi utama katup aorta pada saluran sirkulasi darah manusia adalah...",
            tingkat === "SD"
              ? [
                  { label: "A", teks: "Menjaga agar darah tidak kembali ke bilik kiri", isBenar: true },
                  { label: "B", teks: "Menyaring kotoran dan kuman", isBenar: false },
                  { label: "C", teks: "Membuat darah menjadi berwarna merah", isBenar: false },
                ]
              : [
                  { label: "A", teks: "Mencegah aliran balik darah dari aorta ke bilik kiri saat ventrikel relaksasi", isBenar: true },
                  { label: "B", teks: "Menerima darah kaya karbondioksida dari seluruh tubuh", isBenar: false },
                  { label: "C", teks: "Mengatur pertukaran gas di alveolus", isBenar: false },
                  { label: "D", teks: "Memicu kontraksi otomatis nodus sinoatrial (SA node)", isBenar: false },
                ],
            "A",
            "Katup aorta memastikan aliran darah selalu searah menuju sistemik tubuh dan tidak membalik ke ventrikel kiri.",
            "SEDANG"
          ),
        ],
      },
    ];
  } else if (textLower.includes("cerna") || textLower.includes("lambung") || textLower.includes("enzim")) {
    mataPelajaran = "IPA Biologi";
    bab = "Bab 4.1";
    ringkasanUtama =
      tingkat === "SD"
        ? "Makanan yang kita makan masuk melalui mulut, dikunyah dengan gigi dan enzim ludah, lalu dicerna di lambung dan diserap gizinya di usus halus."
        : "Proses pencernaan manusia melibatkan pencernaan mekanik dan kimiawi. Di lambung diproduksi enzim pepsin, renin, dan asam klorida (HCl). Penyerapan nutrisi makanan berlangsung di vili usus halus.";

    poinKunci = [
      "Pencernaan mekanik dilakukan dengan gerakan mengunyah dan peristaltik otot saluran cerna.",
      "Enzim ptialin (amilase) di mulut menguraikan zat tepung (amilum) menjadi maltosa.",
      "Lambung menghasilkan getah lambung dengan rumus hafalan AI: [R-P-L] -> Renin, Pepsin, Lambung (asam HCl).",
      "Vili pada dinding usus halus memperluas bidang penyerapan sari-sari makanan.",
    ];

    const bmId1 = materiId + 1;
    const bmId2 = materiId + 2;

    bagianList = [
      {
        id: bmId1,
        materiId,
        judulBagian: "Pencernaan Lambung & Enzim Getah Lambung",
        teksRingkasan:
          "Di dalam ventrikulus (lambung), makanan dihancurkan secara kimiawi oleh enzim pepsin (pengurai protein menjadi pepton), renin (pengendap kasein susu), dan asam HCl (disinfektan kuman patogen).",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: [
          createSoal(
            bmId1 * 10 + 1,
            bmId1,
            "Peran utama asam lambung (HCl) dalam sistem pencernaan kimiawi lambung adalah...",
            tingkat === "SD"
              ? [
                  { label: "A", teks: "Membunuh kuman penyakit dan mengaktifkan enzim", isBenar: true },
                  { label: "B", teks: "Mengubah karbohidrat menjadi gula manis", isBenar: false },
                  { label: "C", teks: "Membantu menelan makanan padat", isBenar: false },
                ]
              : [
                  { label: "A", teks: "Membunuh kuman patogen serta mengaktifkan pepsinogen menjadi pepsin", isBenar: true },
                  { label: "B", teks: "Mengemulsikan lemak menjadi asam lemak dan gliserol", isBenar: false },
                  { label: "C", teks: "Mengubah maltosa menjadi glukosa sederhana", isBenar: false },
                  { label: "D", teks: "Menyerap sisa cairan air di kolon desenden", isBenar: false },
                ],
            "A",
            "Asam klorida (HCl) menciptakan suasana asam (pH 1-2) untuk membunuh bakteri makanan dan mengaktifkan pepsin.",
            "MUDAH"
          ),
        ],
      },
      {
        id: bmId2,
        materiId,
        judulBagian: "Penyerapan Nutrisi di Intestinum (Usus Halus)",
        teksRingkasan:
          "Usus halus terdiri dari duodenum, jejenum, dan ileum. Dinding ileum dipenuhi jonjot usus (vili) yang menyerap asam amino, glukosa, vitamin, dan mineral ke aliran darah kapiler.",
        urutan: 2,
        status: "DIGENERATE",
        generatedSoal: [
          createSoal(
            bmId2 * 10 + 1,
            bmId2,
            "Mengapa permukaan dalam usus halus berlipat-lipat dan memiliki banyak vili (jonjot usus)?",
            tingkat === "SD"
              ? [
                  { label: "A", teks: "Agar penyerapan sari makanan menjadi lebih luas dan cepat", isBenar: true },
                  { label: "B", teks: "Agar makanan tidak cepat membusuk", isBenar: false },
                  { label: "C", teks: "Untuk menyimpan cadangan air", isBenar: false },
                ]
              : [
                  { label: "A", teks: "Memperluas bidang permukaan untuk memaksimalkan absorpsi sari makanan", isBenar: true },
                  { label: "B", teks: "Memperlambat laju makanan agar enzim bekerja berulang", isBenar: false },
                  { label: "C", teks: "Mencegah asam lambung masuk ke peredaran darah", isBenar: false },
                  { label: "D", teks: "Menghasilkan sel darah merah baru bagi tubuh", isBenar: false },
                ],
            "A",
            "Vili dan mikrovili meningkatkan luas permukaan usus halus hingga puluhan kali lipat sehingga nutrisi terserap efektif.",
            "SEDANG"
          ),
        ],
      },
    ];
  } else if (textLower.includes("aljabar") || textLower.includes("matematika") || textLower.includes("kuadrat")) {
    mataPelajaran = "Matematika";
    bab = "Bab 3.2";
    ringkasanUtama =
      "Aljabar mempelajari hubungan variabel, koefisien, dan konstanta. Konsep faktorisasi aljabar kuadrat sangat penting untuk menyederhanakan perhitungan pecahan aljabar.";

    poinKunci = [
      "Variabel adalah lambang pengganti bilangan (misal x, y, z).",
      "Koefisien adalah angka pengali di depan variabel (pada 5x, angka 5 adalah koefisien).",
      "Rumus Selisih Kuadrat AI: a² - b² = (a + b)(a - b).",
    ];

    const bmId1 = materiId + 1;
    bagianList = [
      {
        id: bmId1,
        materiId,
        judulBagian: "Faktorisasi Bentuk Selisih Dua Kuadrat",
        teksRingkasan:
          "Bentuk selisih dua kuadrat a² - b² selalu dapat difaktorkan menjadi perkalian suku sekawan: (a + b)(a - b).",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: [
          createSoal(
            bmId1 * 10 + 1,
            bmId1,
            "Hasil faktorisasi dari bentuk aljabar x² - 25 adalah...",
            [
              { label: "A", teks: "(x + 5)(x - 5)", isBenar: true },
              { label: "B", teks: "(x - 5)(x - 5)", isBenar: false },
              { label: "C", teks: "(x + 5)(x + 5)", isBenar: false },
              { label: "D", teks: "(x - 25)(x + 1)", isBenar: false },
            ],
            "A",
            "Sesuai rumus a² - b² = (a + b)(a - b), di mana a = x dan b = 5.",
            "SEDANG"
          ),
        ],
      },
    ];
  } else {
    // Topik Umum / Dokumen Kustom yang diunggah siswa
    mataPelajaran = tingkat === "SD" ? "Tematik Terpadu" : "Materi Terpadu";
    bab = "Bab Ekstraksi Mandiri";
    ringkasanUtama =
      tingkat === "SD"
        ? `Dokumen "${cleanTitle}" telah berhasil disederhanakan oleh AI ke bahasa yang mudah dipelajari. Pelajari poin penting di bawah ini untuk meningkatkan prestasimu!`
        : `Hasil ekstraksi komprehensif dokumen "${cleanTitle}". Materi dianalisis berdasarkan struktur topik esensial, menghasilkan rangkuman fokus dan butir latihan adaptif siap uji.`;

    poinKunci = [
      `Konsep esensial dari berkas ${cleanTitle} telah dipetakan ke dalam unit topik berjenjang.`,
      "Pemahaman konsep dasar diperkuat dengan latihan adaptif berkala.",
      "Gunakan fitur Generate Ulang jika ingin memperluas variasi butir soal latihan.",
    ];

    const bmId1 = materiId + 1;
    const bmId2 = materiId + 2;

    bagianList = [
      {
        id: bmId1,
        materiId,
        judulBagian: `Konsep Utama: ${cleanTitle}`,
        teksRingkasan:
          rawText.trim().length > 30
            ? rawText.trim().slice(0, 280) + "..."
            : `Ringkasan materi "${cleanTitle}" yang diekstraksi secara otomatis melalui mesin kecerdasan buatan SoalKu.`,
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: [
          createSoal(
            bmId1 * 10 + 1,
            bmId1,
            `Berdasarkan ringkasan materi ${cleanTitle}, apakah simpulan utama yang tepat?`,
            tingkat === "SD"
              ? [
                  { label: "A", teks: "Konsep materi dapat dipahami melalui pengamatan teratur", isBenar: true },
                  { label: "B", teks: "Materi ini hanya berlaku untuk hafalan sesaat", isBenar: false },
                  { label: "C", teks: "Tidak ada hubungan antara teori dan praktik", isBenar: false },
                ]
              : [
                  { label: "A", teks: "Pemahaman konsep mendalam diperoleh melalui penguasaan teori dan latihan berulang", isBenar: true },
                  { label: "B", teks: "Penilaian hasil belajar tidak memerlukan evaluasi berbasis data", isBenar: false },
                  { label: "C", teks: "Struktur materi bersifat acak tanpa keterkaitan topik", isBenar: false },
                  { label: "D", teks: "Seluruh variabel bernilai konstan dan tidak berubah", isBenar: false },
                ],
            "A",
            "Simpulan ditarik berdasarkan gagasan pokok teks materi yang diunggah.",
            "SEDANG"
          ),
        ],
      },
      {
        id: bmId2,
        materiId,
        judulBagian: `Penerapan & Evaluasi: ${cleanTitle}`,
        teksRingkasan:
          `Bagian penguatan aplikasi konsep dan evaluasi adaptif untuk menguji ketuntasan belajar siswa pada topik ${cleanTitle}.`,
        urutan: 2,
        status: "DIGENERATE",
        generatedSoal: [
          createSoal(
            bmId2 * 10 + 1,
            bmId2,
            `Langkah penerapan konsep ${cleanTitle} dalam kehidupan sehari-hari adalah...`,
            tingkat === "SD"
              ? [
                  { label: "A", teks: "Mempraktikkan kebiasaan baik dan mencatat hasilnya", isBenar: true },
                  { label: "B", teks: "Mengabaikan petunjuk dan aturan keselamatan", isBenar: false },
                  { label: "C", teks: "Menunggu jawaban dari orang lain", isBenar: false },
                ]
              : [
                  { label: "A", teks: "Mengidentifikasi masalah, menganalisis data, dan menarik solusi berbasis bukti", isBenar: true },
                  { label: "B", teks: "Mengambil keputusan secara spekulatif tanpa pembuktian", isBenar: false },
                  { label: "C", teks: "Menolak inovasi teknologi dalam metode pembelajaran", isBenar: false },
                  { label: "D", teks: "Mengabaikan kaidah ilmiah dalam observasi", isBenar: false },
                ],
            "A",
            "Penerapan didasarkan pada metode pemecahan masalah yang sistematis.",
            "MUDAH"
          ),
        ],
      },
    ];
  }

  const newMateri: Materi = {
    id: materiId,
    judul: cleanTitle || "Materi Pembelajaran AI",
    tingkat,
    bab,
    mataPelajaran,
    deskripsi: ringkasanUtama,
    akurasi: 0,
    status: "DIGENERATE",
    namaFileAsli: fileName,
    ukuranFileKb: fileSizeKb,
    tanggalUpload: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    poinKunci,
    bagianMateri: bagianList,
  };

  return newMateri;
};

const createSoal = (
  id: number,
  bagianMateriId: number,
  pertanyaan: string,
  opsi: { label: "A" | "B" | "C" | "D"; teks: string; isBenar: boolean }[],
  kunciJawaban: string,
  pembahasan: string,
  tingkatKesulitan: "MUDAH" | "SEDANG" | "SULIT"
): SoalMateri => ({
  id,
  bagianMateriId,
  pertanyaan,
  opsi,
  kunciJawaban,
  pembahasan,
  tingkatKesulitan,
});
