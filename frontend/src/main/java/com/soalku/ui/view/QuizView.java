package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.*;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.util.Duration;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class QuizView extends ScrollPane {

    private final SesiLatihan sesi;
    private final Consumer<SesiLatihan> onFinishQuiz;
    private final Runnable onBackToDashboard;

    private int currentIndex = 0; // Mulai dari Soal No. 1
    private int perQuestionSeconds = 30; // Batas waktu 30 detik per soal untuk Mode Berwaktu (PRD Asumsi A5)
    private Label lblPerQuestionTimer;
    private final List<Button> gridButtons = new ArrayList<>();

    // Dynamic UI bindings
    private Label lblCountdown;
    private Label lblProgressText;
    private Label lblProgressPct;
    private ProgressBar progressBar;
    private Label lblSoalNo;
    private Label lblTopik;
    private Label lblKesulitan;
    private Label lblPertanyaan;

    private VBox optionsContainer;
    private VBox diagramPlaceholder;
    private ToggleGroup optionGroup;

    private Label lblTipsText;
    private Label lblInsightText;

    private Label lblDijawabCount;
    private Label lblRaguCount;
    private Label lblBelumCount;

    private Timeline timer;

    public QuizView(SesiLatihan sesi, Consumer<SesiLatihan> onFinishQuiz, Runnable onBackToDashboard) {
        this.sesi = sesi;
        this.onFinishQuiz = onFinishQuiz;
        this.onBackToDashboard = onBackToDashboard;

        setFitToWidth(true);
        setStyle("-fx-background-color: #F8FAFC; -fx-background: #F8FAFC;");

        // Hapus seedMockupState agar sesi baru mulai bersih dari Soal 1
        VBox content = new VBox(16);
        content.setPadding(new Insets(16, 24, 30, 24));
        content.getChildren().addAll(
                createSessionHeaderBar(),
                createMainExamGrid(),
                createKeyboardShortcutHint()
        );

        setContent(content);

        // Start countdown timer
        initTimer();

        // Display current question (Mulai dari Soal No. 1)
        displayQuestion(currentIndex);

        // Keyboard handler for A, B, C, D and Enter
        setOnKeyPressed(e -> {
            if (e.getCode() == KeyCode.A) selectOptionByIndex(0);
            else if (e.getCode() == KeyCode.B) selectOptionByIndex(1);
            else if (e.getCode() == KeyCode.C) selectOptionByIndex(2);
            else if (e.getCode() == KeyCode.D) selectOptionByIndex(3);
            else if (e.getCode() == KeyCode.ENTER) simpanDanLanjut();
        });
    }

    private void initTimer() {
        timer = new Timeline(new KeyFrame(Duration.seconds(1), e -> {
            if (sesi.getWaktuDetikSisa() > 0) {
                sesi.setWaktuDetikSisa(sesi.getWaktuDetikSisa() - 1);
                int m = sesi.getWaktuDetikSisa() / 60;
                int s = sesi.getWaktuDetikSisa() % 60;
                lblCountdown.setText(String.format("%02d:%02d", m, s));
            } else {
                timer.stop();
                selesaikanUjian();
                return;
            }

            // Mode Berwaktu: batas waktu per soal (default 30 detik; waktu habis dihitung salah)
            if (sesi.getMode() == ModeLatihan.BERWAKTU) {
                perQuestionSeconds--;
                if (lblPerQuestionTimer != null) {
                    lblPerQuestionTimer.setText(perQuestionSeconds + " dtk");
                    if (perQuestionSeconds <= 10) {
                        lblPerQuestionTimer.setStyle("-fx-font-size: 14px; -fx-font-weight: 900; -fx-text-fill: #DC2626;");
                    } else {
                        lblPerQuestionTimer.setStyle("-fx-font-size: 14px; -fx-font-weight: 900; -fx-text-fill: #D97706;");
                    }
                }

                if (perQuestionSeconds <= 0) {
                    // Waktu habis per soal -> dihitung salah dengan opsi kosong
                    Soal currentSoal = sesi.getDaftarSoal().get(currentIndex);
                    if (!sesi.getJawabanMap().containsKey(currentSoal.getId())) {
                        sesi.getJawabanMap().put(currentSoal.getId(), null);
                    }
                    simpanDanLanjut();
                }
            }
        }));
        timer.setCycleCount(Timeline.INDEFINITE);
        timer.play();
    }

    // 1. Session Header Bar
    private VBox createSessionHeaderBar() {
        VBox bar = new VBox(10);
        bar.setPadding(new Insets(14, 18, 14, 18));
        bar.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");

        // Top Row: Badges & Stats
        HBox topRow = new HBox(10);
        topRow.setAlignment(Pos.CENTER_LEFT);

        Label badgeAi = new Label("Adaptif AI");
        badgeAi.setGraphic(Icons.createIcon("sparkle", "#059669", 0.65));
        badgeAi.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #065F46; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        Label badgeMode = new Label(sesi.getMode().getDisplayName());
        badgeMode.setGraphic(Icons.createIcon("ai", "#2563EB", 0.65));
        badgeMode.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        Label badgeId = new Label("ID Sesi: " + sesi.getIdSesiFormatted());
        badgeId.setStyle("-fx-text-fill: #64748B; -fx-font-size: 10px; -fx-font-weight: 600;");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Per-question timer (Khusus Mode Berwaktu sesuai PRD Asumsi A5)
        HBox perQTimerCard = new HBox(8);
        perQTimerCard.setAlignment(Pos.CENTER_LEFT);
        perQTimerCard.setPadding(new Insets(6, 12, 6, 12));
        perQTimerCard.setStyle("-fx-background-color: #FFFBEB; -fx-background-radius: 8px; -fx-border-color: #FDE68A; -fx-border-radius: 8px;");

        VBox qTimerText = new VBox(1);
        Label qLbl = new Label("Waktu Soal Ini (30d)");
        qLbl.setStyle("-fx-font-size: 9px; -fx-text-fill: #B45309; -fx-font-weight: 700;");
        lblPerQuestionTimer = new Label("30 dtk");
        lblPerQuestionTimer.setStyle("-fx-font-size: 13px; -fx-font-weight: 900; -fx-text-fill: #D97706;");
        qTimerText.getChildren().addAll(qLbl, lblPerQuestionTimer);
        perQTimerCard.getChildren().addAll(Icons.createIcon("clock", "#D97706", 0.75), qTimerText);

        if (sesi.getMode() != ModeLatihan.BERWAKTU) {
            perQTimerCard.setVisible(false);
            perQTimerCard.setManaged(false);
        }

        // Streak Belajar (Orange card)
        HBox streakCard = new HBox(8);
        streakCard.setAlignment(Pos.CENTER_LEFT);
        streakCard.setPadding(new Insets(6, 12, 6, 12));
        streakCard.setStyle("-fx-background-color: #ECFDF5; -fx-background-radius: 8px; -fx-border-color: #A7F3D0; -fx-border-radius: 8px;");

        VBox streakText = new VBox(1);
        Label sLbl = new Label("Streak Belajar");
        sLbl.setStyle("-fx-font-size: 9px; -fx-text-fill: #065F46; -fx-font-weight: 600;");
        Label sVal = new Label("4 Benar Berturut-turut");
        sVal.setStyle("-fx-font-size: 11px; -fx-font-weight: 800; -fx-text-fill: #059669;");
        streakText.getChildren().addAll(sLbl, sVal);
        streakCard.getChildren().addAll(Icons.createIcon("fire", "#059669", 0.75), streakText);

        // Sisa Waktu Total Sesi
        HBox timerCard = new HBox(8);
        timerCard.setAlignment(Pos.CENTER_LEFT);
        timerCard.setPadding(new Insets(6, 14, 6, 14));
        timerCard.setStyle("-fx-background-color: #F0F9FF; -fx-background-radius: 8px; -fx-border-color: #BAE6FD; -fx-border-radius: 8px;");

        VBox timerText = new VBox(1);
        Label tLbl = new Label("Sisa Sesi Total");
        tLbl.setStyle("-fx-font-size: 9px; -fx-text-fill: #0369A1; -fx-font-weight: 600;");
        lblCountdown = new Label("14:19");
        lblCountdown.setStyle("-fx-font-size: 14px; -fx-font-weight: 900; -fx-text-fill: #0C4A6E;");
        timerText.getChildren().addAll(tLbl, lblCountdown);
        timerCard.getChildren().addAll(Icons.createIcon("clock", "#0284C7", 0.75), timerText);

        topRow.getChildren().addAll(badgeAi, badgeMode, badgeId, spacer, perQTimerCard, streakCard, timerCard);

        // Middle Row: Subject Title
        HBox midRow = new HBox(8);
        midRow.setAlignment(Pos.CENTER_LEFT);
        Label subject = new Label(sesi.getJudulModul());
        subject.setStyle("-fx-font-size: 15px; -fx-font-weight: 900; -fx-text-fill: #0F172A;");

        Label classTag = new Label(sesi.getKelasTingkat());
        classTag.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");
        midRow.getChildren().addAll(subject, classTag);

        // Bottom Row: Progress bar
        VBox progRow = new VBox(4);
        HBox progHeader = new HBox(8);
        lblProgressText = new Label("Progres Pengerjaan: Soal 7 dari 10");
        lblProgressText.setStyle("-fx-font-size: 10px; -fx-font-weight: 600; -fx-text-fill: #475569;");

        Region pSpacer = new Region();
        HBox.setHgrow(pSpacer, Priority.ALWAYS);

        lblProgressPct = new Label("70% Selesai");
        lblProgressPct.setStyle("-fx-font-size: 10px; -fx-font-weight: 800; -fx-text-fill: #2563EB;");
        progHeader.getChildren().addAll(lblProgressText, pSpacer, lblProgressPct);

        progressBar = new ProgressBar(0.70);
        progressBar.setMaxWidth(Double.MAX_VALUE);
        progressBar.setStyle("-fx-accent: #2563EB; -fx-control-inner-background: #E2E8F0;");

        progRow.getChildren().addAll(progHeader, progressBar);

        bar.getChildren().addAll(topRow, midRow, progRow);
        return bar;
    }

    // 2. Main Exam Grid: Left Question Card + Right Navigation & AI Tips
    private GridPane createMainExamGrid() {
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(16);

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(67);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(33);
        grid.getColumnConstraints().addAll(col1, col2);

        // Left Question Box
        VBox questionBox = createQuestionCard();

        // Right Column: Navigation + Tips Adaptif AI
        VBox rightBox = new VBox(16);
        rightBox.getChildren().addAll(
                createNavigasiSoalCard(),
                createTipsAdaptifAICard()
        );

        grid.add(questionBox, 0, 0);
        grid.add(rightBox, 1, 0);
        return grid;
    }

    private VBox createQuestionCard() {
        VBox card = new VBox(14);
        card.setPadding(new Insets(20));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        // Header: Soal No + Topik + Tingkat Kesulitan
        HBox head = new HBox(10);
        head.setAlignment(Pos.CENTER_LEFT);

        StackPane numBadge = new StackPane();
        numBadge.setPrefSize(28, 28);
        numBadge.setStyle("-fx-background-color: #2563EB; -fx-background-radius: 6px;");
        lblSoalNo = new Label("7");
        lblSoalNo.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 13px; -fx-font-weight: 900;");
        numBadge.getChildren().add(lblSoalNo);

        VBox titleBox = new VBox(1);
        Label soalLabel = new Label("Soal No. 7");
        soalLabel.setStyle("-fx-font-size: 12px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        lblTopik = new Label("Topik: Enzim Lambung & Organ Pencernaan Manusia");
        lblTopik.setStyle("-fx-font-size: 10px; -fx-text-fill: #64748B;");
        titleBox.getChildren().addAll(soalLabel, lblTopik);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        lblKesulitan = new Label("Tingkat Kesulitan: Sedang");
        lblKesulitan.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #2563EB; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 3 8 3 8; -fx-background-radius: 12px;");

        head.getChildren().addAll(numBadge, titleBox, spacer, lblKesulitan);

        // Pertanyaan Text
        lblPertanyaan = new Label();
        lblPertanyaan.setWrapText(true);
        lblPertanyaan.setStyle("-fx-font-size: 13px; -fx-text-fill: #1E293B; -fx-line-spacing: 3px; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        // Diagram Box
        diagramPlaceholder = new VBox();
        diagramPlaceholder.getChildren().add(new DigestiveDiagramComponent());

        // Options Choices (A, B, C, D)
        optionsContainer = new VBox(8);
        optionGroup = new ToggleGroup();

        // Footer Actions
        HBox foot = new HBox(10);
        foot.setAlignment(Pos.CENTER_LEFT);

        Button btnPrev = new Button("Sebelumnya");
        btnPrev.setGraphic(Icons.createIcon("arrow-left", "#475569", 0.7));
        btnPrev.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #CBD5E1; -fx-border-radius: 8px; -fx-background-radius: 8px; -fx-text-fill: #334155; -fx-font-size: 11px; -fx-font-weight: 700; -fx-padding: 8 16 8 14; -fx-cursor: hand;");
        btnPrev.setOnAction(e -> pindahSoal(currentIndex - 1));

        Button btnRagu = new Button("Ragu-ragu");
        btnRagu.setGraphic(Icons.createIcon("flag", "#D97706", 0.7));
        btnRagu.setStyle("-fx-background-color: #FFFBEB; -fx-border-color: #FDE68A; -fx-border-radius: 8px; -fx-background-radius: 8px; -fx-text-fill: #B45309; -fx-font-size: 11px; -fx-font-weight: 700; -fx-padding: 8 16 8 14; -fx-cursor: hand;");
        btnRagu.setOnAction(e -> toggleRagu());

        Region fSpacer = new Region();
        HBox.setHgrow(fSpacer, Priority.ALWAYS);

        Button btnNext = new Button("Simpan & Soal Berikutnya");
        btnNext.setGraphic(Icons.createIcon("arrow-right", "#FFFFFF", 0.7));
        btnNext.setContentDisplay(ContentDisplay.RIGHT);
        btnNext.setStyle("-fx-background-color: #2563EB; -fx-background-radius: 8px; -fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: 800; -fx-padding: 9 18 9 16; -fx-cursor: hand;");
        btnNext.setOnAction(e -> simpanDanLanjut());

        foot.getChildren().addAll(btnPrev, btnRagu, fSpacer, btnNext);

        card.getChildren().addAll(head, lblPertanyaan, diagramPlaceholder, optionsContainer, new Separator(), foot);
        return card;
    }

    // 3. Right Column: Navigasi Soal Card (Grid 1 to 10)
    private VBox createNavigasiSoalCard() {
        VBox card = new VBox(12);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        HBox head = new HBox(8);
        head.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label("Navigasi Soal");
        title.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Label total = new Label("Total: " + sesi.getDaftarSoal().size() + " Butir");
        total.setStyle("-fx-font-size: 10px; -fx-text-fill: #64748B;");
        head.getChildren().addAll(Icons.createIcon("dashboard", "#2563EB", 0.7), title, sp, total);

        // Legend: Dijawab (6), Ragu (1), Belum (3)
        HBox legend = new HBox(12);
        legend.setAlignment(Pos.CENTER_LEFT);

        HBox leg1 = new HBox(4);
        leg1.setAlignment(Pos.CENTER_LEFT);
        leg1.getChildren().addAll(new Circle(4, Color.web("#059669")));
        lblDijawabCount = new Label("Dijawab (6)");
        lblDijawabCount.setStyle("-fx-font-size: 9px; -fx-text-fill: #64748B;");
        leg1.getChildren().add(lblDijawabCount);

        HBox leg2 = new HBox(4);
        leg2.setAlignment(Pos.CENTER_LEFT);
        leg2.getChildren().addAll(new Circle(4, Color.web("#F59E0B")));
        lblRaguCount = new Label("Ragu (1)");
        lblRaguCount.setStyle("-fx-font-size: 9px; -fx-text-fill: #64748B;");
        leg2.getChildren().add(lblRaguCount);

        HBox leg3 = new HBox(4);
        leg3.setAlignment(Pos.CENTER_LEFT);
        leg3.getChildren().addAll(new Circle(4, Color.web("#CBD5E1")));
        lblBelumCount = new Label("Belum (3)");
        lblBelumCount.setStyle("-fx-font-size: 9px; -fx-text-fill: #64748B;");
        leg3.getChildren().add(lblBelumCount);

        legend.getChildren().addAll(leg1, leg2, leg3);

        // Grid 1 to 10
        GridPane grid = new GridPane();
        grid.setHgap(8);
        grid.setVgap(8);

        gridButtons.clear();
        int totalSoal = sesi.getDaftarSoal().size();
        for (int i = 0; i < totalSoal; i++) {
            int idx = i;
            Button btn = new Button(String.valueOf(i + 1));
            btn.setPrefSize(38, 38);
            btn.setStyle("-fx-background-radius: 8px; -fx-font-size: 11px; -fx-font-weight: 800; -fx-cursor: hand;");
            btn.setOnAction(e -> displayQuestion(idx));

            gridButtons.add(btn);
            grid.add(btn, i % 5, i / 5);
        }

        updateGridButtonStyles();

        // Finish Exam Button
        Button btnFinish = new Button("✓ Selesaikan Ujian Sekarang");
        btnFinish.setMaxWidth(Double.MAX_VALUE);
        btnFinish.setStyle(
                "-fx-background-color: #EFF6FF; " +
                "-fx-border-color: #BFDBFE; " +
                "-fx-border-radius: 8px; " +
                "-fx-background-radius: 8px; " +
                "-fx-text-fill: #1D4ED8; " +
                "-fx-font-size: 11px; " +
                "-fx-font-weight: 800; " +
                "-fx-padding: 9; " +
                "-fx-cursor: hand;"
        );
        btnFinish.setOnAction(e -> selesaikanUjian());

        card.getChildren().addAll(head, legend, grid, btnFinish);
        return card;
    }

    // 4. Right Column: Tips Adaptif AI Card
    private VBox createTipsAdaptifAICard() {
        VBox card = new VBox(10);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        HBox head = new HBox(8);
        head.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label("Tips Adaptif AI");
        title.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Label badge = new Label("Jembatan Keledai");
        badge.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #2563EB; -fx-font-size: 9px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");
        head.getChildren().addAll(Icons.createIcon("sparkle", "#2563EB", 0.75), title, sp, badge);

        lblTipsText = new Label("Ingat singkatan enzim getah lambung dengan rumus: [R - P - L]\n• Renin: mengendapkan protein kasein susu\n• Pepsin: memecah protein jadi pepton\n• Lambung asam (HCl): desinfektan kuman");
        lblTipsText.setWrapText(true);
        lblTipsText.setStyle("-fx-font-size: 10px; -fx-text-fill: #334155; -fx-background-color: #F8FAFC; -fx-padding: 10; -fx-background-radius: 8px; -fx-line-spacing: 2px;");

        // AI Insight Alert
        HBox alert = new HBox(8);
        alert.setAlignment(Pos.TOP_LEFT);
        alert.setPadding(new Insets(8));
        alert.setStyle("-fx-background-color: #F0FDF4; -fx-background-radius: 8px; -fx-border-color: #BBF7D0; -fx-border-radius: 8px;");

        lblInsightText = new Label("Berdasarkan performa terakhirmu, kamu sering tertukar fungsi pepsin (lambung) dengan tripsin (usus halus).");
        lblInsightText.setWrapText(true);
        lblInsightText.setStyle("-fx-font-size: 9.5px; -fx-text-fill: #166534;");
        alert.getChildren().addAll(Icons.createIcon("sparkle", "#16A34A", 0.65), lblInsightText);

        // Bottom issue report action
        HBox reportRow = new HBox(6);
        reportRow.setAlignment(Pos.CENTER_LEFT);
        Label qLbl = new Label("Ada kendala tampilan atau kunci?");
        qLbl.setStyle("-fx-font-size: 9px; -fx-text-fill: #64748B;");

        Region rSp = new Region();
        HBox.setHgrow(rSp, Priority.ALWAYS);

        Button btnReport = new Button("Laporkan Soal");
        btnReport.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-size: 9px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 3 8 3 8; -fx-cursor: hand;");
        btnReport.setOnAction(e -> {
            Alert a = new Alert(Alert.AlertType.INFORMATION, "Terima kasih! Laporan telah dikirimkan ke Mentor untuk ditinjau.", ButtonType.OK);
            a.show();
        });

        reportRow.getChildren().addAll(qLbl, rSp, btnReport);

        card.getChildren().addAll(head, lblTipsText, alert, reportRow);
        return card;
    }

    // 5. Keyboard shortcut hint banner at bottom
    private HBox createKeyboardShortcutHint() {
        HBox banner = new HBox(8);
        banner.setAlignment(Pos.CENTER_LEFT);
        banner.setPadding(new Insets(8, 14, 8, 14));
        banner.setStyle("-fx-background-color: #F1F5F9; -fx-background-radius: 8px; -fx-border-color: #E2E8F0; -fx-border-radius: 8px;");

        Label tip = new Label("Tip Pintasan Keyboard: Tekan [A, B, C, D] untuk memilih opsi, [Enter] untuk lanjut.");
        tip.setStyle("-fx-font-size: 10px; -fx-text-fill: #475569;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Label autoSave = new Label("● Tersimpan Otomatis");
        autoSave.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #059669;");

        banner.getChildren().addAll(tip, sp, autoSave);
        return banner;
    }

    // Logic to update view when question changes
    private void displayQuestion(int index) {
        if (index < 0 || index >= sesi.getDaftarSoal().size()) return;
        this.currentIndex = index;
        this.perQuestionSeconds = 30;
        if (lblPerQuestionTimer != null) {
            lblPerQuestionTimer.setText("30 dtk");
            lblPerQuestionTimer.setStyle("-fx-font-size: 13px; -fx-font-weight: 900; -fx-text-fill: #D97706;");
        }

        Soal s = sesi.getDaftarSoal().get(index);
        lblSoalNo.setText(String.valueOf(index + 1));
        lblTopik.setText("Topik: " + s.getTopik());
        lblKesulitan.setText("Tingkat Kesulitan: " + s.getTingkatKesulitan().getLabel());
        lblPertanyaan.setText(s.getPertanyaan());

        // Diagram display: show digestive diagram if Soal 7 or if topic is digestive
        if (s.getId() == 7 || s.getTopik().toLowerCase().contains("pencernaan") || index == 6) {
            diagramPlaceholder.setVisible(true);
            diagramPlaceholder.setManaged(true);
        } else {
            diagramPlaceholder.setVisible(false);
            diagramPlaceholder.setManaged(false);
        }

        // Render Options
        optionsContainer.getChildren().clear();
        Integer selectedOpsiId = sesi.getJawabanMap().get(s.getId());

        for (int i = 0; i < s.getOpsiList().size(); i++) {
            OpsiJawaban opsi = s.getOpsiList().get(i);
            boolean isChecked = (selectedOpsiId != null && selectedOpsiId == opsi.getId());
            optionsContainer.getChildren().add(createOptionRow(opsi, isChecked));
        }

        // Update Tips AI card
        if (s.getTipsAdaptif() != null) {
            lblTipsText.setText(s.getTipsAdaptif());
        } else {
            lblTipsText.setText("Tips AI: Bacalah kata kunci pada pertanyaan dengan seksama sebelum menentukan jawaban.");
        }

        if (s.getInsightKelemahan() != null) {
            lblInsightText.setText(s.getInsightKelemahan());
        } else {
            lblInsightText.setText("Topik ini memiliki tingkat keberhasilan 80% di kelasmu.");
        }

        // Update Progress
        int answered = sesi.hitungJumlahTerjawab();
        double pct = (double) answered / sesi.getTotalSoal();
        progressBar.setProgress(pct);
        lblProgressText.setText("Progres Pengerjaan: Soal " + (index + 1) + " dari " + sesi.getTotalSoal());
        lblProgressPct.setText((int) (pct * 100) + "% Selesai");

        updateGridButtonStyles();
    }

    private HBox createOptionRow(OpsiJawaban opsi, boolean isSelected) {
        HBox row = new HBox(12);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setPadding(new Insets(10, 16, 10, 14));
        row.setStyle("-fx-cursor: hand;");

        // Option Letter Badge (A, B, C, D)
        StackPane letterBox = new StackPane();
        letterBox.setPrefSize(28, 28);

        VBox textBox = new VBox(2);
        Label textLbl = new Label(opsi.getTeksOpsi());

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        if (isSelected) {
            row.setStyle("-fx-background-color: #EFF6FF; -fx-background-radius: 10px; -fx-border-color: #2563EB; -fx-border-width: 1.5; -fx-border-radius: 10px; -fx-cursor: hand;");
            letterBox.setStyle("-fx-background-color: #2563EB; -fx-background-radius: 6px;");

            Label letter = new Label(opsi.getLabel());
            letter.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 12px; -fx-font-weight: 800;");
            letterBox.getChildren().add(letter);

            textLbl.setStyle("-fx-font-size: 12.5px; -fx-font-weight: 700; -fx-text-fill: #1E3A8A;");
            Label subSaved = new Label("Jawaban Anda saat ini tersimpan");
            subSaved.setStyle("-fx-font-size: 9.5px; -fx-text-fill: #2563EB; -fx-font-weight: 600;");
            textBox.getChildren().addAll(textLbl, subSaved);

            HBox checkIcon = new HBox(4);
            checkIcon.setAlignment(Pos.CENTER);
            checkIcon.getChildren().addAll(
                    Icons.createIcon("check", "#2563EB", 0.75),
                    new Circle(5, Color.web("#2563EB"))
            );
            row.getChildren().addAll(letterBox, textBox, spacer, checkIcon);
        } else {
            row.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 10px; -fx-border-color: #E2E8F0; -fx-border-radius: 10px; -fx-cursor: hand;");
            letterBox.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 6px; -fx-border-color: #CBD5E1; -fx-border-radius: 6px;");

            Label letter = new Label(opsi.getLabel());
            letter.setStyle("-fx-text-fill: #475569; -fx-font-size: 12px; -fx-font-weight: 700;");
            letterBox.getChildren().add(letter);

            textLbl.setStyle("-fx-font-size: 12px; -fx-text-fill: #334155;");
            textBox.getChildren().add(textLbl);

            Circle radioHollow = new Circle(7);
            radioHollow.setFill(Color.TRANSPARENT);
            radioHollow.setStroke(Color.web("#CBD5E1"));
            radioHollow.setStrokeWidth(1.5);

            row.getChildren().addAll(letterBox, textBox, spacer, radioHollow);
        }

        row.setOnMouseClicked(e -> {
            Soal s = sesi.getDaftarSoal().get(currentIndex);
            sesi.getJawabanMap().put(s.getId(), opsi.getId());
            displayQuestion(currentIndex);
        });

        return row;
    }

    private void selectOptionByIndex(int optIdx) {
        Soal s = sesi.getDaftarSoal().get(currentIndex);
        if (optIdx < s.getOpsiList().size()) {
            OpsiJawaban opsi = s.getOpsiList().get(optIdx);
            sesi.getJawabanMap().put(s.getId(), opsi.getId());
            displayQuestion(currentIndex);
        }
    }

    private void toggleRagu() {
        Soal s = sesi.getDaftarSoal().get(currentIndex);
        boolean current = Boolean.TRUE.equals(sesi.getRaguMap().get(s.getId()));
        sesi.getRaguMap().put(s.getId(), !current);
        displayQuestion(currentIndex);
    }

    private void simpanDanLanjut() {
        if (currentIndex < sesi.getDaftarSoal().size() - 1) {
            pindahSoal(currentIndex + 1);
        } else {
            selesaikanUjian();
        }
    }

    private void pindahSoal(int targetIdx) {
        if (targetIdx >= 0 && targetIdx < sesi.getDaftarSoal().size()) {
            displayQuestion(targetIdx);
        }
    }

    private void updateGridButtonStyles() {
        int dijawab = 0;
        int ragu = 0;
        int belum = 0;

        for (int i = 0; i < gridButtons.size(); i++) {
            Button b = gridButtons.get(i);
            Soal s = sesi.getDaftarSoal().get(i);
            Integer ans = sesi.getJawabanMap().get(s.getId());
            boolean isRagu = Boolean.TRUE.equals(sesi.getRaguMap().get(s.getId()));
            boolean isCurrent = (i == currentIndex);

            if (isCurrent) {
                b.setStyle("-fx-background-color: #2563EB; -fx-text-fill: #FFFFFF; -fx-background-radius: 8px; -fx-font-weight: 800; -fx-font-size: 12px;");
            } else if (isRagu) {
                b.setStyle("-fx-background-color: #F59E0B; -fx-text-fill: #FFFFFF; -fx-background-radius: 8px; -fx-font-weight: 800; -fx-font-size: 11px;");
                ragu++;
            } else if (ans != null) {
                b.setStyle("-fx-background-color: #059669; -fx-text-fill: #FFFFFF; -fx-background-radius: 8px; -fx-font-weight: 800; -fx-font-size: 11px;");
                dijawab++;
            } else {
                b.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #64748B; -fx-background-radius: 8px; -fx-border-color: #CBD5E1; -fx-border-radius: 8px; -fx-font-weight: 700; -fx-font-size: 11px;");
                belum++;
            }
        }

        if (sesi.getJawabanMap().containsKey(sesi.getDaftarSoal().get(currentIndex).getId())) {
            dijawab++;
        }

        lblDijawabCount.setText("Dijawab (" + sesi.hitungJumlahTerjawab() + ")");
        lblRaguCount.setText("Ragu (" + sesi.hitungJumlahRagu() + ")");
        int unans = sesi.getTotalSoal() - sesi.hitungJumlahTerjawab();
        lblBelumCount.setText("Belum (" + Math.max(0, unans) + ")");
    }

    private void selesaikanUjian() {
        if (timer != null) timer.stop();

        DataRepository.getInstance().simpanRiwayat(sesi);

        if (onFinishQuiz != null) {
            onFinishQuiz.accept(sesi);
        } else if (onBackToDashboard != null) {
            onBackToDashboard.run();
        }
    }
}
