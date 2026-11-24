package com.clothshop.erp.controller;

import com.clothshop.erp.model.*;
import com.clothshop.erp.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierRepository supplierRepository;
    private final SupplierBillRepository billRepository;
    private final SupplierLedgerRepository ledgerRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryMovementRepository movementRepository;
    private final AuditLogRepository auditLogRepository;

    public SupplierController(SupplierRepository supplierRepository,
                              SupplierBillRepository billRepository,
                              SupplierLedgerRepository ledgerRepository,
                              ProductVariantRepository variantRepository,
                              InventoryMovementRepository movementRepository,
                              AuditLogRepository auditLogRepository) {
        this.supplierRepository = supplierRepository;
        this.billRepository = billRepository;
        this.ledgerRepository = ledgerRepository;
        this.variantRepository = variantRepository;
        this.movementRepository = movementRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        return supplierRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @GetMapping("/bills")
    public List<SupplierBill> getAllBills() {
        return billRepository.findAll();
    }

    @PostMapping("/bills")
    @Transactional
    public ResponseEntity<?> createBill(@RequestBody SupplierBill bill) {
        Supplier supplier = supplierRepository.findById(bill.getSupplierId()).orElse(null);
        if (supplier == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Supplier not found"));
        }

        SupplierBill saved = billRepository.save(bill);

        // Update supplier balance
        BigDecimal unpaid = saved.getAmount().subtract(saved.getPaidAmount()).max(BigDecimal.ZERO);
        supplier.setOutstandingPayable(supplier.getOutstandingPayable().add(unpaid));
        supplierRepository.save(supplier);

        // Record Ledger Credit
        SupplierLedger ledger = new SupplierLedger();
        ledger.setSupplierId(supplier.getId());
        ledger.setInvoiceNo(saved.getSupplierInvoiceNo());
        ledger.setTransactionType("PURCHASE_CREDIT");
        ledger.setDebit(BigDecimal.ZERO);
        ledger.setCredit(saved.getAmount());
        ledger.setBalance(supplier.getOutstandingPayable());
        ledger.setReferenceNo(saved.getGrnNumber());
        ledger.setRemarks("Inward bill #" + saved.getSupplierInvoiceNo());
        ledgerRepository.save(ledger);

        // Record Initial Payment if made
        if (saved.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            SupplierLedger payLedger = new SupplierLedger();
            payLedger.setSupplierId(supplier.getId());
            payLedger.setInvoiceNo(saved.getSupplierInvoiceNo());
            payLedger.setTransactionType("PAYMENT_MADE");
            payLedger.setDebit(saved.getPaidAmount());
            payLedger.setCredit(BigDecimal.ZERO);
            payLedger.setBalance(supplier.getOutstandingPayable());
            payLedger.setRemarks("Initial payment for bill #" + saved.getSupplierInvoiceNo());
            ledgerRepository.save(payLedger);
        }

        AuditLog audit = new AuditLog();
        audit.setUsername("manager");
        audit.setRole("MANAGER");
        audit.setAction("SUPPLIER_BILL_CREATED");
        audit.setModule("PURCHASES");
        audit.setRecordId(saved.getSupplierInvoiceNo());
        audit.setNewValue("Bill Total: ₹" + saved.getAmount() + " for " + supplier.getName());
        audit.setReason("Inward purchase shipment recorded");
        audit.setAuthMethod("AUTHORIZED");
        auditLogRepository.save(audit);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/ledger")
    public List<SupplierLedger> getSupplierLedger(@PathVariable Long id) {
        return ledgerRepository.findBySupplierIdOrderByCreatedAtDesc(id);
    }

    @PostMapping("/{id}/transactions")
    @Transactional
    public ResponseEntity<?> addTransaction(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return supplierRepository.findById(id).map(supplier -> {
            String type = (String) payload.get("type"); // PURCHASE_CREDIT, PAYMENT_MADE
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());
            String invNo = (String) payload.get("invoiceNo");
            String mode = (String) payload.getOrDefault("mode", "BANK_TRANSFER");
            String refNo = (String) payload.getOrDefault("refNo", "");
            String remarks = (String) payload.getOrDefault("remarks", "");

            BigDecimal debit = BigDecimal.ZERO;
            BigDecimal credit = BigDecimal.ZERO;

            if ("PURCHASE_CREDIT".equalsIgnoreCase(type)) {
                credit = amount;
                supplier.setOutstandingPayable(supplier.getOutstandingPayable().add(amount));
            } else {
                debit = amount;
                supplier.setOutstandingPayable(supplier.getOutstandingPayable().subtract(amount).max(BigDecimal.ZERO));
            }

            supplierRepository.save(supplier);

            SupplierLedger ledger = new SupplierLedger();
            ledger.setSupplierId(supplier.getId());
            ledger.setInvoiceNo(invNo);
            ledger.setTransactionType(type != null ? type : "PAYMENT_MADE");
            ledger.setDebit(debit);
            ledger.setCredit(credit);
            ledger.setBalance(supplier.getOutstandingPayable());
            ledger.setPaymentMode(mode);
            ledger.setReferenceNo(refNo);
            ledger.setRemarks(remarks);
            ledgerRepository.save(ledger);

            AuditLog audit = new AuditLog();
            audit.setUsername("manager");
            audit.setRole("MANAGER");
            audit.setAction("SUPPLIER_" + type);
            audit.setModule("PURCHASES");
            audit.setRecordId(String.valueOf(supplier.getId()));
            audit.setNewValue("Amount: ₹" + amount + ", Payable: ₹" + supplier.getOutstandingPayable());
            audit.setReason(remarks);
            audit.setAuthMethod("AUTHORIZED");
            auditLogRepository.save(audit);

            return ResponseEntity.ok(supplier);
        }).orElse(ResponseEntity.notFound().build());
    }
}
