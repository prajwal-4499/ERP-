package com.clothshop.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @Column(length = 20)
    private String invoiceType = "RETAIL"; // RETAIL, TAX, PROFORMA, CREDIT_NOTE, RETURN

    private Long customerId;

    @Column(length = 100)
    private String customerName = "Walk-in Customer";

    @Column(length = 20)
    private String customerPhone;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal itemDiscountTotal = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal billDiscount = BigDecimal.ZERO;

    @Column(length = 10)
    private String discountType = "FLAT"; // FLAT, PERCENT

    @Column(precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal igstAmount = BigDecimal.ZERO;

    private Boolean isInterState = false;

    @Column(precision = 10, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal creditNoteIssued = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal creditNoteRedeemed = BigDecimal.ZERO;

    @Column(length = 50)
    private String returnRefInvoiceNumber;

    private Long salesmanId;

    @Column(length = 100)
    private String salesmanName;

    @Column(precision = 10, scale = 2)
    private BigDecimal commissionAmount = BigDecimal.ZERO;

    @Column(length = 50)
    private String paymentMode = "CASH"; // CASH, CREDIT, UPI, CARD, CHEQUE, BANK_TRANSFER, SPLIT

    @Column(length = 50)
    private String status = "COMPLETED"; // DRAFT, COMPLETED, PAID, PARTIAL, CREDIT, CANCELLED, RETURNED, EDITED

    private Long cashierId;

    @Column(length = 100)
    private String cashierName;

    private Long branchId = 1L;
    private Long storeId = 1L;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvoiceItem> items = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Invoice() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getInvoiceType() { return invoiceType; }
    public void setInvoiceType(String invoiceType) { this.invoiceType = invoiceType; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getItemDiscountTotal() { return itemDiscountTotal; }
    public void setItemDiscountTotal(BigDecimal itemDiscountTotal) { this.itemDiscountTotal = itemDiscountTotal; }

    public BigDecimal getBillDiscount() { return billDiscount; }
    public void setBillDiscount(BigDecimal billDiscount) { this.billDiscount = billDiscount; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public BigDecimal getBalanceAmount() { return balanceAmount; }
    public void setBalanceAmount(BigDecimal balanceAmount) { this.balanceAmount = balanceAmount; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getCashierId() { return cashierId; }
    public void setCashierId(Long cashierId) { this.cashierId = cashierId; }

    public String getCashierName() { return cashierName; }
    public void setCashierName(String cashierName) { this.cashierName = cashierName; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<InvoiceItem> getItems() { return items; }
    public void setItems(List<InvoiceItem> items) { this.items = items; }

    public BigDecimal getCgstAmount() { return cgstAmount; }
    public void setCgstAmount(BigDecimal cgstAmount) { this.cgstAmount = cgstAmount; }

    public BigDecimal getSgstAmount() { return sgstAmount; }
    public void setSgstAmount(BigDecimal sgstAmount) { this.sgstAmount = sgstAmount; }

    public BigDecimal getIgstAmount() { return igstAmount; }
    public void setIgstAmount(BigDecimal igstAmount) { this.igstAmount = igstAmount; }

    public Boolean getIsInterState() { return isInterState; }
    public void setIsInterState(Boolean isInterState) { this.isInterState = isInterState; }

    public BigDecimal getCreditNoteIssued() { return creditNoteIssued; }
    public void setCreditNoteIssued(BigDecimal creditNoteIssued) { this.creditNoteIssued = creditNoteIssued; }

    public BigDecimal getCreditNoteRedeemed() { return creditNoteRedeemed; }
    public void setCreditNoteRedeemed(BigDecimal creditNoteRedeemed) { this.creditNoteRedeemed = creditNoteRedeemed; }

    public String getReturnRefInvoiceNumber() { return returnRefInvoiceNumber; }
    public void setReturnRefInvoiceNumber(String returnRefInvoiceNumber) { this.returnRefInvoiceNumber = returnRefInvoiceNumber; }

    public Long getSalesmanId() { return salesmanId; }
    public void setSalesmanId(Long salesmanId) { this.salesmanId = salesmanId; }

    public String getSalesmanName() { return salesmanName; }
    public void setSalesmanName(String salesmanName) { this.salesmanName = salesmanName; }

    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
