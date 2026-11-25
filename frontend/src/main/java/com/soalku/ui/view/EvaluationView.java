package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.ModeLatihan;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;

import java.util.function.Consumer;

public class EvaluationView extends ScrollPane {

    private final Consumer<ModeLatihan> onLaunchQuizWithMode;

    public EvaluationView(Consumer<ModeLatihan> onLaunchQuizWithMode) {
        this.onLaunchQuizWithMode = onLaunchQuizWithMode;

        setFitToWidth(true);
        setStyle("-fx-background-color: #F8FAFC; -fx-background: #F8FAFC;");

        VBox content = new VBox(20);
        content.setPadding(new Insets(20, 24, 40, 24));

        content.getChildren().addAll(
                createHeaderBanner(),
                createOverviewStats(),
                createWeaknessAnalysisCard(),
                createRemedialRecommendationCard()
        );

        setContent(content);
    }

    private VBox createHeaderBanner() {
        VBox banner = new VBox(8);
        banner.setPadding(new Insets(18, 22, 18, 22));
        banner.setStyle(
                "-fx-background-color: linear-gradient(to right, #0F172A, #1E293B); " +
                "-fx-background-radius: 14px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(0,0,0,0.1), 10, 0, 0, 3);"
        );

        Label tag = new Label("EVALUASI & RAPOR ADAPTIF");
        tag.setStyle("-fx-background-color: rgba(255,255,255,0.15); -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        Label title = new Label("Analisis Titik Kelemahan & Riwayat Belajar Siswa");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label desc = new Label("Algoritma SoalKu mengelompokkan riwayat jawaban salah per bagian materi (tag topik) agar siswa dan guru dapat fokus pada bagian yang paling perlu diulang.");
        desc.setStyle("-fx-font-size: 12px; -fx-text-fill: #94A3B8;");

        banner.getChildren().addAll(tag, title, desc);
        return banner;
    }

    private HBox createOverviewStats() {
        HBox row = new HBox(16);

        row.getChildren().addAll(
                createStatCard("128", "Total Soal Dikerjakan", "#2563EB", "#EFF6FF"),
                createStatCard("82%", "Akurasi Rata-rata", "#059669", "#ECFDF5"),
                createStatCard("2 Topik", "Perlu Remedial", "#DC2626", "#FEF2F2"),
                createStatCard("Level PAS", "Status Kesiapan", "#7C3AED", "#F5F3FF")
        );

        return row;
    }

    private VBox createStatCard(String val, String lbl, String col, String bg) {
        VBox b = new VBox(4);
        b.setPadding(new Insets(14));
        b.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");
        HBox.setHgrow(b, Priority.ALWAYS);

        Label v = new Label(val);
        v.setStyle("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: " + col + ";");

        Label l = new Label(lbl);
        l.setStyle("-fx-font-size: 11px; -fx-font-weight: 600; -fx-text-fill: #64748B;");

        b.getChildren().addAll(v, l);
        return b;
    }

    private VBox createWeaknessAnalysisCard() {
        VBox card = new VBox(14);
        card.setPadding(new Insets(18));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        Label title = new Label("Tingkat Penguasaan Per Tag Topik (Bagian Materi) — Terlemah Dulu");
        title.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        VBox list = new VBox(10);

        // Agregasi persentase benar per bagian materi sesuai query PRD Section 5
        var repo = DataRepository.getInstance();
        java.util.Map<Integer, int[]> statsMap = new java.util.HashMap<>(); // bmId -> [total, benar]

        for (var r : repo.getRiwayatList()) {
            int bmId = r.getBagianMateriId();
            statsMap.putIfAbsent(bmId, new int[]{0, 0});
            statsMap.get(bmId)[0]++;
            if (r.isBenar()) {
                statsMap.get(bmId)[1]++;
            }
        }

        // Urutkan dari persentase benar terendah (terlemah)
        java.util.List<java.util.Map.Entry<Integer, int[]>> sortedStats = new java.util.ArrayList<>(statsMap.entrySet());
        sortedStats.sort((e1, e2) -> {
            double acc1 = e1.getValue()[0] > 0 ? (double) e1.getValue()[1] / e1.getValue()[0] : 0;
            double acc2 = e2.getValue()[0] > 0 ? (double) e2.getValue()[1] / e2.getValue()[0] : 0;
            return Double.compare(acc1, acc2); // Terlemah di atas
        });

        if (sortedStats.isEmpty()) {
            list.getChildren().add(new Label("Belum ada riwayat pengerjaan soal. Selesaikan latihan pertama Anda!"));
        } else {
            for (var entry : sortedStats) {
                int bmId = entry.getKey();
                int total = entry.getValue()[0];
                int benar = entry.getValue()[1];
                double pct = (double) benar / total;
                int pctInt = (int) (pct * 100);

                String judul = repo.getBagianMateriList().stream()
                        .filter(bm -> bm.getId() == bmId)
                        .map(com.soalku.model.BagianMateri::getJudulBagian)
                        .findFirst()
                        .orElse("Bagian Materi #" + bmId);

                String statusLabel;
                String color;
                if (pctInt < 60) {
                    statusLabel = pctInt + "% (Kurang • Butuh Remedial)";
                    color = "#EF4444";
                } else if (pctInt < 80) {
                    statusLabel = pctInt + "% (Cukup • Perlu Penguatan)";
                    color = "#D97706";
                } else {
                    statusLabel = pctInt + "% (Tuntas & Sangat Baik)";
                    color = "#10B981";
                }

                list.getChildren().add(createTopicRow(judul, pct, statusLabel, color));
            }
        }

        card.getChildren().addAll(title, list);
        return card;
    }

    private VBox createTopicRow(String name, double prog, String labelStr, String col) {
        VBox box = new VBox(4);
        HBox header = new HBox(8);
        Label nameLbl = new Label(name);
        nameLbl.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #1E293B;");
        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);
        Label lbl = new Label(labelStr);
        lbl.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: " + col + ";");
        header.getChildren().addAll(nameLbl, sp, lbl);

        ProgressBar bar = new ProgressBar(prog);
        bar.setMaxWidth(Double.MAX_VALUE);
        bar.setStyle("-fx-accent: " + col + ";");

        box.getChildren().addAll(header, bar);
        return box;
    }

    private VBox createRemedialRecommendationCard() {
        VBox card = new VBox(12);
        card.setPadding(new Insets(18));
        card.setStyle("-fx-background-color: #EFF6FF; -fx-background-radius: 14px; -fx-border-color: #BFDBFE; -fx-border-radius: 14px;");

        HBox head = new HBox(8);
        head.setAlignment(Pos.CENTER_LEFT);
        Label t = new Label("Rekomendasi Latihan Adaptif Untuk Kamu");
        t.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #1E3A8A;");
        head.getChildren().addAll(Icons.createIcon("sparkle", "#2563EB", 0.8), t);

        Label desc = new Label("AI mendeteksi kamu sering keliru membedakan bilik kiri (memompa ke seluruh tubuh) dan bilik kanan (ke paru-paru). Sesi latihan adaptif siap dimulai:");
        desc.setStyle("-fx-font-size: 12px; -fx-text-fill: #1E3A8A;");

        Button btnStartRemedial = new Button("Mulai Latihan Fokus Kelemahan Sekarang");
        btnStartRemedial.setGraphic(Icons.createIcon("play", "#FFFFFF", 0.7));
        btnStartRemedial.setStyle("-fx-background-color: #2563EB; -fx-text-fill: #FFFFFF; -fx-font-size: 12px; -fx-font-weight: 800; -fx-background-radius: 8px; -fx-padding: 9 18 9 16; -fx-cursor: hand;");
        btnStartRemedial.setOnAction(e -> {
            if (onLaunchQuizWithMode != null) {
                onLaunchQuizWithMode.accept(ModeLatihan.FOKUS_KELEMAHAN);
            }
        });

        card.getChildren().addAll(head, desc, btnStartRemedial);
        return card;
    }
}
