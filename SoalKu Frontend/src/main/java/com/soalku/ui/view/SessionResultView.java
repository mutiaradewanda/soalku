package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.OpsiJawaban;
import com.soalku.model.SesiLatihan;
import com.soalku.model.Soal;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Separator;
import javafx.scene.layout.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * SessionResultView - Halaman Hasil Sesi Ujian Latihan
 * Sesuai Dokumen Desain Sistem & PRD Section 10:
 * - Menampilkan Skor Akhir Ujian.
 * - Menampilkan Daftar Soal yang Dijawab Salah beserta Kunci Jawaban Benar & Tips AI.
 * - Tombol navigasi menuju Evaluasi Mandiri atau kembali ke Dasbor.
 */
public class SessionResultView extends ScrollPane {

    private final SesiLatihan sesi;
    private final Runnable onNavigateToEvaluation;
    private final Runnable onBackToDashboard;
    private final Runnable onRestartQuiz;

    public SessionResultView(
            SesiLatihan sesi,
            Runnable onNavigateToEvaluation,
            Runnable onBackToDashboard,
            Runnable onRestartQuiz
    ) {
        this.sesi = sesi;
        this.onNavigateToEvaluation = onNavigateToEvaluation;
        this.onBackToDashboard = onBackToDashboard;
        this.onRestartQuiz = onRestartQuiz;

        setFitToWidth(true);
        setStyle("-fx-background-color: #F8FAFC; -fx-background: #F8FAFC;");

        VBox content = new VBox(20);
        content.setPadding(new Insets(20, 24, 40, 24));

        content.getChildren().addAll(
                createHeaderBanner(),
                createStatsSummaryRow(),
                createWrongQuestionsSection(),
                createActionBottomBar()
        );

        setContent(content);
    }

    private VBox createHeaderBanner() {
        int skorBenar = sesi.hitungSkorBenar();
        int total = sesi.getTotalSoal();
        int nilai = total > 0 ? (int) (((double) skorBenar / total) * 100) : 0;

        VBox banner = new VBox(12);
        banner.setPadding(new Insets(24));
        banner.setStyle(
                "-fx-background-color: linear-gradient(to right, #1E3A8A, #2563EB); " +
                "-fx-background-radius: 16px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(37,99,235,0.25), 16, 0, 0, 4);"
        );

        HBox topRow = new HBox(8);
        topRow.setAlignment(Pos.CENTER_LEFT);
        Label tag = new Label("HASIL SESI UJIAN • " + sesi.getMode().getDisplayName().toUpperCase());
        tag.setStyle("-fx-background-color: rgba(255,255,255,0.2); -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        Label sesiId = new Label(sesi.getIdSesiFormatted() + " • " + sesi.getKelasTingkat());
        sesiId.setStyle("-fx-text-fill: #BFDBFE; -fx-font-size: 11px; -fx-font-weight: 600;");
        topRow.getChildren().addAll(tag, sesiId);

        HBox scoreRow = new HBox(20);
        scoreRow.setAlignment(Pos.CENTER_LEFT);

        VBox scoreBox = new VBox(0);
        Label lblSkor = new Label(String.valueOf(nilai));
        lblSkor.setStyle("-fx-font-size: 48px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");
        Label lblSkorSub = new Label("SKOR AKHIR (SKALA 100)");
        lblSkorSub.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #93C5FD;");
        scoreBox.getChildren().addAll(lblSkor, lblSkorSub);

        VBox verdictBox = new VBox(6);
        verdictBox.setAlignment(Pos.CENTER_LEFT);

        Label verdictTitle = new Label(nilai >= 75 ? "Kerja Bagus! Penguasaan Materi Baik" : "Perlu Remedial Pada Materi Tertentu");
        verdictTitle.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF;");

        Label verdictDesc = new Label("Algoritma AI telah mencatat data jawaban salah ke dalam Rapor Evaluasi untuk memetakan titik kelemahan belajarmu secara adaptif.");
        verdictDesc.setWrapText(true);
        verdictDesc.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #DBEAFE;");

        verdictBox.getChildren().addAll(verdictTitle, verdictDesc);

        scoreRow.getChildren().addAll(scoreBox, verdictBox);
        banner.getChildren().addAll(topRow, scoreRow);
        return banner;
    }

    private HBox createStatsSummaryRow() {
        int skorBenar = sesi.hitungSkorBenar();
        int total = sesi.getTotalSoal();
        int salah = total - skorBenar;
        int ragu = sesi.hitungJumlahRagu();

        HBox row = new HBox(16);

        row.getChildren().addAll(
                createStatCard(String.valueOf(total), "Total Butir Soal", "#1E293B", "#F8FAFC"),
                createStatCard(String.valueOf(skorBenar), "Jawaban Benar", "#059669", "#ECFDF5"),
                createStatCard(String.valueOf(salah), "Jawaban Salah / Remedial", "#DC2626", "#FEF2F2"),
                createStatCard(String.valueOf(ragu), "Sempat Ditandai Ragu", "#D97706", "#FFFBEB")
        );

        return row;
    }

    private VBox createStatCard(String val, String lbl, String color, String bg) {
        VBox card = new VBox(4);
        card.setPadding(new Insets(14));
        card.setStyle("-fx-background-color: " + bg + "; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");
        HBox.setHgrow(card, Priority.ALWAYS);

        Label v = new Label(val);
        v.setStyle("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: " + color + ";");

        Label l = new Label(lbl);
        l.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #64748B;");

        card.getChildren().addAll(v, l);
        return card;
    }

    private VBox createWrongQuestionsSection() {
        VBox container = new VBox(14);

        Label secTitle = new Label("Pembahasan Soal yang Salah & Kunci Jawaban");
        secTitle.setStyle("-fx-font-size: 15px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label secDesc = new Label("Cermati kembali letak kesalahan dan hafalkan rumus jembatan keledai AI agar tidak terulang pada ujian berikutnya:");
        secDesc.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #64748B;");

        container.getChildren().addAll(secTitle, secDesc);

        List<Soal> wrongQuestions = new ArrayList<>();
        for (Soal s : sesi.getDaftarSoal()) {
            Integer chosenId = sesi.getJawabanMap().get(s.getId());
            if (chosenId == null || !s.cekJawaban(chosenId)) {
                wrongQuestions.add(s);
            }
        }

        if (wrongQuestions.isEmpty()) {
            VBox perfectBox = new VBox(10);
            perfectBox.setAlignment(Pos.CENTER);
            perfectBox.setPadding(new Insets(30));
            perfectBox.setStyle("-fx-background-color: #ECFDF5; -fx-background-radius: 12px; -fx-border-color: #A7F3D0; -fx-border-radius: 12px;");

            Label perfectTitle = new Label("🎉 Sempurna! Seluruh Soal Terjawab dengan Benar");
            perfectTitle.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #065F46;");

            Label perfectSub = new Label("Kamu telah menguasai modul ini secara komprehensif. Lanjutkan ke topik berikutnya!");
            perfectSub.setStyle("-fx-font-size: 11px; -fx-text-fill: #047857;");

            perfectBox.getChildren().addAll(perfectTitle, perfectSub);
            container.getChildren().add(perfectBox);
        } else {
            int num = 1;
            for (Soal s : wrongQuestions) {
                container.getChildren().add(createWrongQuestionCard(num++, s));
            }
        }

        return container;
    }

    private VBox createWrongQuestionCard(int index, Soal s) {
        VBox card = new VBox(10);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");

        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);

        Label numBadge = new Label("Salah #" + index);
        numBadge.setStyle("-fx-background-color: #FEE2E2; -fx-text-fill: #991B1B; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        Label topicLbl = new Label("Topik: " + s.getTopik());
        topicLbl.setStyle("-fx-font-size: 11px; -fx-font-weight: 600; -fx-text-fill: #64748B;");

        top.getChildren().addAll(numBadge, topicLbl);

        Label qPrompt = new Label(s.getPertanyaan());
        qPrompt.setWrapText(true);
        qPrompt.setStyle("-fx-font-size: 13px; -fx-font-weight: 700; -fx-text-fill: #1E293B;");

        // Options comparison
        VBox optionsBox = new VBox(6);
        Integer chosenId = sesi.getJawabanMap().get(s.getId());

        for (OpsiJawaban op : s.getOpsiList()) {
            HBox row = new HBox(8);
            row.setAlignment(Pos.CENTER_LEFT);
            row.setPadding(new Insets(6, 10, 6, 10));

            boolean isChosen = (chosenId != null && chosenId == op.getId());
            boolean isKey = op.isBenar();

            Label label = new Label(op.getLabel() + ". " + op.getTeksOpsi());
            label.setWrapText(true);

            if (isKey) {
                row.setStyle("-fx-background-color: #ECFDF5; -fx-background-radius: 6px; -fx-border-color: #A7F3D0; -fx-border-radius: 6px;");
                label.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 700; -fx-text-fill: #065F46;");
                Label badge = new Label("✓ Kunci Jawaban Benar");
                badge.setStyle("-fx-background-color: #059669; -fx-text-fill: #FFFFFF; -fx-font-size: 9px; -fx-font-weight: 800; -fx-padding: 1 5 1 5; -fx-background-radius: 4px;");
                row.getChildren().addAll(label, badge);
            } else if (isChosen) {
                row.setStyle("-fx-background-color: #FEF2F2; -fx-background-radius: 6px; -fx-border-color: #FECACA; -fx-border-radius: 6px;");
                label.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 700; -fx-text-fill: #991B1B;");
                Label badge = new Label("✗ Jawaban Kamu");
                badge.setStyle("-fx-background-color: #DC2626; -fx-text-fill: #FFFFFF; -fx-font-size: 9px; -fx-font-weight: 800; -fx-padding: 1 5 1 5; -fx-background-radius: 4px;");
                row.getChildren().addAll(label, badge);
            } else {
                label.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #64748B;");
                row.getChildren().add(label);
            }

            optionsBox.getChildren().add(row);
        }

        // Tips AI Box
        VBox tipBox = new VBox(4);
        tipBox.setPadding(new Insets(8, 12, 8, 12));
        tipBox.setStyle("-fx-background-color: #EFF6FF; -fx-background-radius: 8px; -fx-border-color: #BFDBFE; -fx-border-radius: 8px;");

        Label tipTitle = new Label("💡 Tips Adaptif & Jembatan Keledai AI:");
        tipTitle.setStyle("-fx-font-size: 10.5px; -fx-font-weight: 800; -fx-text-fill: #1D4ED8;");

        String tipText = s.getTipsAdaptif() != null ? s.getTipsAdaptif() : "Cermati kata kunci pada pertanyaan dan hubungkan dengan bab materi yang relevan.";
        Label tipContent = new Label(tipText);
        tipContent.setWrapText(true);
        tipContent.setStyle("-fx-font-size: 11px; -fx-text-fill: #1E3A8A;");

        tipBox.getChildren().addAll(tipTitle, tipContent);

        card.getChildren().addAll(top, qPrompt, optionsBox, tipBox);
        return card;
    }

    private HBox createActionBottomBar() {
        HBox bar = new HBox(12);
        bar.setAlignment(Pos.CENTER_RIGHT);
        bar.setPadding(new Insets(10, 0, 10, 0));

        Button btnBack = new Button("Kembali ke Dasbor");
        btnBack.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-size: 11.5px; -fx-font-weight: 700; -fx-background-radius: 8px; -fx-padding: 8 16 8 16; -fx-cursor: hand;");
        btnBack.setOnAction(e -> {
            if (onBackToDashboard != null) onBackToDashboard.run();
        });

        Button btnLagi = new Button("Latihan Mode Lain");
        btnLagi.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-size: 11.5px; -fx-font-weight: 700; -fx-background-radius: 8px; -fx-padding: 8 16 8 16; -fx-cursor: hand;");
        btnLagi.setOnAction(e -> {
            if (onRestartQuiz != null) onRestartQuiz.run();
        });

        Button btnEvaluasi = new Button("Lihat Analisis Rapor & Evaluasi →");
        btnEvaluasi.setStyle("-fx-background-color: #2563EB; -fx-text-fill: #FFFFFF; -fx-font-size: 11.5px; -fx-font-weight: 800; -fx-background-radius: 8px; -fx-padding: 8 18 8 18; -fx-cursor: hand;");
        btnEvaluasi.setOnAction(e -> {
            if (onNavigateToEvaluation != null) onNavigateToEvaluation.run();
        });

        bar.getChildren().addAll(btnBack, btnLagi, btnEvaluasi);
        return bar;
    }
}
