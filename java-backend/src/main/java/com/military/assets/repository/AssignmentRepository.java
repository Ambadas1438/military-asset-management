package com.military.assets.repository;

import com.military.assets.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    long countByAssignmentCodeStartingWith(String prefix);

    @Query("SELECT a FROM Assignment a JOIN FETCH a.base JOIN FETCH a.category LEFT JOIN FETCH a.issuedBy WHERE (:baseId IS NULL OR a.base.id = :baseId) AND (:status IS NULL OR a.status = :status) ORDER BY a.createdAt DESC")
    List<Assignment> findByFilters(@Param("baseId") String baseId, @Param("status") String status);

    @Query("SELECT COALESCE(SUM(a.quantity), 0) FROM Assignment a WHERE (:baseId IS NULL OR a.base.id = :baseId) AND (:categoryId IS NULL OR a.category.id = :categoryId) AND (:assetName IS NULL OR a.assetName = :assetName) AND a.status = 'ACTIVE' AND a.issueDate >= :startDate AND a.issueDate <= :endDate")
    long sumActiveInRange(@Param("baseId") String baseId, @Param("categoryId") String categoryId, @Param("assetName") String assetName, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
