package com.example.contentapp.service;

import com.example.contentapp.model.Content;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContentService {
    private final String DATA_FILE = "data/contents.json";
    private final ObjectMapper objectMapper;
    
    public ContentService() {
        this.objectMapper = new ObjectMapper();
        // 设置格式化输出，让JSON文件更易读
        this.objectMapper.writerWithDefaultPrettyPrinter();
    }
    
    public List<Content> getAllContents() {
        try {
            File file = new File(DATA_FILE);
            if (!file.exists() || file.length() == 0) {
                initializeData();
            }
            
            TypeFactory typeFactory = objectMapper.getTypeFactory();
            return objectMapper.readValue(file, 
                typeFactory.constructCollectionType(List.class, Content.class));
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    public Content addContent(Content content) {
        try {
            List<Content> contents = getAllContents();
            // 将新内容添加到列表开头，最新数据在最前面
            contents.add(0, content);
            // 使用格式化输出
            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(new File(DATA_FILE), contents);
            System.out.println("新增内容：" + content.getName());
            return content;
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("添加内容失败");
        }
    }
    
    public List<Content> searchContentsByName(String keyword) {
        List<Content> allContents = getAllContents();
        return allContents.stream()
                .filter(content -> content.getName().toLowerCase()
                        .contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }
    
    private void initializeData() {
        try {
            File dataDir = new File("data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }
            
            List<Content> initialData = new ArrayList<>();
            initialData.add(new Content("Spring Boot教程", "零基础学习Spring Boot开发", "https://pan.baidu.com/s/1234567890"));
            initialData.add(new Content("Vue.js前端开发", "现代前端框架Vue.js完整教程", "https://pan.baidu.com/s/0987654321"));
            initialData.add(new Content("MySQL数据库", "数据库设计、优化与实战", "https://pan.baidu.com/s/1357924680"));
            
            // 使用格式化输出
            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(new File(DATA_FILE), initialData);
            System.out.println("数据初始化完成，写入了 " + initialData.size() + " 条记录");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
