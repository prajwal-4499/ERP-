package com.clothshop.erp.controller;

import com.clothshop.erp.model.AuditLog;
import com.clothshop.erp.model.Expense;
import com.clothshop.erp.repository.AuditLogRepository;
import com.clothshop.erp.repository.CashShiftRepository;
import com.clothshop.erp.repository.ExpenseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseRepository expenseRepository;
    private final CashShiftRepository shiftRepository;
    private final AuditLogRepository auditLogRepository;

    public ExpenseController(ExpenseRepository expenseRepository, CashShiftRepository shiftRepository, AuditLogRepository auditLogRepository) {
        this.expenseRepository = expenseRepository;
        this.shiftRepository = shiftRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Expense createExpense(@RequestBody Expense expense) {
        Expense saved = expenseRepository.save(expense);

        if ("CASH".equalsIgnoreCase(saved.getPaymentMode())) {
            shiftRepository.findTopByCashierIdAndStatusOrderByStartTimeDesc(1L, "OPEN")
                    .ifPresent(shift -> {
                        shift.setCashExpenses(shift.getCashExpenses().add(saved.getAmount()));
                        shift.setExpectedCash(shift.getExpectedCash().subtract(saved.getAmount()).max(BigDecimal.ZERO));
                        shift.setActualCash(shift.getActualCash().subtract(saved.getAmount()).max(BigDecimal.ZERO));
                        shiftRepository.save(shift);
                    });
        }

        AuditLog audit = new AuditLog();
        audit.setUsername(saved.getCreatedBy() != null ? saved.getCreatedBy() : "cashier");
        audit.setRole("CASHIER");
        audit.setAction("EXPENSE_RECORDED");
        audit.setModule("ACCOUNTING");
        audit.setRecordId(String.valueOf(saved.getId()));
        audit.setNewValue("Amount: ₹" + saved.getAmount() + ", Category: " + saved.getCategory());
        audit.setReason(saved.getDescription());
        audit.setAuthMethod("USER_LOGIN");
        auditLogRepository.save(audit);

        return saved;
    }
}
