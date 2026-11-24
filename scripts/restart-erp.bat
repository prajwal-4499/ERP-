@echo off
call "%~dp0\stop-erp.bat"
timeout /t 2 /nobreak >nul
call "%~dp0\start-erp.bat"
