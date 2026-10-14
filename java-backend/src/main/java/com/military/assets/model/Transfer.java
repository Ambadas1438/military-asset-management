package com.military.assets.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Transfer {
    @Id
    @Column(length = 100)
    private String id;
    @Column(name = "tracking_number", unique = true)
    private String trackingNumber;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "origin_base_id")
    private Base originBase;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_base_id")
    private Base destinationBase;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private EquipmentCategory category;
    @Column(name = "asset_name")
    private String assetName;
    private int quantity;
    private String status;
    @Column(name = "transport_mode")
    private String transportMode;
    @Column(name = "transfer_date")
    private LocalDate transferDate;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "initiated_by")
    private User initiatedBy;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "received_by")
    private User receivedBy;
    private String notes;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
