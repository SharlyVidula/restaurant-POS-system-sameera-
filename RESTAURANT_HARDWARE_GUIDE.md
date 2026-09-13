# SOUTHERN SPOON RESTAURANT POS
## Hardware Installation, Deployment & Handover Manual

**Brand**: Southern Spoon (Authentic Sri Lankan Cuisine • Est. Galle 2026)  
**Location**: Galle Fort Branch (42, Church Street, Galle Fort)  
**System**: Offline-First Desktop POS Terminal (ESC/POS 200 DPI Compliant)

---

## 1. Quick Start / Daily Launching
1. To start the system, double-click **`Launch-SouthernSpoon-POS.bat`** on the Desktop.
2. The launcher automatically checks the GitHub repository (`SharlyVidula/restaurant-POS-system-sameera-`) for any remote updates:
   - If internet is connected, it pulls new updates automatically.
   - If internet is offline, it immediately boots the local offline terminal without delay.
3. The branded **Southern Spoon** splash screen will appear, verify hardware and database readiness, and open the active sales register.

---

## 2. Hardware Wiring & Peripheral Connections

### A. Thermal Receipt Printer (80mm & 58mm ESC/POS)
Compatible models: Xprinter, Epson TM-T82/T88, Rongta, Bixolon, Sunmi, Posiflex, or any standard thermal printer.
1. **Power**: Connect the 24V power adapter and switch the printer ON.
2. **Data Connection**:
   - **USB**: Plug the USB cable into any rear USB 3.0 port on the POS terminal PC.
   - **LAN / Network**: Plug the RJ45 cable into the restaurant switch/router.
3. **Paper Loading**:
   - Insert an **80mm thermal paper roll** with the paper feeding from underneath.
   - Close the cover and press the **FEED** button to confirm a smooth test feed.
4. **Windows Printer Driver Configuration**:
   - Open **Windows Settings > Bluetooth & Devices > Printers & Scanners**.
   - Click on your thermal printer (e.g., `POS-80` or `EPSON TM-T82`).
   - Go to **Printing Preferences**:
     - **Paper Size**: Set to `80mm x 297mm` (or `80mm Roll`).
     - **Paper Cut**: Set `Partial Cut at End of Page`.
     - **Margins**: Set to `None` / `0mm`.
   - Set as **Default Printer**.

---

### B. Cash Drawer Connection (Automatic RJ11 Solenoid Kick)
Standard commercial cash drawers (12V or 24V) feature an RJ11/RJ12 connector (similar to a phone jack).
1. **Wiring**:
   - **DO NOT** attempt to plug the RJ11 cable into the PC's ethernet port.
   - Plug the RJ11 cable directly into the **DK (Drawer Kick)** port located on the back of the thermal receipt printer.
2. **How the Automatic Kick Works**:
   - When a cashier processes a **Cash payment**, the POS sends the ESC/POS kick pulse (`ESC p 0 25 250`) to the thermal printer.
   - The printer discharges a 24V signal through the DK port, automatically springing the cash drawer open.
3. **Manual Kick from Screen**:
   - Cashiers can also click the **"Open Drawer"** button in the top POS navigation header at any time to open the drawer for making change.

---

### C. Barcode Scanner (Handheld or Omnidirectional)
1. Plug the scanner into any USB port.
2. Standard USB POS scanners operate in **USB HID Keyboard Wedge** mode automatically.
3. No drivers are required—scanned codes appear instantly into active search fields.

---

### D. Touchscreen Display
1. Set the Windows display resolution to **1920 x 1080** (or **1366 x 768** for smaller POS touch monitors).
2. Set Windows Display Scaling to **100%** (or **125%** for larger high-DPI screens) to ensure touch targets on menu cards are easy to tap during busy service hours.

---

## 3. Daily Cashier Routine & Shift Management

### 🌅 Morning Opening Routine
1. Open the POS terminal using `Launch-SouthernSpoon-POS.bat`.
2. Verify the active cashier name and register number in the top right corner.
3. Count the morning cash float (e.g., Rs. 5,000 in small change and coins) and ensure it is placed in the cash drawer.

### 🍽 During Service (Order Flow)
- **Table / Dine-In**:
  1. Select **Dine-In** mode.
  2. Tap **Select Table** to assign the guest to their table (e.g., *Courtyard Table 3*).
  3. Tap food items to select variants (e.g., *Ceylon Wok Fried Rice -> Ceylon Chicken*, *Sri Lankan Kottu -> Cheese Chicken*).
  4. Tap **"Fire KOT (Kitchen)"** to print the kitchen dispatch ticket for the cooks.
  5. When the guest requests the bill before payment, tap **"Print Bill (Check)"** to present the proforma bill at the table.
  6. Tap **"Settle / Pay"**, choose Payment Method (**Cash**, **Card**, or **LankaQR**), enter cash tendered, and print the final **Customer Receipt**.
- **Takeaway / Delivery**:
  1. Select **Takeaway** or **Delivery** mode.
  2. Add customer name & mobile number.
  3. Complete payment and issue the customer receipt slip.

### 📊 Mid-Shift Audit (X-Report)
- Managers can click **"X-Report"** in the top navigation bar at any time to review sales by category and payment methods without closing the shift.

### 🌙 Evening Closing Routine (Z-Report)
1. At the end of the business day, click the red **"Z-Report"** button in the header.
2. Count all physical cash bills and coins in the cash drawer.
3. Enter the counted cash into the physical count field.
4. The system automatically computes:
   - Expected drawer cash
   - Physical counted cash
   - Over / Short discrepancy variance
5. Click **"Confirm & Lock Shift"** to print the official **Z-Report Closure Slip**.

---

## 4. Emergency & Offline Support
- **100% Offline Operation**: The system runs locally using SQLite storage. If the restaurant internet or Wi-Fi drops, billing, printing, kitchen tickets, and cash drawer kicks continue functioning without interruption.
- **Data Persistence**: All past orders, sales history, shift sessions, and drawer logs are stored securely in local database storage and can be recalled anytime via the **Orders** button.
