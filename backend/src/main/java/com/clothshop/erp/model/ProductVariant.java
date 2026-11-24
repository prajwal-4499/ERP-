package com.clothshop.erp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(nullable = false, unique = true, length = 100)
    private String barcode;

    @Column(length = 50)
    private String color;

    @Column(length = 50)
    private String size;

    @Column(precision = 10, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal mrp = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    private Integer stock = 0;

    @Column(length = 20)
    private String unitType = "PCS"; // PCS, METER

    private LocalDateTime lastSoldAt;

    private LocalDateTime lastReceivedAt;

    private Integer reorderLevel = 5;

    private Long branchId = 1L;

    private LocalDateTime createdAt = LocalDateTime.now();

    public ProductVariant() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }

    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getUnitType() { return unitType; }
    public void setUnitType(String unitType) { this.unitType = unitType; }

    public LocalDateTime getLastSoldAt() { return lastSoldAt; }
    public void setLastSoldAt(LocalDateTime lastSoldAt) { this.lastSoldAt = lastSoldAt; }

    public LocalDateTime getLastReceivedAt() { return lastReceivedAt; }
    public void setLastReceivedAt(LocalDateTime lastReceivedAt) { this.lastReceivedAt = lastReceivedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
