package com.military.assets.repository;

import com.military.assets.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, String> {
    long countByPurchaseOrderStartingWith(String prefix);

    @Query("SELECT p FROM Purchase p JOIN FETCH p.base JOIN FETCH p.category LEFT JOIN FETCH p.createdBy WHERE (:baseId IS NULL OR p.base.id = :baseId) AND (:categoryId IS NULL OR p.category.id = :categoryId) AND (:startDate IS NULL OR p.purchaseDate >= :startDate) AND (:endDate IS NULL OR p.purchaseDate <= :endDate) ORDER BY p.createdAt DESC")
    List<Purchase> findByFilters(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p WHERE (:baseId IS NULL OR p.base.id = :baseId) AND (:categoryId IS NULL OR p.category.id = :categoryId) AND (:assetName IS NULL OR p.assetName = :assetName) AND p.purchaseDate < :date")
    long sumQuantityBeforeDate(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p WHERE (:baseId IS NULL OR p.base.id = :baseId) AND (:categoryId IS NULL OR p.category.id = :categoryId) AND (:assetName IS NULL OR p.assetName = :assetName) AND p.purchaseDate >= :startDate AND p.purchaseDate <= :endDate")
    long sumQuantityInRange(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.totalCost), 0) FROM Purchase p WHERE (:baseId IS NULL OR p.base.id = :baseId) AND (:categoryId IS NULL OR p.category.id = :categoryId) AND (:assetName IS NULL OR p.assetName = :assetName) AND p.purchaseDate >= :startDate AND p.purchaseDate <= :endDate")
    double sumCostInRange(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
