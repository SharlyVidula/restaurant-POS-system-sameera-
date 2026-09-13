$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "Southern Spoon POS.lnk"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetExe = Join-Path -Path $ScriptDir -ChildPath "release\win-unpacked\Southern Spoon POS.exe"
$IconPath = Join-Path -Path $ScriptDir -ChildPath "public\logo.ico"
if (-not (Test-Path $IconPath)) {
    $IconPath = Join-Path -Path $ScriptDir -ChildPath "release\win-unpacked\logo.ico"
}

if (-not (Test-Path $TargetExe)) {
    # If release folder is not compiled yet, launch via launcher script
    $TargetExe = Join-Path -Path $ScriptDir -ChildPath "Launch-SouthernSpoon-POS.bat"
}

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetExe
$Shortcut.WorkingDirectory = Split-Path -Parent $TargetExe
$Shortcut.Description = "Southern Spoon POS Terminal - Authentic Sri Lankan Cuisine"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
}
$Shortcut.Save()

Write-Host "=========================================================" -ForegroundColor Green
Write-Host " Southern Spoon POS Desktop Shortcut Created Successfully!" -ForegroundColor Green
Write-Host " Location: $ShortcutPath" -ForegroundColor Cyan
Write-Host " Target:   $TargetExe" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Green
