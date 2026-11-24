package com.soalku.ui;

import com.soalku.database.DataRepository;
import com.soalku.model.ModeLatihan;
import com.soalku.model.Pengguna;
import com.soalku.model.Role;
import com.soalku.model.SesiLatihan;
import com.soalku.strategy.ModeAcakStrategy;
import com.soalku.strategy.ModeBerwaktuStrategy;
import com.soalku.strategy.ModeFokusKelemahanStrategy;
import com.soalku.ui.view.*;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

import java.io.File;

/**
 * MainApp - Aplikasi Utama SoalKu (JavaFX Desktop)
 * Sesuai Spesifikasi PRD & Desain Sistem SoalKu:
 * - RBAC Terpadu: Siswa & Mentor.
 * - Alur Lengkap: Login -> Dasbor -> Unggah & Detail Materi -> Pilih Latihan -> CBT Quiz -> Hasil Sesi -> Evaluasi.
 */
public class MainApp extends Application {

    private BorderPane rootLayout;
    private HeaderComponent headerComponent;
    private SidebarComponent sidebarComponent;
    private StackPane centerContainer;

    private boolean isAuthenticated = false;
    private Pengguna currentUser = null;

    private LoginView loginView;
    private DashboardView dashboardView;
    private MentorDashboardView mentorDashboardView;
    private MateriView materiView;
    private PilihLatihanView pilihLatihanView;
    private QuizView quizView;
    private SessionResultView sessionResultView;
    private EvaluationView evaluationView;
    private MentorReviewView mentorReviewView;

    private Stage primaryStage;
    private boolean isMobileSimulated = false;

    @Override
    public void start(Stage primaryStage) {
        this.primaryStage = primaryStage;
        primaryStage.setTitle("SoalKu - Adaptive AI Learning (SD & SMP)");

        rootLayout = new BorderPane();
        rootLayout.setStyle("-fx-background-color: #F8FAFC; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        // 1. Header (dilengkapi tombol simulator Desktop / Mobile)
        headerComponent = new HeaderComponent(
                () -> navigateTo("latihan"),
                this::toggleDeviceMode
        );

        // 2. Sidebar dengan RBAC ketat & Logout (Dynamic Island Bawah)
        sidebarComponent = new SidebarComponent(
                this::navigateTo,
                () -> navigateTo("login")
        );

        // 3. Center Container
        centerContainer = new StackPane();
        rootLayout.setCenter(centerContainer);

        // Inisialisasi Tampilan
        loginView = new LoginView(this::handleLoginSuccess);
        dashboardView = new DashboardView(
                mode -> launchQuizWithStrategy(mode, 10),
                this::navigateTo,
                this::handleUploadedFile
        );
        mentorDashboardView = new MentorDashboardView(this::navigateTo);
        materiView = new MateriView();
        pilihLatihanView = new PilihLatihanView(this::launchQuizWithStrategy, () -> navigateTo("dasbor"));
        evaluationView = new EvaluationView(mode -> launchQuizWithStrategy(mode, 10));
        mentorReviewView = new MentorReviewView();

        // Middleware Guard: Otomatis redirect ke Layar Login saat awal dibuka
        navigateTo("login");

        Scene scene = new Scene(rootLayout, 1340, 840);
        try {
            var cssResource = getClass().getResource("/styles.css");
            if (cssResource != null) {
                scene.getStylesheets().add(cssResource.toExternalForm());
            }
        } catch (Exception ignored) {}

        // Responsivitas Dinamis Otomatis berdasarkan Lebar Layar (Desktop & Mobile)
        scene.widthProperty().addListener((obs, oldW, newW) -> {
            if (newW != null) {
                boolean isMobile = newW.doubleValue() < 768;
                headerComponent.setResponsiveMode(isMobile);
                sidebarComponent.setResponsiveMode(isMobile);
                dashboardView.setResponsiveMode(isMobile);
            }
        });

        primaryStage.setScene(scene);
        primaryStage.setMinWidth(360);
        primaryStage.setMinHeight(560);
        primaryStage.show();
    }

    private void toggleDeviceMode() {
        if (primaryStage == null) return;
        isMobileSimulated = !isMobileSimulated;
        if (isMobileSimulated) {
            primaryStage.setWidth(430);
            primaryStage.setHeight(860);
            headerComponent.setResponsiveMode(true);
            sidebarComponent.setResponsiveMode(true);
            dashboardView.setResponsiveMode(true);
        } else {
            primaryStage.setWidth(1280);
            primaryStage.setHeight(820);
            headerComponent.setResponsiveMode(false);
            sidebarComponent.setResponsiveMode(false);
            dashboardView.setResponsiveMode(false);
        }
        primaryStage.centerOnScreen();
    }

    public void navigateTo(String route) {
        // Protected Route Middleware: Cegah akses tanpa sesi aktif
        if (!isAuthenticated && !"login".equals(route)) {
            navigateTo("login");
            return;
        }

        if ("login".equals(route)) {
            this.isAuthenticated = false;
            this.currentUser = null;
            rootLayout.setTop(null);
            rootLayout.setLeft(null);
            rootLayout.setBottom(null);
            loginView.showRoleSelectionModal();
            centerContainer.getChildren().setAll(loginView);
            return;
        }

        // Normalisasi route (hilangkan slash awal bila ada)
        String cleanRoute = route.startsWith("/") ? route.substring(1) : route;

        // Auto redirect jika navigasi ke "dasbor" umum
        if ("dasbor".equals(cleanRoute) || "dashboard".equals(cleanRoute)) {
            if (currentUser != null) {
                if (currentUser.getRole() == Role.SISWA_SD) {
                    cleanRoute = "dashboard/sd";
                } else if (currentUser.getRole() == Role.SISWA_SMP || currentUser.getRole() == Role.SISWA) {
                    cleanRoute = "dashboard/smp";
                } else {
                    cleanRoute = "dashboard/guru";
                }
            }
        }

        // Middleware Route Guard: Mencegah akses silang role ke dashboard role lain
        if (currentUser != null) {
            Role role = currentUser.getRole();
            boolean isSD = (role == Role.SISWA_SD);
            boolean isSMP = (role == Role.SISWA_SMP || role == Role.SISWA);
            boolean isGuru = (role == Role.GURU || role == Role.MENTOR);

            // Validasi Dashboard SD
            if ("dashboard/sd".equals(cleanRoute) && !isSD) {
                showAccessDeniedAlert("Halaman Dashboard Siswa SD hanya dapat diakses oleh akun Siswa SD!");
                navigateTo(isSMP ? "/dashboard/smp" : "/dashboard/guru");
                return;
            }

            // Validasi Dashboard SMP
            if ("dashboard/smp".equals(cleanRoute) && !isSMP) {
                showAccessDeniedAlert("Halaman Dashboard Siswa SMP hanya dapat diakses oleh akun Siswa SMP!");
                navigateTo(isSD ? "/dashboard/sd" : "/dashboard/guru");
                return;
            }

            // Validasi Dashboard Guru & Fitur Khusus Pengajar
            if (("dashboard/guru".equals(cleanRoute) || "bank".equals(cleanRoute) || "kode-undangan".equals(cleanRoute)) && !isGuru) {
                showAccessDeniedAlert("Halaman ini hanya dapat diakses oleh akun Guru / Mentor!");
                navigateTo(isSD ? "/dashboard/sd" : "/dashboard/smp");
                return;
            }
        }

        // Tampilkan header dan dynamic island bawah setelah login
        rootLayout.setTop(headerComponent);
        rootLayout.setLeft(null);
        rootLayout.setBottom(sidebarComponent);
        sidebarComponent.updateActiveMenu(cleanRoute.contains("dashboard") ? "dasbor" : cleanRoute);

        switch (cleanRoute) {
            case "dashboard/sd":
                headerComponent.updateBreadcrumb("Portal Siswa SD  ›  Ruang Belajar Ceria & Latihan Adaptif");
                centerContainer.getChildren().setAll(dashboardView);
                break;
            case "dashboard/smp":
                headerComponent.updateBreadcrumb("Portal Siswa SMP  ›  Dasbor Belajar & CBT Adaptif");
                centerContainer.getChildren().setAll(dashboardView);
                break;
            case "dashboard/guru":
                headerComponent.updateBreadcrumb("Portal Guru  ›  Dasbor Manajemen Kelas, Analitik & Bank Soal");
                centerContainer.getChildren().setAll(mentorDashboardView);
                break;
            case "materi":
            case "ringkas":
                headerComponent.updateBreadcrumb("Portal Materi  ›  Unggah & Detail Materi Pembelajaran");
                materiView.refreshDetailMateri();
                centerContainer.getChildren().setAll(materiView);
                break;
            case "latihan":
                headerComponent.updateBreadcrumb("Portal Latihan  ›  Belajar Adaptif  ›  Pilih Mode & Jumlah Soal");
                centerContainer.getChildren().setAll(pilihLatihanView);
                break;
            case "evaluasi":
                headerComponent.updateBreadcrumb("Portal Siswa  ›  Evaluasi Mandiri & Rapor Analisis Kelemahan");
                centerContainer.getChildren().setAll(evaluationView);
                break;
            case "bank":
                headerComponent.updateBreadcrumb("Portal Guru  ›  Antrean Review & Bank Soal Terpadu");
                centerContainer.getChildren().setAll(mentorReviewView);
                break;
            case "kode-undangan":
                headerComponent.updateBreadcrumb("Portal Guru  ›  Manajemen Kode Undangan Mentor");
                centerContainer.getChildren().setAll(mentorReviewView);
                break;
            default:
                centerContainer.getChildren().setAll(dashboardView);
                break;
        }
    }

    private void showAccessDeniedAlert(String message) {
        Alert alert = new Alert(Alert.AlertType.WARNING);
        alert.setTitle("Akses Ditolak (403)");
        alert.setHeaderText("Hak Akses Terbatas");
        alert.setContentText(message);
        alert.showAndWait();
    }

    private void handleLoginSuccess(Pengguna user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        sidebarComponent.updateUser(user);

        // Redirection dinamis sesuai role pengguna
        if (user.getRole() == Role.SISWA_SD) {
            navigateTo("/dashboard/sd");
        } else if (user.getRole() == Role.SISWA_SMP || user.getRole() == Role.SISWA) {
            navigateTo("/dashboard/smp");
        } else {
            navigateTo("/dashboard/guru");
        }
    }

    public void launchQuizWithStrategy(ModeLatihan mode, int jumlahSoal) {
        var repo = DataRepository.getInstance();
        SesiLatihan sesi;

        switch (mode) {
            case ACAK -> sesi = new ModeAcakStrategy().inisialisasiSesi(
                    currentUser != null ? currentUser.getId() : repo.getCurrentSiswa().getId(),
                    "IPA Terpadu • Latihan Soal Acak",
                    "Kelas 8 SMP",
                    repo.getBankSoal(),
                    repo.getRiwayatList(),
                    jumlahSoal
            );
            case BERWAKTU -> sesi = new ModeBerwaktuStrategy().inisialisasiSesi(
                    currentUser != null ? currentUser.getId() : repo.getCurrentSiswa().getId(),
                    "IPA Terpadu • Simulasi Ujian Berwaktu (30d/soal)",
                    "Kelas 8 SMP",
                    repo.getBankSoal(),
                    repo.getRiwayatList(),
                    jumlahSoal
            );
            default -> sesi = new ModeFokusKelemahanStrategy().inisialisasiSesi(
                    currentUser != null ? currentUser.getId() : repo.getCurrentSiswa().getId(),
                    "IPA Terpadu • Biologi Sistem Pencernaan (Adaptive AI)",
                    "Kelas 8 SMP",
                    repo.getBankSoal(),
                    repo.getRiwayatList(),
                    jumlahSoal
            );
        }

        quizView = new QuizView(
                sesi,
                this::showSessionResult,
                () -> navigateTo("dasbor")
        );

        headerComponent.updateBreadcrumb("Portal Siswa  ›  CBT Mode  ›  " + mode.getDisplayName());
        centerContainer.getChildren().setAll(quizView);
    }

    private void showSessionResult(SesiLatihan sesi) {
        sessionResultView = new SessionResultView(
                sesi,
                () -> navigateTo("evaluasi"),
                () -> navigateTo("dasbor"),
                () -> navigateTo("latihan")
        );
        headerComponent.updateBreadcrumb("Portal Siswa  ›  Hasil Sesi Latihan & Pembahasan Kunci Jawaban");
        centerContainer.getChildren().setAll(sessionResultView);
    }

    private void handleUploadedFile(File file) {
        navigateTo("materi");
        materiView.loadFileAndValidate(file);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
