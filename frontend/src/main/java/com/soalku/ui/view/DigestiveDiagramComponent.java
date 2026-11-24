package com.soalku.ui.view;

import com.soalku.ui.Theme;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;

public class DigestiveDiagramComponent extends VBox {

    public DigestiveDiagramComponent() {
        setSpacing(8);
        setAlignment(Pos.CENTER);
        setPadding(new Insets(12));
        setStyle("-fx-background-color: #F8FAFC; -fx-background-radius: 12px; -fx-border-color: #E2E8F0; -fx-border-radius: 12px;");

        HBox diagramWrapper = new HBox(20);
        diagramWrapper.setAlignment(Pos.CENTER);

        // Canvas for Digestive Illustration
        Canvas canvas = new Canvas(260, 200);
        renderIllustration(canvas.getGraphicsContext2D());

        // Keterangan Label box on the right
        VBox labelBox = new VBox(8);
        labelBox.setAlignment(Pos.CENTER_LEFT);
        labelBox.setPadding(new Insets(12, 16, 12, 16));
        labelBox.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 8px; -fx-border-color: #E2E8F0; -fx-border-radius: 8px;");

        Label lblTitle = new Label("KETERANGAN LABEL");
        lblTitle.setStyle("-fx-font-size: 11px; -fx-font-weight: bold; -fx-text-fill: #475569; -fx-letter-spacing: 0.5px;");

        HBox item1 = createLabelItem(1, "Rongga Mulut", false);
        HBox item2 = createLabelItem(2, "Ventrikulus (Lambung)", true); // Highlighted active answer!
        HBox item3 = createLabelItem(3, "Hepar (Hati)", false);
        HBox item4 = createLabelItem(4, "Intestinum (Usus Halus)", false);

        labelBox.getChildren().addAll(lblTitle, item1, item2, item3, item4);

        diagramWrapper.getChildren().addAll(canvas, labelBox);

        // Caption at bottom
        Label caption = new Label("Gambar 2.4: Skema Saluran dan Kelenjar Pencernaan Makanan");
        caption.setStyle("-fx-font-size: 11px; -fx-font-style: italic; -fx-text-fill: #64748B;");

        getChildren().addAll(diagramWrapper, caption);
    }

    private HBox createLabelItem(int number, String text, boolean isTarget) {
        HBox row = new HBox(10);
        row.setAlignment(Pos.CENTER_LEFT);

        StackPane pin = new StackPane();
        pin.setPrefSize(22, 22);
        pin.setMinSize(22, 22);

        if (isTarget) {
            pin.setStyle("-fx-background-color: #2563EB; -fx-background-radius: 11px;");
            Label numLbl = new Label(String.valueOf(number));
            numLbl.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 11px; -fx-font-weight: bold;");
            pin.getChildren().add(numLbl);

            Label txtLbl = new Label(text);
            txtLbl.setStyle("-fx-text-fill: #1D4ED8; -fx-font-size: 12px; -fx-font-weight: bold;");
            row.getChildren().addAll(pin, txtLbl);
        } else {
            pin.setStyle("-fx-background-color: #EFF6FF; -fx-background-radius: 11px; -fx-border-color: #BFDBFE; -fx-border-radius: 11px;");
            Label numLbl = new Label(String.valueOf(number));
            numLbl.setStyle("-fx-text-fill: #2563EB; -fx-font-size: 11px; -fx-font-weight: bold;");
            pin.getChildren().add(numLbl);

            Label txtLbl = new Label(text);
            txtLbl.setStyle("-fx-text-fill: #334155; -fx-font-size: 12px;");
            row.getChildren().addAll(pin, txtLbl);
        }

        return row;
    }

    private void renderIllustration(GraphicsContext gc) {
        double w = 260;
        double h = 200;

        // Background silhouette
        gc.setFill(Color.web("#F1F5F9"));
        gc.fillRoundRect(10, 5, w - 20, h - 10, 16, 16);

        // Title on top
        gc.setFill(Color.web("#64748B"));
        gc.fillText("HUMAN DIGESTIVE SYSTEM", 60, 25);

        // Body Head silhouette
        gc.setFill(Color.web("#E2E8F0"));
        gc.fillOval(110, 30, 40, 40); // Head
        gc.fillRect(123, 68, 14, 18);  // Neck

        // Torso outline
        gc.fillRoundRect(95, 84, 70, 105, 12, 12);

        // Organ 1: Oral Cavity / Mouth
        gc.setFill(Color.web("#F87171"));
        gc.fillOval(125, 48, 10, 8);

        // Esophagus tube
        gc.setStroke(Color.web("#FB923C"));
        gc.setLineWidth(4);
        gc.strokeLine(130, 55, 130, 102);

        // Organ 3: Liver (Hepar) - dark red/brown wedge on right of body (left visually)
        gc.setFill(Color.web("#B91C1C"));
        gc.fillPolygon(
                new double[]{105, 126, 118},
                new double[]{102, 104, 122},
                3
        );

        // Organ 2: Stomach (Ventrikulus) - J-shaped organ
        gc.setFill(Color.web("#EF4444"));
        gc.fillOval(124, 102, 26, 20);
        gc.setStroke(Color.web("#DC2626"));
        gc.setLineWidth(2);
        gc.strokeOval(124, 102, 26, 20);

        // Organ 4: Small Intestine (Intestinum) - folded loops
        gc.setFill(Color.web("#FBBF24"));
        gc.fillRoundRect(116, 126, 30, 26, 8, 8);

        // Large Intestine (Colon) around small intestine
        gc.setStroke(Color.web("#A855F7"));
        gc.setLineWidth(3);
        gc.strokeRoundRect(110, 122, 42, 38, 6, 6);

        // Pin 1 Marker (Mouth)
        drawPin(gc, 1, 148, 48, false);
        gc.setStroke(Color.web("#94A3B8"));
        gc.setLineWidth(1);
        gc.strokeLine(133, 49, 144, 49);

        // Pin 2 Marker (Stomach / Lambung) - Highlighted!
        drawPin(gc, 2, 166, 110, true);
        gc.setStroke(Color.web("#2563EB"));
        gc.setLineWidth(1.5);
        gc.strokeLine(144, 112, 160, 112);

        // Pin 3 Marker (Liver / Hati)
        drawPin(gc, 3, 86, 108, false);
        gc.setStroke(Color.web("#94A3B8"));
        gc.setLineWidth(1);
        gc.strokeLine(108, 110, 96, 110);

        // Pin 4 Marker (Small Intestine / Usus Halus)
        drawPin(gc, 4, 166, 140, false);
        gc.setStroke(Color.web("#94A3B8"));
        gc.setLineWidth(1);
        gc.strokeLine(144, 140, 160, 140);
    }

    private void drawPin(GraphicsContext gc, int num, double x, double y, boolean isTarget) {
        if (isTarget) {
            gc.setFill(Color.web("#2563EB"));
            gc.fillOval(x - 9, y - 9, 18, 18);
            gc.setFill(Color.WHITE);
            gc.fillText(String.valueOf(num), x - 4, y + 4);
        } else {
            gc.setFill(Color.web("#EFF6FF"));
            gc.fillOval(x - 8, y - 8, 16, 16);
            gc.setStroke(Color.web("#3B82F6"));
            gc.setLineWidth(1.2);
            gc.strokeOval(x - 8, y - 8, 16, 16);
            gc.setFill(Color.web("#1D4ED8"));
            gc.fillText(String.valueOf(num), x - 3.5, y + 3.5);
        }
    }
}
