export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type TableStatus = 'vacant' | 'occupied' | 'billed';
export type PaymentMethod = 'cash' | 'card' | 'qr' | 'split';
export type PaymentStatus = 'unpaid' | 'paid' | 'void';

export interface Category {
  id: number;
  name: string;
  display_order: number;
  icon?: string;
  color?: string;
}

export interface ItemVariant {
  id: number;
  menu_item_id: number;
  variant_name: string;
  price_adjustment: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  category: 'sugar' | 'ice' | 'addon' | 'spice';
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  base_price: number;
  is_available: boolean;
  description?: string;
  variants?: ItemVariant[];
  has_stepper?: boolean; // For short-eats +1, +2, +5
  default_notes?: string[];
  station?: 'Wok Station' | 'Curry Counter' | 'Short Eats' | 'Beverage Bar' | 'Kitchen' | 'Kottu Griddle' | 'Juice Bar' | 'Dessert Bar';
  badge?: string;
}

export interface DiningTable {
  id: number;
  table_number: string;
  capacity: number;
  status: TableStatus;
  zone: 'Galle Fort Courtyard' | 'Main Dining Hall' | 'AC Lounge';
  active_order_id?: number;
  occupied_at?: string;
  current_amount?: number;
}

export interface CartItemModifier {
  name: string;
  price: number;
}

export interface CartItem {
  cart_item_id: string;
  menu_item_id: number;
  item_name: string;
  variant_id?: number;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  modifiers?: CartItemModifier[];
  station: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  menu_item_id: number;
  variant_id?: number;
  item_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  station?: string;
}

export interface Order {
  id: number;
  order_number: string;
  order_type: OrderType;
  table_id?: number;
  table_number?: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage?: number;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  cash_tendered?: number;
  change_returned?: number;
  card_reference?: string;
  qr_reference?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  paid_at?: string;
  cashier_name: string;
  shift_id: number;
  items: OrderItem[];
}

export interface ShiftSession {
  id: number;
  cashier_name: string;
  register_number: string;
  branch_name: string;
  opening_float: number;
  opened_at: string;
  closed_at?: string;
  status: 'open' | 'closed';
  total_sales: number;
  cash_sales: number;
  card_sales: number;
  qr_sales: number;
  total_discounts: number;
  void_count: number;
  cash_drawer_expected: number;
  cash_drawer_counted?: number;
  discrepancy?: number;
  notes?: string;
  total_payouts?: number;
  total_cash_in?: number;
}

export interface CashTransaction {
  id: number;
  timestamp: string;
  type: 'lending' | 'expense' | 'drop' | 'float_in' | 'no_sale';
  amount: number;
  recipient: string;
  reason: string;
  authorized_by: string;
  cashier_name: string;
  shift_id: number;
}

export interface PriceChangeAudit {
  id: number;
  item_id: number;
  item_name: string;
  old_price: number;
  new_price: number;
  timestamp: string;
  changed_by: string;
}

export type UserRole = 'cashier' | 'admin';

export interface XReportData {
  shift: ShiftSession;
  order_count: number;
  items_sold_count: number;
  sales_by_category: { category_name: string; total_amount: number; item_count: number }[];
  sales_by_payment: { method: string; count: number; total: number }[];
  discount_total: number;
  void_total: number;
  generated_at: string;
  cash_payouts?: CashTransaction[];
  total_payouts?: number;
}

export interface ZReportData extends XReportData {
  closing_timestamp: string;
  drawer_counted: number;
  over_short: number;
  closing_cashier: string;
}

export interface RestaurantProfile {
  name: string;
  branch: string;
  address: string;
  city: string;
  hotline: string;
  tax_number: string;
  wifi_ssid: string;
  wifi_pass: string;
  footer_message: string;
}

export interface DailySalesReportData {
  date: string; // YYYY-MM-DD
  generated_at: string;
  order_count: number;
  total_gross_sales: number;
  total_discount: number;
  total_net_sales: number;
  total_tax: number;
  total_service_charge: number;
  total_items_sold: number;
  average_order_value: number;
  sales_by_payment: { method: string; count: number; total: number; percentage: number }[];
  sales_by_category: { category_name: string; item_count: number; total_amount: number; percentage: number }[];
  top_selling_items: { item_name: string; quantity: number; revenue: number }[];
  orders: Array<{
    order_number: string;
    time: string;
    total: number;
    payment_method: string;
    items_count: number;
    table?: string;
  }>;
}

export interface MonthlySalesReportData {
  year: number;
  month: number; // 1-12
  month_name: string;
  generated_at: string;
  total_days_active: number;
  total_orders: number;
  total_gross_sales: number;
  total_discount: number;
  total_net_sales: number;
  total_tax: number;
  total_service_charge: number;
  total_items_sold: number;
  average_daily_sales: number;
  sales_by_payment: { method: string; count: number; total: number; percentage: number }[];
  sales_by_category: { category_name: string; item_count: number; total_amount: number; percentage: number }[];
  daily_breakdown: Array<{
    date: string; // YYYY-MM-DD
    day: number;
    order_count: number;
    cash_total: number;
    card_total: number;
    qr_total: number;
    total_sales: number;
  }>;
}
