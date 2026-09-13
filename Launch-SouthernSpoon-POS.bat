@echo off
title Southern Spoon POS
cd /d "%~dp0"

:: 1. Quick optional Git sync if online
git pull origin main >nul 2>&1

:: 2. Launch directly via native Electron binary
if exist "node_modules\electron\dist\electron.exe" (
    start "" "node_modules\electron\dist\electron.exe" .
    exit /b 0
)

:: 3. Launch compiled release if available
if exist "release\win-unpacked\Southern Spoon POS.exe" (
    start "" "release\win-unpacked\Southern Spoon POS.exe"
    exit /b 0
)

:: 4. Fallback to electron.cmd
start "" "node_modules\.bin\electron.cmd" .
exit /b 0
