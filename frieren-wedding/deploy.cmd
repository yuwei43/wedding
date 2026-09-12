@echo off
chcp 65001 >nul
cd /d "%~dp0"
node scripts/publish.mjs %*
set "publishExit=%errorlevel%"
echo.
pause
exit /b %publishExit%
