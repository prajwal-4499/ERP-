package com.clothshop.erp.repository;

import com.clothshop.erp.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR s.phone LIKE CONCAT('%', :query, '%') OR LOWER(s.gstin) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Supplier> searchSuppliers(@Param("query") String query);

    @Query("SELECT s FROM Supplier s WHERE s.outstandingPayable > 0 ORDER BY s.outstandingPayable DESC")
    List<Supplier> findSuppliersWithPayables();
}
