# 🔧 BudgetPlanner - Database Connection Diagnostic Script
# Für: IT-Agenten / Support-Team
# Usage: .\diagnose-db.ps1

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  BudgetPlanner - Database Diagnostics" -ForegroundColor Cyan
Write-Host "║  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============================================================================
# 1. Node.js & Environment Check
# ============================================================================

Write-Host "📋 1. ENVIRONMENT CHECK" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"

$nodeVersion = node -v 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js:     $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js:     NOT FOUND" -ForegroundColor Red
    Write-Host "   Fix: Install Node.js 18+ from nodejs.org" -ForegroundColor Yellow
}

$npmVersion = npm -v 2>$null
if ($npmVersion) {
    Write-Host "✅ npm:         v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm:         NOT FOUND" -ForegroundColor Red
}

$psVersion = $PSVersionTable.PSVersion
Write-Host "✅ PowerShell:  $($psVersion.Major).$($psVersion.Minor)" -ForegroundColor Green

$osVersion = (Get-CimInstance Win32_OperatingSystem).Caption
Write-Host "✅ OS:          $osVersion" -ForegroundColor Green

Write-Host ""

# ============================================================================
# 2. Project Structure Check
# ============================================================================

Write-Host "📋 2. PROJECT STRUCTURE" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"

$projectRoot = Get-Location
$checks = @(
    @{ Name = "package.json (root)"; Path = "package.json" },
    @{ Name = "server/package.json"; Path = "server\package.json" },
    @{ Name = "server/.env"; Path = "server\.env" },
    @{ Name = "server/src/index.ts"; Path = "server\src\index.ts" },
    @{ Name = "server/src/db.ts"; Path = "server\src\db.ts" }
)

foreach ($check in $checks) {
    $exists = Test-Path $check.Path
    if ($exists) {
        Write-Host "✅ $($check.Name)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($check.Name)" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================================================
# 3. .env File Check
# ============================================================================

Write-Host "📋 3. ENVIRONMENT VARIABLES (.env)" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"

if (Test-Path "server\.env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    $envContent = Get-Content "server\.env"
    $requiredVars = @("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "PORT", "CORS_ORIGIN")
    
    foreach ($var in $requiredVars) {
        $found = $envContent | Select-String "^$var=" -Quiet
        if ($found) {
            Write-Host "   ✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $var is MISSING" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env file NOT FOUND" -ForegroundColor Red
    Write-Host "   Fix: Create server/.env from server/.env.example" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 4. Port Check
# ============================================================================

Write-Host "📋 4. PORT AVAILABILITY" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"

$ports = @(8081, 5173)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "❌ Port $port: ALREADY IN USE" -ForegroundColor Red
        Write-Host "   Fix: netstat -ano | findstr :$port" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Port $port: Available" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================================================
# 5. DNS Resolution Check
# ============================================================================

Write-Host "📋 5. NETWORK & DNS" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"

# Check internet
$dnsTest = Resolve-DnsName 8.8.8.8 -ErrorAction SilentlyContinue
if ($dnsTest) {
    Write-Host "✅ Internet:    Connected" -ForegroundColor Green
} else {
    Write-Host "❌ Internet:    NOT connected" -ForegroundColor Red
}

# Check Azure DNS
$azureDNS = Resolve-DnsName budgetplanner.postgres.database.azure.com -ErrorAction SilentlyContinue
if ($azureDNS) {
    $ipAddress = $azureDNS[0].IPAddress
    Write-Host "✅ Azure DNS:   Resolved to $ipAddress" -ForegroundColor Green
    
    # Test connectivity to Azure
    $tcpTest = Test-NetConnection budgetplanner.postgres.database.azure.com -Port 5432 -WarningAction SilentlyContinue
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "✅ Azure Port:  5432 is reachable" -ForegroundColor Green
    } else {
        Write-Host "❌ Azure Port:  5432 is NOT reachable" -ForegroundColor Red
        Write-Host "   Likely: Firewall rule needed in Azure Portal" -ForegroundColor Yellow
        Write-Host "   Fix: Azure Portal → Networking → Add firewall rule" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Azure DNS:   Cannot resolve" -ForegroundColor Red
    Write-Host "   Likely: Network issue or incorrect hostname" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 6. Node Dependencies Check
# ============================================================================

Write-Host "📋 6. DEPENDENCIES" -ForegroundColor Yellow
Write-Host "───────────────────────────────────────────────────────────"

$rootNodeModules = Test-Path "node_modules"
if ($rootNodeModules) {
    Write-Host "✅ Root node_modules: Installed" -ForegroundColor Green
} else {
    Write-Host "❌ Root node_modules: NOT installed" -ForegroundColor Red
    Write-Host "   Fix: npm install" -ForegroundColor Yellow
}

$serverNodeModules = Test-Path "server\node_modules"
if ($serverNodeModules) {
    Write-Host "✅ Server node_modules: Installed" -ForegroundColor Green
} else {
    Write-Host "❌ Server node_modules: NOT installed" -ForegroundColor Red
    Write-Host "   Fix: cd server && npm install && cd .." -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 7. Summary & Recommendations
# ============================================================================

Write-Host "📋 SUMMARY & RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────────"

$issues = @()

if (!(Test-Path "server\.env")) { $issues += "Missing .env file" }
if (!(Test-Path "node_modules")) { $issues += "Root dependencies not installed" }
if (!(Test-Path "server\node_modules")) { $issues += "Server dependencies not installed" }

if ($issues.Count -eq 0) {
    Write-Host "✅ All checks passed! Ready to run: npm run dev" -ForegroundColor Green
} else {
    Write-Host "⚠️  Found $($issues.Count) issue(s):" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "1. Fix any issues listed above" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:5173" -ForegroundColor White
Write-Host "4. Check API: http://localhost:8081/api/health" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────────────"
Write-Host "Troubleshooting Guide: See PORT_ENV_TROUBLESHOOTING.md" -ForegroundColor White
Write-Host "Azure Portal: https://portal.azure.com" -ForegroundColor White
Write-Host ""

Write-Host "✅ Diagnostic complete!" -ForegroundColor Green -NoNewline
Write-Host " $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
