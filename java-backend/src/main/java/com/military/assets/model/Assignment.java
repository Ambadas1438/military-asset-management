package com.military.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Assignment {
    @Id
    @Column(length = 100)
    private String id;
    @Column(name = "assignment_code", unique = true)
    private String assignmentCode;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_id")
    private Base base;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private EquipmentCategory category;
    @Column(name = "asset_name")
    private String assetName;
    @Column(name = "personnel_name")
    private String personnelName;
    @Column(name = "military_id")
    private String militaryId;
    @Column(name = "military_rank")
    private String rank;
    private String unit;
    private int quantity;
    @Column(name = "issue_date")
    private LocalDate issueDate;
    @Column(name = "return_due_date")
    private LocalDate returnDueDate;
    @Column(name = "return_date")
    private LocalDate returnDate;
    private String status;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private User issuedBy;
    private String notes;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
