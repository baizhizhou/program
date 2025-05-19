package com.example.contentapp.controller;

import com.example.contentapp.model.LoginRequest;
import com.example.contentapp.model.LoginResponse;
import com.example.contentapp.model.UserApplyRequest;
import com.example.contentapp.model.UserResponse;
import com.example.contentapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")  // 允许跨域请求
public class AuthController {
    
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/apply")
    public UserResponse applyNewUser(@RequestBody UserApplyRequest request) {
        return authService.applyNewUser(request);
    }
} 