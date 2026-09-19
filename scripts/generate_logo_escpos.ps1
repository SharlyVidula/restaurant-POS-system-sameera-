Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "src/assets/thermal_logo.jpg").Path
$srcImage = [System.Drawing.Image]::FromFile($sourcePath)

# 1. Find exact content bounding box
$minY = $srcImage.Height
$maxY = 0
$minX = $srcImage.Width
$maxX = 0

$bmpScan = New-Object System.Drawing.Bitmap($srcImage)
for ($y = 0; $y -lt $bmpScan.Height; $y++) {
    for ($x = 0; $x -lt $bmpScan.Width; $x++) {
        $p = $bmpScan.GetPixel($x, $y)
        if ($p.R -lt 220 -or $p.G -lt 220 -or $p.B -lt 220) {
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
        }
    }
}
$bmpScan.Dispose()

# Tight crop dimensions with minimal 4px border
$cropX = [Math]::Max(0, $minX - 4)
$cropY = [Math]::Max(0, $minY - 4)
$cropW = [Math]::Min($srcImage.Width - $cropX, ($maxX - $minX) + 8)
$cropH = [Math]::Min($srcImage.Height - $cropY, ($maxY - $minY) + 8)

Write-Host "Cropped Region: X=$cropX, Y=$cropY, W=$cropW, H=$cropH"

# 2. Export tightly cropped PNG for UI & HTML printing
$croppedPng = New-Object System.Drawing.Bitmap($cropW, $cropH)
$gCrop = [System.Drawing.Graphics]::FromImage($croppedPng)
$gCrop.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gCrop.Clear([System.Drawing.Color]::White)
$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
$gCrop.DrawImage($srcImage, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()

$croppedPng.Save("src/assets/thermal_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$croppedPng.Save("public/thermal_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Exported tightly cropped src/assets/thermal_logo.png and public/thermal_logo.png"

# Helper function to generate 1-bit ESC/POS GS v 0 byte array from cropped image
function Generate-EscPosRaster([int]$totalWidthDots, [int]$targetLogoWidth) {
    $scale = $targetLogoWidth / $cropW
    $targetHeightDots = [int][Math]::Round($cropH * $scale)
    
    $bmp = New-Object System.Drawing.Bitmap($totalWidthDots, $targetHeightDots)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::White)
    
    $offsetX = [int](($totalWidthDots - $targetLogoWidth) / 2)
    $dest = New-Object System.Drawing.Rectangle($offsetX, 0, $targetLogoWidth, $targetHeightDots)
    $g.DrawImage($croppedPng, $dest, 0, 0, $cropW, $cropH, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $bytesWidth = [int]($totalWidthDots / 8)
    $rasterBytes = New-Object System.Collections.Generic.List[byte]
    
    # GS v 0 0 xL xH yL yH
    $rasterBytes.Add(0x1D)
    $rasterBytes.Add(0x76)
    $rasterBytes.Add(0x30)
    $rasterBytes.Add(0x00)
    $rasterBytes.Add([byte]($bytesWidth % 256))
    $rasterBytes.Add([byte]([math]::Floor($bytesWidth / 256)))
    $rasterBytes.Add([byte]($targetHeightDots % 256))
    $rasterBytes.Add([byte]([math]::Floor($targetHeightDots / 256)))
    
    # Thresholding: Pure black and white 1-bit pack
    for ($y = 0; $y -lt $targetHeightDots; $y++) {
        for ($byteCol = 0; $byteCol -lt $bytesWidth; $byteCol++) {
            $b = 0
            for ($bit = 0; $bit -lt 8; $bit++) {
                $x = ($byteCol * 8) + $bit
                $pixel = $bmp.GetPixel($x, $y)
                $lum = ($pixel.R * 0.299) + ($pixel.G * 0.587) + ($pixel.B * 0.114)
                if ($lum -lt 170) {
                    $b = $b -bor (1 -shl (7 - $bit))
                }
            }
            $rasterBytes.Add([byte]$b)
        }
    }
    
    $bmp.Dispose()
    return $rasterBytes.ToArray()
}

# 80mm: 576 dots wide total, logo 384 wide
Write-Host "Generating tight 80mm ESC/POS bitmap..."
$bytes80 = Generate-EscPosRaster -totalWidthDots 576 -targetLogoWidth 384
$base64_80 = [Convert]::ToBase64String($bytes80)

# 58mm: 384 dots wide total, logo 260 wide
Write-Host "Generating tight 58mm ESC/POS bitmap..."
$bytes58 = Generate-EscPosRaster -totalWidthDots 384 -targetLogoWidth 260
$base64_58 = [Convert]::ToBase64String($bytes58)

$croppedPng.Dispose()
$srcImage.Dispose()

# Write TypeScript export file
$tsContent = @"
// Auto-generated 1-bit ESC/POS Monochrome Raster Logo Data (GS v 0) - Tightly Cropped
// Zero head/bottom blank padding

function base64ToUint8Array(base64: string): number[] {
  const binaryString = atob(base64);
  const bytes = new Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const LOGO_80MM_BASE64 = "$base64_80";
const LOGO_58MM_BASE64 = "$base64_58";

let cached80: number[] | null = null;
let cached58: number[] | null = null;

export function getLogoEscPosBytes(width: 80 | 58 = 80): number[] {
  if (width === 80) {
    if (!cached80) {
      cached80 = base64ToUint8Array(LOGO_80MM_BASE64);
    }
    return cached80;
  } else {
    if (!cached58) {
      cached58 = base64ToUint8Array(LOGO_58MM_BASE64);
    }
    return cached58;
  }
}
"@

[System.IO.File]::WriteAllText((Resolve-Path "src/utils").Path + "\logoData.ts", $tsContent)
Write-Host "Successfully regenerated tightly-cropped src/utils/logoData.ts!"
