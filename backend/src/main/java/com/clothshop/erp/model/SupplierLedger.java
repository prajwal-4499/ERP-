package com.clothshop.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_ledger")
public class SupplierLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(length = 50)
    private String invoiceNo;

    @Column(nullable = false, length = 50)
    private String transactionType; // PURCHASE_CREDIT, PAYMENT_MADE, RETURN, ADJUSTMENT

    @Column(precision = 10, scale = 2)
    private BigDecimal debit = BigDecimal.ZERO; // Payment made reduces payable

    @Column(precision = 10, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO; // Purchase credit increases payable

    @Column(precision = 10, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO; // Running payable balance

    @Column(length = 50)
    private String paymentMode; // CASH, UPI, CHEQUE, BANK_TRANSFER

    @Column(length = 100)
    private String referenceNo;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(length = 255)
    private String attachmentUrl;

    private Long createdBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    public SupplierLedger() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public BigDecimal getDebit() { return debit; }
    public void setDebit(BigDecimal debit) { this.debit = debit; }

    public BigDecimal getCredit() { return credit; }
    public void setCredit(BigDecimal credit) { this.credit = credit; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String referenceNo) { this.referenceNo = referenceNo; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
