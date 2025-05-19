package com.example.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.io.OutputStreamWriter;
import java.io.FileOutputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.File;

@Service
public class MessageService {
    
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    
    @Value("${message.file.path}")
    private String messageFilePath;
    
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void saveMessage(String content) throws IOException {
        // 处理文件路径
        String cleanPath = messageFilePath.trim();
        logger.info("准备保存留言到文件: {}", cleanPath);
        
        // 检查文件路径
        File file = new File(cleanPath);
        File parentDir = file.getParentFile();
        
        // 确保目录存在
        if (parentDir != null && !parentDir.exists()) {
            logger.info("创建目录: {}", parentDir.getAbsolutePath());
            if (!parentDir.mkdirs()) {
                throw new IOException("无法创建目录: " + parentDir.getAbsolutePath());
            }
        }
        
        // 检查文件是否可写
        if (file.exists() && !file.canWrite()) {
            throw new IOException("文件不可写: " + file.getAbsolutePath());
        }

        logger.info("开始写入文件: {}", file.getAbsolutePath());
        
        // 使用UTF-8编码写入文件
        try (PrintWriter writer = new PrintWriter(
                new OutputStreamWriter(
                    new FileOutputStream(file, true),
                    StandardCharsets.UTF_8))) {
            String timestamp = LocalDateTime.now().format(formatter);
            String message = String.format("时间: %s\n内容: %s\n----------------------------------------\n", 
                timestamp, content);
            writer.write(message);
            writer.flush();
            logger.info("留言保存成功，文件大小: {} 字节", file.length());
        } catch (IOException e) {
            logger.error("保存留言失败", e);
            throw e;
        }
    }
} 