import { Order, OrderItem, RestaurantProfile, XReportData, ZReportData, CashTransaction } from '../types';

export const ESC = 0x1B;
export const GS = 0x1D;
export const LF = 0x0A;

export class EscPosBuilder {
  private buffer: number[] = [];
  private width: 80 | 58 = 80;
  private maxChars: number = 42; // standard 80mm = 42-48 cols, 58mm = 32 cols

  constructor(width: 80 | 58 = 80) {
    this.width = width;
    this.maxChars = width === 80 ? 42 : 32;
    this.init();
  }

  init(): this {
    this.buffer.push(ESC, 0x40); // ESC @
    return this;
  }

  alignLeft(): this {
    this.buffer.push(ESC, 0x61, 0x00);
    return this;
  }

  alignCenter(): this {
    this.buffer.push(ESC, 0x61, 0x01);
    return this;
  }

  alignRight(): this {
    this.buffer.push(ESC, 0x61, 0x02);
    return this;
  }

  bold(enable: boolean = true): this {
    this.buffer.push(ESC, 0x45, enable ? 0x01 : 0x00);
    return this;
  }

  doubleSize(enable: boolean = true): this {
    this.buffer.push(GS, 0x21, enable ? 0x11 : 0x00);
    return this;
  }

  doubleHeight(enable: boolean = true): this {
    this.buffer.push(GS, 0x21, enable ? 0x01 : 0x00);
    return this;
  }

  doubleWidth(enable: boolean = true): this {
    this.buffer.push(GS, 0x21, enable ? 0x10 : 0x00);
    return this;
  }

  invert(enable: boolean = true): this {
    this.buffer.push(GS, 0x42, enable ? 0x01 : 0x00);
    return this;
  }

  text(str: string): this {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code <= 0xFF) {
        this.buffer.push(code);
      } else {
        // Fallback for special chars
        this.buffer.push(0x3F); // '?'
      }
    }
    return this;
  }

  newLine(count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(LF);
    }
    return this;
  }

  line(char: string = '-'): this {
    const divider = char.repeat(this.maxChars);
    this.text(divider).newLine();
    return this;
  }

  doubleLine(): this {
    return this.line('=');
  }

  twoColumn(left: string, right: string): this {
    const spaceCount = this.maxChars - left.length - right.length;
    if (spaceCount > 0) {
      const formatted = left + ' '.repeat(spaceCount) + right;
      this.text(formatted).newLine();
    } else {
      // If text overflows, print left on one line, right on next
      this.text(left).newLine();
      const pad = ' '.repeat(Math.max(0, this.maxChars - right.length));
      this.text(pad + right).newLine();
    }
    return this;
  }

  threeColumn(col1: string, col2: string, col3: string, col1Width: number = 22, col2Width: number = 6): this {
    const c1 = col1.padEnd(col1Width).slice(0, col1Width);
    const c2 = col2.padStart(col2Width).slice(0, col2Width);
    const rem = this.maxChars - col1Width - col2Width;
    const c3 = col3.padStart(rem).slice(0, rem);
    this.text(c1 + c2 + c3).newLine();
    return this;
  }

  cut(partial: boolean = false): this {
    this.feedLines(3);
    this.buffer.push(GS, 0x56, partial ? 0x01 : 0x00);
    return this;
  }

  feedLines(n: number = 3): this {
    this.buffer.push(ESC, 0x64, n);
    return this;
  }

  kickCashDrawer(): this {
    // ESC p 0 25 250 (Pin 2 standard RJ11 24V cash drawer kick pulse)
    this.buffer.push(ESC, 0x70, 0x00, 0x19, 0xFA);
    // ESC p 1 25 250 (Pin 5 alternate RJ11 cash drawer kick pulse)
    this.buffer.push(ESC, 0x70, 0x01, 0x19, 0xFA);
    // DLE DC4 realtime kick pulse
    this.buffer.push(0x10, 0x14, 0x01, 0x00, 0x05);
    return this;
  }

  getBuffer(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  getHexDump(): string {
    return Array.from(this.buffer)
      .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
      .reduce((acc, curr, idx) => {
        const space = (idx + 1) % 16 === 0 ? '\n' : (idx + 1) % 8 === 0 ? '  ' : ' ';
        return acc + curr + space;
      }, '');
  }
}

/**
 * Generate binary ESC/POS payload for Customer Receipt
 */
export function buildCustomerReceiptEscPos(
  order: Order,
  restaurant: RestaurantProfile,
  width: 80 | 58 = 80
): EscPosBuilder {
  const printer = new EscPosBuilder(width);

  // Header
  printer.alignCenter()
    .bold(true)
    .doubleSize(true)
    .text(restaurant.name)
    .newLine()
    .doubleSize(false);

  if (restaurant.branch && 
      restaurant.branch.toLowerCase().trim() !== restaurant.address.toLowerCase().trim() &&
      !restaurant.address.toLowerCase().includes(restaurant.branch.toLowerCase().trim())) {
    printer.text(restaurant.branch).newLine();
  }

  printer.bold(false)
    .text(restaurant.address)
    .newLine()
    .text(restaurant.city)
    .newLine()
    .text(`Hotline: ${restaurant.hotline}`)
    .newLine()
    .text(restaurant.tax_number)
    .newLine()
    .doubleLine();

  // Order Details
  printer.alignLeft()
    .twoColumn(`Order: #${order.order_number}`, `Type: ${order.order_type.toUpperCase()}`)
    .twoColumn(`Date: ${order.created_at}`, order.table_number ? `Table: ${order.table_number}` : 'Takeaway')
    .twoColumn(`Cashier: ${order.cashier_name}`, `Status: ${order.payment_status.toUpperCase()}`)
    .line();

  // Table Headers
  if (width === 80) {
    printer.threeColumn("ITEM / DESCRIPTION", "QTY", "AMOUNT (LKR)");
  } else {
    printer.twoColumn("ITEM (QTY)", "AMOUNT");
  }
  printer.line();

  // Items
  order.items.forEach(item => {
    const formattedName = item.variant_name ? `${item.item_name} (${item.variant_name})` : item.item_name;
    const priceStr = item.total_price.toLocaleString('en-LK', { minimumFractionDigits: 2 });

    if (width === 80) {
      printer.threeColumn(formattedName, `${item.quantity}x`, priceStr);
    } else {
      printer.twoColumn(`${item.quantity}x ${formattedName}`, priceStr);
    }

    if (item.notes) {
      printer.text(`   * Note: ${item.notes}`).newLine();
    }
  });

  printer.line();

  // Totals & Financials
  printer.alignRight();
  printer.twoColumn("Subtotal:", `Rs. ${order.subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);

  if (order.discount_amount > 0) {
    printer.twoColumn(`Discount (${order.discount_percentage || 0}%):`, `- Rs. ${order.discount_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  }

  if (order.service_charge > 0) {
    printer.twoColumn("Service Charge (10%):", `Rs. ${order.service_charge.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  }

  if (order.tax_amount > 0) {
    printer.twoColumn("VAT (8%):", `Rs. ${order.tax_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  }

  printer.doubleLine();
  printer.bold(true).doubleHeight(true);
  printer.twoColumn("TOTAL NET:", `Rs. ${order.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  printer.doubleHeight(false).bold(false);
  printer.line();

  // Payment Breakdown
  if (order.payment_method === 'cash') {
    printer.twoColumn("Payment Method:", "CASH (LKR)");
    if (order.cash_tendered) {
      printer.twoColumn("Cash Tendered:", `Rs. ${order.cash_tendered.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
      printer.bold(true);
      printer.twoColumn("Change Returned:", `Rs. ${(order.change_returned || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
      printer.bold(false);
    }
  } else if (order.payment_method === 'card') {
    printer.twoColumn("Payment Method:", "CREDIT/DEBIT CARD");
    if (order.card_reference) {
      printer.twoColumn("Approval Ref:", order.card_reference);
    }
  } else if (order.payment_method === 'qr') {
    printer.twoColumn("Payment Method:", "LankaQR / Dynamic QR");
    if (order.qr_reference) {
      printer.twoColumn("Txn Ref:", order.qr_reference);
    }
  }

  // Footer & Wifi
  printer.line()
    .alignCenter()
    .text(`Free WiFi: ${restaurant.wifi_ssid}`)
    .newLine()
    .text(`Password: ${restaurant.wifi_pass}`)
    .newLine()
    .bold(true)
    .text(restaurant.footer_message)
    .newLine()
    .bold(false)
    .text("*** Have a wonderful day in Galle ***")
    .newLine()
    .cut();

  return printer;
}

/**
 * Generate binary ESC/POS payload for Guest Check / Pre-payment Bill
 */
export function buildBillEscPos(
  order: Order,
  restaurant: RestaurantProfile,
  width: 80 | 58 = 80
): EscPosBuilder {
  const printer = new EscPosBuilder(width);

  // Header
  printer.alignCenter()
    .bold(true)
    .doubleSize(true)
    .text(restaurant.name)
    .newLine()
    .doubleSize(false);

  if (restaurant.branch && 
      restaurant.branch.toLowerCase().trim() !== restaurant.address.toLowerCase().trim() &&
      !restaurant.address.toLowerCase().includes(restaurant.branch.toLowerCase().trim())) {
    printer.text(restaurant.branch).newLine();
  }

  printer.bold(true)
    .text("=== GUEST CHECK / PROFORMA BILL ===")
    .newLine()
    .bold(false)
    .text("*** NOT A TAX RECEIPT - PENDING PAYMENT ***")
    .newLine()
    .doubleLine();

  // Order Details
  printer.alignLeft()
    .twoColumn(`Order: #${order.order_number}`, order.table_number ? `Table: ${order.table_number}` : `Type: ${order.order_type.toUpperCase()}`)
    .twoColumn(`Date: ${order.created_at}`, `Server: ${order.cashier_name}`)
    .line();

  // Table Headers
  if (width === 80) {
    printer.threeColumn("ITEM / DESCRIPTION", "QTY", "AMOUNT (LKR)");
  } else {
    printer.twoColumn("ITEM (QTY)", "AMOUNT");
  }
  printer.line();

  // Items
  order.items.forEach(item => {
    const formattedName = item.variant_name ? `${item.item_name} (${item.variant_name})` : item.item_name;
    const priceStr = item.total_price.toLocaleString('en-LK', { minimumFractionDigits: 2 });

    if (width === 80) {
      printer.threeColumn(formattedName, `${item.quantity}x`, priceStr);
    } else {
      printer.twoColumn(`${item.quantity}x ${formattedName}`, priceStr);
    }

    if (item.notes) {
      printer.text(`   * Note: ${item.notes}`).newLine();
    }
  });

  printer.line();

  // Totals
  printer.alignRight();
  printer.twoColumn("Subtotal:", `Rs. ${order.subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);

  if (order.discount_amount > 0) {
    printer.twoColumn(`Discount (${order.discount_percentage || 0}%):`, `- Rs. ${order.discount_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  }

  if (order.service_charge > 0) {
    printer.twoColumn("Service Charge (10%):", `Rs. ${order.service_charge.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  }

  if (order.tax_amount > 0) {
    printer.twoColumn("VAT (8%):", `Rs. ${order.tax_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  }

  printer.doubleLine();
  printer.bold(true).doubleHeight(true);
  printer.twoColumn("TOTAL PAYABLE:", `Rs. ${order.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  printer.doubleHeight(false).bold(false);
  printer.line();

  printer.alignCenter()
    .text("Please present this bill at the cashier desk")
    .newLine()
    .text("Cash, Credit/Debit Cards & LankaQR accepted")
    .newLine()
    .cut();

  return printer;
}

/**
 * Generate binary ESC/POS payload for Kitchen Order Ticket (KOT)
 */
export function buildKotEscPos(
  orderNumber: string,
  orderType: string,
  tableNumber: string | undefined,
  items: (OrderItem | { item_name: string; variant_name?: string; quantity: number; notes?: string; station?: string })[],
  cashierName: string,
  width: 80 | 58 = 80
): EscPosBuilder {
  const printer = new EscPosBuilder(width);

  // KOT Header - Big & bold for kitchen station visibility
  printer.alignCenter()
    .invert(true)
    .bold(true)
    .doubleSize(true)
    .text(" *** KITCHEN TICKET (KOT) *** ")
    .newLine()
    .invert(false)
    .doubleSize(false)
    .bold(false)
    .newLine();

  printer.alignLeft()
    .bold(true)
    .doubleHeight(true)
    .twoColumn(`Order: #${orderNumber}`, tableNumber ? `TABLE: ${tableNumber}` : `TYPE: ${orderType.toUpperCase()}`)
    .doubleHeight(false)
    .bold(false)
    .twoColumn(`Time: ${new Date().toLocaleTimeString()}`, `Cashier: ${cashierName}`)
    .doubleLine();

  // KOT Items
  items.forEach((item, idx) => {
    printer.bold(true).doubleHeight(true);
    const name = item.variant_name ? `${item.item_name} [${item.variant_name}]` : item.item_name;
    printer.twoColumn(`${idx + 1}. ${name}`, `QTY: ${item.quantity}`);
    printer.doubleHeight(false).bold(false);

    if (item.station) {
      printer.text(`   Station: [${item.station}]`).newLine();
    }

    if (item.notes) {
      printer.bold(true)
        .text(`   >>> INSTRUCTION: ${item.notes.toUpperCase()}`)
        .newLine()
        .bold(false);
    }
    printer.line('.');
  });

  printer.feedLines(2)
    .alignCenter()
    .text("--- DISPATCH TO STATION ---")
    .newLine()
    .cut();

  return printer;
}

/**
 * Generate ESC/POS for Cash Drawer Kick
 */
export function buildDrawerKickEscPos(): Uint8Array {
  const printer = new EscPosBuilder();
  printer.kickCashDrawer();
  return printer.getBuffer();
}

/**
 * Generate binary ESC/POS payload for X-Report (Mid-shift snapshot)
 */
export function buildXReportEscPos(report: XReportData, restaurant: RestaurantProfile): EscPosBuilder {
  const printer = new EscPosBuilder(80);
  printer.alignCenter()
    .bold(true)
    .doubleSize(true)
    .text("=== X-REPORT (SHIFT AUDIT) ===")
    .newLine()
    .doubleSize(false)
    .text(restaurant.name)
    .newLine()
    .text(`Branch: ${restaurant.branch}`)
    .newLine()
    .text(`Register: ${report.shift.register_number} | Cashier: ${report.shift.cashier_name}`)
    .newLine()
    .text(`Generated: ${report.generated_at}`)
    .newLine()
    .doubleLine();

  printer.alignLeft()
    .twoColumn("Shift Opened:", report.shift.opened_at)
    .twoColumn("Opening Cash Float:", `Rs. ${report.shift.opening_float.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`)
    .twoColumn("Total Completed Orders:", `${report.order_count}`)
    .twoColumn("Total Food Items Sold:", `${report.items_sold_count}`)
    .line();

  printer.bold(true).text("CATEGORY SALES SUMMARY:").newLine().bold(false);
  report.sales_by_category.forEach(cat => {
    printer.twoColumn(`${cat.category_name} (${cat.item_count})`, `Rs. ${cat.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  });
  printer.line();

  printer.bold(true).text("PAYMENT BREAKDOWN:").newLine().bold(false);
  report.sales_by_payment.forEach(p => {
    printer.twoColumn(`${p.method.toUpperCase()} (${p.count} txns)`, `Rs. ${p.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  });
  printer.line();

  printer.twoColumn("Total Discounts Given:", `Rs. ${report.discount_total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  printer.twoColumn("Void Count / Cancelled:", `${report.void_total}`);
  printer.doubleLine();

  printer.bold(true).doubleHeight(true);
  printer.twoColumn("GROSS SALES:", `Rs. ${report.shift.total_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  printer.twoColumn("EXPECTED CASH IN DRAWER:", `Rs. ${report.shift.cash_drawer_expected.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  printer.doubleHeight(false).bold(false);

  printer.line()
    .alignCenter()
    .text("--- MID-SHIFT SNAPSHOT ONLY ---")
    .newLine()
    .text("SESSION REMAINS OPEN")
    .newLine()
    .cut();

  return printer;
}

/**
 * Generate binary ESC/POS payload for Z-Report (End-of-Day Closure)
 */
export function buildZReportEscPos(report: ZReportData, restaurant: RestaurantProfile): EscPosBuilder {
  const printer = new EscPosBuilder(80);
  printer.alignCenter()
    .invert(true)
    .bold(true)
    .doubleSize(true)
    .text(" *** Z-REPORT: END-OF-DAY CLOSURE *** ")
    .newLine()
    .invert(false)
    .doubleSize(false)
    .text(restaurant.name)
    .newLine()
    .text(`Branch: ${restaurant.branch} | Reg: ${report.shift.register_number}`)
    .newLine()
    .text(`Closed At: ${report.closing_timestamp}`)
    .newLine()
    .text(`Closed By: ${report.closing_cashier}`)
    .newLine()
    .doubleLine();

  printer.alignLeft()
    .twoColumn("Shift Start:", report.shift.opened_at)
    .twoColumn("Shift End:", report.closing_timestamp)
    .twoColumn("Opening Float:", `Rs. ${report.shift.opening_float.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`)
    .twoColumn("Total Bills Issued:", `${report.order_count}`)
    .line();

  printer.bold(true).text("FINAL CATEGORY SALES:").newLine().bold(false);
  report.sales_by_category.forEach(cat => {
    printer.twoColumn(`${cat.category_name} (${cat.item_count})`, `Rs. ${cat.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  });
  printer.line();

  printer.bold(true).text("PAYMENT RECONCILIATION:").newLine().bold(false);
  report.sales_by_payment.forEach(p => {
    printer.twoColumn(`${p.method.toUpperCase()} (${p.count})`, `Rs. ${p.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  });
  printer.line();

  printer.twoColumn("Gross Total Sales:", `Rs. ${report.shift.total_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);

  if (report.cash_payouts && report.cash_payouts.length > 0) {
    printer.bold(true).text("CASH PAYOUTS / LENDING:").newLine().bold(false);
    report.cash_payouts.forEach(t => {
      printer.twoColumn(`${t.type.toUpperCase()}: ${t.recipient}`, `- Rs. ${t.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
    });
    printer.twoColumn("Total Payouts Released:", `- Rs. ${(report.total_payouts || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
    printer.line();
  }

  printer.twoColumn("Expected Cash in Drawer:", `Rs. ${report.shift.cash_drawer_expected.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);
  printer.twoColumn("Actual Counted Cash:", `Rs. ${report.drawer_counted.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`);

  printer.bold(true);
  const diff = report.over_short;
  const diffStr = diff >= 0 ? `+ Rs. ${diff.toLocaleString('en-LK', { minimumFractionDigits: 2 })} (OVER)` : `- Rs. ${Math.abs(diff).toLocaleString('en-LK', { minimumFractionDigits: 2 })} (SHORT)`;
  printer.twoColumn("DISCREPANCY (OVER/SHORT):", diffStr);
  printer.bold(false);
  printer.doubleLine();

  printer.alignCenter()
    .bold(true)
    .text("OFFICIAL SHIFT CLOSURE RECORD")
    .newLine()
    .text("ALL REGISTERS RESET TO ZERO")
    .newLine()
    .bold(false)
    .newLine()
    .text("Cashier Signature: __________________")
    .newLine()
    .text("Manager Signature: __________________")
    .newLine()
    .cut();

  return printer;
}

/**
 * Generate binary ESC/POS payload for Cash Payout / Lending Voucher
 */
export function buildPayoutVoucherEscPos(
  txn: CashTransaction,
  restaurant: RestaurantProfile,
  width: 80 | 58 = 80
): EscPosBuilder {
  const printer = new EscPosBuilder(width);
  printer.alignCenter()
    .bold(true)
    .doubleSize(true)
    .text(restaurant.name)
    .newLine()
    .doubleSize(false)
    .text(restaurant.address)
    .newLine()
    .bold(true)
    .text(`=== ${txn.type.toUpperCase()} VOUCHER ===`)
    .newLine()
    .bold(false)
    .doubleLine();

  printer.alignLeft()
    .twoColumn("Voucher ID:", `#CSH-${txn.id.toString().slice(-6)}`)
    .twoColumn("Date & Time:", txn.timestamp)
    .twoColumn("Type:", txn.type.toUpperCase())
    .twoColumn("Authorized By:", txn.authorized_by)
    .twoColumn("Cashier on Duty:", txn.cashier_name)
    .line();

  printer.twoColumn("Handed Over To:", txn.recipient)
    .text(`Purpose: ${txn.reason}`)
    .newLine()
    .line();

  printer.alignRight()
    .bold(true).doubleHeight(true)
    .twoColumn("AMOUNT RELEASED:", `Rs. ${txn.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`)
    .doubleHeight(false).bold(false)
    .doubleLine();

  printer.alignCenter()
    .feedLines(1)
    .text("Recipient Signature: __________________")
    .newLine()
    .newLine()
    .text("Manager Signature:   __________________")
    .newLine()
    .cut();

  return printer;
}
