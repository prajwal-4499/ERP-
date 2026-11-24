@echo off
title Launching Shravani Collection & New SK Telors ERP
set EXE_PATH=%~dp0frontend\dist-package\ClothShopERP-win32-x64\ClothShopERP.exe

if not exist "%EXE_PATH%" (
    echo ================================================================
    echo   [NOTICE] Pre-built ClothShopERP.exe not found!
    echo   Starting Electron directly via npm...
    echo ================================================================
    cd /d "%~dp0frontend"
    start "" npx electron .
    exit
)

echo Starting Shravani Collection & New SK Telors ERP (.EXE)...
start "" "%EXE_PATH%"
exit
