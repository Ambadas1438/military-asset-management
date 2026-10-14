-- =========================================================================
-- MILITARY ASSET MANAGEMENT SYSTEM - RELATIONAL DATABASE DUMP
-- Dialect: SQLite / ANSI SQL-92 Standard
-- Export Date: 2026-10-09T07:55:13.338Z
-- Schema: Relational Ledger with Foreign Keys and Audit Trail
-- =========================================================================

PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------------------
-- Table structure for table: assignments
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "assignments";
CREATE TABLE assignments (
      id TEXT PRIMARY KEY,
      assignment_code TEXT UNIQUE NOT NULL,
      base_id TEXT NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES equipment_categories(id),
      asset_name TEXT NOT NULL,
      personnel_name TEXT NOT NULL,
      military_id TEXT NOT NULL,
      rank TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      issue_date DATE NOT NULL,
      return_due_date DATE,
      return_date DATE,
      status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'RETURNED', 'OVERDUE')),
      issued_by TEXT NOT NULL REFERENCES users(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Dumping data for table: assignments (6 records)
INSERT INTO "assignments" ("id", "assignment_code", "base_id", "category_id", "asset_name", "personnel_name", "military_id", "rank", "unit", "quantity", "issue_date", "return_due_date", "return_date", "status", "issued_by", "notes", "created_at") VALUES ('asn-1', 'ASN-2026-101', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 'Staff Sgt. Marcus Brody', 'MIL-40912', 'SSG (E-6)', '1st Recon Platoon', 1, '2026-09-08', '2026-10-08', NULL, 'ACTIVE', 'user-cmd-alpha', 'Issued for Northern Perimeter Guard Duty', '2026-10-09 07:02:42');
INSERT INTO "assignments" ("id", "assignment_code", "base_id", "category_id", "asset_name", "personnel_name", "military_id", "rank", "unit", "quantity", "issue_date", "return_due_date", "return_date", "status", "issued_by", "notes", "created_at") VALUES ('asn-2', 'ASN-2026-102', 'base-alpha', 'comms', 'AN/PRC-152 Falcon III Radio', 'Sgt. Lisa Chen', 'MIL-51820', 'SGT (E-5)', 'Signals Intelligence Unit', 1, '2026-09-12', '2026-10-15', NULL, 'ACTIVE', 'user-cmd-alpha', 'Secured patrol comms package', '2026-10-09 07:02:42');
INSERT INTO "assignments" ("id", "assignment_code", "base_id", "category_id", "asset_name", "personnel_name", "military_id", "rank", "unit", "quantity", "issue_date", "return_due_date", "return_date", "status", "issued_by", "notes", "created_at") VALUES ('asn-3', 'ASN-2026-103', 'base-alpha', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 'Capt. Derrick Young', 'MIL-22910', 'CPT (O-3)', 'Bravo Quick Reaction Force', 2, '2026-09-15', '2026-10-20', NULL, 'ACTIVE', 'user-cmd-alpha', 'Assigned for rapid response border escorts', '2026-10-09 07:02:42');
INSERT INTO "assignments" ("id", "assignment_code", "base_id", "category_id", "asset_name", "personnel_name", "military_id", "rank", "unit", "quantity", "issue_date", "return_due_date", "return_date", "status", "issued_by", "notes", "created_at") VALUES ('asn-4', 'ASN-2026-104', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 'Cpl. David Ortiz', 'MIL-63019', 'CPL (E-4)', 'Eastern Scout Unit', 1, '2026-09-16', '2026-09-30', '2026-09-30', 'RETURNED', 'user-cmd-bravo', 'Returned in good condition after mission completed', '2026-10-09 07:02:42');
INSERT INTO "assignments" ("id", "assignment_code", "base_id", "category_id", "asset_name", "personnel_name", "military_id", "rank", "unit", "quantity", "issue_date", "return_due_date", "return_date", "status", "issued_by", "notes", "created_at") VALUES ('asn-5', 'ASN-2026-105', 'base-bravo', 'vehicles', 'JLTV Joint Light Tactical Vehicle', '1st Lt. Michael Torres', 'MIL-33821', '1LT (O-2)', 'Logistics Escort Detachment', 1, '2026-10-01', '2026-10-31', NULL, 'ACTIVE', 'user-cmd-bravo', 'Convoy escort vehicle assignment', '2026-10-09 07:02:42');
INSERT INTO "assignments" ("id", "assignment_code", "base_id", "category_id", "asset_name", "personnel_name", "military_id", "rank", "unit", "quantity", "issue_date", "return_due_date", "return_date", "status", "issued_by", "notes", "created_at") VALUES ('asn-1791530254330', 'ASN-2026-312', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 'Cpl. Thomas Miller', 'MIL-99411', 'CPL (E-4)', '3rd Recon Squadron', 1, '2026-10-09', NULL, NULL, 'ACTIVE', 'user-cmd-alpha', 'Test soldier assignment', '2026-10-09 07:17:34');

-- -------------------------------------------------------------------------
-- Table structure for table: audit_logs
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "audit_logs";
CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      base_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT DEFAULT '127.0.0.1'
    );

-- Dumping data for table: audit_logs (10 records)
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-1', '2026-09-01 08:00:00', 'user-admin', 'Gen. Arthur Vance', 'admin', NULL, 'SYSTEM_INITIALIZATION', 'SYSTEM', 'SYS-ROOT', '{"message":"Military Asset Ledger initialized with 4 bases and baseline inventory."}', '127.0.0.1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-2', '2026-09-05 10:14:00', 'user-logistics', 'Lt. Alex Carter', 'logistics', 'base-alpha', 'RECORD_PURCHASE', 'PURCHASE', 'PO-2026-0905', '{"asset":"M4A1 SOPMOD Carbine","qty":50,"base":"Fort Sentinel","cost":71000}', '127.0.0.1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-3', '2026-09-10 14:32:00', 'user-logistics', 'Lt. Alex Carter', 'logistics', 'base-alpha', 'INITIATE_TRANSFER', 'TRANSFER', 'TRF-2026-9041', '{"asset":"M4A1 SOPMOD Carbine","qty":25,"from":"base-alpha","to":"base-bravo"}', '127.0.0.1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-4', '2026-09-14 17:00:00', 'user-cmd-alpha', 'Col. Sarah Miller', 'commander', 'base-alpha', 'RECORD_EXPENDITURE', 'EXPENDITURE', 'EXP-2026-01', '{"asset":"5.56x45mm NATO Ball Rounds","qty":7000,"type":"LIVE_FIRE_EXERCISE","mission":"OPERATION-IRON-SENTINEL"}', '127.0.0.1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-5', '2026-10-04 11:20:00', 'user-cmd-bravo', 'Maj. John Hayes', 'commander', 'base-bravo', 'INITIATE_TRANSFER', 'TRANSFER', 'TRF-2026-9045', '{"asset":"M4A1 SOPMOD Carbine","qty":10,"from":"base-bravo","to":"base-alpha"}', '127.0.0.1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-1791530254287-4dd510', '2026-10-09 07:17:34', 'user-logistics', 'Lt. Alex Carter', 'logistics', 'base-alpha', 'RECORD_PURCHASE', 'PURCHASE', 'PO-2026-6731', '{"purchaseId":"pur-1791530254283","purchaseOrder":"PO-2026-6731","baseId":"base-alpha","categoryId":"weapons","assetName":"M4A1 SOPMOD Carbine","quantity":15,"unitCost":1400,"totalCost":21000,"supplier":"Colt Defense LLC","purchaseDate":"2026-10-09"}', '::1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-1791530254315-c9162a', '2026-10-09 07:17:34', 'user-cmd-alpha', 'Col. Sarah Miller', 'commander', 'base-alpha', 'INITIATE_TRANSFER', 'TRANSFER', 'TRF-2026-5223', '{"transferId":"trf-1791530254312","trackingNumber":"TRF-2026-5223","originBaseId":"base-alpha","destinationBaseId":"base-bravo","assetName":"M4A1 SOPMOD Carbine","quantity":5,"status":"COMPLETED","transferDate":"2026-10-09"}', '::1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-1791530254333-656d53', '2026-10-09 07:17:34', 'user-cmd-alpha', 'Col. Sarah Miller', 'commander', 'base-alpha', 'ASSIGN_ASSET', 'ASSIGNMENT', 'ASN-2026-312', '{"assignmentId":"asn-1791530254330","assignmentCode":"ASN-2026-312","personnelName":"Cpl. Thomas Miller","militaryId":"MIL-99411","assetName":"M4A1 SOPMOD Carbine","quantity":1,"unit":"3rd Recon Squadron"}', '::1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-1791530254347-599574', '2026-10-09 07:17:34', 'user-cmd-alpha', 'Col. Sarah Miller', 'commander', 'base-alpha', 'RECORD_EXPENDITURE', 'EXPENDITURE', 'EXP-2026-31', '{"expenditureId":"exp-1791530254346","expenditureCode":"EXP-2026-31","assetName":"5.56x45mm NATO Ball Rounds","quantity":1000,"expenditureType":"LIVE_FIRE_EXERCISE","missionRef":"DRILL-ALPHA-CERT"}', '::1');
INSERT INTO "audit_logs" ("id", "timestamp", "user_id", "user_name", "user_role", "base_id", "action", "entity_type", "entity_id", "details", "ip_address") VALUES ('aud-1791531053257-3916c7', '2026-10-09 07:30:53', 'user-logistics', 'Lt. Alex Carter', 'logistics', 'base-alpha', 'RECORD_PURCHASE', 'PURCHASE', 'PO-2026-1054', '{"purchaseId":"pur-1791531053248","purchaseOrder":"PO-2026-1054","baseId":"base-alpha","categoryId":"weapons","assetName":"M4A1 Carbine","quantity":10,"unitCost":1200,"totalCost":12000,"supplier":"Ordnance Depot","purchaseDate":"2026-10-09"}', '::1');

-- -------------------------------------------------------------------------
-- Table structure for table: bases
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "bases";
CREATE TABLE bases (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      commander_name TEXT NOT NULL,
      security_level TEXT DEFAULT 'DEFCON-4',
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Dumping data for table: bases (4 records)
INSERT INTO "bases" ("id", "code", "name", "location", "commander_name", "security_level", "status", "created_at") VALUES ('base-alpha', 'AFB-NORTH', 'Fort Sentinel (Command HQ)', 'Sector 4 - Northern Frontier', 'Col. Sarah Miller', 'DEFCON-3', 'ACTIVE', '2026-10-09 07:02:41');
INSERT INTO "bases" ("id", "code", "name", "location", "commander_name", "security_level", "status", "created_at") VALUES ('base-bravo', 'CAMP-VALOR', 'Camp Valor Logistics Outpost', 'Sector 9 - Eastern Plateau', 'Maj. John Hayes', 'DEFCON-4', 'ACTIVE', '2026-10-09 07:02:41');
INSERT INTO "bases" ("id", "code", "name", "location", "commander_name", "security_level", "status", "created_at") VALUES ('base-charlie', 'NAVAL-POINT', 'Naval Point Maritime Redoubt', 'Sector 2 - Coastal Basin', 'Cmdr. Elena Rostova', 'DEFCON-3', 'ACTIVE', '2026-10-09 07:02:41');
INSERT INTO "bases" ("id", "code", "name", "location", "commander_name", "security_level", "status", "created_at") VALUES ('base-delta', 'FORT-IRONCLAD', 'Fort Ironclad Armored Depot', 'Sector 7 - Central Desert', 'Col. Marcus Vance', 'DEFCON-2', 'ACTIVE', '2026-10-09 07:02:41');

-- -------------------------------------------------------------------------
-- Table structure for table: equipment_categories
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "equipment_categories";
CREATE TABLE equipment_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      unit_of_measure TEXT NOT NULL,
      icon TEXT DEFAULT 'Shield',
      description TEXT
    );

-- Dumping data for table: equipment_categories (5 records)
INSERT INTO "equipment_categories" ("id", "name", "code", "unit_of_measure", "icon", "description") VALUES ('weapons', 'Small Arms & Heavy Weapons', 'WEP', 'Units', 'Crosshair', 'Standard rifles, sidearms, heavy machine guns, launchers');
INSERT INTO "equipment_categories" ("id", "name", "code", "unit_of_measure", "icon", "description") VALUES ('vehicles', 'Armored & Combat Vehicles', 'VEH', 'Units', 'Truck', 'Tanks, APCs, MRAPs, tactical utility vehicles');
INSERT INTO "equipment_categories" ("id", "name", "code", "unit_of_measure", "icon", "description") VALUES ('ammunition', 'Ammunition & Ordnance', 'AMMO', 'Rounds', 'Target', 'Small caliber, artillery shells, mortar rounds, missiles');
INSERT INTO "equipment_categories" ("id", "name", "code", "unit_of_measure", "icon", "description") VALUES ('comms', 'Tactical Communications', 'COM', 'Units', 'Radio', 'Encrypted radios, satellite uplinks, electronic countermeasures');
INSERT INTO "equipment_categories" ("id", "name", "code", "unit_of_measure", "icon", "description") VALUES ('optics', 'Optics & Night Vision', 'OPT', 'Units', 'Eye', 'Thermal sights, NVGs, laser target designators');

-- -------------------------------------------------------------------------
-- Table structure for table: expenditures
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "expenditures";
CREATE TABLE expenditures (
      id TEXT PRIMARY KEY,
      expenditure_code TEXT UNIQUE NOT NULL,
      base_id TEXT NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES equipment_categories(id),
      asset_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      expenditure_type TEXT NOT NULL CHECK(expenditure_type IN ('LIVE_FIRE_EXERCISE', 'OPERATIONAL_MISSION', 'MAINTENANCE_CONSUMED', 'DECOMMISSIONED_WRITEOFF', 'DAMAGED_IN_ACTION')),
      expenditure_date DATE NOT NULL,
      mission_ref TEXT NOT NULL,
      authorized_by TEXT NOT NULL REFERENCES users(id),
      after_action_report TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Dumping data for table: expenditures (5 records)
INSERT INTO "expenditures" ("id", "expenditure_code", "base_id", "category_id", "asset_name", "quantity", "expenditure_type", "expenditure_date", "mission_ref", "authorized_by", "after_action_report", "created_at") VALUES ('exp-1', 'EXP-2026-01', 'base-alpha', 'ammunition', '5.56x45mm NATO Ball Rounds', 7000, 'LIVE_FIRE_EXERCISE', '2026-09-14', 'OPERATION-IRON-SENTINEL', 'user-cmd-alpha', 'Expended during battalion qualification and night-vision target drills', '2026-10-09 07:02:42');
INSERT INTO "expenditures" ("id", "expenditure_code", "base_id", "category_id", "asset_name", "quantity", "expenditure_type", "expenditure_date", "mission_ref", "authorized_by", "after_action_report", "created_at") VALUES ('exp-2', 'EXP-2026-02', 'base-alpha', 'ammunition', '120mm Tank Sabot Shells', 50, 'LIVE_FIRE_EXERCISE', '2026-09-20', 'DRILL-TITAN-RANGE', 'user-cmd-alpha', 'Abrams crew gunnery qualification at northern firing grounds', '2026-10-09 07:02:42');
INSERT INTO "expenditures" ("id", "expenditure_code", "base_id", "category_id", "asset_name", "quantity", "expenditure_type", "expenditure_date", "mission_ref", "authorized_by", "after_action_report", "created_at") VALUES ('exp-3', 'EXP-2026-03', 'base-bravo', 'ammunition', '5.56x45mm NATO Ball Rounds', 5000, 'LIVE_FIRE_EXERCISE', '2026-09-25', 'DRILL-VALOR-SHIELD', 'user-cmd-bravo', 'Annual base security marksmanship recertification', '2026-10-09 07:02:42');
INSERT INTO "expenditures" ("id", "expenditure_code", "base_id", "category_id", "asset_name", "quantity", "expenditure_type", "expenditure_date", "mission_ref", "authorized_by", "after_action_report", "created_at") VALUES ('exp-4', 'EXP-2026-04', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 1, 'DECOMMISSIONED_WRITEOFF', '2026-10-01', 'MAINT-SURVEY-2026-88', 'user-admin', 'Receiver cracked beyond field repair; condemned and logged for smelting write-off', '2026-10-09 07:02:42');
INSERT INTO "expenditures" ("id", "expenditure_code", "base_id", "category_id", "asset_name", "quantity", "expenditure_type", "expenditure_date", "mission_ref", "authorized_by", "after_action_report", "created_at") VALUES ('exp-1791530254346', 'EXP-2026-31', 'base-alpha', 'ammunition', '5.56x45mm NATO Ball Rounds', 1000, 'LIVE_FIRE_EXERCISE', '2026-10-09', 'DRILL-ALPHA-CERT', 'user-cmd-alpha', 'Target drills completed', '2026-10-09 07:17:34');

-- -------------------------------------------------------------------------
-- Table structure for table: inventory_items
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "inventory_items";
CREATE TABLE inventory_items (
      id TEXT PRIMARY KEY,
      base_id TEXT NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES equipment_categories(id),
      asset_name TEXT NOT NULL,
      model_number TEXT,
      initial_balance INTEGER NOT NULL DEFAULT 0,
      current_quantity INTEGER NOT NULL DEFAULT 0,
      minimum_threshold INTEGER DEFAULT 10,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(base_id, category_id, asset_name)
    );

-- Dumping data for table: inventory_items (18 records)
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-1', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 'Colt M4A1', 450, 429, 50, '2026-10-09 07:17:34');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-2', 'base-alpha', 'weapons', 'M240B Machine Gun', 'FN M240B', 80, 75, 10, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-3', 'base-alpha', 'vehicles', 'M1A2 Abrams Main Battle Tank', 'General Dynamics SEPv3', 24, 22, 5, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-4', 'base-alpha', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 'Oshkosh L-ATV', 60, 55, 8, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-5', 'base-alpha', 'ammunition', '5.56x45mm NATO Ball Rounds', 'M855A1 EPR', 150000, 137000, 20000, '2026-10-09 07:17:34');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-6', 'base-alpha', 'ammunition', '120mm Tank Sabot Shells', 'M829A4 APFSDS', 1200, 1150, 150, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-7', 'base-alpha', 'comms', 'AN/PRC-152 Falcon III Radio', 'L3Harris AN/PRC-152A', 110, 105, 15, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-8', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 'Colt M4A1', 300, 295, 40, '2026-10-09 07:17:34');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-9', 'base-bravo', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 'Oshkosh L-ATV', 40, 38, 5, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-10', 'base-bravo', 'ammunition', '5.56x45mm NATO Ball Rounds', 'M855A1 EPR', 90000, 85000, 15000, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-11', 'base-bravo', 'comms', 'AN/PRC-152 Falcon III Radio', 'L3Harris AN/PRC-152A', 65, 60, 10, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-12', 'base-charlie', 'weapons', 'M4A1 SOPMOD Carbine', 'Colt M4A1', 220, 215, 30, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-13', 'base-charlie', 'ammunition', '5.56x45mm NATO Ball Rounds', 'M855A1 EPR', 60000, 58000, 10000, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-14', 'base-charlie', 'optics', 'AN/PVS-31A Night Vision Goggles', 'L3Harris BNVD', 90, 85, 12, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-15', 'base-delta', 'vehicles', 'M1A2 Abrams Main Battle Tank', 'General Dynamics SEPv3', 45, 42, 10, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-16', 'base-delta', 'weapons', 'Javelin Anti-Tank Missile Launcher', 'Raytheon / Lockheed FGM-148', 35, 33, 5, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-17', 'base-delta', 'ammunition', '120mm Tank Sabot Shells', 'M829A4 APFSDS', 2500, 2400, 300, '2026-10-09 07:02:41');
INSERT INTO "inventory_items" ("id", "base_id", "category_id", "asset_name", "model_number", "initial_balance", "current_quantity", "minimum_threshold", "updated_at") VALUES ('inv-1791531053253', 'base-alpha', 'weapons', 'M4A1 Carbine', 'Standard Military Spec', 0, 10, 10, '2026-10-09 07:30:53');

-- -------------------------------------------------------------------------
-- Table structure for table: purchases
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "purchases";
CREATE TABLE purchases (
      id TEXT PRIMARY KEY,
      purchase_order TEXT UNIQUE NOT NULL,
      base_id TEXT NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES equipment_categories(id),
      asset_name TEXT NOT NULL,
      serial_or_batch TEXT,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      unit_cost REAL NOT NULL,
      total_cost REAL NOT NULL,
      supplier TEXT NOT NULL,
      purchase_date DATE NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Dumping data for table: purchases (8 records)
INSERT INTO "purchases" ("id", "purchase_order", "base_id", "category_id", "asset_name", "serial_or_batch", "quantity", "unit_cost", "total_cost", "supplier", "purchase_date", "created_by", "notes", "created_at") VALUES ('pur-1', 'PO-2026-0905', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 'LOT-COLT-2026A', 50, 1420, 71000, 'Colt Defense LLC', '2026-09-05', 'user-logistics', 'Quarterly reinforcement batch for Recon squads', '2026-10-09 07:02:41');
INSERT INTO "purchases" ("id", "purchase_order", "base_id", "category_id", "asset_name", "serial_or_batch", "quantity", "unit_cost", "total_cost", "supplier", "purchase_date", "created_by", "notes", "created_at") VALUES ('pur-2', 'PO-2026-0912', 'base-alpha', 'ammunition', '5.56x45mm NATO Ball Rounds', 'AMMO-BATCH-882', 25000, 0.65, 16250, 'Lake City Army Ammunition Plant', '2026-09-12', 'user-logistics', 'Bulk replenishment order', '2026-10-09 07:02:42');
INSERT INTO "purchases" ("id", "purchase_order", "base_id", "category_id", "asset_name", "serial_or_batch", "quantity", "unit_cost", "total_cost", "supplier", "purchase_date", "created_by", "notes", "created_at") VALUES ('pur-3', 'PO-2026-0918', 'base-bravo', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 'VIN-OSHKOSH-9021-30', 8, 385000, 3080000, 'Oshkosh Defense', '2026-09-18', 'user-logistics', 'Patrol fleet modernization delivery', '2026-10-09 07:02:42');
INSERT INTO "purchases" ("id", "purchase_order", "base_id", "category_id", "asset_name", "serial_or_batch", "quantity", "unit_cost", "total_cost", "supplier", "purchase_date", "created_by", "notes", "created_at") VALUES ('pur-4', 'PO-2026-0925', 'base-alpha', 'comms', 'AN/PRC-152 Falcon III Radio', 'RAD-SN-7801-40', 20, 8500, 170000, 'L3Harris Technologies', '2026-09-25', 'user-admin', 'Secured frequency tactical package', '2026-10-09 07:02:42');
INSERT INTO "purchases" ("id", "purchase_order", "base_id", "category_id", "asset_name", "serial_or_batch", "quantity", "unit_cost", "total_cost", "supplier", "purchase_date", "created_by", "notes", "created_at") VALUES ('pur-5', 'PO-2026-1002', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 'LOT-COLT-2026B', 30, 1420, 42600, 'Colt Defense LLC', '2026-10-02', 'user-logistics', 'Immediate depot replenishment', '2026-10-09 07:02:42');
INSERT INTO "purchases" ("id", "purchase_order", "base_id", "category_id", "asset_name", "serial_or_batch", "quantity", "unit_cost", "total_cost", "supplier", "purchase_date", "created_by", "notes", "created_at") VALUES ('pur-6', 'PO-2026-1005', 'base-delta', 'ammunition', '120mm Tank Sabot Shells', 'LOT-GD-TANK-991', 150, 4200, 630000, 'General Dynamics Ordnance', '2026-10-05', 'user-admin', 'Live-fire exercise procurement package', '2026-10-09 07:02:42');
INSERT INTO "purchases" ("id", "purchase_order", "base_id", "category_id", "asset_name", "serial_or_batch", "quantity", "unit_cost", "total_cost", "supplier", "purchase_date", "created_by", "notes", "created_at") VALUES ('pur-1791530254283', 'PO-2026-6731', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 'BATCH-6731', 15, 1400, 21000, 'Colt Defense LLC', '2026-10-09', 'user-logistics', 'Test procurement batch', '2026-10-09 07:17:34');
INSERT INTO "purchases" ("id", "purchase_order", "base_id", "category_id", "asset_name", "serial_or_batch", "quantity", "unit_cost", "total_cost", "supplier", "purchase_date", "created_by", "notes", "created_at") VALUES ('pur-1791531053248', 'PO-2026-1054', 'base-alpha', 'weapons', 'M4A1 Carbine', 'BATCH-1054', 10, 1200, 12000, 'Ordnance Depot', '2026-10-09', 'user-logistics', 'Verification test batch', '2026-10-09 07:30:53');

-- -------------------------------------------------------------------------
-- Table structure for table: transfers
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "transfers";
CREATE TABLE transfers (
      id TEXT PRIMARY KEY,
      tracking_number TEXT UNIQUE NOT NULL,
      origin_base_id TEXT NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
      destination_base_id TEXT NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES equipment_categories(id),
      asset_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      status TEXT NOT NULL CHECK(status IN ('COMPLETED', 'IN_TRANSIT', 'CANCELLED')),
      transport_mode TEXT,
      transfer_date DATE NOT NULL,
      initiated_by TEXT NOT NULL REFERENCES users(id),
      received_by TEXT REFERENCES users(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CHECK(origin_base_id != destination_base_id)
    );

-- Dumping data for table: transfers (7 records)
INSERT INTO "transfers" ("id", "tracking_number", "origin_base_id", "destination_base_id", "category_id", "asset_name", "quantity", "status", "transport_mode", "transfer_date", "initiated_by", "received_by", "notes", "created_at") VALUES ('trf-1', 'TRF-2026-9041', 'base-alpha', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 25, 'COMPLETED', 'Armored Convoy Echo', '2026-09-10', 'user-logistics', NULL, 'Redeployment of sidearms to Eastern outpost', '2026-10-09 07:02:42');
INSERT INTO "transfers" ("id", "tracking_number", "origin_base_id", "destination_base_id", "category_id", "asset_name", "quantity", "status", "transport_mode", "transfer_date", "initiated_by", "received_by", "notes", "created_at") VALUES ('trf-2', 'TRF-2026-9042', 'base-alpha', 'base-bravo', 'ammunition', '5.56x45mm NATO Ball Rounds', 10000, 'COMPLETED', 'Armored Convoy Echo', '2026-09-10', 'user-logistics', NULL, 'Standard operational ammunition supply', '2026-10-09 07:02:42');
INSERT INTO "transfers" ("id", "tracking_number", "origin_base_id", "destination_base_id", "category_id", "asset_name", "quantity", "status", "transport_mode", "transfer_date", "initiated_by", "received_by", "notes", "created_at") VALUES ('trf-3', 'TRF-2026-9043', 'base-delta', 'base-alpha', 'vehicles', 'M1A2 Abrams Main Battle Tank', 2, 'COMPLETED', 'Heavy Heavy-Equipment Transporter (HET)', '2026-09-22', 'user-admin', NULL, 'Command security armored reinforcement', '2026-10-09 07:02:42');
INSERT INTO "transfers" ("id", "tracking_number", "origin_base_id", "destination_base_id", "category_id", "asset_name", "quantity", "status", "transport_mode", "transfer_date", "initiated_by", "received_by", "notes", "created_at") VALUES ('trf-4', 'TRF-2026-9044', 'base-alpha', 'base-charlie', 'comms', 'AN/PRC-152 Falcon III Radio', 10, 'COMPLETED', 'C-130 Tactical Airlift', '2026-09-28', 'user-logistics', NULL, 'Coastal communications upgrade kit', '2026-10-09 07:02:42');
INSERT INTO "transfers" ("id", "tracking_number", "origin_base_id", "destination_base_id", "category_id", "asset_name", "quantity", "status", "transport_mode", "transfer_date", "initiated_by", "received_by", "notes", "created_at") VALUES ('trf-5', 'TRF-2026-9045', 'base-bravo', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 10, 'COMPLETED', 'Courier Squad Falcon', '2026-10-04', 'user-cmd-bravo', NULL, 'Depot recalibration and armory maintenance rotation', '2026-10-09 07:02:42');
INSERT INTO "transfers" ("id", "tracking_number", "origin_base_id", "destination_base_id", "category_id", "asset_name", "quantity", "status", "transport_mode", "transfer_date", "initiated_by", "received_by", "notes", "created_at") VALUES ('trf-6', 'TRF-2026-9046', 'base-delta', 'base-bravo', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 4, 'IN_TRANSIT', 'Highway Convoy Shield', '2026-10-08', 'user-admin', NULL, 'In-transit reinforcement to Camp Valor', '2026-10-09 07:02:42');
INSERT INTO "transfers" ("id", "tracking_number", "origin_base_id", "destination_base_id", "category_id", "asset_name", "quantity", "status", "transport_mode", "transfer_date", "initiated_by", "received_by", "notes", "created_at") VALUES ('trf-1791530254312', 'TRF-2026-5223', 'base-alpha', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 5, 'COMPLETED', 'Armored Convoy', '2026-10-09', 'user-cmd-alpha', NULL, 'Test transfer between bases', '2026-10-09 07:17:34');

-- -------------------------------------------------------------------------
-- Table structure for table: users
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS "users";
CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'commander', 'logistics')),
      base_id TEXT REFERENCES bases(id) ON DELETE SET NULL,
      rank TEXT NOT NULL,
      service_number TEXT NOT NULL,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Dumping data for table: users (4 records)
INSERT INTO "users" ("id", "username", "name", "email", "role", "base_id", "rank", "service_number", "avatar", "created_at") VALUES ('user-admin', 'general.vance', 'Gen. Arthur Vance', 'a.vance@military.gov', 'admin', NULL, 'General (4-Star)', 'SN-USA-00109', NULL, '2026-10-09 07:02:41');
INSERT INTO "users" ("id", "username", "name", "email", "role", "base_id", "rank", "service_number", "avatar", "created_at") VALUES ('user-cmd-alpha', 'col.miller', 'Col. Sarah Miller', 's.miller@sentinel.mil', 'commander', 'base-alpha', 'Colonel (O-6)', 'SN-USA-04281', NULL, '2026-10-09 07:02:41');
INSERT INTO "users" ("id", "username", "name", "email", "role", "base_id", "rank", "service_number", "avatar", "created_at") VALUES ('user-cmd-bravo', 'maj.hayes', 'Maj. John Hayes', 'j.hayes@valor.mil', 'commander', 'base-bravo', 'Major (O-4)', 'SN-USA-07892', NULL, '2026-10-09 07:02:41');
INSERT INTO "users" ("id", "username", "name", "email", "role", "base_id", "rank", "service_number", "avatar", "created_at") VALUES ('user-logistics', 'lt.carter', 'Lt. Alex Carter', 'a.carter@logistics.mil', 'logistics', 'base-alpha', 'First Lieutenant (O-2)', 'SN-USA-11409', NULL, '2026-10-09 07:02:41');

