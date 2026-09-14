@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
if errorlevel 1 goto missingProject

rem Explorer does not inherit the extra runtime PATH used by the coding terminal.
set "publishNode="
for /f "delims=" %%I in ('where node.exe 2^>nul') do if not defined publishNode set "publishNode=%%I"
if not defined publishNode if exist "%ProgramFiles%\nodejs\node.exe" set "publishNode=%ProgramFiles%\nodejs\node.exe"
if not defined publishNode if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "publishNode=%LOCALAPPDATA%\Programs\nodejs\node.exe"
if not defined publishNode if defined NVM_SYMLINK if exist "%NVM_SYMLINK%\node.exe" set "publishNode=%NVM_SYMLINK%\node.exe"
if not defined publishNode if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "publishNode=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined publishNode goto missingNode

echo Using Node.js: %publishNode%
"%publishNode%" scripts/publish.mjs %*
set "publishExit=%errorlevel%"
goto finished

:missingNode
echo Node.js was not found. Install Node.js, then run this file again.
echo No server connection was attempted.
set "publishExit=1"
goto finished

:missingProject
echo Cannot open the project folder. No server connection was attempted.
set "publishExit=1"

:finished
echo.
if /I "%~1"=="--prepare" exit /b %publishExit%
pause
exit /b %publishExit%
