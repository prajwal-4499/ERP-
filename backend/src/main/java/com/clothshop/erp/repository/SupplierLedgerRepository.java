package com.clothshop.erp.repository;

import com.clothshop.erp.model.SupplierLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierLedgerRepository extends JpaRepository<SupplierLedger, Long> {
    List<SupplierLedger> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);
}
