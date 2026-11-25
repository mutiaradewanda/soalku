package com.soalku.model;

public class GambarMateri {
    private int id;
    private int materiId;
    private Integer bagianMateriId;
    private String filePath;
    private String caption;

    public GambarMateri(int id, int materiId, Integer bagianMateriId, String filePath, String caption) {
        this.id = id;
        this.materiId = materiId;
        this.bagianMateriId = bagianMateriId;
        this.filePath = filePath;
        this.caption = caption;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getMateriId() { return materiId; }
    public void setMateriId(int materiId) { this.materiId = materiId; }

    public Integer getBagianMateriId() { return bagianMateriId; }
    public void setBagianMateriId(Integer bagianMateriId) { this.bagianMateriId = bagianMateriId; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
}
