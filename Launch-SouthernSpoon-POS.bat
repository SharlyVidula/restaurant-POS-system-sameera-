@echo off
title Southern Spoon POS - Terminal Launcher
color 0E

:: Ensure working directory is the script folder
cd /d "%~dp0"

echo ============================================================
echo           SOUTHERN SPOON RESTAURANT POS TERMINAL
echo          Authentic Sri Lankan Cuisine - Galle Fort
echo ============================================================
echo Current directory: %CD%
echo.

:: Step 1: Check for GitHub repository updates
echo [*] Checking for remote updates from Git repository...
ping -n 1 github.com >nul 2>&1
if %errorlevel% equ 0 (
    echo [*] Internet connection detected. Fetching latest updates...
    git pull origin main
    if %errorlevel% equ 0 (
        echo [OK] System is up to date with repository!
    ) else (
        echo [!] Git pull skipped or encountered conflicts. Continuing with local version.
    )
) else (
    echo [*] Running in OFFLINE mode (No internet connection).
    echo [*] Offline SQLite database is fully functional.
)

echo.
echo [*] Initializing Southern Spoon POS Desktop Terminal...
echo.

:: Step 2: Check if standalone compiled executable exists in release folder
if exist "release\win-unpacked\Southern Spoon POS.exe" (
    echo [*] Starting compiled standalone binary...
    start "" "release\win-unpacked\Southern Spoon POS.exe"
    exit /b 0
)

if exist "release\Southern Spoon POS.exe" (
    echo [*] Starting release binary...
    start "" "release\Southern Spoon POS.exe"
    exit /b 0
)

:: Step 3: Launch via local Electron executable
if exist "node_modules\.bin\electron.cmd" (
    echo [*] Starting POS via local Electron engine...
    call "node_modules\.bin\electron.cmd" .
    if %errorlevel% equ 0 exit /b 0
)

:: Step 4: Fallback to npx electron
echo [*] Starting POS via npx electron...
call npx electron .
if %errorlevel% neq 0 (
    echo.
    echo ============================================================
    echo [ERROR] Electron encountered an issue starting up.
    echo Press any key to see options...
    echo ============================================================
    pause
)
