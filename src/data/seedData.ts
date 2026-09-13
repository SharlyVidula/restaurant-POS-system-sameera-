import { Category, MenuItem, DiningTable, RestaurantProfile, ShiftSession } from '../types';

export const RESTAURANT_PROFILE: RestaurantProfile = {
  name: "SOUTHERN SPOON",
  branch: "Galle Fort Branch",
  address: "42, Church Street, Galle Fort",
  city: "Galle 80000, Sri Lanka",
  hotline: "+94 (091) 224-8890 / +94 77 345 6789",
  tax_number: "VAT: 114872900-7000",
  wifi_ssid: "SouthernSpoon_Guest",
  wifi_pass: "southernspoon2026",
  footer_message: "Ayubowan! Bohoma Sthuthi for dining at Southern Spoon Galle.",
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Rice & Curry", display_order: 1, icon: "Soup", color: "bg-amber-600" },
  { id: 2, name: "Fried Rice", display_order: 2, icon: "Flame", color: "bg-orange-600" },
  { id: 3, name: "Kottu Station", display_order: 3, icon: "UtensilsCrossed", color: "bg-red-600" },
  { id: 4, name: "Short Eats & Breads", display_order: 4, icon: "Cookie", color: "bg-yellow-600" },
  { id: 5, name: "Fresh Juices", display_order: 5, icon: "GlassWater", color: "bg-emerald-600" },
  { id: 6, name: "Soft Drinks", display_order: 6, icon: "CupSoda", color: "bg-blue-600" },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // 1. Rice & Curry (Lunch Special)
  {
    id: 101,
    category_id: 1,
    name: "Rice & Curry Plate",
    base_price: 450,
    is_available: true,
    description: "Authentic Southern Sri Lankan rice plate with 4 veg curries, papadam, dry chili & pol sambol",
    station: "Curry Counter",
    badge: "Authentic Galle Special",
    variants: [
      { id: 1001, menu_item_id: 101, variant_name: "Vegetable (No Meat)", price_adjustment: 0 },
      { id: 1002, menu_item_id: 101, variant_name: "Ceylon Chicken Curry", price_adjustment: 200 }, // Total: 650
      { id: 1003, menu_item_id: 101, variant_name: "Freshwater Fish (Lula/Thilapia)", price_adjustment: 250 }, // Total: 700
      { id: 1004, menu_item_id: 101, variant_name: "Galle Saltwater Tuna (Ambulthiyal)", price_adjustment: 300 }, // Total: 750
      { id: 1005, menu_item_id: 101, variant_name: "Black Pepper Pork Curry", price_adjustment: 350 }, // Total: 800
    ],
    default_notes: ["Extra Pol Sambol", "Less Spicy", "No Papadam", "Extra Gravy"],
  },

  // 2. Fried Rice (Wok Station) - Unified Master Item
  {
    id: 201,
    category_id: 2,
    name: "Ceylon Wok Fried Rice",
    base_price: 650,
    is_available: true,
    description: "Authentic wok-tossed basmati rice with spring onions, carrots & signature chili paste. Choose your style.",
    station: "Wok Station",
    badge: "Bestseller",
    variants: [
      { id: 2001, menu_item_id: 201, variant_name: "Vegetable", price_adjustment: 0 },
      { id: 2002, menu_item_id: 201, variant_name: "Double Egg", price_adjustment: 50 },
      { id: 2003, menu_item_id: 201, variant_name: "Ceylon Chicken", price_adjustment: 200 },
      { id: 2004, menu_item_id: 201, variant_name: "Southern Seafood (Prawns & Fish)", price_adjustment: 300 },
      { id: 2005, menu_item_id: 201, variant_name: "Mixed Special (Chicken, Seafood & Egg)", price_adjustment: 400 },
    ],
    default_notes: ["Extra Chili Paste", "No Onion", "Less Oil", "Spicy", "Chili Sauce on Side"],
  },

  // 3. Kottu Station (Wok Station) - Unified Master Item
  {
    id: 301,
    category_id: 3,
    name: "Sri Lankan Kottu Roti",
    base_price: 600,
    is_available: true,
    description: "Godamba roti chopped on a sizzling griddle with leeks, cabbage, eggs & curry gravy. Choose your style.",
    station: "Wok Station",
    badge: "Street Food Favorite",
    variants: [
      { id: 3001, menu_item_id: 301, variant_name: "Vegetable", price_adjustment: 0 },
      { id: 3002, menu_item_id: 301, variant_name: "Double Egg", price_adjustment: 100 },
      { id: 3003, menu_item_id: 301, variant_name: "Spicy Chicken", price_adjustment: 250 },
      { id: 3004, menu_item_id: 301, variant_name: "Southern Seafood", price_adjustment: 350 },
      { id: 3005, menu_item_id: 301, variant_name: "Cheese Chicken Kottu", price_adjustment: 450 },
      { id: 3006, menu_item_id: 301, variant_name: "Dolphin Cut Chicken Kottu", price_adjustment: 500 },
      { id: 3007, menu_item_id: 301, variant_name: "Galle Mixed Meat & Seafood", price_adjustment: 500 },
    ],
    default_notes: ["Extra Curry Gravy", "Medium Spicy", "Very Spicy", "Gravy on Side", "Less Salt"],
  },

  // 4. Short Eats & Breads (Fast Stepper Add-ons)
  {
    id: 401,
    category_id: 4,
    name: "Plain Hopper (Appa)",
    base_price: 50,
    is_available: true,
    description: "Crispy rimmed fermented rice flour bowl with soft fluffy center",
    station: "Short Eats",
    has_stepper: true,
  },
  {
    id: 402,
    category_id: 4,
    name: "Egg Hopper (Biththara Appa)",
    base_price: 120,
    is_available: true,
    description: "Crispy hopper with whole farm egg cooked sunny-side with black pepper",
    station: "Short Eats",
    has_stepper: true,
  },
  {
    id: 403,
    category_id: 4,
    name: "Ceylon Parata Roti",
    base_price: 80,
    is_available: true,
    description: "Layered, flaky griddled flatbread served hot",
    station: "Short Eats",
    has_stepper: true,
  },
  {
    id: 404,
    category_id: 4,
    name: "Egg Roti Flatbread",
    base_price: 140,
    is_available: true,
    description: "Godamba roti folded with onion, green chili and egg inside",
    station: "Short Eats",
    has_stepper: true,
  },
  {
    id: 405,
    category_id: 4,
    name: "Spicy Egg Roll",
    base_price: 100,
    is_available: true,
    description: "Crispy breadcrumbed roll stuffed with spiced egg and potato masala",
    station: "Short Eats",
    has_stepper: true,
  },
  {
    id: 406,
    category_id: 4,
    name: "Southern Fish Roll (Chinese Roll)",
    base_price: 110,
    is_available: true,
    description: "Golden crumbed pancake roll filled with Galle tuna, potato and black pepper",
    station: "Short Eats",
    badge: "Hot & Crispy",
    has_stepper: true,
  },

  // 5. Fresh Juices (Beverage Counter)
  {
    id: 501,
    category_id: 5,
    name: "Mixed Tropical Fruit Juice",
    base_price: 450,
    is_available: true,
    description: "Fresh blend of mango, papaya, pineapple, and passion fruit",
    station: "Beverage Bar",
    badge: "Freshly Pressed",
    default_notes: ["Normal Sugar", "With Ice"],
  },
  {
    id: 502,
    category_id: 5,
    name: "Fresh Mango Juice",
    base_price: 500,
    is_available: true,
    description: "Pure Jaffna Karthacolomban sweet mango blend",
    station: "Beverage Bar",
    default_notes: ["Normal Sugar", "With Ice"],
  },
  {
    id: 503,
    category_id: 5,
    name: "Fresh Watermelon Juice",
    base_price: 400,
    is_available: true,
    description: "Hydrating cold-pressed sweet red watermelon",
    station: "Beverage Bar",
    default_notes: ["No Sugar", "With Ice"],
  },
  {
    id: 504,
    category_id: 5,
    name: "Traditional Woodapple Juice",
    base_price: 450,
    is_available: true,
    description: "Creamy Divul fruit blended with pure coconut milk and kithul treacle",
    station: "Beverage Bar",
    badge: "Ceylon Favorite",
    default_notes: ["With Kithul Jaggery", "With Ice"],
  },
  {
    id: 505,
    category_id: 5,
    name: "Sweet Papaya Juice",
    base_price: 400,
    is_available: true,
    description: "Ripe Red Lady papaya with a dash of fresh lime juice",
    station: "Beverage Bar",
    default_notes: ["Normal Sugar", "With Lime"],
  },
  {
    id: 506,
    category_id: 5,
    name: "Exotic Dragon Fruit Juice",
    base_price: 550,
    is_available: true,
    description: "Vibrant red pitaya blended fresh to order",
    station: "Beverage Bar",
    default_notes: ["Less Sugar", "With Ice"],
  },

  // 6. Soft Drinks & Bottled Beverages
  {
    id: 601,
    category_id: 6,
    name: "Elephant House Ginger Beer (EGB)",
    base_price: 180,
    is_available: true,
    description: "Iconic Sri Lankan natural ginger soda in chilled 300ml bottle",
    station: "Beverage Bar",
    badge: "Ceylon Classic",
    has_stepper: true,
  },
  {
    id: 602,
    category_id: 6,
    name: "Coca-Cola (300ml Glass Bottle)",
    base_price: 180,
    is_available: true,
    description: "Chilled classic Coca-Cola",
    station: "Beverage Bar",
    has_stepper: true,
  },
  {
    id: 603,
    category_id: 6,
    name: "Sprite (300ml Glass Bottle)",
    base_price: 180,
    is_available: true,
    description: "Crisp lemon-lime refreshment",
    station: "Beverage Bar",
    has_stepper: true,
  },
  {
    id: 604,
    category_id: 6,
    name: "Elephant House Soda (300ml)",
    base_price: 150,
    is_available: true,
    description: "Sparkling bubbly soda water",
    station: "Beverage Bar",
    has_stepper: true,
  },
  {
    id: 605,
    category_id: 6,
    name: "Mineral Water (500ml Bottled)",
    base_price: 120,
    is_available: true,
    description: "Pure bottled natural mineral drinking water",
    station: "Beverage Bar",
    has_stepper: true,
  },
];

export const INITIAL_TABLES: DiningTable[] = [
  // Galle Fort Courtyard Zone (Outdoor Garden breeze)
  { id: 1, table_number: "T-01", capacity: 2, status: "vacant", zone: "Galle Fort Courtyard" },
  { id: 2, table_number: "T-02", capacity: 4, status: "vacant", zone: "Galle Fort Courtyard" },
  { id: 3, table_number: "T-03", capacity: 4, status: "occupied", zone: "Galle Fort Courtyard", occupied_at: "2026-08-24 14:15", current_amount: 3250 },
  { id: 4, table_number: "T-04", capacity: 6, status: "vacant", zone: "Galle Fort Courtyard" },

  // Main Dining Hall (Ground Floor)
  { id: 5, table_number: "T-05", capacity: 4, status: "vacant", zone: "Main Dining Hall" },
  { id: 6, table_number: "T-06", capacity: 4, status: "billed", zone: "Main Dining Hall", occupied_at: "2026-08-24 13:40", current_amount: 4800 },
  { id: 7, table_number: "T-07", capacity: 6, status: "vacant", zone: "Main Dining Hall" },
  { id: 8, table_number: "T-08", capacity: 8, status: "vacant", zone: "Main Dining Hall" },

  // AC Lounge (1st Floor)
  { id: 9, table_number: "T-09", capacity: 4, status: "vacant", zone: "AC Lounge" },
  { id: 10, table_number: "T-10", capacity: 8, status: "vacant", zone: "AC Lounge" },
];

export const INITIAL_SHIFT: ShiftSession = {
  id: 101,
  cashier_name: "Kasun Perera",
  register_number: "REG-01",
  branch_name: "Galle Fort Main Branch",
  opening_float: 15000.0, // Rs. 15,000 float in LKR notes & coins
  opened_at: new Date().toISOString().split('T')[0] + " 08:30:00",
  status: "open",
  total_sales: 38750.0,
  cash_sales: 22400.0,
  card_sales: 11850.0,
  qr_sales: 4500.0,
  total_discounts: 1200.0,
  void_count: 1,
  cash_drawer_expected: 37400.0, // 15000 float + 22400 cash sales
};
