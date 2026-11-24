package com.clothshop.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long variantId;

    @Column(nullable = false, length = 50)
    private String movementType; // SALE, RETURN, PURCHASE_GRN, ADJUSTMENT_ADD, ADJUSTMENT_REMOVE, TRANSFER_OUT, TRANSFER_IN

    @Column(nullable = false)
    private Integer quantityChange; // e.g. -2 or +10

    @Column(nullable = false)
    private Integer resultingStock;

    @Column(length = 50)
    private String referenceId; // InvoiceNo, GRNNo, TransferId

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Long userId;
    private Long branchId = 1L;

    private LocalDateTime timestamp = LocalDateTime.now();

    public InventoryMovement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public String getMovementType() { return movementType; }
    public void setMovementType(String movementType) { this.movementType = movementType; }

    public Integer getQuantityChange() { return quantityChange; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }

    public Integer getResultingStock() { return resultingStock; }
    public void setResultingStock(Integer resultingStock) { this.resultingStock = resultingStock; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
