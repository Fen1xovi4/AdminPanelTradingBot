# PowerShell script to test Bot State API

$baseUrl = "http://localhost:5000"

Write-Host "Testing Bot State API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Get all bot states
Write-Host "1. Testing GET /api/v1/botstate (Get all bot states)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/botstate" -Method Get -Headers @{
        "Authorization" = "Bearer YOUR_TOKEN_HERE"
    }
    Write-Host "Success! Found $($response.Count) bot states" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Note: This endpoint requires authentication. Try without auth:" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 2: Update bot status (no auth required)
Write-Host "2. Testing POST /api/v1/botstate/test-bot-3/status" -ForegroundColor Yellow
$statusData = @{
    IsRunning = $true
    Status = "Running"
    Timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/botstate/test-bot-3/status" -Method Post -Body $statusData -ContentType "application/json"
    Write-Host "Success! Bot status updated" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 3: Update bot position
Write-Host "3. Testing POST /api/v1/botstate/test-bot-3/position" -ForegroundColor Yellow
$positionData = @{
    InPosition = $true
    EntryPrice = 50000
    TakeProfit = 51000
    StopLoss = 49500
    PositionSize = 0.1
    CurrentPrice = 50200
    UnrealizedPnL = 20
    PositionSide = "Long"
    Timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/botstate/test-bot-3/position" -Method Post -Body $positionData -ContentType "application/json"
    Write-Host "Success! Bot position updated" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 4: Check if file was created
Write-Host "4. Checking if test-bot-3.json was created" -ForegroundColor Yellow
$filePath = "backend\Data\BotStates\test-bot-3.json"
if (Test-Path $filePath) {
    Write-Host "Success! File created at: $filePath" -ForegroundColor Green
    Write-Host "Content:" -ForegroundColor Cyan
    Get-Content $filePath | ConvertFrom-Json | ConvertTo-Json -Depth 10
} else {
    Write-Host "File not found: $filePath" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Cyan
