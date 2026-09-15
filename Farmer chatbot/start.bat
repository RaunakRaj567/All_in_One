@echo off
echo ========================================================
echo   Starting Kisan AI / AgriAssist Farmer Chatbot Suite
echo ========================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8001...
start "AgriAssist Backend (Port 8001)" cmd /k "python main.py"

echo [2/2] Starting Vite React Frontend on http://localhost:5173...
cd frontend
start "AgriAssist Frontend (Port 5173)" cmd /k "npm run dev"

echo.
echo Both servers launched successfully!
echo Access UI at: http://localhost:5173
echo.
pause
