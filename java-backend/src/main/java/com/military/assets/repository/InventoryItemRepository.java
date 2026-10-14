package com.military.assets.repository;

import com.military.assets.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {
    Optional<InventoryItem> findByBase_IdAndCategory_IdAndAssetName(String baseId, String categoryId, String assetName);

    @Query("SELECT i FROM InventoryItem i WHERE (:baseId IS NULL OR i.base.id = :baseId) AND (:categoryId IS NULL OR i.category.id = :categoryId)")
    java.util.List<InventoryItem> findByFilters(@Param("baseId") String baseId, @Param("categoryId") String categoryId);
}
