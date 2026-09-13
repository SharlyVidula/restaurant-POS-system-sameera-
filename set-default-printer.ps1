$printer = Get-CimInstance Win32_Printer | Where-Object Name -eq 'Xprinter XP-20B'
if ($printer) {
    Invoke-CimMethod -InputObject $printer -MethodName SetDefaultPrinter | Out-Null
    Write-Host "Set Xprinter XP-20B as Default Printer: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "Printer not found" -ForegroundColor Red
}
