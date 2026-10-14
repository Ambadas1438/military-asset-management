package com.military.assets.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ExpenditureRequest {
    private String baseId;
    private String categoryId;
    private String assetName;
    private int quantity;
    private String expenditureType;
    private LocalDate expenditureDate;
    private String missionRef;
    private String afterActionReport;
    private String notes;
}
