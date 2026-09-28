# 📊 Google Sheets Live Itemized Sales Setup Guide

This guide explains how to connect your **Southern Spoon POS** to Google Sheets so that each dish portion sold is recorded in a table with:
- **Date and Time**
- **Item Name with Portion Type** (e.g. *Seafood Fried Rice (Full)*, *Chicken Kottu (Half)*)
- **Quantity**
- **Amount (LKR)**
- **Sum of Amount (LKR)** (automatic cumulative running total formula)

---

## ⚡ Quick 1-Minute Setup in Google Sheets

### Step 1: Open Apps Script in Your Google Sheet
1. Open your Google Sheet (**"Southernspoon"**).
2. In the top navigation bar, click:  
   **Extensions** ➔ **Apps Script**

### Step 2: Paste the Apps Script Code
1. In the Apps Script code editor, delete any existing code.
2. Open [`scripts/google_apps_script.js`](scripts/google_apps_script.js) (or click the **"Copy Google Apps Script"** button in the POS **Reports > Remote Cloud Monitoring** tab) and copy all contents.
3. Paste the code into the Apps Script editor.
4. Click the 💾 **Save** icon (Ctrl + S).

### Step 3: Deploy the Web App
1. At the top right, click **Deploy** ➔ **Manage deployments**.
2. Click the ✏️ **Edit** icon next to your Active deployment.
3. Under **Version**, select **New version**.
4. Make sure:
   - **Execute as:** `Me (your email)`
   - **Who has access:** `Anyone`
5. Click **Deploy**.
6. (If prompted, click *Authorize access* and approve the Google permissions).

---

## 📋 Target Table Generated in Google Sheets

Once deployed, whenever an order is settled or whenever you click **Sync Cloud Now** in POS, the script will automatically create/update the sheet tab **`Itemized_Sales`**:

| Col A: Date and Time | Col B: Item Name with Portion Type | Col C: Quantity | Col D: Amount (LKR) | Col E: Sum of Amount (LKR) | Col F: Order # | Col G: Table / Channel | Col H: Payment Method |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 28/09/2026, 14:45:10 | Seafood Fried Rice (Full) | 2 | 2,400.00 | 2,400.00 | GAL-0105 | Table T-01 | CASH |
| 28/09/2026, 14:45:10 | Fresh Lime Juice (Normal Sugar) | 1 | 350.00 | 2,750.00 | GAL-0105 | Table T-01 | CASH |
| 28/09/2026, 15:10:05 | Chicken Kottu (Half) | 1 | 950.00 | 3,700.00 | GAL-0106 | Takeaway | LANKAQR |

> **Note on "Sum of Amount"**:  
> Column E uses the formula `=SUM(D$2:D[row])` which automatically calculates the cumulative running sum of all sales up to that row!

---

## 🖥️ Viewing & Exporting in POS Directly

In the POS application:
1. Click **Reports** in the top navigation bar.
2. Under the **Daily Sales Report** tab, scroll to the **Itemized Dish & Portion Sales Ledger** table:
   - Filter items with the instant search box.
   - View live running totals.
   - Click **"Export CSV (Sheets)"** to download the exact CSV table matching these 5 columns directly to your computer.
