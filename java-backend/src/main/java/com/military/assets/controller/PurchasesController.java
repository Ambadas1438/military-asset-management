package com.military.assets.controller;

import com.military.assets.dto.PurchaseRequest;
import com.military.assets.model.Purchase;
import com.military.assets.model.User;
import com.military.assets.repository.PurchaseRepository;
import com.military.assets.service.AuditService;
import com.military.assets.service.PurchaseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchases")
public class PurchasesController {

    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private PurchaseService purchaseService;
    @Autowired private AuditService auditService;

    @GetMapping
    public ResponseEntity<?> listPurchases(
            @RequestParam(required = false) String baseId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user != null && "commander".equals(user.getRole()) && user.getBase() != null) {
            baseId = user.getBase().getId();
        }
        List<Purchase> list = purchaseRepository.findByFilters(baseId, categoryId, startDate, endDate);
        return ResponseEntity.ok(Map.of("purchases", list));
    }

    @PostMapping
    public ResponseEntity<?> createPurchase(@RequestBody PurchaseRequest req, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        Purchase purchase = purchaseService.createPurchase(req, user);
        auditService.log(user, "RECORD_PURCHASE", "Purchase", purchase.getId(),
            "{\"purchaseOrder\":\"" + purchase.getPurchaseOrder() + "\",\"quantity\":" + purchase.getQuantity() + "}",
            request.getRemoteAddr());
        return ResponseEntity.ok(purchase);
    }
}
