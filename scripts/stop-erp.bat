@echo off
echo Stopping Cloth Shop ERP Background Processes...
taskkill /f /im node.exe >nul 2>&1
echo Done.
