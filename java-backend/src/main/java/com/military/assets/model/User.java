package com.military.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @Column(length = 100)
    private String id;
    private String username;
    private String name;
    private String email;
    private String role;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_id")
    private Base base;
    @Column(name = "military_rank")
    private String rank;
    @Column(name = "service_number")
    private String serviceNumber;
    private String avatar;
    @Column(name = "password")
    private String password;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public User(String id, String username, String name, String email, String role, Base base, String rank, String serviceNumber, String avatar, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.email = email;
        this.role = role;
        this.base = base;
        this.rank = rank;
        this.serviceNumber = serviceNumber;
        this.avatar = avatar;
        this.createdAt = createdAt;
        this.password = "password123";
    }
}
