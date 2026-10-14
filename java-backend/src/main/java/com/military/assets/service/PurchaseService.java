package com.military.assets.service;

import com.military.assets.dto.PurchaseRequest;
import com.military.assets.model.*;
import com.military.assets.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PurchaseService {

    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private BaseRepository baseRepository;
    @Autowired private EquipmentCategoryRepository categoryRepository;
    @Autowired private InventoryItemRepository inventoryItemRepository;

    @Transactional
    public Purchase createPurchase(PurchaseRequest req, User currentUser) {
        Base base = baseRepository.findById(req.getBaseId()).orElseThrow(() -> new RuntimeException("Base not found"));
        EquipmentCategory category = categoryRepository.findById(req.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));

        int year = java.time.LocalDate.now().getYear();
        long count = purchaseRepository.countByPurchaseOrderStartingWith("PO-" + year);
        String purchaseOrder = "PO-" + year + "-" + String.format("%04d", count + 1000 + 1);

        Purchase purchase = new Purchase();
        purchase.setId("pur-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        purchase.setPurchaseOrder(purchaseOrder);
        purchase.setBase(base);
        purchase.setCategory(category);
        purchase.setAssetName(req.getAssetName());
        purchase.setSerialOrBatch(req.getSerialOrBatch());
        purchase.setQuantity(req.getQuantity());
        purchase.setUnitCost(req.getUnitCost());
        purchase.setTotalCost(req.getTotalCost() > 0 ? req.getTotalCost() : req.getUnitCost() * req.getQuantity());
        purchase.setSupplier(req.getSupplier());
        purchase.setPurchaseDate(req.getPurchaseDate() != null ? req.getPurchaseDate() : java.time.LocalDate.now());
        purchase.setCreatedBy(currentUser);
        purchase.setNotes(req.getNotes());
        purchase.setCreatedAt(LocalDateTime.now());
        purchaseRepository.save(purchase);

        // Update inventory
        InventoryItem inv = inventoryItemRepository
            .findByBase_IdAndCategory_IdAndAssetName(req.getBaseId(), req.getCategoryId(), req.getAssetName())
            .orElseGet(() -> {
                InventoryItem newInv = new InventoryItem();
                newInv.setId("inv-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
                newInv.setBase(base);
                newInv.setCategory(category);
                newInv.setAssetName(req.getAssetName());
                newInv.setInitialBalance(0);
                newInv.setCurrentQuantity(0);
                newInv.setMinimumThreshold(0);
                return newInv;
            });
        inv.setCurrentQuantity(inv.getCurrentQuantity() + req.getQuantity());
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryItemRepository.save(inv);

        return purchase;
    }
}
