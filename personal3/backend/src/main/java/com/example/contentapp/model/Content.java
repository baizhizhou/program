package com.example.contentapp.model;

public class Content {
    private String name;
    private String description;
    private String downloadLink;
    
    public Content() {}
    
    public Content(String name, String description, String downloadLink) {
        this.name = name;
        this.description = description;
        this.downloadLink = downloadLink;
    }
    
    // 确保有这些getter方法
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getDownloadLink() { return downloadLink; }
    public void setDownloadLink(String downloadLink) { this.downloadLink = downloadLink; }
}
