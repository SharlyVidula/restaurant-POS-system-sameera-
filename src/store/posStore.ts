import { create } from 'zustand';
import { 
  Category, 
  MenuItem, 
  ItemVariant, 
  DiningTable, 
  CartItem, 
  CartItemModifier, 
  OrderType, 
  Order, 
  OrderItem,
  ShiftSession, 
  XReportData, 
  ZReportData, 
  RestaurantProfile,
  PaymentMethod,
  UserRole,
  CashTransaction,
  PriceChangeAudit
} from '../types';
import { posDatabase } from '../db/sqlite';
import { RESTAURANT_PROFILE } from '../data/seedData';
import { 
  buildCustomerReceiptEscPos, 
  buildKotEscPos, 
  buildDrawerKickEscPos, 
  buildXReportEscPos, 
  buildZReportEscPos, 
  buildBillEscPos,
  buildPayoutVoucherEscPos
} from '../utils/escpos';

export interface PrintPreviewData {
  title: string;
  type: 'RECEIPT' | 'KOT' | 'BILL' | 'X_REPORT' | 'Z_REPORT' | 'PAYOUT_VOUCHER';
  plainText: string;
  hexDump: string;
  width: 80 | 58;
  order?: Order;
  kotData?: {
    orderNumber: string;
    orderType: string;
    tableNumber?: string;
    items: (OrderItem | CartItem | { item_name: string; variant_name?: string; quantity: number; notes?: string; station?: string; unit_price?: number; total_price?: number })[];
    cashierName: string;
    notes?: string;
    createdAt?: string;
  };
  xReportData?: XReportData;
  zReportData?: ZReportData;
  payoutData?: CashTransaction;
}

interface PosState {
  // Master data
  restaurant: RestaurantProfile;
  categories: Category[];
  menuItems: MenuItem[];
  tables: DiningTable[];
  activeShift: ShiftSession;
  recentOrders: Order[];

  // Active Order State
  orderType: OrderType;
  selectedTable: DiningTable | null;
  cart: CartItem[];
  discountPercentage: number;
  discountAmount: number;
  includeServiceCharge: boolean; // 10% for dine-in standard
  includeTax: boolean; // 8% VAT
  customerName: string;
  customerPhone: string;
  orderNotes: string;

  // UI Filtering
  selectedCategoryId: number | null; // null = all
  searchQuery: string;

  // Active Modals & Dialogs
  variantModalItem: MenuItem | null;
  isPaymentModalOpen: boolean;
  isTableModalOpen: boolean;
  isHistoryModalOpen: boolean;
  isSalesReportModalOpen: boolean;
  isXReportModalOpen: boolean;
  isZReportModalOpen: boolean;
  isDrawerLogModalOpen: boolean;
  isCashPayoutModalOpen: boolean;
  isMenuPriceModalOpen: boolean;
  isAdminAuthModalOpen: boolean;
  adminAuthTitle: string;
  adminAuthPendingAction: (() => void) | null;
  printPreview: PrintPreviewData | null;
  drawerPulseActive: boolean;

  // RBAC & Ledger Data
  currentUserRole: UserRole;
  cashTransactions: CashTransaction[];
  priceAudits: PriceChangeAudit[];

  // Actions
  init: () => void;
  setUserRole: (role: UserRole) => void;
  requireAdminAuth: (title: string, onAuthorized: () => void) => void;
  closeAdminAuthModal: () => void;
  verifyAndExecuteAdminAuth: (pin: string) => boolean;
  openCashPayoutModal: () => void;
  closeCashPayoutModal: () => void;
  submitCashPayout: (data: Omit<CashTransaction, 'id' | 'timestamp' | 'shift_id'>) => CashTransaction;
  openMenuPriceModal: () => void;
  closeMenuPriceModal: () => void;
  updateMenuItemPrice: (itemId: number, newBasePrice: number, variantUpdates?: { id: number; price_adjustment: number }[]) => boolean;
  printPayoutVoucher: (txn: CashTransaction) => void;

  setOrderType: (type: OrderType) => void;
  setSelectedCategory: (categoryId: number | null) => void;
  setSearchQuery: (query: string) => void;
  selectTable: (table: DiningTable | null) => void;
  
  // Cart Actions
  openVariantModal: (item: MenuItem) => void;
  closeVariantModal: () => void;
  addToCart: (
    item: MenuItem, 
    variant?: ItemVariant, 
    quantity?: number, 
    notes?: string, 
    modifiers?: CartItemModifier[]
  ) => void;
  quickAddStepper: (item: MenuItem, delta: number) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  clearCart: () => void;
  setDiscountPercentage: (pct: number) => void;
  setDiscountAmount: (amt: number) => void;
  toggleServiceCharge: () => void;
  toggleTax: () => void;
  setCustomerInfo: (name: string, phone: string) => void;
  setOrderNotes: (notes: string) => void;

  // Calculations
  getSubtotal: () => number;
  getDiscountTotal: () => number;
  getServiceChargeTotal: () => number;
  getTaxTotal: () => number;
  getNetTotal: () => number;

  // Hardware & POS Actions
  fireKOT: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  processPayment: (method: PaymentMethod, cashTendered?: number, reference?: string) => Promise<Order>;
  triggerDrawerKick: (reason?: string) => void;
  toggleItemAvailability: (itemId: number) => void;

  // Reports & Dialogs
  openTableModal: () => void;
  closeTableModal: () => void;
  openHistoryModal: () => void;
  closeHistoryModal: () => void;
  openSalesReport: () => void;
  closeSalesReport: () => void;
  openXReport: () => void;
  closeXReport: () => void;
  openZReport: () => void;
  closeZReport: () => void;
  closePrintPreview: () => void;
  setPrintPreview: (data: PrintPreviewData | null) => void;
  printBillPreview: () => void;
  performZClosure: (countedCash: number, cashier: string, notes?: string) => ZReportData;
  loadOrderIntoCart: (order: Order) => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  restaurant: RESTAURANT_PROFILE,
  categories: [],
  menuItems: [],
  tables: [],
  activeShift: posDatabase.getActiveShift(),
  recentOrders: [],

  orderType: 'dine_in',
  selectedTable: null,
  cart: [],
  discountPercentage: 0,
  discountAmount: 0,
  includeServiceCharge: true,
  includeTax: false,
  customerName: '',
  customerPhone: '',
  orderNotes: '',

  selectedCategoryId: null,
  searchQuery: '',

  variantModalItem: null,
  isPaymentModalOpen: false,
  isTableModalOpen: false,
  isHistoryModalOpen: false,
  isSalesReportModalOpen: false,
  isXReportModalOpen: false,
  isZReportModalOpen: false,
  isDrawerLogModalOpen: false,
  isCashPayoutModalOpen: false,
  isMenuPriceModalOpen: false,
  isAdminAuthModalOpen: false,
  adminAuthTitle: 'Admin Authorization Required',
  adminAuthPendingAction: null,
  printPreview: null,
  drawerPulseActive: false,

  currentUserRole: 'cashier',
  cashTransactions: [],
  priceAudits: [],

  init: () => {
    posDatabase.initDatabase();
    set({
      categories: posDatabase.getCategories(),
      menuItems: posDatabase.getMenuItems(),
      tables: posDatabase.getTables(),
      activeShift: posDatabase.getActiveShift(),
      recentOrders: posDatabase.getOrders(),
      cashTransactions: posDatabase.getCashTransactions(),
      priceAudits: posDatabase.getPriceAudits(),
    });
  },

  setOrderType: (type: OrderType) => {
    set({ 
      orderType: type,
      // Default service charge to true for dine-in, false for takeaway/delivery
      includeServiceCharge: type === 'dine_in',
      selectedTable: type === 'dine_in' ? get().selectedTable : null
    });
  },

  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectTable: (table) => {
    set({ 
      selectedTable: table,
      orderType: 'dine_in',
      isTableModalOpen: false 
    });
  },

  openVariantModal: (item) => set({ variantModalItem: item }),
  closeVariantModal: () => set({ variantModalItem: null }),

  addToCart: (item, variant, quantity = 1, notes = '', modifiers = []) => {
    const state = get();
    const modifierTotal = modifiers.reduce((acc, m) => acc + m.price, 0);
    const unitPrice = (item.base_price + (variant ? variant.price_adjustment : 0)) + modifierTotal;
    
    // Create unique key for same item + same variant + same modifiers + same notes
    const modifierKey = modifiers.map(m => m.name).sort().join('|');
    const existingIndex = state.cart.findIndex(c => 
      c.menu_item_id === item.id && 
      c.variant_id === (variant?.id || undefined) &&
      (c.notes || '') === notes &&
      (c.modifiers || []).map(m => m.name).sort().join('|') === modifierKey
    );

    if (existingIndex > -1) {
      const updatedCart = [...state.cart];
      const existing = updatedCart[existingIndex];
      const newQty = existing.quantity + quantity;
      updatedCart[existingIndex] = {
        ...existing,
        quantity: newQty,
        total_price: newQty * existing.unit_price,
      };
      set({ cart: updatedCart });
    } else {
      const newCartItem: CartItem = {
        cart_item_id: `${item.id}-${variant?.id || 0}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        menu_item_id: item.id,
        item_name: item.name,
        variant_id: variant?.id,
        variant_name: variant?.variant_name,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        notes,
        modifiers,
        station: item.station || 'Kitchen',
      };
      set({ cart: [...state.cart, newCartItem] });
    }

    set({ variantModalItem: null });
  },

  quickAddStepper: (item, delta) => {
    const state = get();
    const existing = state.cart.find(c => c.menu_item_id === item.id && !c.variant_id);
    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        set({ cart: state.cart.filter(c => c.cart_item_id !== existing.cart_item_id) });
      } else {
        set({
          cart: state.cart.map(c => c.cart_item_id === existing.cart_item_id ? {
            ...c,
            quantity: newQty,
            total_price: newQty * c.unit_price,
          } : c)
        });
      }
    } else if (delta > 0) {
      get().addToCart(item, undefined, delta);
    }
  },

  updateCartQuantity: (cartItemId, delta) => {
    const state = get();
    const target = state.cart.find(c => c.cart_item_id === cartItemId);
    if (!target) return;

    const newQty = target.quantity + delta;
    if (newQty <= 0) {
      set({ cart: state.cart.filter(c => c.cart_item_id !== cartItemId) });
    } else {
      set({
        cart: state.cart.map(c => c.cart_item_id === cartItemId ? {
          ...c,
          quantity: newQty,
          total_price: newQty * c.unit_price,
        } : c)
      });
    }
  },

  removeCartItem: (cartItemId) => {
    set(state => ({ cart: state.cart.filter(c => c.cart_item_id !== cartItemId) }));
  },

  clearCart: () => {
    set({
      cart: [],
      discountPercentage: 0,
      discountAmount: 0,
      customerName: '',
      customerPhone: '',
      orderNotes: '',
    });
  },

  setDiscountPercentage: (pct) => set({ discountPercentage: pct, discountAmount: 0 }),
  setDiscountAmount: (amt) => set({ discountAmount: amt, discountPercentage: 0 }),
  toggleServiceCharge: () => set(state => ({ includeServiceCharge: !state.includeServiceCharge })),
  toggleTax: () => set(state => ({ includeTax: !state.includeTax })),
  setCustomerInfo: (name, phone) => set({ customerName: name, customerPhone: phone }),
  setOrderNotes: (notes) => set({ orderNotes: notes }),

  // Financial calculations
  getSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.total_price, 0);
  },

  getDiscountTotal: () => {
    const subtotal = get().getSubtotal();
    const { discountPercentage, discountAmount } = get();
    if (discountPercentage > 0) {
      return (subtotal * discountPercentage) / 100;
    }
    return Math.min(discountAmount, subtotal);
  },

  getServiceChargeTotal: () => {
    const { includeServiceCharge } = get();
    if (!includeServiceCharge) return 0;
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountTotal();
    return (subtotal - discount) * 0.10; // 10%
  },

  getTaxTotal: () => {
    const { includeTax } = get();
    if (!includeTax) return 0;
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountTotal();
    return (subtotal - discount) * 0.08; // 8% VAT
  },

  getNetTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountTotal();
    const service = get().getServiceChargeTotal();
    const tax = get().getTaxTotal();
    return Math.max(0, subtotal - discount + service + tax);
  },

  fireKOT: () => {
    const state = get();
    if (state.cart.length === 0) return;

    const dummyOrderNum = `KOT-${Math.floor(1000 + Math.random() * 9000)}`;
    const kotBuilder = buildKotEscPos(
      dummyOrderNum,
      state.orderType,
      state.selectedTable?.table_number,
      state.cart.map(c => ({
        item_name: c.item_name,
        variant_name: c.variant_name,
        quantity: c.quantity,
        notes: c.notes,
        station: c.station,
      })),
      state.activeShift.cashier_name,
      80
    );

    // If dining table, mark it occupied with current running estimate
    if (state.orderType === 'dine_in' && state.selectedTable) {
      posDatabase.updateTableStatus(state.selectedTable.id, 'occupied', undefined, state.getNetTotal());
      set({ tables: posDatabase.getTables() });
    }

    set({
      printPreview: {
        title: `Kitchen Order Ticket (KOT) - ${state.selectedTable ? state.selectedTable.table_number : 'Takeaway'}`,
        type: 'KOT',
        plainText: `KOT #${dummyOrderNum} Dispatched to Wok & Kitchen stations`,
        hexDump: kotBuilder.getHexDump(),
        width: 80,
        kotData: {
          orderNumber: dummyOrderNum,
          orderType: state.orderType,
          tableNumber: state.selectedTable?.table_number,
          items: state.cart.map(c => ({
            menu_item_id: c.menu_item_id,
            variant_id: c.variant_id,
            item_name: c.item_name,
            variant_name: c.variant_name,
            quantity: c.quantity,
            notes: c.notes,
            station: c.station,
            unit_price: c.unit_price,
            total_price: c.total_price,
          })),
          cashierName: state.activeShift.cashier_name,
          notes: state.orderNotes,
          createdAt: new Date().toLocaleTimeString(),
        }
      }
    });
  },

  openPaymentModal: () => {
    if (get().cart.length > 0) {
      set({ isPaymentModalOpen: true });
    }
  },

  closePaymentModal: () => set({ isPaymentModalOpen: false }),

  processPayment: async (method: PaymentMethod, cashTendered?: number, reference?: string) => {
    const state = get();
    const subtotal = state.getSubtotal();
    const discountTotal = state.getDiscountTotal();
    const serviceCharge = state.getServiceChargeTotal();
    const taxAmount = state.getTaxTotal();
    const netTotal = state.getNetTotal();

    const change = method === 'cash' && cashTendered ? Math.max(0, cashTendered - netTotal) : 0;

    const orderPayload = {
      order_type: state.orderType,
      table_id: state.selectedTable?.id,
      table_number: state.selectedTable?.table_number,
      subtotal,
      discount_amount: discountTotal,
      discount_percentage: state.discountPercentage,
      tax_amount: taxAmount,
      service_charge: serviceCharge,
      total_amount: netTotal,
      payment_method: method,
      payment_status: 'paid' as const,
      cash_tendered: cashTendered,
      change_returned: change,
      card_reference: method === 'card' ? reference : undefined,
      qr_reference: method === 'qr' ? reference : undefined,
      customer_name: state.customerName,
      customer_phone: state.customerPhone,
      notes: state.orderNotes,
      cashier_name: state.activeShift.cashier_name,
      shift_id: state.activeShift.id,
      items: state.cart.map(c => ({
        menu_item_id: c.menu_item_id,
        variant_id: c.variant_id,
        item_name: c.item_name,
        variant_name: c.variant_name,
        quantity: c.quantity,
        unit_price: c.unit_price,
        total_price: c.total_price,
        notes: c.notes,
        station: c.station,
      })),
    };

    const savedOrder = posDatabase.createOrder(orderPayload);
    posDatabase.payOrder(savedOrder.id, method, cashTendered, change, reference);

    // If cash, trigger drawer kick
    if (method === 'cash') {
      get().triggerDrawerKick(`Sale Settlement #${savedOrder.order_number}`);
    }

    // Build Receipt ESC/POS
    const receiptBuilder = buildCustomerReceiptEscPos(savedOrder, state.restaurant, 80);

    // Refresh state
    set({
      recentOrders: posDatabase.getOrders(),
      tables: posDatabase.getTables(),
      activeShift: posDatabase.getActiveShift(),
      isPaymentModalOpen: false,
      cart: [],
      selectedTable: null,
      customerName: '',
      customerPhone: '',
      orderNotes: '',
      discountPercentage: 0,
      discountAmount: 0,
      printPreview: {
        title: `Customer Thermal Receipt - #${savedOrder.order_number}`,
        type: 'RECEIPT',
        plainText: `Receipt for #${savedOrder.order_number} (LKR ${savedOrder.total_amount.toLocaleString()})`,
        hexDump: receiptBuilder.getHexDump(),
        width: 80,
        order: savedOrder,
      }
    });

    return savedOrder;
  },

  triggerDrawerKick: (reason = 'Manual Open') => {
    buildDrawerKickEscPos();
    posDatabase.logDrawerKick(reason, get().activeShift.cashier_name);
    if (typeof window !== 'undefined' && (window as any).electronAPI?.kickCashDrawer) {
      (window as any).electronAPI.kickCashDrawer();
    }
    set({ drawerPulseActive: true });
    setTimeout(() => {
      set({ drawerPulseActive: false });
    }, 1200);
  },

  toggleItemAvailability: (itemId: number) => {
    posDatabase.toggleItemAvailability(itemId);
    set({ menuItems: posDatabase.getMenuItems() });
  },

  openTableModal: () => set({ isTableModalOpen: true }),
  closeTableModal: () => set({ isTableModalOpen: false }),

  openHistoryModal: () => set({ isHistoryModalOpen: true, recentOrders: posDatabase.getOrders() }),
  closeHistoryModal: () => set({ isHistoryModalOpen: false }),

  openSalesReport: () => set({ isSalesReportModalOpen: true }),
  closeSalesReport: () => set({ isSalesReportModalOpen: false }),

  openXReport: () => set({ isXReportModalOpen: true }),
  closeXReport: () => set({ isXReportModalOpen: false }),

  openZReport: () => set({ isZReportModalOpen: true }),
  closeZReport: () => set({ isZReportModalOpen: false }),

  closePrintPreview: () => set({ printPreview: null }),
  setPrintPreview: (preview) => set({ printPreview: preview }),

  printBillPreview: () => {
    const state = get();
    if (state.cart.length === 0) return;

    const dummyOrderNum = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
    const billOrder: Order = {
      id: 0,
      order_number: dummyOrderNum,
      order_type: state.orderType,
      table_id: state.selectedTable?.id,
      table_number: state.selectedTable?.table_number,
      subtotal: state.getSubtotal(),
      discount_amount: state.getDiscountTotal(),
      discount_percentage: state.discountPercentage,
      tax_amount: state.getTaxTotal(),
      service_charge: state.getServiceChargeTotal(),
      total_amount: state.getNetTotal(),
      payment_status: 'unpaid',
      created_at: new Date().toLocaleTimeString(),
      cashier_name: state.activeShift.cashier_name,
      shift_id: state.activeShift.id,
      customer_name: state.customerName,
      customer_phone: state.customerPhone,
      notes: state.orderNotes,
      items: state.cart.map((c, idx) => ({
        id: idx + 1,
        menu_item_id: c.menu_item_id,
        variant_id: c.variant_id,
        item_name: c.item_name,
        variant_name: c.variant_name,
        quantity: c.quantity,
        unit_price: c.unit_price,
        total_price: c.total_price,
        notes: c.notes,
        station: c.station,
      })),
    };

    const billBuilder = buildBillEscPos(billOrder, state.restaurant, 80);

    set({
      printPreview: {
        title: `Guest Check / Bill - ${state.selectedTable ? state.selectedTable.table_number : 'Takeaway'}`,
        type: 'BILL',
        plainText: `Guest Bill for ${state.selectedTable ? state.selectedTable.table_number : 'Takeaway'} (LKR ${billOrder.total_amount.toLocaleString()})`,
        hexDump: billBuilder.getHexDump(),
        width: 80,
        order: billOrder,
      }
    });
  },

  performZClosure: (countedCash: number, cashier: string, notes?: string) => {
    const zReport = posDatabase.closeShiftZReport(countedCash, cashier, notes);
    const zBuilder = buildZReportEscPos(zReport, get().restaurant);

    set({
      activeShift: posDatabase.getActiveShift(),
      isZReportModalOpen: false,
      printPreview: {
        title: `Official Z-Report Closure - ${zReport.shift.register_number}`,
        type: 'Z_REPORT',
        plainText: `Official End of Day Z-Report generated for ${cashier}`,
        hexDump: zBuilder.getHexDump(),
        width: 80,
        zReportData: zReport,
      }
    });

    return zReport;
  },

  loadOrderIntoCart: (order: Order) => {
    const cartItems: CartItem[] = order.items.map(i => ({
      cart_item_id: `reloaded-${i.menu_item_id}-${Date.now()}-${Math.random()}`,
      menu_item_id: i.menu_item_id,
      item_name: i.item_name,
      variant_id: i.variant_id,
      variant_name: i.variant_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
      notes: i.notes,
      station: i.station || 'Kitchen',
    }));

    const table = order.table_id ? get().tables.find(t => t.id === order.table_id) || null : null;

    set({
      cart: cartItems,
      orderType: order.order_type,
      selectedTable: table,
      discountPercentage: order.discount_percentage || 0,
      discountAmount: order.discount_amount || 0,
      customerName: order.customer_name || '',
      customerPhone: order.customer_phone || '',
      orderNotes: order.notes || '',
      isHistoryModalOpen: false,
    });
  },

  // --- RBAC & ADMIN SECURITY ---
  setUserRole: (role: UserRole) => set({ currentUserRole: role }),

  requireAdminAuth: (title: string, onAuthorized: () => void) => {
    if (get().currentUserRole === 'admin') {
      onAuthorized();
      return;
    }
    set({
      isAdminAuthModalOpen: true,
      adminAuthTitle: title,
      adminAuthPendingAction: onAuthorized,
    });
  },

  closeAdminAuthModal: () => {
    set({
      isAdminAuthModalOpen: false,
      adminAuthPendingAction: null,
    });
  },

  verifyAndExecuteAdminAuth: (pin: string) => {
    const isValid = posDatabase.verifyAdminPin(pin);
    if (isValid) {
      const pendingAction = get().adminAuthPendingAction;
      set({
        isAdminAuthModalOpen: false,
        adminAuthPendingAction: null,
      });
      if (pendingAction) {
        pendingAction();
      }
      return true;
    }
    return false;
  },

  // --- CASH DRAWER PAYOUTS & LENDING ---
  openCashPayoutModal: () => {
    get().requireAdminAuth('Authorize Cash Payout / Lending', () => {
      set({ isCashPayoutModalOpen: true });
    });
  },

  closeCashPayoutModal: () => set({ isCashPayoutModalOpen: false }),

  submitCashPayout: (data: Omit<CashTransaction, 'id' | 'timestamp' | 'shift_id'>) => {
    const shift = get().activeShift;
    const txn = posDatabase.recordCashTransaction({
      ...data,
      shift_id: shift.id,
    });

    // Fire hardware solenoid pulse to release cash drawer
    get().triggerDrawerKick(`[${txn.type.toUpperCase()}] to ${txn.recipient} - Rs. ${txn.amount}`);

    set({
      cashTransactions: posDatabase.getCashTransactions(),
      activeShift: posDatabase.getActiveShift(),
      isCashPayoutModalOpen: false,
    });

    // Automatically display thermal payout voucher slip
    get().printPayoutVoucher(txn);

    return txn;
  },

  printPayoutVoucher: (txn: CashTransaction) => {
    const builder = buildPayoutVoucherEscPos(txn, get().restaurant, 80);
    set({
      printPreview: {
        title: `Cash Voucher - #${txn.id.toString().slice(-6)}`,
        type: 'PAYOUT_VOUCHER',
        plainText: `Cash Voucher for ${txn.recipient} (LKR ${txn.amount.toLocaleString()})`,
        hexDump: builder.getHexDump(),
        width: 80,
        payoutData: txn,
      }
    });
  },

  // --- MENU PRICE MANAGEMENT ---
  openMenuPriceModal: () => {
    get().requireAdminAuth('Authorize Menu Price Management', () => {
      set({ isMenuPriceModalOpen: true });
    });
  },

  closeMenuPriceModal: () => set({ isMenuPriceModalOpen: false }),

  updateMenuItemPrice: (itemId: number, newBasePrice: number, variantUpdates?: { id: number; price_adjustment: number }[]) => {
    const success = posDatabase.updateMenuItemPrice(
      itemId, 
      newBasePrice, 
      variantUpdates, 
      get().currentUserRole === 'admin' ? 'Admin Manager' : get().activeShift.cashier_name
    );

    if (success) {
      set({
        menuItems: posDatabase.getMenuItems(),
        priceAudits: posDatabase.getPriceAudits(),
      });
    }

    return success;
  },
}));
