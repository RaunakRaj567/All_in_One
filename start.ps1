# PowerShell Single-Terminal Startup Script for AgriVision Mega Suite
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host "  🌾 AGRIVISION MEGA PORTAL — UNIFIED FARMER & LOGISTICS SUITE" -ForegroundColor Green
Write-Host "  [1] Crop Disease Diagnostics" -ForegroundColor Green
Write-Host "  [2] ML Crop Recommendation Engine" -ForegroundColor Green
Write-Host "  [3] Kisan AI Agronomist Chatbot" -ForegroundColor Green
Write-Host "  [4] Supply Chain & CVRP Route Optimizer" -ForegroundColor Green
Write-Host "=======================================================================" -ForegroundColor Green
Write-Host ""

$RootPath = $PSScriptRoot

Write-Host "[1/4] Starting Kisan AI & Chatbot Backend (Port 8001) ..." -ForegroundColor Yellow
$BackendPath1 = Join-Path $RootPath "Farmer chatbot"
Start-Process cmd.exe -ArgumentList "/k cd /d `"$BackendPath1`" && python main.py" -WindowStyle Normal

Write-Host "[2/4] Starting Route & Logistics Optimization Backend (Port 8000) ..." -ForegroundColor Yellow
$BackendPath2 = Join-Path $RootPath "Routees - iNTEGRATED"
Start-Process cmd.exe -ArgumentList "/k cd /d `"$BackendPath2`" && python -m backend.main" -WindowStyle Normal

Write-Host "[3/4] Starting Unified Vite React Frontend (Port 5173) ..." -ForegroundColor Yellow
$FrontendPath = Join-Path $RootPath "Crop Disease detector"
Start-Process cmd.exe -ArgumentList "/k cd /d `"$FrontendPath`" && npm run dev" -WindowStyle Normal

Write-Host "[4/4] Launching Web Browser ..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173/"

Write-Host ""
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "  SUCCESS: Mega Suite launched successfully!" -ForegroundColor Cyan
Write-Host "  - Unified Portal: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - AI Backend:     http://127.0.0.1:8001" -ForegroundColor Cyan
Write-Host "  - Route Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan
