package com.soalku.ui.view;

import com.soalku.database.DataRepository;
import com.soalku.model.Pengguna;
import com.soalku.model.Role;
import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.util.function.Consumer;

/**
 * LoginView - Layar Autentikasi Terpadu SoalKu
 * Dilengkapi Modal Awal Pemilihan Peran (Role Selection) sesuai referensi portal terpadu:
 * 1. Modal Pemilihan Peran (Siswa SD, Siswa SMP, Guru)
 * 2. Form Autentikasi Dinamis (Login / Register) per Role
 */
public class LoginView extends StackPane {

    private final Consumer<Pengguna> onLoginSuccess;
    private Role selectedRole = Role.SISWA_SD;
    private boolean isRegisterMode = false;
    private boolean isShowingRoleSelection = true;

    // Root Container
    private StackPane modalOverlay;

    // Form inputs
    private TextField txtIdentifier;      // Untuk login (NISN / Email / NIP)
    private TextField txtNama;            // Nama Lengkap / beserta Gelar
    private TextField txtNisn;            // NISN Siswa
    private ComboBox<String> cbKelas;     // Dropdown Kelas (1-6 SD / 7-9 SMP)
    private TextField txtOrangTua;        // Nama Orang Tua (SD)
    private TextField txtKontak;          // Email/No HP (SMP)
    private TextField txtNip;             // NIP/NUPTK (Guru)
    private TextField txtMapel;           // Mata Pelajaran (Guru)
    private TextField txtEmail;           // Email resmi (Guru)
    private PasswordField txtPassword;    // Kata Sandi

    private VBox formContainer;
    private Label lblError;
    private Button btnSubmit;
    private Button btnSwitchMode;
    private Button btnDemoAccount;

    public LoginView(Consumer<Pengguna> onLoginSuccess) {
        this.onLoginSuccess = onLoginSuccess;
        initUI();
    }

    private void initUI() {
        setAlignment(Pos.CENTER);
        setStyle("-fx-background-color: linear-gradient(to bottom right, #0F172A, #1E3A8A, #0284C7);");
        setPadding(new Insets(20));

        modalOverlay = new StackPane();
        modalOverlay.setAlignment(Pos.CENTER);
        getChildren().add(modalOverlay);

        // Langkah awal: Tampilkan modal pemilihan role terlebih dahulu
        showRoleSelectionModal();
    }

    /**
     * MODAL PEMILIHAN PERAN (ROLE SELECTION)
     * Persis dengan desain kartu portal terpadu pada gambar referensi.
     */
    public void showRoleSelectionModal() {
        this.isShowingRoleSelection = true;
        modalOverlay.getChildren().clear();

        VBox card = new VBox(0);
        card.setMaxWidth(440);
        card.setMaxHeight(Region.USE_PREF_SIZE);
        card.setStyle(
                "-fx-background-color: #FFFFFF; " +
                "-fx-background-radius: 28px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(0,0,0,0.45), 36, 0, 0, 14);"
        );

        // 1. Header Modal/Card (Biru Gelap Navy/Indigo, Avatar, Judul, Tombol X)
        HBox header = new HBox(12);
        header.setAlignment(Pos.CENTER_LEFT);
        header.setPadding(new Insets(22, 24, 22, 24));
        header.setStyle(
                "-fx-background-color: #131B31; " +
                "-fx-background-radius: 28px 28px 0 0;"
        );

        // Ikon Avatar Bulat di Kiri
        StackPane avatarBox = new StackPane(Icons.createIcon("avatar", "#38BDF8", 0.95));
        avatarBox.setPrefSize(42, 42);
        avatarBox.setStyle(
                "-fx-background-color: rgba(14, 165, 233, 0.18); " +
                "-fx-border-color: rgba(56, 189, 248, 0.45); " +
                "-fx-border-radius: 12px; " +
                "-fx-background-radius: 12px;"
        );

        // Judul & Subtitle
        VBox titleBox = new VBox(2);
        Label lblHeaderTitle = new Label("Portal Akses Masuk");
        lblHeaderTitle.setStyle("-fx-font-size: 16px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label lblHeaderSub = new Label("Sistem Autentikasi Pengguna");
        lblHeaderSub.setStyle("-fx-font-size: 11px; -fx-text-fill: #94A3B8;");
        titleBox.getChildren().addAll(lblHeaderTitle, lblHeaderSub);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Tombol Close (X) di Sudut Kanan Atas
        Button btnClose = new Button();
        btnClose.setGraphic(Icons.createIcon("close", "#FFFFFF", 0.8));
        btnClose.setPrefSize(32, 32);
        btnClose.setStyle(
                "-fx-background-color: rgba(255, 255, 255, 0.14); " +
                "-fx-background-radius: 50%; " +
                "-fx-cursor: hand;"
        );
        btnClose.setOnMouseEntered(e -> btnClose.setStyle("-fx-background-color: rgba(255, 255, 255, 0.28); -fx-background-radius: 50%; -fx-cursor: hand;"));
        btnClose.setOnMouseExited(e -> btnClose.setStyle("-fx-background-color: rgba(255, 255, 255, 0.14); -fx-background-radius: 50%; -fx-cursor: hand;"));
        btnClose.setOnAction(e -> {
            // Default ke SD jika ditutup
            selectRoleAndOpenAuth(Role.SISWA_SD);
        });

        header.getChildren().addAll(avatarBox, titleBox, spacer, btnClose);

        // 2. Body Modal/Card
        VBox body = new VBox(14);
        body.setPadding(new Insets(26, 26, 28, 26));

        VBox promptBox = new VBox(3);
        Label lblBodyTitle = new Label("Pilih Akses Masuk Portal");
        lblBodyTitle.setStyle("-fx-font-size: 17px; -fx-font-weight: 900; -fx-text-fill: #0F172A; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label lblBodySub = new Label("Silakan pilih jenis portal akun Anda:");
        lblBodySub.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748B;");
        promptBox.getChildren().addAll(lblBodyTitle, lblBodySub);

        // 3. List 3 Pilihan Role (Card Vertikal)
        VBox optionsList = new VBox(12);

        // Opsi 1: Siswa SD (Aksen Biru/Oranye)
        HBox cardSD = createRoleOptionCard(
                "Siswa SD",
                "school",
                "#0284C7",
                "#E0F2FE",
                "#BAE6FD",
                () -> selectRoleAndOpenAuth(Role.SISWA_SD)
        );

        // Opsi 2: Siswa SMP (Aksen Hijau/Biru Muda)
        HBox cardSMP = createRoleOptionCard(
                "Siswa SMP",
                "book",
                "#16A34A",
                "#DCFCE7",
                "#BBF7D0",
                () -> selectRoleAndOpenAuth(Role.SISWA_SMP)
        );

        // Opsi 3: Guru (Aksen Merah/Ungu/Rose)
        HBox cardGuru = createRoleOptionCard(
                "Guru",
                "shield",
                "#E11D48",
                "#FFE4E6",
                "#FECDD3",
                () -> selectRoleAndOpenAuth(Role.GURU)
        );

        optionsList.getChildren().addAll(cardSD, cardSMP, cardGuru);
        body.getChildren().addAll(promptBox, optionsList);

        card.getChildren().addAll(header, body);
        modalOverlay.getChildren().add(card);
    }

    private HBox createRoleOptionCard(
            String title,
            String iconType,
            String iconColor,
            String iconBg,
            String iconBorder,
            Runnable onClick
    ) {
        HBox box = new HBox(14);
        box.setAlignment(Pos.CENTER_LEFT);
        box.setPadding(new Insets(14, 18, 14, 18));

        String normalStyle =
                "-fx-background-color: #FFFFFF; " +
                "-fx-border-color: #E2E8F0; " +
                "-fx-border-width: 1.5px; " +
                "-fx-border-radius: 18px; " +
                "-fx-background-radius: 18px; " +
                "-fx-cursor: hand;";

        String hoverStyle =
                "-fx-background-color: #F8FAFC; " +
                "-fx-border-color: " + iconColor + "; " +
                "-fx-border-width: 1.5px; " +
                "-fx-border-radius: 18px; " +
                "-fx-background-radius: 18px; " +
                "-fx-cursor: hand; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(0,0,0,0.08), 12, 0, 0, 4);";

        box.setStyle(normalStyle);
        box.setOnMouseEntered(e -> box.setStyle(hoverStyle));
        box.setOnMouseExited(e -> box.setStyle(normalStyle));
        box.setOnMouseClicked(e -> onClick.run());

        // Ikon Berbingkai Bulat di Kiri
        StackPane iconPane = new StackPane(Icons.createIcon(iconType, iconColor, 0.95));
        iconPane.setPrefSize(44, 44);
        iconPane.setStyle(
                "-fx-background-color: " + iconBg + "; " +
                "-fx-border-color: " + iconBorder + "; " +
                "-fx-border-radius: 14px; " +
                "-fx-background-radius: 14px;"
        );

        // Teks Tebal di Tengah
        Label lblTitle = new Label(title);
        lblTitle.setStyle("-fx-font-size: 14px; -fx-font-weight: 800; -fx-text-fill: #1E293B; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Panah Chevron Kanan (>)
        StackPane chevron = new StackPane(Icons.createIcon("chevron-right", "#94A3B8", 0.9));

        box.getChildren().addAll(iconPane, lblTitle, spacer, chevron);
        return box;
    }

    /**
     * Alur: Saat role dipilih, simpan role dan buka form Login/Register terkait
     */
    public void selectRoleAndOpenAuth(Role role) {
        this.selectedRole = role;
        this.isShowingRoleSelection = false;
        showAuthForm();
    }

    /**
     * FORM LOGIN / REGISTRASI UNTUK ROLE TERPILIH
     */
    private void showAuthForm() {
        modalOverlay.getChildren().clear();

        VBox card = new VBox(0);
        card.setMaxWidth(480);
        card.setMaxHeight(Region.USE_PREF_SIZE);
        card.setStyle(
                "-fx-background-color: #FFFFFF; " +
                "-fx-background-radius: 28px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(0,0,0,0.4), 36, 0, 0, 14);"
        );

        // Header Form Tematik sesuai Role
        HBox cardHeader = new HBox(12);
        cardHeader.setAlignment(Pos.CENTER_LEFT);
        cardHeader.setPadding(new Insets(20, 24, 20, 24));

        String headerGradient;
        String roleBadgeText;
        String themeColor;

        if (selectedRole == Role.SISWA_SD) {
            headerGradient = "linear-gradient(to right, #0284C7, #0EA5E9, #F59E0B)";
            roleBadgeText = "PORTAL SISWA SD";
            themeColor = "#0284C7";
        } else if (selectedRole == Role.SISWA_SMP) {
            headerGradient = "linear-gradient(to right, #1E3A8A, #2563EB, #06B6D4)";
            roleBadgeText = "PORTAL SISWA SMP";
            themeColor = "#2563EB";
        } else {
            headerGradient = "linear-gradient(to right, #0F172A, #1E293B, #059669)";
            roleBadgeText = "PORTAL GURU";
            themeColor = "#059669";
        }

        cardHeader.setStyle(
                "-fx-background-color: " + headerGradient + "; " +
                "-fx-background-radius: 28px 28px 0 0;"
        );

        VBox headerTitles = new VBox(2);
        Label lblAppTitle = new Label("SoalKu - Adaptive AI Learning");
        lblAppTitle.setStyle("-fx-font-size: 16px; -fx-font-weight: 900; -fx-text-fill: #FFFFFF; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label lblBadge = new Label(roleBadgeText);
        lblBadge.setStyle("-fx-font-size: 10px; -fx-font-weight: 800; -fx-text-fill: #E0F2FE; -fx-background-color: rgba(255,255,255,0.2); -fx-background-radius: 12px; -fx-padding: 2 8 2 8;");
        headerTitles.getChildren().addAll(lblAppTitle, lblBadge);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Tombol Kembali / Ganti Peran
        Button btnBackToRoles = new Button("← Ganti Peran");
        btnBackToRoles.setStyle(
                "-fx-background-color: rgba(255,255,255,0.2); " +
                "-fx-text-fill: #FFFFFF; " +
                "-fx-font-size: 11px; " +
                "-fx-font-weight: 800; " +
                "-fx-background-radius: 10px; " +
                "-fx-padding: 6 12 6 12; " +
                "-fx-cursor: hand;"
        );
        btnBackToRoles.setOnAction(e -> showRoleSelectionModal());

        cardHeader.getChildren().addAll(headerTitles, spacer, btnBackToRoles);

        // Form Body
        VBox cardBody = new VBox(12);
        cardBody.setPadding(new Insets(18, 28, 24, 28));

        lblError = new Label();
        lblError.setVisible(false);
        lblError.setManaged(false);
        lblError.setWrapText(true);
        lblError.setStyle("-fx-text-fill: #DC2626; -fx-font-size: 11px; -fx-font-weight: 700; -fx-padding: 8 12 8 12; -fx-background-color: #FEF2F2; -fx-background-radius: 8px; -fx-border-color: #FECACA; -fx-border-radius: 8px;");

        formContainer = new VBox(10);

        // Kontrol input
        txtIdentifier = new TextField();
        txtNama = new TextField();
        txtNisn = new TextField();
        cbKelas = new ComboBox<>();
        cbKelas.setMaxWidth(Double.MAX_VALUE);
        txtOrangTua = new TextField();
        txtKontak = new TextField();
        txtNip = new TextField();
        txtMapel = new TextField();
        txtEmail = new TextField();
        txtPassword = new PasswordField();

        btnSubmit = new Button();
        btnSubmit.setMaxWidth(Double.MAX_VALUE);
        btnSubmit.setPrefHeight(42);
        btnSubmit.setStyle("-fx-background-color: " + themeColor + "; -fx-text-fill: #FFFFFF; -fx-font-size: 13px; -fx-font-weight: 800; -fx-background-radius: 10px; -fx-cursor: hand;");
        btnSubmit.setOnAction(e -> handleSubmit());

        btnDemoAccount = new Button();
        btnDemoAccount.setMaxWidth(Double.MAX_VALUE);
        btnDemoAccount.setStyle("-fx-background-color: #FEF3C7; -fx-border-color: #FDE68A; -fx-border-radius: 8px; -fx-text-fill: #92400E; -fx-font-size: 11px; -fx-font-weight: 800; -fx-background-radius: 8px; -fx-padding: 8; -fx-cursor: hand;");
        btnDemoAccount.setOnAction(e -> handleFastDemoLogin());

        HBox switchRow = new HBox(6);
        switchRow.setAlignment(Pos.CENTER);
        btnSwitchMode = new Button();
        btnSwitchMode.setStyle("-fx-background-color: transparent; -fx-text-fill: " + themeColor + "; -fx-font-size: 12px; -fx-font-weight: 700; -fx-cursor: hand; -fx-underline: true;");
        btnSwitchMode.setOnAction(e -> {
            isRegisterMode = !isRegisterMode;
            lblError.setVisible(false);
            lblError.setManaged(false);
            renderFormContent();
        });
        switchRow.getChildren().add(btnSwitchMode);

        cardBody.getChildren().addAll(lblError, formContainer, btnSubmit, btnDemoAccount, switchRow);

        card.getChildren().addAll(cardHeader, cardBody);
        modalOverlay.getChildren().add(card);

        renderFormContent();
    }

    private void renderFormContent() {
        formContainer.getChildren().clear();

        if (isRegisterMode) {
            btnDemoAccount.setVisible(false);
            btnDemoAccount.setManaged(false);

            if (selectedRole == Role.SISWA_SD) {
                btnSubmit.setText("Daftar Akun Siswa SD");
                btnSwitchMode.setText("Sudah punya akun Siswa SD? Masuk di sini");

                txtNama.setPromptText("Nama lengkap adik siswa");
                txtNisn.setPromptText("10 Digit Nomor Induk Siswa Nasional");
                txtOrangTua.setPromptText("Nama ayah / ibu / wali siswa");

                cbKelas.getItems().setAll("Kelas 1 SD", "Kelas 2 SD", "Kelas 3 SD", "Kelas 4 SD", "Kelas 5 SD", "Kelas 6 SD");
                if (cbKelas.getValue() == null || !cbKelas.getValue().contains("SD")) {
                    cbKelas.setValue("Kelas 4 SD");
                }

                formContainer.getChildren().addAll(
                        createFieldGroup("Nama Lengkap Siswa:", txtNama),
                        createFieldGroup("NISN / ID Siswa SD:", txtNisn),
                        createFieldGroup("Pilihan Kelas (1 - 6):", cbKelas),
                        createFieldGroup("Nama Orang Tua / Wali:", txtOrangTua)
                );
            } else if (selectedRole == Role.SISWA_SMP) {
                btnSubmit.setText("Daftar Akun Siswa SMP");
                btnSwitchMode.setText("Sudah punya akun Siswa SMP? Masuk di sini");

                txtNama.setPromptText("Nama lengkap kamu");
                txtNisn.setPromptText("10 Digit Nomor Induk Siswa Nasional");
                txtKontak.setPromptText("Email atau No. HP aktif");

                cbKelas.getItems().setAll("Kelas 7 SMP", "Kelas 8 SMP", "Kelas 9 SMP");
                if (cbKelas.getValue() == null || !cbKelas.getValue().contains("SMP")) {
                    cbKelas.setValue("Kelas 8 SMP");
                }

                formContainer.getChildren().addAll(
                        createFieldGroup("Nama Lengkap Siswa:", txtNama),
                        createFieldGroup("NISN Siswa SMP:", txtNisn),
                        createFieldGroup("Pilihan Kelas (7 - 9):", cbKelas),
                        createFieldGroup("Email Aktif / No. HP:", txtKontak)
                );
            } else {
                btnSubmit.setText("Daftar Akun Guru");
                btnSwitchMode.setText("Sudah punya akun Guru? Masuk di sini");

                txtNama.setPromptText("Contoh: Ratna Kumalasari, S.Pd., M.Si.");
                txtNip.setPromptText("Nomor Induk Pendidik / NUPTK");
                txtMapel.setPromptText("Contoh: IPA Terpadu, Matematika");
                txtEmail.setPromptText("nama.guru@sekolah.sch.id");

                formContainer.getChildren().addAll(
                        createFieldGroup("Nama Lengkap & Gelar:", txtNama),
                        createFieldGroup("NIP / NUPTK:", txtNip),
                        createFieldGroup("Mata Pelajaran yang Diampu:", txtMapel),
                        createFieldGroup("Email Resmi Sekolah:", txtEmail)
                );
            }

            txtPassword.setPromptText("Minimal 8 karakter");
            formContainer.getChildren().add(createFieldGroup("Kata Sandi Baru:", txtPassword));

        } else {
            // Mode Login (Demo accounts disabled in production)
            btnDemoAccount.setVisible(false);
            btnDemoAccount.setManaged(false);

            if (selectedRole == Role.SISWA_SD) {
                btnSubmit.setText("Masuk Sebagai Siswa SD");
                btnDemoAccount.setText("⚡ Masuk Instan Akun Demo (Siswa SD: Adit)");
                btnSwitchMode.setText("Belum punya akun Siswa SD? Daftar sekarang");
                txtIdentifier.setPromptText("Contoh: 0012345678");
                formContainer.getChildren().add(createFieldGroup("NISN / ID Siswa SD:", txtIdentifier));
            } else if (selectedRole == Role.SISWA_SMP) {
                btnSubmit.setText("Masuk Sebagai Siswa SMP");
                btnDemoAccount.setText("⚡ Masuk Instan Akun Demo (Siswa SMP: Arya)");
                btnSwitchMode.setText("Belum punya akun Siswa SMP? Daftar sekarang");
                txtIdentifier.setPromptText("Email atau 10 Digit NISN");
                formContainer.getChildren().add(createFieldGroup("Email Siswa / NISN SMP:", txtIdentifier));
            } else {
                btnSubmit.setText("Masuk Sebagai Guru");
                btnDemoAccount.setText("⚡ Masuk Instan Akun Demo (Guru: Bu Ratna)");
                btnSwitchMode.setText("Belum punya akun Guru? Daftar sekarang");
                txtIdentifier.setPromptText("Email resmi sekolah atau NIP/NUPTK");
                formContainer.getChildren().add(createFieldGroup("Email Resmi Guru / NIP / NUPTK:", txtIdentifier));
            }

            txtPassword.setPromptText("Masukkan kata sandi akun");
            formContainer.getChildren().add(createFieldGroup("Kata Sandi:", txtPassword));
        }
    }

    private VBox createFieldGroup(String labelText, Control inputControl) {
        VBox box = new VBox(4);
        Label lbl = new Label(labelText);
        lbl.setStyle("-fx-font-size: 11px; -fx-font-weight: 700; -fx-text-fill: #334155;");
        inputControl.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #CBD5E1; -fx-border-radius: 8px; -fx-background-radius: 8px; -fx-padding: 8; -fx-font-size: 12px;");
        box.getChildren().addAll(lbl, inputControl);
        return box;
    }

    private void handleSubmit() {
        lblError.setVisible(false);
        lblError.setManaged(false);

        String pass = txtPassword.getText().trim();
        if (pass.isBlank()) {
            showError("Kata sandi wajib diisi!");
            return;
        }

        if (isRegisterMode && pass.length() < 8) {
            showError("Kata sandi baru minimal 8 karakter!");
            return;
        }

        if (isRegisterMode) {
            String nama = txtNama.getText().trim();
            if (nama.isBlank()) {
                showError("Nama lengkap wajib diisi!");
                return;
            }

            Pengguna newUser;
            int newId = (int) (System.currentTimeMillis() % 1000000);

            if (selectedRole == Role.SISWA_SD) {
                String nisn = txtNisn.getText().trim();
                String orangTua = txtOrangTua.getText().trim();
                String kelas = cbKelas.getValue();

                if (nisn.isBlank() || orangTua.isBlank()) {
                    showError("NISN dan Nama Orang Tua/Wali Siswa SD wajib diisi lengkap!");
                    return;
                }

                newUser = new Pengguna(newId, nama, nisn + "@sd.soalku.id", Role.SISWA_SD, "Siswa SD " + kelas);
                newUser.setNisn(nisn);
                newUser.setKelas(kelas);
                newUser.setNamaOrangTua(orangTua);

            } else if (selectedRole == Role.SISWA_SMP) {
                String nisn = txtNisn.getText().trim();
                String kontak = txtKontak.getText().trim();
                String kelas = cbKelas.getValue();

                if (nisn.isBlank() || kontak.isBlank()) {
                    showError("NISN dan Kontak Email/No HP Siswa SMP wajib diisi lengkap!");
                    return;
                }

                newUser = new Pengguna(newId, nama, kontak, Role.SISWA_SMP, "Siswa SMP " + kelas);
                newUser.setNisn(nisn);
                newUser.setKelas(kelas);
                newUser.setNoHp(kontak);

            } else {
                String nip = txtNip.getText().trim();
                String mapel = txtMapel.getText().trim();
                String email = txtEmail.getText().trim();

                if (nip.isBlank() || mapel.isBlank() || email.isBlank()) {
                    showError("NIP/NUPTK, Mata Pelajaran, dan Email Guru wajib diisi lengkap!");
                    return;
                }

                newUser = new Pengguna(newId, nama, email, Role.GURU, "Guru " + mapel);
                newUser.setNuptk(nip);
                newUser.setMataPelajaran(mapel);
            }

            if (onLoginSuccess != null) onLoginSuccess.accept(newUser);

        } else {
            // Mode Login
            String identifier = txtIdentifier.getText().trim();
            if (identifier.isBlank()) {
                showError("Silakan isi kredensial akun terlebih dahulu.");
                return;
            }

            Pengguna targetUser;
            if (selectedRole == Role.SISWA_SD) {
                targetUser = DataRepository.getInstance().getCurrentSiswaSD();
                if (targetUser == null) targetUser = new Pengguna(101, "Siswa SD", identifier, Role.SISWA_SD, "Siswa SD Kelas 4");
            } else if (selectedRole == Role.SISWA_SMP) {
                targetUser = DataRepository.getInstance().getCurrentSiswaSMP();
                if (targetUser == null) targetUser = new Pengguna(102, "Siswa SMP", identifier, Role.SISWA_SMP, "Siswa SMP Kelas 8");
            } else {
                targetUser = DataRepository.getInstance().getCurrentGuru();
                if (targetUser == null) targetUser = new Pengguna(103, "Guru Pengajar", identifier, Role.GURU, "Guru Mata Pelajaran");
            }

            if (onLoginSuccess != null) onLoginSuccess.accept(targetUser);
        }
    }

    private void handleFastDemoLogin() {
        if (onLoginSuccess == null) return;

        if (selectedRole == Role.SISWA_SD) {
            onLoginSuccess.accept(DataRepository.getInstance().getCurrentSiswaSD());
        } else if (selectedRole == Role.SISWA_SMP) {
            onLoginSuccess.accept(DataRepository.getInstance().getCurrentSiswaSMP());
        } else {
            onLoginSuccess.accept(DataRepository.getInstance().getCurrentGuru());
        }
    }

    private void showError(String msg) {
        lblError.setText(msg);
        lblError.setVisible(true);
        lblError.setManaged(true);
    }
}
