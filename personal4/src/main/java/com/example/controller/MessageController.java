package com.example.controller;

import com.example.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
@RequestMapping("/message")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageService messageService;

    @GetMapping
    public String messagePage() {
        return "message";
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitMessage(@RequestParam String content) {
        try {
            logger.info("收到留言提交请求，内容长度: {}", content.length());
            messageService.saveMessage(content);
            logger.info("留言保存成功");
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            logger.error("留言保存失败", e);
            return ResponseEntity.badRequest().body("error: " + e.getMessage());
        }
    }
} 