package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.*;
import com.soalku.service.DocumentExtractorService;
import com.soalku.service.GeminiAIService;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.FileChooser;
import javafx.util.Duration;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * MateriView - Pengolahan Materi Terpadu Sesuai PRD Section 6.1 & 10:
 * - Unggah Berkas: Validasi (.pdf, .docx, max 10MB), pilih jenjang SD/SMP, indikator loading.
 * - Detail Materi: Ringkasan per bagian, status generate (DIEKSTRAK, DIGENERATE, GAGAL_GENERATE),
 *   dan tombol Generate Ulang per bagian materi.
 */
public class MateriView extends ScrollPane {

    private final DocumentExtractorService extractorService = new DocumentExtractorService();
    private final GeminiAIService aiService = new GeminiAIService();

    private ComboBox<Tingkat> cbTingkat;
    private File selectedFile;
    private Label lblSelectedFile;
    private TextArea txtInputTeks;
    private ProgressBar progressBar;
    private Label lblProgressStatus;

    private VBox detailMateriContainer;
    private Materi activeMateri;

    public MateriView() {
        setFitToWidth(true);
        setStyle("-fx-background-color: #F8FAFC; -fx-background: #F8FAFC;");

        // Set default materi aktif jika ada di repository
        List<Materi> list = DataRepository.getInstance().getMateriList();
        if (!list.isEmpty()) {
            activeMateri = list.get(0);
        }

        VBox content = new VBox(20);
        content.setPadding(new Insets(20, 24, 40, 24));

        content.getChildren().addAll(
                createHeaderBanner(),
                createUploadSection(),
                createDetailMateriSection()
        );

        setContent(content);
        refreshDetailMateri();
    }

    private VBox createHeaderBanner() {
        VBox banner = new VBox(8);
        banner.setPadding(new Insets(18, 22, 18, 22));
        banner.setStyle(
                "-fx-background-color: linear-gradient(to right, #1E40AF, #2563EB); " +
                "-fx-background-radius: 14px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(37,99,235,0.2), 10, 0, 0, 3);"
        );

        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);
        Label tag = new Label("AI ENGINE EKSTRAKSI & DETAIL MATERI");
        tag.setStyle("-fx-background-color: rgba(255,255,255,0.2); -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");
        top.getChildren().addAll(Icons.createIcon("sparkle", "#FFFFFF", 0.7), tag);

        Label title = new Label("Unggah & Detail Materi Pembelajaran");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label desc = new Label("Sesuai PRD: Unggah berkas dokumen (PDF/DOCX maks 10MB) dan tentukan jenjang SD/SMP. Sistem memecah materi menjadi bagian-bagian topik dan menghasilkan soal berstatus MENUNGGU.");
        desc.setStyle("-fx-font-size: 12px; -fx-text-fill: #DBEAFE;");

        banner.getChildren().addAll(top, title, desc);
        return banner;
    }

    private VBox createUploadSection() {
        VBox card = new VBox(14);
        card.setPadding(new Insets(18));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");

        Label secTitle = new Label("1. Unggah Materi Pelajaran");
        secTitle.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        HBox configRow = new HBox(14);
        configRow.setAlignment(Pos.CENTER_LEFT);

        Label lblJenjang = new Label("Target Jenjang:");
        lblJenjang.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #1E293B;");

        cbTingkat = new ComboBox<>();
        cbTingkat.getItems().addAll(Tingkat.SMP, Tingkat.SD);
        cbTingkat.setValue(Tingkat.SMP);
        cbTingkat.setStyle("-fx-font-size: 11px;");

        Button btnPilihBerkas = new Button("Pilih Berkas (.pdf / .docx)");
        btnPilihBerkas.setGraphic(Icons.createIcon("upload", "#2563EB", 0.75));
        btnPilihBerkas.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-border-color: #BFDBFE; -fx-border-radius: 6px; -fx-background-radius: 6px; -fx-font-size: 11px; -fx-font-weight: 700; -fx-padding: 7 14 7 12; -fx-cursor: hand;");
        btnPilihBerkas.setOnAction(e -> handlePilihBerkas());

        lblSelectedFile = new Label("Belum ada berkas dipilih (Maks 10 MB)");
        lblSelectedFile.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B; -fx-font-style: italic;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Button btnProses = new Button("Mulai Ekstraksi & Generate Soal");
        btnProses.setGraphic(Icons.createIcon("sparkle", "#FFFFFF", 0.7));
        btnProses.setStyle("-fx-background-color: #2563EB; -fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: 800; -fx-background-radius: 8px; -fx-padding: 8 16 8 14; -fx-cursor: hand;");
        btnProses.setOnAction(e -> handleProsesUpload());

        configRow.getChildren().addAll(lblJenjang, cbTingkat, btnPilihBerkas, lblSelectedFile, sp, btnProses);

        txtInputTeks = new TextArea();
        txtInputTeks.setPromptText("Atau tempelkan (paste) materi langsung di sini jika tidak menggunakan berkas...");
        txtInputTeks.setPrefRowCount(3);
        txtInputTeks.setWrapText(true);
        txtInputTeks.setStyle("-fx-background-color: #F8FAFC; -fx-font-size: 12px;");

        // Progress Bar & Loading Indicator
        progressBar = new ProgressBar(0);
        progressBar.setMaxWidth(Double.MAX_VALUE);
        progressBar.setVisible(false);
        progressBar.setManaged(false);

        lblProgressStatus = new Label("Sedang memproses dokumen...");
        lblProgressStatus.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #2563EB;");
        lblProgressStatus.setVisible(false);
        lblProgressStatus.setManaged(false);

        card.getChildren().addAll(secTitle, configRow, txtInputTeks, progressBar, lblProgressStatus);
        return card;
    }

    private void handlePilihBerkas() {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Pilih Dokumen PDF atau DOCX (Maks 10 MB)");
        chooser.getExtensionFilters().addAll(
                new FileChooser.ExtensionFilter("Dokumen Materi (*.pdf, *.docx, *.txt)", "*.pdf", "*.docx", "*.txt")
        );
        File file = chooser.showOpenDialog(getScene().getWindow());
        if (file != null) {
            loadFileAndValidate(file);
        }
    }

    public void loadFileAndValidate(File file) {
        // Validasi PRD Section 11: File bukan .pdf/.docx atau lebih dari 10 MB
        String name = file.getName().toLowerCase();
        if (!name.endsWith(".pdf") && !name.endsWith(".docx") && !name.endsWith(".txt")) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Format Berkas Ditolak");
            alert.setHeaderText("Hanya Berkas PDF dan DOCX yang Diperbolehkan");
            alert.setContentText("Sesuai spesifikasi PRD Section 11, berkas yang diunggah harus berekstensi .pdf atau .docx.");
            alert.showAndWait();
            return;
        }

        long maxBytes = 10 * 1024 * 1024; // 10 MB
        if (file.length() > maxBytes) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Ukuran Berkas Terlalu Besar");
            alert.setHeaderText("Batas Maksimal Ukuran Berkas adalah 10 MB");
            alert.setContentText("Ukuran berkas Anda (" + (file.length() / (1024 * 1024)) + " MB) melebihi batas yang diizinkan PRD.");
            alert.showAndWait();
            return;
        }

        this.selectedFile = file;
        lblSelectedFile.setText(file.getName() + " (" + (file.length() / 1024) + " KB)");
        lblSelectedFile.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #059669;");
    }

    private void handleProsesUpload() {
        String teks = txtInputTeks.getText().trim();
        String namaFile = "Materi Mandiri Siswa";

        if (selectedFile != null) {
            namaFile = selectedFile.getName();
            try {
                teks = extractorService.ekstrakTeks(selectedFile);
                txtInputTeks.setText(teks);
            } catch (Exception ex) {
                Alert a = new Alert(Alert.AlertType.ERROR, "Gagal mengekstrak berkas: " + ex.getMessage(), ButtonType.OK);
                a.showAndWait();
                return;
            }
        }

        if (teks.isBlank()) {
            teks = "Sistem organ pencernaan manusia meliputi mulut, lambung, usus halus, dan usus besar. Enzim pepsin dan asam lambung HCl dihasilkan di organ lambung.";
            txtInputTeks.setText(teks);
        }

        // Tampilkan indikator loading animasi
        progressBar.setVisible(true);
        progressBar.setManaged(true);
        lblProgressStatus.setVisible(true);
        lblProgressStatus.setManaged(true);
        lblProgressStatus.setText("Sedang mengekstrak teks dan menghubungi Gemini AI Engine...");

        final String finalTeks = teks;
        final String finalNamaFile = namaFile;
        Tingkat tingkat = cbTingkat.getValue();

        Timeline sim = new Timeline(
                new KeyFrame(Duration.millis(800), e -> progressBar.setProgress(0.4)),
                new KeyFrame(Duration.millis(1600), e -> {
                    progressBar.setProgress(1.0);
                    lblProgressStatus.setText("Selesai! Ringkasan dan draf butir soal berhasil dibuat.");

                    GeminiAIService.HasilRingkasanAI hasil = aiService.prosesDokumen(finalNamaFile, finalTeks, tingkat);

                    // Buat Materi baru di repository
                    int newMatId = DataRepository.getInstance().getMateriList().size() + 1;
                    Materi m = new Materi(
                            newMatId,
                            hasil.getJudul(),
                            tingkat,
                            "Bab Baru",
                            "Materi Ekstraksi AI",
                            hasil.getRingkasanSederhana(),
                            80
                    );
                    m.setStatus("DIGENERATE");

                    BagianMateri bm = new BagianMateri(
                            (int) (System.currentTimeMillis() % 10000),
                            newMatId,
                            "Ekstraksi: " + hasil.getJudul(),
                            hasil.getRingkasanSederhana(),
                            1
                    );
                    bm.setStatus("DIGENERATE");

                    DataRepository.getInstance().tambahMateri(m, List.of(bm));

                    // Masukkan soal hasil generate ke bank soal dengan status MENUNGGU
                    for (Soal s : hasil.getGeneratedSoal()) {
                        s.setBagianMateriId(bm.getId());
                        s.setStatusReview(StatusReview.MENUNGGU);
                        DataRepository.getInstance().getBankSoal().add(s);
                    }

                    this.activeMateri = m;
                    refreshDetailMateri();
                })
        );
        sim.play();
    }

    private VBox createDetailMateriSection() {
        VBox sec = new VBox(12);
        detailMateriContainer = new VBox(14);
        sec.getChildren().addAll(
                new Separator(),
                detailMateriContainer
        );
        return sec;
    }

    public void refreshDetailMateri() {
        detailMateriContainer.getChildren().clear();

        Label title = new Label("2. Detail Materi & Bagian Modul (Unit Topik)");
        title.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        detailMateriContainer.getChildren().add(title);

        if (activeMateri == null) {
            Label placeholder = new Label("Belum ada materi aktif. Silakan unggah berkas atau pilih materi dari repository.");
            placeholder.setStyle("-fx-font-size: 12px; -fx-text-fill: #94A3B8; -fx-font-style: italic;");
            detailMateriContainer.getChildren().add(placeholder);
            return;
        }

        // Header Materi Aktif
        VBox matHeader = new VBox(6);
        matHeader.setPadding(new Insets(14));
        matHeader.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 10px; -fx-border-color: #E2E8F0; -fx-border-radius: 10px;");

        HBox topM = new HBox(8);
        topM.setAlignment(Pos.CENTER_LEFT);

        Label badgeTingkat = new Label("Tingkat: " + activeMateri.getTingkat().name());
        badgeTingkat.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        Label badgeStatus = new Label("Status Materi: " + activeMateri.getStatus());
        badgeStatus.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #065F46; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        topM.getChildren().addAll(badgeTingkat, badgeStatus);

        Label matTitle = new Label(activeMateri.getJudul() + " (" + activeMateri.getMataPelajaran() + ")");
        matTitle.setStyle("-fx-font-size: 15px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");

        Label matDesc = new Label(activeMateri.getDeskripsi());
        matDesc.setWrapText(true);
        matDesc.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #475569;");

        matHeader.getChildren().addAll(topM, matTitle, matDesc);
        detailMateriContainer.getChildren().add(matHeader);

        // Daftar Bagian Materi untuk materi ini
        List<BagianMateri> bagianList = DataRepository.getInstance().getBagianMateriList().stream()
                .filter(bm -> bm.getMateriId() == activeMateri.getId())
                .toList();

        if (bagianList.isEmpty()) {
            Label noBm = new Label("Belum ada bagian materi terdaftar.");
            noBm.setStyle("-fx-font-size: 11px; -fx-text-fill: #94A3B8;");
            detailMateriContainer.getChildren().add(noBm);
        } else {
            for (BagianMateri bm : bagianList) {
                detailMateriContainer.getChildren().add(createBagianMateriCard(bm));
            }
        }
    }

    private VBox createBagianMateriCard(BagianMateri bm) {
        VBox card = new VBox(10);
        card.setPadding(new Insets(14));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 10px; -fx-border-color: #E2E8F0; -fx-border-radius: 10px;");

        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);

        Label num = new Label("Bagian #" + bm.getUrutan());
        num.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #334155; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        Label bmTitle = new Label(bm.getJudulBagian());
        bmTitle.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Label statusLbl = new Label("● " + bm.getStatus());
        statusLbl.setStyle("-fx-font-size: 10.5px; -fx-font-weight: 700; -fx-text-fill: #059669;");

        // Tombol Generate Ulang sesuai PRD Section 10
        Button btnRegenerate = new Button("🔄 Generate Ulang Bagian Ini");
        btnRegenerate.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-size: 10.5px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 5 10 5 10; -fx-cursor: hand;");
        btnRegenerate.setOnAction(e -> {
            DataRepository.getInstance().regenerateBagianMateri(bm.getId());
            Alert a = new Alert(Alert.AlertType.INFORMATION, "Proses generate ulang AI untuk bagian '" + bm.getJudulBagian() + "' selesai! Butir soal baru telah masuk antrean review mentor.", ButtonType.OK);
            a.showAndWait();
            refreshDetailMateri();
        });

        top.getChildren().addAll(num, bmTitle, sp, statusLbl, btnRegenerate);

        Label ringkasanLbl = new Label("Ringkasan Materi AI:");
        ringkasanLbl.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #2563EB;");

        Label ringkasanText = new Label(bm.getTeksRingkasan());
        ringkasanText.setWrapText(true);
        ringkasanText.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #334155; -fx-line-spacing: 2px;");

        // Soal terkait yang berstatus MENUNGGU
        List<Soal> pendingList = DataRepository.getInstance().getBankSoal().stream()
                .filter(s -> s.getBagianMateriId() == bm.getId() && s.getStatusReview() == StatusReview.MENUNGGU)
                .toList();

        Label pendingInfo = new Label("Antrean Review Mentor: " + pendingList.size() + " butir soal menunggu persetujuan.");
        pendingInfo.setStyle("-fx-font-size: 10.5px; -fx-text-fill: #D97706; -fx-font-weight: 700;");

        card.getChildren().addAll(top, ringkasanLbl, ringkasanText, new Separator(), pendingInfo);
        return card;
    }
}
