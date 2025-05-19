package com.example.service;

import com.example.model.User;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final String EXCEL_PATH = "username.xlsx";

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        try (FileInputStream fis = new FileInputStream(EXCEL_PATH);
             Workbook workbook = new XSSFWorkbook(fis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            logger.info("开始读取Excel文件，总行数：{}", sheet.getLastRowNum() + 1);
            
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // 跳过表头

                User user = new User();
                user.setName(getCellValueAsString(row.getCell(0)));
                user.setUsername(getCellValueAsString(row.getCell(1)));
                user.setPassword(getCellValueAsString(row.getCell(2)));
                logger.info("读取到用户：name={}, username={}", user.getName(), user.getUsername());
                users.add(user);
            }
        } catch (IOException e) {
            logger.error("读取Excel文件失败", e);
            e.printStackTrace();
        }
        return users;
    }

    public boolean validateUser(String username, String password) {
        logger.info("尝试验证用户：username={}", username);
        List<User> users = getAllUsers();
        boolean isValid = users.stream()
                .anyMatch(user -> {
                    boolean matches = user.getUsername().equals(username) && user.getPassword().equals(password);
                    if (matches) {
                        logger.info("用户验证成功：username={}", username);
                    }
                    return matches;
                });
        
        if (!isValid) {
            logger.warn("用户验证失败：username={}", username);
        }
        return isValid;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        try {
            switch (cell.getCellType()) {
                case STRING:
                    return cell.getStringCellValue().trim();
                case NUMERIC:
                    return String.valueOf((int) cell.getNumericCellValue());
                default:
                    return "";
            }
        } catch (Exception e) {
            logger.error("读取单元格失败：{}", e.getMessage());
            return "";
        }
    }
} 