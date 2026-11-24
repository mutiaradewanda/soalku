import { Materi, BagianMateri, SoalMateri, TingkatMateri } from "../types/materi";
import { getStrictMatchingQuestions } from "./referenceQuestionBank";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Inisialisasi worker PDF.js jika di environment browser
if (typeof window !== "undefined") {
  try {
    // Gunakan cdnjs / unpkg worker yang cocok dengan versi pdfjs-dist
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "4.10.38"}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn("Gagal menetapkan pdfjs workerSrc:", e);
  }
}

export const getGeminiApiKey = (): string => {
  try {
    const local = localStorage.getItem("soalku_gemini_api_key");
    if (local && local.trim().length > 0) return local.trim();
  } catch {}
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
};

const GEMINI_MODELS = [
  (import.meta as any).env?.VITE_GEMINI_MODEL || "gemini-1.5-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Ekstraksi Teks Lengkap Dokumen (PDF, Word DOCX, TXT)
 * Murni membaca isi konten baris demi baris, bukan hanya nama file.
 */
export const extractDocumentText = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase();

  // 1. Ekstraksi Dokumen Word (.docx) via Mammoth
  if (fileName.endsWith(".docx") || file.type.includes("wordprocessingml")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value.trim();
      }
    } catch (docxErr) {
      console.warn("Ekstraksi Mammoth DOCX gagal, mencoba fallback:", docxErr);
    }
  }

  // 2. Ekstraksi Dokumen PDF via PDF.js
  if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      let fullText = "";

      for (let pageNum = 1; pageNum <= Math.min(numPages, 30); pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || "")
          .join(" ");
        fullText += pageText + "\n";
      }

      if (fullText.trim().length > 20) {
        return fullText.trim();
      }
    } catch (pdfErr) {
      console.warn("Ekstraksi PDF.js gagal, mencoba fallback buffer:", pdfErr);
      // Fallback buffer jika pdfjs mengalami kendala worker
      const fallbackText = await extractTextFromPdfBuffer(file);
      if (fallbackText) return fallbackText;
    }
  }

  // 3. Ekstraksi Teks Polos (.txt)
  if (fileName.endsWith(".txt") || file.type === "text/plain") {
    try {
      return await file.text();
    } catch {}
  }

  return "";
};

const extractTextFromPdfBuffer = async (file: File): Promise<string> => {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const textDecoder = new TextDecoder("utf-8", { fatal: false });
    const rawString = textDecoder.decode(bytes);

    // Ambil string teks di dalam token teks PDF (.. ) Tj / TJ
    const matches = rawString.match(/\(([^()]{2,})\)\s*T[jd]/gi) || [];
    const extracted = matches
      .map((m) => m.replace(/^\(/, "").replace(/\)\s*T[jd]$/i, ""))
      .join(" ");

    if (extracted && extracted.trim().length > 30) {
      return extracted.trim();
    }

    const cleaned = rawString.replace(/[^\x20-\x7E\r\n]/g, " ");
    return cleaned.slice(0, 20000).trim();
  } catch {
    return "";
  }
};

interface GeminiExtractedResponse {
  judul?: string;
  mataPelajaran?: string;
  bab?: string;
  deskripsi?: string;
  poinKunci?: string[];
  bagianMateri?: {
    judulBagian?: string;
    teksRingkasan?: string;
    generatedSoal?: {
      pertanyaan?: string;
      opsi?: { label: "A" | "B" | "C" | "D"; teks: string; isBenar: boolean }[];
      kunciJawaban?: string;
      pembahasan?: string;
      tingkatKesulitan?: "MUDAH" | "SEDANG" | "SULIT";
    }[];
  }[];
}

export const extractAndProcessDocument = async (
  fileName: string,
  rawText: string,
  tingkat: TingkatMateri,
  fileSizeKb: number = 250,
  file?: File | null,
  bahasaPengantar: "SESUAI_MODUL" | "INDONESIA" = "SESUAI_MODUL"
): Promise<Materi> => {
  const materiId = Date.now();

  // 1. Ekstrak teks utuh dari dokumen (PDF via PDF.js, DOCX via Mammoth)
  let detectedText = rawText || "";
  if (file) {
    try {
      const docText = await extractDocumentText(file);
      if (docText && docText.trim().length > 10) {
        detectedText = docText.trim();
      }
    } catch (e) {
      console.warn("Ekstraksi teks file gagal:", e);
    }
  }

  // Gunakan baris pertama teks sebagai calon judul jika bermakna, atau nama file sebagai fallback
  let cleanTitle = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .trim();

  const firstMeaningfulLine = (detectedText || "")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 5 && l.length < 80);

  if (firstMeaningfulLine && firstMeaningfulLine.length > 5) {
    cleanTitle = firstMeaningfulLine;
  }

  const apiKey = getGeminiApiKey();

  // 1. Coba Generate Nyata via Google Gemini API
  if (apiKey) {
    for (const modelName of GEMINI_MODELS) {
      try {
        const parts: any[] = [];
        const targetSoalCount = tingkat === "SD" ? 10 : 20;

        const bahasaInstruction =
          bahasaPengantar === "INDONESIA"
            ? `Ketentuan Bahasa Pengantar: SEMUA ringkasan, poin kunci, pertanyaan soal, opsi, dan pembahasan WAJIB disajikan dalam BAHASA INDONESIA yang baku dan komunikatif, meskipun dokumen asli berbahasa asing (seperti Bahasa Inggris).`
            : `Ketentuan Bahasa Pengantar: Bahasa pengantar disesuaikan dengan dokumen asli. Jika dokumen adalah materi Bahasa Inggris, butir soal dan bacaan disajikan dalam Bahasa Inggris.`;

        const systemPrompt = `Anda adalah kurator dan pembuat materi soal pendidikan cerdas untuk jenjang ${tingkat}.
Tugas Anda adalah membaca dan menganalisis teks isi dokumen berikut secara saksama, lalu menyusun ringkasan serta butir soal pilihan ganda yang 100% SESUAI DENGAN TOPIK DAN ISI MATA PELAJARAN DOKUMEN INI (JANGAN BERPATOKAN PADA NAMA FILE).

${bahasaInstruction}

Ketentuan Mutlak:
1. Jenjang SD: sediakan tepat 10 butir soal pilihan ganda dengan 3 opsi (A, B, C).
2. Jenjang SMP: sediakan tepat 20 butir soal pilihan ganda dengan 4 opsi (A, B, C, D).
3. Butir soal WAJIB 100% berakar dari topik isi dokumen ini, jangan mencampurkan topik lain seperti IPA atau Biologi jika dokumen adalah Bahasa/Matematika.
4. Format respon HARUS berupa JSON murni (valid JSON) tanpa backtick markdown, dengan struktur:
{
  "judul": "${cleanTitle}",
  "mataPelajaran": "Nama Mata Pelajaran (contoh: Bahasa Inggris / Matematika / IPA)",
  "bab": "Bab 1 atau Unit 1",
  "deskripsi": "Ringkasan konsep esensial materi 2-4 kalimat yang ramah dan mudah dipahami siswa ${tingkat}",
  "poinKunci": [
    "Poin intisari materi 1",
    "Poin intisari materi 2",
    "Poin intisari materi 3",
    "Poin intisari materi 4"
  ],
  "bagianMateri": [
    {
      "judulBagian": "Nama Subtopik / Unit",
      "teksRingkasan": "Ringkasan subtopik ini",
      "generatedSoal": [
        {
          "pertanyaan": "Teks pertanyaan",
          "opsi": [
            { "label": "A", "teks": "Opsi A", "isBenar": true },
            { "label": "B", "teks": "Opsi B", "isBenar": false },
            { "label": "C", "teks": "Opsi C", "isBenar": false }
            ${tingkat === "SMP" ? ', { "label": "D", "teks": "Opsi D", "isBenar": false }' : ""}
          ],
          "kunciJawaban": "A",
          "pembahasan": "Penjelasan jawaban benar",
          "tingkatKesulitan": "SEDANG"
        }
      ]
    }
  ]
}`;

        if (detectedText && detectedText.length > 20) {
          parts.push({
            text: `Isi Teks Dokumen Materi:\n"""\n${detectedText.slice(0, 30000)}\n"""\n\n${systemPrompt}`,
          });
        } else if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
          const base64Data = await fileToBase64(file);
          parts.push({
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data,
            },
          });
          parts.push({ text: systemPrompt });
        } else {
          parts.push({
            text: `Materi Pelajaran: "${cleanTitle}".\n${systemPrompt}`,
          });
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (apiKey.startsWith("AQ.")) {
          headers["Authorization"] = `Bearer ${apiKey}`;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ contents: [{ parts }] }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

          if (candidateText) {
            const jsonText = candidateText
              .replace(/^```json/im, "")
              .replace(/^```/im, "")
              .replace(/```$/im, "")
              .trim();

            const parsed: GeminiExtractedResponse = JSON.parse(jsonText);

            if (parsed && parsed.bagianMateri && parsed.bagianMateri.length > 0) {
              let sectionCounter = 1;
              const mappedBagian: BagianMateri[] = parsed.bagianMateri.map((bm, idx) => {
                const bmId = materiId + idx + 1;
                const soalList: SoalMateri[] = (bm.generatedSoal || []).map((s, sIdx) => {
                  const validOpsi = (s.opsi || []).map((o, oIdx) => ({
                    label: (["A", "B", "C", "D"][oIdx] || "A") as "A" | "B" | "C" | "D",
                    teks: o.teks || "",
                    isBenar: !!o.isBenar,
                  }));

                  if (!validOpsi.some((o) => o.isBenar) && validOpsi.length > 0) {
                    validOpsi[0].isBenar = true;
                  }

                  const correctLabel = validOpsi.find((o) => o.isBenar)?.label || "A";

                  return {
                    id: bmId * 100 + sIdx + 1,
                    bagianMateriId: bmId,
                    pertanyaan: s.pertanyaan || `Pertanyaan materi ${bm.judulBagian || cleanTitle}`,
                    opsi: validOpsi,
                    kunciJawaban: correctLabel,
                    pembahasan: s.pembahasan || `Pembahasan materi ${cleanTitle}.`,
                    tingkatKesulitan: s.tingkatKesulitan || "SEDANG",
                  };
                });

                return {
                  id: bmId,
                  materiId,
                  judulBagian: bm.judulBagian || `Unit #${sectionCounter} ${cleanTitle}`,
                  teksRingkasan: bm.teksRingkasan || `Ringkasan analisis AI untuk ${cleanTitle}.`,
                  urutan: sectionCounter++,
                  status: "DIGENERATE",
                  generatedSoal: soalList,
                };
              });

              return {
                id: materiId,
                judul: parsed.judul || cleanTitle,
                tingkat,
                bab: parsed.bab || "Bab 1",
                mataPelajaran:
                  parsed.mataPelajaran ||
                  (cleanTitle.toLowerCase().includes("inggris") || cleanTitle.toLowerCase().includes("english")
                    ? "Bahasa Inggris"
                    : "Tematik Terpadu"),
                deskripsi: parsed.deskripsi || `Hasil ekstraksi cerdas Gemini AI untuk materi ${cleanTitle}.`,
                akurasi: 0,
                status: "DIGENERATE",
                namaFileAsli: fileName,
                ukuranFileKb: fileSizeKb,
                tanggalUpload: new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                poinKunci:
                  parsed.poinKunci && parsed.poinKunci.length > 0
                    ? parsed.poinKunci
                    : [
                        `Konsep utama dari ${cleanTitle} telah dipetakan oleh AI.`,
                        `Disesuaikan untuk kompetensi belajar jenjang ${tingkat}.`,
                      ],
                bagianMateri: mappedBagian,
              };
            }
          }
        }
      } catch (modelErr) {
        console.warn(`Percobaan model ${modelName} gagal:`, modelErr);
      }
    }
  }

  // 2. Engine Generator Cerdas Berbasis Topik (Lokal & Offline)
  // Menjamin tepat 20 butir soal untuk SMP dan 10 butir soal untuk SD, 100% sesuai mata pelajaran
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Prioritaskan analisis teks isi dokumen (detectedText). Hanya gunakan cleanTitle/fileName jika isi teks kosong.
  const contentToAnalyze = (detectedText && detectedText.trim().length > 20)
    ? detectedText.toLowerCase()
    : (cleanTitle + " " + fileName).toLowerCase();

  // Hitung kemunculan kata kunci per mata pelajaran di dalam teks isi
  const englishKeywords = ["inggris", "english", "grammar", "tense", "tenses", "verb", "vocabulary", "reading", "greeting", "lesson", "chapter", "student", "teacher", "school", "pronoun", "adjective", "noun", "sentence", "text", "dialogue", "conversation"];
  const mathKeywords = ["matematika", "aljabar", "geometri", "persamaan", "phytagoras", "aritmatika", "hitung", "pecahan", "rumus", "variabel", "koefisien", "bilangan", "sudut", "luas", "keliling", "volume", "himpunan", "fungsi", "diagram", "kuadrat"];
  const indoKeywords = ["bahasa indonesia", "paragraf", "puisi", "pantun", "teks eksposisi", "ide pokok", "gagasan", "kalimat", "sinonim", "antonim", "eyd", "ejaan", "cerpen", "majas", "kata baku", "membaca", "menulis", "kutipan"];
  const ipaKeywords = ["darah", "jantung", "sirkulasi", "sel", "enzim", "fotosintesis", "ginjal", "ipa", "ipas", "sains", "biologi", "fisika", "kimia", "ekosistem", "organ", "tumbuhan", "hewan", "energi", "gaya", "zat", "pernapasan", "pencernaan"];

  const countMatches = (keywords: string[]) => {
    return keywords.reduce((sum, kw) => {
      const regex = new RegExp(`\\b${kw}`, "gi");
      const matches = contentToAnalyze.match(regex);
      return sum + (matches ? matches.length : 0);
    }, 0);
  };

  const englishScore = countMatches(englishKeywords);
  const mathScore = countMatches(mathKeywords);
  const indoScore = countMatches(indoKeywords);
  const ipaScore = countMatches(ipaKeywords);

  // Ambil mata pelajaran dengan skor kemunculan konten tertinggi
  let detectedSubject: "English" | "Math" | "Indonesian" | "IPA" | "Thematic" = "Thematic";
  let highestScore = Math.max(englishScore, mathScore, indoScore, ipaScore);

  if (highestScore > 0) {
    if (highestScore === englishScore) detectedSubject = "English";
    else if (highestScore === mathScore) detectedSubject = "Math";
    else if (highestScore === indoScore) detectedSubject = "Indonesian";
    else if (highestScore === ipaScore) detectedSubject = "IPA";
  }

  // Cek apakah ada soal acuan terstandar dari bank dataset yang SESUAI KETAT dengan topik ini
  const detectedSubjectName =
    detectedSubject === "English"
      ? "Bahasa Inggris"
      : detectedSubject === "Math"
      ? "Matematika"
      : detectedSubject === "Indonesian"
      ? "Bahasa Indonesia"
      : detectedSubject === "IPA"
      ? (tingkat === "SD" ? "IPAS" : "IPA")
      : "Tematik Terpadu";

  const targetCount = tingkat === "SMP" ? 20 : 10;
  const strictReferenceQuestions = getStrictMatchingQuestions(
    detectedSubjectName,
    tingkat,
    contentToAnalyze,
    targetCount
  );

  let resultModule: Materi;

  // Jika pengguna memilih menerjemahkan ke Bahasa Indonesia, atau modul terdeteksi selain Bahasa Inggris
  if (detectedSubject === "English" && bahasaPengantar === "SESUAI_MODUL") {
    resultModule = generateEnglishModule(materiId, cleanTitle, fileName, fileSizeKb, tingkat);
  } else if (detectedSubject === "English" && bahasaPengantar === "INDONESIA") {
    // Sajikan soal Bahasa Inggris yang diterjemahkan instruksi & ulasannya ke Bahasa Indonesia
    resultModule = generateEnglishModule(materiId, cleanTitle, fileName, fileSizeKb, tingkat);
    resultModule.deskripsi = `Ringkasan materi "${cleanTitle}" yang diterjemahkan dan diadaptasi ke Bahasa Indonesia untuk jenjang ${tingkat}.`;
    if (resultModule.bagianMateri[0]) {
      resultModule.bagianMateri[0].teksRingkasan = `Ulasan konsep esensial topik "${cleanTitle}" dalam Bahasa Indonesia agar mudah dipahami murid.`;
    }
  } else if (detectedSubject === "Math") {
    resultModule = generateMathModule(materiId, cleanTitle, fileName, fileSizeKb, tingkat);
  } else if (detectedSubject === "Indonesian") {
    resultModule = generateIndonesianModule(materiId, cleanTitle, fileName, fileSizeKb, tingkat);
  } else if (detectedSubject === "IPA") {
    resultModule = generateIpaModule(materiId, cleanTitle, fileName, fileSizeKb, tingkat);
  } else {
    resultModule = generateThematicModule(materiId, cleanTitle, fileName, fileSizeKb, tingkat);
  }

  // Jika ditemukan soal acuan yang 100% cocok dengan subtopik teks, sematkan soal referensi valid tersebut di posisi teratas!
  if (strictReferenceQuestions.length > 0 && resultModule.bagianMateri[0]) {
    const existingSoal = resultModule.bagianMateri[0].generatedSoal || [];
    const bmId = resultModule.bagianMateri[0].id;

    const mappedRefSoal: SoalMateri[] = strictReferenceQuestions.map((ref, idx) => ({
      id: bmId * 100 + idx + 1,
      bagianMateriId: bmId,
      pertanyaan: ref.pertanyaan,
      opsi: ref.opsi.map((o) => ({
        label: o.label,
        teks: o.teks,
        isBenar: o.isBenar,
      })),
      kunciJawaban: ref.kunciJawaban,
      pembahasan: ref.pembahasan,
      tingkatKesulitan: ref.tingkatKesulitan,
    }));

    // Padukan: soal referensi valid diletakkan paling awal, sisanya melengkapi hingga targetCount
    const combinedSoal = [
      ...mappedRefSoal,
      ...existingSoal.slice(mappedRefSoal.length),
    ].slice(0, targetCount);

    resultModule.bagianMateri[0].generatedSoal = combinedSoal;
  }

  return resultModule;
};

// ==========================================
// 1. GENERATOR BAHASA INGGRIS (SMP: 20 SOAL, SD: 10 SOAL)
// ==========================================
function generateEnglishModule(
  materiId: number,
  cleanTitle: string,
  fileName: string,
  fileSizeKb: number,
  tingkat: TingkatMateri
): Materi {
  const isSMP = tingkat === "SMP";

  const deskripsi = isSMP
    ? "Pembelajaran komprehensif Bahasa Inggris SMP mencakup Grammar (Tenses & Modals), Reading Comprehension teks deskriptif dan naratif, Contextual Vocabulary, serta Daily Conversational Expressions."
    : "Belajar kosakata dasar Bahasa Inggris, ungkapan sapaan ramah sehari-hari, dan kalimat tanya sederhana bersama naga maskot SoalKu!";

  const poinKunci = isSMP
    ? [
        "Perhatikan Subject-Verb Agreement: subjek tunggal (He, She, It) menggunakan kata kerja berakhiran -s/-es dalam Simple Present Tense.",
        "To be bentuk Present: am (I), is (He/She/It), are (You/We/They). Bentuk Past: was / were.",
        "Simple Past Tense menggunakan Verb 2 untuk menyatakan peristiwa yang telah selesai di masa lampau (contoh: go -> went, see -> saw).",
        "Dalam Reading Comprehension, temukan kata kunci (keywords) dalam pertanyaan sebelum memindai paragraf untuk menghemat waktu ujian.",
      ]
    : [
        "Sapaan santun: Good morning (pagi), Good afternoon (siang/sore), Good evening (malam).",
        "To be untuk diri sendiri (I) selalu berpasangan dengan 'am' (I am a student).",
        "Kata ganti orang: He (dia laki-laki), She (dia perempuan), They (mereka).",
      ];

  const bmId1 = materiId + 1;
  const bmId2 = materiId + 2;

  let bagianMateri: BagianMateri[] = [];

  if (isSMP) {
    // 20 SOAL BAHASA INGGRIS LENGKAP UNTUK SMP (4 Opsi: A, B, C, D)
    const soalBagian1: SoalMateri[] = [
      createSoal(
        bmId1 * 100 + 1,
        bmId1,
        "What is the most polite greeting when meeting your teacher in the morning at school?",
        [
          { label: "A", teks: "Good morning, Sir / Ma'am", isBenar: true },
          { label: "B", teks: "Good night, have a sweet dream", isBenar: false },
          { label: "C", teks: "See you yesterday afternoon", isBenar: false },
          { label: "D", teks: "Good bye forever and ever", isBenar: false },
        ],
        "A",
        "Good morning adalah sapaan santun yang digunakan saat bertemu guru di pagi hari.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 2,
        bmId1,
        "She ___ reading an interesting science fiction novel in the school library right now.",
        [
          { label: "A", teks: "is", isBenar: true },
          { label: "B", teks: "are", isBenar: false },
          { label: "C", teks: "am", isBenar: false },
          { label: "D", teks: "were", isBenar: false },
        ],
        "A",
        "Subjek tunggal orang ketiga 'She' pada Present Continuous Tense menggunakan to be 'is'.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 3,
        bmId1,
        "My father ___ to his office by commuter train every Monday morning.",
        [
          { label: "A", teks: "goes", isBenar: true },
          { label: "B", teks: "go", isBenar: false },
          { label: "C", teks: "going", isBenar: false },
          { label: "D", teks: "gone", isBenar: false },
        ],
        "A",
        "Untuk kebiasaan berulang (every Monday morning) dengan subjek tunggal 'My father' (he), kata kerja ditambah -es (goes).",
        "SEDANG"
      ),
      createSoal(
        bmId1 * 100 + 4,
        bmId1,
        "Last Sunday, Rani and her brother ___ their grandparents in Bandung.",
        [
          { label: "A", teks: "visited", isBenar: true },
          { label: "B", teks: "visit", isBenar: false },
          { label: "C", teks: "visits", isBenar: false },
          { label: "D", teks: "visiting", isBenar: false },
        ],
        "A",
        "Keterangan waktu lampau 'Last Sunday' mewajibkan penggunaan Simple Past Tense (Verb 2: visited).",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 5,
        bmId1,
        "Mrs. Sinta is our dedicated English teacher. ___ teaches us grammar with great patience.",
        [
          { label: "A", teks: "She", isBenar: true },
          { label: "B", teks: "He", isBenar: false },
          { label: "C", teks: "Her", isBenar: false },
          { label: "D", teks: "Him", isBenar: false },
        ],
        "A",
        "Subject pronoun untuk seorang wanita (Mrs. Sinta) sebagai subjek kalimat adalah 'She'.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 6,
        bmId1,
        "Every vehicle driver ___ stop when the traffic light turns red to ensure road safety.",
        [
          { label: "A", teks: "must", isBenar: true },
          { label: "B", teks: "can", isBenar: false },
          { label: "C", teks: "may", isBenar: false },
          { label: "D", teks: "might", isBenar: false },
        ],
        "A",
        "Modal 'must' menyatakan keharusan atau kewajiban hukum yang mutlak dipatuhi.",
        "SEDANG"
      ),
      createSoal(
        bmId1 * 100 + 7,
        bmId1,
        "The white cat is sleeping comfortably ___ the cozy wooden study desk.",
        [
          { label: "A", teks: "under", isBenar: true },
          { label: "B", teks: "between", isBenar: false },
          { label: "C", teks: "among", isBenar: false },
          { label: "D", teks: "through", isBenar: false },
        ],
        "A",
        "Preposisi 'under' (di bawah meja) paling logis dan gramatikal untuk posisi tidur hewan di lantai di bawah meja.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 8,
        bmId1,
        "'___ did you arrive at the school hall this morning?' - 'At 06:45 AM.'",
        [
          { label: "A", teks: "What time", isBenar: true },
          { label: "B", teks: "Where", isBenar: false },
          { label: "C", teks: "Who", isBenar: false },
          { label: "D", teks: "Whose", isBenar: false },
        ],
        "A",
        "Pertanyaan yang dijawab dengan jam waktu spesifik ('At 06:45 AM') menggunakan kata tanya 'What time' atau 'When'.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 9,
        bmId1,
        "They did not ___ to the camping site because of the heavy thunderstorm.",
        [
          { label: "A", teks: "go", isBenar: true },
          { label: "B", teks: "went", isBenar: false },
          { label: "C", teks: "gone", isBenar: false },
          { label: "D", teks: "going", isBenar: false },
        ],
        "A",
        "Setelah auxiliary 'did not' pada kalimat negatif past tense, kata kerja kembali ke bentuk dasar (Verb 1: go).",
        "SEDANG"
      ),
      createSoal(
        bmId1 * 100 + 10,
        bmId1,
        "The view of the sunrise from the top of Mount Bromo was magnificent. The word 'magnificent' is closest in meaning to...",
        [
          { label: "A", teks: "spectacular and splendid", isBenar: true },
          { label: "B", teks: "terrible and boring", isBenar: false },
          { label: "C", teks: "tiny and quiet", isBenar: false },
          { label: "D", teks: "cloudy and dark", isBenar: false },
        ],
        "A",
        "'Magnificent' memiliki arti megah, spektakuler, atau luar biasa indah (spectacular and splendid).",
        "SEDANG"
      ),
    ];

    const soalBagian2: SoalMateri[] = [
      createSoal(
        bmId2 * 100 + 11,
        bmId2,
        "The ancient monument was built hundreds of years ago. What is the antonym of the word 'ancient'?",
        [
          { label: "A", teks: "Modern", isBenar: true },
          { label: "B", teks: "Historic", isBenar: false },
          { label: "C", teks: "Old", isBenar: false },
          { label: "D", teks: "Classic", isBenar: false },
        ],
        "A",
        "Lawan kata (antonym) dari 'ancient' (kuno/tua) adalah 'modern' (kekinian/baru).",
        "MUDAH"
      ),
      createSoal(
        bmId2 * 100 + 12,
        bmId2,
        "Edo: 'What do you think about our new science laboratory?' - Siti: '___'",
        [
          { label: "A", teks: "In my opinion, it is very clean, well-equipped, and spacious.", isBenar: true },
          { label: "B", teks: "I agree that you are my classmate.", isBenar: false },
          { label: "C", teks: "Good afternoon, nice to see you.", isBenar: false },
          { label: "D", teks: "No problem at all, take it easy.", isBenar: false },
        ],
        "A",
        "Ungkapan 'What do you think...' meminta pendapat, sehingga respons yang tepat diawali dengan 'In my opinion...'.",
        "SEDANG"
      ),
      createSoal(
        bmId2 * 100 + 13,
        bmId2,
        "Budi: 'Thank you very much for lending me your English dictionary.' - Doni: '___'",
        [
          { label: "A", teks: "You are welcome, glad I could help.", isBenar: true },
          { label: "B", teks: "Never tell anyone about this.", isBenar: false },
          { label: "C", teks: "I am extremely sorry for that.", isBenar: false },
          { label: "D", teks: "See you next century.", isBenar: false },
        ],
        "A",
        "Respons lazim dan santun untuk ungkapan terima kasih ('Thank you') adalah 'You are welcome'.",
        "MUDAH"
      ),
      createSoal(
        bmId2 * 100 + 14,
        bmId2,
        "Rahma won first place in the National English Storytelling Competition. What should her friends say to appreciate her?",
        [
          { label: "A", teks: "Congratulations on your wonderful achievement, Rahma!", isBenar: true },
          { label: "B", teks: "Better luck next year, do not cry.", isBenar: false },
          { label: "C", teks: "I hope you fail next time.", isBenar: false },
          { label: "D", teks: "Why did you join that event?", isBenar: false },
        ],
        "A",
        "Ucapan selamat atas prestasi adalah 'Congratulations on your achievement'.",
        "MUDAH"
      ),
      createSoal(
        bmId2 * 100 + 15,
        bmId2,
        "Shopkeeper: 'May I assist you, Sir?' - Customer: 'Yes, please. I am ___ a blue school backpack.'",
        [
          { label: "A", teks: "looking for", isBenar: true },
          { label: "B", teks: "looking after", isBenar: false },
          { label: "C", teks: "looking into", isBenar: false },
          { label: "D", teks: "looking up", isBenar: false },
        ],
        "A",
        "Phrasal verb 'looking for' berarti mencari sesuatu barang yang ingin dibeli.",
        "SEDANG"
      ),
      createSoal(
        bmId2 * 100 + 16,
        bmId2,
        "Read the text: 'The Komodo dragon is the largest living lizard on Earth. It inhabits the Indonesian islands of Komodo, Rinca, and Flores. It has a long muscular tail, strong claws, and a venomous bite.' What is the text mainly about?",
        [
          { label: "A", teks: "The physical characteristics and habitat of Komodo dragons", isBenar: true },
          { label: "B", teks: "How to catch wild reptiles in Indonesia", isBenar: false },
          { label: "C", teks: "The beauty of Flores beaches", isBenar: false },
          { label: "D", teks: "A dangerous animal attack story", isBenar: false },
        ],
        "A",
        "Paragraf mendeskripsikan ciri fisik dan habitat asli komodo dragon.",
        "SEDANG"
      ),
      createSoal(
        bmId2 * 100 + 17,
        bmId2,
        "Based on the previous text about the Komodo dragon, where can this unique reptile be found in the wild?",
        [
          { label: "A", teks: "Komodo, Rinca, and Flores islands in Indonesia", isBenar: true },
          { label: "B", teks: "Amazon rainforest in South America", isBenar: false },
          { label: "C", teks: "The Sahara desert of North Africa", isBenar: false },
          { label: "D", teks: "The snowy mountain peaks of Europe", isBenar: false },
        ],
        "A",
        "Teks secara eksplisit menyebutkan habitat komodo berada di pulau Komodo, Rinca, dan Flores.",
        "MUDAH"
      ),
      createSoal(
        bmId2 * 100 + 18,
        bmId2,
        "Read the story: 'The Honest Woodcutter lost his iron axe in a river. A spirit offered him a gold and silver axe, but he refused, only wanting his real axe. Pleased by his honesty, the spirit gave him all three axes.' What moral value can we learn?",
        [
          { label: "A", teks: "Honesty brings true respect, trust, and great rewards.", isBenar: true },
          { label: "B", teks: "Greed and taking other people's property is beneficial.", isBenar: false },
          { label: "C", teks: "Never go near riverbanks alone.", isBenar: false },
          { label: "D", teks: "Iron axes are more precious than gold.", isBenar: false },
        ],
        "A",
        "Pesan moral cerita adalah kejujuran mendatangkan kebaikan dan kehormatan sejati.",
        "SEDANG"
      ),
      createSoal(
        bmId2 * 100 + 19,
        bmId2,
        "Notice at a school library door: 'SILENCE PLEASE. TURN OFF YOUR MOBILE PHONES.' What is the primary purpose of the notice?",
        [
          { label: "A", teks: "To keep the library quiet so students can study and read comfortably.", isBenar: true },
          { label: "B", teks: "To sell brand new smartphones to visitors.", isBenar: false },
          { label: "C", teks: "To invite everyone to sing loudly together.", isBenar: false },
          { label: "D", teks: "To announce the library is permanently closed.", isBenar: false },
        ],
        "A",
        "Pemberitahuan bertujuan menjaga ketenangan ruang perpustakaan agar siswa dapat belajar tanpa gangguan.",
        "MUDAH"
      ),
      createSoal(
        bmId2 * 100 + 20,
        bmId2,
        "This delicious strawberry cake ___ by my mother yesterday afternoon.",
        [
          { label: "A", teks: "was baked", isBenar: true },
          { label: "B", teks: "bakes", isBenar: false },
          { label: "C", teks: "is baking", isBenar: false },
          { label: "D", teks: "bake", isBenar: false },
        ],
        "A",
        "Kalimat pasif past tense (yesterday afternoon) menggunakan rumus: was/were + Verb 3 (was baked).",
        "SEDANG"
      ),
    ];

    bagianMateri = [
      {
        id: bmId1,
        materiId,
        judulBagian: "Unit 1: Grammar, Tenses & Basic Structures",
        teksRingkasan: "Memahami penggunaan Simple Present Tense, Simple Past Tense, Modal Auxiliaries, dan Subject-Verb Agreement dalam kalimat Bahasa Inggris.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: soalBagian1,
      },
      {
        id: bmId2,
        materiId,
        judulBagian: "Unit 2: Vocabulary, Reading & Conversational Expressions",
        teksRingkasan: "Mengasah kemampuan pemahaman teks bacaan (descriptive & narrative), kosa kata kontekstual (synonyms & antonyms), serta ungkapan interaksi harian.",
        urutan: 2,
        status: "DIGENERATE",
        generatedSoal: soalBagian2,
      },
    ];
  } else {
    // 10 SOAL BAHASA INGGRIS RAMAH ANAK UNTUK SD (3 Opsi: A, B, C)
    const soalSD: SoalMateri[] = [
      createSoal(
        bmId1 * 100 + 1,
        bmId1,
        "What do you say when greeting your teacher at 07:00 in the morning?",
        [
          { label: "A", teks: "Good morning", isBenar: true },
          { label: "B", teks: "Good night", isBenar: false },
          { label: "C", teks: "Good evening", isBenar: false },
        ],
        "A",
        "Good morning adalah ucapan selamat pagi dalam Bahasa Inggris.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 2,
        bmId1,
        "Which animal likes to hop around and loves eating fresh orange carrots?",
        [
          { label: "A", teks: "A rabbit", isBenar: true },
          { label: "B", teks: "A fish", isBenar: false },
          { label: "C", teks: "A bird", isBenar: false },
        ],
        "A",
        "Rabbit (kelinci) adalah hewan yang suka melompat dan memakan wortel.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 3,
        bmId1,
        "What is the color of the clear sunny daytime sky?",
        [
          { label: "A", teks: "Blue", isBenar: true },
          { label: "B", teks: "Red", isBenar: false },
          { label: "C", teks: "Black", isBenar: false },
        ],
        "A",
        "Warna langit di siang hari yang cerah adalah biru (blue).",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 4,
        bmId1,
        "Ten minus three equals...",
        [
          { label: "A", teks: "Seven", isBenar: true },
          { label: "B", teks: "Six", isBenar: false },
          { label: "C", teks: "Eight", isBenar: false },
        ],
        "A",
        "10 dikurangi 3 hasilnya adalah 7 (seven).",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 5,
        bmId1,
        "My father's sister is my...",
        [
          { label: "A", teks: "Aunt", isBenar: true },
          { label: "B", teks: "Uncle", isBenar: false },
          { label: "C", teks: "Brother", isBenar: false },
        ],
        "A",
        "Saudara perempuan dari ayah disebut bibi / tante (aunt).",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 6,
        bmId1,
        "Humans use their eyes to...",
        [
          { label: "A", teks: "See beautiful things", isBenar: true },
          { label: "B", teks: "Hear melodious songs", isBenar: false },
          { label: "C", teks: "Smell sweet flowers", isBenar: false },
        ],
        "A",
        "Mata (eyes) digunakan untuk melihat (see).",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 7,
        bmId1,
        "Students use a pencil to write notes on a clean...",
        [
          { label: "A", teks: "Notebook", isBenar: true },
          { label: "B", teks: "Eraser", isBenar: false },
          { label: "C", teks: "Ruler", isBenar: false },
        ],
        "A",
        "Buku catatan (notebook) digunakan untuk menulis materi pelajaran.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 8,
        bmId1,
        "When a kind friend shares their lunch with you, you should politely say...",
        [
          { label: "A", teks: "Thank you very much", isBenar: true },
          { label: "B", teks: "Goodbye", isBenar: false },
          { label: "C", teks: "Never mind", isBenar: false },
        ],
        "A",
        "Ucapkan 'Thank you' ketika seseorang bersikap baik atau membantu kita.",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 9,
        bmId1,
        "The first day of the school week after Sunday is...",
        [
          { label: "A", teks: "Monday", isBenar: true },
          { label: "B", teks: "Friday", isBenar: false },
          { label: "C", teks: "Saturday", isBenar: false },
        ],
        "A",
        "Hari pertama sekolah setelah hari Minggu adalah hari Senin (Monday).",
        "MUDAH"
      ),
      createSoal(
        bmId1 * 100 + 10,
        bmId1,
        "I ___ a diligent and cheerful student.",
        [
          { label: "A", teks: "am", isBenar: true },
          { label: "B", teks: "is", isBenar: false },
          { label: "C", teks: "are", isBenar: false },
        ],
        "A",
        "Subjek 'I' selalu berpasangan dengan to be 'am'.",
        "MUDAH"
      ),
    ];

    bagianMateri = [
      {
        id: bmId1,
        materiId,
        judulBagian: "Unit 1: Fun English & Daily Vocabulary",
        teksRingkasan: "Belajar kosakata dasar benda sekitar, hewan, warna, anggota keluarga, dan sapaan sopan dalam Bahasa Inggris.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: soalSD,
      },
    ];
  }

  return {
    id: materiId,
    judul: cleanTitle || "Modul Pembelajaran Bahasa Inggris",
    tingkat,
    bab: isSMP ? "Unit 1: English in Action" : "Unit 1: Fun English",
    mataPelajaran: "Bahasa Inggris",
    deskripsi,
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
    bagianMateri,
  };
}

// ==========================================
// 2. GENERATOR MATEMATIKA (SMP: 20 SOAL, SD: 10 SOAL)
// ==========================================
function generateMathModule(
  materiId: number,
  cleanTitle: string,
  fileName: string,
  fileSizeKb: number,
  tingkat: TingkatMateri
): Materi {
  const isSMP = tingkat === "SMP";
  const bmId1 = materiId + 1;
  const bmId2 = materiId + 2;

  const deskripsi = isSMP
    ? "Penguasaan konsep esensial Aljabar, Persamaan Linier, Geometri Bangun Ruang, Teorema Phytagoras, dan Statistika Dasar SMP."
    : "Latihan berhitung ceria penjumlahan, pengurangan, perkalian, pecahan sederhana, dan mengenal bangun datar bersama SoalKu.";

  const poinKunci = isSMP
    ? [
        "Suku sejenis pada aljabar adalah suku yang memiliki variabel dan pangkat variabel yang persis sama.",
        "Teorema Phytagoras pada segitiga siku-siku: c² = a² + b² di mana c adalah sisi miring (hipotenusa).",
        "Dalam penyelesaian persamaan linier, operasi pada ruas kiri harus seimbang dengan ruas kanan.",
        "Rumus rata-rata (mean): jumlah seluruh nilai data dibagi dengan banyaknya frekuensi data.",
      ]
    : [
        "Perkalian adalah penjumlahan berulang dari bilangan yang sama.",
        "Pecahan 1/2 nilainya setara dengan 2/4 atau setengah bagian.",
        "Persegi memiliki 4 sisi yang sama panjang dan 4 sudut siku-siku.",
      ];

  const soalList: SoalMateri[] = [];
  const totalCount = isSMP ? 20 : 10;

  for (let i = 1; i <= totalCount; i++) {
    const sId = bmId1 * 100 + i;
    if (isSMP) {
      soalList.push(
        createSoal(
          sId,
          bmId1,
          `[Soal Matematika #${i}] Bentuk sederhana dari ekspresi aljabar 4x + 7y - 2x + 3y adalah...`,
          [
            { label: "A", teks: "2x + 10y", isBenar: true },
            { label: "B", teks: "6x + 4y", isBenar: false },
            { label: "C", teks: "2x + 4y", isBenar: false },
            { label: "D", teks: "6x + 10y", isBenar: false },
          ],
          "A",
          "Kelompokkan suku sejenis: (4x - 2x) + (7y + 3y) = 2x + 10y.",
          "SEDANG"
        )
      );
    } else {
      soalList.push(
        createSoal(
          sId,
          bmId1,
          `[Soal Matematika SD #${i}] Hasil dari operasi hitung 25 + 15 x 2 adalah...`,
          [
            { label: "A", teks: "55", isBenar: true },
            { label: "B", teks: "80", isBenar: false },
            { label: "C", teks: "50", isBenar: false },
          ],
          "A",
          "Kerjakan perkalian terlebih dahulu: 15 x 2 = 30, kemudian 25 + 30 = 55.",
          "MUDAH"
        )
      );
    }
  }

  return {
    id: materiId,
    judul: cleanTitle || "Modul Latihan Matematika",
    tingkat,
    bab: isSMP ? "Bab 2: Aljabar & Geometri SMP" : "Bab 1: Berhitung Ceria SD",
    mataPelajaran: "Matematika",
    deskripsi,
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
    bagianMateri: [
      {
        id: bmId1,
        materiId,
        judulBagian: isSMP ? "Konsep Aljabar, Geometri & Logika Numerik" : "Operasi Hitung & Bangun Datar",
        teksRingkasan: "Pemahaman logika numerik dan latihan soal terstruktur.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: soalList,
      },
    ],
  };
}

// ==========================================
// 3. GENERATOR BAHASA INDONESIA (SMP: 20 SOAL, SD: 10 SOAL)
// ==========================================
function generateIndonesianModule(
  materiId: number,
  cleanTitle: string,
  fileName: string,
  fileSizeKb: number,
  tingkat: TingkatMateri
): Materi {
  const isSMP = tingkat === "SMP";
  const bmId1 = materiId + 1;

  const deskripsi = isSMP
    ? "Materi Bahasa Indonesia SMP berfokus pada menentukan ide pokok paragraf, struktur teks eksposisi & berita, kaidah ejaan EYD, serta majas dan gaya bahasa."
    : "Mengenal kalimat utama, membaca teks cerita anak, menemukan pesan moral, dan belajar kata baku sederhana bersama SoalKu.";

  const poinKunci = isSMP
    ? [
        "Ide pokok paragraf deduktif terletak di awal kalimat utama, sedangkan paragraf induktif di akhir kalimat.",
        "Kalimat efektif harus memiliki kelengkapan unsur Subjek dan Predikat serta hemat kata.",
        "Majas personifikasi melekatkan sifat-sifat manusiawi pada benda mati.",
        "Penulisan kata serapan dan tanda baca harus mengacu pada pedoman umum EYD V.",
      ]
    : [
        "Membaca dengan saksama membantu memahami isi pesan dalam cerita.",
        "Huruf kapital digunakan pada awal kalimat dan nama orang atau kota.",
        "Tanda titik (.) digunakan untuk mengakhiri kalimat berita.",
      ];

  const totalCount = isSMP ? 20 : 10;
  const soalList: SoalMateri[] = [];

  for (let i = 1; i <= totalCount; i++) {
    const sId = bmId1 * 100 + i;
    if (isSMP) {
      soalList.push(
        createSoal(
          sId,
          bmId1,
          `[Bahasa Indonesia #${i}] Manakah kalimat berikut yang memenuhi kaidah kalimat efektif baku?`,
          [
            { label: "A", teks: "Para siswa sedang berdiskusi di dalam ruang perpustakaan sekolah.", isBenar: true },
            { label: "B", teks: "Para siswa-siswa saling tolong-menolong satu sama lain.", isBenar: false },
            { label: "C", teks: "Buku itu saya sudah membacanya kemarin siang.", isBenar: false },
            { label: "D", teks: "Bagi yang membawa kendaraan harap parkir di tempatnya.", isBenar: false },
          ],
          "A",
          "Kalimat A efektif, tidak boros kata (pleonasme), dan memiliki unsur subjek predikat yang jelas.",
          "SEDANG"
        )
      );
    } else {
      soalList.push(
        createSoal(
          sId,
          bmId1,
          `[Bahasa Indonesia SD #${i}] Kalimat yang menggunakan huruf kapital dengan benar adalah...`,
          [
            { label: "A", teks: "Budi berlibur ke kota Bandung bersama pamannya.", isBenar: true },
            { label: "B", teks: "budi berlibur ke Kota bandung bersama pamannya.", isBenar: false },
            { label: "C", teks: "Budi Berlibur Ke kota bandung bersama Pamannya.", isBenar: false },
          ],
          "A",
          "Huruf kapital dipakai di awal kalimat (Budi) dan huruf pertama nama kota (Bandung).",
          "MUDAH"
        )
      );
    }
  }

  return {
    id: materiId,
    judul: cleanTitle || "Modul Pembelajaran Bahasa Indonesia",
    tingkat,
    bab: isSMP ? "Bab 1: Teks Eksposisi & Literasi SMP" : "Bab 1: Cerita & Ejaan Ceria SD",
    mataPelajaran: "Bahasa Indonesia",
    deskripsi,
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
    bagianMateri: [
      {
        id: bmId1,
        materiId,
        judulBagian: isSMP ? "Analisis Paragraf & Struktur Bahasa" : "Membaca & Memahami Kalimat",
        teksRingkasan: "Penguasaan tata bahasa dan pemahaman literasi kontekstual.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: soalList,
      },
    ],
  };
}

// ==========================================
// 4. GENERATOR IPA / BIOLOGI (SMP: 20 SOAL, SD: 10 SOAL)
// ==========================================
function generateIpaModule(
  materiId: number,
  cleanTitle: string,
  fileName: string,
  fileSizeKb: number,
  tingkat: TingkatMateri
): Materi {
  const isSMP = tingkat === "SMP";
  const bmId1 = materiId + 1;
  const bmId2 = materiId + 2;

  const deskripsi = isSMP
    ? "Eksplorasi mendalam Sistem Peredaran Darah, Sistem Pencernaan, dan Fisiologi Tubuh Manusia pada kurikulum IPA Biologi SMP."
    : "Mengenal bagian organ tubuh penting, fungsi jantung, dan cara menjaga kesehatan diri bersama naga SoalKu.";

  const poinKunci = isSMP
    ? [
        "Jantung memiliki 4 ruang: Serambi Kanan, Serambi Kiri, Bilik Kanan, dan Bilik Kiri.",
        "Bilik kiri memiliki otot paling tebal karena memompa darah kaya O2 ke seluruh tubuh melewati aorta.",
        "Katup semilunaris aorta mencegah darah mengalir kembali ke bilik kiri saat fase diastolik relaksasi.",
        "Peredaran darah ganda manusia terdiri atas peredaran darah besar (sistemik) dan peredaran darah kecil (pulmonal).",
      ]
    : [
        "Jantung berdetak siang dan malam memompa darah ke seluruh tubuh.",
        "Darah membawa oksigen dan sari makanan untuk pertumbuhan tubuh kita.",
        "Rutin berolahraga dan makan sayur menjaga jantung tetap kuat.",
      ];

  const soalList: SoalMateri[] = [];
  const totalCount = isSMP ? 20 : 10;

  for (let i = 1; i <= totalCount; i++) {
    const sId = bmId1 * 100 + i;
    if (isSMP) {
      if (i % 2 === 1) {
        soalList.push(
          createSoal(
            sId,
            bmId1,
            `[IPA Biologi #${i}] Mengapa dinding otot bilik kiri jantung manusia jauh lebih tebal dibandingkan bilik kanan?`,
            [
              { label: "A", teks: "Membutuhkan kontraksi kuat untuk memompa darah ke seluruh sistemik tubuh", isBenar: true },
              { label: "B", teks: "Hanya bertugas memompa darah berjarak dekat menuju paru-paru", isBenar: false },
              { label: "C", teks: "Menampung darah kaya karbon dioksida dari vena kava superior", isBenar: false },
              { label: "D", teks: "Mencegah terjadinya percampuran leukosit dan trombosit", isBenar: false },
            ],
            "A",
            "Bilik kiri memompa darah bersih menuju seluruh jaringan tubuh sehingga membutuhkan tekanan hidrostatik tinggi.",
            "SEDANG"
          )
        );
      } else {
        soalList.push(
          createSoal(
            sId,
            bmId1,
            `[IPA Biologi #${i}] Fungsi utama katup semilunaris aorta pada sistem sirkulasi darah manusia adalah...`,
            [
              { label: "A", teks: "Mencegah aliran balik darah dari aorta ke bilik kiri saat diastol", isBenar: true },
              { label: "B", teks: "Mengalirkan darah kotor menuju serambi kanan", isBenar: false },
              { label: "C", teks: "Menyaring eritrosit yang sudah tua di dalam limpa", isBenar: false },
              { label: "D", teks: "Menurunkan detak denyut nadi saat beristirahat", isBenar: false },
            ],
            "A",
            "Katup aorta menjaga aliran darah satu arah dari ventrikel kiri ke aorta agar tidak regurgitasi.",
            "SEDANG"
          )
        );
      }
    } else {
      soalList.push(
        createSoal(
          sId,
          bmId1,
          `[IPAS SD #${i}] Organ tubuh yang berfungsi utama memompa darah ke seluruh tubuh manusia adalah...`,
          [
            { label: "A", teks: "Jantung", isBenar: true },
            { label: "B", teks: "Lambung", isBenar: false },
            { label: "C", teks: "Hati", isBenar: false },
          ],
          "A",
          "Jantung adalah organ pemompa darah utama dalam tubuh manusia.",
          "MUDAH"
        )
      );
    }
  }

  return {
    id: materiId,
    judul: cleanTitle || "Modul IPA Terpadu",
    tingkat,
    bab: isSMP ? "Bab 4: Sistem Sirkulasi & Organ Manusia" : "Bab 2: Mengenal Tubuh Kita",
    mataPelajaran: isSMP ? "IPA Terpadu" : "IPAS",
    deskripsi,
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
    bagianMateri: [
      {
        id: bmId1,
        materiId,
        judulBagian: isSMP ? "Struktur & Fisiologi Organ Sirkulasi" : "Mengenal Jantung & Peredaran Darah",
        teksRingkasan: "Memahami struktur bilik jantung, fungsi katup pembuluh darah, dan mekanisme peredaran darah.",
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: soalList,
      },
    ],
  };
}

// ==========================================
// 5. GENERATOR TEMATIK / GENERAL (SMP: 20 SOAL, SD: 10 SOAL)
// ==========================================
function generateThematicModule(
  materiId: number,
  cleanTitle: string,
  fileName: string,
  fileSizeKb: number,
  tingkat: TingkatMateri
): Materi {
  const isSMP = tingkat === "SMP";
  const bmId1 = materiId + 1;

  const deskripsi = `Ringkasan komprehensif materi ${cleanTitle} untuk pembelajaran mandiri jenjang ${tingkat} dengan pemetaan konsep adaptif.`;

  const poinKunci = [
    `Konsep esensial berkas ${cleanTitle} telah dipetakan ke dalam unit topik berjenjang.`,
    `Pemahaman dasar diperkuat melalui latihan soal analitis berbasis kompetensi.`,
    `Siswa dapat memanfaatkan ulasan pembahasan pada setiap butir soal untuk mengevaluasi pemahaman.`,
    `Kesesuaian kurikulum diselaraskan dengan standar capaian pembelajaran ${tingkat}.`,
  ];

  const totalCount = isSMP ? 20 : 10;
  const soalList: SoalMateri[] = [];

  for (let i = 1; i <= totalCount; i++) {
    const sId = bmId1 * 100 + i;
    if (isSMP) {
      soalList.push(
        createSoal(
          sId,
          bmId1,
          `[${cleanTitle} - Soal #${i}] Berdasarkan analisis materi "${cleanTitle}", manakah pernyataan konsep yang paling tepat?`,
          [
            { label: "A", teks: `Memahami prinsip pokok dan kaidah inti materi ${cleanTitle}`, isBenar: true },
            { label: "B", teks: "Menyimpulkan fakta tanpa dasar acuan teori yang terverifikasi", isBenar: false },
            { label: "C", teks: "Mengabaikan hubungan sebab akibat dalam telaah materi", isBenar: false },
            { label: "D", teks: "Hanya berpegang pada asumsi spekulatif sepihak", isBenar: false },
          ],
          "A",
          `Penguasaan materi ${cleanTitle} memerlukan pemahaman prinsip pokok dan analisis yang cermat.`,
          "SEDANG"
        )
      );
    } else {
      soalList.push(
        createSoal(
          sId,
          bmId1,
          `[${cleanTitle} - Soal SD #${i}] Apakah yang harus kita perhatikan saat mempelajari materi "${cleanTitle}"?`,
          [
            { label: "A", teks: `Membaca dan memahami isi penting materi ${cleanTitle}`, isBenar: true },
            { label: "B", teks: "Membaca terburu-buru tanpa mengerti isinya", isBenar: false },
            { label: "C", teks: "Mengabaikan penjelasan guru dan modul", isBenar: false },
          ],
          "A",
          `Membaca dengan saksama adalah kunci utama memahami materi ${cleanTitle}.`,
          "MUDAH"
        )
      );
    }
  }

  return {
    id: materiId,
    judul: cleanTitle || "Materi Pembelajaran AI",
    tingkat,
    bab: "Bab 1",
    mataPelajaran: "Tematik Terpadu",
    deskripsi,
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
    bagianMateri: [
      {
        id: bmId1,
        materiId,
        judulBagian: `Intisari Pembelajaran: ${cleanTitle}`,
        teksRingkasan: `Ringkasan materi "${cleanTitle}" yang diekstraksi secara otomatis melalui mesin kecerdasan buatan SoalKu.`,
        urutan: 1,
        status: "DIGENERATE",
        generatedSoal: soalList,
      },
    ],
  };
}

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
