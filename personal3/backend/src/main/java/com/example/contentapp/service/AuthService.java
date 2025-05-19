package com.example.contentapp.service;

import com.example.contentapp.model.LoginRequest;
import com.example.contentapp.model.LoginResponse;
import com.example.contentapp.model.User;
import com.example.contentapp.model.UserApplyRequest;
import com.example.contentapp.model.UserResponse;

import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class AuthService {
    private static final String DATA_FILE = "data/users.json";
    private final ObjectMapper objectMapper;

    public AuthService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        initializeDataFile();
    }

    private void initializeDataFile() {
        try {
            File dataDir = new File("data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }

            File file = new File(DATA_FILE);
            if (!file.exists() || file.length() == 0) {
                List<User> defaultUsers = Collections.singletonList(
                    new User(1L, "管理员", "adminwh", "adminwh", "ACTIVE", "ADMIN")
                );
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, defaultUsers);
                System.out.println("已创建默认管理员账号");
            } else {
                try {
                    objectMapper.readValue(file,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, User.class));
                } catch (IOException e) {
                    List<User> defaultUsers = Collections.singletonList(
                        new User(1L, "管理员", "adminwh", "adminwh", "ACTIVE", "ADMIN")
                    );
                    objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, defaultUsers);
                    System.out.println("检测到无效的用户数据，已重新初始化");
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("初始化用户数据时出错: " + e.getMessage());
        }
    }

    public LoginResponse login(LoginRequest request) {
        try {
            System.out.println("收到登录请求: " + request.getUsername());
            List<User> users = readUsers();
            System.out.println("当前用户数: " + users.size());
            
            Optional<User> userOpt = users.stream()
                .filter(u -> u.getUsername().equals(request.getUsername()) && 
                           u.getPassword().equals(request.getPassword()) &&
                           ("ACTIVE".equals(u.getStatus()) || 
                            "approved".equals(u.getStatus())))
                .findFirst();

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                System.out.println("用户登录成功: " + user.getUsername());
                return new LoginResponse(true, "登录成功", user.getUsername(), user.getRole());
            }

            System.out.println("用户登录失败: " + request.getUsername());
            return new LoginResponse(false, "用户名或密码错误", null, null);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("登录异常: " + e.getMessage());
            return new LoginResponse(false, "系统错误: " + e.getMessage(), null, null);
        }
    }

    public UserResponse applyNewUser(UserApplyRequest request) {
        try {
            List<User> users = readUsers();

            // 检查用户名是否已存在
            if (users.stream().anyMatch(u -> u.getUsername().equals(request.getUsername()))) {
                return new UserResponse(false, "用户名已存在");
            }

            // 获取新用户ID
            Long newId = users.stream()
                .mapToLong(User::getId)
                .max()
                .orElse(0L) + 1L;

            // 创建新用户
            User newUser = new User(
                newId,
                request.getName(),
                request.getUsername(),
                request.getPassword(),
                "pending",
                "USER"
            );
            users.add(newUser);

            // 保存用户
            saveUsers(users);
            return new UserResponse(true, "申请成功，等待管理员审核", newUser);
        } catch (Exception e) {
            e.printStackTrace();
            return new UserResponse(false, "申请失败: " + e.getMessage());
        }
    }

    private List<User> readUsers() throws IOException {
        File file = new File(DATA_FILE);
        if (!file.exists()) {
            return new ArrayList<>();
        }
        return objectMapper.readValue(file,
            objectMapper.getTypeFactory().constructCollectionType(List.class, User.class));
    }

    private void saveUsers(List<User> users) throws IOException {
        objectMapper.writerWithDefaultPrettyPrinter()
            .writeValue(new File(DATA_FILE), users);
    }
} 