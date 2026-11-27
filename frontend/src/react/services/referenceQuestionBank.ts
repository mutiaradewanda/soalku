export interface ReferenceQuestion {
  id: string;
  mataPelajaran: "Matematika" | "Bahasa Inggris" | "Bahasa Indonesia" | "IPA" | "IPAS" | "PPKn" | "Informatika" | "IPS" | "PAI";
  jenjang: "SD" | "SMP" | "SEMUA";
  kelas?: number[];
  topikUtama: string;
  subTopik: string[];
  kataKunci: string[];
  pertanyaan: string;
  opsi: {
    label: "A" | "B" | "C" | "D";
    teks: string;
    isBenar: boolean;
  }[];
  kunciJawaban: "A" | "B" | "C" | "D";
  pembahasan: string;
  tingkatKesulitan: "MUDAH" | "SEDANG" | "SULIT";
}

/**
 * Bank Dataset Soal Acuan Terstandar & Tervalidasi
 * Digunakan sebagai patokan/fallback berbasis kesesuaian topik (strict topic matching)
 * agar AI tidak mengarang soal di luar topik ketika modul yang diunggah singkat/sedikit.
 */
export const REFERENCE_QUESTION_BANK: ReferenceQuestion[] = [
  // ==========================================
  // MATEMATIKA: ALJABAR (SMP & SD Lanjutan)
  // ==========================================
  {
    id: "REF-MTK-ALJ-01",
    mataPelajaran: "Matematika",
    jenjang: "SMP",
    kelas: [7, 8],
    topikUtama: "Aljabar",
    subTopik: ["Bentuk Aljabar", "Koefisien & Variabel"],
    kataKunci: ["aljabar", "variabel", "koefisien", "konstanta", "suku"],
    pertanyaan: "Pada bentuk aljabar 3x² - 5x + 7, yang merupakan koefisien dari x adalah...",
    opsi: [
      { label: "A", teks: "3", isBenar: false },
      { label: "B", teks: "-5", isBenar: true },
      { label: "C", teks: "5", isBenar: false },
      { label: "D", teks: "7", isBenar: false },
    ],
    kunciJawaban: "B",
    pembahasan: "Bentuk aljabar terdiri dari suku-suku. Koefisien adalah angka yang mendampingi variabel. Pada suku -5x, angka di depan variabel x adalah -5.",
    tingkatKesulitan: "MUDAH",
  },
  {
    id: "REF-MTK-ALJ-02",
    mataPelajaran: "Matematika",
    jenjang: "SMP",
    kelas: [7, 8],
    topikUtama: "Aljabar",
    subTopik: ["Persamaan Linear Satu Variabel"],
    kataKunci: ["persamaan", "linear", "aljabar", "nilai x", "penyelesaian"],
    pertanyaan: "Tentukan nilai x yang memenuhi persamaan linear 2x + 6 = 16!",
    opsi: [
      { label: "A", teks: "4", isBenar: false },
      { label: "B", teks: "5", isBenar: true },
      { label: "C", teks: "6", isBenar: false },
      { label: "D", teks: "10", isBenar: false },
    ],
    kunciJawaban: "B",
    pembahasan: "2x + 6 = 16 -> 2x = 16 - 6 -> 2x = 10 -> x = 10 / 2 = 5.",
    tingkatKesulitan: "MUDAH",
  },
  {
    id: "REF-MTK-ALJ-03",
    mataPelajaran: "Matematika",
    jenjang: "SMP",
    kelas: [7, 8],
    topikUtama: "Aljabar",
    subTopik: ["Operasi Penjumlahan Aljabar"],
    kataKunci: ["suku sejenis", "penjumlahan aljabar", "variabel", "sederhanakan"],
    pertanyaan: "Bentuk sederhana dari 4a + 3b - 2a + 5b adalah...",
    opsi: [
      { label: "A", teks: "2a + 8b", isBenar: true },
      { label: "B", teks: "6a + 8b", isBenar: false },
      { label: "C", teks: "2a - 2b", isBenar: false },
      { label: "D", teks: "10ab", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "Kelompokkan suku sejenis: (4a - 2a) + (3b + 5b) = 2a + 8b.",
    tingkatKesulitan: "SEDANG",
  },
  {
    id: "REF-MTK-ALJ-04",
    mataPelajaran: "Matematika",
    jenjang: "SMP",
    kelas: [8],
    topikUtama: "Aljabar",
    subTopik: ["Perkalian Suku Dua Aljabar"],
    kataKunci: ["perkalian aljabar", "faktor", "kuadrat", "distributif"],
    pertanyaan: "Hasil perkalian dari (x + 3)(x - 2) adalah...",
    opsi: [
      { label: "A", teks: "x² + x - 6", isBenar: true },
      { label: "B", teks: "x² - x - 6", isBenar: false },
      { label: "C", teks: "x² + 5x - 6", isBenar: false },
      { label: "D", teks: "x² + 6", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "(x + 3)(x - 2) = x(x - 2) + 3(x - 2) = x² - 2x + 3x - 6 = x² + x - 6.",
    tingkatKesulitan: "SEDANG",
  },
  {
    id: "REF-MTK-ALJ-05",
    mataPelajaran: "Matematika",
    jenjang: "SD",
    kelas: [5, 6],
    topikUtama: "Aljabar",
    subTopik: ["Kalimat Matematika Terbuka"],
    kataKunci: ["simbol bilangan", "nilai titik-titik", "variabel dasar"],
    pertanyaan: "Jika n + 15 = 40, berapakah nilai n yang tepat?",
    opsi: [
      { label: "A", teks: "25", isBenar: true },
      { label: "B", teks: "35", isBenar: false },
      { label: "C", teks: "55", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "n = 40 - 15 = 25.",
    tingkatKesulitan: "MUDAH",
  },

  // ==========================================
  // MATEMATIKA: ARITMATIKA & PECAHAN
  // ==========================================
  {
    id: "REF-MTK-PEC-01",
    mataPelajaran: "Matematika",
    jenjang: "SD",
    kelas: [4, 5, 6],
    topikUtama: "Pecahan",
    subTopik: ["Penjumlahan Pecahan"],
    kataKunci: ["pecahan", "penyebut", "pembilang", "setengah", "seperempat"],
    pertanyaan: "Hasil dari 1/2 + 1/4 adalah...",
    opsi: [
      { label: "A", teks: "3/4", isBenar: true },
      { label: "B", teks: "2/6", isBenar: false },
      { label: "C", teks: "1/8", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "Samakan penyebut ke 4: 2/4 + 1/4 = 3/4.",
    tingkatKesulitan: "MUDAH",
  },
  {
    id: "REF-MTK-PEC-02",
    mataPelajaran: "Matematika",
    jenjang: "SD",
    kelas: [4, 5],
    topikUtama: "Pecahan",
    subTopik: ["Pecahan Senilai"],
    kataKunci: ["pecahan senilai", "sederhana", "pembilang"],
    pertanyaan: "Bentuk pecahan paling sederhana dari 6/8 adalah...",
    opsi: [
      { label: "A", teks: "3/4", isBenar: true },
      { label: "B", teks: "2/3", isBenar: false },
      { label: "C", teks: "1/2", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "Bagi pembilang dan penyebut dengan FPB-nya yaitu 2: (6:2) / (8:2) = 3/4.",
    tingkatKesulitan: "MUDAH",
  },

  // ==========================================
  // BAHASA INGGRIS: GRAMMAR & VOCABULARY
  // ==========================================
  {
    id: "REF-ENG-TNS-01",
    mataPelajaran: "Bahasa Inggris",
    jenjang: "SMP",
    kelas: [7, 8, 9],
    topikUtama: "Simple Present Tense",
    subTopik: ["Subject-Verb Agreement", "Daily Routine"],
    kataKunci: ["present tense", "every day", "habitual", "verbs", "does"],
    pertanyaan: "She always _______ breakfast before going to school every morning.",
    opsi: [
      { label: "A", teks: "eat", isBenar: false },
      { label: "B", teks: "eats", isBenar: true },
      { label: "C", teks: "eating", isBenar: false },
      { label: "D", teks: "ate", isBenar: false },
    ],
    kunciJawaban: "B",
    pembahasan: "Subjek tunggal orang ketiga (She) dalam Simple Present Tense membutuhkan akhiran -s/-es pada kata kerja: eats.",
    tingkatKesulitan: "MUDAH",
  },
  {
    id: "REF-ENG-TNS-02",
    mataPelajaran: "Bahasa Inggris",
    jenjang: "SMP",
    kelas: [8, 9],
    topikUtama: "Simple Past Tense",
    subTopik: ["Irregular Verbs", "Past Events"],
    kataKunci: ["past tense", "yesterday", "last week", "verb 2", "irregular"],
    pertanyaan: "They _______ to the national museum with their teacher yesterday.",
    opsi: [
      { label: "A", teks: "go", isBenar: false },
      { label: "B", teks: "gone", isBenar: false },
      { label: "C", teks: "went", isBenar: true },
      { label: "D", teks: "going", isBenar: false },
    ],
    kunciJawaban: "C",
    pembahasan: "Keterangan waktu 'yesterday' menandakan Simple Past Tense, menggunakan kata kerja bentuk kedua (V2): went.",
    tingkatKesulitan: "MUDAH",
  },
  {
    id: "REF-ENG-GRT-01",
    mataPelajaran: "Bahasa Inggris",
    jenjang: "SD",
    kelas: [4, 5, 6],
    topikUtama: "Greetings & Introduction",
    subTopik: ["Daily Greetings", "Polite Expressions"],
    kataKunci: ["greeting", "good morning", "how are you", "sapaan"],
    pertanyaan: "If you meet your friend at 7:00 AM, what should you say?",
    opsi: [
      { label: "A", teks: "Good morning!", isBenar: true },
      { label: "B", teks: "Good night!", isBenar: false },
      { label: "C", teks: "Goodbye!", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "Pukul 07.00 pagi kita mengucapkan salam 'Good morning'.",
    tingkatKesulitan: "MUDAH",
  },

  // ==========================================
  // BAHASA INDONESIA: TEKS & TATA BAHASA
  // ==========================================
  {
    id: "REF-IND-PRG-01",
    mataPelajaran: "Bahasa Indonesia",
    jenjang: "SD",
    kelas: [4, 5, 6],
    topikUtama: "Gagasan Pokok",
    subTopik: ["Paragraf Deduktif", "Ide Pokok"],
    kataKunci: ["gagasan pokok", "ide pokok", "kalimat utama", "paragraf"],
    pertanyaan: "Gagasan yang menjadi inti atau pokok pembahasan dalam suatu paragraf disebut...",
    opsi: [
      { label: "A", teks: "Gagasan pokok / ide pokok", isBenar: true },
      { label: "B", teks: "Gagasan penjelas", isBenar: false },
      { label: "C", teks: "Kalimat pengembang", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "Ide pokok atau gagasan pokok merupakan inti sari dari seluruh kalimat yang ada di dalam sebuah paragraf.",
    tingkatKesulitan: "MUDAH",
  },
  {
    id: "REF-IND-EYD-01",
    mataPelajaran: "Bahasa Indonesia",
    jenjang: "SMP",
    kelas: [7, 8, 9],
    topikUtama: "Ejaan & Tanda Baca",
    subTopik: ["Huruf Kapital", "Tanda Titik Dua"],
    kataKunci: ["ejaan", "huruf kapital", "nama geografi", "kata baku"],
    pertanyaan: "Penulisan huruf kapital yang benar menurut aturan EYD adalah...",
    opsi: [
      { label: "A", teks: "Keluarga kami berlibur ke danau Toba.", isBenar: false },
      { label: "B", teks: "Keluarga kami berlibur ke Danau Toba.", isBenar: true },
      { label: "C", teks: "keluarga kami Berlibur ke Danau Toba.", isBenar: false },
      { label: "D", teks: "Keluarga kami berlibur ke danau toba.", isBenar: false },
    ],
    kunciJawaban: "B",
    pembahasan: "Nama unsur geografi yang diikuti nama diri geografi ditulis dengan huruf awal kapital: Danau Toba.",
    tingkatKesulitan: "SEDANG",
  },

  // ==========================================
  // IPA / IPAS: ORGAN TUBUH & MAKHLUK HIDUP
  // ==========================================
  {
    id: "REF-IPA-ORG-01",
    mataPelajaran: "IPAS",
    jenjang: "SD",
    kelas: [4, 5],
    topikUtama: "Sistem Organ Manusia",
    subTopik: ["Jantung & Pembuluh Darah"],
    kataKunci: ["jantung", "peredaran darah", "organ tubuh", "memompa darah"],
    pertanyaan: "Organ tubuh yang berfungsi memompa darah ke seluruh tubuh adalah...",
    opsi: [
      { label: "A", teks: "Jantung", isBenar: true },
      { label: "B", teks: "Paru-paru", isBenar: false },
      { label: "C", teks: "Lambung", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "Jantung bertindak sebagai pompa otot utama dalam sistem peredaran darah manusia.",
    tingkatKesulitan: "MUDAH",
  },
  {
    id: "REF-IPA-SRK-02",
    mataPelajaran: "IPA",
    jenjang: "SMP",
    kelas: [8],
    topikUtama: "Sistem Sirkulasi Manusia",
    subTopik: ["Sel Darah & Fungsinya"],
    kataKunci: ["eritrosit", "leukosit", "trombosit", "hemoglobin", "oksigen"],
    pertanyaan: "Komponen darah yang bertugas mengikat oksigen dan mengedarkannya ke seluruh jaringan tubuh adalah...",
    opsi: [
      { label: "A", teks: "Eritrosit (Sel Darah Merah)", isBenar: true },
      { label: "B", teks: "Leukosit (Sel Darah Putih)", isBenar: false },
      { label: "C", teks: "Trombosit (Keping Darah)", isBenar: false },
      { label: "D", teks: "Plasma Darah", isBenar: false },
    ],
    kunciJawaban: "A",
    pembahasan: "Eritrosit mengandung hemoglobin yang memiliki afinitas tinggi untuk mengikat oksigen dari paru-paru.",
    tingkatKesulitan: "SEDANG",
  },
];

const REMOTE_DATASET_URL =
  (import.meta as any).env?.VITE_DATASET_URL ||
  "https://txfrreunsslmkhahtdun.supabase.co/storage/v1/object/public/Soalku-project/bank_soal_master.json";
const DATASET_CACHE_KEY = "soalku_remote_dataset_cache_v1";
const DATASET_CACHE_TTL_MS = 1000 * 60 * 30; // 30 menit

let remoteQuestionsCache: ReferenceQuestion[] = [];
let remoteLoadPromise: Promise<void> | null = null;

function mapRemoteDifficulty(diff?: string): "MUDAH" | "SEDANG" | "SULIT" {
  const norm = (diff || "").toLowerCase();
  if (norm.includes("mudah") || norm.includes("easy")) return "MUDAH";
  if (norm.includes("sulit") || norm.includes("hard")) return "SULIT";
  return "SEDANG";
}

function mapRemoteSubject(subj?: string): ReferenceQuestion["mataPelajaran"] {
  const norm = (subj || "").toLowerCase();
  if (norm.includes("matematika")) return "Matematika";
  if (norm.includes("inggris")) return "Bahasa Inggris";
  if (norm.includes("indonesia")) return "Bahasa Indonesia";
  if (norm.includes("ipas")) return "IPAS";
  if (norm.includes("ipa")) return "IPA";
  if (norm.includes("ips")) return "IPS";
  if (norm.includes("pai") || norm.includes("islam") || norm.includes("agama")) return "PAI";
  if (norm.includes("ppkn") || norm.includes("pancasila")) return "PPKn";
  if (norm.includes("informatika")) return "Informatika";
  return "IPA";
}

function convertRemoteQuestion(raw: any, index: number): ReferenceQuestion | null {
  if (!raw || !raw.question || !raw.options) return null;

  const gradeNum = Number(raw.grade) || 7;
  const jenjang: "SD" | "SMP" = gradeNum >= 1 && gradeNum <= 6 ? "SD" : "SMP";
  const correctKey = String(raw.correct_answer || "A").trim().toUpperCase().charAt(0) as "A" | "B" | "C" | "D";

  const optionLabels: ("A" | "B" | "C" | "D")[] = jenjang === "SD" && !raw.options.D ? ["A", "B", "C"] : ["A", "B", "C", "D"];
  const opsi = optionLabels
    .filter((lbl) => raw.options[lbl] !== undefined && raw.options[lbl] !== null && String(raw.options[lbl]).trim() !== "")
    .map((lbl) => ({
      label: lbl,
      teks: String(raw.options[lbl]),
      isBenar: lbl === correctKey,
    }));

  if (opsi.length < 2) return null;
  if (!opsi.some((o) => o.isBenar)) opsi[0].isBenar = true;

  const chapterText = String(raw.chapter || raw.subject || "Materi Umum").trim();
  const keywords = chapterText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  return {
    id: String(raw.id || `REM-${index + 1}`),
    mataPelajaran: mapRemoteSubject(raw.subject),
    jenjang,
    kelas: [gradeNum],
    topikUtama: chapterText,
    subTopik: [chapterText],
    kataKunci: Array.from(new Set(keywords)),
    pertanyaan: String(raw.question),
    opsi,
    kunciJawaban: opsi.find((o) => o.isBenar)?.label || "A",
    pembahasan: String(raw.explanation || "Pembahasan mengacu pada materi pembelajaran terkait."),
    tingkatKesulitan: mapRemoteDifficulty(raw.difficulty),
  };
}

/**
 * Memuat dataset soal dari Supabase Storage (dengan cache lokal agar cepat & hemat bandwidth).
 */
export async function ensureRemoteDatasetLoaded(): Promise<void> {
  if (remoteQuestionsCache.length > 0) return;

  try {
    const cachedRaw = localStorage.getItem(DATASET_CACHE_KEY);
    if (cachedRaw) {
      const parsedCache = JSON.parse(cachedRaw);
      if (
        parsedCache &&
        Array.isArray(parsedCache.items) &&
        Date.now() - (parsedCache.savedAt || 0) < DATASET_CACHE_TTL_MS
      ) {
        remoteQuestionsCache = parsedCache.items;
        return;
      }
    }
  } catch {}

  if (!remoteLoadPromise) {
    remoteLoadPromise = (async () => {
      try {
        const res = await fetch(REMOTE_DATASET_URL);
        if (!res.ok) return;
        const data = await res.json();
        const rawList = Array.isArray(data?.questions) ? data.questions : Array.isArray(data) ? data : [];
        const converted = rawList
          .map((item: any, idx: number) => convertRemoteQuestion(item, idx))
          .filter((q: ReferenceQuestion | null): q is ReferenceQuestion => q !== null);

        if (converted.length > 0) {
          remoteQuestionsCache = converted;
          try {
            localStorage.setItem(
              DATASET_CACHE_KEY,
              JSON.stringify({ savedAt: Date.now(), items: converted })
            );
          } catch {}
        }
      } catch (err) {
        console.warn("Gagal memuat dataset remote Supabase, menggunakan bank soal lokal:", err);
      } finally {
        remoteLoadPromise = null;
      }
    })();
  }

  await remoteLoadPromise;
}

/**
 * Filter soal acuan terstandar secara KETAT berdasarkan:
 * 1. Mata Pelajaran (harus sama)
 * 2. Jenjang (SD / SMP atau SEMUA)
 * 3. Kesesuaian Subtopik atau Kata Kunci Inti materi
 */
export function getStrictMatchingQuestions(
  mataPelajaran: string,
  jenjang: "SD" | "SMP",
  extractedContentText: string,
  maxCount: number = 10
): ReferenceQuestion[] {
  const normMapel = mataPelajaran.toLowerCase().trim();
  const normText = extractedContentText.toLowerCase();

  // Gabungkan dataset lokal bawaan dengan dataset remote dari Supabase
  const combinedBank = [...remoteQuestionsCache, ...REFERENCE_QUESTION_BANK];

  // 1. Saring berdasarkan mata pelajaran & jenjang
  const candidates = combinedBank.filter((item) => {
    const itemMapel = item.mataPelajaran.toLowerCase();
    const mapelMatches =
      itemMapel === normMapel ||
      normMapel.includes(itemMapel) ||
      itemMapel.includes(normMapel) ||
      (normMapel.includes("ipa") && itemMapel.includes("ipas")) ||
      (normMapel.includes("ipas") && itemMapel.includes("ipa"));

    if (!mapelMatches) return false;

    if (item.jenjang !== "SEMUA" && item.jenjang !== jenjang) {
      return false;
    }

    return true;
  });

  // 2. Beri skor relevansi berdasarkan kemunculan subtopik & kata kunci di teks dokumen
  const scored = candidates.map((item) => {
    let score = 0;
    // Cek topik utama
    if (normText.includes(item.topikUtama.toLowerCase())) {
      score += 10;
    }
    // Cek subtopik
    item.subTopik.forEach((sub) => {
      if (normText.includes(sub.toLowerCase())) {
        score += 8;
      }
    });
    // Cek kata kunci
    item.kataKunci.forEach((kw) => {
      if (normText.includes(kw.toLowerCase())) {
        score += 3;
      }
    });

    return { item, score };
  });

  // 3. Hanya ambil soal yang memiliki skor kecocokan topik (score > 0)
  // Ini mencegah soal di luar topik (misal Aljabar vs Geometri) terambil!
  const strictlyRelevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);

  return strictlyRelevant.slice(0, maxCount);
}
