package com.example.contentapp.model;

public class UserApplyRequest {
    private String name;
    private String username;
    private String password;
    
    public UserApplyRequest() {}
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
} 