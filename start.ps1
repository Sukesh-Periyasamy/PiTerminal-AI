#!/usr/bin/env pwsh
# Startup script for Chatbot UI with Terminal

Write-Host "🚀 Starting Chatbot UI with Integrated Terminal..." -ForegroundColor Cyan
Write-Host ""

# Check if backend dependencies are installed
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
}

# Check if frontend dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "✅ Starting services..." -ForegroundColor Green
Write-Host ""

# Start backend in background
Write-Host "🔧 Starting backend server (port 3001)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node backend/server.js
}

Start-Sleep -Seconds 2

# Check if backend started
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "✅ Backend server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend may still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Starting frontend server (port 3000)..." -ForegroundColor Cyan
Write-Host ""

# Start frontend (foreground)
npm run dev

# Cleanup on exit
Write-Host ""
Write-Host "🛑 Shutting down..." -ForegroundColor Red
Stop-Job -Job $backendJob
Remove-Job -Job $backendJob
