# Rebuild only frontend container (faster iteration)

Write-Host "Rebuilding frontend container..." -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Rebuild and restart only frontend
docker-compose -f docker-compose.dev.yml up --build -d frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend rebuilt successfully!" -ForegroundColor Green
    Write-Host "Open http://localhost:3001" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: Failed to rebuild frontend" -ForegroundColor Red
}
