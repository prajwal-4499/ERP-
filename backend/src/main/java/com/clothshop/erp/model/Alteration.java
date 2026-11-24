package com.clothshop.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alterations")
public class Alteration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String orderNumber;

    private Long customerId;

    @Column(length = 100)
    private String customerName;

    @Column(length = 20)
    private String customerPhone;

    @Column(length = 50)
    private String invoiceNumber;

    @Column(length = 150)
    private String garmentItem;

    @Column(columnDefinition = "TEXT")
    private String measurements; // JSON or formatted text: Length, Waist, Chest, Inseam, etc.

    @Column(length = 100)
    private String tailorName;

    @Column(columnDefinition = "TEXT")
    private String tailorNotes;

    private LocalDate dueDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal alterationCharge = BigDecimal.ZERO;

    @Column(length = 50)
    private String status = "PENDING"; // PENDING, ASSIGNED, IN_PROGRESS, READY, DELIVERED, CANCELLED

    private Boolean notifyCustomerOnReady = true;

    private Long branchId = 1L;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Alteration() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getGarmentItem() { return garmentItem; }
    public void setGarmentItem(String garmentItem) { this.garmentItem = garmentItem; }

    public String getMeasurements() { return measurements; }
    public void setMeasurements(String measurements) { this.measurements = measurements; }

    public String getTailorName() { return tailorName; }
    public void setTailorName(String tailorName) { this.tailorName = tailorName; }

    public String getTailorNotes() { return tailorNotes; }
    public void setTailorNotes(String tailorNotes) { this.tailorNotes = tailorNotes; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public BigDecimal getAlterationCharge() { return alterationCharge; }
    public void setAlterationCharge(BigDecimal alterationCharge) { this.alterationCharge = alterationCharge; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getNotifyCustomerOnReady() { return notifyCustomerOnReady; }
    public void setNotifyCustomerOnReady(Boolean notifyCustomerOnReady) { this.notifyCustomerOnReady = notifyCustomerOnReady; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
