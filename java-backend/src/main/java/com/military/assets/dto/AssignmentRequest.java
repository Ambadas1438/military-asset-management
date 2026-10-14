package com.military.assets.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AssignmentRequest {
    private String baseId;
    private String categoryId;
    private String assetName;
    private String personnelName;
    private String militaryId;
    private String rank;
    private String unit;
    private int quantity;
    private LocalDate issueDate;
    private LocalDate returnDueDate;
    private String notes;
}
