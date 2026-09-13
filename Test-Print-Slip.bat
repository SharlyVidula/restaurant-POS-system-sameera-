@echo off
title Test Thermal Printer - Southern Spoon POS
cd /d "%~dp0"

echo ===================================================
echo   SOUTHERN SPOON POS - THERMAL PRINTER TEST
echo ===================================================
echo.
echo Target: Xprinter XP-80 (80mm ESC/POS)
echo.
echo [SENDING TEST RECEIPT SLIP...]
echo.

powershell -ExecutionPolicy Bypass -File "scripts\print_raw.ps1"

echo.
echo ===================================================
echo If a receipt printed with "SOUTHERN SPOON",
echo your thermal printer is working 100%!
echo Press any key to close.
echo ===================================================
pause >nul
