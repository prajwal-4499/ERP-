package com.clothshop.erp.controller;

import com.clothshop.erp.model.AuditLog;
import com.clothshop.erp.model.SystemSetting;
import com.clothshop.erp.repository.AuditLogRepository;
import com.clothshop.erp.repository.SystemSettingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AuditLogRepository auditLogRepository;
    private final SystemSettingRepository settingRepository;

    public AdminController(AuditLogRepository auditLogRepository, SystemSettingRepository settingRepository) {
        this.auditLogRepository = auditLogRepository;
        this.settingRepository = settingRepository;
    }

    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }

    @PostMapping("/verify-pin")
    @Transactional
    public ResponseEntity<?> verifyPin(@RequestBody Map<String, String> payload) {
        String pin = payload.get("pin");
        String action = payload.getOrDefault("action", "PIN_CHECK");
        String module = payload.getOrDefault("module", "SECURITY");

        boolean isValid = pin != null && (pin.equals("1234") || pin.equals("9999"));

        AuditLog log = new AuditLog();
        log.setUsername("operator");
        log.setRole("OPERATOR");
        log.setAction(isValid ? "PIN_VERIFY_SUCCESS" : "PIN_VERIFY_FAILED");
        log.setModule(module);
        log.setReason("Security PIN verification attempt for action: " + action);
        log.setAuthMethod("PIN");
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);

        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true, "message", "PIN Verified Successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "error", "Invalid Security PIN. Access Denied."));
        }
    }

    @GetMapping("/settings")
    public List<SystemSetting> getSettings() {
        return settingRepository.findAll();
    }

    @PostMapping("/settings")
    @Transactional
    public SystemSetting saveSetting(@RequestBody SystemSetting setting) {
        return settingRepository.findBySettingKey(setting.getSettingKey())
                .map(existing -> {
                    existing.setSettingValue(setting.getSettingValue());
                    existing.setCategory(setting.getCategory());
                    existing.setUpdatedAt(LocalDateTime.now());
                    return settingRepository.save(existing);
                }).orElseGet(() -> settingRepository.save(setting));
    }

    @GetMapping("/health")
    public Map<String, Object> getHealthDiagnostics() {
        return Map.of(
                "status", "UP",
                "database", "CONNECTED",
                "backend", "ClothShop ERP Spring Boot 3.2.5",
                "timestamp", LocalDateTime.now()
        );
    }
}
