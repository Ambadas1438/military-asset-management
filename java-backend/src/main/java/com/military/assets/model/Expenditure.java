package com.military.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenditures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Expenditure {
    @Id
    @Column(length = 100)
    private String id;
    @Column(name = "expenditure_code", unique = true)
    private String expenditureCode;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_id")
    private Base base;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private EquipmentCategory category;
    @Column(name = "asset_name")
    private String assetName;
    private int quantity;
    @Column(name = "expenditure_type")
    private String expenditureType;
    @Column(name = "expenditure_date")
    private LocalDate expenditureDate;
    @Column(name = "mission_ref")
    private String missionRef;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "authorized_by")
    private User authorizedBy;
    @Column(name = "after_action_report", columnDefinition = "TEXT")
    private String afterActionReport;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
