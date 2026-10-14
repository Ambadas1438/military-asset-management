# ARES Defense Ledger — Military Asset Management System

A full-stack enterprise web application designed for military commanders and logistics personnel to track, transfer, assign, and account for critical defense assets (weapons, combat vehicles, munitions, tactical communications, and night-vision gear) across multiple military bases.

---

## 🎯 Architecture Overview & Tech Stack

### 1. Database: Relational MySQL (Enterprise ACID Compliance)
- **Engine**: MySQL 8.0 on `localhost:3306`
- **Database**: `military_assets`
- **Root Password**: `Ambu@2004` (also supports `Ambu2004`)
- **Strict ACID Transactions**: Guarantees zero stock discrepancies during inter-base transfers, purchases, and personnel assignments.

### 2. Backend: Java 17 + Spring Boot 3
- **Framework**: Spring Boot 3 with Spring Data JPA & Hibernate
- **REST APIs**: Full role-scoped endpoints for Authentication, Dashboard Metrics, Bases, Inventory, Purchases, Transfers, Assignments, Expenditures, and Audit Logs.
- **Security & RBAC**: Role-Based Access Control (`admin`, `commander`, `logistics`) with custom password authentication and demo fast-login persona switcher.
- **Single-Page Application Fallback**: Embedded `SpaController` forwards non-API routes directly to the React frontend.

### 3. Frontend: React 18 + Vite (Pure JavaScript / Web Technologies)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Tactical high-contrast defense palette)
- **Icons**: Lucide React
- **Features**:
  - **Officer Sign In & Registration**: Dual tab authentication supporting custom passwords and 1-click evaluation accounts.
  - **Live Command Dashboard**: Real-time KPI statistics, Asset Ledger with stock threshold warnings, and interactive **Net Movement Breakdown Modal**.
  - **Procurement & Purchases Ledger**: Multi-field procurement recording with instant CSV export.
  - **Tactical Inter-Base Transfers**: Real-time stock validation, transit status tracking, and 1-click arrival confirmation.
  - **Personnel Custody & Munitions Expenditures**: Weapon assignment to soldiers with return tracking and combat/training expenditure logs.
  - **Immutable Audit Trail**: Chronological event ledger recording user actions and parameter changes.

---

## 🚀 Quick Start (1-Click Run)

### Option 1: Double-Click `run.bat` (Recommended)
Simply double click [`run.bat`](file:///c:/Users/ADMIN/OneDrive/Desktop/military-asset-management/run.bat) in the project folder or on your Desktop!

It automatically:
1. Builds the Vite React frontend.
2. Synchronizes static build assets into Spring Boot.
3. Launches the Spring Boot backend on port 5000 connected to MySQL.
4. Opens your default web browser to [http://localhost:5000](http://localhost:5000).

### Option 2: PowerShell Launcher
```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

### Option 3: Separate Frontend & Backend Development
```bash
# Terminal 1 - Java Spring Boot Backend (Port 5000)
cd java-backend
mvn spring-boot:run

# Terminal 2 - Vite React Frontend (Port 5173 with proxy)
cd frontend
npm run dev
```

---

## 🔐 Credentials & Authentication

### Demo Personas:
| Role | Name | Email / Username | Default Password | Base Access |
|---|---|---|---|---|
| **Admin** | Gen. Arthur Vance | `a.vance@military.gov` / `general.vance` | `password123` | Global (All 4 Bases) |
| **Base Commander** | Col. Sarah Miller | `s.miller@sentinel.mil` / `col.miller` | `password123` | Fort Sentinel (Alpha) |
| **Base Commander** | Maj. John Hayes | `j.hayes@valor.mil` / `maj.hayes` | `password123` | Camp Valor (Bravo) |
| **Logistics Officer** | Lt. Alex Carter | `a.carter@logistics.mil` / `lt.carter` | `password123` | Logistics Bureau |

### New User Registration:
- Switch to the **Sign Up / Register Personnel** tab on the login screen.
- Provide Full Name, Username, Email, Password (e.g. `Ambu@2004`), Role, Base, and Rank.
- Accounts are saved directly to MySQL and automatically logged in!

---

## 📁 Project Structure

```
military-asset-management/
├── run.bat                          # 1-Click Windows execution script
├── run.ps1                          # Automated full-stack build and launch script
├── database_dump.sql                # Full SQL schema & seed dump
├── README.md                        # Documentation
│
├── frontend/                        # React 18 + Vite (Pure JavaScript)
│   ├── package.json
│   ├── vite.config.js               # Proxies /api to Spring Boot port 5000
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── services/api.js          # REST client with auth context
│       ├── pages/
│       │   ├── LoginPage.jsx        # Sign In & Sign Up with password validation
│       │   ├── DashboardPage.jsx    # Real-time metrics and inventory ledger
│       │   ├── PurchasesPage.jsx    # Purchases ledger and CSV export
│       │   ├── TransfersPage.jsx    # Inter-base transfer manifests
│       │   ├── AssignmentsPage.jsx  # Personnel issues & munitions expenditures
│       │   └── AuditLogsPage.jsx    # Immutable transaction audit trail
│       └── components/
│           ├── Navbar.jsx           # Top header with user profile & logout
│           ├── NetMovementModal.jsx # Bonus modal breaking down net movement
│           ├── RecordPurchaseModal.jsx
│           ├── InitiateTransferModal.jsx
│           ├── AssignAssetModal.jsx
│           └── RecordExpenditureModal.jsx
│
└── java-backend/                    # Java 17 + Spring Boot 3 + MySQL
    ├── pom.xml                      # Maven dependencies
    └── src/main/
        ├── resources/
        │   ├── application.properties # MySQL port 3306 (user: root, password: Ambu@2004)
        │   └── static/              # Compiled React frontend distribution
        └── java/com/military/assets/
            ├── MilitaryAssetsApplication.java
            ├── config/              # CorsConfig, DataInitializer, SecurityConfig
            ├── controller/          # AuthController, DashboardController, etc.
            ├── dto/                 # LoginRequest, LoginResponse, UserDto, etc.
            ├── middleware/          # UserContextFilter (RBAC context)
            ├── model/               # JPA Entities: User, Base, InventoryItem, etc.
            ├── repository/          # Spring Data JPA Repositories
            └── service/             # DashboardService, AuditService, etc.
```

---

## 🧪 Verified API Endpoints

- `GET  /api/health` — System status and health check
- `POST /api/auth/login` — Sign in with email or username and password
- `POST /api/auth/register` — Register personnel with custom credentials
- `POST /api/auth/quick-login` — 1-click evaluation quick login
- `GET  /api/auth/me` — Currently authenticated user profile and capabilities
- `GET  /api/bases` — Active military installations and commanders
- `GET  /api/bases/categories` — Equipment categories (Weapons, Vehicles, Ammo, etc.)
- `GET  /api/dashboard/metrics` — KPI calculations and ledger balances
- `GET  /api/purchases` / `POST /api/purchases` — Procurement logs
- `GET  /api/transfers` / `POST /api/transfers` — Movement tracking
- `PATCH /api/transfers/{id}/receive` — Confirm transfer arrival
- `GET  /api/assignments` / `POST /api/assignments` — Personnel gear custody
- `POST /api/assignments/{id}/return` — Check-in returned equipment
- `GET  /api/audit/logs` — Complete chronological audit trail
