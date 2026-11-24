package com.clothshop.erp.repository;

import com.clothshop.erp.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT i FROM Invoice i WHERE LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(i.customerName) LIKE LOWER(CONCAT('%', :query, '%')) OR i.customerPhone LIKE CONCAT('%', :query, '%') ORDER BY i.createdAt DESC")
    List<Invoice> searchInvoices(@Param("query") String query);

    List<Invoice> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
