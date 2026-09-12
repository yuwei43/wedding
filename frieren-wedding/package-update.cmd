@echo off
setlocal
cd /d "%~dp0"
if errorlevel 1 goto failed

where tar >nul 2>nul
if errorlevel 1 (
  echo ERROR: Windows tar is not available.
  goto failed
)

if not exist "update-packages" mkdir "update-packages"
if not exist "update-packages" goto failed

:chooseName
set "updateArchive=update-packages\wedding-update-%RANDOM%-%RANDOM%.tar.gz"
if exist "%updateArchive%" goto chooseName

echo Packaging the latest source files...
echo Server passwords, node_modules and local build files are excluded.
tar -czf "%updateArchive%" app components hooks lib public scripts package.json pnpm-lock.yaml pnpm-workspace.yaml next.config.ts tsconfig.json postcss.config.mjs
if errorlevel 1 goto failed

tar -tf "%updateArchive%" >nul
if errorlevel 1 goto failed

echo.
echo SUCCESS: Update package created.
echo %CD%\%updateArchive%
echo.
echo This is a source package. Upload it, then build on the server.
if /I not "%~1"=="--no-pause" pause
exit /b 0

:failed
echo.
echo ERROR: Packaging failed. Do not upload a package from this failed run.
if /I not "%~1"=="--no-pause" pause
exit /b 1
