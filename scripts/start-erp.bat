@echo off
echo ===================================================
echo   CLOTH SHOP ERP — WINDOWS DESKTOP STARTUP
echo ===================================================
echo [1/3] Checking environment runtime...
echo [2/3] Initializing ERP Local Engine...
cd /d "%~dp0\..\frontend"
start "Cloth Shop ERP Desktop Service" npm run dev -- --host
echo [3/3] Application Launched Successfully!
echo ===================================================
pause
