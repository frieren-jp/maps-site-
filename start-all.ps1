param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

function Ensure-EnvFile {
    param(
        [Parameter(Mandatory = $true)][string]$ServicePath
    )

    $envPath = Join-Path $ServicePath ".env"
    $examplePath = Join-Path $ServicePath ".env.example"

    if (-not (Test-Path $envPath) -and (Test-Path $examplePath)) {
        Copy-Item $examplePath $envPath
        Write-Host "Created $envPath from .env.example" -ForegroundColor Yellow
    }
}

function Ensure-Dependencies {
    param(
        [Parameter(Mandatory = $true)][string]$ServicePath,
        [Parameter(Mandatory = $true)][string]$ServiceName
    )

    $nodeModulesPath = Join-Path $ServicePath "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "Installing dependencies for $ServiceName..." -ForegroundColor Cyan
        Push-Location $ServicePath
        try {
            npm install
        }
        finally {
            Pop-Location
        }
    }
}

function Get-PortPid {
    param(
        [Parameter(Mandatory = $true)][int]$Port
    )

    $line = netstat -ano | Select-String ":$Port " | Select-Object -First 1
    if (-not $line) {
        return $null
    }

    $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
    if ($parts.Count -gt 0) {
        return $parts[-1]
    }
    return $null
}

Ensure-EnvFile -ServicePath $backendPath
Ensure-EnvFile -ServicePath $frontendPath

if (-not $SkipInstall) {
    Ensure-Dependencies -ServicePath $backendPath -ServiceName "backend"
    Ensure-Dependencies -ServicePath $frontendPath -ServiceName "frontend"
}

$backendPid = Get-PortPid -Port 5000
if ($backendPid) {
    Write-Host "Port 5000 is already in use (PID $backendPid)." -ForegroundColor Yellow
    Write-Host "If backend does not respond, stop that process and run this script again." -ForegroundColor Yellow
}

$frontendPid = Get-PortPid -Port 5173
if ($frontendPid) {
    Write-Host "Port 5173 is already in use (PID $frontendPid)." -ForegroundColor Yellow
    Write-Host "If frontend does not respond, stop that process and run this script again." -ForegroundColor Yellow
}

Write-Host "Starting backend..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm run dev"

Write-Host "Starting frontend..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host ""
Write-Host "Done. Wait 5-15 seconds, then open:" -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:5173"
Write-Host "Backend health: http://localhost:5000/api/health"
Write-Host ""
Write-Host "Tip: run '.\start-all.ps1 -SkipInstall' for faster startup after first install."
