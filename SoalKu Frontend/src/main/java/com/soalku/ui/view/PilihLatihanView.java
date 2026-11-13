package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.ModeLatihan;
import com.soalku.model.Soal;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.util.List;
import java.util.function.BiConsumer;

/**
 * PilihLatihanView - Layar Konfigurasi Sesi Ujian Latihan
 * Sesuai Dokumen Desain Sistem & PRD Section 10 & 11:
 * - Siswa memilih Mode (Acak, Berwaktu, Fokus Kelemahan).
 * - Siswa memilih Jumlah Soal (5, 10, 15).
 * - Validasi: Jika pool soal DISETUJUI kosong, munculkan pesan ramah.
 */
public class PilihLatihanView extends ScrollPane {

    private final BiConsumer<ModeLatihan, Integer> onStartExam;
    private final Runnable onBack;

    private ModeLatihan selectedMode = ModeLatihan.FOKUS_KELEMAHAN;
    private int selectedJumlah = 10;

    private VBox cardAcak;
    private VBox cardBerwaktu;
    private VBox cardKelemahan;

    private Button btn5;
    private Button btn10;
    private Button btn15;

    public PilihLatihanView(BiConsumer<ModeLatihan, Integer> onStartExam, Runnable onBack) {
        this.onStartExam = onStartExam;
        this.onBack = onBack;

        setFitToWidth(true);
        setStyle("-fx-background-color: #F8FAFC; -fx-background: #F8FAFC;");

        VBox content = new VBox(20);
        content.setPadding(new Insets(20, 24, 40, 24));

        content.getChildren().addAll(
                createHeaderBanner(),
                createModeSelectionSection(),
                createJumlahSoalSection(),
                createPoolInfoCard(),
                createStartActionBar()
        );

        setContent(content);
        updateModeCardsStyle();
        updateJumlahButtonsStyle();
    }

    private VBox createHeaderBanner() {
        VBox banner = new VBox(8);
        banner.setPadding(new Insets(20, 24, 20, 24));
        banner.setStyle(
                "-fx-background-color: linear-gradient(to right, #1E3A8A, #2563EB); " +
                "-fx-background-radius: 16px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(37,99,235,0.2), 16, 0, 0, 4);"
        );

        Label tag = new Label("PILIH LATIHAN & CBT ADAPTIF");
        tag.setStyle("-fx-background-color: rgba(255,255,255,0.2); -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        Label title = new Label("Konfigurasi Mode Sesi Belajar");
        title.setStyle("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label desc = new Label("Pilih metode simulasi yang paling sesuai dengan target belajarmu hari ini, kemudian tentukan jumlah butir soal.");
        desc.setStyle("-fx-font-size: 12px; -fx-text-fill: #DBEAFE;");

        banner.getChildren().addAll(tag, title, desc);
        return banner;
    }

    private VBox createModeSelectionSection() {
        VBox sec = new VBox(12);

        Label secTitle = new Label("1. Pilih Strategi Mode Latihan:");
        secTitle.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        HBox cards = new HBox(14);

        cardAcak = createModeCard(
                ModeLatihan.ACAK,
                "Mode Acak",
                "Mengacak seluruh butir soal yang telah disetujui mentor tanpa batas waktu per soal.",
                "refresh",
                "#2563EB",
                "#EFF6FF"
        );

        cardBerwaktu = createModeCard(
                ModeLatihan.BERWAKTU,
                "Mode Berwaktu",
                "Simulasi ujian ketat: batas 30 detik per butir soal. Waktu habis dihitung salah.",
                "clock",
                "#D97706",
                "#FFFBEB"
        );

        cardKelemahan = createModeCard(
                ModeLatihan.FOKUS_KELEMAHAN,
                "Fokus Kelemahan (AI)",
                "Algoritma memprioritaskan soal dari materi dengan persentase salah tertinggi di rapormu.",
                "sparkle",
                "#7C3AED",
                "#F5F3FF"
        );

        cards.getChildren().addAll(cardAcak, cardBerwaktu, cardKelemahan);
        sec.getChildren().addAll(secTitle, cards);
        return sec;
    }

    private VBox createModeCard(ModeLatihan mode, String title, String desc, String icon, String color, String bg) {
        VBox card = new VBox(8);
        card.setPadding(new Insets(16));
        card.setPrefWidth(280);
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px; -fx-cursor: hand;");
        HBox.setHgrow(card, Priority.ALWAYS);

        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);

        StackPane iconBox = new StackPane(Icons.createIcon(icon, color, 0.8));
        iconBox.setPrefSize(32, 32);
        iconBox.setStyle("-fx-background-color: " + bg + "; -fx-background-radius: 8px;");

        Label lblT = new Label(title);
        lblT.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        top.getChildren().addAll(iconBox, lblT);

        Label lblD = new Label(desc);
        lblD.setWrapText(true);
        lblD.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B; -fx-line-spacing: 2px;");

        card.getChildren().addAll(top, lblD);

        card.setOnMouseClicked(e -> {
            selectedMode = mode;
            updateModeCardsStyle();
        });

        return card;
    }

    private void updateModeCardsStyle() {
        resetCardStyle(cardAcak, selectedMode == ModeLatihan.ACAK);
        resetCardStyle(cardBerwaktu, selectedMode == ModeLatihan.BERWAKTU);
        resetCardStyle(cardKelemahan, selectedMode == ModeLatihan.FOKUS_KELEMAHAN);
    }

    private void resetCardStyle(VBox card, boolean isSelected) {
        if (isSelected) {
            card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #2563EB; -fx-border-width: 2; -fx-border-radius: 12px; -fx-cursor: hand; -fx-effect: dropshadow(three-pass-box, rgba(37,99,235,0.15), 10, 0, 0, 3);");
        } else {
            card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-width: 1; -fx-border-radius: 12px; -fx-cursor: hand;");
        }
    }

    private VBox createJumlahSoalSection() {
        VBox sec = new VBox(10);

        Label secTitle = new Label("2. Tentukan Jumlah Butir Soal:");
        secTitle.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        HBox btnRow = new HBox(12);

        btn5 = createJumlahButton(5, "5 Soal (Latihan Cepat)");
        btn10 = createJumlahButton(10, "10 Soal (Standar Rekomendasi)");
        btn15 = createJumlahButton(15, "15 Soal (Simulasi Lengkap)");

        btnRow.getChildren().addAll(btn5, btn10, btn15);
        sec.getChildren().addAll(secTitle, btnRow);
        return sec;
    }

    private Button createJumlahButton(int jumlah, String label) {
        Button btn = new Button(label);
        btn.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #CBD5E1; -fx-border-radius: 8px; -fx-background-radius: 8px; -fx-padding: 10 16 10 16; -fx-font-size: 11.5px; -fx-font-weight: 700; -fx-cursor: hand;");
        btn.setOnAction(e -> {
            selectedJumlah = jumlah;
            updateJumlahButtonsStyle();
        });
        return btn;
    }

    private void updateJumlahButtonsStyle() {
        setBtnJumlahStyle(btn5, selectedJumlah == 5);
        setBtnJumlahStyle(btn10, selectedJumlah == 10);
        setBtnJumlahStyle(btn15, selectedJumlah == 15);
    }

    private void setBtnJumlahStyle(Button btn, boolean selected) {
        if (selected) {
            btn.setStyle("-fx-background-color: #2563EB; -fx-text-fill: #FFFFFF; -fx-background-radius: 8px; -fx-border-color: #2563EB; -fx-border-radius: 8px; -fx-padding: 10 16 10 16; -fx-font-size: 11.5px; -fx-font-weight: 800; -fx-cursor: hand;");
        } else {
            btn.setStyle("-fx-background-color: #FFFFFF; -fx-text-fill: #475569; -fx-background-radius: 8px; -fx-border-color: #CBD5E1; -fx-border-radius: 8px; -fx-padding: 10 16 10 16; -fx-font-size: 11.5px; -fx-font-weight: 700; -fx-cursor: hand;");
        }
    }

    private HBox createPoolInfoCard() {
        HBox box = new HBox(12);
        box.setAlignment(Pos.CENTER_LEFT);
        box.setPadding(new Insets(12, 16, 12, 16));
        box.setStyle("-fx-background-color: #ECFDF5; -fx-background-radius: 10px; -fx-border-color: #A7F3D0; -fx-border-radius: 10px;");

        List<Soal> poolDisetujui = DataRepository.getInstance().getSoalDisetujui();

        javafx.scene.Node icon = Icons.createIcon("check", "#059669", 0.8);
        VBox text = new VBox(2);
        Label t = new Label("Status Bank Soal: " + poolDisetujui.size() + " Butir Soal Terverifikasi & Siap Digunakan");
        t.setStyle("-fx-font-size: 12px; -fx-font-weight: 800; -fx-text-fill: #065F46;");

        Label d = new Label("Hanya butir soal yang telah disetujui Mentor yang dapat masuk ke dalam sesi latihan siswa (Sesuai Asumsi PRD A2).");
        d.setStyle("-fx-font-size: 10.5px; -fx-text-fill: #047857;");

        text.getChildren().addAll(t, d);
        box.getChildren().addAll(icon, text);
        return box;
    }

    private HBox createStartActionBar() {
        HBox bar = new HBox(14);
        bar.setAlignment(Pos.CENTER_RIGHT);
        bar.setPadding(new Insets(10, 0, 10, 0));

        Button btnBatal = new Button("Kembali ke Dasbor");
        btnBatal.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-size: 12px; -fx-font-weight: 700; -fx-background-radius: 8px; -fx-padding: 9 18 9 18; -fx-cursor: hand;");
        btnBatal.setOnAction(e -> {
            if (onBack != null) onBack.run();
        });

        Button btnMulai = new Button("Mulai Sesi Ujian CBT Sekarang →");
        btnMulai.setGraphic(Icons.createIcon("play", "#FFFFFF", 0.75));
        btnMulai.setStyle(
                "-fx-background-color: linear-gradient(to right, #2563EB, #1D4ED8); " +
                "-fx-text-fill: #FFFFFF; " +
                "-fx-font-size: 12px; " +
                "-fx-font-weight: 800; " +
                "-fx-background-radius: 8px; " +
                "-fx-padding: 10 22 10 18; " +
                "-fx-cursor: hand;"
        );

        btnMulai.setOnAction(e -> handleStartExam());

        bar.getChildren().addAll(btnBatal, btnMulai);
        return bar;
    }

    private void handleStartExam() {
        List<Soal> poolDisetujui = DataRepository.getInstance().getSoalDisetujui();

        // Validasi PRD Section 11: Pool soal DISETUJUI kosong
        if (poolDisetujui.isEmpty()) {
            Alert alert = new Alert(Alert.AlertType.WARNING);
            alert.setTitle("Bank Soal Masih Kosong");
            alert.setHeaderText("Belum Ada Soal yang Disetujui Mentor");
            alert.setContentText(
                    "Sesuai aturan PRD, seluruh butir soal latihan siswa harus berasal dari soal yang telah DISETUJUI oleh Mentor.\n\n" +
                    "Silakan hubungi Guru/Mentor Anda untuk menyetujui butir soal pada antrean review, atau generate materi baru terlebih dahulu."
            );
            alert.showAndWait();
            return;
        }

        if (onStartExam != null) {
            onStartExam.accept(selectedMode, selectedJumlah);
        }
    }
}
