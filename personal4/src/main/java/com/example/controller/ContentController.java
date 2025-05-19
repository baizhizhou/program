package com.example.controller;

import com.example.model.Content;
import com.example.service.ContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class ContentController {

    @Autowired
    private ContentService contentService;

    @GetMapping("/api/contents")
    public List<Content> getAllContents() {
        return contentService.getAllContents();
    }
} 