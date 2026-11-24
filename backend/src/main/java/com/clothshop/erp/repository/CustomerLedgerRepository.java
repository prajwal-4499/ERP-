package com.clothshop.erp.repository;

import com.clothshop.erp.model.CustomerLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerLedgerRepository extends JpaRepository<CustomerLedger, Long> {
    List<CustomerLedger> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
