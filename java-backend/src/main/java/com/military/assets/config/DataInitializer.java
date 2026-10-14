package com.military.assets.config;

import com.military.assets.model.*;
import com.military.assets.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private BaseRepository baseRepository;
    @Autowired private EquipmentCategoryRepository categoryRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InventoryItemRepository inventoryItemRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private TransferRepository transferRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private ExpenditureRepository expenditureRepository;
    @Autowired private AuditLogRepository auditLogRepository;

    @Override
    public void run(String... args) throws Exception {
        if (baseRepository.count() > 0) return;

        // Seed Bases
        Base alpha = new Base("base-alpha", "AFB-NORTH", "Fort Sentinel (Command HQ)", "Sector 4 - Northern Frontier", "Col. Sarah Miller", "DEFCON-3", "active", LocalDateTime.now());
        Base bravo = new Base("base-bravo", "CAMP-VALOR", "Camp Valor Logistics Outpost", "Sector 9 - Eastern Plateau", "Maj. John Hayes", "DEFCON-4", "active", LocalDateTime.now());
        Base charlie = new Base("base-charlie", "NAVAL-POINT", "Naval Point Maritime Redoubt", "Sector 2 - Coastal Basin", "Cmdr. Elena Rostova", "DEFCON-3", "active", LocalDateTime.now());
        Base delta = new Base("base-delta", "FORT-IRONCLAD", "Fort Ironclad Armored Depot", "Sector 7 - Central Desert", "Col. Marcus Vance", "DEFCON-2", "active", LocalDateTime.now());
        baseRepository.saveAll(List.of(alpha, bravo, charlie, delta));

        // Seed Equipment Categories
        EquipmentCategory weapons = new EquipmentCategory("weapons", "Small Arms & Heavy Weapons", "WEP", "Units", "shield", "Rifles, pistols, machine guns, rocket launchers");
        EquipmentCategory vehicles = new EquipmentCategory("vehicles", "Armored & Combat Vehicles", "VEH", "Units", "truck", "APCs, tanks, jeeps, helicopters");
        EquipmentCategory ammunition = new EquipmentCategory("ammunition", "Ammunition & Ordnance", "AMMO", "Rounds", "target", "All types of ammunition and ordnance");
        EquipmentCategory comms = new EquipmentCategory("comms", "Tactical Communications", "COM", "Units", "radio", "Radios, satellite comms, field phones");
        EquipmentCategory optics = new EquipmentCategory("optics", "Optics & Night Vision", "OPT", "Units", "eye", "Binoculars, night vision, scopes");
        categoryRepository.saveAll(List.of(weapons, vehicles, ammunition, comms, optics));

        // Seed Users
        User admin = new User("user-admin", "general.vance", "Gen. Arthur Vance", "a.vance@military.gov", "admin", null, "General (4-Star)", "SN-USA-00109", null, LocalDateTime.now());
        User cmdAlpha = new User("user-cmd-alpha", "col.miller", "Col. Sarah Miller", "s.miller@sentinel.mil", "commander", alpha, "Colonel (O-6)", "SN-USA-04281", null, LocalDateTime.now());
        User cmdBravo = new User("user-cmd-bravo", "maj.hayes", "Maj. John Hayes", "j.hayes@valor.mil", "commander", bravo, "Major (O-4)", "SN-USA-07892", null, LocalDateTime.now());
        User logistics = new User("user-logistics", "lt.carter", "Lt. Alex Carter", "a.carter@logistics.mil", "logistics", alpha, "First Lieutenant (O-2)", "SN-USA-11409", null, LocalDateTime.now());
        userRepository.saveAll(List.of(admin, cmdAlpha, cmdBravo, logistics));

        // Seed Inventory Items (inv-1 through inv-17)
        InventoryItem inv1 = new InventoryItem("inv-1", alpha, weapons, "M4 Carbine Rifle", "M4A1-2022", 150, 142, 50, LocalDateTime.now());
        InventoryItem inv2 = new InventoryItem("inv-2", alpha, ammunition, "5.56mm NATO Rounds", "5.56-STD", 50000, 47500, 10000, LocalDateTime.now());
        InventoryItem inv3 = new InventoryItem("inv-3", alpha, vehicles, "M1151 HMMWV", "HMMWV-M1151", 20, 18, 5, LocalDateTime.now());
        InventoryItem inv4 = new InventoryItem("inv-4", alpha, comms, "PRC-117G Radio", "PRC-117G", 30, 28, 10, LocalDateTime.now());
        InventoryItem inv5 = new InventoryItem("inv-5", alpha, optics, "AN/PVS-14 NVG", "PVS14-2021", 40, 38, 15, LocalDateTime.now());
        InventoryItem inv6 = new InventoryItem("inv-6", bravo, weapons, "M249 SAW", "M249-PIP", 25, 22, 8, LocalDateTime.now());
        InventoryItem inv7 = new InventoryItem("inv-7", bravo, ammunition, "7.62mm Rounds", "7.62-NATO", 30000, 28500, 5000, LocalDateTime.now());
        InventoryItem inv8 = new InventoryItem("inv-8", bravo, vehicles, "M113 APC", "M113A3", 10, 9, 3, LocalDateTime.now());
        InventoryItem inv9 = new InventoryItem("inv-9", bravo, comms, "AN/PRC-152 Radio", "PRC-152A", 20, 19, 5, LocalDateTime.now());
        InventoryItem inv10 = new InventoryItem("inv-10", charlie, weapons, "M240B Machine Gun", "M240B-2020", 15, 14, 4, LocalDateTime.now());
        InventoryItem inv11 = new InventoryItem("inv-11", charlie, ammunition, "12.7mm Rounds", "12.7-AP", 15000, 14200, 3000, LocalDateTime.now());
        InventoryItem inv12 = new InventoryItem("inv-12", charlie, vehicles, "RIB Patrol Boat", "RIB-2022", 8, 8, 2, LocalDateTime.now());
        InventoryItem inv13 = new InventoryItem("inv-13", charlie, optics, "Thermal Imaging Scope", "TIS-2022", 12, 11, 4, LocalDateTime.now());
        InventoryItem inv14 = new InventoryItem("inv-14", delta, weapons, "M2 Browning HMG", "M2HB-QCB", 12, 11, 3, LocalDateTime.now());
        InventoryItem inv15 = new InventoryItem("inv-15", delta, ammunition, "40mm Grenade Rounds", "40MM-HE", 8000, 7600, 1500, LocalDateTime.now());
        InventoryItem inv16 = new InventoryItem("inv-16", delta, vehicles, "M1A2 Abrams Tank", "M1A2-SEPv3", 6, 6, 2, LocalDateTime.now());
        InventoryItem inv17 = new InventoryItem("inv-17", delta, comms, "AN/VRC-92 Radio", "VRC-92E", 15, 14, 5, LocalDateTime.now());
        inventoryItemRepository.saveAll(List.of(inv1, inv2, inv3, inv4, inv5, inv6, inv7, inv8, inv9, inv10, inv11, inv12, inv13, inv14, inv15, inv16, inv17));

        // Seed Purchases (pur-1 through pur-6)
        Purchase pur1 = new Purchase("pur-1", "PO-2025-1001", alpha, weapons, "M4 Carbine Rifle", "BATCH-2025-001", 10, 850.0, 8500.0, "ArmaLite Corp", LocalDate.of(2025, 1, 15), admin, "Standard procurement Q1 2025", LocalDateTime.of(2025, 1, 15, 10, 0, 0));
        Purchase pur2 = new Purchase("pur-2", "PO-2025-1002", alpha, ammunition, "5.56mm NATO Rounds", "LOT-5.56-2025A", 5000, 0.45, 2250.0, "Ammo Dynamics Inc", LocalDate.of(2025, 2, 10), logistics, "Resupply for Q1 training", LocalDateTime.of(2025, 2, 10, 9, 30, 0));
        Purchase pur3 = new Purchase("pur-3", "PO-2025-1003", bravo, weapons, "M249 SAW", "SN-M249-2025B", 3, 4200.0, 12600.0, "FN Herstal", LocalDate.of(2025, 3, 5), cmdBravo, "Replacement for damaged units", LocalDateTime.of(2025, 3, 5, 14, 0, 0));
        Purchase pur4 = new Purchase("pur-4", "PO-2025-1004", charlie, optics, "Thermal Imaging Scope", "TIS-BATCH-2025", 4, 3200.0, 12800.0, "Elbit Systems", LocalDate.of(2025, 4, 20), admin, "Maritime surveillance upgrade", LocalDateTime.of(2025, 4, 20, 11, 0, 0));
        Purchase pur5 = new Purchase("pur-5", "PO-2025-1005", delta, ammunition, "40mm Grenade Rounds", "LOT-40MM-2025", 500, 12.5, 6250.0, "General Dynamics", LocalDate.of(2025, 5, 12), admin, "Armored division resupply", LocalDateTime.of(2025, 5, 12, 8, 0, 0));
        Purchase pur6 = new Purchase("pur-6", "PO-2025-1006", alpha, comms, "PRC-117G Radio", "PRC-BATCH-2025", 5, 7800.0, 39000.0, "Harris Corporation", LocalDate.of(2025, 6, 1), logistics, "Communications upgrade", LocalDateTime.of(2025, 6, 1, 16, 0, 0));
        purchaseRepository.saveAll(List.of(pur1, pur2, pur3, pur4, pur5, pur6));

        // Seed Transfers (trf-1 through trf-6)
        Transfer trf1 = new Transfer("trf-1", "TRF-2025-1001", alpha, bravo, weapons, "M4 Carbine Rifle", 5, "COMPLETED", "Ground", LocalDate.of(2025, 2, 20), cmdAlpha, cmdBravo, "Reinforcement for eastern operations", LocalDateTime.of(2025, 2, 20, 10, 0, 0));
        Transfer trf2 = new Transfer("trf-2", "TRF-2025-1002", delta, charlie, vehicles, "M1151 HMMWV", 2, "COMPLETED", "Ground", LocalDate.of(2025, 3, 15), admin, cmdAlpha, "Maritime patrol support", LocalDateTime.of(2025, 3, 15, 9, 0, 0));
        Transfer trf3 = new Transfer("trf-3", "TRF-2025-1003", bravo, delta, ammunition, "7.62mm Rounds", 3000, "IN_TRANSIT", "Air", LocalDate.of(2025, 4, 10), cmdBravo, null, "Desert operations resupply", LocalDateTime.of(2025, 4, 10, 14, 0, 0));
        Transfer trf4 = new Transfer("trf-4", "TRF-2025-1004", alpha, charlie, comms, "PRC-117G Radio", 3, "COMPLETED", "Air", LocalDate.of(2025, 5, 5), logistics, cmdAlpha, "Communications support", LocalDateTime.of(2025, 5, 5, 11, 0, 0));
        Transfer trf5 = new Transfer("trf-5", "TRF-2025-1005", charlie, bravo, optics, "AN/PVS-14 NVG", 5, "COMPLETED", "Sea", LocalDate.of(2025, 6, 12), cmdAlpha, cmdBravo, "Night ops support", LocalDateTime.of(2025, 6, 12, 15, 0, 0));
        Transfer trf6 = new Transfer("trf-6", "TRF-2025-1006", delta, alpha, vehicles, "M1A2 Abrams Tank", 1, "IN_TRANSIT", "Ground", LocalDate.of(2025, 7, 1), admin, null, "Command HQ display", LocalDateTime.of(2025, 7, 1, 8, 0, 0));
        transferRepository.saveAll(List.of(trf1, trf2, trf3, trf4, trf5, trf6));

        // Seed Assignments (asn-1 through asn-5)
        Assignment asn1 = new Assignment("asn-1", "ASN-2025-1001", alpha, weapons, "M4 Carbine Rifle", "Sgt. James Wilson", "MID-2025-001", "Sergeant (E-5)", "1st Infantry Platoon", 2, LocalDate.of(2025, 3, 1), LocalDate.of(2025, 9, 1), null, "ACTIVE", cmdAlpha, "Issued for field deployment", LocalDateTime.of(2025, 3, 1, 9, 0, 0));
        Assignment asn2 = new Assignment("asn-2", "ASN-2025-1002", bravo, comms, "AN/PRC-152 Radio", "Cpl. Maria Rodriguez", "MID-2025-002", "Corporal (E-4)", "Signal Corps Detachment", 1, LocalDate.of(2025, 4, 15), LocalDate.of(2025, 10, 15), null, "ACTIVE", cmdBravo, "Communications assignment", LocalDateTime.of(2025, 4, 15, 10, 0, 0));
        Assignment asn3 = new Assignment("asn-3", "ASN-2025-1003", alpha, optics, "AN/PVS-14 NVG", "Pvt. David Kim", "MID-2025-003", "Private (E-2)", "Recon Unit Alpha", 1, LocalDate.of(2025, 2, 10), LocalDate.of(2025, 5, 10), LocalDate.of(2025, 5, 8), "RETURNED", logistics, "Short-term recon assignment", LocalDateTime.of(2025, 2, 10, 8, 0, 0));
        Assignment asn4 = new Assignment("asn-4", "ASN-2025-1004", delta, weapons, "M2 Browning HMG", "SSgt. Robert Chen", "MID-2025-004", "Staff Sergeant (E-6)", "Armored Division", 1, LocalDate.of(2025, 1, 20), LocalDate.of(2025, 4, 20), null, "OVERDUE", admin, "Armored support assignment", LocalDateTime.of(2025, 1, 20, 11, 0, 0));
        Assignment asn5 = new Assignment("asn-5", "ASN-2025-1005", charlie, optics, "Thermal Imaging Scope", "Lt. Anna Petrov", "MID-2025-005", "Lieutenant (O-2)", "Maritime Patrol Unit", 2, LocalDate.of(2025, 5, 20), LocalDate.of(2025, 11, 20), null, "ACTIVE", cmdAlpha, "Maritime surveillance", LocalDateTime.of(2025, 5, 20, 14, 0, 0));
        assignmentRepository.saveAll(List.of(asn1, asn2, asn3, asn4, asn5));

        // Seed Expenditures (exp-1 through exp-4)
        Expenditure exp1 = new Expenditure("exp-1", "EXP-2025-1001", alpha, ammunition, "5.56mm NATO Rounds", 2500, "LIVE_FIRE_EXERCISE", LocalDate.of(2025, 3, 20), "EX-SENTINEL-2025", cmdAlpha, "Annual qualification exercise completed", LocalDateTime.of(2025, 3, 20, 16, 0, 0));
        Expenditure exp2 = new Expenditure("exp-2", "EXP-2025-1002", delta, ammunition, "40mm Grenade Rounds", 400, "OPERATIONAL_MISSION", LocalDate.of(2025, 4, 5), "OP-DESERT-STRIKE", admin, "Desert strike operation", LocalDateTime.of(2025, 4, 5, 20, 0, 0));
        Expenditure exp3 = new Expenditure("exp-3", "EXP-2025-1003", bravo, weapons, "M249 SAW", 1, "DECOMMISSIONED_WRITEOFF", LocalDate.of(2025, 5, 15), null, cmdBravo, "Weapon beyond economical repair", LocalDateTime.of(2025, 5, 15, 10, 0, 0));
        Expenditure exp4 = new Expenditure("exp-4", "EXP-2025-1004", charlie, ammunition, "12.7mm Rounds", 800, "OPERATIONAL_MISSION", LocalDate.of(2025, 6, 8), "OP-COASTAL-GUARD", cmdAlpha, "Coastal patrol engagement", LocalDateTime.of(2025, 6, 8, 18, 0, 0));
        expenditureRepository.saveAll(List.of(exp1, exp2, exp3, exp4));

        // Seed Audit Logs (aud-1 through aud-5)
        AuditLog aud1 = new AuditLog("aud-1", LocalDateTime.of(2025, 1, 15, 10, 0, 0), "user-admin", "Gen. Arthur Vance", "admin", null, "RECORD_PURCHASE", "Purchase", "pur-1", "{\"purchaseOrder\":\"PO-2025-1001\",\"quantity\":10,\"assetName\":\"M4 Carbine Rifle\"}", "192.168.1.100");
        AuditLog aud2 = new AuditLog("aud-2", LocalDateTime.of(2025, 2, 20, 10, 0, 0), "user-cmd-alpha", "Col. Sarah Miller", "commander", "base-alpha", "INITIATE_TRANSFER", "Transfer", "trf-1", "{\"trackingNumber\":\"TRF-2025-1001\",\"quantity\":5}", "192.168.1.101");
        AuditLog aud3 = new AuditLog("aud-3", LocalDateTime.of(2025, 3, 1, 9, 0, 0), "user-cmd-alpha", "Col. Sarah Miller", "commander", "base-alpha", "RECORD_ASSIGNMENT", "Assignment", "asn-1", "{\"code\":\"ASN-2025-1001\",\"quantity\":2}", "192.168.1.101");
        AuditLog aud4 = new AuditLog("aud-4", LocalDateTime.of(2025, 3, 20, 16, 0, 0), "user-cmd-alpha", "Col. Sarah Miller", "commander", "base-alpha", "RECORD_EXPENDITURE", "Expenditure", "exp-1", "{\"code\":\"EXP-2025-1001\",\"quantity\":2500}", "192.168.1.101");
        AuditLog aud5 = new AuditLog("aud-5", LocalDateTime.of(2025, 6, 1, 8, 30, 0), "user-logistics", "Lt. Alex Carter", "logistics", "base-alpha", "USER_LOGIN", "User", "user-logistics", "{\"action\":\"login\"}", "192.168.1.102");
        auditLogRepository.saveAll(List.of(aud1, aud2, aud3, aud4, aud5));
    }
}
