package com.example.service;

import com.example.model.Content;
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
public class ContentService {
    private static final Logger logger = LoggerFactory.getLogger(ContentService.class);
    private static final String EXCEL_PATH = "link.xlsx";

    public List<Content> getAllContents() {
        List<Content> contents = new ArrayList<>();
        try (FileInputStream fis = new FileInputStream(EXCEL_PATH);
             Workbook workbook = new XSSFWorkbook(fis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            logger.info("开始读取Excel文件，总行数：{}", sheet.getLastRowNum() + 1);
            
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // 跳过表头

                Content content = new Content();
                content.setName(getCellValueAsString(row.getCell(0)));
                content.setDescription(getCellValueAsString(row.getCell(1)));
                content.setDownloadLink(getCellValueAsString(row.getCell(2)));
                
                if (!content.getName().isEmpty()) {
                    logger.info("读取到内容：name={}", content.getName());
                    contents.add(content);
                }
            }
        } catch (IOException e) {
            logger.error("读取Excel文件失败", e);
        }
        return contents;
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