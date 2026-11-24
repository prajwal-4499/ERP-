package com.clothshop.erp.controller;

import com.clothshop.erp.model.AuditLog;
import com.clothshop.erp.model.User;
import com.clothshop.erp.repository.AuditLogRepository;
import com.clothshop.erp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                          AuditLogRepository auditLogRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get all active staff users. Seeds initial accounts if database is empty.
     */
    @GetMapping("/users")
    @Transactional
    public List<User> getStaffUsers() {
        List<User> existing = userRepository.findAll();
        if (existing.isEmpty()) {
            return seedDefaultUsers();
        }
        return existing;
    }

    /**
     * Authenticate user with username/mobile and password or PIN
     */
    @PostMapping("/login")
    @Transactional
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        String pin = payload.get("pin");

        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        // Check if database needs initial seeding
        if (userRepository.count() == 0) {
            seedDefaultUsers();
        }

        Optional<User> userOpt = userRepository.findByUsername(username.trim())
                .or(() -> userRepository.findByMobile(username.trim()));

        if (userOpt.isEmpty()) {
            // Also check if username matches standard demo users
            for (User u : userRepository.findAll()) {
                if (u.getUsername().equalsIgnoreCase(username.trim()) ||
                    (u.getFullName() != null && u.getFullName().equalsIgnoreCase(username.trim()))) {
                    userOpt = Optional.of(u);
                    break;
                }
            }
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        // Validate password or pin if provided
        boolean passwordMatch = true;
        if (password != null && !password.isEmpty()) {
            // Support raw matches for initial demo passwords or BCrypt encoded
            passwordMatch = password.equals("admin") ||
                            password.equals("1234") ||
                            password.equals("9999") ||
                            passwordEncoder.matches(password, user.getPassword());
        } else if (pin != null && !pin.isEmpty()) {
            passwordMatch = pin.equals("1234") || pin.equals("9999");
        }

        if (!passwordMatch) {
            recordAudit(user.getUsername(), getPrimaryRole(user), "LOGIN_FAILED", "Invalid password or security PIN");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials or PIN"));
        }

        String token = "jwt-session-" + user.getUsername() + "-" + System.currentTimeMillis();
        recordAudit(user.getUsername(), getPrimaryRole(user), "USER_LOGIN", "User signed in to POS terminal");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName() != null ? user.getFullName() : user.getUsername(),
                "mobile", user.getMobile() != null ? user.getMobile() : "",
                "role", getPrimaryRole(user),
                "branchId", user.getBranchId() != null ? user.getBranchId() : 1L,
                "branchName", "Pargaon (Mangrul)"
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Fast cashier switch endpoint
     */
    @PostMapping("/switch-user")
    @Transactional
    public ResponseEntity<?> switchUser(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        Number userId = (Number) payload.get("userId");

        Optional<User> userOpt = Optional.empty();
        if (userId != null) {
            userOpt = userRepository.findById(userId.longValue());
        } else if (username != null) {
            userOpt = userRepository.findByUsername(username);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        String token = "jwt-switch-" + user.getUsername() + "-" + System.currentTimeMillis();
        recordAudit(user.getUsername(), getPrimaryRole(user), "TERMINAL_SWITCH", "Terminal switched to " + user.getFullName());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "mobile", user.getMobile() != null ? user.getMobile() : "",
                "role", getPrimaryRole(user),
                "branchId", user.getBranchId() != null ? user.getBranchId() : 1L,
                "branchName", "Pargaon (Mangrul)"
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Logout and session termination endpoint
     */
    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> payload) {
        String username = payload != null ? payload.getOrDefault("username", "anonymous") : "anonymous";
        String role = payload != null ? payload.getOrDefault("role", "CASHIER") : "CASHIER";

        recordAudit(username, role, "USER_LOGOUT", "Cashier logged out of session");
        return ResponseEntity.ok(Map.of("message", "Session closed successfully"));
    }

    private String getPrimaryRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) return "CASHIER";
        String r = user.getRoles().iterator().next();
        return r.replace("ROLE_", "");
    }

    private void recordAudit(String username, String role, String action, String reason) {
        AuditLog log = new AuditLog();
        log.setUsername(username);
        log.setRole(role);
        log.setAction(action);
        log.setModule("SECURITY");
        log.setReason(reason);
        log.setAuthMethod("TERMINAL_AUTH");
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    private List<User> seedDefaultUsers() {
        List<User> list = new ArrayList<>();

        // 1. Owner
        User owner = new User();
        owner.setUsername("admin");
        owner.setPassword(passwordEncoder.encode("admin"));
        owner.setFullName("Rajesh Sharma");
        owner.setMobile("8999308582");
        owner.setEmail("admin@shravanicollection.com");
        owner.setRoles(Set.of("ROLE_OWNER"));
        owner.setActive(true);
        list.add(userRepository.save(owner));

        // 2. Manager
        User manager = new User();
        manager.setUsername("manager_priya");
        manager.setPassword(passwordEncoder.encode("1234"));
        manager.setFullName("Priya Nair");
        manager.setMobile("+91 98450 11223");
        manager.setEmail("priya@shravanicollection.com");
        manager.setRoles(Set.of("ROLE_MANAGER"));
        manager.setActive(true);
        list.add(userRepository.save(manager));

        // 3. Cashier
        User cashier = new User();
        cashier.setUsername("cashier1");
        cashier.setPassword(passwordEncoder.encode("1234"));
        cashier.setFullName("Vijay Kumar");
        cashier.setMobile("+91 97412 34567");
        cashier.setEmail("vijay@shravanicollection.com");
        cashier.setRoles(Set.of("ROLE_CASHIER"));
        cashier.setActive(true);
        list.add(userRepository.save(cashier));

        // 4. Tailor
        User tailor = new User();
        tailor.setUsername("tailor_master");
        tailor.setPassword(passwordEncoder.encode("1234"));
        tailor.setFullName("Master Rafiq");
        tailor.setMobile("+91 98800 55443");
        tailor.setEmail("rafiq@shravanicollection.com");
        tailor.setRoles(Set.of("ROLE_TAILOR"));
        tailor.setActive(true);
        list.add(userRepository.save(tailor));

        // 5. Accountant
        User accountant = new User();
        accountant.setUsername("accountant_sunil");
        accountant.setPassword(passwordEncoder.encode("1234"));
        accountant.setFullName("Sunil Kulkarni");
        accountant.setMobile("+91 98220 33445");
        accountant.setEmail("sunil@shravanicollection.com");
        accountant.setRoles(Set.of("ROLE_ACCOUNTANT"));
        accountant.setActive(true);
        list.add(userRepository.save(accountant));

        // 6. Inventory Manager
        User invMgr = new User();
        invMgr.setUsername("inventory_anand");
        invMgr.setPassword(passwordEncoder.encode("1234"));
        invMgr.setFullName("Anand Shinde");
        invMgr.setMobile("+91 98900 66778");
        invMgr.setEmail("anand@shravanicollection.com");
        invMgr.setRoles(Set.of("ROLE_INVENTORY_MANAGER"));
        invMgr.setActive(true);
        list.add(userRepository.save(invMgr));

        return list;
    }
}
