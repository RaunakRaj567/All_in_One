@echo off
title AgriVision Mega Suite - Unified 4-Module Launcher
color 0A

echo =======================================================================
echo   🌾 AGRIVISION MEGA PORTAL — UNIFIED FARMER & LOGISTICS SUITE
echo   [1] Crop Disease Diagnostics
echo   [2] ML Crop Recommendation Engine
echo   [3] Kisan AI Agronomist Chatbot
echo   [4] Supply Chain & CVRP Route Optimizer
echo =======================================================================
echo.
echo [1/4] Starting Kisan AI & Chatbot Backend (Port 8001) ...
start "AgriVision AI Backend (Port 8001)" /D "%~dp0Farmer chatbot" cmd /k "python main.py"

echo [2/4] Starting Route & Logistics Optimization Backend (Port 8000) ...
start "AgriVision Logistics Backend (Port 8000)" /D "%~dp0Routees - iNTEGRATED" cmd /k "python -m backend.main"

echo [3/4] Starting Unified Vite React Frontend (Port 5173) ...
start "AgriVision Mega UI (Port 5173)" /D "%~dp0Crop Disease detector" cmd /k "npm run dev"

echo [4/4] Opening Web Browser ...
timeout /t 3 >nul
start http://localhost:5173/

echo.
echo =======================================================================
echo   SUCCESS: Mega Suite is running concurrently!
echo   - Unified Portal: http://localhost:5173
echo   - AI Backend:     http://127.0.0.1:8001
echo   - Route Backend:  http://127.0.0.1:8000
echo =======================================================================
echo.
echo Press any key to exit launcher window (services will keep running)...
pause >nul
