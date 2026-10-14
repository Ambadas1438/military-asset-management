package com.military.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "equipment_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EquipmentCategory {
    @Id
    @Column(length = 100)
    private String id;
    private String name;
    private String code;
    @Column(name = "unit_of_measure")
    private String unitOfMeasure;
    private String icon;
    private String description;
}
