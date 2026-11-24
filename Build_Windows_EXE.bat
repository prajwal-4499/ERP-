@echo off
title Build Distributable Windows EXE - Shravani Collection ERP
echo ================================================================
echo   BUILDING STANDALONE WINDOWS .EXE INSTALLER / PACKAGE
echo   Shravani Collection & New SK Telors - Desktop ERP & POS
echo ================================================================
echo.

cd /d "%~dp0frontend"

echo [1/5] Terminating any running application instances...
taskkill /F /IM ClothShopERP.exe >nul 2>&1
taskkill /F /IM electron.exe >nul 2>&1

echo [2/5] Cleaning previous build artifacts and caches...
if exist dist rmdir /s /q dist
if exist dist-package rmdir /s /q dist-package

echo [3/5] Compiling Production React + Vite + TypeScript Build...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend build failed with error code %errorlevel%.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/5] Packaging Standalone Windows .EXE with Electron Packager...
call npx @electron/packager . ClothShopERP --platform=win32 --arch=x64 --out=dist-package --prune=true --asar --ignore="^/(dist-package|dist-electron|src|\.git|\.vscode|\.idea|tests)" --overwrite
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Electron packaging failed with error code %errorlevel%.
    pause
    exit /b %errorlevel%
)

echo.
echo [5/5] Creating Fresh Distributable ZIP Archive...
powershell -NoProfile -Command "Compress-Archive -Path 'dist-package\ClothShopERP-win32-x64\*' -DestinationPath 'dist-package\ClothShopERP-win32-x64.zip' -Force"
if %errorlevel% neq 0 (
    echo [WARNING] ZIP generation had a minor warning, but .EXE was built successfully.
)

echo.
echo ================================================================
echo   SUCCESS! FRESH BUILD GENERATED SUCCESSFULLY
echo ================================================================
echo   Output Directory: %~dp0frontend\dist-package\ClothShopERP-win32-x64\
echo   Executable (.EXE): ClothShopERP.exe
echo   Zip Package:      ClothShopERP-win32-x64.zip
echo.
echo   You can launch the application directly using:
echo   Run_ClothShopERP.bat (in the project root)
echo ================================================================
pause
