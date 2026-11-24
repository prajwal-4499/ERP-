package com.clothshop.erp.repository;

import com.clothshop.erp.model.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    List<InventoryMovement> findByVariantIdOrderByTimestampDesc(Long variantId);
    List<InventoryMovement> findTop100ByOrderByTimestampDesc();
}
