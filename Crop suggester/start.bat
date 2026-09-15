@echo off
title Crop Suggester Web Application
echo ===================================================
echo   CROP SUGGESTER // Organic Soil Telemetry App
echo ===================================================
echo.
cd /d "%~dp0"
echo Starting Flask Server on http://127.0.0.1:5000 ...
echo.
python app.py
pause
