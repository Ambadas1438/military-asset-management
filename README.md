# Military Asset Management System

A full-stack web application designed for military commanders and logistics personnel to track, transfer, assign, and account for critical defense assets (weapons, combat vehicles, munitions, tactical communications, and night-vision gear) across multiple bases.

Built as an interview assignment submission adhering to all specified functional and non-functional requirements.

---

## 🎯 Architecture Overview & Tech Stack

### 1. Database Justification: Why Relational SQL over NoSQL?
For a military asset tracking system, **a Relational Database (SQL)** was chosen over NoSQL for fundamental architectural and operational reasons:

- **ACID Transaction Atomicity for Transfers**:
  When transferring assets between bases (e.g., dispatching 25 rifles from Base Alpha to Base Bravo), the operation must be atomic. The origin base's armory inventory must be decremented and the destination base's inventory must be incremented in a single database transaction (`BEGIN TRANSACTION` ... `COMMIT`). If either step fails, the entire transaction rolls back (`ROLLBACK`). A NoSQL database with eventual consistency introduces unacceptable risks of temporary stock duplication or disappearing assets during concurrent writes.
- **Relational Integrity via Foreign Keys**:
  Strict relational constraints enforce that an asset cannot exist without a valid equipment category, a purchase cannot be booked without an existing base, and an assignment cannot be recorded without a valid authorizing officer.
- **Deterministic Inventory Balance Invariants**:
  The system calculates Opening Balance, Net Movement, and Closing Balance using SQL aggregations. Because SQL ensures strong consistency, balances calculated across any arbitrary date range are 100% deterministic and free from drift:
  $$\text{Closing Balance} = \text{Opening Balance} + \text{Purchases} + \text{Transfers In} - \text{Transfers Out} - \text{Expended}$$

### 2. Backend Tech Stack
- **Runtime**: Node.js v25 + TypeScript
- **Web Framework**: Express.js
- **Database Engine**: Embedded SQLite (with Write-Ahead Logging `WAL` mode and Foreign Key enforcement `PRAGMA foreign_keys = ON`)
- **Security & RBAC**: Custom middleware enforcing role capabilities (`admin`, `commander`, `logistics`) and base-level data isolation.
- **Audit Logging**: Interceptor middleware logging all mutating transactions (`POST`, `PUT`, `DELETE`, `PATCH`) to an immutable `audit_logs` table.

### 3. Frontend Tech Stack
- **Library**: React 18 with Vite
- **Styling**: Tailwind CSS (clean, high-contrast dark palette tailored for operational dashboards)
- **Icons**: Lucide React
- **State & Data**: Native React hooks (`useState`, `useEffect`) with modular API client.

---

## 📐 Mathematical Model & Formulas

The core accounting ledger is governed by two fundamental equations:

1. **Net Movement Equation**:
   $$\text{Net Movement} = \text{Purchases} + \text{Transfers In} - \text{Transfers Out}$$
   *(Note: When viewing all bases globally, inter-base transfers cancel out in net aggregate, so Net Movement equals total purchases across the command).*

2. **Closing Balance Conservation**:
   $$\text{Closing Balance} = \text{Opening Balance} + \text{Net Movement} - \text{Expended Assets}$$

3. **Field Assigned Assets**:
   Assets issued to soldiers are tracked under `Assigned` until returned to the armory.

---

## 🚀 Key Features Implemented

### 1. Command Dashboard & [Bonus] Net Movement Pop-up
- **Metric Cards**: Real-time display of Opening Balance, Net Movement, Total Purchases, Transfers In/Out, Assigned Assets, Expended Assets, and Closing Balance.
- **Bonus Feature (Net Movement Pop-up)**: Clicking on the **"Net Movement"** metric card opens an interactive modal with tabbed breakdowns:
  - **Purchases Tab**: PO number, supplier, unit cost, total contract cost, and date.
  - **Transfers In Tab**: Origin base, destination base, manifest tracking number, and asset quantity.
  - **Transfers Out Tab**: Outbound manifests, destination base, and quantities.
- **Filters**:
  - **Date Filter**: Quick presets (All Time, 7 Days, 30 Days, Month) plus custom date range inputs.
  - **Base Filter**: Consolidated view of all bases or filtered to a specific base (automatically restricted when logged in as a Base Commander).
  - **Equipment Type Filter**: Small Arms, Armored Vehicles, Ammunition, Tactical Comms, Optics.
- **Asset Ledger Table**: Line-by-line reconciliation table showing Opening, Purchases, In/Out moves, Expended, Assigned, Closing, and low-stock threshold alerts.

### 2. Purchases Page
- **Record Purchase Modal**: Input base, equipment category, asset name, quantity, unit price (with auto total cost calculation), supplier, and purchase order number.
- **Historical Procurement Table**: Searchable and filterable ledger with one-click **CSV Export** for logistics reporting.

### 3. Transfers Page
- **Initiate Transfer Modal**: Inter-base transfer form with **real-time origin inventory stock validation** (prevents dispatching more assets than currently available in armory).
- **Movement Tracking**: Dispatches transfers as either `COMPLETED` (immediate arrival) or `IN_TRANSIT`.
- **Arrival Confirmation**: One-click **"Confirm Arrival"** action for destination commanders to mark in-transit transfers as received, automatically incrementing destination inventory.

### 4. Assignments & Expenditures Page
- **Tab 1: Personnel Assignments**:
  - Issue weapons and gear to individual soldiers (capturing Military ID, Rank, Name, Unit, and Return Due Date).
  - **Return Asset** action: Restocks items back into active armory inventory when personnel return from duty.
- **Tab 2: Asset Expenditures**:
  - Record consumed ammunition or written-off items (Live-Fire Training Drills, Combat Operations, Maintenance Scrapped, Decommissioned).
  - Deducts quantity directly from active base balance and counts toward the period's `Expended` balance.

### 5. Role-Based Access Control (RBAC)
Enforced in backend middleware (`backend/src/middleware/auth.ts`) and reflected across the UI:

| Role | Demo Persona | Permissions & Scope |
|---|---|---|
| **Admin** | **Gen. Arthur Vance** | Full, unrestricted access to all data and operations across all bases. Can view complete audit logs. |
| **Base Commander** | **Col. Sarah Miller** *(Fort Sentinel)*<br>**Maj. John Hayes** *(Camp Valor)* | Scoped strictly to their assigned installation. Can view inventory, assign gear, record expenditures, and authorize transfers involving their base. Access to other bases' data is forbidden (`403`). |
| **Logistics Officer** | **Lt. Alex Carter** | Limited operational scope: Can view/record purchases and initiate transfers. Restricted from personnel weapon assignments and sensitive combat expenditures. |

> **Interactive Persona Switcher**: Use the user menu in the top-right corner of the app to switch roles in one click and test RBAC boundaries live.

### 6. API Transaction Logging & Audit Trail
- Every mutating HTTP request (`POST`, `PUT`, `DELETE`, `PATCH`) is intercepted and logged into an immutable database table.
- The **Audit Trail** page provides a searchable timeline showing Timestamp, Officer, Role, Action type, Target Entity ID, and JSON transaction parameters.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)

### Option A: Using the Convenience Scripts (From Project Root)
```bash
# 1. Start Backend API (Port 5000)
npm run dev:backend

# 2. In a separate terminal, start Frontend (Port 5173)
npm run dev:frontend

# 3. (Optional) Run the automated API verification test suite
npm run test:api
```

### Option B: Manual Setup
```bash
# Backend Setup
cd backend
npm install
npm run dev

# Frontend Setup
cd frontend
npm install
npm run dev
```

Visit the application in your browser:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Verification

An automated integration test script is included at [`backend/test-api.js`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/military-asset-management/backend/test-api.js).
Run it with:
```bash
node backend/test-api.js
# or
npm run test:api
```
**Test Coverage Output:**
- Verifies system health and user authentication.
- Verifies balance invariant formula: $\text{Opening} + \text{Net} - \text{Expended} = \text{Closing}$.
- Tests RBAC authorization: Logistics Officer recording purchase (Allowed).
- Tests RBAC security guard: Logistics Officer attempting restricted soldier assignment (Correctly rejected with `403 Forbidden`).
- Verifies immutable audit trail logs recent events.

---

## 📁 Project Structure

```
military-asset-management/
├── package.json              # Root scripts for starting frontend and backend
├── README.md                 # Complete system documentation
├── .gitignore                # Ignores node_modules, build artifacts, sqlite files
│
├── backend/
│   ├── package.json          # Express, TypeScript, SQLite dependencies
│   ├── tsconfig.json
│   ├── test-api.js           # Automated integration test runner
│   ├── .env.example
│   └── src/
│       ├── server.ts         # Express server entry point & route registration
│       ├── db/
│       │   └── database.ts   # Relational schema, SQLite connection, seed data
│       ├── middleware/
│       │   ├── auth.ts       # RBAC & base jurisdiction isolation middleware
│       │   └── logger.ts     # API transaction and audit logging middleware
│       └── routes/
│           ├── auth.ts       # Persona & user profile endpoints
│           ├── dashboard.ts  # Invariant metric calculations & detailed breakdowns
│           ├── purchases.ts  # Procurement operations & history queries
│           ├── transfers.ts  # Inter-base transfers & arrival confirmations
│           ├── assignments.ts# Personnel issues, returns, and expenditures
│           ├── bases.ts      # Base taxonomy & inventory stock lookups
│           └── audit.ts      # Immutable audit trail queries
│
└── frontend/
    ├── package.json          # React 18, Vite, Tailwind CSS, Lucide React
    ├── vite.config.ts        # Vite config with /api reverse proxying to port 5000
    ├── tailwind.config.js    # Tactical dark color theme
    ├── index.html
    └── src/
        ├── main.tsx          # React application root
        ├── App.tsx           # App shell with tab navigation and persona switcher
        ├── index.css         # Tailwind styles and custom scrollbars
        ├── types/
        │   └── index.ts      # TypeScript interfaces matching backend models
        ├── services/
        │   └── api.ts        # HTTP client forwarding user identity headers
        ├── components/
        │   ├── Navbar.tsx            # Top bar with persona switcher & live status
        │   ├── StatCard.tsx          # Metric KPI card component
        │   ├── NetMovementModal.tsx  # BONUS POPUP: Purchases & Transfer In/Out details
        │   ├── RecordPurchaseModal.tsx
        │   ├── InitiateTransferModal.tsx
        │   ├── AssignAssetModal.tsx
        │   └── RecordExpenditureModal.tsx
        └── pages/
            ├── DashboardPage.tsx     # Main dashboard with filters and asset ledger
            ├── PurchasesPage.tsx     # Purchases history & CSV export
            ├── TransfersPage.tsx     # Inter-base movement manifests
            ├── AssignmentsPage.tsx   # Personnel issues & munitions expenditures
            └── AuditLogsPage.tsx     # Immutable transaction audit trail
```

---

## 🔍 Assumptions & Edge Cases Handled

1. **Origin Stock Availability**:
   - The transfer form prevents dispatching more units than currently available on-hand at the origin base.
   - Same-base transfers are rejected (`originBaseId !== destinationBaseId`).
2. **Personnel Return Reconciliation**:
   - Returning an asset increments available inventory back into the issuing base's active stock.
3. **Role Scoping**:
   - Base Commanders are locked to their own base; dropdown selectors disable selection of foreign installations.
   - Logistics Officers cannot access soldier assignment forms or weapon decommissioning logs.
4. **Conservation of Balances**:
   - Net Movement strictly adds Purchases and Inbound Transfers, and subtracts Outbound Transfers.
   - In global consolidation (All Bases), internal transfers cancel out symmetrically, preserving exact asset conservation.

---

## 🔮 Future Enhancements (With More Time)

If expanded into full production:
- **WebSocket Streaming**: Real-time push updates for convoy movement and live armory changes without polling.
- **Barcode / QR Scanning**: Hardware scanner integration for rapid armory check-in and check-out.
- **Docker Compose**: Containerized multi-service setup (`docker-compose up`) with PostgreSQL for enterprise multi-node clustering.
- **PDF Export**: Generate digitally-signed military shipping manifests (Form DD-1149 style) for inter-base convoys.
