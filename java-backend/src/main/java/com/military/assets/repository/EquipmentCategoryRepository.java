package com.military.assets.repository;

import com.military.assets.model.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentCategoryRepository extends JpaRepository<EquipmentCategory, String> {
}
