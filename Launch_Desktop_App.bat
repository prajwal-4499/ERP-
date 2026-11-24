@echo off
title Launching Shravani Collection & New SK Telors - ERP & POS
echo ================================================================
echo   SHRAVANI COLLECTION & NEW SK TELORS - DESKTOP ERP & POS
echo ================================================================
echo.

set EXE_PATH=%~dp0frontend\dist-package\ClothShopERP-win32-x64\ClothShopERP.exe

if exist "%EXE_PATH%" (
    echo Starting Production Desktop Application (.EXE)...
    start "" "%EXE_PATH%"
    exit
) else (
    echo Starting Desktop Application via Electron...
    cd /d "%~dp0frontend"
    start "" npx electron .
    exit
)
