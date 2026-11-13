package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.Materi;
import com.soalku.model.ModeLatihan;
import com.soalku.model.Pengguna;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.stage.FileChooser;

import java.io.File;
import java.util.function.Consumer;

public class DashboardView extends ScrollPane {

    private final Consumer<ModeLatihan> onLaunchQuizWithMode;
    private final Consumer<String> onNavigate;
    private final Consumer<File> onFileUploaded;

    private GridPane mainGrid;
    private VBox leftCol;
    private VBox rightCol;
    private boolean isMobile = false;

    public DashboardView(
            Consumer<ModeLatihan> onLaunchQuizWithMode,
            Consumer<String> onNavigate,
            Consumer<File> onFileUploaded
    ) {
        this.onLaunchQuizWithMode = onLaunchQuizWithMode;
        this.onNavigate = onNavigate;
        this.onFileUploaded = onFileUploaded;

        setFitToWidth(true);
        setStyle("-fx-background-color: #F8FAFC; -fx-background: #F8FAFC;");

        VBox content = new VBox(20);
        content.setPadding(new Insets(16, 20, 40, 20));
        content.getChildren().addAll(
                createHeroBanner(),
                createMainContentGrid()
        );

        content.widthProperty().addListener((obs, oldW, newW) -> {
            if (newW != null) {
                setResponsiveMode(newW.doubleValue() < 860);
            }
        });

        setContent(content);
    }

    private VBox createHeroBanner() {
        VBox banner = new VBox(14);
        banner.setPadding(new Insets(20, 24, 20, 24));
        banner.setStyle(
                "-fx-background-color: linear-gradient(to right, #1E3A8A, #2563EB, #3B82F6); " +
                "-fx-background-radius: 16px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(37,99,235,0.25), 16, 0, 0, 4);"
        );

        // Header tag
        HBox tagBox = new HBox(8);
        tagBox.setAlignment(Pos.CENTER_LEFT);
        Label semTag = new Label("SEMESTER GANJIL 2024/2025");
        semTag.setStyle("-fx-background-color: rgba(255,255,255,0.18); -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        Label verifiedTag = new Label("● Akun Siswa Terverifikasi");
        verifiedTag.setStyle("-fx-text-fill: #93C5FD; -fx-font-size: 11px; -fx-font-weight: 600;");
        tagBox.getChildren().addAll(semTag, verifiedTag);

        // Middle Row: Title + 3 Stat Badges
        HBox midRow = new HBox(20);
        midRow.setAlignment(Pos.CENTER_LEFT);

        VBox titleBox = new VBox(4);
        Label greeting = new Label("Halo, Arya Pratama");
        greeting.setStyle("-fx-font-size: 24px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label desc = new Label("Siswa SMP Kelas 8 • Konsistensi belajarmu meningkat drastis! AI Tutor mendeteksi 2 topik kunci siap dipoles hari ini.");
        desc.setStyle("-fx-font-size: 12px; -fx-text-fill: #DBEAFE;");
        titleBox.getChildren().addAll(greeting, desc);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Stat 1: Streak 5 Hari
        VBox statStreak = new VBox(2);
        statStreak.setAlignment(Pos.CENTER);
        statStreak.setPadding(new Insets(8, 14, 8, 14));
        statStreak.setStyle("-fx-background-color: #F59E0B; -fx-background-radius: 12px;");
        Label lblStreakVal = new Label("5");
        lblStreakVal.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF;");
        Label lblStreakUnit = new Label("Hari");
        lblStreakUnit.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #FFFFFF;");
        statStreak.getChildren().addAll(lblStreakVal, lblStreakUnit);

        // Stat 2: XP Pekan Ini
        VBox statXP = new VBox(2);
        statXP.setAlignment(Pos.CENTER);
        statXP.setPadding(new Insets(8, 14, 8, 14));
        statXP.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-background-radius: 12px; -fx-border-color: rgba(255,255,255,0.25); -fx-border-radius: 12px;");
        Label lblXPVal = new Label("1.450");
        lblXPVal.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF;");
        Label lblXPUnit = new Label("XP");
        lblXPUnit.setStyle("-fx-font-size: 11px; -fx-font-weight: 600; -fx-text-fill: #BFDBFE;");
        statXP.getChildren().addAll(lblXPVal, lblXPUnit);

        // Stat 3: Target Harian
        VBox statTarget = new VBox(2);
        statTarget.setAlignment(Pos.CENTER);
        statTarget.setPadding(new Insets(8, 14, 8, 14));
        statTarget.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-background-radius: 12px; -fx-border-color: rgba(255,255,255,0.25); -fx-border-radius: 12px;");
        Label lblTargetVal = new Label("3/4");
        lblTargetVal.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF;");
        Label lblTargetUnit = new Label("Bab");
        lblTargetUnit.setStyle("-fx-font-size: 11px; -fx-font-weight: 600; -fx-text-fill: #BFDBFE;");
        statTarget.getChildren().addAll(lblTargetVal, lblTargetUnit);

        midRow.getChildren().addAll(titleBox, spacer, statStreak, statXP, statTarget);

        // Bottom Progress Bar inside Hero
        HBox progressRow = new HBox(12);
        progressRow.setAlignment(Pos.CENTER_LEFT);

        Label targetText = new Label("Target harian tinggal 1 latihan lagi untuk mempertahankan streak 5 hari berturut-turut!");
        targetText.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: 600;");

        Region pSpacer = new Region();
        HBox.setHgrow(pSpacer, Priority.ALWAYS);

        ProgressBar bar = new ProgressBar(0.75);
        bar.setPrefWidth(220);
        bar.setStyle("-fx-accent: #34D399; -fx-control-inner-background: rgba(255,255,255,0.25);");

        Label pct = new Label("75%");
        pct.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: 800;");

        progressRow.getChildren().addAll(Icons.createIcon("check", "#34D399", 0.7), targetText, pSpacer, bar, pct);

        banner.getChildren().addAll(tagBox, midRow, progressRow);
        return banner;
    }

    private GridPane createMainContentGrid() {
        mainGrid = new GridPane();
        mainGrid.setHgap(20);
        mainGrid.setVgap(20);

        // LEFT COLUMN
        leftCol = new VBox(20);
        leftCol.getChildren().addAll(
                createTargetPerbaikanCard(),
                createModeLatihanSection(),
                createModulDipelajariSection()
        );

        // RIGHT COLUMN
        rightCol = new VBox(20);
        rightCol.getChildren().addAll(
                createRingkasanPerformaCard(),
                createModulInstanAICard(),
                createAgendaUlanganCard(),
                createAktivitasMentorCard()
        );

        applyGridColumns(isMobile);
        return mainGrid;
    }

    public void setResponsiveMode(boolean mobile) {
        if (this.isMobile == mobile && mainGrid != null && !mainGrid.getChildren().isEmpty()) return;
        this.isMobile = mobile;
        applyGridColumns(mobile);
    }

    private void applyGridColumns(boolean mobile) {
        if (mainGrid == null || leftCol == null || rightCol == null) return;
        mainGrid.getChildren().clear();
        mainGrid.getColumnConstraints().clear();

        if (mobile) {
            ColumnConstraints col = new ColumnConstraints();
            col.setPercentWidth(100);
            mainGrid.getColumnConstraints().add(col);
            mainGrid.add(leftCol, 0, 0);
            mainGrid.add(rightCol, 0, 1);
        } else {
            ColumnConstraints col1 = new ColumnConstraints();
            col1.setPercentWidth(64);
            ColumnConstraints col2 = new ColumnConstraints();
            col2.setPercentWidth(36);
            mainGrid.getColumnConstraints().addAll(col1, col2);
            mainGrid.add(leftCol, 0, 0);
            mainGrid.add(rightCol, 1, 0);
        }
    }

    // 1. Target Perbaikan Pekan Ini (Rekomendasi AI)
    private VBox createTargetPerbaikanCard() {
        VBox card = new VBox(14);
        card.setPadding(new Insets(18));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px; -fx-effect: dropshadow(three-pass-box, rgba(0,0,0,0.03), 8, 0, 0, 2);");

        HBox cardHeader = new HBox(8);
        cardHeader.setAlignment(Pos.CENTER_LEFT);

        Label title = new Label("Target Perbaikan Pekan Ini");
        title.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label badge = new Label("Rekomendasi AI");
        badge.setStyle("-fx-background-color: #DC2626; -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 2 8 2 8; -fx-background-radius: 10px;");

        cardHeader.getChildren().addAll(Icons.createIcon("sparkle", "#DC2626", 0.8), title, badge);

        Label subHeader = new Label("Algoritma mendeteksi penurunan retensi pemahaman materi pada evaluasi mandiri terakhir. ID Topik: #IPA-BIO-804");
        subHeader.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

        // Main content row inside target card
        HBox contentRow = new HBox(16);
        contentRow.setAlignment(Pos.CENTER_LEFT);
        contentRow.setPadding(new Insets(12));
        contentRow.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 10px; -fx-border-color: #E2E8F0; -fx-border-radius: 10px;");

        // Circular Accuracy Gauge (42%)
        StackPane gauge = new StackPane();
        Canvas canvas = new Canvas(70, 70);
        GraphicsContext gc = canvas.getGraphicsContext2D();
        gc.setLineWidth(6);
        gc.setStroke(Color.web("#E2E8F0"));
        gc.strokeOval(6, 6, 58, 58);
        gc.setStroke(Color.web("#EF4444"));
        gc.strokeArc(6, 6, 58, 58, 90, -150, javafx.scene.shape.ArcType.OPEN);

        VBox gaugeText = new VBox(-2);
        gaugeText.setAlignment(Pos.CENTER);
        Label lbl42 = new Label("42%");
        lbl42.setStyle("-fx-font-size: 14px; -fx-font-weight: 900; -fx-text-fill: #DC2626;");
        Label lblAk = new Label("AKURASI");
        lblAk.setStyle("-fx-font-size: 8px; -fx-font-weight: 800; -fx-text-fill: #94A3B8;");
        gaugeText.getChildren().addAll(lbl42, lblAk);
        gauge.getChildren().addAll(canvas, gaugeText);

        // Subject & Warning detail
        VBox detailBox = new VBox(4);
        HBox subPill = new HBox(8);
        Label pillIpa = new Label("IPA Terpadu (Biologi)");
        pillIpa.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #2563EB; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        Label pillWarning = new Label("Tingkat Penguasaan: Kurang");
        pillWarning.setStyle("-fx-text-fill: #DC2626; -fx-font-size: 11px; -fx-font-weight: 700;");
        subPill.getChildren().addAll(pillIpa, pillWarning);

        Label subTitle = new Label("Sistem Peredaran Darah Manusia");
        subTitle.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label warningText = new Label("Spesifik: 7 dari 12 soal salah pada materi Fungsi Bilik Jantung & Katup Aorta.");
        warningText.setStyle("-fx-font-size: 11px; -fx-text-fill: #475569;");
        detailBox.getChildren().addAll(subPill, subTitle, warningText);

        Region cSpacer = new Region();
        HBox.setHgrow(cSpacer, Priority.ALWAYS);

        // Action Buttons
        VBox btnBox = new VBox(6);
        btnBox.setAlignment(Pos.CENTER_RIGHT);

        Button btnPelajari = new Button("Pelajari Ringkasan");
        btnPelajari.setGraphic(Icons.createIcon("book", "#475569", 0.7));
        btnPelajari.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1E3A8A; -fx-font-size: 11px; -fx-font-weight: 700; -fx-background-radius: 8px; -fx-padding: 7 12 7 12; -fx-cursor: hand;");
        btnPelajari.setOnAction(e -> {
            if (onNavigate != null) onNavigate.accept("materi");
        });

        Button btnLatihKelemahan = new Button("Latih Kelemahan Sekarang");
        btnLatihKelemahan.setGraphic(Icons.createIcon("play", "#FFFFFF", 0.65));
        btnLatihKelemahan.setStyle("-fx-background-color: #2563EB; -fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: 700; -fx-background-radius: 8px; -fx-padding: 7 14 7 12; -fx-cursor: hand;");
        btnLatihKelemahan.setOnAction(e -> {
            if (onLaunchQuizWithMode != null) onLaunchQuizWithMode.accept(ModeLatihan.FOKUS_KELEMAHAN);
        });

        btnBox.getChildren().addAll(btnPelajari, btnLatihKelemahan);
        contentRow.getChildren().addAll(gauge, detailBox, cSpacer, btnBox);

        card.getChildren().addAll(cardHeader, subHeader, contentRow);
        return card;
    }

    // 2. Pilihan Mode Latihan Kilat (Design Pattern Strategy)
    private VBox createModeLatihanSection() {
        VBox section = new VBox(12);

        HBox header = new HBox(8);
        header.setAlignment(Pos.CENTER_LEFT);

        Label title = new Label("Pilihan Mode Latihan Kilat");
        title.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Label link = new Label("Katalog Latihan Lengkap ›");
        link.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #2563EB; -fx-cursor: hand;");
        link.setOnMouseClicked(e -> {
            if (onNavigate != null) onNavigate.accept("latihan");
        });
        header.getChildren().addAll(title, spacer, link);

        Label sub = new Label("Pilih metode yang cocok dengan ritme belajarmu saat ini");
        sub.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

        // 3 Cards Row
        HBox cardsRow = new HBox(12);
        cardsRow.getChildren().addAll(
                createModeCard("Mode Acak", "Semua Bab", "Latihan variatif seimbang dari seluruh silabus untuk mengasah ingatan jangka panjang.", "15 Soal • 15 Mnt", "#EFF6FF", "#2563EB", ModeLatihan.ACAK),
                createModeCard("Mode Berwaktu", "Simulasi Ujian", "Simulasi kondisi tes sesungguhnya dengan batas waktu ketat & hitung mundur per butir soal.", "25 Soal • 20 Mnt", "#FFFBEB", "#F59E0B", ModeLatihan.BERWAKTU),
                createModeCard("Fokus Kelemahan", "AI Adaptive", "Algoritma menyaring soal yang paling sering salah dijawab sampai kamu benar-benar tuntas.", "10 Soal Adaptif", "#ECFDF5", "#10B981", ModeLatihan.FOKUS_KELEMAHAN)
        );

        section.getChildren().addAll(header, sub, cardsRow);
        return section;
    }

    private VBox createModeCard(String title, String badge, String desc, String footer, String bgIcon, String colIcon, ModeLatihan mode) {
        VBox card = new VBox(10);
        card.setPadding(new Insets(14));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px; -fx-cursor: hand;");
        HBox.setHgrow(card, Priority.ALWAYS);

        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);

        StackPane iconCircle = new StackPane();
        iconCircle.setPrefSize(34, 34);
        iconCircle.setStyle("-fx-background-color: " + bgIcon + "; -fx-background-radius: 10px;");
        iconCircle.getChildren().add(Icons.createIcon("play", colIcon, 0.7));

        Region topSpacer = new Region();
        HBox.setHgrow(topSpacer, Priority.ALWAYS);

        Label badgeLbl = new Label(badge);
        badgeLbl.setStyle("-fx-background-color: " + bgIcon + "; -fx-text-fill: " + colIcon + "; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        top.getChildren().addAll(iconCircle, topSpacer, badgeLbl);

        Label titleLbl = new Label(title);
        titleLbl.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label descLbl = new Label(desc);
        descLbl.setWrapText(true);
        descLbl.setStyle("-fx-font-size: 10px; -fx-text-fill: #64748B; -fx-pref-height: 48px;");

        HBox foot = new HBox(8);
        foot.setAlignment(Pos.CENTER_LEFT);
        Label footLbl = new Label(footer);
        footLbl.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #64748B;");

        Region footSpacer = new Region();
        HBox.setHgrow(footSpacer, Priority.ALWAYS);

        StackPane arrowBtn = new StackPane(Icons.createIcon("arrow-right", "#2563EB", 0.7));
        foot.getChildren().addAll(footLbl, footSpacer, arrowBtn);

        card.getChildren().addAll(top, titleLbl, descLbl, foot);

        card.setOnMouseClicked(e -> {
            if (onLaunchQuizWithMode != null) onLaunchQuizWithMode.accept(mode);
        });

        return card;
    }

    // 3. Modul Sedang Dipelajari
    private VBox createModulDipelajariSection() {
        VBox section = new VBox(12);

        HBox header = new HBox(8);
        header.setAlignment(Pos.CENTER_LEFT);

        Label title = new Label("Modul Sedang Dipelajari");
        title.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Label link = new Label("Lihat Semua Modul (6) ›");
        link.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #2563EB; -fx-cursor: hand;");
        header.getChildren().addAll(title, spacer, link);

        Label sub = new Label("Lanjutkan progres bab materi terakhir untuk mencapai standar kelulusan");
        sub.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

        HBox modulesRow = new HBox(12);
        for (Materi m : DataRepository.getInstance().getMateriList().subList(0, 3)) {
            modulesRow.getChildren().add(createModuleCard(m));
        }

        section.getChildren().addAll(header, sub, modulesRow);
        return section;
    }

    private VBox createModuleCard(Materi m) {
        VBox card = new VBox(10);
        card.setPadding(new Insets(14));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");
        HBox.setHgrow(card, Priority.ALWAYS);

        // Header with Tag
        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);
        Label tag = new Label(m.getMataPelajaran());
        tag.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #2563EB; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        top.getChildren().add(tag);

        Label title = new Label(m.getJudul());
        title.setStyle("-fx-font-size: 12px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label desc = new Label(m.getDeskripsi());
        desc.setWrapText(true);
        desc.setStyle("-fx-font-size: 10px; -fx-text-fill: #64748B; -fx-pref-height: 36px;");

        // Progress bar
        VBox progBox = new VBox(3);
        HBox progHeader = new HBox(8);
        Label lblKel = new Label("Tingkat Kelulusan");
        lblKel.setStyle("-fx-font-size: 9px; -fx-text-fill: #94A3B8;");
        Region pSpacer = new Region();
        HBox.setHgrow(pSpacer, Priority.ALWAYS);
        Label lblPct = new Label(m.getPersentaseKelulusan() + "%");
        lblPct.setStyle("-fx-font-size: 10px; -fx-font-weight: 800; -fx-text-fill: #2563EB;");
        progHeader.getChildren().addAll(lblKel, pSpacer, lblPct);

        ProgressBar bar = new ProgressBar(m.getPersentaseKelulusan() / 100.0);
        bar.setMaxWidth(Double.MAX_VALUE);
        bar.setStyle("-fx-accent: #2563EB;");
        progBox.getChildren().addAll(progHeader, bar);

        // Buttons
        HBox btns = new HBox(8);
        Button btnRingkas = new Button("Buka Ringkas");
        btnRingkas.setMaxWidth(Double.MAX_VALUE);
        HBox.setHgrow(btnRingkas, Priority.ALWAYS);
        btnRingkas.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-radius: 6px; -fx-background-radius: 6px; -fx-text-fill: #334155; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 6; -fx-cursor: hand;");
        btnRingkas.setOnAction(e -> {
            if (onNavigate != null) onNavigate.accept("ringkas");
        });

        Button btnKuis = new Button("Mulai Kuis");
        btnKuis.setMaxWidth(Double.MAX_VALUE);
        HBox.setHgrow(btnKuis, Priority.ALWAYS);
        btnKuis.setStyle("-fx-background-color: #2563EB; -fx-background-radius: 6px; -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 6; -fx-cursor: hand;");
        btnKuis.setOnAction(e -> {
            if (onLaunchQuizWithMode != null) onLaunchQuizWithMode.accept(ModeLatihan.FOKUS_KELEMAHAN);
        });

        btns.getChildren().addAll(btnRingkas, btnKuis);

        card.getChildren().addAll(top, title, desc, progBox, btns);
        return card;
    }

    // RIGHT COLUMN CARDS
    // 4. Ringkasan Performa (Donut Chart 82%)
    private VBox createRingkasanPerformaCard() {
        VBox card = new VBox(12);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        HBox header = new HBox(8);
        header.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label("Ringkasan Performa");
        title.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        Label timeLbl = new Label("30 Hari Terakhir");
        timeLbl.setStyle("-fx-font-size: 10px; -fx-text-fill: #94A3B8;");
        header.getChildren().addAll(Icons.createIcon("chart", "#2563EB", 0.75), title, spacer, timeLbl);

        // 3 Key Stats
        HBox statsRow = new HBox(8);
        statsRow.setAlignment(Pos.CENTER);
        statsRow.setPadding(new Insets(8));
        statsRow.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 8px;");

        VBox s1 = createMiniStat("128", "Soal Dijawab");
        VBox s2 = createMiniStat("82%", "Akurasi Rata²");
        VBox s3 = createMiniStat("14", "Bab Tuntas");
        statsRow.getChildren().addAll(s1, new Separator(javafx.geometry.Orientation.VERTICAL), s2, new Separator(javafx.geometry.Orientation.VERTICAL), s3);

        // Donut Chart Row
        HBox donutRow = new HBox(16);
        donutRow.setAlignment(Pos.CENTER);

        StackPane donutPane = new StackPane();
        Canvas canvas = new Canvas(76, 76);
        GraphicsContext gc = canvas.getGraphicsContext2D();
        gc.setLineWidth(7);
        gc.setStroke(Color.web("#EF4444"));
        gc.strokeOval(6, 6, 64, 64);
        gc.setStroke(Color.web("#2563EB"));
        gc.strokeArc(6, 6, 64, 64, 90, -295, javafx.scene.shape.ArcType.OPEN);

        Label pctLbl = new Label("82%");
        pctLbl.setStyle("-fx-font-size: 14px; -fx-font-weight: 900; -fx-text-fill: #1E3A8A;");
        donutPane.getChildren().addAll(canvas, pctLbl);

        VBox donutLegend = new VBox(4);
        donutLegend.setAlignment(Pos.CENTER_LEFT);

        HBox leg1 = createLegendItem("#2563EB", "Jawaban Benar", "105");
        HBox leg2 = createLegendItem("#EF4444", "Perlu Remedial", "23");

        Label adaptifStatus = new Label("Status Adaptif: Level Siap PAS");
        adaptifStatus.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #2563EB; -fx-padding: 4 0 0 0;");

        donutLegend.getChildren().addAll(leg1, leg2, adaptifStatus);
        donutRow.getChildren().addAll(donutPane, donutLegend);

        card.getChildren().addAll(header, statsRow, donutRow);
        return card;
    }

    private VBox createMiniStat(String val, String lbl) {
        VBox b = new VBox(2);
        b.setAlignment(Pos.CENTER);
        HBox.setHgrow(b, Priority.ALWAYS);
        Label v = new Label(val);
        v.setStyle("-fx-font-size: 15px; -fx-font-weight: 900; -fx-text-fill: #1E3A8A;");
        Label l = new Label(lbl);
        l.setStyle("-fx-font-size: 9px; -fx-text-fill: #64748B;");
        b.getChildren().addAll(v, l);
        return b;
    }

    private HBox createLegendItem(String color, String text, String count) {
        HBox row = new HBox(6);
        row.setAlignment(Pos.CENTER_LEFT);
        javafx.scene.shape.Circle dot = new javafx.scene.shape.Circle(4, Color.web(color));
        Label t = new Label(text);
        t.setStyle("-fx-font-size: 10px; -fx-text-fill: #64748B;");
        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);
        Label c = new Label(count);
        c.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #0F172A;");
        row.getChildren().addAll(dot, t, sp, c);
        return row;
    }

    // 5. Modul Instan AI (Dropzone Scan Soal PR Guru)
    private VBox createModulInstanAICard() {
        VBox card = new VBox(10);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #1E40AF; -fx-background-radius: 14px; -fx-text-fill: #FFFFFF;");

        HBox header = new HBox(8);
        header.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label("Modul Instan AI");
        title.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #FFFFFF;");
        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);
        Label tag = new Label("Scan Soal PR Guru");
        tag.setStyle("-fx-font-size: 9px; -fx-text-fill: #BFDBFE;");
        header.getChildren().addAll(Icons.createIcon("book", "#FFFFFF", 0.75), title, sp, tag);

        Label desc = new Label("Punya lembar tugas cetak atau file guru? Unggah PDF / foto lembar soal untuk disulap jadi latihan kuis interaktif berpenjelasan otomatis.");
        desc.setWrapText(true);
        desc.setStyle("-fx-font-size: 10px; -fx-text-fill: #DBEAFE;");

        // Dashed Dropzone
        VBox dropzone = new VBox(6);
        dropzone.setAlignment(Pos.CENTER);
        dropzone.setPadding(new Insets(16));
        dropzone.setStyle(
                "-fx-background-color: rgba(255,255,255,0.08); " +
                "-fx-border-color: rgba(255,255,255,0.4); " +
                "-fx-border-style: dashed; " +
                "-fx-border-radius: 10px; " +
                "-fx-background-radius: 10px; " +
                "-fx-cursor: hand;"
        );

        Label dropText = new Label("Klik untuk unggah berkas");
        dropText.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #FFFFFF;");

        Label dropSub = new Label("Format PDF, DOCX, JPEG (Maks. 15MB)");
        dropSub.setStyle("-fx-font-size: 9px; -fx-text-fill: #BFDBFE;");

        dropzone.getChildren().addAll(Icons.createIcon("upload", "#FFFFFF", 0.8), dropText, dropSub);

        dropzone.setOnMouseClicked(e -> {
            FileChooser chooser = new FileChooser();
            chooser.setTitle("Pilih Dokumen Materi / Tugas");
            chooser.getExtensionFilters().addAll(
                    new FileChooser.ExtensionFilter("Dokumen Materi (*.pdf, *.docx, *.txt)", "*.pdf", "*.docx", "*.txt"),
                    new FileChooser.ExtensionFilter("Semua Berkas", "*.*")
            );
            File file = chooser.showOpenDialog(getScene().getWindow());
            if (file != null && onFileUploaded != null) {
                onFileUploaded.accept(file);
            }
        });

        HBox foot = new HBox(8);
        Label ocrTag = new Label("✦ AI OCR Versi 2.4 Aktif");
        ocrTag.setStyle("-fx-font-size: 9px; -fx-text-fill: #BFDBFE;");
        Region fSp = new Region();
        HBox.setHgrow(fSp, Priority.ALWAYS);
        Label riwLink = new Label("Riwayat Scan");
        riwLink.setStyle("-fx-font-size: 9px; -fx-text-fill: #FFFFFF; -fx-underline: true; -fx-cursor: hand;");
        foot.getChildren().addAll(ocrTag, fSp, riwLink);

        card.getChildren().addAll(header, desc, dropzone, foot);
        return card;
    }

    // 6. Agenda Ulangan
    private VBox createAgendaUlanganCard() {
        VBox card = new VBox(10);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        HBox header = new HBox(8);
        header.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label("Agenda Ulangan");
        title.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);
        Label link = new Label("+ Ingatkan");
        link.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #2563EB; -fx-cursor: hand;");
        header.getChildren().addAll(Icons.createIcon("calendar", "#2563EB", 0.75), title, sp, link);

        VBox item1 = createAgendaItem("RABU\n23", "Ulangan Harian Bab 4 IPA", "08:00 WIB • 30 Butir Pilihan Ganda", "H-2", "#EF4444");
        VBox item2 = createAgendaItem("SENIN\n28", "Simulasi Tryout Matematika", "10:00 WIB • Bank Soal Sekolah Terpadu", "H-7", "#F59E0B");

        card.getChildren().addAll(header, item1, item2);
        return card;
    }

    private VBox createAgendaItem(String dateStr, String title, String sub, String countdown, String badgeCol) {
        VBox box = new VBox(4);
        box.setPadding(new Insets(8));
        box.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 8px;");

        HBox row = new HBox(10);
        row.setAlignment(Pos.CENTER_LEFT);

        Label dateBox = new Label(dateStr);
        dateBox.setTextAlignment(javafx.scene.text.TextAlignment.CENTER);
        dateBox.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #E2E8F0; -fx-border-radius: 6px; -fx-background-radius: 6px; -fx-padding: 4 8 4 8; -fx-font-size: 9px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        VBox text = new VBox(2);
        Label t = new Label(title);
        t.setStyle("-fx-font-size: 11px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        Label s = new Label(sub);
        s.setStyle("-fx-font-size: 9px; -fx-text-fill: #64748B;");
        text.getChildren().addAll(t, s);

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Label badge = new Label(countdown);
        badge.setStyle("-fx-background-color: " + badgeCol + "; -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        row.getChildren().addAll(dateBox, text, sp, badge);
        box.getChildren().add(row);
        return box;
    }

    // 7. Aktivitas Mentor
    private VBox createAktivitasMentorCard() {
        VBox card = new VBox(10);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        HBox header = new HBox(8);
        header.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label("Aktivitas Mentor");
        title.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);
        Label badge = new Label("Catatan Baru");
        badge.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #065F46; -fx-font-size: 9px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 10px;");
        header.getChildren().addAll(Icons.createIcon("review", "#10B981", 0.75), title, sp, badge);

        HBox mentorProfile = new HBox(8);
        mentorProfile.setAlignment(Pos.CENTER_LEFT);
        StackPane av = new StackPane();
        av.setPrefSize(28, 28);
        av.setStyle("-fx-background-color: #059669; -fx-background-radius: 14px;");
        Label rk = new Label("RK");
        rk.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 700;");
        av.getChildren().add(rk);

        VBox mentorText = new VBox(1);
        Label name = new Label("Bu Ratna Kumalasari, S.Pd.");
        name.setStyle("-fx-font-size: 11px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        Label role = new Label("Wali Kelas • Guru IPA Terpadu");
        role.setStyle("-fx-font-size: 9px; -fx-text-fill: #64748B;");
        mentorText.getChildren().addAll(name, role);
        mentorProfile.getChildren().addAll(av, mentorText);

        Label quote = new Label("“Halo Arya, kuis latihan peredaran darah kemarin bagian arteri sudah tepat. Namun coba cermati lagi arah aliran vena paru di ringkasan AI ya, supaya tidak tertukar saat ulangan hari Rabu! Semangat!”");
        quote.setWrapText(true);
        quote.setStyle("-fx-font-size: 10px; -fx-font-style: italic; -fx-text-fill: #334155; -fx-background-color: #F8FAFC; -fx-padding: 10; -fx-background-radius: 8px;");

        HBox foot = new HBox(8);
        Label time = new Label("Diterima 3 jam lalu");
        time.setStyle("-fx-font-size: 9px; -fx-text-fill: #94A3B8;");
        Region fSp = new Region();
        HBox.setHgrow(fSp, Priority.ALWAYS);
        Label reply = new Label("Balas Catatan");
        reply.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #2563EB; -fx-cursor: hand;");
        foot.getChildren().addAll(time, fSp, reply);

        card.getChildren().addAll(header, mentorProfile, quote, foot);
        return card;
    }
}
