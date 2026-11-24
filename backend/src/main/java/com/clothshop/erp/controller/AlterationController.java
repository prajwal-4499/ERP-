package com.clothshop.erp.controller;

import com.clothshop.erp.model.Alteration;
import com.clothshop.erp.model.AuditLog;
import com.clothshop.erp.repository.AlterationRepository;
import com.clothshop.erp.repository.AuditLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alterations")
@CrossOrigin(origins = "*")
public class AlterationController {

    private final AlterationRepository alterationRepository;
    private final AuditLogRepository auditLogRepository;

    public AlterationController(AlterationRepository alterationRepository, AuditLogRepository auditLogRepository) {
        this.alterationRepository = alterationRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<Alteration> getAllAlterations() {
        return alterationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alteration> getAlterationById(@PathVariable Long id) {
        return alterationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public Alteration createAlteration(@RequestBody Alteration alteration) {
        if (alteration.getOrderNumber() == null || alteration.getOrderNumber().isEmpty()) {
            alteration.setOrderNumber("ALT-" + (1000 + (int)(Math.random() * 9000)));
        }
        Alteration saved = alterationRepository.save(alteration);

        AuditLog audit = new AuditLog();
        audit.setUsername("tailor");
        audit.setRole("TAILOR");
        audit.setAction("ALTERATION_CREATED");
        audit.setModule("ALTERATIONS");
        audit.setRecordId(saved.getOrderNumber());
        audit.setNewValue("Item: " + saved.getGarmentItem() + ", Customer: " + saved.getCustomerName());
        audit.setReason("New tailoring measurement order");
        audit.setAuthMethod("USER_LOGIN");
        auditLogRepository.save(audit);

        return saved;
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Alteration> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        return alterationRepository.findById(id).map(alt -> {
            alt.setStatus(newStatus);
            Alteration updated = alterationRepository.save(alt);

            AuditLog audit = new AuditLog();
            audit.setUsername("tailor");
            audit.setRole("TAILOR");
            audit.setAction("ALTERATION_STATUS_CHANGE");
            audit.setModule("ALTERATIONS");
            audit.setRecordId(updated.getOrderNumber());
            audit.setNewValue("Status changed to: " + newStatus);
            audit.setReason("Status progression");
            audit.setAuthMethod("USER_LOGIN");
            auditLogRepository.save(audit);

            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
