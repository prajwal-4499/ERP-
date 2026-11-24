package com.clothshop.erp.controller;

import com.clothshop.erp.model.*;
import com.clothshop.erp.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final ProductVariantRepository variantRepository;
    private final CustomerRepository customerRepository;
    private final CustomerLedgerRepository customerLedgerRepository;
    private final CashShiftRepository cashShiftRepository;
    private final AuditLogRepository auditLogRepository;
    private final InventoryMovementRepository movementRepository;

    public InvoiceController(InvoiceRepository invoiceRepository,
                             ProductVariantRepository variantRepository,
                             CustomerRepository customerRepository,
                             CustomerLedgerRepository customerLedgerRepository,
                             CashShiftRepository cashShiftRepository,
                             AuditLogRepository auditLogRepository,
                             InventoryMovementRepository movementRepository) {
        this.invoiceRepository = invoiceRepository;
        this.variantRepository = variantRepository;
        this.customerRepository = customerRepository;
        this.customerLedgerRepository = customerLedgerRepository;
        this.cashShiftRepository = cashShiftRepository;
        this.auditLogRepository = auditLogRepository;
        this.movementRepository = movementRepository;
    }

    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-number/{invoiceNumber}")
    public ResponseEntity<Invoice> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        return invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createInvoice(@RequestBody Invoice invoice, @RequestParam(defaultValue = "false") boolean blockNegativeStock) {
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isEmpty()) {
            invoice.setInvoiceNumber("INV-" + LocalDateTime.now().getYear() + "-" + (1000 + (int)(Math.random() * 9000)));
        }

        // Validate stock if blockNegativeStock is true
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getBarcode() != null && !Boolean.TRUE.equals(item.getIsReturn())) {
                    Optional<ProductVariant> varOpt = variantRepository.findByBarcode(item.getBarcode());
                    if (varOpt.isPresent()) {
                        ProductVariant variant = varOpt.get();
                        if (blockNegativeStock && variant.getStock() < item.getQuantity()) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("error", "Insufficient stock for " + item.getArticleName() + " (Available: " + variant.getStock() + ")"));
                        }
                    }
                }
            }
        }

        // Customer auto-resolution / balance check
        Customer targetCustomer = null;
        if (invoice.getCustomerId() != null) {
            targetCustomer = customerRepository.findById(invoice.getCustomerId()).orElse(null);
        } else if (invoice.getCustomerPhone() != null && !invoice.getCustomerPhone().trim().isEmpty()) {
            targetCustomer = customerRepository.findByPhone(invoice.getCustomerPhone().trim()).orElse(null);
        }

        if (targetCustomer == null && invoice.getCustomerName() != null && !invoice.getCustomerName().equalsIgnoreCase("Walk-in Customer")) {
            targetCustomer = new Customer();
            targetCustomer.setName(invoice.getCustomerName().trim());
            targetCustomer.setPhone(invoice.getCustomerPhone() != null ? invoice.getCustomerPhone().trim() : "N/A");
            targetCustomer.setCustomerGroup("Retail Regular");
            targetCustomer.setCreditLimit(BigDecimal.valueOf(20000.00));
            targetCustomer.setOutstandingBalance(BigDecimal.ZERO);
            targetCustomer.setLoyaltyPoints((int)(invoice.getGrandTotal().doubleValue() / 100.0));
            targetCustomer = customerRepository.save(targetCustomer);
            invoice.setCustomerId(targetCustomer.getId());
        }

        // Check credit limit for credit payment
        if ("CREDIT".equalsIgnoreCase(invoice.getPaymentMode()) && targetCustomer != null) {
            BigDecimal projectedDebt = targetCustomer.getOutstandingBalance().add(invoice.getGrandTotal());
            if (projectedDebt.compareTo(targetCustomer.getCreditLimit()) > 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Credit limit exceeded! Limit: ₹" + targetCustomer.getCreditLimit() + ", Current Due: ₹" + targetCustomer.getOutstandingBalance()));
            }
        }

        // Link items
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                item.setInvoice(invoice);
            }
        }

        Invoice saved = invoiceRepository.save(invoice);

        // Deduct/increment stock and update movements
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getBarcode() != null) {
                    variantRepository.findByBarcode(item.getBarcode()).ifPresent(variant -> {
                        int qtyChange = item.getQuantity().intValue();
                        if (Boolean.TRUE.equals(item.getIsReturn())) {
                            variant.setStock(variant.getStock() + qtyChange);
                        } else {
                            variant.setStock(Math.max(0, variant.getStock() - qtyChange));
                            variant.setLastSoldAt(LocalDateTime.now());
                        }
                        variantRepository.save(variant);

                        InventoryMovement movement = new InventoryMovement();
                        movement.setVariantId(variant.getId());
                        movement.setMovementType(Boolean.TRUE.equals(item.getIsReturn()) ? "RETURN" : "SALE");
                        movement.setQuantityChange(Boolean.TRUE.equals(item.getIsReturn()) ? qtyChange : -qtyChange);
                        movement.setResultingStock(variant.getStock());
                        movement.setReferenceId(saved.getInvoiceNumber());
                        movement.setNotes("POS checkout: " + saved.getInvoiceNumber());
                        movementRepository.save(movement);
                    });
                }
            }
        }

        // Khata ledger update if credit
        if (targetCustomer != null && invoice.getBalanceAmount().compareTo(BigDecimal.ZERO) > 0) {
            targetCustomer.setOutstandingBalance(targetCustomer.getOutstandingBalance().add(invoice.getBalanceAmount()));
            targetCustomer.setLoyaltyPoints(targetCustomer.getLoyaltyPoints() + (int)(invoice.getGrandTotal().doubleValue() / 100.0));
            customerRepository.save(targetCustomer);

            CustomerLedger ledger = new CustomerLedger();
            ledger.setCustomerId(targetCustomer.getId());
            ledger.setInvoiceNo(saved.getInvoiceNumber());
            ledger.setTransactionType("SALE");
            ledger.setDebit(invoice.getBalanceAmount());
            ledger.setCredit(BigDecimal.ZERO);
            ledger.setBalance(targetCustomer.getOutstandingBalance());
            ledger.setPaymentMode(invoice.getPaymentMode());
            ledger.setRemarks("Credit sale bill #" + saved.getInvoiceNumber());
            customerLedgerRepository.save(ledger);
        }

        // Cash shift update
        if ("CASH".equalsIgnoreCase(invoice.getPaymentMode())) {
            cashShiftRepository.findTopByCashierIdAndStatusOrderByStartTimeDesc(saved.getCashierId() != null ? saved.getCashierId() : 1L, "OPEN")
                    .ifPresent(shift -> {
                        shift.setCashSales(shift.getCashSales().add(saved.getPaidAmount()));
                        shift.setExpectedCash(shift.getExpectedCash().add(saved.getPaidAmount()));
                        shift.setActualCash(shift.getActualCash().add(saved.getPaidAmount()));
                        cashShiftRepository.save(shift);
                    });
        }

        // Audit Log
        AuditLog audit = new AuditLog();
        audit.setUsername(saved.getCashierName() != null ? saved.getCashierName() : "cashier");
        audit.setRole("CASHIER");
        audit.setAction("INVOICE_GENERATED");
        audit.setModule("POS");
        audit.setRecordId(saved.getInvoiceNumber());
        audit.setNewValue("Grand Total: ₹" + saved.getGrandTotal() + ", Mode: " + saved.getPaymentMode());
        audit.setReason("High-speed POS counter sale");
        audit.setAuthMethod("USER_LOGIN");
        auditLogRepository.save(audit);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/edit-pin")
    @Transactional
    public ResponseEntity<?> editInvoiceWithPin(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String pin = (String) payload.get("pin");
        String reason = (String) payload.get("reason");
        if (pin == null || (!pin.equals("1234") && !pin.equals("9999"))) {
            AuditLog failedLog = new AuditLog();
            failedLog.setUsername("user");
            failedLog.setAction("PIN_VERIFICATION_FAILED");
            failedLog.setModule("INVOICE");
            failedLog.setRecordId(String.valueOf(id));
            failedLog.setReason("Unauthorized PIN attempt: " + reason);
            failedLog.setAuthMethod("PIN");
            auditLogRepository.save(failedLog);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Security PIN. Access Denied."));
        }

        return invoiceRepository.findById(id).map(invoice -> {
            String oldVal = "Total: ₹" + invoice.getGrandTotal() + ", Discount: ₹" + invoice.getBillDiscount() + ", Customer: " + invoice.getCustomerName();
            if (payload.containsKey("customerName")) invoice.setCustomerName((String) payload.get("customerName"));
            if (payload.containsKey("customerPhone")) invoice.setCustomerPhone((String) payload.get("customerPhone"));
            if (payload.containsKey("billDiscount")) invoice.setBillDiscount(new BigDecimal(payload.get("billDiscount").toString()));
            if (payload.containsKey("grandTotal")) {
                BigDecimal gt = new BigDecimal(payload.get("grandTotal").toString());
                invoice.setGrandTotal(gt);
                invoice.setPaidAmount(gt);
            }
            invoice.setStatus("EDITED");
            Invoice updated = invoiceRepository.save(invoice);

            AuditLog audit = new AuditLog();
            audit.setUsername("manager");
            audit.setRole("MANAGER");
            audit.setAction("INVOICE_EDIT");
            audit.setModule("INVOICE");
            audit.setRecordId(updated.getInvoiceNumber());
            audit.setOldValue(oldVal);
            audit.setNewValue("Total: ₹" + updated.getGrandTotal() + ", Discount: ₹" + updated.getBillDiscount() + ", Customer: " + updated.getCustomerName());
            audit.setReason(reason != null ? reason : "Authorized PIN edit");
            audit.setAuthMethod("PIN_VERIFIED");
            auditLogRepository.save(audit);

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
