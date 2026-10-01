@echo off
echo ========================================================
echo Starting ArogyaBandhu Rural Healthcare Platform
echo ========================================================

start "ArogyaBandhu Backend (Port 5000)" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
start "ArogyaBandhu Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000/api/health
echo ========================================================
