# Development with hot reload
# Runs backend in Docker, frontend with Vite dev server (hot reload)

Write-Host "Starting BotsForTrading with Hot Reload..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Check if Docker is running
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting database and backend in Docker..." -ForegroundColor Yellow

# Start only postgres and backend
docker-compose -f docker-compose.dev.yml up --build -d postgres backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start backend services" -ForegroundColor Red
    exit 1
}

# Wait for backend to be healthy
Write-Host "Waiting for backend to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $attempt++
    $health = Invoke-WebRequest -Uri "http://localhost:5001/health" -UseBasicParsing -ErrorAction SilentlyContinue
} while ($health.StatusCode -ne 200 -and $attempt -lt $maxAttempts)

if ($attempt -ge $maxAttempts) {
    Write-Host "WARNING: Backend health check timeout, continuing anyway..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Backend is ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host " Backend:   http://localhost:5001" -ForegroundColor Cyan
Write-Host " Swagger:   http://localhost:5001/swagger" -ForegroundColor Cyan
Write-Host " Database:  localhost:5433" -ForegroundColor Cyan
Write-Host ""
Write-Host " Starting frontend with hot reload..." -ForegroundColor Yellow
Write-Host " Press Ctrl+C to stop frontend (backend will keep running)" -ForegroundColor Gray
Write-Host ""

# Start frontend dev server
Set-Location "$projectRoot\frontend"
npm run dev
