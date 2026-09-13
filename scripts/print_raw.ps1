# Raw ESC/POS Thermal Receipt Dispatcher via Windows WinSpool API
param(
    [string]$HexDump = "",
    [string]$PrinterName = ""
)

if (-not $PrinterName) {
    $defaultPrinter = Get-CimInstance Win32_Printer | Where-Object { $_.Default -eq $true } | Select-Object -First 1
    if ($defaultPrinter) {
        $PrinterName = $defaultPrinter.Name
    } else {
        $PrinterName = "Xprinter XP-80"
    }
}

Write-Host "Target Printer: $PrinterName"

if (-not $HexDump) {
    # Test slip: Initialize + Centered Bold text + Cut
    # 1B 40 (Init), 1B 61 01 (Center), 1B 21 38 (Double height/width), "SOUTHERN SPOON", 0A, 1B 21 00 (Normal), "Test Print OK", 0A 0A 0A, 1D 56 00 (Cut)
    $HexDump = "1B 40 1B 61 01 1B 21 30 53 4F 55 54 48 45 52 4E 20 53 50 4F 4F 4E 0A 1B 21 00 4C 61 62 75 64 75 77 61 2C 20 47 61 6C 6C 65 0A 54 65 6C 3A 20 30 37 30 37 35 35 35 38 35 35 0A 0A 54 45 53 54 20 53 4C 49 50 20 4F 4B 21 0A 0A 0A 0A 1D 56 00"
}

# Clean hex string (remove newlines and spaces)
$cleanHex = $HexDump -replace '\s+', ''

if ($cleanHex.Length % 2 -ne 0) {
    Write-Host "Invalid hex length" -ForegroundColor Red
    exit 1
}

# Convert hex string to byte array
$byteCount = $cleanHex.Length / 2
$bytes = [byte[]]::new($byteCount)
for ($i = 0; $i -lt $byteCount; $i++) {
    $bytes[$i] = [Convert]::ToByte($cleanHex.Substring($i * 2, 2), 16)
}

$code = @'
using System;
using System.IO;
using System.Runtime.InteropServices;

public class RawPrinterHelper {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }
    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);

    public static bool SendBytesToPrinter(string szPrinterName, byte[] bytes) {
        IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
        Marshal.Copy(bytes, 0, pUnmanagedBytes, bytes.Length);
        IntPtr hPrinter = IntPtr.Zero;
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "ThermalReceipt";
        di.pDataType = "RAW";
        bool bSuccess = false;
        if (OpenPrinter(szPrinterName.Normalize(), out hPrinter, IntPtr.Zero)) {
            if (StartDocPrinter(hPrinter, 1, di)) {
                if (StartPagePrinter(hPrinter)) {
                    int dwWritten = 0;
                    bSuccess = WritePrinter(hPrinter, pUnmanagedBytes, bytes.Length, out dwWritten);
                    EndPagePrinter(hPrinter);
                }
                EndDocPrinter(hPrinter);
            }
            ClosePrinter(hPrinter);
        }
        Marshal.FreeCoTaskMem(pUnmanagedBytes);
        return bSuccess;
    }
}
'@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

$success = [RawPrinterHelper]::SendBytesToPrinter($PrinterName, $bytes)
if ($success) {
    Write-Host "SUCCESS: ESC/POS receipt ($($bytes.Length) bytes) sent directly to $PrinterName!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "FAILED: Could not send raw ESC/POS bytes to $PrinterName" -ForegroundColor Red
    exit 1
}
