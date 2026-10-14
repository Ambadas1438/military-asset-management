package com.military.assets.controller;

import com.military.assets.dto.TransferRequest;
import com.military.assets.model.Transfer;
import com.military.assets.model.User;
import com.military.assets.repository.TransferRepository;
import com.military.assets.service.AuditService;
import com.military.assets.service.TransferService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfers")
public class TransfersController {

    @Autowired private TransferRepository transferRepository;
    @Autowired private TransferService transferService;
    @Autowired private AuditService auditService;

    @GetMapping
    public ResponseEntity<?> listTransfers(
            @RequestParam(required = false) String baseId,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        if (user != null && "commander".equals(user.getRole()) && user.getBase() != null) {
            baseId = user.getBase().getId();
        }
        List<Transfer> list = transferRepository.findByFilters(baseId, status);
        return ResponseEntity.ok(Map.of("transfers", list));
    }

    @PostMapping
    public ResponseEntity<?> createTransfer(@RequestBody TransferRequest req, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        Transfer transfer = transferService.createTransfer(req, user);
        auditService.log(user, "INITIATE_TRANSFER", "Transfer", transfer.getId(),
            "{\"trackingNumber\":\"" + transfer.getTrackingNumber() + "\",\"quantity\":" + transfer.getQuantity() + "}",
            request.getRemoteAddr());
        return ResponseEntity.ok(transfer);
    }

    @RequestMapping(value = "/{id}/receive", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<?> receiveTransfer(@PathVariable String id, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        Transfer transfer = transferService.receiveTransfer(id, user);
        auditService.log(user, "RECEIVE_TRANSFER", "Transfer", transfer.getId(),
            "{\"trackingNumber\":\"" + transfer.getTrackingNumber() + "\",\"status\":\"COMPLETED\"}",
            request.getRemoteAddr());
        return ResponseEntity.ok(transfer);
    }
}
