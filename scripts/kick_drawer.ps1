# Kick RJ11 Cash Drawer via Windows WinSpool Raw Printer Helper
param(
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
        di.pDocName = "CashDrawerKick";
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

# Standard ESC/POS Cash Drawer Kick bytes:
# 1. ESC p 0 25 250 (Pin 2 kick: 27, 112, 0, 25, 250)
# 2. ESC p 1 25 250 (Pin 5 kick: 27, 112, 1, 25, 250)
# 3. DLE DC4 1 0 5 (Realtime kick: 16, 20, 1, 0, 5)
$drawerKickBytes = [byte[]]@(27, 112, 0, 25, 250, 27, 112, 1, 25, 250, 16, 20, 1, 0, 5)

$success = [RawPrinterHelper]::SendBytesToPrinter($PrinterName, $drawerKickBytes)
if ($success) {
    Write-Host "SUCCESS: Raw 24V Solenoid Kick Pulse sent to $PrinterName!" -ForegroundColor Green
} else {
    Write-Host "FAILED to send raw bytes to $PrinterName" -ForegroundColor Red
}
