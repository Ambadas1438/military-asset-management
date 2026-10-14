package com.military.assets.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PurchaseRequest {
    private String baseId;
    private String categoryId;
    private String assetName;
    private String serialOrBatch;
    private int quantity;
    private double unitCost;
    private double totalCost;
    private String supplier;
    private LocalDate purchaseDate;
    private String notes;
}
