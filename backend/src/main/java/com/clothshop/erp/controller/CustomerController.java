package com.clothshop.erp.controller;

import com.clothshop.erp.model.AuditLog;
import com.clothshop.erp.model.Customer;
import com.clothshop.erp.model.CustomerLedger;
import com.clothshop.erp.repository.AuditLogRepository;
import com.clothshop.erp.repository.CustomerLedgerRepository;
import com.clothshop.erp.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final CustomerLedgerRepository ledgerRepository;
    private final AuditLogRepository auditLogRepository;

    public CustomerController(CustomerRepository customerRepository,
                              CustomerLedgerRepository ledgerRepository,
                              AuditLogRepository auditLogRepository) {
        this.customerRepository = customerRepository;
        this.ledgerRepository = ledgerRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public Customer createCustomer(@RequestBody Customer customer) {
        return customerRepository.save(customer);
    }

    @GetMapping("/search")
    public List<Customer> searchCustomers(@RequestParam String query) {
        return customerRepository.searchCustomers(query);
    }

    @GetMapping("/alerts/today")
    public Map<String, Object> getTodayAlerts() {
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentDay = today.getDayOfMonth();

        List<Customer> all = customerRepository.findAll();

        List<Customer> birthdaysToday = all.stream().filter(c -> {
            if (c.getBirthday() == null) return false;
            return c.getBirthday().getMonthValue() == currentMonth && c.getBirthday().getDayOfMonth() == currentDay;
        }).collect(Collectors.toList());

        List<Customer> anniversariesToday = all.stream().filter(c -> {
            if (c.getAnniversary() == null) return false;
            return c.getAnniversary().getMonthValue() == currentMonth && c.getAnniversary().getDayOfMonth() == currentDay;
        }).collect(Collectors.toList());

        List<Customer> overdueKhata = all.stream().filter(c ->
                c.getOutstandingBalance() != null && c.getOutstandingBalance().compareTo(BigDecimal.valueOf(500)) > 0
        ).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("birthdaysToday", birthdaysToday);
        result.put("anniversariesToday", anniversariesToday);
        result.put("overdueKhata", overdueKhata);
        return result;
    }

    @GetMapping("/{id}/ledger")
    public List<CustomerLedger> getCustomerLedger(@PathVariable Long id) {
        return ledgerRepository.findByCustomerIdOrderByCreatedAtDesc(id);
    }

    @PostMapping("/{id}/transactions")
    @Transactional
    public ResponseEntity<?> addTransaction(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return customerRepository.findById(id).map(customer -> {
            String type = (String) payload.get("type"); // PAYMENT_RECEIVED, PAYMENT_GIVEN, SALE
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());
            String mode = (String) payload.getOrDefault("mode", "UPI");
            String refNo = (String) payload.getOrDefault("refNo", "");
            String remarks = (String) payload.getOrDefault("remarks", "");
            String invoiceNo = (String) payload.get("invoiceNo");

            BigDecimal debit = BigDecimal.ZERO;
            BigDecimal credit = BigDecimal.ZERO;

            if ("PAYMENT_RECEIVED".equalsIgnoreCase(type)) {
                credit = amount;
                customer.setOutstandingBalance(customer.getOutstandingBalance().subtract(amount).max(BigDecimal.ZERO));
            } else if ("PAYMENT_GIVEN".equalsIgnoreCase(type)) {
                debit = amount;
                customer.setOutstandingBalance(customer.getOutstandingBalance().add(amount));
            } else {
                debit = amount;
                customer.setOutstandingBalance(customer.getOutstandingBalance().add(amount));
            }

            customerRepository.save(customer);

            CustomerLedger ledger = new CustomerLedger();
            ledger.setCustomerId(customer.getId());
            ledger.setInvoiceNo(invoiceNo);
            ledger.setTransactionType(type != null ? type : "PAYMENT_RECEIVED");
            ledger.setDebit(debit);
            ledger.setCredit(credit);
            ledger.setBalance(customer.getOutstandingBalance());
            ledger.setPaymentMode(mode);
            ledger.setReferenceNo(refNo);
            ledger.setRemarks(remarks);
            ledgerRepository.save(ledger);

            AuditLog audit = new AuditLog();
            audit.setUsername("cashier");
            audit.setRole("CASHIER");
            audit.setAction("CUSTOMER_" + type);
            audit.setModule("CUSTOMERS");
            audit.setRecordId(String.valueOf(customer.getId()));
            audit.setNewValue("Amount: ₹" + amount + ", Balance: ₹" + customer.getOutstandingBalance());
            audit.setReason(remarks);
            audit.setAuthMethod("USER_LOGIN");
            auditLogRepository.save(audit);

            return ResponseEntity.ok(customer);
        }).orElse(ResponseEntity.notFound().build());
    }
}
