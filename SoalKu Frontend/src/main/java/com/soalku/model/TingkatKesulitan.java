package com.soalku.model;

public enum TingkatKesulitan {
    MUDAH("Mudah"),
    SEDANG("Sedang"),
    SULIT("Sulit");

    private final String label;

    TingkatKesulitan(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
