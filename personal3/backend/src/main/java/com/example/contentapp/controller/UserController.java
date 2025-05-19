package com.example.contentapp.controller;

import com.example.contentapp.model.UserApplyRequest;
import com.example.contentapp.model.UserResponse;
import com.example.contentapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/applications")
    public List<UserResponse> getAllApplications() {
        return userService.getAllApplications();
    }
    
    @PostMapping("/apply")
    public Map<String, Object> applyUser(@RequestBody UserApplyRequest request) {
        return userService.applyUser(request);
    }
    
    @GetMapping("/pending")
    public List<UserResponse> getPendingUsers() {
        return userService.getPendingUsers();
    }
    
    @GetMapping("/approved")
    public List<UserResponse> getApprovedUsers() {
        return userService.getApprovedUsers();
    }
    
    @PostMapping("/{id}/approve")
    public Map<String, Object> approveUser(@PathVariable Long id) {
        return userService.approveUser(id);
    }
    
    @PostMapping("/{id}/reject")
    public Map<String, Object> rejectUser(@PathVariable Long id) {
        return userService.rejectUser(id);
    }
    
    @PostMapping("/{id}/enable")
    public Map<String, Object> enableUser(@PathVariable Long id) {
        return userService.enableUser(id);
    }
    
    @PostMapping("/{id}/disable")
    public Map<String, Object> disableUser(@PathVariable Long id) {
        return userService.disableUser(id);
    }
} 