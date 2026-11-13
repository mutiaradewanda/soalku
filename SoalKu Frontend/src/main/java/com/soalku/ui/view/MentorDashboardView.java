package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.KodeUndangan;
import com.soalku.model.SiswaBinaan;
import com.soalku.model.Soal;
import com.soalku.model.StatusReview;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Consumer;

/**
 * MentorDashboardView - Dasbor Utama Khusus Peran Guru / Mentor
 * Sesuai spesifikasi Proposal SoalKu PENS 2026:
 * - Dasbor Mentor: antrean review soal dan ringkasan progres seluruh siswa binaan.
 * - Use Case 7: Lihat Progres Siswa
 * - Use Case 6: Buat Kode Undangan Mentor
 * - Use Case 5: Review & Kelola Bank Soal
 */
public class MentorDashboardView extends ScrollPane {

    private final Consumer<String> onNavigate;
    private VBox studentsContainer;
    private VBox reviewQueueContainer;
    private VBox inviteCodesContainer;

    public MentorDashboardView(Consumer<String> onNavigate) {
        this.onNavigate = onNavigate;

        setFitToWidth(true);
        setStyle("-fx-background-color: #F8FAFC; -fx-background: #F8FAFC;");

        VBox content = new VBox(20);
        content.setPadding(new Insets(20, 24, 40, 24));

        content.getChildren().addAll(
                createHeroBanner(),
                createMainGrid()
        );

        setContent(content);
    }

    private VBox createHeroBanner() {
        VBox banner = new VBox(14);
        banner.setPadding(new Insets(20, 24, 20, 24));
        banner.setStyle(
                "-fx-background-color: linear-gradient(to right, #064E3B, #059669, #0D9488); " +
                "-fx-background-radius: 16px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(5,150,105,0.25), 16, 0, 0, 4);"
        );

        // Header tag
        HBox tagBox = new HBox(8);
        tagBox.setAlignment(Pos.CENTER_LEFT);
        Label roleTag = new Label("PORTAL GURU & MENTOR");
        roleTag.setStyle("-fx-background-color: rgba(255,255,255,0.2); -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        Label classTag = new Label("● Bimbingan Kelas 8-A SMP (Tahun Ajaran 2025/2026)");
        classTag.setStyle("-fx-text-fill: #A7F3D0; -fx-font-size: 11px; -fx-font-weight: 600;");
        tagBox.getChildren().addAll(roleTag, classTag);

        // Middle Row: Greeting & Stat Badges
        HBox midRow = new HBox(20);
        midRow.setAlignment(Pos.CENTER_LEFT);

        VBox titleBox = new VBox(4);
        Label greeting = new Label("Halo, Bu Ratna Kumalasari, S.Pd.");
        greeting.setStyle("-fx-font-size: 22px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label desc = new Label("Wali Kelas & Guru IPA Terpadu • Pantau kelemahan materi tiap anak dan setujui bank soal hasil ekstraksi AI.");
        desc.setStyle("-fx-font-size: 12px; -fx-text-fill: #D1FAE5;");
        titleBox.getChildren().addAll(greeting, desc);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Stat 1: Total Siswa Binaan
        VBox stat1 = createHeroStat("32", "Siswa Binaan", "#10B981");
        // Stat 2: Rata-rata Nilai Kelas
        VBox stat2 = createHeroStat("84.4%", "Akurasi Kelas", "rgba(255,255,255,0.18)");
        // Stat 3: Antrean Review Soal AI
        long pendingCount = DataRepository.getInstance().getBankSoal().stream().filter(s -> s.getStatusReview() == StatusReview.MENUNGGU).count();
        VBox stat3 = createHeroStat(String.valueOf(pendingCount), "Menunggu Review", "#F59E0B");

        midRow.getChildren().addAll(titleBox, spacer, stat1, stat2, stat3);

        banner.getChildren().addAll(tagBox, midRow);
        return banner;
    }

    private VBox createHeroStat(String val, String label, String bgStyle) {
        VBox box = new VBox(2);
        box.setAlignment(Pos.CENTER);
        box.setPadding(new Insets(8, 14, 8, 14));
        box.setStyle("-fx-background-color: " + bgStyle + "; -fx-background-radius: 12px; -fx-border-color: rgba(255,255,255,0.25); -fx-border-radius: 12px;");

        Label v = new Label(val);
        v.setStyle("-fx-font-size: 18px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF;");

        Label l = new Label(label);
        l.setStyle("-fx-font-size: 10px; -fx-font-weight: 700; -fx-text-fill: #D1FAE5;");

        box.getChildren().addAll(v, l);
        return box;
    }

    private GridPane createMainGrid() {
        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);

        ColumnConstraints col1 = new ColumnConstraints();
        col1.setPercentWidth(65);
        ColumnConstraints col2 = new ColumnConstraints();
        col2.setPercentWidth(35);
        grid.getColumnConstraints().addAll(col1, col2);

        // LEFT COLUMN: Ringkasan Progres Seluruh Siswa Binaan (Use Case 7)
        VBox leftCol = new VBox(20);
        leftCol.getChildren().addAll(
                createProgresSiswaSection()
        );

        // RIGHT COLUMN: Antrean Review Soal Cepat + Manajemen Kode Undangan (Use Case 5 & 6)
        VBox rightCol = new VBox(20);
        rightCol.getChildren().addAll(
                createQuickReviewSection(),
                createKodeUndanganManagementSection()
        );

        grid.add(leftCol, 0, 0);
        grid.add(rightCol, 1, 0);
        return grid;
    }

    // 1. Progres Siswa Section (Use Case 7)
    private VBox createProgresSiswaSection() {
        VBox section = new VBox(14);
        section.setPadding(new Insets(18));
        section.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        HBox header = new HBox(8);
        header.setAlignment(Pos.CENTER_LEFT);

        Label title = new Label("Ringkasan Progres Seluruh Siswa Binaan");
        title.setStyle("-fx-font-size: 15px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Label badgeKelas = new Label("5 Siswa Terpantau Intensif");
        badgeKelas.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #065F46; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");

        header.getChildren().addAll(Icons.createIcon("dashboard", "#059669", 0.75), title, sp, badgeKelas);

        Label sub = new Label("Sesuai Proposal: Hasil latihan dicatat per bagian materi (tag topik) untuk memantau titik kelemahan tiap siswa.");
        sub.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B;");

        studentsContainer = new VBox(10);
        refreshStudentsList();

        section.getChildren().addAll(header, sub, new Separator(), studentsContainer);
        return section;
    }

    private void refreshStudentsList() {
        studentsContainer.getChildren().clear();
        List<SiswaBinaan> list = DataRepository.getInstance().getSiswaBinaanList();

        for (SiswaBinaan s : list) {
            studentsContainer.getChildren().add(createStudentCard(s));
        }
    }

    private VBox createStudentCard(SiswaBinaan s) {
        VBox card = new VBox(8);
        card.setPadding(new Insets(12, 14, 12, 14));
        card.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 10px; -fx-border-color: #E2E8F0; -fx-border-radius: 10px;");

        HBox top = new HBox(10);
        top.setAlignment(Pos.CENTER_LEFT);

        StackPane av = new StackPane();
        av.setPrefSize(32, 32);
        String avColor = s.getStatusRemedial().equals("Perlu Remedial") ? "#DC2626" :
                         s.getStatusRemedial().equals("Bimbingan") ? "#D97706" : "#059669";
        av.setStyle("-fx-background-color: " + avColor + "; -fx-background-radius: 16px;");
        String initials = s.getNama().substring(0, Math.min(2, s.getNama().length())).toUpperCase();
        Label lblInitials = new Label(initials);
        lblInitials.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: bold;");
        av.getChildren().add(lblInitials);

        VBox nameBox = new VBox(1);
        Label lblName = new Label(s.getNama());
        lblName.setStyle("-fx-font-size: 12px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");
        Label lblKelas = new Label(s.getKelas() + " • " + s.getTotalLatihan() + " Bab Tuntas Dikerjakan");
        lblKelas.setStyle("-fx-font-size: 10px; -fx-text-fill: #64748B;");
        nameBox.getChildren().addAll(lblName, lblKelas);

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        // Status badge
        Label badgeStatus = new Label(s.getStatusRemedial());
        if (s.getStatusRemedial().equals("Perlu Remedial")) {
            badgeStatus.setStyle("-fx-background-color: #FEE2E2; -fx-text-fill: #991B1B; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");
        } else if (s.getStatusRemedial().equals("Bimbingan")) {
            badgeStatus.setStyle("-fx-background-color: #FEF3C7; -fx-text-fill: #92400E; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");
        } else {
            badgeStatus.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #065F46; -fx-font-size: 10px; -fx-font-weight: 800; -fx-padding: 3 8 3 8; -fx-background-radius: 6px;");
        }

        top.getChildren().addAll(av, nameBox, sp, badgeStatus);

        // Progress bar row
        HBox progRow = new HBox(8);
        progRow.setAlignment(Pos.CENTER_LEFT);
        Label lblKelemahan = new Label("Fokus Kelemahan: " + s.getTopikKelemahan());
        lblKelemahan.setStyle("-fx-font-size: 10.5px; -fx-font-weight: 700; -fx-text-fill: #334155;");

        Region pSp = new Region();
        HBox.setHgrow(pSp, Priority.ALWAYS);

        Label lblPct = new Label("Akurasi: " + s.getAkurasiRataRata() + "%");
        lblPct.setStyle("-fx-font-size: 10.5px; -fx-font-weight: 800; -fx-text-fill: #059669;");
        progRow.getChildren().addAll(lblKelemahan, pSp, lblPct);

        ProgressBar pb = new ProgressBar(s.getAkurasiRataRata() / 100.0);
        pb.setMaxWidth(Double.MAX_VALUE);
        pb.setStyle("-fx-accent: " + avColor + ";");

        // Teacher note & action
        HBox noteRow = new HBox(8);
        noteRow.setAlignment(Pos.CENTER_LEFT);
        Label lblNote = new Label("Catatan Guru: “" + s.getCatatanGuru() + "”");
        lblNote.setStyle("-fx-font-size: 10px; -fx-font-style: italic; -fx-text-fill: #64748B;");
        HBox.setHgrow(lblNote, Priority.ALWAYS);

        Button btnEditNote = new Button("Beri Catatan");
        btnEditNote.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #CBD5E1; -fx-border-radius: 6px; -fx-background-radius: 6px; -fx-text-fill: #334155; -fx-font-size: 10px; -fx-font-weight: 700; -fx-padding: 4 8 4 8; -fx-cursor: hand;");
        btnEditNote.setOnAction(e -> bukaDialogCatatan(s));

        noteRow.getChildren().addAll(lblNote, btnEditNote);

        card.getChildren().addAll(top, progRow, pb, noteRow);
        return card;
    }

    private void bukaDialogCatatan(SiswaBinaan s) {
        TextInputDialog dialog = new TextInputDialog(s.getCatatanGuru());
        dialog.setTitle("Beri Catatan Bimbingan");
        dialog.setHeaderText("Catatan Guru untuk " + s.getNama() + " (" + s.getKelas() + ")");
        dialog.setContentText("Pesan motivasi / arahan topik belajar:");

        dialog.showAndWait().ifPresent(pesan -> {
            if (!pesan.isBlank()) {
                DataRepository.getInstance().updateCatatanSiswa(s.getId(), pesan.trim());
                refreshStudentsList();
            }
        });
    }

    // 2. Quick Review Section (Use Case 5)
    private VBox createQuickReviewSection() {
        VBox card = new VBox(12);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        HBox head = new HBox(8);
        head.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label("Antrean Review Soal AI");
        title.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Button btnAll = new Button("Buka Bank Soal ›");
        btnAll.setStyle("-fx-background-color: transparent; -fx-text-fill: #059669; -fx-font-size: 10.5px; -fx-font-weight: 700; -fx-cursor: hand; -fx-padding: 0;");
        btnAll.setOnAction(e -> {
            if (onNavigate != null) onNavigate.accept("bank");
        });

        head.getChildren().addAll(Icons.createIcon("sparkle", "#F59E0B", 0.75), title, sp, btnAll);

        reviewQueueContainer = new VBox(8);
        refreshReviewQueue();

        card.getChildren().addAll(head, reviewQueueContainer);
        return card;
    }

    private void refreshReviewQueue() {
        reviewQueueContainer.getChildren().clear();
        List<Soal> pendingList = DataRepository.getInstance().getSoalMenungguReview();

        if (pendingList.isEmpty()) {
            Label empty = new Label("Semua butir soal AI telah ditinjau!");
            empty.setStyle("-fx-font-size: 11px; -fx-text-fill: #94A3B8; -fx-font-style: italic; -fx-padding: 10 0 10 0;");
            reviewQueueContainer.getChildren().add(empty);
            return;
        }

        for (Soal s : pendingList) {
            VBox item = new VBox(6);
            item.setPadding(new Insets(10));
            item.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 8px; -fx-border-color: #E2E8F0; -fx-border-radius: 8px;");

            Label qTeks = new Label(s.getPertanyaan());
            qTeks.setWrapText(true);
            qTeks.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #1E293B;");

            HBox actions = new HBox(6);
            actions.setAlignment(Pos.CENTER_RIGHT);

            Button btnSetuju = new Button("✓ Setujui");
            btnSetuju.setStyle("-fx-background-color: #059669; -fx-text-fill: #FFFFFF; -fx-font-size: 9.5px; -fx-font-weight: 700; -fx-padding: 4 8 4 8; -fx-background-radius: 4px; -fx-cursor: hand;");
            btnSetuju.setOnAction(e -> {
                DataRepository.getInstance().setujuiSoal(s.getId());
                refreshReviewQueue();
            });

            Button btnTolak = new Button("✕ Tolak");
            btnTolak.setStyle("-fx-background-color: #FEE2E2; -fx-text-fill: #991B1B; -fx-font-size: 9.5px; -fx-font-weight: 700; -fx-padding: 4 8 4 8; -fx-background-radius: 4px; -fx-cursor: hand;");
            btnTolak.setOnAction(e -> {
                DataRepository.getInstance().tolakSoal(s.getId());
                refreshReviewQueue();
            });

            actions.getChildren().addAll(btnTolak, btnSetuju);
            item.getChildren().addAll(qTeks, actions);
            reviewQueueContainer.getChildren().add(item);
        }
    }

    // 3. Manajemen Kode Undangan (Use Case 6)
    private VBox createKodeUndanganManagementSection() {
        VBox card = new VBox(12);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 14px; -fx-border-color: #E2E8F0; -fx-border-radius: 14px;");

        HBox head = new HBox(8);
        head.setAlignment(Pos.CENTER_LEFT);
        Label title = new Label("Manajemen Kode Undangan");
        title.setStyle("-fx-font-size: 13px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Region sp = new Region();
        HBox.setHgrow(sp, Priority.ALWAYS);

        Button btnBuatBaru = new Button("+ Buat Kode");
        btnBuatBaru.setStyle("-fx-background-color: #2563EB; -fx-text-fill: #FFFFFF; -fx-font-size: 10px; -fx-font-weight: 700; -fx-background-radius: 6px; -fx-padding: 4 10 4 10; -fx-cursor: hand;");
        btnBuatBaru.setOnAction(e -> dialogBuatKodeUndangan());

        head.getChildren().addAll(Icons.createIcon("review", "#2563EB", 0.75), title, sp, btnBuatBaru);

        Label desc = new Label("Sesuai PRD: Guru/Mentor mendaftar memakai kode undangan yang diterbitkan oleh Admin atau Guru koordinator.");
        desc.setStyle("-fx-font-size: 10px; -fx-text-fill: #64748B;");

        inviteCodesContainer = new VBox(8);
        refreshInviteCodes();

        card.getChildren().addAll(head, desc, inviteCodesContainer);
        return card;
    }

    private void refreshInviteCodes() {
        inviteCodesContainer.getChildren().clear();
        List<KodeUndangan> list = DataRepository.getInstance().getKodeUndanganList();

        for (KodeUndangan k : list) {
            HBox row = new HBox(8);
            row.setAlignment(Pos.CENTER_LEFT);
            row.setPadding(new Insets(8, 10, 8, 10));
            row.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 8px; -fx-border-color: #CBD5E1; -fx-border-radius: 8px;");

            Label lblCode = new Label(k.getKode());
            lblCode.setStyle("-fx-font-family: monospace; -fx-font-size: 12px; -fx-font-weight: 900; -fx-text-fill: #1E40AF;");

            Region sp = new Region();
            HBox.setHgrow(sp, Priority.ALWAYS);

            Label badgeStatus = new Label(k.getStatus());
            badgeStatus.setStyle("-fx-background-color: #ECFDF5; -fx-text-fill: #065F46; -fx-font-size: 9px; -fx-font-weight: 700; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");

            Button btnSalin = new Button("Salin");
            btnSalin.setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #CBD5E1; -fx-border-radius: 4px; -fx-font-size: 9.5px; -fx-padding: 2 6 2 6; -fx-cursor: hand;");
            btnSalin.setOnAction(e -> {
                Alert a = new Alert(Alert.AlertType.INFORMATION, "Kode '" + k.getKode() + "' berhasil disalin!", ButtonType.OK);
                a.show();
            });

            row.getChildren().addAll(lblCode, sp, badgeStatus, btnSalin);
            inviteCodesContainer.getChildren().add(row);
        }
    }

    private void dialogBuatKodeUndangan() {
        TextInputDialog dialog = new TextInputDialog("GURU-2026-" + (int)(Math.random() * 900 + 100));
        dialog.setTitle("Buat Kode Undangan Mentor Baru");
        dialog.setHeaderText("Terbitkan Kode Undangan Mentor Baru");
        dialog.setContentText("Masukkan teks kode undangan:");

        dialog.showAndWait().ifPresent(kode -> {
            if (!kode.isBlank()) {
                DataRepository.getInstance().tambahKodeUndangan(kode.trim(), LocalDateTime.now().plusMonths(6));
                refreshInviteCodes();
            }
        });
    }
}
