package com.clothshop.erp.repository;

import com.clothshop.erp.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findByBarcode(String barcode);
    Optional<ProductVariant> findBySku(String sku);
    List<ProductVariant> findByProductId(Long productId);

    @Query("SELECT v FROM ProductVariant v WHERE v.stock <= v.reorderLevel")
    List<ProductVariant> findLowStockVariants();

    @Query("SELECT v FROM ProductVariant v WHERE LOWER(v.barcode) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.sku) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ProductVariant> searchVariants(@Param("query") String query);

    @Query("SELECT v FROM ProductVariant v WHERE v.stock > 0 AND (v.lastSoldAt IS NULL OR v.lastSoldAt <= :cutoffDate)")
    List<ProductVariant> findAgingVariants(@Param("cutoffDate") LocalDateTime cutoffDate);
}
