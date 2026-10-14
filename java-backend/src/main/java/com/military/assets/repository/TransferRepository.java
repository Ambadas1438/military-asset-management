package com.military.assets.repository;

import com.military.assets.model.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, String> {
    long countByTrackingNumberStartingWith(String prefix);

    @Query("SELECT t FROM Transfer t JOIN FETCH t.originBase JOIN FETCH t.destinationBase JOIN FETCH t.category LEFT JOIN FETCH t.initiatedBy WHERE (:baseId IS NULL OR t.originBase.id = :baseId OR t.destinationBase.id = :baseId) AND (:status IS NULL OR t.status = :status) ORDER BY t.createdAt DESC")
    List<Transfer> findByFilters(@Param("baseId") String baseId, @Param("status") String status);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t WHERE t.destinationBase.id = :baseId AND (:categoryId IS NULL OR t.category.id = :categoryId) AND (:assetName IS NULL OR t.assetName = :assetName) AND t.status = 'COMPLETED' AND t.transferDate < :date")
    long sumTransfersInBeforeDate(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t WHERE t.originBase.id = :baseId AND (:categoryId IS NULL OR t.category.id = :categoryId) AND (:assetName IS NULL OR t.assetName = :assetName) AND t.status = 'COMPLETED' AND t.transferDate < :date")
    long sumTransfersOutBeforeDate(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t WHERE t.destinationBase.id = :baseId AND (:categoryId IS NULL OR t.category.id = :categoryId) AND (:assetName IS NULL OR t.assetName = :assetName) AND t.status = 'COMPLETED' AND t.transferDate >= :startDate AND t.transferDate <= :endDate")
    long sumTransfersInRange(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t WHERE t.originBase.id = :baseId AND (:categoryId IS NULL OR t.category.id = :categoryId) AND (:assetName IS NULL OR t.assetName = :assetName) AND t.status = 'COMPLETED' AND t.transferDate >= :startDate AND t.transferDate <= :endDate")
    long sumTransfersOutRange(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
