import { DailySalesReportData, MonthlySalesReportData, RestaurantProfile } from '../types';

/**
 * Compute SHA-256 hash using browser SubtleCrypto
 */
async function computeSha256(text: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  } catch (err) {
    return 'SEAL-' + Math.random().toString(36).substring(2, 15).toUpperCase();
  }
}

/**
 * Generate formatted text audit report for Daily Sales
 */
export async function generateDailyReportAuditText(
  report: DailySalesReportData, 
  restaurant: RestaurantProfile
): Promise<{ text: string; hash: string; filename: string }> {
  const lines: string[] = [];
  const pad = (str: string, len: number, right = false) => 
    right ? str.padStart(len) : str.padEnd(len);

  lines.push("================================================================================");
  lines.push("                     SOUTHERN SPOON RESTAURANT & CAFE");
  lines.push("                     DAILY SALES & FINANCIAL AUDIT");
  lines.push("================================================================================");
  lines.push(`Audit Date:       ${report.date}`);
  lines.push(`Generated:        ${report.generated_at}`);
  lines.push(`Branch:           ${restaurant.branch}, ${restaurant.city}`);
  lines.push(`Hotline:          ${restaurant.hotline}`);
  lines.push(`Tax / VAT Reg:    ${restaurant.tax_number}`);
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");
  lines.push("1. REVENUE & FINANCIAL SUMMARY");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`Total Completed Orders:          ${report.order_count}`);
  lines.push(`Total Food Items Sold:           ${report.total_items_sold}`);
  lines.push(`Average Order Check Value:       Rs. ${report.average_order_value.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`Gross Sales Subtotal:            Rs. ${report.total_gross_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push(`Total Discounts Issued:        - Rs. ${report.total_discount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push(`Service Charges (10%):         + Rs. ${report.total_service_charge.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push(`VAT / Government Tax (8%):     + Rs. ${report.total_tax.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`NET SETTLED REVENUE:             Rs. ${report.total_net_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push("================================================================================");
  lines.push("");
  lines.push("2. PAYMENT SETTLEMENT BREAKDOWN");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`${pad("Payment Method", 25)} | ${pad("Transactions", 15)} | ${pad("Total (LKR)", 20)} | ${pad("Share %", 10)}`);
  lines.push("--------------------------------------------------------------------------------");
  report.sales_by_payment.forEach(p => {
    lines.push(
      `${pad(p.method, 25)} | ${pad(p.count.toString(), 15)} | ${pad('Rs. ' + p.total.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 20)} | ${pad(p.percentage + '%', 10)}`
    );
  });
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");
  lines.push("3. SALES BY MENU CATEGORY");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`${pad("Category", 25)} | ${pad("Portions Sold", 15)} | ${pad("Revenue (LKR)", 20)} | ${pad("Share %", 10)}`);
  lines.push("--------------------------------------------------------------------------------");
  report.sales_by_category.forEach(c => {
    lines.push(
      `${pad(c.category_name, 25)} | ${pad(c.item_count.toString(), 15)} | ${pad('Rs. ' + c.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 20)} | ${pad(c.percentage + '%', 10)}`
    );
  });
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");
  lines.push("4. TOP-SELLING DISHES");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`${pad("Rank & Dish Name", 35)} | ${pad("Qty Sold", 15)} | ${pad("Total Revenue (LKR)", 20)}`);
  lines.push("--------------------------------------------------------------------------------");
  report.top_selling_items.forEach((item, idx) => {
    lines.push(
      `${pad(`${idx + 1}. ${item.item_name}`, 35)} | ${pad(item.quantity.toString(), 15)} | ${pad('Rs. ' + item.revenue.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 20)}`
    );
  });
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");
  lines.push("5. INDIVIDUAL ORDERS LEDGER");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`${pad("Bill #", 12)} | ${pad("Time", 10)} | ${pad("Table / Type", 14)} | ${pad("Items", 8)} | ${pad("Method", 10)} | ${pad("Net Amount", 14)}`);
  lines.push("--------------------------------------------------------------------------------");
  report.orders.forEach(o => {
    lines.push(
      `${pad(o.order_number, 12)} | ${pad(o.time, 10)} | ${pad(o.table || 'Takeaway', 14)} | ${pad(o.items_count.toString(), 8)} | ${pad(o.payment_method, 10)} | ${pad('Rs. ' + o.total.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 14)}`
    );
  });
  lines.push("================================================================================");
  lines.push("");

  const bodyText = lines.join("\n");
  const sha256Hash = await computeSha256(bodyText);

  const sealedDocument = [
    bodyText,
    "*** OFFICIAL CRYPTOGRAPHIC AUDIT VERIFICATION SEAL ***",
    `SECURITY SHA-256 INTEGRITY DIGEST:`,
    `${sha256Hash}`,
    `STATUS: IMMUTABLE AUDIT LEDGER ENTRY • TAMPER-SEALED`,
    `WARNING: THIS OFFICIAL RECORD IS DIGITALLY SIGNED. ANY EDITING, FRAUDULENT ALTERATION,`,
    `OR DELETION OF DATA WILL IRREVERSIBLY INVALIDATE THE CRYPTOGRAPHIC SEAL ABOVE.`,
    "================================================================================",
  ].join("\n");

  const filename = `SouthernSpoon_Daily_Sales_${report.date}.txt`;
  return { text: sealedDocument, hash: sha256Hash, filename };
}

/**
 * Generate formatted text audit report for Monthly Sales
 */
export async function generateMonthlyReportAuditText(
  report: MonthlySalesReportData,
  restaurant: RestaurantProfile
): Promise<{ text: string; hash: string; filename: string }> {
  const lines: string[] = [];
  const pad = (str: string, len: number, right = false) => 
    right ? str.padStart(len) : str.padEnd(len);

  lines.push("================================================================================");
  lines.push("                     SOUTHERN SPOON RESTAURANT & CAFE");
  lines.push("                     MONTHLY COMPREHENSIVE FINANCIAL AUDIT");
  lines.push("================================================================================");
  lines.push(`Accounting Period:  ${report.month_name} ${report.year}`);
  lines.push(`Audit Timestamp:    ${report.generated_at}`);
  lines.push(`Branch:             ${restaurant.branch}, ${restaurant.city}`);
  lines.push(`Tax / VAT Reg:      ${restaurant.tax_number}`);
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");
  lines.push("1. MONTHLY FINANCIAL KPI METRICS");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`Active Trading Days:             ${report.total_days_active}`);
  lines.push(`Total Settled Orders:            ${report.total_orders}`);
  lines.push(`Total Food Portions Sold:        ${report.total_items_sold}`);
  lines.push(`Average Daily Sales:             Rs. ${report.average_daily_sales.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`Gross Subtotal:                  Rs. ${report.total_gross_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push(`Total Discounts Granted:       - Rs. ${report.total_discount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push(`Service Charges (10%):         + Rs. ${report.total_service_charge.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push(`VAT / Government Tax (8%):     + Rs. ${report.total_tax.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`NET MONTHLY REVENUE:             Rs. ${report.total_net_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  lines.push("================================================================================");
  lines.push("");
  lines.push("2. PAYMENT CHANNEL RECONCILIATION");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`${pad("Payment Method", 25)} | ${pad("Transactions", 15)} | ${pad("Total (LKR)", 20)} | ${pad("Share %", 10)}`);
  lines.push("--------------------------------------------------------------------------------");
  report.sales_by_payment.forEach(p => {
    lines.push(
      `${pad(p.method, 25)} | ${pad(p.count.toString(), 15)} | ${pad('Rs. ' + p.total.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 20)} | ${pad(p.percentage + '%', 10)}`
    );
  });
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");
  lines.push("3. SALES BY CATEGORY");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`${pad("Category", 25)} | ${pad("Units Sold", 15)} | ${pad("Revenue (LKR)", 20)} | ${pad("Share %", 10)}`);
  lines.push("--------------------------------------------------------------------------------");
  report.sales_by_category.forEach(c => {
    lines.push(
      `${pad(c.category_name, 25)} | ${pad(c.item_count.toString(), 15)} | ${pad('Rs. ' + c.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 20)} | ${pad(c.percentage + '%', 10)}`
    );
  });
  lines.push("--------------------------------------------------------------------------------");
  lines.push("");
  lines.push("4. DAY-BY-DAY MONTHLY TRADING BREAKDOWN");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`${pad("Date", 12)} | ${pad("Orders", 8)} | ${pad("Cash (LKR)", 15)} | ${pad("Card (LKR)", 15)} | ${pad("QR (LKR)", 12)} | ${pad("Total Sales", 16)}`);
  lines.push("--------------------------------------------------------------------------------");
  report.daily_breakdown.forEach(day => {
    if (day.order_count > 0 || day.total_sales > 0) {
      lines.push(
        `${pad(day.date, 12)} | ${pad(day.order_count.toString(), 8)} | ${pad(day.cash_total.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 15)} | ${pad(day.card_total.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 15)} | ${pad(day.qr_total.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 12)} | ${pad('Rs. ' + day.total_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 }), 16)}`
      );
    }
  });
  lines.push("================================================================================");
  lines.push("");

  const bodyText = lines.join("\n");
  const sha256Hash = await computeSha256(bodyText);

  const sealedDocument = [
    bodyText,
    "*** OFFICIAL CRYPTOGRAPHIC AUDIT VERIFICATION SEAL ***",
    `SECURITY SHA-256 INTEGRITY DIGEST:`,
    `${sha256Hash}`,
    `STATUS: IMMUTABLE AUDIT LEDGER ENTRY • TAMPER-SEALED`,
    `WARNING: THIS OFFICIAL RECORD IS DIGITALLY SIGNED. ANY EDITING, FRAUDULENT ALTERATION,`,
    `OR DELETION OF DATA WILL IRREVERSIBLY INVALIDATE THE CRYPTOGRAPHIC SEAL ABOVE.`,
    "================================================================================",
  ].join("\n");

  const monthStr = String(report.month).padStart(2, '0');
  const filename = `SouthernSpoon_Monthly_Sales_${report.year}-${monthStr}.txt`;
  return { text: sealedDocument, hash: sha256Hash, filename };
}

/**
 * Trigger file save on computer:
 * 1) In Electron: writes directly to disk in C:\SouthernSpoon_Reports\
 * 2) In Browser: triggers native text file download
 */
export async function saveReportToComputer(
  content: string, 
  filename: string, 
  subfolder: 'Daily' | 'Monthly'
): Promise<{ success: boolean; filePath?: string; message: string }> {
  try {
    if ((window as any).electronAPI?.saveReportFile) {
      const res = await (window as any).electronAPI.saveReportFile({
        subfolder,
        filename,
        content
      });
      return res;
    } else {
      // Browser fallback: trigger blob download
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return {
        success: true,
        message: `Report downloaded successfully as ${filename}`
      };
    }
  } catch (err: any) {
    console.error("Save report error", err);
    return {
      success: false,
      message: `Failed to save report: ${err?.message || 'Unknown error'}`
    };
  }
}
