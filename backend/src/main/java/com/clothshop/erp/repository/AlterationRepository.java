package com.clothshop.erp.repository;

import com.clothshop.erp.model.Alteration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlterationRepository extends JpaRepository<Alteration, Long> {
    List<Alteration> findByStatusOrderByDueDateAsc(String status);
    List<Alteration> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
