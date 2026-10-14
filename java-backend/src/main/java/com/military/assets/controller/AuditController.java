package com.military.assets.controller;

import com.military.assets.model.AuditLog;
import com.military.assets.model.User;
import com.military.assets.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired private AuditLogRepository auditLogRepository;

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user == null || !"admin".equals(user.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : null;
        Page<AuditLog> logs = auditLogRepository.findByFilters(userId, action, entityType, start, end,
            PageRequest.of(Math.max(0, page - 1), limit));
        return ResponseEntity.ok(Map.of(
            "logs", logs.getContent(),
            "total", logs.getTotalElements(),
            "page", page,
            "limit", limit
        ));
    }
}
