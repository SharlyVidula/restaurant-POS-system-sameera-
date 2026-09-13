Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pngPath = Join-Path $scriptDir "public\logo.png"
$icoPath = Join-Path $scriptDir "public\logo.ico"
$buildIcoPath = Join-Path $scriptDir "build\icon.ico"

if (-not (Test-Path $pngPath)) {
    Write-Error "Cannot find $pngPath"
    exit 1
}

$bmp = [System.Drawing.Bitmap]::FromFile($pngPath)
# Create a square 256x256 bitmap for optimal icon clarity
$squareBmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($squareBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($bmp, 0, 0, 256, 256)
$g.Dispose()

$hIcon = $squareBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

# Also save to build/icon.ico
if (-not (Test-Path (Split-Path $buildIcoPath))) {
    New-Item -ItemType Directory -Path (Split-Path $buildIcoPath) -Force | Out-Null
}
Copy-Item $icoPath $buildIcoPath -Force

$bmp.Dispose()
$squareBmp.Dispose()

Write-Host "Created $icoPath successfully!" -ForegroundColor Green
Write-Host "Created $buildIcoPath successfully!" -ForegroundColor Green
