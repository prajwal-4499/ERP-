@echo off
title Build Distributable Windows EXE - Shravani Collection ERP
echo ================================================================
echo   BUILDING STANDALONE WINDOWS .EXE INSTALLER / PACKAGE
echo ================================================================
echo.
cd /d "%~dp0frontend"

echo [1/3] Closing any running ClothShopERP instances...
taskkill /F /IM ClothShopERP.exe >nul 2>&1

echo [2/3] Compiling Production Build...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Packaging Standalone Windows .EXE...
call npx @electron/packager . ClothShopERP --platform=win32 --arch=x64 --out=dist-package --overwrite
if %errorlevel% neq 0 (
    echo [ERROR] Packaging failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ================================================================
echo   BUILD COMPLETE!
echo   Output folder: d:\ERP SYSTEM\frontend\dist-package\ClothShopERP-win32-x64\
echo   Executable:    ClothShopERP.exe
echo   You can zip or copy this folder to any Windows PC to share.
echo ================================================================
pause
