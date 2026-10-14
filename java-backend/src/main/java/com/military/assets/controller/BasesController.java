package com.military.assets.controller;

import com.military.assets.model.Base;
import com.military.assets.model.EquipmentCategory;
import com.military.assets.model.InventoryItem;
import com.military.assets.repository.BaseRepository;
import com.military.assets.repository.EquipmentCategoryRepository;
import com.military.assets.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BasesController {

    @Autowired private BaseRepository baseRepository;
    @Autowired private EquipmentCategoryRepository categoryRepository;
    @Autowired private InventoryItemRepository inventoryItemRepository;

    // ── Get all bases ──────────────────────────────────────────
    @GetMapping("/bases")
    public ResponseEntity<?> listBases() {
        List<Base> bases = baseRepository.findAll();
        return ResponseEntity.ok(Map.of("bases", bases));
    }

    @GetMapping("/bases/{id}")
    public ResponseEntity<?> getBase(@PathVariable String id) {
        return baseRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ── Get equipment categories (support both /api/bases/categories and /api/categories)
    @GetMapping({"/bases/categories", "/categories"})
    public ResponseEntity<?> listCategories() {
        List<EquipmentCategory> categories = categoryRepository.findAll();
        return ResponseEntity.ok(Map.of("categories", categories));
    }

    // ── Get inventory items by base and category ──────────────
    @GetMapping({"/bases/inventory", "/inventory"})
    public ResponseEntity<?> listInventory(
            @RequestParam(required = false) String baseId,
            @RequestParam(required = false) String categoryId) {
        String cleanBaseId = (baseId != null && !baseId.isBlank()) ? baseId : null;
        String cleanCatId = (categoryId != null && !categoryId.isBlank()) ? categoryId : null;
        List<InventoryItem> items = inventoryItemRepository.findByFilters(cleanBaseId, cleanCatId);
        return ResponseEntity.ok(Map.of("items", items));
    }
}
