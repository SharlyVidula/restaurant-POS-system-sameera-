@echo off
title Test RJ11 Cash Drawer - Southern Spoon POS
cd /d "%~dp0"

echo ===================================================
echo   SOUTHERN SPOON POS - RJ11 CASH DRAWER TEST
echo ===================================================
echo.
echo [CHECK 1: PHYSICAL KEY LOCK]
echo - Check the front lock on your cash drawer.
echo - Key must be in VERTICAL (|) position (Unlocked/Auto).
echo - If it is in Horizontal (-) position, it is locked deadbolt!
echo.
echo [CHECK 2: RJ11 CABLE]
echo - Ensure the RJ11 cable from the drawer is plugged
echo   into the back of the thermal printer (DK port).
echo.
echo [SENDING 24V SOLENOID PULSE...]
echo.

powershell -ExecutionPolicy Bypass -File "scripts\kick_drawer.ps1"

echo.
echo ===================================================
echo If the drawer popped open, it is working perfectly!
echo Press any key to close this test window.
echo ===================================================
pause >nul
