package com.military.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Base {
    @Id
    @Column(length = 100)
    private String id;
    private String code;
    private String name;
    private String location;
    @Column(name = "commander_name")
    private String commanderName;
    @Column(name = "security_level")
    private String securityLevel;
    private String status;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
