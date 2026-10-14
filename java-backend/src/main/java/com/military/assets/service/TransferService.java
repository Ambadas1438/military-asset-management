package com.military.assets.service;

import com.military.assets.dto.TransferRequest;
import com.military.assets.model.*;
import com.military.assets.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TransferService {

    @Autowired private TransferRepository transferRepository;
    @Autowired private BaseRepository baseRepository;
    @Autowired private EquipmentCategoryRepository categoryRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InventoryItemRepository inventoryItemRepository;

    @Transactional
    public Transfer createTransfer(TransferRequest req, User currentUser) {
        if (req.getOriginBaseId().equals(req.getDestinationBaseId())) {
            throw new RuntimeException("Origin and destination bases must be different");
        }
        Base originBase = baseRepository.findById(req.getOriginBaseId()).orElseThrow(() -> new RuntimeException("Origin base not found"));
        Base destBase = baseRepository.findById(req.getDestinationBaseId()).orElseThrow(() -> new RuntimeException("Destination base not found"));
        EquipmentCategory category = categoryRepository.findById(req.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));

        int year = java.time.LocalDate.now().getYear();
        long count = transferRepository.countByTrackingNumberStartingWith("TRF-" + year);
        String trackingNumber = "TRF-" + year + "-" + String.format("%04d", count + 1000 + 1);

        User receivedBy = null;
        if (req.getReceivedById() != null) {
            receivedBy = userRepository.findById(req.getReceivedById()).orElse(null);
        }

        Transfer transfer = new Transfer();
        transfer.setId("trf-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        transfer.setTrackingNumber(trackingNumber);
        transfer.setOriginBase(originBase);
        transfer.setDestinationBase(destBase);
        transfer.setCategory(category);
        transfer.setAssetName(req.getAssetName());
        transfer.setQuantity(req.getQuantity());
        transfer.setStatus(req.getStatus() != null ? req.getStatus() : "COMPLETED");
        transfer.setTransportMode(req.getTransportMode());
        transfer.setTransferDate(req.getTransferDate() != null ? req.getTransferDate() : java.time.LocalDate.now());
        transfer.setInitiatedBy(currentUser);
        transfer.setReceivedBy(receivedBy);
        transfer.setNotes(req.getNotes());
        transfer.setCreatedAt(LocalDateTime.now());
        transferRepository.save(transfer);

        // Reduce origin inventory for any initiated transfer (whether COMPLETED or IN_TRANSIT)
        inventoryItemRepository.findByBase_IdAndCategory_IdAndAssetName(req.getOriginBaseId(), req.getCategoryId(), req.getAssetName()).ifPresent(inv -> {
            inv.setCurrentQuantity(Math.max(0, inv.getCurrentQuantity() - req.getQuantity()));
            inv.setUpdatedAt(LocalDateTime.now());
            inventoryItemRepository.save(inv);
        });

        if ("COMPLETED".equals(transfer.getStatus())) {
            // Increase destination inventory immediately
            InventoryItem destInv = inventoryItemRepository
                .findByBase_IdAndCategory_IdAndAssetName(req.getDestinationBaseId(), req.getCategoryId(), req.getAssetName())
                .orElseGet(() -> {
                    InventoryItem newInv = new InventoryItem();
                    newInv.setId("inv-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
                    newInv.setBase(destBase);
                    newInv.setCategory(category);
                    newInv.setAssetName(req.getAssetName());
                    newInv.setInitialBalance(0);
                    newInv.setCurrentQuantity(0);
                    newInv.setMinimumThreshold(0);
                    return newInv;
                });
            destInv.setCurrentQuantity(destInv.getCurrentQuantity() + req.getQuantity());
            destInv.setUpdatedAt(LocalDateTime.now());
            inventoryItemRepository.save(destInv);
        }

        return transfer;
    }

    @Transactional
    public Transfer receiveTransfer(String transferId, User currentUser) {
        Transfer transfer = transferRepository.findById(transferId)
            .orElseThrow(() -> new RuntimeException("Transfer not found: " + transferId));
        if ("COMPLETED".equals(transfer.getStatus())) {
            return transfer;
        }

        transfer.setStatus("COMPLETED");
        if (currentUser != null) {
            transfer.setReceivedBy(currentUser);
        }

        // Increase destination inventory
        InventoryItem destInv = inventoryItemRepository
            .findByBase_IdAndCategory_IdAndAssetName(transfer.getDestinationBase().getId(), transfer.getCategory().getId(), transfer.getAssetName())
            .orElseGet(() -> {
                InventoryItem newInv = new InventoryItem();
                newInv.setId("inv-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
                newInv.setBase(transfer.getDestinationBase());
                newInv.setCategory(transfer.getCategory());
                newInv.setAssetName(transfer.getAssetName());
                newInv.setInitialBalance(0);
                newInv.setCurrentQuantity(0);
                newInv.setMinimumThreshold(0);
                return newInv;
            });
        destInv.setCurrentQuantity(destInv.getCurrentQuantity() + transfer.getQuantity());
        destInv.setUpdatedAt(LocalDateTime.now());
        inventoryItemRepository.save(destInv);

        transferRepository.save(transfer);
        return transfer;
    }
}
