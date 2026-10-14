package com.military.assets.service;

import com.military.assets.dto.AssignmentRequest;
import com.military.assets.dto.ExpenditureRequest;
import com.military.assets.model.*;
import com.military.assets.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AssignmentService {

    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private ExpenditureRepository expenditureRepository;
    @Autowired private BaseRepository baseRepository;
    @Autowired private EquipmentCategoryRepository categoryRepository;

    @Transactional
    public Assignment createAssignment(AssignmentRequest req, User currentUser) {
        Base base = baseRepository.findById(req.getBaseId()).orElseThrow(() -> new RuntimeException("Base not found"));
        EquipmentCategory category = categoryRepository.findById(req.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));

        int year = LocalDate.now().getYear();
        long count = assignmentRepository.countByAssignmentCodeStartingWith("ASN-" + year);
        String code = "ASN-" + year + "-" + String.format("%04d", count + 1000 + 1);

        Assignment assignment = new Assignment();
        assignment.setId("asn-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        assignment.setAssignmentCode(code);
        assignment.setBase(base);
        assignment.setCategory(category);
        assignment.setAssetName(req.getAssetName());
        assignment.setPersonnelName(req.getPersonnelName());
        assignment.setMilitaryId(req.getMilitaryId());
        assignment.setRank(req.getRank());
        assignment.setUnit(req.getUnit());
        assignment.setQuantity(req.getQuantity());
        assignment.setIssueDate(req.getIssueDate() != null ? req.getIssueDate() : LocalDate.now());
        assignment.setReturnDueDate(req.getReturnDueDate());
        assignment.setStatus("ACTIVE");
        assignment.setIssuedBy(currentUser);
        assignment.setNotes(req.getNotes());
        assignment.setCreatedAt(LocalDateTime.now());
        return assignmentRepository.save(assignment);
    }

    @Transactional
    public Assignment returnAssignment(String id) {
        Assignment assignment = assignmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setStatus("RETURNED");
        assignment.setReturnDate(LocalDate.now());
        return assignmentRepository.save(assignment);
    }

    @Transactional
    public Expenditure createExpenditure(ExpenditureRequest req, User currentUser) {
        Base base = baseRepository.findById(req.getBaseId()).orElseThrow(() -> new RuntimeException("Base not found"));
        EquipmentCategory category = categoryRepository.findById(req.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));

        int year = LocalDate.now().getYear();
        long count = expenditureRepository.countByExpenditureCodeStartingWith("EXP-" + year);
        String code = "EXP-" + year + "-" + String.format("%04d", count + 1000 + 1);

        Expenditure expenditure = new Expenditure();
        expenditure.setId("exp-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        expenditure.setExpenditureCode(code);
        expenditure.setBase(base);
        expenditure.setCategory(category);
        expenditure.setAssetName(req.getAssetName());
        expenditure.setQuantity(req.getQuantity());
        expenditure.setExpenditureType(req.getExpenditureType());
        expenditure.setExpenditureDate(req.getExpenditureDate() != null ? req.getExpenditureDate() : LocalDate.now());
        expenditure.setMissionRef(req.getMissionRef());
        expenditure.setAuthorizedBy(currentUser);
        expenditure.setAfterActionReport(req.getAfterActionReport());
        expenditure.setCreatedAt(LocalDateTime.now());
        return expenditureRepository.save(expenditure);
    }
}
