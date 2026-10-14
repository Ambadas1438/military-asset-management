package com.military.assets.controller;

import com.military.assets.dto.AssignmentRequest;
import com.military.assets.dto.ExpenditureRequest;
import com.military.assets.model.Assignment;
import com.military.assets.model.Expenditure;
import com.military.assets.model.User;
import com.military.assets.repository.AssignmentRepository;
import com.military.assets.service.AssignmentService;
import com.military.assets.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentsController {

    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private com.military.assets.repository.ExpenditureRepository expenditureRepository;
    @Autowired private AssignmentService assignmentService;
    @Autowired private AuditService auditService;

    @GetMapping
    public ResponseEntity<?> listAssignments(
            @RequestParam(required = false) String baseId,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user != null && "commander".equals(user.getRole()) && user.getBase() != null) {
            baseId = user.getBase().getId();
        }
        List<Assignment> list = assignmentRepository.findByFilters(baseId, status);
        return ResponseEntity.ok(java.util.Map.of("assignments", list));
    }

    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestBody AssignmentRequest req, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        Assignment assignment = assignmentService.createAssignment(req, user);
        auditService.log(user, "RECORD_ASSIGNMENT", "Assignment", assignment.getId(),
            "{\"code\":\"" + assignment.getAssignmentCode() + "\",\"quantity\":" + assignment.getQuantity() + "}",
            request.getRemoteAddr());
        return ResponseEntity.ok(assignment);
    }

    @RequestMapping(value = "/{id}/return", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<?> returnAssignment(@PathVariable String id, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        Assignment assignment = assignmentService.returnAssignment(id);
        auditService.log(user, "RETURN_ASSIGNMENT", "Assignment", assignment.getId(),
            "{\"code\":\"" + assignment.getAssignmentCode() + "\"}",
            request.getRemoteAddr());
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/expenditures")
    public ResponseEntity<?> listExpenditures(
            @RequestParam(required = false) String baseId,
            @RequestParam(required = false) String categoryId,
            HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user != null && "commander".equals(user.getRole()) && user.getBase() != null) {
            baseId = user.getBase().getId();
        }
        List<Expenditure> list = expenditureRepository.findByFilters(baseId, categoryId);
        return ResponseEntity.ok(java.util.Map.of("expenditures", list));
    }

    @PostMapping("/expenditures")
    public ResponseEntity<?> createExpenditure(@RequestBody ExpenditureRequest req, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        Expenditure expenditure = assignmentService.createExpenditure(req, user);
        auditService.log(user, "RECORD_EXPENDITURE", "Expenditure", expenditure.getId(),
            "{\"code\":\"" + expenditure.getExpenditureCode() + "\",\"quantity\":" + expenditure.getQuantity() + "}",
            request.getRemoteAddr());
        return ResponseEntity.ok(expenditure);
    }
}
