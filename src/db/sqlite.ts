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
  PaymentMethod 
} from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_SHIFT,
  RESTAURANT_PROFILE 
} from '../data/seedData';

const STORAGE_KEYS = {
  CATEGORIES: 'galle_pos_categories_v1',
  MENU_ITEMS: 'galle_pos_menu_items_v1',
  TABLES: 'galle_pos_tables_v1',
  ORDERS: 'galle_pos_orders_v1',
  SHIFTS: 'galle_pos_shifts_v1',
  DRAWER_LOGS: 'galle_pos_drawer_logs_v1',
  ACTIVE_SHIFT_ID: 'galle_pos_active_shift_id_v1',
};

class SQLiteLocalDatabase {
  private categories: Category[] = [];
  private menuItems: MenuItem[] = [];
  private tables: DiningTable[] = [];
  private orders: Order[] = [];
  private shifts: ShiftSession[] = [];
  private drawerLogs: Array<{ id: number; timestamp: string; reason: string; cashier: string }> = [];
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

      if (storedCategories && storedMenuItems && storedTables) {
        this.categories = JSON.parse(storedCategories);
        this.menuItems = JSON.parse(storedMenuItems);
        this.tables = JSON.parse(storedTables);
        this.orders = storedOrders ? JSON.parse(storedOrders) : [];
        this.shifts = storedShifts ? JSON.parse(storedShifts) : [INITIAL_SHIFT];
        this.activeShiftId = storedShiftId ? parseInt(storedShiftId, 10) : 101;
      } else {
        // Seed default database
        this.resetToSeedData();
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

  // --- CASH DRAWER LOGS ---
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

    return {
      shift,
      order_count: shiftOrders.length,
      items_sold_count: totalItemsCount,
      sales_by_category,
      sales_by_payment,
      discount_total: discountTotal,
      void_total: shift.void_count,
      generated_at: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString(),
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
    };

    this.shifts.push(nextShift);
    this.activeShiftId = nextShift.id;

    this.persistAll();
    return zReport;
  }
}

export const posDatabase = new SQLiteLocalDatabase();
