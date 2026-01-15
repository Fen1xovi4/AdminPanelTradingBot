# Development startup script
# Runs full local development environment with Docker

Write-Host "Starting BotsForTrading Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Check if Docker is running
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "Building and starting containers..." -ForegroundColor Yellow
Write-Host ""

# Stop existing containers if any
docker-compose -f docker-compose.dev.yml down 2>$null

# Build and start
docker-compose -f docker-compose.dev.yml up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " Development environment is ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host " Frontend:  http://localhost:3001" -ForegroundColor Cyan
    Write-Host " Backend:   http://localhost:5001" -ForegroundColor Cyan
    Write-Host " Swagger:   http://localhost:5001/swagger" -ForegroundColor Cyan
    Write-Host " Database:  localhost:5433" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " Admin credentials:" -ForegroundColor Yellow
    Write-Host "   Email:    admin@admin.local"
    Write-Host "   Password: Admin123!"
    Write-Host ""
    Write-Host " To view logs:  docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Gray
    Write-Host " To stop:       docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "ERROR: Failed to start containers" -ForegroundColor Red
    exit 1
}
