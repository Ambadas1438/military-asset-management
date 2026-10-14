package com.military.assets.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @Column(length = 100)
    private String id;
    private LocalDateTime timestamp;
    @Column(name = "user_id", length = 100)
    private String userId;
    @Column(name = "user_name")
    private String userName;
    @Column(name = "user_role")
    private String userRole;
    @Column(name = "base_id", length = 100)
    private String baseId;
    private String action;
    @Column(name = "entity_type")
    private String entityType;
    @Column(name = "entity_id", length = 100)
    private String entityId;
    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
    @Column(name = "ip_address")
    private String ipAddress;
}
