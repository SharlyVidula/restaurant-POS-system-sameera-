import { 
  Category, 
  MenuItem, 
  ItemVariant, 
  DiningTable, 
  Order, 
  OrderItem, 
  ShiftSession, 
  XReportData, 
  ZReportData, 
  TableStatus, 
  PaymentMethod,
  CashTransaction,
  PriceChangeAudit,
  DailySalesReportData,
  MonthlySalesReportData
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_SHIFT,
  RESTAURANT_PROFILE 
} from '../data/seedData';

const STORAGE_KEYS = {
  CATEGORIES: 'galle_pos_categories_v4',
  MENU_ITEMS: 'galle_pos_menu_items_v4',
  TABLES: 'galle_pos_tables_v1',
  ORDERS: 'galle_pos_orders_v1',
  SHIFTS: 'galle_pos_shifts_v1',
  DRAWER_LOGS: 'galle_pos_drawer_logs_v1',
  ACTIVE_SHIFT_ID: 'galle_pos_active_shift_id_v1',
  CASH_TXNS: 'galle_pos_cash_txns_v1',
  PRICE_AUDITS: 'galle_pos_price_audits_v1',
  ADMIN_PIN: 'galle_pos_admin_pin_v1',
};

class SQLiteLocalDatabase {
  private categories: Category[] = [];
  private menuItems: MenuItem[] = [];
  private tables: DiningTable[] = [];
  private orders: Order[] = [];
  private shifts: ShiftSession[] = [];
  private drawerLogs: Array<{ id: number; timestamp: string; reason: string; cashier: string }> = [];
  private cashTransactions: CashTransaction[] = [];
  private priceAudits: PriceChangeAudit[] = [];
  private adminPin: string = '9001';
  private activeShiftId: number = 101;
  private isInitialized = false;

  constructor() {
    this.initDatabase();
  }

  public initDatabase(): void {
    if (this.isInitialized) return;

    try {
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedMenuItems = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
      const storedTables = localStorage.getItem(STORAGE_KEYS.TABLES);
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const storedShifts = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      const storedShiftId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFT_ID);

      if (storedCategories && storedMenuItems) {
        this.categories = JSON.parse(storedCategories);
        this.menuItems = JSON.parse(storedMenuItems);
      } else {
        this.categories = [...INITIAL_CATEGORIES];
        this.menuItems = [...INITIAL_MENU_ITEMS];
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(this.menuItems));
      }

      if (storedTables) {
        this.tables = JSON.parse(storedTables);
      } else {
        this.tables = [...INITIAL_TABLES];
        localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(this.tables));
      }

      this.orders = storedOrders ? JSON.parse(storedOrders) : [];
      this.shifts = storedShifts ? JSON.parse(storedShifts) : [{ ...INITIAL_SHIFT }];
      this.activeShiftId = storedShiftId ? parseInt(storedShiftId, 10) : INITIAL_SHIFT.id;

      const storedCashTxns = localStorage.getItem(STORAGE_KEYS.CASH_TXNS);
      this.cashTransactions = storedCashTxns ? JSON.parse(storedCashTxns) : [];

      const storedPriceAudits = localStorage.getItem(STORAGE_KEYS.PRICE_AUDITS);
      this.priceAudits = storedPriceAudits ? JSON.parse(storedPriceAudits) : [];

      const storedAdminPin = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN);
      if (storedAdminPin && storedAdminPin !== '7788') {
        this.adminPin = storedAdminPin;
      } else {
        this.adminPin = '9001';
        localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, '9001');
      }
    } catch (e) {
      console.warn("Falling back to fresh database seed", e);
      this.resetToSeedData();
    }

    this.isInitialized = true;
  }

  public resetToSeedData(): void {
    this.categories = [...INITIAL_CATEGORIES];
    this.menuItems = [...INITIAL_MENU_ITEMS];
    this.tables = [...INITIAL_TABLES];
    this.orders = [];
    this.shifts = [{ ...INITIAL_SHIFT }];
    this.activeShiftId = INITIAL_SHIFT.id;
    this.cashTransactions = [];
    this.priceAudits = [];
    this.adminPin = '9001';
    this.persistAll();
  }

  private persistAll(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(this.menuItems));
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(this.tables));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(this.shifts));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFT_ID, this.activeShiftId.toString());
      localStorage.setItem(STORAGE_KEYS.DRAWER_LOGS, JSON.stringify(this.drawerLogs));
      localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(this.cashTransactions));
      localStorage.setItem(STORAGE_KEYS.PRICE_AUDITS, JSON.stringify(this.priceAudits));
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, this.adminPin);
    } catch (e) {
      console.error("Database persistence error", e);
    }
  }

  // --- MENU & CATEGORIES ---
  public getCategories(): Category[] {
    return [...this.categories].sort((a, b) => a.display_order - b.display_order);
  }

  public getMenuItems(): MenuItem[] {
    return [...this.menuItems];
  }

  public toggleItemAvailability(itemId: number): boolean {
    const item = this.menuItems.find(m => m.id === itemId);
    if (item) {
      item.is_available = !item.is_available;
      this.persistAll();
      return item.is_available;
    }
    return false;
  }

  public updateMenuItemPrice(
    itemId: number, 
    newBasePrice: number, 
    variantUpdates?: { id: number; price_adjustment: number }[],
    changedBy: string = 'Admin'
  ): boolean {
    const item = this.menuItems.find(m => m.id === itemId);
    if (item) {
      const oldPrice = item.base_price;
      item.base_price = newBasePrice;
      
      if (variantUpdates && item.variants) {
        variantUpdates.forEach(vu => {
          const v = item.variants?.find(variant => variant.id === vu.id);
          if (v) {
            v.price_adjustment = vu.price_adjustment;
          }
        });
      }

      this.priceAudits.unshift({
        id: Date.now(),
        item_id: item.id,
        item_name: item.name,
        old_price: oldPrice,
        new_price: newBasePrice,
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString(),
        changed_by: changedBy,
      });

      this.persistAll();
      return true;
    }
    return false;
  }

  public getPriceAudits(): PriceChangeAudit[] {
    return [...this.priceAudits];
  }

  // --- TABLES ---
  public getTables(): DiningTable[] {
    return [...this.tables];
  }

  public updateTableStatus(tableId: number, status: TableStatus, activeOrderId?: number, currentAmount?: number): DiningTable | undefined {
    const table = this.tables.find(t => t.id === tableId);
    if (table) {
      table.status = status;
      table.active_order_id = activeOrderId;
      table.current_amount = currentAmount;
      if (status === 'occupied' && !table.occupied_at) {
        table.occupied_at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (status === 'vacant') {
        table.occupied_at = undefined;
        table.active_order_id = undefined;
        table.current_amount = undefined;
      }
      this.persistAll();
      return table;
    }
    return undefined;
  }

  // --- ORDERS ---
  public createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>): Order {
    const orderNumber = `GAL-${(this.orders.length + 101).toString().padStart(4, '0')}`;
    const newOrder: Order = {
      ...orderData,
      id: Date.now(),
      order_number: orderNumber,
      created_at: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString(),
      shift_id: this.activeShiftId,
    };

    this.orders.unshift(newOrder);

    // If dine-in, mark table occupied
    if (newOrder.order_type === 'dine_in' && newOrder.table_id) {
      this.updateTableStatus(newOrder.table_id, 'occupied', newOrder.id, newOrder.total_amount);
    }

    this.persistAll();
    return newOrder;
  }

  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrderById(id: number): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  public payOrder(
    orderId: number, 
    paymentMethod: PaymentMethod, 
    cashTendered?: number, 
    changeReturned?: number, 
    reference?: string
  ): Order | undefined {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return undefined;

    order.payment_status = 'paid';
    order.payment_method = paymentMethod;
    order.paid_at = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString();
    order.cash_tendered = cashTendered;
    order.change_returned = changeReturned;
    if (paymentMethod === 'card') {
      order.card_reference = reference;
    } else if (paymentMethod === 'qr') {
      order.qr_reference = reference;
    }

    // Free table if dine-in
    if (order.table_id) {
      this.updateTableStatus(order.table_id, 'vacant');
    }

    // Update active shift financials
    const shift = this.shifts.find(s => s.id === this.activeShiftId);
    if (shift) {
      shift.total_sales += order.total_amount;
      if (paymentMethod === 'cash') {
        shift.cash_sales += order.total_amount;
        shift.cash_drawer_expected += order.total_amount;
      } else if (paymentMethod === 'card') {
        shift.card_sales += order.total_amount;
      } else if (paymentMethod === 'qr') {
        shift.qr_sales += order.total_amount;
      }
      shift.total_discounts += order.discount_amount;
    }

    this.persistAll();
    return order;
  }

  public voidOrder(orderId: number, reason: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    order.payment_status = 'void';
    order.notes = (order.notes ? order.notes + ' | ' : '') + `VOIDED: ${reason}`;

    if (order.table_id) {
      this.updateTableStatus(order.table_id, 'vacant');
    }

    const shift = this.shifts.find(s => s.id === this.activeShiftId);
    if (shift) {
      shift.void_count += 1;
    }

    this.persistAll();
    return true;
  }

  // --- CASH DRAWER LOGS & TRANSACTIONS ---
  public logDrawerKick(reason: string, cashier: string = 'Kasun Perera'): void {
    this.drawerLogs.push({
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      reason,
      cashier,
    });
    this.persistAll();
  }

  public getDrawerLogs() {
    return [...this.drawerLogs];
  }

  public recordCashTransaction(data: Omit<CashTransaction, 'id' | 'timestamp'>): CashTransaction {
    const txn: CashTransaction = {
      ...data,
      id: Date.now(),
      timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString(),
    };

    this.cashTransactions.unshift(txn);

    // Also log in hardware drawer logs for audit
    this.drawerLogs.push({
      id: txn.id,
      timestamp: txn.timestamp,
      reason: `[${txn.type.toUpperCase()}] Rs. ${txn.amount} to ${txn.recipient}: ${txn.reason} (Auth: ${txn.authorized_by})`,
      cashier: txn.cashier_name,
    });

    // Update expected cash drawer balance
    const shift = this.shifts.find(s => s.id === this.activeShiftId);
    if (shift) {
      if (txn.type === 'lending' || txn.type === 'expense' || txn.type === 'drop') {
        shift.cash_drawer_expected -= txn.amount;
        shift.total_payouts = (shift.total_payouts || 0) + txn.amount;
      } else if (txn.type === 'float_in') {
        shift.cash_drawer_expected += txn.amount;
        shift.total_cash_in = (shift.total_cash_in || 0) + txn.amount;
      }
    }

    this.persistAll();
    return txn;
  }

  public getCashTransactions(shiftId?: number): CashTransaction[] {
    if (shiftId) {
      return this.cashTransactions.filter(t => t.shift_id === shiftId);
    }
    return [...this.cashTransactions];
  }

  // --- ADMIN SECURITY & AUTH ---
  public getAdminPin(): string {
    return this.adminPin;
  }

  public verifyAdminPin(pin: string): boolean {
    return pin === this.adminPin;
  }

  public updateAdminPin(newPin: string): boolean {
    if (newPin && newPin.length >= 4) {
      this.adminPin = newPin;
      this.persistAll();
      return true;
    }
    return false;
  }

  // --- SHIFTS & REPORTS ---
  public getActiveShift(): ShiftSession {
    let shift = this.shifts.find(s => s.id === this.activeShiftId);
    if (!shift) {
      shift = { ...INITIAL_SHIFT, id: Date.now() };
      this.shifts.push(shift);
      this.activeShiftId = shift.id;
      this.persistAll();
    }
    return shift;
  }

  public getXReportData(): XReportData {
    const shift = this.getActiveShift();
    const shiftOrders = this.orders.filter(o => o.shift_id === shift.id && o.payment_status === 'paid');
    
    // Category sales aggregation
    const catMap = new Map<string, { total_amount: number; item_count: number }>();
    let totalItemsCount = 0;

    shiftOrders.forEach(o => {
      o.items.forEach(item => {
        const menuItem = this.menuItems.find(m => m.id === item.menu_item_id);
        const category = menuItem ? this.categories.find(c => c.id === menuItem.category_id)?.name || 'Other' : 'Other';
        const current = catMap.get(category) || { total_amount: 0, item_count: 0 };
        current.total_amount += item.total_price;
        current.item_count += item.quantity;
        totalItemsCount += item.quantity;
        catMap.set(category, current);
      });
    });

    const sales_by_category = Array.from(catMap.entries()).map(([category_name, data]) => ({
      category_name,
      total_amount: data.total_amount,
      item_count: data.item_count,
    }));

    // Payment splits
    const cashTotal = shiftOrders.filter(o => o.payment_method === 'cash').reduce((acc, o) => acc + o.total_amount, 0);
    const cardTotal = shiftOrders.filter(o => o.payment_method === 'card').reduce((acc, o) => acc + o.total_amount, 0);
    const qrTotal = shiftOrders.filter(o => o.payment_method === 'qr').reduce((acc, o) => acc + o.total_amount, 0);

    const sales_by_payment = [
      { method: 'Cash', count: shiftOrders.filter(o => o.payment_method === 'cash').length, total: cashTotal },
      { method: 'Card', count: shiftOrders.filter(o => o.payment_method === 'card').length, total: cardTotal },
      { method: 'LankaQR', count: shiftOrders.filter(o => o.payment_method === 'qr').length, total: qrTotal },
    ];

    const discountTotal = shiftOrders.reduce((acc, o) => acc + o.discount_amount, 0);
    const currentShiftTxns = this.getCashTransactions(shift.id);
    const totalPayouts = currentShiftTxns
      .filter(t => t.type === 'lending' || t.type === 'expense' || t.type === 'drop')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      shift,
      order_count: shiftOrders.length,
      items_sold_count: totalItemsCount,
      sales_by_category,
      sales_by_payment,
      discount_total: discountTotal,
      void_total: shift.void_count,
      generated_at: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString(),
      cash_payouts: currentShiftTxns,
      total_payouts: totalPayouts,
    };
  }

  public closeShiftZReport(countedCash: number, closingCashier: string, notes: string = ''): ZReportData {
    const xReport = this.getXReportData();
    const shift = this.shifts.find(s => s.id === this.activeShiftId)!;

    const discrepancy = countedCash - shift.cash_drawer_expected;
    shift.status = 'closed';
    shift.closed_at = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString();
    shift.cash_drawer_counted = countedCash;
    shift.discrepancy = discrepancy;
    shift.notes = notes;

    const zReport: ZReportData = {
      ...xReport,
      closing_timestamp: shift.closed_at,
      drawer_counted: countedCash,
      over_short: discrepancy,
      closing_cashier: closingCashier,
    };

    // Open new shift automatically for next cashier/day
    const nextShift: ShiftSession = {
      id: Date.now(),
      cashier_name: closingCashier,
      register_number: shift.register_number,
      branch_name: shift.branch_name,
      opening_float: 15000.0,
      opened_at: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString(),
      status: 'open',
      total_sales: 0,
      cash_sales: 0,
      card_sales: 0,
      qr_sales: 0,
      total_discounts: 0,
      void_count: 0,
      cash_drawer_expected: 15000.0,
      total_payouts: 0,
      total_cash_in: 0,
    };

    this.shifts.push(nextShift);
    this.activeShiftId = nextShift.id;

    this.persistAll();
    return zReport;
  }

  // --- SALES ANALYTICS & REPORTS ---
  public parseOrderDate(order: { paid_at?: string; created_at?: string; id?: number }): string {
    if (order.paid_at) {
      const parts = order.paid_at.split(' ')[0].split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    if (order.created_at) {
      const parts = order.created_at.split(' ')[0].split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    if (order.id && order.id > 1600000000000) {
      const d = new Date(order.id);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  public getDailySalesReport(dateStr?: string): DailySalesReportData {
    const targetDate = dateStr || this.parseOrderDate({ id: Date.now() });
    const dayOrders = this.orders.filter(o => o.payment_status === 'paid' && this.parseOrderDate(o) === targetDate);

    let totalGrossSales = 0;
    let totalDiscount = 0;
    let totalNetSales = 0;
    let totalTax = 0;
    let totalServiceCharge = 0;
    let totalItemsSold = 0;

    const catMap = new Map<string, { count: number; total: number }>();
    const itemMap = new Map<string, { count: number; revenue: number }>();
    const paymentMap = new Map<string, { count: number; total: number }>();

    dayOrders.forEach(o => {
      const gross = o.subtotal || o.total_amount;
      totalGrossSales += gross;
      totalDiscount += (o.discount_amount || 0);
      totalNetSales += o.total_amount;
      totalTax += (o.tax_amount || 0);
      totalServiceCharge += (o.service_charge || 0);

      const method = (o.payment_method || 'cash').toUpperCase();
      const currentPay = paymentMap.get(method) || { count: 0, total: 0 };
      currentPay.count += 1;
      currentPay.total += o.total_amount;
      paymentMap.set(method, currentPay);

      o.items.forEach(item => {
        totalItemsSold += item.quantity;
        const menuItem = this.menuItems.find(m => m.id === item.menu_item_id);
        const category = menuItem ? this.categories.find(c => c.id === menuItem.category_id)?.name || 'Other' : 'Other';

        const currCat = catMap.get(category) || { count: 0, total: 0 };
        currCat.count += item.quantity;
        currCat.total += item.total_price;
        catMap.set(category, currCat);

        const currItem = itemMap.get(item.item_name) || { count: 0, revenue: 0 };
        currItem.count += item.quantity;
        currItem.revenue += item.total_price;
        itemMap.set(item.item_name, currItem);
      });
    });

    const sales_by_payment = Array.from(paymentMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: totalNetSales > 0 ? Math.round((data.total / totalNetSales) * 100) : 0,
    }));

    const sales_by_category = Array.from(catMap.entries()).map(([category_name, data]) => ({
      category_name,
      item_count: data.count,
      total_amount: data.total,
      percentage: totalNetSales > 0 ? Math.round((data.total / totalNetSales) * 100) : 0,
    })).sort((a, b) => b.total_amount - a.total_amount);

    const top_selling_items = Array.from(itemMap.entries())
      .map(([item_name, data]) => ({
        item_name,
        quantity: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const orderSummaries = dayOrders.map(o => ({
      order_number: o.order_number,
      time: (o.created_at || '').split(' ')[1] || o.created_at,
      total: o.total_amount,
      payment_method: (o.payment_method || 'cash').toUpperCase(),
      items_count: o.items.reduce((s, i) => s + i.quantity, 0),
      table: o.table_number,
    }));

    return {
      date: targetDate,
      generated_at: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString(),
      order_count: dayOrders.length,
      total_gross_sales: totalGrossSales,
      total_discount: totalDiscount,
      total_net_sales: totalNetSales,
      total_tax: totalTax,
      total_service_charge: totalServiceCharge,
      total_items_sold: totalItemsSold,
      average_order_value: dayOrders.length > 0 ? totalNetSales / dayOrders.length : 0,
      sales_by_payment,
      sales_by_category,
      top_selling_items,
      orders: orderSummaries,
    };
  }

  public getMonthlySalesReport(yearParam?: number, monthParam?: number): MonthlySalesReportData {
    const now = new Date();
    const year = yearParam || now.getFullYear();
    const month = monthParam !== undefined ? monthParam : (now.getMonth() + 1);
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthOrders = this.orders.filter(o => o.payment_status === 'paid' && this.parseOrderDate(o).startsWith(monthPrefix));

    let totalGrossSales = 0;
    let totalDiscount = 0;
    let totalNetSales = 0;
    let totalTax = 0;
    let totalServiceCharge = 0;
    let totalItemsSold = 0;

    const catMap = new Map<string, { count: number; total: number }>();
    const paymentMap = new Map<string, { count: number; total: number }>();
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap = new Map<number, { orders: number; cash: number; card: number; qr: number; total: number }>();

    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, { orders: 0, cash: 0, card: 0, qr: 0, total: 0 });
    }

    const activeDaysSet = new Set<string>();

    monthOrders.forEach(o => {
      const dateStr = this.parseOrderDate(o);
      activeDaysSet.add(dateStr);
      const dayNum = parseInt(dateStr.split('-')[2], 10);

      const gross = o.subtotal || o.total_amount;
      totalGrossSales += gross;
      totalDiscount += (o.discount_amount || 0);
      totalNetSales += o.total_amount;
      totalTax += (o.tax_amount || 0);
      totalServiceCharge += (o.service_charge || 0);

      const method = (o.payment_method || 'cash').toLowerCase();
      const currentPay = paymentMap.get(method.toUpperCase()) || { count: 0, total: 0 };
      currentPay.count += 1;
      currentPay.total += o.total_amount;
      paymentMap.set(method.toUpperCase(), currentPay);

      if (dailyMap.has(dayNum)) {
        const dayRecord = dailyMap.get(dayNum)!;
        dayRecord.orders += 1;
        dayRecord.total += o.total_amount;
        if (method === 'cash') dayRecord.cash += o.total_amount;
        else if (method === 'card') dayRecord.card += o.total_amount;
        else if (method === 'qr') dayRecord.qr += o.total_amount;
      }

      o.items.forEach(item => {
        totalItemsSold += item.quantity;
        const menuItem = this.menuItems.find(m => m.id === item.menu_item_id);
        const category = menuItem ? this.categories.find(c => c.id === menuItem.category_id)?.name || 'Other' : 'Other';

        const currCat = catMap.get(category) || { count: 0, total: 0 };
        currCat.count += item.quantity;
        currCat.total += item.total_price;
        catMap.set(category, currCat);
      });
    });

    const sales_by_payment = Array.from(paymentMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percentage: totalNetSales > 0 ? Math.round((data.total / totalNetSales) * 100) : 0,
    }));

    const sales_by_category = Array.from(catMap.entries()).map(([category_name, data]) => ({
      category_name,
      item_count: data.count,
      total_amount: data.total,
      percentage: totalNetSales > 0 ? Math.round((data.total / totalNetSales) * 100) : 0,
    })).sort((a, b) => b.total_amount - a.total_amount);

    const daily_breakdown = Array.from(dailyMap.entries()).map(([day, data]) => ({
      date: `${monthPrefix}-${String(day).padStart(2, '0')}`,
      day,
      order_count: data.orders,
      cash_total: data.cash,
      card_total: data.card,
      qr_total: data.qr,
      total_sales: data.total,
    }));

    const activeDaysCount = Math.max(1, activeDaysSet.size);

    return {
      year,
      month,
      month_name: monthNames[month - 1] || `Month ${month}`,
      generated_at: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString(),
      total_days_active: activeDaysSet.size,
      total_orders: monthOrders.length,
      total_gross_sales: totalGrossSales,
      total_discount: totalDiscount,
      total_net_sales: totalNetSales,
      total_tax: totalTax,
      total_service_charge: totalServiceCharge,
      total_items_sold: totalItemsSold,
      average_daily_sales: totalNetSales > 0 ? totalNetSales / activeDaysCount : 0,
      sales_by_payment,
      sales_by_category,
      daily_breakdown,
    };
  }
}

export const posDatabase = new SQLiteLocalDatabase();
