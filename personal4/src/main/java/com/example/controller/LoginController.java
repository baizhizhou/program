package com.example.controller;

import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@CrossOrigin
public class LoginController {
    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        logger.info("收到登录请求：username={}", username);

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            logger.warn("登录失败：用户名或密码为空");
            return ResponseEntity.badRequest().body("{\"status\": \"error\", \"message\": \"用户名和密码不能为空\"}");
        }

        if (userService.validateUser(username, password)) {
            logger.info("登录成功：username={}", username);
            return ResponseEntity.ok().body("{\"status\": \"success\"}");
        } else {
            logger.warn("登录失败：用户名或密码错误 username={}", username);
            return ResponseEntity.badRequest().body("{\"status\": \"error\", \"message\": \"用户名或密码错误\"}");
        }
    }
} 