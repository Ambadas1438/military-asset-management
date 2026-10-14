import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve(process.cwd(), 'backend', 'military_assets.sqlite');
const db = new DatabaseSync(dbPath);

console.log('[DUMP] Exporting database dump from:', dbPath);

let sqlDump = `-- =========================================================================\n`;
sqlDump += `-- MILITARY ASSET MANAGEMENT SYSTEM - RELATIONAL DATABASE DUMP\n`;
sqlDump += `-- Dialect: SQLite / ANSI SQL-92 Standard\n`;
sqlDump += `-- Export Date: ${new Date().toISOString()}\n`;
sqlDump += `-- Schema: Relational Ledger with Foreign Keys and Audit Trail\n`;
sqlDump += `-- =========================================================================\n\n`;

sqlDump += `PRAGMA foreign_keys = ON;\n\n`;

// Fetch all table creation DDLs
const tables = db.prepare(`
  SELECT name, sql FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
  ORDER BY name ASC
`).all();

for (const table of tables) {
  sqlDump += `-- -------------------------------------------------------------------------\n`;
  sqlDump += `-- Table structure for table: ${table.name}\n`;
  sqlDump += `-- -------------------------------------------------------------------------\n`;
  sqlDump += `DROP TABLE IF EXISTS "${table.name}";\n`;
  sqlDump += `${table.sql};\n\n`;

  // Fetch all rows
  const rows = db.prepare(`SELECT * FROM "${table.name}"`).all();
  if (rows.length > 0) {
    sqlDump += `-- Dumping data for table: ${table.name} (${rows.length} records)\n`;
    const columns = Object.keys(rows[0]);
    
    for (const row of rows) {
      const values = columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val;
        const escaped = String(val).replace(/'/g, "''");
        return `'${escaped}'`;
      });
      sqlDump += `INSERT INTO "${table.name}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
    }
    sqlDump += `\n`;
  }
}

// Write to root and backend
const rootDumpPath = path.resolve(process.cwd(), 'database_dump.sql');
const backendDumpPath = path.resolve(process.cwd(), 'backend', 'database_dump.sql');

fs.writeFileSync(rootDumpPath, sqlDump, 'utf8');
fs.writeFileSync(backendDumpPath, sqlDump, 'utf8');

console.log(`[DUMP] Database dump successfully written to:`);
console.log(`  -> ${rootDumpPath}`);
console.log(`  -> ${backendDumpPath}`);
