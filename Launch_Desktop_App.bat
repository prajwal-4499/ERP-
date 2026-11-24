@echo off
title Launching Shravani Collection & New SK Telors - ERP & POS
echo ================================================================
echo   SHRAVANI COLLECTION & NEW SK TELORS - DESKTOP ERP & POS
echo ================================================================
echo.
echo Starting Desktop Application...
cd /d "%~dp0frontend"

start "" npx electron .
exit
