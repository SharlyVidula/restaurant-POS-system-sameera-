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
  PriceChangeAudit,
  TableSession
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
  buildPayoutVoucherEscPos,
  buildOpeningFloatSlipEscPos
} from '../utils/escpos';
import { cloudSyncService } from '../services/cloudSync';

export interface PrintPreviewData {
  title: string;
  type: 'RECEIPT' | 'KOT' | 'BILL' | 'X_REPORT' | 'Z_REPORT' | 'PAYOUT_VOUCHER' | 'OPENING_FLOAT';
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
  shiftData?: ShiftSession;
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
  tableSessions: Record<string, TableSession>;

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
  isOpeningFloatModalOpen: boolean;
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
  addBatchToCart: (
    item: MenuItem, 
    batch: Array<{ variant?: ItemVariant; quantity: number }>, 
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
  openOpeningFloatModal: () => void;
  closeOpeningFloatModal: () => void;
  isOpeningFloatRequired: () => boolean;
  setOpeningFloat: (
    amount: number, 
    cashierName?: string, 
    notes?: string, 
    breakdown?: Record<string, number>, 
    kickDrawer?: boolean, 
    printSlip?: boolean
  ) => ShiftSession;
  closePrintPreview: () => void;
  setPrintPreview: (data: PrintPreviewData | null) => void;
  printBillPreview: () => void;
  performZClosure: (countedCash: number, cashier: string, notes?: string) => ZReportData;
  loadOrderIntoCart: (order: Order) => void;
}

function getSessionKey(orderType: OrderType, tableId?: number | null): string {
  if (orderType === 'dine_in') {
    return tableId ? `table-${tableId}` : 'dine_in_general';
  }
  return orderType;
}

function calculateNetTotalFromCart(
  cart: CartItem[],
  discountPercentage: number = 0,
  discountAmount: number = 0,
  includeServiceCharge: boolean = true,
  includeTax: boolean = false
): number {
  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  let discount = 0;
  if (discountPercentage > 0) {
    discount = (subtotal * discountPercentage) / 100;
  } else if (discountAmount > 0) {
    discount = Math.min(discountAmount, subtotal);
  }
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const serviceCharge = includeServiceCharge ? (discountedSubtotal * 0.10) : 0;
  const tax = includeTax ? (discountedSubtotal * 0.08) : 0;
  return Math.round(discountedSubtotal + serviceCharge + tax);
}

function syncSession(state: {
  orderType: OrderType;
  selectedTable: DiningTable | null;
  cart: CartItem[];
  discountPercentage: number;
  discountAmount: number;
  includeServiceCharge: boolean;
  includeTax: boolean;
  customerName: string;
  customerPhone: string;
  orderNotes: string;
  tableSessions: Record<string, TableSession>;
}): Record<string, TableSession> {
  const key = getSessionKey(state.orderType, state.selectedTable?.id);
  const updatedSessions = { ...state.tableSessions };

  if (state.cart && state.cart.length > 0) {
    const session: TableSession = {
      table_id: state.selectedTable ? state.selectedTable.id : null,
      table_number: state.selectedTable?.table_number,
      order_type: state.orderType,
      cart: state.cart,
      discountPercentage: state.discountPercentage,
      discountAmount: state.discountAmount,
      includeServiceCharge: state.includeServiceCharge,
      includeTax: state.includeTax,
      customerName: state.customerName,
      customerPhone: state.customerPhone,
      orderNotes: state.orderNotes,
      updated_at: new Date().toISOString(),
    };
    updatedSessions[key] = session;

    if (state.orderType === 'dine_in' && state.selectedTable) {
      const net = calculateNetTotalFromCart(
        state.cart,
        state.discountPercentage,
        state.discountAmount,
        state.includeServiceCharge,
        state.includeTax
      );
      posDatabase.updateTableStatus(state.selectedTable.id, 'occupied', undefined, net);
    }
  } else {
    // If cart is empty, remove session for this table
    delete updatedSessions[key];
    if (state.orderType === 'dine_in' && state.selectedTable) {
      posDatabase.updateTableStatus(state.selectedTable.id, 'vacant');
    }
  }

  posDatabase.saveTableSessions(updatedSessions);
  return updatedSessions;
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
  isOpeningFloatModalOpen: false,
  adminAuthTitle: 'Admin Authorization Required',
  adminAuthPendingAction: null,
  printPreview: null,
  drawerPulseActive: false,

  currentUserRole: 'cashier',
  cashTransactions: [],
  priceAudits: [],
  tableSessions: {},

  init: () => {
    posDatabase.initDatabase();
    const needsFloat = posDatabase.isOpeningFloatRequired();
    const savedSessions = posDatabase.getTableSessions();

    // Synchronize stored table sessions with table occupied status and amount in DB
    Object.values(savedSessions).forEach((session) => {
      if (session.order_type === 'dine_in' && session.table_id && session.cart && session.cart.length > 0) {
        const net = calculateNetTotalFromCart(
          session.cart,
          session.discountPercentage || 0,
          session.discountAmount || 0,
          session.includeServiceCharge ?? true,
          session.includeTax ?? false
        );
        posDatabase.updateTableStatus(session.table_id, 'occupied', undefined, net);
      }
    });

    const tables = posDatabase.getTables();
    set({
      categories: posDatabase.getCategories(),
      menuItems: posDatabase.getMenuItems(),
      tables,
      activeShift: posDatabase.getActiveShift(),
      recentOrders: posDatabase.getOrders(),
      cashTransactions: posDatabase.getCashTransactions(),
      priceAudits: posDatabase.getPriceAudits(),
      isOpeningFloatModalOpen: needsFloat,
      tableSessions: savedSessions,
    });
  },

  setOrderType: (type: OrderType) => {
    const state = get();
    if (state.orderType === type && (type !== 'dine_in' || state.selectedTable)) return;

    // 1. Sync and isolate current active session before switching
    const updatedSessions = syncSession(state);

    // 2. Load the isolated session for the destination order type
    if (type === 'dine_in') {
      const targetKey = state.selectedTable ? `table-${state.selectedTable.id}` : 'dine_in_general';
      const targetSession = updatedSessions[targetKey];

      set({
        orderType: type,
        includeServiceCharge: true,
        cart: targetSession?.cart || [],
        discountPercentage: targetSession?.discountPercentage || 0,
        discountAmount: targetSession?.discountAmount || 0,
        includeTax: targetSession?.includeTax ?? false,
        customerName: targetSession?.customerName || '',
        customerPhone: targetSession?.customerPhone || '',
        orderNotes: targetSession?.orderNotes || '',
        tableSessions: updatedSessions,
        tables: posDatabase.getTables(),
      });
    } else {
      const targetKey = type;
      const targetSession = updatedSessions[targetKey];

      set({
        orderType: type,
        selectedTable: null,
        includeServiceCharge: false,
        cart: targetSession?.cart || [],
        discountPercentage: targetSession?.discountPercentage || 0,
        discountAmount: targetSession?.discountAmount || 0,
        includeTax: targetSession?.includeTax ?? false,
        customerName: targetSession?.customerName || '',
        customerPhone: targetSession?.customerPhone || '',
        orderNotes: targetSession?.orderNotes || '',
        tableSessions: updatedSessions,
        tables: posDatabase.getTables(),
      });
    }
  },

  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectTable: (table) => {
    const state = get();

    // 1. Save and isolate the current table's order session before switching
    const updatedSessions = syncSession(state);

    // 2. Load the target table's own independent session
    if (table) {
      const targetKey = `table-${table.id}`;
      const targetSession = updatedSessions[targetKey];

      set({
        selectedTable: table,
        orderType: 'dine_in',
        cart: targetSession?.cart || [],
        discountPercentage: targetSession?.discountPercentage || 0,
        discountAmount: targetSession?.discountAmount || 0,
        includeServiceCharge: targetSession?.includeServiceCharge ?? true,
        includeTax: targetSession?.includeTax ?? false,
        customerName: targetSession?.customerName || '',
        customerPhone: targetSession?.customerPhone || '',
        orderNotes: targetSession?.orderNotes || '',
        tableSessions: updatedSessions,
        tables: posDatabase.getTables(),
        isTableModalOpen: false,
      });
    } else {
      const targetKey = 'dine_in_general';
      const targetSession = updatedSessions[targetKey];

      set({
        selectedTable: null,
        orderType: 'dine_in',
        cart: targetSession?.cart || [],
        discountPercentage: targetSession?.discountPercentage || 0,
        discountAmount: targetSession?.discountAmount || 0,
        includeServiceCharge: targetSession?.includeServiceCharge ?? true,
        includeTax: targetSession?.includeTax ?? false,
        customerName: targetSession?.customerName || '',
        customerPhone: targetSession?.customerPhone || '',
        orderNotes: targetSession?.orderNotes || '',
        tableSessions: updatedSessions,
        tables: posDatabase.getTables(),
        isTableModalOpen: false,
      });
    }
  },

  openVariantModal: (item) => set({ variantModalItem: item }),
  closeVariantModal: () => set({ variantModalItem: null }),

  addBatchToCart: (item, batch, notes = '', modifiers = []) => {
    const state = get();
    let currentCart = [...state.cart];
    const modifierTotal = modifiers.reduce((acc, m) => acc + m.price, 0);
    const modifierKey = modifiers.map(m => m.name).sort().join('|');

    batch.forEach(({ variant, quantity }) => {
      if (quantity <= 0) return;
      const unitPrice = (item.base_price + (variant ? variant.price_adjustment : 0)) + modifierTotal;
      
      const existingIndex = currentCart.findIndex(c => 
        c.menu_item_id === item.id && 
        c.variant_id === (variant?.id || undefined) &&
        (c.notes || '') === notes &&
        (c.modifiers || []).map(m => m.name).sort().join('|') === modifierKey
      );

      if (existingIndex > -1) {
        const existing = currentCart[existingIndex];
        const newQty = existing.quantity + quantity;
        currentCart[existingIndex] = {
          ...existing,
          quantity: newQty,
          total_price: newQty * existing.unit_price,
        };
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
        currentCart.push(newCartItem);
      }
    });

    const updatedSessions = syncSession({ ...state, cart: currentCart });
    set({
      cart: currentCart,
      variantModalItem: null,
      tableSessions: updatedSessions,
      tables: posDatabase.getTables(),
    });
  },

  addToCart: (item, variant, quantity = 1, notes = '', modifiers = []) => {
    get().addBatchToCart(item, [{ variant, quantity }], notes, modifiers);
  },

  quickAddStepper: (item, delta) => {
    const state = get();
    const existing = state.cart.find(c => c.menu_item_id === item.id && !c.variant_id);
    let updatedCart = [...state.cart];
    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        updatedCart = updatedCart.filter(c => c.cart_item_id !== existing.cart_item_id);
      } else {
        updatedCart = updatedCart.map(c => c.cart_item_id === existing.cart_item_id ? {
          ...c,
          quantity: newQty,
          total_price: newQty * c.unit_price,
        } : c);
      }
    } else if (delta > 0) {
      get().addToCart(item, undefined, delta);
      return;
    }
    const updatedSessions = syncSession({ ...state, cart: updatedCart });
    set({
      cart: updatedCart,
      tableSessions: updatedSessions,
      tables: posDatabase.getTables(),
    });
  },

  updateCartQuantity: (cartItemId, delta) => {
    const state = get();
    const target = state.cart.find(c => c.cart_item_id === cartItemId);
    if (!target) return;

    const newQty = target.quantity + delta;
    let updatedCart: CartItem[];
    if (newQty <= 0) {
      updatedCart = state.cart.filter(c => c.cart_item_id !== cartItemId);
    } else {
      updatedCart = state.cart.map(c => c.cart_item_id === cartItemId ? {
        ...c,
        quantity: newQty,
        total_price: newQty * c.unit_price,
      } : c);
    }
    const updatedSessions = syncSession({ ...state, cart: updatedCart });
    set({
      cart: updatedCart,
      tableSessions: updatedSessions,
      tables: posDatabase.getTables(),
    });
  },

  removeCartItem: (cartItemId) => {
    const state = get();
    const updatedCart = state.cart.filter(c => c.cart_item_id !== cartItemId);
    const updatedSessions = syncSession({ ...state, cart: updatedCart });
    set({
      cart: updatedCart,
      tableSessions: updatedSessions,
      tables: posDatabase.getTables(),
    });
  },

  clearCart: () => {
    const state = get();
    const key = getSessionKey(state.orderType, state.selectedTable?.id);
    const updatedSessions = { ...state.tableSessions };
    delete updatedSessions[key];
    posDatabase.saveTableSessions(updatedSessions);

    if (state.orderType === 'dine_in' && state.selectedTable) {
      posDatabase.updateTableStatus(state.selectedTable.id, 'vacant');
    }

    set({
      cart: [],
      discountPercentage: 0,
      discountAmount: 0,
      customerName: '',
      customerPhone: '',
      orderNotes: '',
      tableSessions: updatedSessions,
      tables: posDatabase.getTables(),
    });
  },

  setDiscountPercentage: (pct) => {
    set(state => {
      const next = { ...state, discountPercentage: pct, discountAmount: 0 };
      const updatedSessions = syncSession(next);
      return { discountPercentage: pct, discountAmount: 0, tableSessions: updatedSessions };
    });
  },
  setDiscountAmount: (amt) => {
    set(state => {
      const next = { ...state, discountAmount: amt, discountPercentage: 0 };
      const updatedSessions = syncSession(next);
      return { discountAmount: amt, discountPercentage: 0, tableSessions: updatedSessions };
    });
  },
  toggleServiceCharge: () => {
    set(state => {
      const next = { ...state, includeServiceCharge: !state.includeServiceCharge };
      const updatedSessions = syncSession(next);
      return { includeServiceCharge: !state.includeServiceCharge, tableSessions: updatedSessions };
    });
  },
  toggleTax: () => {
    set(state => {
      const next = { ...state, includeTax: !state.includeTax };
      const updatedSessions = syncSession(next);
      return { includeTax: !state.includeTax, tableSessions: updatedSessions };
    });
  },
  setCustomerInfo: (name, phone) => {
    set(state => {
      const next = { ...state, customerName: name, customerPhone: phone };
      const updatedSessions = syncSession(next);
      return { customerName: name, customerPhone: phone, tableSessions: updatedSessions };
    });
  },
  setOrderNotes: (notes) => {
    set(state => {
      const next = { ...state, orderNotes: notes };
      const updatedSessions = syncSession(next);
      return { orderNotes: notes, tableSessions: updatedSessions };
    });
  },

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

    // Clean up settled table/order session
    const key = getSessionKey(state.orderType, state.selectedTable?.id);
    const updatedSessions = { ...state.tableSessions };
    delete updatedSessions[key];
    posDatabase.saveTableSessions(updatedSessions);

    if (state.orderType === 'dine_in' && state.selectedTable) {
      posDatabase.updateTableStatus(state.selectedTable.id, 'vacant');
    }

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
      tableSessions: updatedSessions,
      printPreview: {
        title: `Customer Thermal Receipt - #${savedOrder.order_number}`,
        type: 'RECEIPT',
        plainText: `Receipt for #${savedOrder.order_number} (LKR ${savedOrder.total_amount.toLocaleString()})`,
        hexDump: receiptBuilder.getHexDump(),
        width: 80,
        order: savedOrder,
      }
    });

    // Trigger cloud sync in background for real-time remote sales monitoring (non-blocking)
    cloudSyncService.triggerSync(`Order #${savedOrder.order_number}`).catch(err => {
      console.warn('[CloudSync] Auto-sync notice:', err);
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

  openOpeningFloatModal: () => set({ isOpeningFloatModalOpen: true }),
  closeOpeningFloatModal: () => set({ isOpeningFloatModalOpen: false }),
  isOpeningFloatRequired: () => posDatabase.isOpeningFloatRequired(),

  setOpeningFloat: (amount, cashierName, notes, breakdown, kickDrawer = true, printSlip = true) => {
    const adminName = get().currentUserRole === 'admin' ? 'Admin Manager' : 'Admin Supervisor';
    const shift = posDatabase.setOpeningFloat(amount, adminName, cashierName, notes, breakdown);

    if (kickDrawer) {
      get().triggerDrawerKick(`Opening Float Rs. ${amount.toLocaleString()} set`);
    }

    if (printSlip) {
      const builder = buildOpeningFloatSlipEscPos(shift, get().restaurant, adminName, breakdown);
      set({
        printPreview: {
          title: `Opening Cash Float Voucher - Rs. ${amount.toLocaleString('en-LK')}`,
          type: 'OPENING_FLOAT',
          plainText: `Day Start Opening Float: Rs. ${amount.toLocaleString('en-LK')}`,
          hexDump: builder.getHexDump(),
          width: 80,
          shiftData: shift,
        }
      });
    }

    set({
      activeShift: shift,
      isOpeningFloatModalOpen: false,
      cashTransactions: posDatabase.getCashTransactions(),
    });

    return shift;
  },

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

    if (state.orderType === 'dine_in' && state.selectedTable) {
      posDatabase.updateTableStatus(state.selectedTable.id, 'billed', undefined, state.getNetTotal());
    }

    set({
      tables: posDatabase.getTables(),
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

    const nextState = {
      ...get(),
      cart: cartItems,
      orderType: order.order_type,
      selectedTable: table,
      discountPercentage: order.discount_percentage || 0,
      discountAmount: order.discount_amount || 0,
      customerName: order.customer_name || '',
      customerPhone: order.customer_phone || '',
      orderNotes: order.notes || '',
    };
    const updatedSessions = syncSession(nextState);

    set({
      cart: cartItems,
      orderType: order.order_type,
      selectedTable: table,
      discountPercentage: order.discount_percentage || 0,
      discountAmount: order.discount_amount || 0,
      customerName: order.customer_name || '',
      customerPhone: order.customer_phone || '',
      orderNotes: order.notes || '',
      tableSessions: updatedSessions,
      tables: posDatabase.getTables(),
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
