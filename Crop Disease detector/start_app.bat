@echo off
title AgriVision - Farmer Crop Disease Predictor
color 0A

echo ========================================================
echo   🌿 AGRIVISION — FARMER CROP DISEASE PREDICTOR
echo ========================================================
echo.
echo Starting local development server...
echo Local URL: http://localhost:5173/
echo.

:: Open browser automatically after 2 seconds
timeout /t 2 /nobreak >nul
start http://localhost:5173/

:: Change directory to project root and run Vite server
cd /d "%~dp0"
npm run dev

pause
