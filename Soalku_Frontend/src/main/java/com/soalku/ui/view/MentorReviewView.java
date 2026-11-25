package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.Soal;
import com.soalku.model.StatusReview;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.util.List;

public class MentorReviewView extends ScrollPane {

    private VBox questionListContainer;
    private Label lblBadgeMenunggu;
    private StatusReview activeTab = StatusReview.MENUNGGU;

    public MentorReviewView() {
        setFitToWidth(true);
        setStyle("-fx-background-color: #F8FAFC; -fx-background: #F8FAFC;");

        VBox content = new VBox(20);
        content.setPadding(new Insets(20, 24, 40, 24));

        content.getChildren().addAll(
                createHeaderBanner(),
                createKodeUndanganCard(),
                createReviewTabBar(),
                createQuestionListContainer()
        );

        setContent(content);
        refreshQuestions();
    }

    private VBox createHeaderBanner() {
        VBox banner = new VBox(8);
        banner.setPadding(new Insets(18, 22, 18, 22));
        banner.setStyle(
                "-fx-background-color: linear-gradient(to right, #065F46, #059669); " +
                "-fx-background-radius: 14px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(5,150,105,0.2), 10, 0, 0, 3);"
        );

        Label tag = new Label("PORTAL GURU & MENTOR");
        tag.setStyle("-fx-background-color: rgba(255,255,255,0.2); -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        Label title = new Label("Review Soal AI & Manajemen Bank Soal");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label desc = new Label("Sesuai PRD: Seluruh butir soal yang di-generate oleh AI wajib melalui tahap tinjauan mentor sebelum disetujui masuk ke bank soal siswa.");
        desc.setStyle("-fx-font-size: 12px; -fx-text-fill: #D1FAE5;");

        banner.getChildren().addAll(tag, title, desc);
        return banner;
    }

    private HBox createKodeUndanganCard() {
        HBox card = new HBox(16);
        card.setAlignment(Pos.CENTER_LEFT);
        card.setPadding(new Insets(14, 18, 14, 18));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");

        VBox textBox = new VBox(2);
        Label t = new Label("Manajemen Kode Undangan Mentor (Sekali Pakai • Berlaku 7 Hari):");
        t.setStyle("-fx-font-size: 12px; -fx-font-weight: 700; -fx-text-fill: #0F172A;");
        Label d = new Label("Sesuai PRD Asumsi A3: Kode sekali pakai berlaku 7 hari untuk mengundang rekan guru baru.");
        d.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");
        textBox.getChildren().addAll(t, d);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button btnBuatKode = new Button("+ Buat Kode Baru");
        btnBuatKode.setStyle("-fx-background-color: #059669; -fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 7 14 7 14; -fx-cursor: hand;");
        btnBuatKode.setOnAction(e -> handleBuatKodeBaru());

        Button btnLihatKode = new Button("Lihat Daftar Kode");
        btnLihatKode.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-size: 11px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 7 14 7 14; -fx-cursor: hand;");
        btnLihatKode.setOnAction(e -> handleLihatDaftarKode());

        card.getChildren().addAll(textBox, spacer, btnBuatKode, btnLihatKode);
        return card;
    }

    private void handleBuatKodeBaru() {
        String randomSuffix = String.format("%04d", (int) (Math.random() * 9000) + 1000);
        String newKode = "GURU-SMP-" + randomSuffix;
        java.time.LocalDateTime expired = java.time.LocalDateTime.now().plusDays(7);

        DataRepository.getInstance().tambahKodeUndangan(newKode, expired);

        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Kode Undangan Berhasil Dibuat");
        alert.setHeaderText("Kode Undangan Baru: " + newKode);
        alert.setContentText(
                "• Kode: " + newKode + "\n" +
                "• Masa Berlaku: 7 Hari (sampai " + expired.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")) + ")\n" +
                "• Status: AKTIF (Sekali Pakai)\n\n" +
                "Bagikan kode ini kepada rekan guru/mentor untuk mendaftar di Tab Mentor pada halaman Login."
        );
        alert.showAndWait();
    }

    private void handleLihatDaftarKode() {
        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Daftar Kode Undangan Mentor");
        dialog.setHeaderText("Riwayat Kode Undangan & Status Kedaluwarsa");

        DialogPane pane = dialog.getDialogPane();
        pane.getButtonTypes().add(ButtonType.CLOSE);

        VBox list = new VBox(8);
        list.setPadding(new Insets(10));
        list.setPrefWidth(480);

        for (var k : DataRepository.getInstance().getKodeUndanganList()) {
            HBox row = new HBox(12);
            row.setAlignment(Pos.CENTER_LEFT);
            row.setPadding(new Insets(8, 12, 8, 12));
            row.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 6px; -fx-border-color: #E2E8F0; -fx-border-radius: 6px;");

            Label kodeLbl = new Label(k.getKode());
            kodeLbl.setStyle("-fx-font-family: monospace; -fx-font-weight: 900; -fx-font-size: 13px; -fx-text-fill: #1E40AF;");

            Region sp = new Region();
            HBox.setHgrow(sp, Priority.ALWAYS);

            Label expLbl = new Label("Exp: " + k.getExpiredAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            expLbl.setStyle("-fx-font-size: 10.5px; -fx-text-fill: #64748B;");

            Label statusLbl = new Label(k.getStatus());
            statusLbl.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #065F46; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

            row.getChildren().addAll(kodeLbl, sp, expLbl, statusLbl);
            list.getChildren().add(row);
        }

        pane.setContent(new ScrollPane(list));
        dialog.showAndWait();
    }

    private HBox createReviewTabBar() {
        HBox bar = new HBox(10);
        bar.setAlignment(Pos.CENTER_LEFT);

        Button tabMenunggu = new Button("Menunggu Review (2)");
        tabMenunggu.setStyle("-fx-background-color: #2563EB; -fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: 700; -fx-padding: 7 14 7 14; -fx-background-radius: 20px; -fx-cursor: hand;");
        tabMenunggu.setOnAction(e -> {
            activeTab = StatusReview.MENUNGGU;
            refreshQuestions();
        });

        Button tabDisetujui = new Button("Disetujui di Bank Soal");
        tabDisetujui.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-size: 11px; -fx-font-weight: 600; -fx-padding: 7 14 7 14; -fx-background-radius: 20px; -fx-cursor: hand;");
        tabDisetujui.setOnAction(e -> {
            activeTab = StatusReview.DISETUJUI;
            refreshQuestions();
        });

        Button tabDitolak = new Button("Ditolak");
        tabDitolak.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-size: 11px; -fx-font-weight: 600; -fx-padding: 7 14 7 14; -fx-background-radius: 20px; -fx-cursor: hand;");
        tabDitolak.setOnAction(e -> {
            activeTab = StatusReview.DITOLAK;
            refreshQuestions();
        });

        bar.getChildren().addAll(tabMenunggu, tabDisetujui, tabDitolak);
        return bar;
    }

    private VBox createQuestionListContainer() {
        questionListContainer = new VBox(12);
        return questionListContainer;
    }

    private void refreshQuestions() {
        questionListContainer.getChildren().clear();

        List<Soal> list = DataRepository.getInstance().getBankSoal().stream()
                .filter(s -> s.getStatusReview() == activeTab)
                .toList();

        if (list.isEmpty()) {
            Label empty = new Label("Tidak ada soal pada status ini.");
            empty.setStyle("-fx-font-size: 12px; -fx-text-fill: #94A3B8; -fx-font-style: italic; -fx-padding: 20;");
            questionListContainer.getChildren().add(empty);
            return;
        }

        for (Soal s : list) {
            questionListContainer.getChildren().add(createQuestionReviewCard(s));
        }
    }

    private VBox createQuestionReviewCard(Soal s) {
        VBox card = new VBox(10);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");

        HBox top = new HBox(8);
        top.setAlignment(Pos.CENTER_LEFT);

        Label tagTingkat = new Label(s.getTingkat().name() + " (" + s.getMaksimalOpsi() + " Opsi)");
        tagTingkat.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #2563EB; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        Label tagTopik = new Label("Topik: " + s.getTopik());
        tagTopik.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Label tagDiff = new Label(s.getTingkatKesulitan().getLabel());
        tagDiff.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #475569; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

        top.getChildren().addAll(tagTingkat, tagTopik, sp, tagDiff);

        Label prompt = new Label(s.getPertanyaan());
        prompt.setWrapText(true);
        prompt.setStyle("-fx-font-size: 13px; -fx-font-weight: 700; -fx-text-fill: #0F172A;");

        VBox opsBox = new VBox(4);
        for (var op : s.getOpsiList()) {
            HBox opRow = new HBox(6);
            opRow.setAlignment(Pos.CENTER_LEFT);
            Label lbl = new Label(op.getLabel() + ". " + op.getTeksOpsi());
            if (op.isBenar()) {
                lbl.setStyle("-fx-font-size: 11.5px; -fx-font-weight: 700; -fx-text-fill: #059669;");
                Label badge = new Label("Kunci Jawaban");
                badge.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #065F46; -fx-font-size: 9px; -fx-font-weight: 700; -fx-padding: 1 5 1 5; -fx-background-radius: 4px;");
                opRow.getChildren().addAll(lbl, badge);
            } else {
                lbl.setStyle("-fx-font-size: 11.5px; -fx-text-fill: #475569;");
                opRow.getChildren().add(lbl);
            }
            opsBox.getChildren().add(opRow);
        }

        // Action Buttons if MENUNGGU
        HBox actions = new HBox(10);
        actions.setAlignment(Pos.CENTER_RIGHT);

        if (s.getStatusReview() == StatusReview.MENUNGGU) {
            Button btnTolak = new Button("Tolak Soal");
            btnTolak.setStyle("-fx-background-color: #FEE2E2; -fx-text-fill: #991B1B; -fx-font-size: 11px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 6 12 6 12; -fx-cursor: hand;");
            btnTolak.setOnAction(e -> {
                DataRepository.getInstance().tolakSoal(s.getId());
                refreshQuestions();
            });

            Button btnEdit = new Button("✏ Edit Soal");
            btnEdit.setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1D4ED8; -fx-font-size: 11px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 6 12 6 12; -fx-cursor: hand;");
            btnEdit.setOnAction(e -> bukaDialogEditSoal(s));

            Button btnSetuju = new Button("✓ Setujui Masuk Bank Soal");
            btnSetuju.setStyle("-fx-background-color: #059669; -fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 6 14 6 14; -fx-cursor: hand;");
            btnSetuju.setOnAction(e -> {
                DataRepository.getInstance().setujuiSoal(s.getId());
                refreshQuestions();
            });

            actions.getChildren().addAll(btnTolak, btnEdit, btnSetuju);
            card.getChildren().addAll(top, prompt, opsBox, new Separator(), actions);
        } else {
            Label statusBadge = new Label("Status: " + s.getStatusReview().name());
            statusBadge.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #059669;");

            Button btnEdit = new Button("✏ Edit");
            btnEdit.setStyle("-fx-background-color: #F1F5F9; -fx-text-fill: #334155; -fx-font-size: 10px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 4 10 4 10; -fx-cursor: hand;");
            btnEdit.setOnAction(e -> bukaDialogEditSoal(s));

            actions.getChildren().addAll(statusBadge, btnEdit);
            card.getChildren().addAll(top, prompt, opsBox, actions);
        }

        return card;
    }

    private void bukaDialogEditSoal(Soal s) {
        Dialog<Boolean> dialog = new Dialog<>();
        dialog.setTitle("Edit Butir Soal AI - Bank Soal SoalKu");
        dialog.setHeaderText("Sesuaikan Pertanyaan, Opsi Jawaban, dan Kunci sebelum Disimpan");

        DialogPane pane = dialog.getDialogPane();
        pane.getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        VBox form = new VBox(10);
        form.setPadding(new Insets(10));
        form.setPrefWidth(500);

        Label lblP = new Label("Pertanyaan:");
        lblP.setStyle("-fx-font-weight: bold; -fx-font-size: 11px;");
        TextArea txtPertanyaan = new TextArea(s.getPertanyaan());
        txtPertanyaan.setWrapText(true);
        txtPertanyaan.setPrefRowCount(3);

        VBox opsBox = new VBox(6);
        Label lblO = new Label("Pilihan Opsi Jawaban:");
        lblO.setStyle("-fx-font-weight: bold; -fx-font-size: 11px;");
        opsBox.getChildren().add(lblO);

        java.util.List<TextField> txtOpsiList = new java.util.ArrayList<>();
        int currentKunciIdx = 0;
        for (int i = 0; i < s.getOpsiList().size(); i++) {
            var op = s.getOpsiList().get(i);
            if (op.isBenar()) currentKunciIdx = i;
            HBox row = new HBox(8);
            row.setAlignment(Pos.CENTER_LEFT);
            Label letter = new Label(op.getLabel() + ":");
            letter.setStyle("-fx-font-weight: bold; -fx-min-width: 20px;");
            TextField tf = new TextField(op.getTeksOpsi());
            HBox.setHgrow(tf, Priority.ALWAYS);
            txtOpsiList.add(tf);
            row.getChildren().addAll(letter, tf);
            opsBox.getChildren().add(row);
        }

        HBox kunciRow = new HBox(10);
        kunciRow.setAlignment(Pos.CENTER_LEFT);
        Label lblKunci = new Label("Kunci Jawaban Benar:");
        lblKunci.setStyle("-fx-font-weight: bold; -fx-font-size: 11px;");

        ComboBox<String> cbKunci = new ComboBox<>();
        for (int i = 0; i < s.getOpsiList().size(); i++) {
            cbKunci.getItems().add(s.getOpsiList().get(i).getLabel());
        }
        if (currentKunciIdx < cbKunci.getItems().size()) {
            cbKunci.setValue(cbKunci.getItems().get(currentKunciIdx));
        }
        kunciRow.getChildren().addAll(lblKunci, cbKunci);

        Label lblImg = new Label("Tautkan Gambar Referensi Materi (Opsional):");
        lblImg.setStyle("-fx-font-weight: bold; -fx-font-size: 11px;");
        ComboBox<String> cbGambar = new ComboBox<>();
        cbGambar.getItems().addAll("Tidak Ada Gambar", "Diagram Organ Pencernaan Manusia (#IMG-01)", "Skema Anatomi Jantung & Aorta (#IMG-02)");
        if (s.getGambarId() != null && s.getGambarId() == 1) {
            cbGambar.setValue("Diagram Organ Pencernaan Manusia (#IMG-01)");
        } else if (s.getGambarId() != null && s.getGambarId() == 2) {
            cbGambar.setValue("Skema Anatomi Jantung & Aorta (#IMG-02)");
        } else {
            cbGambar.setValue("Tidak Ada Gambar");
        }

        Label lblT = new Label("Tips Adaptif / Jembatan Keledai AI:");
        lblT.setStyle("-fx-font-weight: bold; -fx-font-size: 11px;");
        TextField txtTips = new TextField(s.getTipsAdaptif() != null ? s.getTipsAdaptif() : "");

        form.getChildren().addAll(lblP, txtPertanyaan, lblImg, cbGambar, opsBox, kunciRow, lblT, txtTips);
        pane.setContent(form);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                java.util.List<String> newOpts = new java.util.ArrayList<>();
                for (TextField tf : txtOpsiList) {
                    newOpts.add(tf.getText().trim());
                }
                int selectedKunci = Math.max(0, cbKunci.getSelectionModel().getSelectedIndex());
                DataRepository.getInstance().editSoal(
                        s.getId(),
                        txtPertanyaan.getText().trim(),
                        newOpts,
                        selectedKunci,
                        txtTips.getText().trim()
                );
                int imgChoice = cbGambar.getSelectionModel().getSelectedIndex();
                if (imgChoice == 1) {
                    s.setGambarId(1);
                    s.setGambarPath("/images/digestive.png");
                } else if (imgChoice == 2) {
                    s.setGambarId(2);
                    s.setGambarPath("/images/heart.png");
                } else {
                    s.setGambarId(null);
                    s.setGambarPath(null);
                }
                return true;
            }
            return false;
        });

        dialog.showAndWait().ifPresent(saved -> {
            if (saved) refreshQuestions();
        });
    }
}
