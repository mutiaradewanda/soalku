package com.soalku.ui.view;

import com.soalku.model.Pengguna;
import com.soalku.model.Role;
import com.soalku.ui.Icons;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.*;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

/**
 * SidebarComponent - Dynamic Island Bottom Navigation Bar
 * Bersih dari elemen brand & avatar AP, murni fokus pada navigasi interaktif
 * yang responsif untuk tampilan Desktop maupun Mobile.
 */
public class SidebarComponent extends HBox {

    private final Consumer<String> onNavigate;
    private final Runnable onLogout;

    private HBox islandBar;
    private HBox menuContainer;
    private final Map<String, Button> navButtons = new HashMap<>();
    private final Map<String, String> navIcons = new HashMap<>();
    private final Map<String, String> navTitles = new HashMap<>();

    private HBox quotaPill;
    private Region quotaDivider;
    private Button btnLogout;
    private String activeRoute = "dasbor";
    private boolean isMobileMode = false;

    public SidebarComponent(Consumer<String> onNavigate, Runnable onLogout) {
        this.onNavigate = onNavigate;
        this.onLogout = onLogout;
        initUI();
    }

    private void initUI() {
        setAlignment(Pos.CENTER);
        setPadding(new Insets(4, 16, 14, 16));
        setStyle("-fx-background-color: transparent;");
        setPickOnBounds(false);

        // Dynamic Island Capsule
        islandBar = new HBox(8);
        islandBar.setAlignment(Pos.CENTER);
        islandBar.setPadding(new Insets(5, 12, 5, 12));
        islandBar.setStyle(
                "-fx-background-color: #0F172A; " +
                "-fx-background-radius: 40px; " +
                "-fx-border-color: rgba(255, 255, 255, 0.14); " +
                "-fx-border-radius: 40px; " +
                "-fx-border-width: 1px; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(0, 0, 0, 0.45), 24, 0, 0, 8);"
        );

        // 1. Navigation Menu Items Container
        menuContainer = new HBox(6);
        menuContainer.setAlignment(Pos.CENTER);

        // 2. Quota AI Tutor Pill (Siswa)
        quotaPill = createQuotaPill();
        quotaDivider = createDivider();

        // 3. Tombol Logout Interaktif
        btnLogout = new Button();
        btnLogout.setGraphic(Icons.createIcon("logout", "#F87171", 0.72));
        btnLogout.setStyle("-fx-background-color: rgba(239, 68, 68, 0.15); -fx-background-radius: 16px; -fx-padding: 6 10 6 10; -fx-cursor: hand;");
        Tooltip.install(btnLogout, new Tooltip("Keluar (Logout)"));

        btnLogout.setOnMouseEntered(e -> btnLogout.setStyle("-fx-background-color: #EF4444; -fx-background-radius: 16px; -fx-padding: 6 10 6 10; -fx-cursor: hand;"));
        btnLogout.setOnMouseExited(e -> btnLogout.setStyle("-fx-background-color: rgba(239, 68, 68, 0.15); -fx-background-radius: 16px; -fx-padding: 6 10 6 10; -fx-cursor: hand;"));
        btnLogout.setOnAction(e -> {
            if (onLogout != null) onLogout.run();
        });

        islandBar.getChildren().addAll(menuContainer, quotaDivider, quotaPill, btnLogout);
        getChildren().add(islandBar);
    }

    private Region createDivider() {
        Region div = new Region();
        div.setPrefSize(1, 18);
        div.setMinSize(1, 18);
        div.setMaxSize(1, 18);
        div.setStyle("-fx-background-color: rgba(255, 255, 255, 0.14);");
        return div;
    }

    private HBox createQuotaPill() {
        HBox pill = new HBox(6);
        pill.setAlignment(Pos.CENTER);
        pill.setPadding(new Insets(4, 9, 4, 9));
        pill.setStyle("-fx-background-color: rgba(37, 99, 235, 0.22); -fx-border-color: rgba(96, 165, 250, 0.35); -fx-border-radius: 16px; -fx-background-radius: 16px;");

        Label quotaText = new Label("AI: 82/100");
        quotaText.setStyle("-fx-font-size: 10px; -fx-font-weight: 800; -fx-text-fill: #93C5FD;");

        pill.getChildren().addAll(Icons.createIcon("sparkle", "#60A5FA", 0.65), quotaText);
        Tooltip.install(pill, new Tooltip("Kuota AI Tutor: 82/100 (Reset otomatis dlm 6 hari)"));
        return pill;
    }

    public void updateUser(Pengguna user) {
        if (user == null) return;
        rebuildMenus(user.getRole());
    }

    private void rebuildMenus(Role role) {
        menuContainer.getChildren().clear();
        navButtons.clear();
        navIcons.clear();
        navTitles.clear();

        if (role == Role.SISWA || role == Role.SISWA_SD || role == Role.SISWA_SMP) {
            quotaPill.setVisible(!isMobileMode);
            quotaPill.setManaged(!isMobileMode);
            quotaDivider.setVisible(!isMobileMode);
            quotaDivider.setManaged(!isMobileMode);

            addNavButton("Dasbor", "dashboard", "dasbor");
            addNavButton("Materi & AI", "ringkas", "materi");
            addNavButton("Latihan CBT", "latihan", "latihan");
            addNavButton("Evaluasi", "evaluasi", "evaluasi");
        } else {
            quotaPill.setVisible(false);
            quotaPill.setManaged(false);
            quotaDivider.setVisible(false);
            quotaDivider.setManaged(false);

            addNavButton("Dasbor Kelas", "dashboard", "dasbor");
            addNavButton("Bank Soal", "bank", "bank");
            addNavButton("Undangan", "sparkle", "kode-undangan");
        }

        updateActiveMenu(activeRoute);
    }

    private void addNavButton(String title, String iconName, String route) {
        Button btn = new Button(title);
        btn.setGraphic(Icons.createIcon(iconName, "#94A3B8", 0.72));
        btn.setAlignment(Pos.CENTER);
        btn.setPadding(new Insets(6, 12, 6, 10));
        btn.setStyle(
                "-fx-background-color: transparent; " +
                "-fx-text-fill: #94A3B8; " +
                "-fx-font-size: 11px; " +
                "-fx-font-weight: 600; " +
                "-fx-background-radius: 20px; " +
                "-fx-cursor: hand;"
        );
        Tooltip.install(btn, new Tooltip(title));

        btn.setOnMouseEntered(e -> {
            if (!isRouteActive(route)) {
                btn.setStyle(
                        "-fx-background-color: rgba(255, 255, 255, 0.08); " +
                        "-fx-text-fill: #F1F5F9; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: 600; " +
                        "-fx-background-radius: 20px; " +
                        "-fx-padding: " + (isMobileMode ? "6 10 6 8;" : "6 12 6 10;") +
                        "-fx-cursor: hand;"
                );
            }
        });

        btn.setOnMouseExited(e -> {
            if (!isRouteActive(route)) {
                btn.setStyle(
                        "-fx-background-color: transparent; " +
                        "-fx-text-fill: #94A3B8; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: 600; " +
                        "-fx-background-radius: 20px; " +
                        "-fx-padding: " + (isMobileMode ? "6 10 6 8;" : "6 12 6 10;") +
                        "-fx-cursor: hand;"
                );
            }
        });

        btn.setOnAction(e -> {
            if (onNavigate != null) onNavigate.accept(route);
        });

        navButtons.put(route, btn);
        navIcons.put(route, iconName);
        navTitles.put(route, title);
        menuContainer.getChildren().add(btn);
    }

    private boolean isRouteActive(String route) {
        if (route.equals(activeRoute)) return true;
        if (("ringkas".equals(activeRoute) || "materi".equals(activeRoute)) && "materi".equals(route)) return true;
        return false;
    }

    public void updateActiveMenu(String route) {
        this.activeRoute = route;
        for (Map.Entry<String, Button> entry : navButtons.entrySet()) {
            String btnRoute = entry.getKey();
            Button btn = entry.getValue();
            String iconName = navIcons.getOrDefault(btnRoute, "dashboard");

            if (isRouteActive(btnRoute)) {
                btn.setStyle(
                        "-fx-background-color: #2563EB; " +
                        "-fx-text-fill: #FFFFFF; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: 800; " +
                        "-fx-background-radius: 20px; " +
                        "-fx-padding: " + (isMobileMode ? "6 12 6 10;" : "6 14 6 12;") +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(three-pass-box, rgba(37, 99, 235, 0.45), 10, 0, 0, 2);"
                );
                btn.setGraphic(Icons.createIcon(iconName, "#FFFFFF", 0.72));
            } else {
                btn.setStyle(
                        "-fx-background-color: transparent; " +
                        "-fx-text-fill: #94A3B8; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: 600; " +
                        "-fx-background-radius: 20px; " +
                        "-fx-padding: " + (isMobileMode ? "6 10 6 8;" : "6 12 6 10;") +
                        "-fx-cursor: hand;"
                );
                btn.setGraphic(Icons.createIcon(iconName, "#94A3B8", 0.72));
            }
        }
    }

    public void setResponsiveMode(boolean isMobile) {
        this.isMobileMode = isMobile;
        if (isMobile) {
            islandBar.setPadding(new Insets(4, 8, 4, 8));
            islandBar.setSpacing(5);
            menuContainer.setSpacing(4);
            quotaPill.setVisible(false);
            quotaPill.setManaged(false);
            quotaDivider.setVisible(false);
            quotaDivider.setManaged(false);

            for (Map.Entry<String, Button> entry : navButtons.entrySet()) {
                String route = entry.getKey();
                Button btn = entry.getValue();
                // Pada mobile sangat sempit, buat label ringkas
                String shortTitle = switch (route) {
                    case "dasbor" -> "Dasbor";
                    case "materi" -> "Materi";
                    case "latihan" -> "Latihan";
                    case "evaluasi" -> "Rapor";
                    case "bank" -> "Bank";
                    case "kode-undangan" -> "Kode";
                    default -> navTitles.getOrDefault(route, "");
                };
                btn.setText(shortTitle);
            }
        } else {
            islandBar.setPadding(new Insets(5, 12, 5, 12));
            islandBar.setSpacing(8);
            menuContainer.setSpacing(6);
            quotaPill.setVisible(true);
            quotaPill.setManaged(true);
            quotaDivider.setVisible(true);
            quotaDivider.setManaged(true);

            for (Map.Entry<String, Button> entry : navButtons.entrySet()) {
                String route = entry.getKey();
                Button btn = entry.getValue();
                btn.setText(navTitles.getOrDefault(route, ""));
            }
        }
        updateActiveMenu(activeRoute);
    }
}
