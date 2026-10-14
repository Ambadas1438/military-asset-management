package com.military.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Purchase {
    @Id
    @Column(length = 100)
    private String id;
    @Column(name = "purchase_order", unique = true)
    private String purchaseOrder;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_id")
    private Base base;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private EquipmentCategory category;
    @Column(name = "asset_name")
    private String assetName;
    @Column(name = "serial_or_batch")
    private String serialOrBatch;
    private int quantity;
    @Column(name = "unit_cost")
    private double unitCost;
    @Column(name = "total_cost")
    private double totalCost;
    private String supplier;
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    private String notes;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
