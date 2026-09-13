$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "Southern Spoon POS.lnk"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Priority 1: Native Electron binary in node_modules
$TargetExe = Join-Path -Path $ScriptDir -ChildPath "node_modules\electron\dist\electron.exe"
$Arguments = "."

# Priority 2: Standalone compiled binary in release
if (-not (Test-Path $TargetExe)) {
    $TargetExe = Join-Path -Path $ScriptDir -ChildPath "release\win-unpacked\Southern Spoon POS.exe"
    $Arguments = ""
}

# Priority 3: Batch launcher
if (-not (Test-Path $TargetExe)) {
    $TargetExe = Join-Path -Path $ScriptDir -ChildPath "Launch-SouthernSpoon-POS.bat"
    $Arguments = ""
}

$IconPath = Join-Path -Path $ScriptDir -ChildPath "public\logo.ico"
if (-not (Test-Path $IconPath)) {
    $IconPath = Join-Path -Path $ScriptDir -ChildPath "release\win-unpacked\logo.ico"
}

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetExe
$Shortcut.Arguments = $Arguments
$Shortcut.WorkingDirectory = $ScriptDir
$Shortcut.Description = "Southern Spoon POS Terminal - Authentic Sri Lankan Cuisine"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
}
$Shortcut.Save()

Write-Host "=========================================================" -ForegroundColor Green
Write-Host " Southern Spoon POS Desktop Shortcut Created Successfully!" -ForegroundColor Green
Write-Host " Location: $ShortcutPath" -ForegroundColor Cyan
Write-Host " Target:   $TargetExe $Arguments" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Green
