Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "src/assets/thermal_logo.jpg").Path
$srcImage = [System.Drawing.Image]::FromFile($sourcePath)

# 1. Save standard clean PNG for UI & HTML printing
$pngBmp = New-Object System.Drawing.Bitmap(512, 512)
$gPng = [System.Drawing.Graphics]::FromImage($pngBmp)
$gPng.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gPng.Clear([System.Drawing.Color]::White)
$gPng.DrawImage($srcImage, 0, 0, 512, 512)
$pngBmp.Save("src/assets/thermal_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$pngBmp.Save("public/thermal_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gPng.Dispose()
$pngBmp.Dispose()
Write-Host "Exported src/assets/thermal_logo.png and public/thermal_logo.png"

# Helper function to generate 1-bit ESC/POS GS v 0 byte array
function Generate-EscPosRaster([int]$totalWidthDots, [int]$logoSizeDots, [int]$heightDots) {
    $bmp = New-Object System.Drawing.Bitmap($totalWidthDots, $heightDots)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::White)
    
    $offsetX = [int](($totalWidthDots - $logoSizeDots) / 2)
    $g.DrawImage($srcImage, $offsetX, 0, $logoSizeDots, $heightDots)
    
    $bytesWidth = [int]($totalWidthDots / 8)
    $rasterBytes = New-Object System.Collections.Generic.List[byte]
    
    # GS v 0 0 xL xH yL yH
    $rasterBytes.Add(0x1D)
    $rasterBytes.Add(0x76)
    $rasterBytes.Add(0x30)
    $rasterBytes.Add(0x00)
    $rasterBytes.Add([byte]($bytesWidth % 256))
    $rasterBytes.Add([byte]([math]::Floor($bytesWidth / 256)))
    $rasterBytes.Add([byte]($heightDots % 256))
    $rasterBytes.Add([byte]([math]::Floor($heightDots / 256)))
    
    # Thresholding: Pure black and white 1-bit pack
    for ($y = 0; $y -lt $heightDots; $y++) {
        for ($byteCol = 0; $byteCol -lt $bytesWidth; $byteCol++) {
            $b = 0
            for ($bit = 0; $bit -lt 8; $bit++) {
                $x = ($byteCol * 8) + $bit
                $pixel = $bmp.GetPixel($x, $y)
                # Calculate luminance
                $lum = ($pixel.R * 0.299) + ($pixel.G * 0.587) + ($pixel.B * 0.114)
                # In monochrome line-art, dark lines are black (1 in ESC/POS), background is white (0 in ESC/POS)
                if ($lum -lt 170) {
                    $b = $b -bor (1 -shl (7 - $bit))
                }
            }
            $rasterBytes.Add([byte]$b)
        }
    }
    
    $g.Dispose()
    $bmp.Dispose()
    return $rasterBytes.ToArray()
}

# 80mm: 576 dots wide total, logo 384x384 centered
Write-Host "Generating 80mm ESC/POS bitmap..."
$bytes80 = Generate-EscPosRaster -totalWidthDots 576 -logoSizeDots 384 -heightDots 384
$base64_80 = [Convert]::ToBase64String($bytes80)

# 58mm: 384 dots wide total, logo 256x256 centered
Write-Host "Generating 58mm ESC/POS bitmap..."
$bytes58 = Generate-EscPosRaster -totalWidthDots 384 -logoSizeDots 256 -heightDots 256
$base64_58 = [Convert]::ToBase64String($bytes58)

$srcImage.Dispose()

# Write TypeScript export file
$tsContent = @"
// Auto-generated 1-bit ESC/POS Monochrome Raster Logo Data (GS v 0)
// Generated from official Southern Spoon monochrome logo

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
Write-Host "Successfully generated src/utils/logoData.ts!"
