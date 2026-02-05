# DecoyVerse Lenovo Node - Manual Fix Script
# Run this on the Lenovo laptop to activate the agent

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DecoyVerse Agent - Lenovo Node Activator" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if agent is installed
if (-not (Test-Path "C:\DecoyVerse\agent.py")) {
    Write-Host "[ERROR] Agent not installed at C:\DecoyVerse" -ForegroundColor Red
    Write-Host "Please download and run the installer from the dashboard." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[OK] Agent found at C:\DecoyVerse" -ForegroundColor Green
Write-Host ""

# Check Python
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try {
        $ver = & $cmd --version 2>&1
        if ($ver -like "*Python 3*") {
            $pythonCmd = $cmd
            Write-Host "[OK] Python found: $ver" -ForegroundColor Green
            break
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Host "[ERROR] Python 3.10+ not found!" -ForegroundColor Red
    Write-Host "Install from: https://python.org" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Checking agent configuration..." -ForegroundColor Cyan

# Check config file
if (-not (Test-Path "C:\DecoyVerse\agent_config.json")) {
    Write-Host "[ERROR] agent_config.json missing!" -ForegroundColor Red
    Write-Host "Re-download installer from dashboard." -ForegroundColor Yellow
    pause
    exit 1
}

# Read config
$config = Get-Content "C:\DecoyVerse\agent_config.json" | ConvertFrom-Json
Write-Host "[OK] Node ID: $($config.node_id)" -ForegroundColor Green
Write-Host "[OK] Node Name: $($config.node_name)" -ForegroundColor Green
Write-Host ""

# Stop any existing agent processes
Write-Host "Stopping existing agent processes..." -ForegroundColor Cyan
Get-Process -Name python -ErrorAction SilentlyContinue | 
    Where-Object {$_.Path -like "*DecoyVerse*"} | 
    Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2
Write-Host "[OK] Existing processes stopped" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
& $pythonCmd -m pip install --quiet --upgrade pip 2>&1 | Out-Null
& $pythonCmd -m pip install --quiet requests watchdog psutil 2>&1 | Out-Null
Write-Host "[OK] Dependencies installed" -ForegroundColor Green
Write-Host ""

# Run agent once to register
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Starting Agent (This may take 30-60 seconds)" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The agent will:" -ForegroundColor White
Write-Host "  1. Deploy honeytokens to your system" -ForegroundColor Gray
Write-Host "  2. Register with backend" -ForegroundColor Gray
Write-Host "  3. Update node status to 'Active'" -ForegroundColor Gray
Write-Host "  4. Show in dashboard within 1 minute" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C after you see 'AGENT ACTIVE'" -ForegroundColor Yellow
Write-Host ""

Set-Location "C:\DecoyVerse"

# Run agent
& $pythonCmd agent.py

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Agent Registration Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check dashboard - node should be 'Active'" -ForegroundColor Gray
Write-Host "  2. View deployed decoys in Decoys tab" -ForegroundColor Gray
Write-Host "  3. Agent will auto-start on next login" -ForegroundColor Gray
Write-Host ""

pause
