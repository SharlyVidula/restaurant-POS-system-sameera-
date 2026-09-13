@echo off
title Southern Spoon POS - Terminal Launcher
color 0E

echo ============================================================
echo           SOUTHERN SPOON RESTAURANT POS TERMINAL
echo          Authentic Sri Lankan Cuisine - Galle Fort
echo ============================================================
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
    start "" "release\win-unpacked\Southern Spoon POS.exe"
    exit
)

if exist "release\Southern Spoon POS.exe" (
    start "" "release\Southern Spoon POS.exe"
    exit
)

:: Fallback: Start via npm electron:dev if release binary is not yet compiled
npm run electron:dev
