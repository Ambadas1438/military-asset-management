import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'military_assets.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode for high concurrency & integrity
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

export function initDatabase() {
  console.log('[DB] Initializing military asset database at:', DB_PATH);

  // 1. Bases Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bases (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      commander_name TEXT NOT NULL,
      security_level TEXT DEFAULT 'DEFCON-4',
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Equipment Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS equipment_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      unit_of_measure TEXT NOT NULL,
      icon TEXT DEFAULT 'Shield',
      description TEXT
    );
  `);

  // 3. Users Table (Role-Based Access Control)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
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
  `);

  // 4. Inventory Items (Current & Baseline On-Hand Tracking per Base)
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_items (
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
  `);

  // 5. Purchases Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
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
  `);

  // 6. Transfers Table (Inter-Base Asset Movements)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transfers (
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
  `);

  // 7. Personnel Assignments
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
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
  `);

  // 8. Asset Expenditures (Consumed, Live-Fire Drills, Damaged)
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenditures (
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
  `);

  // 9. Immutable Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
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
  `);

  seedInitialData();
}

function seedInitialData() {
  const baseCount = db.prepare('SELECT COUNT(*) as count FROM bases').get() as { count: number };
  if (baseCount.count > 0) {
    console.log('[DB] Database already seeded.');
    return;
  }

  console.log('[DB] Seeding military bases, categories, users, assets, and operational logs...');

  // Seed Bases
  const insertBase = db.prepare(`
    INSERT INTO bases (id, code, name, location, commander_name, security_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertBase.run('base-alpha', 'AFB-NORTH', 'Fort Sentinel (Command HQ)', 'Sector 4 - Northern Frontier', 'Col. Sarah Miller', 'DEFCON-3');
  insertBase.run('base-bravo', 'CAMP-VALOR', 'Camp Valor Logistics Outpost', 'Sector 9 - Eastern Plateau', 'Maj. John Hayes', 'DEFCON-4');
  insertBase.run('base-charlie', 'NAVAL-POINT', 'Naval Point Maritime Redoubt', 'Sector 2 - Coastal Basin', 'Cmdr. Elena Rostova', 'DEFCON-3');
  insertBase.run('base-delta', 'FORT-IRONCLAD', 'Fort Ironclad Armored Depot', 'Sector 7 - Central Desert', 'Col. Marcus Vance', 'DEFCON-2');

  // Seed Equipment Categories
  const insertCategory = db.prepare(`
    INSERT INTO equipment_categories (id, name, code, unit_of_measure, icon, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertCategory.run('weapons', 'Small Arms & Heavy Weapons', 'WEP', 'Units', 'Crosshair', 'Standard rifles, sidearms, heavy machine guns, launchers');
  insertCategory.run('vehicles', 'Armored & Combat Vehicles', 'VEH', 'Units', 'Truck', 'Tanks, APCs, MRAPs, tactical utility vehicles');
  insertCategory.run('ammunition', 'Ammunition & Ordnance', 'AMMO', 'Rounds', 'Target', 'Small caliber, artillery shells, mortar rounds, missiles');
  insertCategory.run('comms', 'Tactical Communications', 'COM', 'Units', 'Radio', 'Encrypted radios, satellite uplinks, electronic countermeasures');
  insertCategory.run('optics', 'Optics & Night Vision', 'OPT', 'Units', 'Eye', 'Thermal sights, NVGs, laser target designators');

  // Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, name, email, role, base_id, rank, service_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  // Admin: General Vance - Full access to all data & operations
  insertUser.run('user-admin', 'general.vance', 'Gen. Arthur Vance', 'a.vance@military.gov', 'admin', null, 'General (4-Star)', 'SN-USA-00109');
  // Base Commander: Col. Sarah Miller - Scoped to Fort Sentinel (base-alpha)
  insertUser.run('user-cmd-alpha', 'col.miller', 'Col. Sarah Miller', 's.miller@sentinel.mil', 'commander', 'base-alpha', 'Colonel (O-6)', 'SN-USA-04281');
  // Base Commander: Maj. John Hayes - Scoped to Camp Valor (base-bravo)
  insertUser.run('user-cmd-bravo', 'maj.hayes', 'Maj. John Hayes', 'j.hayes@valor.mil', 'commander', 'base-bravo', 'Major (O-4)', 'SN-USA-07892');
  // Logistics Officer: Lt. Alex Carter - Focused on Purchases & Transfers
  insertUser.run('user-logistics', 'lt.carter', 'Lt. Alex Carter', 'a.carter@logistics.mil', 'logistics', 'base-alpha', 'First Lieutenant (O-2)', 'SN-USA-11409');

  // Seed Inventory Items Baseline (Opening Balances at inception, e.g. 2026-09-01)
  const insertInventory = db.prepare(`
    INSERT INTO inventory_items (id, base_id, category_id, asset_name, model_number, initial_balance, current_quantity, minimum_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Alpha Base (Fort Sentinel)
  insertInventory.run('inv-1', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 'Colt M4A1', 450, 420, 50);
  insertInventory.run('inv-2', 'base-alpha', 'weapons', 'M240B Machine Gun', 'FN M240B', 80, 75, 10);
  insertInventory.run('inv-3', 'base-alpha', 'vehicles', 'M1A2 Abrams Main Battle Tank', 'General Dynamics SEPv3', 24, 22, 5);
  insertInventory.run('inv-4', 'base-alpha', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 'Oshkosh L-ATV', 60, 55, 8);
  insertInventory.run('inv-5', 'base-alpha', 'ammunition', '5.56x45mm NATO Ball Rounds', 'M855A1 EPR', 150000, 138000, 20000);
  insertInventory.run('inv-6', 'base-alpha', 'ammunition', '120mm Tank Sabot Shells', 'M829A4 APFSDS', 1200, 1150, 150);
  insertInventory.run('inv-7', 'base-alpha', 'comms', 'AN/PRC-152 Falcon III Radio', 'L3Harris AN/PRC-152A', 110, 105, 15);

  // Bravo Base (Camp Valor)
  insertInventory.run('inv-8', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 'Colt M4A1', 300, 290, 40);
  insertInventory.run('inv-9', 'base-bravo', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 'Oshkosh L-ATV', 40, 38, 5);
  insertInventory.run('inv-10', 'base-bravo', 'ammunition', '5.56x45mm NATO Ball Rounds', 'M855A1 EPR', 90000, 85000, 15000);
  insertInventory.run('inv-11', 'base-bravo', 'comms', 'AN/PRC-152 Falcon III Radio', 'L3Harris AN/PRC-152A', 65, 60, 10);

  // Charlie Base (Naval Point)
  insertInventory.run('inv-12', 'base-charlie', 'weapons', 'M4A1 SOPMOD Carbine', 'Colt M4A1', 220, 215, 30);
  insertInventory.run('inv-13', 'base-charlie', 'ammunition', '5.56x45mm NATO Ball Rounds', 'M855A1 EPR', 60000, 58000, 10000);
  insertInventory.run('inv-14', 'base-charlie', 'optics', 'AN/PVS-31A Night Vision Goggles', 'L3Harris BNVD', 90, 85, 12);

  // Delta Base (Fort Ironclad)
  insertInventory.run('inv-15', 'base-delta', 'vehicles', 'M1A2 Abrams Main Battle Tank', 'General Dynamics SEPv3', 45, 42, 10);
  insertInventory.run('inv-16', 'base-delta', 'weapons', 'Javelin Anti-Tank Missile Launcher', 'Raytheon / Lockheed FGM-148', 35, 33, 5);
  insertInventory.run('inv-17', 'base-delta', 'ammunition', '120mm Tank Sabot Shells', 'M829A4 APFSDS', 2500, 2400, 300);

  // Seed Historical Purchases
  const insertPurchase = db.prepare(`
    INSERT INTO purchases (id, purchase_order, base_id, category_id, asset_name, serial_or_batch, quantity, unit_cost, total_cost, supplier, purchase_date, created_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPurchase.run('pur-1', 'PO-2026-0905', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 'LOT-COLT-2026A', 50, 1420.00, 71000.00, 'Colt Defense LLC', '2026-09-05', 'user-logistics', 'Quarterly reinforcement batch for Recon squads');
  insertPurchase.run('pur-2', 'PO-2026-0912', 'base-alpha', 'ammunition', '5.56x45mm NATO Ball Rounds', 'AMMO-BATCH-882', 25000, 0.65, 16250.00, 'Lake City Army Ammunition Plant', '2026-09-12', 'user-logistics', 'Bulk replenishment order');
  insertPurchase.run('pur-3', 'PO-2026-0918', 'base-bravo', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 'VIN-OSHKOSH-9021-30', 8, 385000.00, 3080000.00, 'Oshkosh Defense', '2026-09-18', 'user-logistics', 'Patrol fleet modernization delivery');
  insertPurchase.run('pur-4', 'PO-2026-0925', 'base-alpha', 'comms', 'AN/PRC-152 Falcon III Radio', 'RAD-SN-7801-40', 20, 8500.00, 170000.00, 'L3Harris Technologies', '2026-09-25', 'user-admin', 'Secured frequency tactical package');
  insertPurchase.run('pur-5', 'PO-2026-1002', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 'LOT-COLT-2026B', 30, 1420.00, 42600.00, 'Colt Defense LLC', '2026-10-02', 'user-logistics', 'Immediate depot replenishment');
  insertPurchase.run('pur-6', 'PO-2026-1005', 'base-delta', 'ammunition', '120mm Tank Sabot Shells', 'LOT-GD-TANK-991', 150, 4200.00, 630000.00, 'General Dynamics Ordnance', '2026-10-05', 'user-admin', 'Live-fire exercise procurement package');

  // Seed Historical Transfers
  const insertTransfer = db.prepare(`
    INSERT INTO transfers (id, tracking_number, origin_base_id, destination_base_id, category_id, asset_name, quantity, status, transport_mode, transfer_date, initiated_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTransfer.run('trf-1', 'TRF-2026-9041', 'base-alpha', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 25, 'COMPLETED', 'Armored Convoy Echo', '2026-09-10', 'user-logistics', 'Redeployment of sidearms to Eastern outpost');
  insertTransfer.run('trf-2', 'TRF-2026-9042', 'base-alpha', 'base-bravo', 'ammunition', '5.56x45mm NATO Ball Rounds', 10000, 'COMPLETED', 'Armored Convoy Echo', '2026-09-10', 'user-logistics', 'Standard operational ammunition supply');
  insertTransfer.run('trf-3', 'TRF-2026-9043', 'base-delta', 'base-alpha', 'vehicles', 'M1A2 Abrams Main Battle Tank', 2, 'COMPLETED', 'Heavy Heavy-Equipment Transporter (HET)', '2026-09-22', 'user-admin', 'Command security armored reinforcement');
  insertTransfer.run('trf-4', 'TRF-2026-9044', 'base-alpha', 'base-charlie', 'comms', 'AN/PRC-152 Falcon III Radio', 10, 'COMPLETED', 'C-130 Tactical Airlift', '2026-09-28', 'user-logistics', 'Coastal communications upgrade kit');
  insertTransfer.run('trf-5', 'TRF-2026-9045', 'base-bravo', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 10, 'COMPLETED', 'Courier Squad Falcon', '2026-10-04', 'user-cmd-bravo', 'Depot recalibration and armory maintenance rotation');
  insertTransfer.run('trf-6', 'TRF-2026-9046', 'base-delta', 'base-bravo', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 4, 'IN_TRANSIT', 'Highway Convoy Shield', '2026-10-08', 'user-admin', 'In-transit reinforcement to Camp Valor');

  // Seed Personnel Assignments
  const insertAssignment = db.prepare(`
    INSERT INTO assignments (id, assignment_code, base_id, category_id, asset_name, personnel_name, military_id, rank, unit, quantity, issue_date, return_due_date, return_date, status, issued_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAssignment.run('asn-1', 'ASN-2026-101', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 'Staff Sgt. Marcus Brody', 'MIL-40912', 'SSG (E-6)', '1st Recon Platoon', 1, '2026-09-08', '2026-10-08', null, 'ACTIVE', 'user-cmd-alpha', 'Issued for Northern Perimeter Guard Duty');
  insertAssignment.run('asn-2', 'ASN-2026-102', 'base-alpha', 'comms', 'AN/PRC-152 Falcon III Radio', 'Sgt. Lisa Chen', 'MIL-51820', 'SGT (E-5)', 'Signals Intelligence Unit', 1, '2026-09-12', '2026-10-15', null, 'ACTIVE', 'user-cmd-alpha', 'Secured patrol comms package');
  insertAssignment.run('asn-3', 'ASN-2026-103', 'base-alpha', 'vehicles', 'JLTV Joint Light Tactical Vehicle', 'Capt. Derrick Young', 'MIL-22910', 'CPT (O-3)', 'Bravo Quick Reaction Force', 2, '2026-09-15', '2026-10-20', null, 'ACTIVE', 'user-cmd-alpha', 'Assigned for rapid response border escorts');
  insertAssignment.run('asn-4', 'ASN-2026-104', 'base-bravo', 'weapons', 'M4A1 SOPMOD Carbine', 'Cpl. David Ortiz', 'MIL-63019', 'CPL (E-4)', 'Eastern Scout Unit', 1, '2026-09-16', '2026-09-30', '2026-09-30', 'RETURNED', 'user-cmd-bravo', 'Returned in good condition after mission completed');
  insertAssignment.run('asn-5', 'ASN-2026-105', 'base-bravo', 'vehicles', 'JLTV Joint Light Tactical Vehicle', '1st Lt. Michael Torres', 'MIL-33821', '1LT (O-2)', 'Logistics Escort Detachment', 1, '2026-10-01', '2026-10-31', null, 'ACTIVE', 'user-cmd-bravo', 'Convoy escort vehicle assignment');

  // Seed Expenditures (Spent, Live-Fire Drills, etc.)
  const insertExpenditure = db.prepare(`
    INSERT INTO expenditures (id, expenditure_code, base_id, category_id, asset_name, quantity, expenditure_type, expenditure_date, mission_ref, authorized_by, after_action_report)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertExpenditure.run('exp-1', 'EXP-2026-01', 'base-alpha', 'ammunition', '5.56x45mm NATO Ball Rounds', 7000, 'LIVE_FIRE_EXERCISE', '2026-09-14', 'OPERATION-IRON-SENTINEL', 'user-cmd-alpha', 'Expended during battalion qualification and night-vision target drills');
  insertExpenditure.run('exp-2', 'EXP-2026-02', 'base-alpha', 'ammunition', '120mm Tank Sabot Shells', 50, 'LIVE_FIRE_EXERCISE', '2026-09-20', 'DRILL-TITAN-RANGE', 'user-cmd-alpha', 'Abrams crew gunnery qualification at northern firing grounds');
  insertExpenditure.run('exp-3', 'EXP-2026-03', 'base-bravo', 'ammunition', '5.56x45mm NATO Ball Rounds', 5000, 'LIVE_FIRE_EXERCISE', '2026-09-25', 'DRILL-VALOR-SHIELD', 'user-cmd-bravo', 'Annual base security marksmanship recertification');
  insertExpenditure.run('exp-4', 'EXP-2026-04', 'base-alpha', 'weapons', 'M4A1 SOPMOD Carbine', 1, 'DECOMMISSIONED_WRITEOFF', '2026-10-01', 'MAINT-SURVEY-2026-88', 'user-admin', 'Receiver cracked beyond field repair; condemned and logged for smelting write-off');

  // Seed Initial Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, timestamp, user_id, user_name, user_role, base_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('aud-1', '2026-09-01 08:00:00', 'user-admin', 'Gen. Arthur Vance', 'admin', null, 'SYSTEM_INITIALIZATION', 'SYSTEM', 'SYS-ROOT', JSON.stringify({ message: 'Military Asset Ledger initialized with 4 bases and baseline inventory.' }));
  insertAudit.run('aud-2', '2026-09-05 10:14:00', 'user-logistics', 'Lt. Alex Carter', 'logistics', 'base-alpha', 'RECORD_PURCHASE', 'PURCHASE', 'PO-2026-0905', JSON.stringify({ asset: 'M4A1 SOPMOD Carbine', qty: 50, base: 'Fort Sentinel', cost: 71000 }));
  insertAudit.run('aud-3', '2026-09-10 14:32:00', 'user-logistics', 'Lt. Alex Carter', 'logistics', 'base-alpha', 'INITIATE_TRANSFER', 'TRANSFER', 'TRF-2026-9041', JSON.stringify({ asset: 'M4A1 SOPMOD Carbine', qty: 25, from: 'base-alpha', to: 'base-bravo' }));
  insertAudit.run('aud-4', '2026-09-14 17:00:00', 'user-cmd-alpha', 'Col. Sarah Miller', 'commander', 'base-alpha', 'RECORD_EXPENDITURE', 'EXPENDITURE', 'EXP-2026-01', JSON.stringify({ asset: '5.56x45mm NATO Ball Rounds', qty: 7000, type: 'LIVE_FIRE_EXERCISE', mission: 'OPERATION-IRON-SENTINEL' }));
  insertAudit.run('aud-5', '2026-10-04 11:20:00', 'user-cmd-bravo', 'Maj. John Hayes', 'commander', 'base-bravo', 'INITIATE_TRANSFER', 'TRANSFER', 'TRF-2026-9045', JSON.stringify({ asset: 'M4A1 SOPMOD Carbine', qty: 10, from: 'base-bravo', to: 'base-alpha' }));

  console.log('[DB] Database seeded successfully with baseline and transactional history.');
}
