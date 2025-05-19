package com.example.contentapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.contentapp.model.Content;
import com.example.contentapp.service.ContentService;
import com.example.contentapp.service.AuthService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contents")
@CrossOrigin(origins = "*")
public class ContentController {
    
    @Autowired
    private ContentService contentService;
    
    @Autowired
    private AuthService authService;
    
    @GetMapping
    public List<Content> getAllContents() {
        return contentService.getAllContents();
    }
    
    @GetMapping("/search")
    public List<Content> searchContents(@RequestParam String name) {
        return contentService.searchContentsByName(name);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> addContent(
            @RequestBody Content content,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        // 验证管理员权限
        if (!isAdminRequest(authHeader)) {
            response.put("success", false);
            response.put("message", "无权限执行此操作");
            return ResponseEntity.status(403).body(response);
        }
        
        try {
            contentService.addContent(content);
            response.put("success", true);
            response.put("message", "内容添加成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "添加失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private boolean isAdminRequest(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        
        String token = authHeader.substring(7);
        // 简单验证：检查token是否包含adminwh
        return token.contains("adminwh");
    }
}