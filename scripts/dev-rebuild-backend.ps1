# Rebuild only backend container

Write-Host "Rebuilding backend container..." -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Rebuild and restart only backend
docker-compose -f docker-compose.dev.yml up --build -d backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend rebuilt successfully!" -ForegroundColor Green
    Write-Host "API: http://localhost:5001" -ForegroundColor Cyan
    Write-Host "Swagger: http://localhost:5001/swagger" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: Failed to rebuild backend" -ForegroundColor Red
}
