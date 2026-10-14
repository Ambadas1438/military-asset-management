# ============================================================
#  ARES Military Asset Management - Full Stack Launcher
#  Pure React (JS) Frontend + Java 17 Spring Boot + MySQL
# ============================================================

$ROOT     = $PSScriptRoot
$FRONTEND = "$ROOT\frontend"
$BACKEND  = "$ROOT\java-backend"
$STATIC   = "$BACKEND\src\main\resources\static"

# Find Maven
$MVN = "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd"
if (-not (Test-Path $MVN)) {
    $MVN = "C:\Users\ADMIN\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  ARES - Military Asset Management System (Java Full Stack)" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  Database : MySQL (localhost:3306/military_assets)" -ForegroundColor Gray
Write-Host "  Backend  : Java 17 + Spring Boot 3" -ForegroundColor Gray
Write-Host "  Frontend : React.js (Pure JavaScript)" -ForegroundColor Gray
Write-Host "=======================================================" -ForegroundColor Cyan

# ── STEP 1: Build React frontend ─────────────────────────────
Write-Host ""
Write-Host "[1/3] Building React (JavaScript) frontend..." -ForegroundColor Green
Set-Location $FRONTEND
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    exit 1
}

# ── STEP 2: Copy dist → Spring Boot static folder ────────────
Write-Host ""
Write-Host "[2/3] Syncing dist to Spring Boot static folder..." -ForegroundColor Green
if (-not (Test-Path $STATIC)) {
    New-Item -ItemType Directory -Path $STATIC | Out-Null
}
Copy-Item -Recurse -Force "$FRONTEND\dist\*" $STATIC
Write-Host "      Done. Static assets synced." -ForegroundColor Gray

# ── STEP 3: Start Spring Boot on port 5000 ───────────────────
Write-Host ""
Write-Host "[3/3] Starting Spring Boot server on port 5000..." -ForegroundColor Green
Write-Host ""
Write-Host "  Application UI  ->  http://localhost:5000" -ForegroundColor Green
Write-Host "  Health API      ->  http://localhost:5000/api/health" -ForegroundColor Yellow
Write-Host "  MySQL Database  ->  military_assets (User: root)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Credentials for Demo:" -ForegroundColor Yellow
Write-Host "    - Admin:              a.vance@military.gov / password123" -ForegroundColor Gray
Write-Host "    - Base Commander A:   s.miller@sentinel.mil / password123" -ForegroundColor Gray
Write-Host "    - Logistics Officer:  a.carter@logistics.mil / password123" -ForegroundColor Gray
Write-Host "    - Or use 1-Click Quick Login & New User Signup!" -ForegroundColor Magenta
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $BACKEND
& $MVN spring-boot:run
