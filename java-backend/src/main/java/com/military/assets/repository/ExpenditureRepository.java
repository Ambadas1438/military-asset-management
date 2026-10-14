package com.military.assets.repository;

import com.military.assets.model.Expenditure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenditureRepository extends JpaRepository<Expenditure, String> {
    long countByExpenditureCodeStartingWith(String prefix);

    @Query("SELECT e FROM Expenditure e JOIN FETCH e.base JOIN FETCH e.category LEFT JOIN FETCH e.authorizedBy WHERE (:baseId IS NULL OR e.base.id = :baseId) AND (:categoryId IS NULL OR e.category.id = :categoryId) ORDER BY e.createdAt DESC")
    List<Expenditure> findByFilters(@Param("baseId") String baseId, @Param("categoryId") String categoryId);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM Expenditure e WHERE (:baseId IS NULL OR e.base.id = :baseId) AND (:categoryId IS NULL OR e.category.id = :categoryId) AND (:assetName IS NULL OR e.assetName = :assetName) AND e.expenditureDate < :date")
    long sumQuantityBeforeDate(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM Expenditure e WHERE (:baseId IS NULL OR e.base.id = :baseId) AND (:categoryId IS NULL OR e.category.id = :categoryId) AND (:assetName IS NULL OR e.assetName = :assetName) AND e.expenditureDate >= :startDate AND e.expenditureDate <= :endDate")
    long sumQuantityInRange(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
