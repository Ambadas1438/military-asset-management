package com.military.assets.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"base_id", "category_id", "asset_name"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {
    @Id
    @Column(length = 100)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_id")
    private Base base;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private EquipmentCategory category;
    @Column(name = "asset_name")
    private String assetName;
    @Column(name = "model_number")
    private String modelNumber;
    @Column(name = "initial_balance")
    private int initialBalance;
    @Column(name = "current_quantity")
    private int currentQuantity;
    @Column(name = "minimum_threshold")
    private int minimumThreshold;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
