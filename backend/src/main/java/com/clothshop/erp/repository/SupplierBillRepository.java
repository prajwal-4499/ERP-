package com.clothshop.erp.repository;

import com.clothshop.erp.model.SupplierBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierBillRepository extends JpaRepository<SupplierBill, Long> {
    List<SupplierBill> findBySupplierIdOrderByPurchaseDateDesc(Long supplierId);
    List<SupplierBill> findByPaymentStatus(String paymentStatus);
}
