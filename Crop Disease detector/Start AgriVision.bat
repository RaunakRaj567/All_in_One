@echo off
title AgriVision - Farmer Crop Disease Predictor
color 0A

echo ========================================================
echo   🌿 AGRIVISION — FARMER CROP DISEASE PREDICTOR
echo ========================================================
echo.
echo Starting dev server...
echo.

:: Open browser automatically
start http://localhost:5173/

:: Navigate to project directory and start npm run dev
cd /d "c:\Users\Lenovo\Desktop\Crop Disease detector"
npm run dev

pause
