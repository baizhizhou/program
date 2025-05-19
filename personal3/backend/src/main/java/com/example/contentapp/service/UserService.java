package com.example.contentapp.service;

import com.example.contentapp.model.User;
import com.example.contentapp.model.UserApplyRequest;
import com.example.contentapp.model.UserResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private static final String DATA_DIR = "data";
    private static final String DATA_FILE = DATA_DIR + "/users.json";
    private ObjectMapper objectMapper;
    private Long nextId = 1L;
    
    public UserService() {
        this.objectMapper = new ObjectMapper();
        initializeUserData();
    }
    
    public Map<String, Object> applyUser(UserApplyRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<User> users = getAllUsers();
            
            // 检查用户名是否已存在
            boolean userExists = users.stream()
                    .anyMatch(user -> user.getUsername().equals(request.getUsername()));
            
            if (userExists) {
                response.put("success", false);
                response.put("message", "用户名已存在");
                return response;
            }
            
            // 创建新用户
            Long newId = getNextId();
            User newUser = new User(newId, request.getName(), request.getUsername(), 
                                  request.getPassword(), "pending", "USER");
            users.add(newUser);
            
            // 保存到文件
            saveUsersToFile(users);
            
            response.put("success", true);
            response.put("message", "申请提交成功");
            System.out.println("新用户申请：" + newUser.getName());
            
        } catch (IOException e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "申请失败，请重试");
        }
        
        return response;
    }
    
    public List<UserResponse> getPendingUsers() {
        List<User> users = getAllUsers();
        return users.stream()
            .filter(user -> "pending".equals(user.getStatus()))
            .map(user -> new UserResponse(true, "", user))
            .collect(Collectors.toList());
    }
    
    public List<UserResponse> getApprovedUsers() {
        List<User> users = getAllUsers();
        return users.stream()
                .filter(user -> "approved".equals(user.getStatus()))
                .map(user -> new UserResponse(true, "", user))
                .collect(Collectors.toList());
    }
    
    public Map<String, Object> approveUser(Long userId) {
        return updateUserStatus(userId, "approved", "用户审核通过");
    }
    
    public Map<String, Object> rejectUser(Long userId) {
        return updateUserStatus(userId, "rejected", "用户审核拒绝");
    }
    
    public Map<String, Object> enableUser(Long userId) {
        return updateUserStatus(userId, "approved", "用户已启用");
    }
    
    public Map<String, Object> disableUser(Long userId) {
        return updateUserStatus(userId, "rejected", "用户已禁用");
    }
    
    public User findUserByUsername(String username) {
        return getAllUsers().stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst()
                .orElse(null);
    }
    
    private Map<String, Object> updateUserStatus(Long userId, String status, String message) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<User> users = getAllUsers();
            User user = users.stream()
                    .filter(u -> u.getId().equals(userId))
                    .findFirst()
                    .orElse(null);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }
            
            user.setStatus(status);
            
            // 保存到文件
            saveUsersToFile(users);
            
            response.put("success", true);
            response.put("message", message);
            System.out.println("用户状态更新：" + user.getName() + " -> " + status);
            
        } catch (IOException e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "操作失败，请重试");
        }
        
        return response;
    }
    
    public List<UserResponse> getAllApplications() {
        try {
            List<User> users = getAllUsers();
            return users.stream()
                .map(user -> new UserResponse(true, "", user))
                .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private List<User> getAllUsers() {
        try {
            File file = new File(DATA_FILE);
            if (!file.exists() || file.length() == 0) {
                return new ArrayList<>();
            }
            
            return objectMapper.readValue(file,
                objectMapper.getTypeFactory().constructCollectionType(List.class, User.class));
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private void initializeUserData() {
        try {
            File dataDir = new File(DATA_DIR);
            if (!dataDir.exists()) {
                if (!dataDir.mkdirs()) {
                    throw new IOException("无法创建数据目录");
                }
            }
            
            File file = new File(DATA_FILE);
            if (!file.exists()) {
                List<User> initialData = new ArrayList<>();
                // 创建一个默认管理员账户
                User admin = new User(1L, "管理员", "admin", "admin123", "approved", "ADMIN");
                initialData.add(admin);
                saveUsersToFile(initialData);
                nextId = 2L;
            } else {
                // 如果文件存在，验证其格式
                try {
                    List<User> users = objectMapper.readValue(file,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, User.class));
                    if (users != null) {
                        nextId = users.stream()
                            .mapToLong(User::getId)
                            .max()
                            .orElse(0L) + 1;
                    }
                } catch (IOException e) {
                    // 如果文件格式错误，重新初始化
                    List<User> initialData = new ArrayList<>();
                    saveUsersToFile(initialData);
                    nextId = 1L;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("初始化用户数据失败: " + e.getMessage());
        }
    }
    
    private synchronized Long getNextId() {
        return nextId++;
    }

    public UserResponse reviewUser(Long userId, String action) {
        try {
            List<User> users = getAllUsers();
            Optional<User> userOpt = users.stream()
                .filter(u -> u.getId().equals(userId))
                .findFirst();

            if (!userOpt.isPresent()) {
                return new UserResponse(false, "用户不存在");
            }

            User user = userOpt.get();
            if ("approve".equals(action)) {
                user.setStatus("approved");
            } else if ("reject".equals(action)) {
                user.setStatus("rejected");
            } else {
                return new UserResponse(false, "无效的操作");
            }

            saveUsersToFile(users);
            return new UserResponse(true, "操作成功", user);
        } catch (IOException e) {
            e.printStackTrace();
            return new UserResponse(false, "系统错误");
        }
    }

    private void saveUsersToFile(List<User> users) throws IOException {
        try {
            File file = new File(DATA_FILE);
            objectMapper.writerWithDefaultPrettyPrinter()
                .writeValue(file, users);
        } catch (IOException e) {
            e.printStackTrace();
            throw new IOException("保存用户数据失败: " + e.getMessage());
        }
    }
} 