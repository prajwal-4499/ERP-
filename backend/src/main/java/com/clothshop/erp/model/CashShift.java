package com.clothshop.erp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_shifts")
public class CashShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long cashierId;

    @Column(length = 100)
    private String cashierName;

    private Long branchId = 1L;

    private LocalDateTime startTime = LocalDateTime.now();
    private LocalDateTime endTime;

    @Column(precision = 10, scale = 2)
    private BigDecimal openingCash = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cashSales = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cashReceived = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cashRefunds = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cashExpenses = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cashWithdrawals = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal expectedCash = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal actualCash = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal difference = BigDecimal.ZERO;

    @Column(length = 50)
    private String status = "OPEN"; // OPEN, CLOSED, AUDITED

    @Column(columnDefinition = "TEXT")
    private String closingNotes;

    public CashShift() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCashierId() { return cashierId; }
    public void setCashierId(Long cashierId) { this.cashierId = cashierId; }

    public String getCashierName() { return cashierName; }
    public void setCashierName(String cashierName) { this.cashierName = cashierName; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getOpeningCash() { return openingCash; }
    public void setOpeningCash(BigDecimal openingCash) { this.openingCash = openingCash; }

    public BigDecimal getCashSales() { return cashSales; }
    public void setCashSales(BigDecimal cashSales) { this.cashSales = cashSales; }

    public BigDecimal getCashReceived() { return cashReceived; }
    public void setCashReceived(BigDecimal cashReceived) { this.cashReceived = cashReceived; }

    public BigDecimal getCashRefunds() { return cashRefunds; }
    public void setCashRefunds(BigDecimal cashRefunds) { this.cashRefunds = cashRefunds; }

    public BigDecimal getCashExpenses() { return cashExpenses; }
    public void setCashExpenses(BigDecimal cashExpenses) { this.cashExpenses = cashExpenses; }

    public BigDecimal getCashWithdrawals() { return cashWithdrawals; }
    public void setCashWithdrawals(BigDecimal cashWithdrawals) { this.cashWithdrawals = cashWithdrawals; }

    public BigDecimal getExpectedCash() { return expectedCash; }
    public void setExpectedCash(BigDecimal expectedCash) { this.expectedCash = expectedCash; }

    public BigDecimal getActualCash() { return actualCash; }
    public void setActualCash(BigDecimal actualCash) { this.actualCash = actualCash; }

    public BigDecimal getDifference() { return difference; }
    public void setDifference(BigDecimal difference) { this.difference = difference; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getClosingNotes() { return closingNotes; }
    public void setClosingNotes(String closingNotes) { this.closingNotes = closingNotes; }
}
