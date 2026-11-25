package com.soalku.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

/**
 * Ekstraktor dokumen PDF dan DOCX sesuai PRD menggunakan Apache PDFBox dan Apache POI.
 */
public class DocumentExtractorService {

    public String ekstrakTeks(File file) throws IOException {
        if (file == null || !file.exists()) {
            throw new IllegalArgumentException("Berkas dokumen tidak ditemukan.");
        }

        String name = file.getName().toLowerCase();
        if (name.endsWith(".pdf")) {
            return ekstrakPDF(file);
        } else if (name.endsWith(".docx")) {
            return ekstrakDOCX(file);
        } else if (name.endsWith(".txt")) {
            return java.nio.file.Files.readString(file.toPath());
        } else {
            // Fallback: baca text biasa
            return java.nio.file.Files.readString(file.toPath());
        }
    }

    private String ekstrakPDF(File file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String ekstrakDOCX(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument doc = new XWPFDocument(fis)) {
            StringBuilder sb = new StringBuilder();
            List<XWPFParagraph> paragraphs = doc.getParagraphs();
            for (XWPFParagraph p : paragraphs) {
                sb.append(p.getText()).append("\n");
            }
            return sb.toString();
        }
    }
}
