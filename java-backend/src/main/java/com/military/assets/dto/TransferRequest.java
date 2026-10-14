package com.military.assets.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TransferRequest {
    private String originBaseId;
    private String destinationBaseId;
    private String categoryId;
    private String assetName;
    private int quantity;
    private String status;
    private String transportMode;
    private LocalDate transferDate;
    private String receivedById;
    private String notes;
}
