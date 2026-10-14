package com.military.assets.controller;

import com.military.assets.model.User;
import com.military.assets.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private DashboardService dashboardService;

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(
            @RequestParam(required = false) String baseId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        String userRole = user != null ? user.getRole() : null;
        String userBaseId = (user != null && user.getBase() != null) ? user.getBase().getId() : null;
        Map<String, Object> metrics = dashboardService.getMetrics(baseId, categoryId, startDate, endDate, userRole, userBaseId);
        return ResponseEntity.ok(metrics);
    }
}
