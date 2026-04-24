param(
    [int[]]$Ports = @(5000, 5173)
)

$ErrorActionPreference = "Stop"

function Get-PidsByPort {
    param(
        [Parameter(Mandatory = $true)][int]$Port
    )

    $lines = netstat -ano | Select-String ":$Port "
    if (-not $lines) {
        return @()
    }

    $pids = @()
    foreach ($line in $lines) {
        $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
        if ($parts.Count -gt 0) {
            $pid = $parts[-1]
            if ($pid -match '^\d+$') {
                $pids += [int]$pid
            }
        }
    }

    return $pids | Sort-Object -Unique
}

$allPids = @()
foreach ($port in $Ports) {
    $pids = Get-PidsByPort -Port $port
    if ($pids.Count -eq 0) {
        Write-Host "Port $port is free." -ForegroundColor Yellow
        continue
    }

    Write-Host "Port $port has processes: $($pids -join ', ')" -ForegroundColor Cyan
    $allPids += $pids
}

$allPids = $allPids | Sort-Object -Unique

if ($allPids.Count -eq 0) {
    Write-Host "Nothing to stop. Backend/frontend are already down." -ForegroundColor Green
    return
}

foreach ($pid in $allPids) {
    try {
        taskkill /PID $pid /F | Out-Null
        Write-Host "Stopped PID $pid" -ForegroundColor Green
    } catch {
        Write-Host "Could not stop PID ${pid}: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done. Ports checked: $($Ports -join ', ')." -ForegroundColor Green
