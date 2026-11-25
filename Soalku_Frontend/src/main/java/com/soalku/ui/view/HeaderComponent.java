package com.soalku.ui.view;

import com.soalku.ui.Icons;
import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.*;
import javafx.scene.shape.Circle;

public class HeaderComponent extends HBox {

    private final Runnable onStartQuiz;
    private final Runnable onToggleDeviceMode;

    private HBox logoBox;
    private Label breadcrumbLabel;
    private HBox searchBox;
    private Button btnMulaiKuis;
    private Button btnDeviceMode;
    private StackPane bellBtn;

    private boolean isMobileMode = false;

    public HeaderComponent(Runnable onStartQuiz) {
        this(onStartQuiz, null);
    }

    public HeaderComponent(Runnable onStartQuiz, Runnable onToggleDeviceMode) {
        this.onStartQuiz = onStartQuiz;
        this.onToggleDeviceMode = onToggleDeviceMode;
        initUI();
    }

    private void initUI() {
        setAlignment(Pos.CENTER_LEFT);
        setPadding(new Insets(10, 20, 10, 20));
        setSpacing(14);
        setStyle("-fx-background-color: #FFFFFF; -fx-border-color: #E2E8F0; -fx-border-width: 0 0 1 0;");

        // 1. Logo SoalKu
        logoBox = new HBox(8);
        logoBox.setAlignment(Pos.CENTER_LEFT);

        StackPane logoIcon = new StackPane();
        logoIcon.setPrefSize(34, 34);
        logoIcon.setStyle("-fx-background-color: " + Theme.PRIMARY_BLUE + "; -fx-background-radius: 9px;");
        logoIcon.getChildren().add(Icons.createIcon("book", "#FFFFFF", 0.8));

        VBox logoText = new VBox(0);
        Label title = new Label("SoalKu");
        title.setStyle("-fx-font-size: 16px; -fx-font-weight: 900; -fx-text-fill: #1E3A8A; -fx-font-family: " + Theme.FONT_FAMILY + ";");

        Label subtitle = new Label("Adaptive AI");
        subtitle.setStyle("-fx-font-size: 10px; -fx-font-weight: 600; -fx-text-fill: #64748B;");

        logoText.getChildren().addAll(title, subtitle);
        logoBox.getChildren().addAll(logoIcon, logoText);

        // 2. Breadcrumbs (Desktop)
        breadcrumbLabel = new Label("Portal Siswa  ›  Belajar Adaptif");
        breadcrumbLabel.setStyle("-fx-font-size: 11px; -fx-font-weight: 600; -fx-text-fill: #64748B;");

        // 3. Search Bar
        searchBox = new HBox(8);
        searchBox.setAlignment(Pos.CENTER_LEFT);
        searchBox.setPadding(new Insets(6, 12, 6, 12));
        searchBox.setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 20px; -fx-border-color: #E2E8F0; -fx-border-radius: 20px;");
        searchBox.setPrefWidth(260);

        TextField searchField = new TextField();
        searchField.setPromptText("Cari materi atau topik...");
        searchField.setStyle("-fx-background-color: transparent; -fx-border-color: transparent; -fx-font-size: 11px; -fx-prompt-text-fill: #94A3B8;");
        HBox.setHgrow(searchField, Priority.ALWAYS);
        searchBox.getChildren().addAll(Icons.createIcon("search", "#94A3B8", 0.7), searchField);

        // Spacer
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // 4. Interactive Device Simulator Toggle Button (Desktop <-> Mobile)
        btnDeviceMode = new Button();
        btnDeviceMode.setGraphic(Icons.createIcon("mobile", "#2563EB", 0.75));
        btnDeviceMode.setStyle("-fx-background-color: #EFF6FF; -fx-border-color: #BFDBFE; -fx-border-radius: 16px; -fx-background-radius: 16px; -fx-padding: 5 10 5 10; -fx-cursor: hand;");
        Tooltip.install(btnDeviceMode, new Tooltip("Ganti Mode Tampilan (Desktop / Mobile)"));
        btnDeviceMode.setOnAction(e -> {
            if (onToggleDeviceMode != null) onToggleDeviceMode.run();
        });

        // 5. Notification Bell
        bellBtn = new StackPane();
        bellBtn.setPrefSize(32, 32);
        bellBtn.setStyle("-fx-background-color: #F1F5F9; -fx-background-radius: 16px; -fx-cursor: hand;");
        Circle notifDot = new Circle(3, javafx.scene.paint.Color.web("#EF4444"));
        StackPane.setAlignment(notifDot, Pos.TOP_RIGHT);
        StackPane.setMargin(notifDot, new Insets(5, 5, 0, 0));
        bellBtn.getChildren().addAll(Icons.createIcon("bell", "#475569", 0.75), notifDot);

        // 6. Action Button: Mulai Kuis
        btnMulaiKuis = new Button("Mulai Kuis");
        btnMulaiKuis.setGraphic(Icons.createIcon("play", "#FFFFFF", 0.65));
        btnMulaiKuis.setStyle(
                "-fx-background-color: linear-gradient(to right, #2563EB, #1D4ED8); " +
                "-fx-text-fill: #FFFFFF; " +
                "-fx-font-size: 11px; " +
                "-fx-font-weight: 700; " +
                "-fx-background-radius: 18px; " +
                "-fx-padding: 6 14 6 12; " +
                "-fx-cursor: hand;"
        );
        btnMulaiKuis.setOnAction(e -> {
            if (onStartQuiz != null) onStartQuiz.run();
        });

        getChildren().addAll(logoBox, breadcrumbLabel, searchBox, spacer, btnDeviceMode, bellBtn, btnMulaiKuis);
    }

    public void setResponsiveMode(boolean isMobile) {
        this.isMobileMode = isMobile;
        if (isMobile) {
            setPadding(new Insets(8, 12, 8, 12));
            setSpacing(8);
            breadcrumbLabel.setVisible(false);
            breadcrumbLabel.setManaged(false);
            searchBox.setVisible(false);
            searchBox.setManaged(false);

            btnMulaiKuis.setText("");
            btnMulaiKuis.setStyle(
                    "-fx-background-color: linear-gradient(to right, #2563EB, #1D4ED8); " +
                    "-fx-text-fill: #FFFFFF; " +
                    "-fx-background-radius: 18px; " +
                    "-fx-padding: 6 10 6 10; " +
                    "-fx-cursor: hand;"
            );
            btnDeviceMode.setGraphic(Icons.createIcon("desktop", "#2563EB", 0.75));
            Tooltip.install(btnDeviceMode, new Tooltip("Beralih ke Tampilan Desktop"));
        } else {
            setPadding(new Insets(10, 20, 10, 20));
            setSpacing(14);
            breadcrumbLabel.setVisible(true);
            breadcrumbLabel.setManaged(true);
            searchBox.setVisible(true);
            searchBox.setManaged(true);

            btnMulaiKuis.setText("Mulai Kuis");
            btnMulaiKuis.setStyle(
                    "-fx-background-color: linear-gradient(to right, #2563EB, #1D4ED8); " +
                    "-fx-text-fill: #FFFFFF; " +
                    "-fx-font-size: 11px; " +
                    "-fx-font-weight: 700; " +
                    "-fx-background-radius: 18px; " +
                    "-fx-padding: 6 14 6 12; " +
                    "-fx-cursor: hand;"
            );
            btnDeviceMode.setGraphic(Icons.createIcon("mobile", "#2563EB", 0.75));
            Tooltip.install(btnDeviceMode, new Tooltip("Beralih ke Tampilan Mobile"));
        }
    }

    public void updateBreadcrumb(String text) {
        if (breadcrumbLabel != null) {
            breadcrumbLabel.setText(text);
        }
    }
}
