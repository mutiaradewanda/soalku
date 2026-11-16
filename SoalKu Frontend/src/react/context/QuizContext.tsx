import React, { createContext, useContext, useState, useEffect } from "react";
import { ModeLatihan, SesiLatihan, SoalQuiz, JawabanUser } from "../types/quiz";

interface QuizContextType {
  currentSession: SesiLatihan | null;
  startSession: (
    mode: ModeLatihan,
    jumlahSoal?: number,
    tingkat?: "SD" | "SMP",
    customQuestions?: SoalQuiz[]
  ) => SesiLatihan;
  answerQuestion: (soalId: number, opsiIndex: number) => void;
  toggleRaguRagu: (soalId: number) => void;
  decrementTimer: () => void;
  finishSession: (isViolationAutoSubmit?: boolean, totalPelanggaran?: number) => SesiLatihan;
  restartSession: () => SesiLatihan;
  clearSession: () => void;
}

// Bank Soal Standard SMP sesuai PRD dan DataRepository
const BANK_SOAL_SMP: SoalQuiz[] = [
  {
    id: 1,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Manakah fungsi utama dari getah lambung dalam proses pencernaan mekanik dan kimiawi?",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Mengubah amilum menjadi maltosa" },
      { label: "B", teks: "Membunuh kuman penyakit dan mengaktifkan pepsinogen" },
      { label: "C", teks: "Menetralkan asam yang berasal dari kerongkongan" },
      { label: "D", teks: "Mengemulsikan lemak menjadi asam lemak" },
    ],
    kunciJawabanIndex: 1,
    pembahasan: "Getah lambung mengandung asam klorida (HCl) yang berfungsi mematikan kuman patogen serta mengaktifkan enzim pepsinogen menjadi pepsin aktif.",
    tipsAdaptif: "Getah lambung ber-pH asam (1-2) untuk membunuh bakteri patogen.",
  },
  {
    id: 2,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Enzim renin yang terdapat di dalam getah lambung anak mamalia berfungsi untuk...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Mengendapkan protein kasein dari susu" },
      { label: "B", teks: "Memecah karbohidrat kompleks" },
      { label: "C", teks: "Menguraikan lemak menjadi gliserol" },
      { label: "D", teks: "Membentuk lapisan mukosa lambung" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Enzim renin berfungsi mengendapkan protein kasein susu agar dapat dicerna lebih lanjut oleh pepsin.",
    tipsAdaptif: "Renin = Kasein Susu (pada lambung mamalia muda).",
  },
  {
    id: 3,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Lapisan lendir (mukus) yang tebal pada dinding ventrikulus berfungsi krusial untuk...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Melindungi dinding lambung dari korosi asam klorida (HCl) dan pepsin" },
      { label: "B", teks: "Mempercepat laju penyerapan air dan ion mineral" },
      { label: "C", teks: "Mencegah makanan masuk ke saluran empedu" },
      { label: "D", teks: "Mengaktifkan hormon kolesistokinin" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Lapisan mukus melindungi sel-sel epitel mukosa lambung dari autolisis akibat asam lambung dan enzim proteolitik.",
    tipsAdaptif: "Mukus tebal = perisai alami dinding lambung dari asam HCl.",
  },
  {
    id: 4,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Bahan makanan yang mengalami pencernaan kimiawi pertama kali di rongga mulut adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Karbohidrat (Amilum)" },
      { label: "B", teks: "Protein hewani" },
      { label: "C", teks: "Lemak nabati" },
      { label: "D", teks: "Vitamin larut air" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Di rongga mulut terdapat enzim ptialin (amilase ludah) yang memecah amilum menjadi maltosa.",
    tipsAdaptif: "Mulut = Ptialin = Pemecah Amilum pertama.",
  },
  {
    id: 5,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Gerakan meremas dan mendorong gumpalan makanan (bolus) di sepanjang esofagus disebut gerak...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Peristaltik" },
      { label: "B", teks: "Osilasi" },
      { label: "C", teks: "Brown" },
      { label: "D", teks: "Segmentasi" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Gerak peristaltik adalah kontraksi ritmis otot polos sirkuler dan longitudinal di saluran cerna.",
    tipsAdaptif: "Peristaltik = dorongan ritmis bolus makanan.",
  },
  {
    id: 6,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Zat empedu yang dihasilkan oleh hepar (hati) disimpan sementara di dalam kantung empedu berfungsi untuk...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Mengemulsikan lemak agar mudah dicerna oleh lipase" },
      { label: "B", teks: "Memecah protein menjadi asam amino bebas" },
      { label: "C", teks: "Menurunkan kadar gula darah sewaktu" },
      { label: "D", teks: "Membunuh bakteri di usus buntu" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Garam empedu bersifat amfifatik dan mengemulsi lemak menjadi droplet kecil agar enzim lipase pankreas dapat bekerja optimal.",
    tipsAdaptif: "Empedu = Emulsi Lemak.",
  },
  {
    id: 7,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan:
      "Perhatikan gambar organ pencernaan berikut! Enzim pepsin dan asam klorida (HCl) yang berfungsi mengaktifkan pepsinogen serta membunuh kuman penyakit dihasilkan pada bagian organ yang ditunjukkan oleh nomor...",
    kesulitan: "SEDANG",
    hasDiagram: true,
    opsi: [
      { label: "A", teks: "Mulut — Organ nomor (1)" },
      { label: "B", teks: "Lambung — Organ nomor (2)" },
      { label: "C", teks: "Hati — Organ nomor (3)" },
      { label: "D", teks: "Usus Halus — Organ nomor (4)" },
    ],
    kunciJawabanIndex: 1, // B
    pembahasan:
      "Organ nomor (2) adalah ventrikulus (lambung). Di dinding lambung terdapat sel utama penghasil pepsinogen dan sel parietal penghasil HCl yang saling bekerja sama mematangkan enzim pepsin aktif.",
    tipsAdaptif:
      "Ingat singkatan enzim getah lambung dengan rumus: [R - P - L]\n• Renin: mengendapkan kasein susu\n• Pepsin: memecah protein jadi pepton\n• Lambung asam (HCl): desinfektan kuman patogen",
    jembatanKeledai: "Jembatan Keledai: [R - P - L] -> Renin, Pepsin, Lambung (asam HCl)",
    insightKelemahan:
      "Berdasarkan performa terakhirmu, kamu sering tertukar fungsi pepsin (lambung) dengan tripsin (usus halus). Cermati organ nomor (2)!",
  },
  {
    id: 8,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan:
      "Bagian organ yang memiliki vili-vili kecil mikroskopis untuk memperluas bidang penyerapan nutrisi makanan adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Ventrikulus (Lambung)" },
      { label: "B", teks: "Intestinum (Usus Halus)" },
      { label: "C", teks: "Hepar (Hati)" },
      { label: "D", teks: "Esofagus" },
    ],
    kunciJawabanIndex: 1,
    pembahasan: "Vili dan mikrovili berada di mukosa usus halus (jejenum dan ileum) untuk memperluas bidang penyerapan nutrisi ke kapiler darah dan pembuluh kil.",
    tipsAdaptif: "Vili = Usus Halus (penyerapan nutrisi maksimal).",
  },
  {
    id: 9,
    tingkat: "SMP",
    bagianMateriId: 103,
    topik: "Fungsi Bilik Jantung & Katup Aorta",
    pertanyaan:
      "Mengapa dinding bilik kiri (ventrikel sinister) jantung manusia jauh lebih tebal dibandingkan bilik kanan?",
    kesulitan: "SULIT",
    opsi: [
      { label: "A", teks: "Karena hanya memompa darah ke organ paru-paru yang dekat" },
      { label: "B", teks: "Karena memerlukan tekanan tinggi untuk memompa darah kaya O2 ke seluruh tubuh" },
      { label: "C", teks: "Karena menerima darah yang mengandung banyak CO2 dari seluruh tubuh" },
      { label: "D", teks: "Karena katup trikuspidalis bekerja lebih lambat saat sistol" },
    ],
    kunciJawabanIndex: 1,
    pembahasan: "Bilik kiri bertugas memompa darah ke sirkulasi sistemik ke seluruh penjuru tubuh manusia sehingga membutuhkan miokardium yang jauh lebih tebal dan kuat.",
    tipsAdaptif: "Bilik Kiri = Otot Paling Tebal (pompa ke seluruh tubuh).",
  },
  {
    id: 10,
    tingkat: "SMP",
    bagianMateriId: 103,
    topik: "Fungsi Bilik Jantung & Katup Aorta",
    pertanyaan: "Kerusakan atau kebocoran pada katup aorta dapat mengakibatkan aliran darah kembali ke...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Bilik Kiri (Ventrikel Sinister)" },
      { label: "B", teks: "Serambi Kanan (Atrium Dekster)" },
      { label: "C", teks: "Paru-Paru (Pulmo)" },
      { label: "D", teks: "Vena Kava Superior" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Katup semilunaris aorta terletak di antara bilik kiri dan aorta. Jika bocor, darah akan mengalami regurgitasi kembali ke ventrikel kiri saat fase diastol.",
    tipsAdaptif: "Katup Aorta = Gerbang satu arah dari Bilik Kiri ke Aorta.",
  },
  {
    id: 11,
    tingkat: "SMP",
    bagianMateriId: 103,
    topik: "Sistem Peredaran Darah Manusia",
    pertanyaan: "Pembuluh darah yang membawa darah kaya akan oksigen langsung dari organ paru-paru menuju serambi kiri jantung adalah...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Vena Pulmonalis" },
      { label: "B", teks: "Arteri Pulmonalis" },
      { label: "C", teks: "Aorta Dorsalis" },
      { label: "D", teks: "Vena Kava Inferior" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Vena pulmonalis adalah satu-satunya pembuluh balik (vena) yang membawa darah kaya oksigen dari paru-paru ke atrium kiri.",
    tipsAdaptif: "Vena Pulmonalis = Vena istimewa pembawa O2 dari paru-paru.",
  },
  {
    id: 12,
    tingkat: "SMP",
    bagianMateriId: 103,
    topik: "Komponen Darah & Imunitas",
    pertanyaan: "Komponen seluler darah yang berperan penting dalam proses koagulasi (pembekuan darah) saat terjadi luka adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Trombosit (Keping Darah)" },
      { label: "B", teks: "Eritrosit (Sel Darah Merah)" },
      { label: "C", teks: "Leukosit (Sel Darah Putih)" },
      { label: "D", teks: "Plasma Darah" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Trombosit pecah saat bersentuhan dengan permukaan kasar luka dan melepaskan enzim trombokinase untuk memicu pembekuan darah.",
    tipsAdaptif: "Trombosit = Keping pembeku luka darah.",
  },
  {
    id: 13,
    tingkat: "SMP",
    bagianMateriId: 104,
    topik: "Sistem Ekskresi Manusia",
    pertanyaan: "Proses filtrasi (penyaringan darah) tahap pertama pada nefron ginjal manusia berlangsung di dalam...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Glomerulus dan Kapsula Bowman" },
      { label: "B", teks: "Tubulus Kontortus Proksimal" },
      { label: "C", teks: "Lengkung Henle" },
      { label: "D", teks: "Tubulus Kolektivus" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Filtrasi darah terjadi di glomerulus menghasilkan urin primer yang bebas dari sel darah dan protein besar.",
    tipsAdaptif: "Filtrasi = Glomerulus -> Urin Primer.",
  },
  {
    id: 14,
    tingkat: "SMP",
    bagianMateriId: 105,
    topik: "Struktur & Jaringan Tumbuhan",
    pertanyaan: "Jaringan pembuluh angkut pada batang tumbuhan yang berfungsi mengangkut hasil fotosintesis dari daun ke seluruh tubuh adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Floem (Pembuluh Tapis)" },
      { label: "B", teks: "Xilem (Pembuluh Kayu)" },
      { label: "C", teks: "Kambium Vaskuler" },
      { label: "D", teks: "Epidermis" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Floem mengedarkan fotosintat (glukosa) dari daun ke seluruh bagian tumbuhan, sedangkan xilem menyalurkan air dan hara mineral.",
    tipsAdaptif: "Floem = Food (hasil fotosintesis), Xilem = Air & mineral.",
  },
  {
    id: 15,
    tingkat: "SMP",
    bagianMateriId: 106,
    topik: "Hukum Gerak & Gaya Newton",
    pertanyaan: "Sifat suatu benda yang cenderung mempertahankan keadaan diam atau keadaan gerak lurus beraturannya disebut sifat...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Inersia (Kelembaman)" },
      { label: "B", teks: "Percepatan Sentripetal" },
      { label: "C", teks: "Aksi Reaksi" },
      { label: "D", teks: "Elastisitas" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Hukum I Newton menyatakan bahwa setiap benda memiliki kelembaman (inersia) untuk mempertahankan kondisi geraknya jika resultan gaya sama dengan nol.",
    tipsAdaptif: "Hukum I Newton = Sigma F = 0 (Inersia).",
  },
  {
    id: 16,
    tingkat: "SMP",
    bagianMateriId: 101,
    topik: "Enzim Lambung & Organ Pencernaan Manusia",
    pertanyaan: "Pankreas menyekresikan enzim tripsin ke dalam duodenum (usus 12 jari) yang bertugas untuk...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Memecah protein pepton menjadi asam amino" },
      { label: "B", teks: "Mengubah maltosa menjadi glukosa murni" },
      { label: "C", teks: "Mengasamkan kimus makanan" },
      { label: "D", teks: "Menyerap vitamin larut lemak" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Enzim tripsin dari getah pankreas bekerja di usus halus dengan suasana basa untuk memecah pepton menjadi peptida dan asam amino.",
    tipsAdaptif: "Tripsin = Pankreas / Usus halus (pepton -> asam amino).",
  },
  {
    id: 17,
    tingkat: "SMP",
    bagianMateriId: 103,
    topik: "Sistem Peredaran Darah Manusia",
    pertanyaan: "Kondisi medis saat tubuh kekurangan sel darah merah atau kadar hemoglobin rendah sehingga tubuh mudah lelah disebut...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Anemia" },
      { label: "B", teks: "Leukemia" },
      { label: "C", teks: "Hemofilia" },
      { label: "D", teks: "Hipertensi" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Anemia disebabkan oleh kekurangan eritrosit atau hemoglobin sehingga suplai oksigen ke jaringan tubuh berkurang.",
    tipsAdaptif: "Anemia = Kurang sel darah merah / hemoglobin.",
  },
  {
    id: 18,
    tingkat: "SMP",
    bagianMateriId: 107,
    topik: "Organel Sel & Mikroskopis",
    pertanyaan: "Organel sel yang berfungsi sebagai tempat terjadinya respirasi seluler untuk menghasilkan energi ATP adalah...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Mitokondria" },
      { label: "B", teks: "Badan Golgi" },
      { label: "C", teks: "Retikulum Endoplasma" },
      { label: "D", teks: "Ribosom" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Mitokondria sering dijuluki 'the powerhouse of cell' karena menjadi pusat produksi energi seluler ATP lewat respirasi aerob.",
    tipsAdaptif: "Mitokondria = Pembangkit energi sel (ATP).",
  },
  {
    id: 19,
    tingkat: "SMP",
    bagianMateriId: 108,
    topik: "Sistem Saraf & Koordinasi Tubuh",
    pertanyaan: "Bagian otak yang berfungsi utama sebagai pusat koordinasi gerakan motorik, keseimbangan, dan postur tubuh adalah...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Cerebellum (Otak Kecil)" },
      { label: "B", teks: "Cerebrum (Otak Besar)" },
      { label: "C", teks: "Medula Oblongata" },
      { label: "D", teks: "Talamus" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Cerebellum terletak di bagian belakang kepala dan bertanggung jawab atas koordinasi otot halus, keseimbangan, dan keharmonisan gerak tubuh.",
    tipsAdaptif: "Cerebellum (Otak Kecil) = Keseimbangan gerak.",
  },
  {
    id: 20,
    tingkat: "SMP",
    bagianMateriId: 109,
    topik: "Zat Aditif & Psikotropika",
    pertanyaan: "Bahan pengawet kimia sintetis yang sering digunakan untuk mencegah pembusukan pada makanan olahan roti dan keju adalah...",
    kesulitan: "SEDANG",
    opsi: [
      { label: "A", teks: "Asam propionat dan natrium benzoat" },
      { label: "B", teks: "Monosodium glutamat (MSG)" },
      { label: "C", teks: "Tartrazin dan eritrosin" },
      { label: "D", teks: "Aspartam dan sakarin" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Asam propionat dan natrium benzoat adalah pengawet makanan yang menghambat pertumbuhan jamur dan kapang.",
    tipsAdaptif: "Benzoat / Propionat = Zat pengawet makanan.",
  },
];

// Bank Soal SD
const BANK_SOAL_SD: SoalQuiz[] = [
  {
    id: 101,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Bagian Tumbuhan & Fotosintesis",
    pertanyaan: "Bagian tumbuhan yang bertugas menyerap air dan zat hara dari dalam tanah adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Akar tumbuhan" },
      { label: "B", teks: "Daun hijau" },
      { label: "C", teks: "Bunga berwarna cerah" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Akar berada di bawah tanah untuk menyerap air dan mineral serta menopang tegaknya tumbuhan.",
    tipsAdaptif: "Akar = Menyerap air di dalam tanah.",
  },
  {
    id: 102,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Bagian Tumbuhan & Fotosintesis",
    pertanyaan: "Zat hijau pada daun yang membantu proses fotosintesis dengan sinar matahari disebut...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Klorofil" },
      { label: "B", teks: "Karbohidrat" },
      { label: "C", teks: "Oksigen" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Klorofil adalah pigmen hijau daun yang menangkap energi cahaya matahari untuk memasak makanan.",
    tipsAdaptif: "Klorofil = zat hijau daun pembuat makanan.",
  },
  {
    id: 103,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Organ Tubuh Manusia",
    pertanyaan: "Organ tubuh yang berdetak memompa darah ke seluruh tubuh kita adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Jantung" },
      { label: "B", teks: "Lambung" },
      { label: "C", teks: "Paru-paru" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Jantung manusia memompa darah beroksigen tanpa henti setiap hari.",
    tipsAdaptif: "Jantung = pompa darah tubuh.",
  },
  {
    id: 104,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Pencernaan Makanan",
    pertanyaan: "Makanan yang kita makan pertama kali dikunyah di dalam...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Mulut" },
      { label: "B", teks: "Lambung" },
      { label: "C", teks: "Usus" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Gigi dan lidah di mulut mengunyah makanan agar halus sebelum ditelan.",
    tipsAdaptif: "Mulut = awal mula makanan dikunyah.",
  },
  {
    id: 105,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Matematika Ceria",
    pertanyaan: "Ibu membeli 3 kantong jeruk. Setiap kantong berisi 8 buah jeruk. Berapa total jeruk Ibu?",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "24 buah jeruk" },
      { label: "B", teks: "21 buah jeruk" },
      { label: "C", teks: "18 buah jeruk" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "3 kantong × 8 buah = 24 buah jeruk.",
    tipsAdaptif: "3 × 8 = 24.",
  },
  {
    id: 106,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Perkembangbiakan Tumbuhan",
    pertanyaan: "Alat kelamin jantan pada sekuntum bunga tumbuhan dinamakan...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Benang sari" },
      { label: "B", teks: "Putik" },
      { label: "C", teks: "Mahkota bunga" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Benang sari menghasilkan serbuk sari sebagai sel jantan, sedangkan putik adalah alat kelamin betina.",
    tipsAdaptif: "Benang sari = sel jantan bunga.",
  },
  {
    id: 107,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Pengelompokan Hewan",
    pertanyaan: "Hewan seperti sapi, kambing, dan kelinci yang hanya memakan rumput dan daun-daunan disebut hewan...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Herbivora" },
      { label: "B", teks: "Karnivora" },
      { label: "C", teks: "Omnivora" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Herbivora adalah golongan hewan pemakan tumbuhan.",
    tipsAdaptif: "Herbivora = pemakan tumbuhan (rumput/daun).",
  },
  {
    id: 108,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Wujud Benda & Perubahannya",
    pertanyaan: "Air di dalam panci yang dipanaskan terus-menerus hingga mendidih akan berubah menjadi uap air. Peristiwa ini disebut...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Menguap" },
      { label: "B", teks: "Membeku" },
      { label: "C", teks: "Menyublim" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Menguap adalah perubahan wujud benda dari zat cair menjadi zat gas saat dipanaskan.",
    tipsAdaptif: "Cair jadi gas = Menguap.",
  },
  {
    id: 109,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Matematika Ceria",
    pertanyaan: "Di sebuah perpustakaan ada 120 buku cerita. Hari ini datang kiriman buku baru sebanyak 80 buku. Berapakah jumlah seluruh buku cerita sekarang?",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "200 buku" },
      { label: "B", teks: "190 buku" },
      { label: "C", teks: "210 buku" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "120 + 80 = 200 buku cerita.",
    tipsAdaptif: "120 + 80 = 200.",
  },
  {
    id: 110,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Pernapasan Manusia",
    pertanyaan: "Saat kita bernapas menghirup udara segar, gas yang dibutuhkan oleh tubuh manusia adalah gas...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Oksigen" },
      { label: "B", teks: "Karbon dioksida" },
      { label: "C", teks: "Nitrogen cair" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Manusia menghirup oksigen untuk proses pembakaran sari-sari makanan dan menghembuskan karbon dioksida.",
    tipsAdaptif: "Napas masuk = Oksigen.",
  },
  {
    id: 111,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Pengelompokan Hewan",
    pertanyaan: "Hewan seperti katak dan salamander yang dapat hidup di dua alam (darat dan air) disebut hewan...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Amfibi" },
      { label: "B", teks: "Reptilia" },
      { label: "C", teks: "Mamalia" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Amfibi adalah hewan bertulang belakang yang hidup di air pada fase berudu dan di darat saat dewasa.",
    tipsAdaptif: "Amfibi = Hidup di 2 alam (katak).",
  },
  {
    id: 112,
    tingkat: "SD",
    bagianMateriId: 402,
    topik: "Tata Surya Ceria",
    pertanyaan: "Benda langit yang dapat memancarkan cahayanya sendiri dan menjadi pusat dari tata surya kita adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Matahari" },
      { label: "B", teks: "Bulan" },
      { label: "C", teks: "Bintang Kejora" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Matahari adalah bintang terdekat bumi yang memancarkan panas dan cahaya untuk tata surya.",
    tipsAdaptif: "Pusat tata surya = Matahari.",
  },
  {
    id: 113,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Panca Indra Manusia",
    pertanyaan: "Bagian panca indra pada tubuh manusia yang berfungsi untuk mengecap rasa manis, asin, dan pahit adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Lidah" },
      { label: "B", teks: "Hidung" },
      { label: "C", teks: "Telinga" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Lidah memiliki papila pengecap yang peka terhadap rasa manis, asin, asam, pahit, dan umami.",
    tipsAdaptif: "Pengecap rasa = Lidah.",
  },
  {
    id: 114,
    tingkat: "SD",
    bagianMateriId: 402,
    topik: "Gaya & Gerak Benda",
    pertanyaan: "Gaya tarik yang menyebabkan bola yang dilempar ke atas selalu jatuh kembali ke tanah adalah gaya...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Gravitasi bumi" },
      { label: "B", teks: "Magnet" },
      { label: "C", teks: "Gesekan udara" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Gaya gravitasi bumi menarik semua benda bermassa menuju pusat bumi.",
    tipsAdaptif: "Jatuh ke bawah = Gaya Gravitasi Bumi.",
  },
  {
    id: 115,
    tingkat: "SD",
    bagianMateriId: 403,
    topik: "Matematika Ceria",
    pertanyaan: "Paman memiliki 4 kandang ayam. Setiap kandang berisi 15 ekor ayam. Berapa jumlah seluruh ayam paman?",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "60 ekor ayam" },
      { label: "B", teks: "55 ekor ayam" },
      { label: "C", teks: "45 ekor ayam" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "4 kandang × 15 ekor = 60 ekor ayam.",
    tipsAdaptif: "4 × 15 = 60.",
  },
  {
    id: 116,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Rangka Tubuh Manusia",
    pertanyaan: "Bagian tulang keras pada manusia yang bertugas melindungi organ vital otak dari benturan adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Tulang tengkorak" },
      { label: "B", teks: "Tulang rusuk" },
      { label: "C", teks: "Tulang panggul" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Tulang tengkorak kepala melindungi otak kecil dan otak besar.",
    tipsAdaptif: "Pelindung otak = Tulang tengkorak.",
  },
  {
    id: 117,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Perkembangbiakan Tumbuhan",
    pertanyaan: "Proses penyerbukan pada bunga tumbuhan terjadi ketika serbuk sari jatuh di atas bagian...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Kepala putik" },
      { label: "B", teks: "Kelopak bunga" },
      { label: "C", teks: "Tangkai bunga" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Penyerbukan adalah bertemunya serbuk sari dengan kepala putik bunga.",
    tipsAdaptif: "Serbuk sari + Kepala putik = Penyerbukan.",
  },
  {
    id: 118,
    tingkat: "SD",
    bagianMateriId: 401,
    topik: "Perkembangbiakan Hewan",
    pertanyaan: "Kucing, sapi, dan paus berkembang biak dengan cara melahirkan anak. Cara ini disebut perkembangbiakan...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Vivipar" },
      { label: "B", teks: "Ovipar" },
      { label: "C", teks: "Ovovivipar" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Vivipar adalah perkembangbiakan hewan dengan melahirkan anak.",
    tipsAdaptif: "Melahirkan = Vivipar.",
  },
  {
    id: 119,
    tingkat: "SD",
    bagianMateriId: 403,
    topik: "Pecahan Matematika",
    pertanyaan: "Ibu memotong sebuah martabak menjadi 8 bagian sama besar. Budi memakan 3 potong. Bagian martabak yang dimakan Budi adalah...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "3/8 bagian" },
      { label: "B", teks: "1/8 bagian" },
      { label: "C", teks: "5/8 bagian" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Budi memakan 3 dari total 8 potongan, sehingga pecahannya adalah 3/8.",
    tipsAdaptif: "3 dari 8 = 3/8.",
  },
  {
    id: 120,
    tingkat: "SD",
    bagianMateriId: 402,
    topik: "Sifat Bunyi & Getaran",
    pertanyaan: "Gelombang bunyi dapat merambat paling cepat melalui medium benda yang berwujud...",
    kesulitan: "MUDAH",
    opsi: [
      { label: "A", teks: "Benda padat" },
      { label: "B", teks: "Benda cair" },
      { label: "C", teks: "Gas / udara kosong" },
    ],
    kunciJawabanIndex: 0,
    pembahasan: "Partikel pada benda padat tersusun sangat rapat sehingga perambatan getaran bunyi berlangsung paling cepat.",
    tipsAdaptif: "Rambat bunyi tercepat = Benda padat.",
  },
];

const STORAGE_KEY_MISTAKES = "soalku_riwayat_kesalahan";

// Data awal kelemahan adaptif siswa (Use Case 3 & 10 PRD)
const INITIAL_MISTAKE_MAP: Record<number, { countSalah: number; lastSalahAt: number }> = {
  // SMP: Enzim Lambung (ID 7), Bilik Kiri (ID 9), Katup Aorta (ID 10)
  7: { countSalah: 3, lastSalahAt: Date.now() - 1000 * 60 * 60 },
  9: { countSalah: 2, lastSalahAt: Date.now() - 1000 * 60 * 120 },
  10: { countSalah: 2, lastSalahAt: Date.now() - 1000 * 60 * 180 },
  // SD: Bagian Tumbuhan (ID 101, 102), Matematika (ID 105)
  101: { countSalah: 3, lastSalahAt: Date.now() - 1000 * 60 * 30 },
  102: { countSalah: 2, lastSalahAt: Date.now() - 1000 * 60 * 60 },
  105: { countSalah: 2, lastSalahAt: Date.now() - 1000 * 60 * 90 },
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<SesiLatihan | null>(() => {
    try {
      const saved = localStorage.getItem("soalku_active_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentSession) {
      try {
        localStorage.setItem("soalku_active_session", JSON.stringify(currentSession));
      } catch (e) {
        console.error("Gagal menyimpan sesi ke localStorage", e);
      }
    } else {
      localStorage.removeItem("soalku_active_session");
    }
  }, [currentSession]);

  const startSession = (
    mode: ModeLatihan,
    jumlahSoal?: number,
    tingkat: "SD" | "SMP" = "SMP",
    customQuestions?: SoalQuiz[]
  ): SesiLatihan => {
    // Default jumlah butir soal: SD = 10 soal, SMP = 20 soal
    const targetCount = jumlahSoal ?? (tingkat === "SD" ? 10 : 20);
    const defaultBank = tingkat === "SD" ? BANK_SOAL_SD : BANK_SOAL_SMP;

    let pool: SoalQuiz[] = [];
    if (customQuestions && customQuestions.length > 0) {
      pool = [...customQuestions];
      // Jika butir soal modul kurang dari targetCount (SD: 10, SMP: 20),
      // lengkapi dari bank soal kurikulum agar selalu memenuhi kuota latihan
      if (pool.length < targetCount) {
        const existingIds = new Set(pool.map((q) => q.id));
        const additional = defaultBank.filter((q) => !existingIds.has(q.id));
        pool = [...pool, ...additional];
      }
    } else {
      pool = [...defaultBank];
    }

    // Ambil riwayat kesalahan siswa untuk mode FOKUS_KELEMAHAN
    const mistakeMap: Record<number, { countSalah: number; lastSalahAt: number }> = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
        if (raw) return JSON.parse(raw);
        localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(INITIAL_MISTAKE_MAP));
        return INITIAL_MISTAKE_MAP;
      } catch {
        return INITIAL_MISTAKE_MAP;
      }
    })();

    // Algoritma Strategi PRD Section 10:
    if (mode === "ACAK") {
      pool = pool.sort(() => Math.random() - 0.5);
    } else if (mode === "FOKUS_KELEMAHAN") {
      // Prioritaskan soal yang paling sering salah dijawab oleh siswa
      pool = pool.sort((a, b) => {
        const aMistake = mistakeMap[a.id]?.countSalah || 0;
        const bMistake = mistakeMap[b.id]?.countSalah || 0;
        if (bMistake !== aMistake) {
          return bMistake - aMistake; // Paling banyak salah ditaruh paling depan
        }
        const aWeak = a.insightKelemahan || a.bagianMateriId === 103 ? 1 : 0;
        const bWeak = b.insightKelemahan || b.bagianMateriId === 103 ? 1 : 0;
        if (bWeak !== aWeak) {
          return bWeak - aWeak;
        }
        const aTime = mistakeMap[a.id]?.lastSalahAt || 0;
        const bTime = mistakeMap[b.id]?.lastSalahAt || 0;
        return bTime - aTime;
      });
    }

    // Pastikan jumlah butir soal selalu persis memenuhi targetCount (5, 10, 15, 20)
    let selectedQuestions = [...pool];
    if (selectedQuestions.length > targetCount) {
      selectedQuestions = selectedQuestions.slice(0, targetCount);
    } else if (selectedQuestions.length < targetCount) {
      // Lengkapi dari pool agar mencapai targetCount persis
      while (selectedQuestions.length < targetCount) {
        const remaining = targetCount - selectedQuestions.length;
        const slice = pool.slice(0, remaining).map((q, idx) => ({
          ...q,
          id: q.id + 1000 * (Math.floor(selectedQuestions.length / (pool.length || 1)) + 1) + idx,
        }));
        selectedQuestions = [...selectedQuestions, ...slice];
      }
    }

    // Waktu: Mode Berwaktu = 15 Menit (900s), Mode lain = 25 Menit (1500s)
    const totalWaktu = mode === "BERWAKTU" ? 900 : 1500;

    const initialJawaban: Record<number, JawabanUser> = {};
    selectedQuestions.forEach((q) => {
      initialJawaban[q.id] = {
        soalId: q.id,
        selectedOpsiIndex: null,
        isRaguRagu: false,
      };
    });

    const session: SesiLatihan = {
      idSesi: `#CBT-BIO-${Math.floor(1000 + Math.random() * 9000)}`,
      mode,
      tingkat,
      mapel: tingkat === "SD" ? "IPAS & Matematika" : "IPA Terpadu • Biologi Sistem Pencernaan",
      subjek: tingkat === "SD" ? "Kelas 4 SD" : "Kelas 8 SMP",
      waktuDetikSisa: totalWaktu,
      totalDetik: totalWaktu,
      daftarSoal: selectedQuestions,
      jawabanMap: initialJawaban,
      status: "BERLANGSUNG",
      skor: 0,
      totalBenar: 0,
      totalSalah: 0,
      totalRagu: 0,
      totalDijawab: 0,
      streakBenar: 4, // Initial display streak
      xpDidapat: 0,
      waktuMulai: Date.now(),
    };

    setCurrentSession(session);
    return session;
  };

  const answerQuestion = (soalId: number, opsiIndex: number) => {
    setCurrentSession((prev) => {
      if (!prev || prev.status === "SELESAI") return prev;

      const currentJawaban = prev.jawabanMap[soalId] || {
        soalId,
        selectedOpsiIndex: null,
        isRaguRagu: false,
      };

      const updatedJawabanMap = {
        ...prev.jawabanMap,
        [soalId]: {
          ...currentJawaban,
          selectedOpsiIndex: opsiIndex,
        },
      };

      const totalDijawab = Object.values(updatedJawabanMap).filter(
        (j) => j.selectedOpsiIndex !== null
      ).length;

      return {
        ...prev,
        jawabanMap: updatedJawabanMap,
        totalDijawab,
      };
    });
  };

  const toggleRaguRagu = (soalId: number) => {
    setCurrentSession((prev) => {
      if (!prev || prev.status === "SELESAI") return prev;

      const current = prev.jawabanMap[soalId] || {
        soalId,
        selectedOpsiIndex: null,
        isRaguRagu: false,
      };

      const updated = {
        ...current,
        isRaguRagu: !current.isRaguRagu,
      };

      const updatedMap = {
        ...prev.jawabanMap,
        [soalId]: updated,
      };

      const totalRagu = Object.values(updatedMap).filter((j) => j.isRaguRagu).length;

      return {
        ...prev,
        jawabanMap: updatedMap,
        totalRagu,
      };
    });
  };

  const decrementTimer = () => {
    setCurrentSession((prev) => {
      if (!prev || prev.status === "SELESAI") return prev;
      if (prev.waktuDetikSisa <= 1) {
        return finishSessionInternal(prev);
      }
      return {
        ...prev,
        waktuDetikSisa: prev.waktuDetikSisa - 1,
      };
    });
  };

  const finishSessionInternal = (
    session: SesiLatihan,
    isViolationAutoSubmit?: boolean,
    totalPelanggaran?: number
  ): SesiLatihan => {
    let benar = 0;
    let salah = 0;

    const mistakeMap: Record<number, { countSalah: number; lastSalahAt: number }> = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
        return raw ? JSON.parse(raw) : { ...INITIAL_MISTAKE_MAP };
      } catch {
        return { ...INITIAL_MISTAKE_MAP };
      }
    })();

    session.daftarSoal.forEach((soal) => {
      const jawaban = session.jawabanMap[soal.id];
      if (jawaban && jawaban.selectedOpsiIndex === soal.kunciJawabanIndex) {
        benar++;
      } else {
        salah++;
        // Soal salah atau belum dijawab dicatat ke riwayat kelemahan siswa
        const curr = mistakeMap[soal.id]?.countSalah || 0;
        mistakeMap[soal.id] = {
          countSalah: curr + 1,
          lastSalahAt: Date.now(),
        };
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakeMap));
    } catch (e) {
      console.error("Gagal menyimpan riwayat kesalahan soal", e);
    }

    const total = session.daftarSoal.length;
    const skor = total > 0 ? Math.round((benar / total) * 100) : 0;
    const xp = isViolationAutoSubmit ? 0 : benar * 30 + 50;

    const completedSession: SesiLatihan = {
      ...session,
      status: "SELESAI",
      skor,
      totalBenar: benar,
      totalSalah: salah,
      totalDijawab: Object.values(session.jawabanMap).filter((j) => j.selectedOpsiIndex !== null).length,
      totalRagu: Object.values(session.jawabanMap).filter((j) => j.isRaguRagu).length,
      xpDidapat: xp,
      waktuSelesai: Date.now(),
      isAutoSubmitPelanggaran: isViolationAutoSubmit || false,
      totalPelanggaran: totalPelanggaran !== undefined ? totalPelanggaran : (session.totalPelanggaran || 0),
    };

    return completedSession;
  };

  const finishSession = (isViolationAutoSubmit?: boolean, totalPelanggaran?: number): SesiLatihan => {
    if (!currentSession) throw new Error("Tidak ada sesi ujian aktif");
    const finished = finishSessionInternal(currentSession, isViolationAutoSubmit, totalPelanggaran);
    setCurrentSession(finished);
    return finished;
  };

  const restartSession = (): SesiLatihan => {
    if (!currentSession) throw new Error("Tidak ada sesi untuk diulang");
    return startSession(currentSession.mode, currentSession.daftarSoal.length, currentSession.tingkat);
  };

  const clearSession = () => {
    setCurrentSession(null);
    localStorage.removeItem("soalku_active_session");
  };

  return (
    <QuizContext.Provider
      value={{
        currentSession,
        startSession,
        answerQuestion,
        toggleRaguRagu,
        decrementTimer,
        finishSession,
        restartSession,
        clearSession,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz harus digunakan di dalam QuizProvider");
  }
  return context;
};
