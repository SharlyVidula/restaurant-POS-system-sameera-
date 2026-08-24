# Galle Fortress Breeze - Offline-First Restaurant POS System

An offline-first, high-reliability Point of Sale (POS) desktop application tailored for mid-range Sri Lankan restaurants in Galle, designed with multi-branch franchise architecture.

## 🌟 Core Features

- **🍛 Authentic Sri Lankan Menu Architecture**:
  - Rice & Curry Lunch Specials (Veggie, Chicken, Freshwater Fish, Galle Tuna Ambulthiyal, Pork)
  - Wok Station: Fried Rice & Kottu with portion sizing and add-ons (Extra Cheese, Extra Curry Gravy)
  - Short Eats & Breads with instant quick-add numeric steppers (`+1`, `+2`, `+5`)
  - Fresh Juices with sugar levels (None/Less/Normal) & ice modifiers
  - Bottled soft drinks (Elephant Ginger Beer, Soda, Coke, Sprite)

- **🖨️ ESC/POS Thermal Printing & Hardware Engine**:
  - 80mm & 58mm customer receipts with Galle restaurant header & WiFi info
  - Kitchen Order Ticket (KOT) with station routing (Wok Station / Curry Counter / Short Eats / Beverage Bar)
  - 24V RJ11 Solenoid cash drawer kick pulse (`ESC p 0 25 250`)
  - Live on-screen thermal paper emulator & raw ESC/POS Hex Dump inspector

- **💳 Payment & Settlement Assistant**:
  - Cash payment with quick Sri Lankan Rupee denominations (`+Rs. 5000`, `+Rs. 2000`, `+Rs. 1000`, `+Rs. 500`, `+Rs. 100`, `Exact Amount`) & change calculator
  - Card payment with terminal authorization reference
  - Dynamic LankaQR / Bank App digital scan-and-pay

- **🪑 3-Zone Dining Floor Management**:
  - Galle Fort Courtyard, Main Dining Hall, AC Lounge
  - Live table status tracking (Vacant, Occupied with running timer & bill, Billed)

- **📊 Financial Reconciliation & Audit**:
  - **X-Report**: Mid-shift financial snapshot without closing register
  - **Z-Report**: End-of-Day shift closure with physical cash count declaration, discrepancy calculation, and legal Z-Slip generation

- **🗄️ SQLite Local Data Persistence**:
  - Full relational schema (`categories`, `menu_items`, `item_variants`, `dining_tables`, `orders`, `order_items`, `shifts`, `cash_drawer_logs`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
git clone https://github.com/SharlyVidula/restaurant-POS-system-sameera-.git
cd restaurant-POS-system-sameera-
npm install
```

### Run Web Development Mode
```bash
npm run dev
```

### Run Electron Desktop Mode
```bash
npm run electron:dev
```

### Build Production Bundle
```bash
npm run build
```
