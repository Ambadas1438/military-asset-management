package com.military.assets.service;

import com.military.assets.model.*;
import com.military.assets.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private InventoryItemRepository inventoryItemRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private TransferRepository transferRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private ExpenditureRepository expenditureRepository;
    @Autowired private BaseRepository baseRepository;
    @Autowired private EquipmentCategoryRepository categoryRepository;

    public Map<String, Object> getMetrics(String baseId, String categoryId, LocalDate startDate, LocalDate endDate, String userRole, String userBaseId) {
        // Commanders are locked to their own base
        if ("commander".equals(userRole) && userBaseId != null) {
            baseId = userBaseId;
        }

        final String effectiveBaseId = (baseId != null && !baseId.isBlank()) ? baseId : null;
        final String effectiveCategoryId = (categoryId != null && !categoryId.isBlank()) ? categoryId : null;
        final LocalDate effectiveStart = startDate != null ? startDate : LocalDate.of(2020, 1, 1);
        final LocalDate effectiveEnd = endDate != null ? endDate : LocalDate.now();

        boolean isAllBases = effectiveBaseId == null;

        // Get all inventory items for scope
        List<InventoryItem> inventoryItems = inventoryItemRepository.findByFilters(effectiveBaseId, effectiveCategoryId);

        // Calculate summary metrics
        long openingBalance = 0;
        long totalPurchases = 0;
        double totalPurchasesCost = 0;
        long totalTransfersIn = 0;
        long totalTransfersOut = 0;
        long totalAssigned = 0;
        long totalExpended = 0;

        // Per-asset detailed calculations
        List<Map<String, Object>> detailedAssets = new ArrayList<>();

        // Group inventory items by base+category+assetName
        for (InventoryItem item : inventoryItems) {
            String iBaseId = item.getBase().getId();
            String iCatId = item.getCategory().getId();
            String iAssetName = item.getAssetName();

            // Opening balance components (all before startDate)
            long initialSum = item.getInitialBalance();
            long priorPurchases = purchaseRepository.sumQuantityBeforeDate(iBaseId, iCatId, iAssetName, effectiveStart);
            long priorExp = expenditureRepository.sumQuantityBeforeDate(iBaseId, iCatId, iAssetName, effectiveStart);
            long priorTrfIn;
            long priorTrfOut;

            if (isAllBases) {
                // For all bases view: inter-base transfers cancel out
                priorTrfIn = 0;
                priorTrfOut = 0;
            } else {
                priorTrfIn = transferRepository.sumTransfersInBeforeDate(iBaseId, iCatId, iAssetName, effectiveStart);
                priorTrfOut = transferRepository.sumTransfersOutBeforeDate(iBaseId, iCatId, iAssetName, effectiveStart);
            }

            long itemOpeningBalance = initialSum + priorPurchases + priorTrfIn - priorTrfOut - priorExp;
            openingBalance += itemOpeningBalance;

            // In-range calculations
            long inRangePurchases = purchaseRepository.sumQuantityInRange(iBaseId, iCatId, iAssetName, effectiveStart, effectiveEnd);
            double inRangePurchasesCost = purchaseRepository.sumCostInRange(iBaseId, iCatId, iAssetName, effectiveStart, effectiveEnd);
            long inRangeExp = expenditureRepository.sumQuantityInRange(iBaseId, iCatId, iAssetName, effectiveStart, effectiveEnd);
            long inRangeAssigned = assignmentRepository.sumActiveInRange(iBaseId, iCatId, iAssetName, effectiveStart, effectiveEnd);
            long inRangeTrfIn;
            long inRangeTrfOut;

            if (isAllBases) {
                inRangeTrfIn = 0;
                inRangeTrfOut = 0;
            } else {
                inRangeTrfIn = transferRepository.sumTransfersInRange(iBaseId, iCatId, iAssetName, effectiveStart, effectiveEnd);
                inRangeTrfOut = transferRepository.sumTransfersOutRange(iBaseId, iCatId, iAssetName, effectiveStart, effectiveEnd);
            }

            totalPurchases += inRangePurchases;
            totalPurchasesCost += inRangePurchasesCost;
            totalTransfersIn += inRangeTrfIn;
            totalTransfersOut += inRangeTrfOut;
            totalAssigned += inRangeAssigned;
            totalExpended += inRangeExp;

            long closingBalance = itemOpeningBalance + inRangePurchases + inRangeTrfIn - inRangeTrfOut - inRangeExp;

            Map<String, Object> assetDetail = new LinkedHashMap<>();
            assetDetail.put("inventoryId", item.getId());
            assetDetail.put("baseId", iBaseId);
            assetDetail.put("baseName", item.getBase().getName());
            assetDetail.put("categoryId", iCatId);
            assetDetail.put("categoryName", item.getCategory().getName());
            assetDetail.put("assetName", iAssetName);
            assetDetail.put("openingBalance", itemOpeningBalance);
            assetDetail.put("purchases", inRangePurchases);
            assetDetail.put("transfersIn", inRangeTrfIn);
            assetDetail.put("transfersOut", inRangeTrfOut);
            assetDetail.put("expended", inRangeExp);
            assetDetail.put("assigned", inRangeAssigned);
            assetDetail.put("closingBalance", closingBalance);
            assetDetail.put("currentStock", item.getCurrentQuantity());
            detailedAssets.add(assetDetail);
        }

        long netMovement = totalTransfersIn - totalTransfersOut;
        long closingBalance = openingBalance + totalPurchases + totalTransfersIn - totalTransfersOut - totalExpended;

        // Category stats
        Map<String, Object> categoryStats = new LinkedHashMap<>();
        List<EquipmentCategory> cats = categoryRepository.findAll();
        for (EquipmentCategory cat : cats) {
            if (effectiveCategoryId != null && !cat.getId().equals(effectiveCategoryId)) continue;
            long catStock = inventoryItems.stream()
                .filter(i -> i.getCategory().getId().equals(cat.getId()))
                .mapToLong(InventoryItem::getCurrentQuantity)
                .sum();
            Map<String, Object> catStat = new LinkedHashMap<>();
            catStat.put("id", cat.getId());
            catStat.put("name", cat.getName());
            catStat.put("code", cat.getCode());
            catStat.put("totalStock", catStock);
            categoryStats.put(cat.getId(), catStat);
        }

        // Popup breakdowns - get recent purchases, transfers in/out
        List<Purchase> recentPurchases = purchaseRepository.findByFilters(effectiveBaseId, effectiveCategoryId, effectiveStart, effectiveEnd);
        List<Transfer> recentTransfers = transferRepository.findByFilters(effectiveBaseId, null);
        List<Transfer> trfIn = recentTransfers.stream()
            .filter(t -> "COMPLETED".equals(t.getStatus()) && (effectiveBaseId == null || t.getDestinationBase().getId().equals(effectiveBaseId)))
            .collect(Collectors.toList());
        List<Transfer> trfOut = recentTransfers.stream()
            .filter(t -> "COMPLETED".equals(t.getStatus()) && (effectiveBaseId == null || t.getOriginBase().getId().equals(effectiveBaseId)))
            .collect(Collectors.toList());

        // Assignments in range
        List<Assignment> assignments = assignmentRepository.findByFilters(effectiveBaseId, null);
        List<Expenditure> expenditures = new ArrayList<>();
        // Get recent expenditures directly from DB
        expenditureRepository.findAll().stream()
            .filter(e -> effectiveBaseId == null || e.getBase().getId().equals(effectiveBaseId))
            .filter(e -> effectiveCategoryId == null || e.getCategory().getId().equals(effectiveCategoryId))
            .forEach(expenditures::add);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("openingBalance", openingBalance);
        summary.put("totalPurchases", totalPurchases);
        summary.put("totalPurchasesCost", totalPurchasesCost);
        summary.put("totalTransfersIn", totalTransfersIn);
        summary.put("totalTransfersOut", totalTransfersOut);
        summary.put("netMovement", netMovement);
        summary.put("totalAssigned", totalAssigned);
        summary.put("totalExpended", totalExpended);
        summary.put("closingBalance", closingBalance);

        Map<String, Object> filters = new LinkedHashMap<>();
        filters.put("baseId", effectiveBaseId);
        filters.put("categoryId", effectiveCategoryId);
        filters.put("startDate", effectiveStart.toString());
        filters.put("endDate", effectiveEnd.toString());

        Map<String, Object> popupBreakdown = new LinkedHashMap<>();
        popupBreakdown.put("purchases", recentPurchases.stream().limit(10).map(this::purchaseToMap).collect(Collectors.toList()));
        popupBreakdown.put("transfersIn", trfIn.stream().limit(10).map(this::transferToMap).collect(Collectors.toList()));
        popupBreakdown.put("transfersOut", trfOut.stream().limit(10).map(this::transferToMap).collect(Collectors.toList()));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("filters", filters);
        result.put("summary", summary);
        result.put("popupBreakdown", popupBreakdown);
        result.put("categoryStats", new ArrayList<>(categoryStats.values()));
        result.put("detailedAssets", detailedAssets);
        result.put("assignments", assignments.stream().limit(20).map(this::assignmentToMap).collect(Collectors.toList()));
        result.put("expenditures", expenditures.stream().limit(20).map(this::expenditureToMap).collect(Collectors.toList()));

        return result;
    }

    private Map<String, Object> purchaseToMap(Purchase p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("purchaseOrder", p.getPurchaseOrder());
        m.put("baseId", p.getBase().getId());
        m.put("baseName", p.getBase().getName());
        m.put("assetName", p.getAssetName());
        m.put("quantity", p.getQuantity());
        m.put("totalCost", p.getTotalCost());
        m.put("purchaseDate", p.getPurchaseDate());
        return m;
    }

    private Map<String, Object> transferToMap(Transfer t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("trackingNumber", t.getTrackingNumber());
        m.put("originBaseId", t.getOriginBase().getId());
        m.put("originBaseName", t.getOriginBase().getName());
        m.put("destinationBaseId", t.getDestinationBase().getId());
        m.put("destinationBaseName", t.getDestinationBase().getName());
        m.put("assetName", t.getAssetName());
        m.put("quantity", t.getQuantity());
        m.put("status", t.getStatus());
        m.put("transferDate", t.getTransferDate());
        return m;
    }

    private Map<String, Object> assignmentToMap(Assignment a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("assignmentCode", a.getAssignmentCode());
        m.put("baseId", a.getBase().getId());
        m.put("assetName", a.getAssetName());
        m.put("personnelName", a.getPersonnelName());
        m.put("quantity", a.getQuantity());
        m.put("status", a.getStatus());
        m.put("issueDate", a.getIssueDate());
        return m;
    }

    private Map<String, Object> expenditureToMap(Expenditure e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", e.getId());
        m.put("expenditureCode", e.getExpenditureCode());
        m.put("baseId", e.getBase().getId());
        m.put("assetName", e.getAssetName());
        m.put("quantity", e.getQuantity());
        m.put("expenditureType", e.getExpenditureType());
        m.put("expenditureDate", e.getExpenditureDate());
        return m;
    }
}
