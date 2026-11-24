package com.clothshop.erp.controller;

import com.clothshop.erp.model.CashShift;
import com.clothshop.erp.repository.CashShiftRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "*")
public class ShiftController {

    private final CashShiftRepository shiftRepository;

    public ShiftController(CashShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    @GetMapping("/current")
    public CashShift getCurrentShift() {
        return shiftRepository.findTopByCashierIdAndStatusOrderByStartTimeDesc(1L, "OPEN")
                .orElseGet(() -> {
                    CashShift newShift = new CashShift();
                    newShift.setCashierId(1L);
                    newShift.setCashierName("Rajesh Sharma");
                    newShift.setBranchId(1L);
                    newShift.setStartTime(LocalDateTime.now());
                    newShift.setOpeningCash(BigDecimal.valueOf(5000.00));
                    newShift.setExpectedCash(BigDecimal.valueOf(5000.00));
                    newShift.setActualCash(BigDecimal.valueOf(5000.00));
                    newShift.setStatus("OPEN");
                    return shiftRepository.save(newShift);
                });
    }

    @GetMapping
    public List<CashShift> getAllShifts() {
        return shiftRepository.findAllByOrderByStartTimeDesc();
    }

    @PostMapping("/reconcile")
    @Transactional
    public ResponseEntity<CashShift> reconcileShift(@RequestBody Map<String, Object> payload) {
        CashShift shift = getCurrentShift();
        BigDecimal actualCash = new BigDecimal(payload.get("actualCash").toString());
        String notes = (String) payload.getOrDefault("closingNotes", "");

        shift.setActualCash(actualCash);
        shift.setDifference(actualCash.subtract(shift.getExpectedCash()));
        shift.setClosingNotes(notes);
        shift.setEndTime(LocalDateTime.now());
        shift.setStatus("AUDITED");

        return ResponseEntity.ok(shiftRepository.save(shift));
    }
}
