# Stop development environment

Write-Host "Stopping BotsForTrading Development Environment..." -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

docker-compose -f docker-compose.dev.yml down

Write-Host "Development environment stopped." -ForegroundColor Green
