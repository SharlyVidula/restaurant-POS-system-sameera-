import { Category, MenuItem, DiningTable, RestaurantProfile, ShiftSession } from '../types';

export const RESTAURANT_PROFILE: RestaurantProfile = {
  name: "SOUTHERN SPOON",
  branch: "Labuduwa, Galle",
  address: "Labuduwa, Galle",
  city: "Galle, Sri Lanka",
  hotline: "070 7 555 855 / 077 5 231 931",
  tax_number: "VAT: 114872900-7000",
  wifi_ssid: "SouthernSpoon_Guest",
  wifi_pass: "southernspoon2026",
  footer_message: "Ayubowan! Bohoma Sthuthi for dining at Southern Spoon.",
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Rice", display_order: 1, icon: "Flame", color: "bg-amber-600" },
  { id: 2, name: "Kottu", display_order: 2, icon: "UtensilsCrossed", color: "bg-red-600" },
  { id: 3, name: "Noodles", display_order: 3, icon: "Soup", color: "bg-orange-600" },
  { id: 4, name: "Devilled (200g)", display_order: 4, icon: "Flame", color: "bg-rose-600" },
  { id: 5, name: "Chopsy", display_order: 5, icon: "Soup", color: "bg-yellow-600" },
  { id: 6, name: "Fruit Juice", display_order: 6, icon: "GlassWater", color: "bg-emerald-600" },
  { id: 7, name: "Desserts", display_order: 7, icon: "Cookie", color: "bg-blue-600" },
  { id: 8, name: "Soft Drinks", display_order: 8, icon: "CupSoda", color: "bg-cyan-600" },
  { id: 9, name: "Extras", display_order: 9, icon: "Sparkles", color: "bg-amber-500" },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // ==========================================
  // 1. RICE (රයිස්) - Half / Full
  // ==========================================
  {
    id: 101,
    category_id: 1,
    name: "Vegetable Rice",
    base_price: 400,
    is_available: true,
    description: "එළවළු රයිස් - Wok-tossed basmati rice with farm fresh garden vegetables and chili paste.",
    station: "Wok Station",
    badge: "Popular",
    variants: [
      { id: 1001, menu_item_id: 101, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 1002, menu_item_id: 101, variant_name: "Full Portion", price_adjustment: 200 }, // 600
    ],
    default_notes: ["Extra Chili Paste", "Less Oil", "Spicy"],
  },
  {
    id: 102,
    category_id: 1,
    name: "Egg Rice",
    base_price: 600,
    is_available: true,
    description: "බිත්තර රයිස් - Classic wok fried rice scrambled with fresh farm eggs and scallions.",
    station: "Wok Station",
    variants: [
      { id: 1003, menu_item_id: 102, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 1004, menu_item_id: 102, variant_name: "Full Portion", price_adjustment: 200 }, // 800
    ],
    default_notes: ["Extra Egg", "Chili Paste"],
  },
  {
    id: 103,
    category_id: 1,
    name: "Fish Rice",
    base_price: 600,
    is_available: true,
    description: "මාළු රයිස් - Wok-fried rice tossed with fresh Galle harbor seasoned fish cubes.",
    station: "Wok Station",
    variants: [
      { id: 1005, menu_item_id: 103, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 1006, menu_item_id: 103, variant_name: "Full Portion", price_adjustment: 300 }, // 900
    ],
    default_notes: ["Crispy Fish", "Extra Gravy"],
  },
  {
    id: 104,
    category_id: 1,
    name: "Chicken Rice",
    base_price: 700,
    is_available: true,
    description: "චිකන් රයිස් - Fragrant basmati rice stir-fried with seasoned chicken pieces and signature spices.",
    station: "Wok Station",
    badge: "Bestseller",
    variants: [
      { id: 1007, menu_item_id: 104, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 1008, menu_item_id: 104, variant_name: "Full Portion", price_adjustment: 300 }, // 1000
    ],
    default_notes: ["Extra Spicy", "Extra Chicken Piece"],
  },
  {
    id: 105,
    category_id: 1,
    name: "Sea Food Rice",
    base_price: 900,
    is_available: true,
    description: "සී ෆුඩ් රයිස් - Southern specialty fried rice packed with fresh prawns, cuttlefish & fish.",
    station: "Wok Station",
    badge: "Special",
    variants: [
      { id: 1009, menu_item_id: 105, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 1010, menu_item_id: 105, variant_name: "Full Portion", price_adjustment: 500 }, // 1400
    ],
    default_notes: ["Extra Prawns", "Lime & Chili"],
  },
  {
    id: 106,
    category_id: 1,
    name: "Pork Rice",
    base_price: 900,
    is_available: true,
    description: "පෝර්ක් රයිස් - Hearty fried rice tossed with tender roasted pork pieces and garlic.",
    station: "Wok Station",
    variants: [
      { id: 1011, menu_item_id: 106, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 1012, menu_item_id: 106, variant_name: "Full Portion", price_adjustment: 500 }, // 1400
    ],
    default_notes: ["Roast Pork", "Spicy"],
  },
  {
    id: 107,
    category_id: 1,
    name: "Mix Rice",
    base_price: 1000,
    is_available: true,
    description: "මික්ස් රයිස් - Chef's deluxe mix with chicken, seafood, egg and aromatic basmati rice.",
    station: "Wok Station",
    badge: "Chef Special",
    variants: [
      { id: 1013, menu_item_id: 107, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 1014, menu_item_id: 107, variant_name: "Full Portion", price_adjustment: 500 }, // 1500
    ],
    default_notes: ["All Meats", "Extra Chili Paste"],
  },
  {
    id: 108,
    category_id: 1,
    name: "Chopsy Rice",
    base_price: 1000,
    is_available: true,
    description: "චොප්සි රයිස් - Golden fried rice topped with rich Chinese chop suey gravy and sunny egg.",
    station: "Wok Station",
    badge: "Must Try",
    variants: [
      { id: 1015, menu_item_id: 108, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 1016, menu_item_id: 108, variant_name: "Full Portion", price_adjustment: 500 }, // 1500
    ],
    default_notes: ["Crispy Egg On Top", "Saucy"],
  },

  // ==========================================
  // 2. KOTTU (කොත්තු) - Half / Full
  // ==========================================
  {
    id: 201,
    category_id: 2,
    name: "Egg Kottu",
    base_price: 600,
    is_available: true,
    description: "බිත්තර කොත්තු - Street-style shredded godamba roti chopped with double egg, leeks, carrots and spices.",
    station: "Kottu Griddle",
    variants: [
      { id: 2001, menu_item_id: 201, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 2002, menu_item_id: 201, variant_name: "Full Portion", price_adjustment: 200 }, // 800
    ],
    default_notes: ["Extra Gravy", "Medium Spicy"],
  },
  {
    id: 202,
    category_id: 2,
    name: "Fish Kottu",
    base_price: 600,
    is_available: true,
    description: "මාළු කොත්තු - Spicy chopped godamba roti tossed with savory fish curry and fresh vegetables.",
    station: "Kottu Griddle",
    variants: [
      { id: 2003, menu_item_id: 202, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 2004, menu_item_id: 202, variant_name: "Full Portion", price_adjustment: 300 }, // 900
    ],
    default_notes: ["Extra Fish Gravy"],
  },
  {
    id: 203,
    category_id: 2,
    name: "Chicken Kottu",
    base_price: 700,
    is_available: true,
    description: "චිකන් කොත්තු - Signature Sri Lankan chicken kottu roti with thick spicy chicken curry reduction.",
    station: "Kottu Griddle",
    badge: "Bestseller",
    variants: [
      { id: 2005, menu_item_id: 203, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 2006, menu_item_id: 203, variant_name: "Full Portion", price_adjustment: 300 }, // 1000
    ],
    default_notes: ["Spicy", "Extra Chicken Gravy"],
  },
  {
    id: 204,
    category_id: 2,
    name: "Pork Kottu",
    base_price: 900,
    is_available: true,
    description: "පෝර්ක් කොත්තු - Chopped roti cooked on hot iron griddle with rich southern roasted pork.",
    station: "Kottu Griddle",
    variants: [
      { id: 2007, menu_item_id: 204, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 2008, menu_item_id: 204, variant_name: "Full Portion", price_adjustment: 500 }, // 1400
    ],
    default_notes: ["Black Pepper Pork"],
  },
  {
    id: 205,
    category_id: 2,
    name: "String Hoppers Kottu",
    base_price: 900,
    is_available: true,
    description: "ඉඳි ආප්ප කොත්තු - Delicate steamed string hoppers chopped with egg, spices and vegetables.",
    station: "Kottu Griddle",
    badge: "Galle Favorite",
    variants: [
      { id: 2009, menu_item_id: 205, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 2010, menu_item_id: 205, variant_name: "Full Portion", price_adjustment: 300 }, // 1200
    ],
    default_notes: ["Soft String Hoppers", "Gravy on Side"],
  },
  {
    id: 206,
    category_id: 2,
    name: "Cheese Chicken Kottu",
    base_price: 900,
    is_available: true,
    description: "චීස් චිකන් කොත්තු - Decadent chicken kottu loaded with melted creamy cheese and fresh herbs.",
    station: "Kottu Griddle",
    badge: "Cheesy",
    variants: [
      { id: 2011, menu_item_id: 206, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 2012, menu_item_id: 206, variant_name: "Full Portion", price_adjustment: 500 }, // 1400
    ],
    default_notes: ["Extra Melted Cheese", "Creamy"],
  },

  // ==========================================
  // 3. NOODLES (නූඩ්ල්ස්) - Half / Full
  // ==========================================
  {
    id: 301,
    category_id: 3,
    name: "Vegetable Noodles",
    base_price: 400,
    is_available: true,
    description: "එළවළු නූඩ්ල්ස් - Wok-tossed noodles with shredded cabbage, carrots, bell peppers & soy seasoning.",
    station: "Wok Station",
    variants: [
      { id: 3001, menu_item_id: 301, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 3002, menu_item_id: 301, variant_name: "Full Portion", price_adjustment: 200 }, // 600
    ],
    default_notes: ["Less Oil", "Chili Paste"],
  },
  {
    id: 302,
    category_id: 3,
    name: "Egg Noodles",
    base_price: 600,
    is_available: true,
    description: "බිත්තර නූඩ්ල්ස් - Stir-fried yellow noodles tossed with scrambled eggs, onions and leeks.",
    station: "Wok Station",
    variants: [
      { id: 3003, menu_item_id: 302, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 3004, menu_item_id: 302, variant_name: "Full Portion", price_adjustment: 200 }, // 800
    ],
    default_notes: ["Extra Egg"],
  },
  {
    id: 303,
    category_id: 3,
    name: "Fish Noodles",
    base_price: 600,
    is_available: true,
    description: "මාළු නූඩ්ල්ස් - Savory wok-fried noodles tossed with spiced fried fish bites and vegetables.",
    station: "Wok Station",
    variants: [
      { id: 3005, menu_item_id: 303, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 3006, menu_item_id: 303, variant_name: "Full Portion", price_adjustment: 300 }, // 900
    ],
    default_notes: ["Crispy Fish"],
  },
  {
    id: 304,
    category_id: 3,
    name: "Chicken Noodles",
    base_price: 700,
    is_available: true,
    description: "චිකන් නූඩ්ල්ස් - Wok-fried noodles with tender chicken strips, scallions and Chinese chili paste.",
    station: "Wok Station",
    badge: "Popular",
    variants: [
      { id: 3007, menu_item_id: 304, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 3008, menu_item_id: 304, variant_name: "Full Portion", price_adjustment: 300 }, // 1000
    ],
    default_notes: ["Extra Spicy", "Extra Chicken"],
  },
  {
    id: 305,
    category_id: 3,
    name: "Sea Food Noodles",
    base_price: 900,
    is_available: true,
    description: "සී ෆුඩ් නූඩ්ල්ස් - Seafood delight noodles tossed with prawns, cuttlefish, and fresh vegetables.",
    station: "Wok Station",
    variants: [
      { id: 3009, menu_item_id: 305, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 3010, menu_item_id: 305, variant_name: "Full Portion", price_adjustment: 500 }, // 1400
    ],
    default_notes: ["Fresh Prawns", "Lime"],
  },
  {
    id: 306,
    category_id: 3,
    name: "Pork Noodles",
    base_price: 900,
    is_available: true,
    description: "පෝර්ක් නූඩ්ල්ස් - Wok-fried noodles with tender southern roasted pork slices.",
    station: "Wok Station",
    variants: [
      { id: 3011, menu_item_id: 306, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 3012, menu_item_id: 306, variant_name: "Full Portion", price_adjustment: 500 }, // 1400
    ],
    default_notes: ["Roasted Pork"],
  },
  {
    id: 307,
    category_id: 3,
    name: "Mix Noodles",
    base_price: 1000,
    is_available: true,
    description: "මික්ස් නූඩ්ල්ස් - Premium mixed noodles with chicken, seafood, egg and crunchy vegetables.",
    station: "Wok Station",
    badge: "Chef Special",
    variants: [
      { id: 3013, menu_item_id: 307, variant_name: "Half Portion", price_adjustment: 0 },
      { id: 3014, menu_item_id: 307, variant_name: "Full Portion", price_adjustment: 500 }, // 1500
    ],
    default_notes: ["All Meats", "Extra Spicy"],
  },

  // ==========================================
  // 4. DEVILLED (ඩෙවල් - 200g Portion)
  // ==========================================
  {
    id: 401,
    category_id: 4,
    name: "Chicken Devilled (200g)",
    base_price: 1200,
    is_available: true,
    description: "චිකන් ඩෙවල් - Crispy seasoned chicken cubes wok-tossed with capsicum, red onions and sweet spicy devilled sauce.",
    station: "Wok Station",
    badge: "Hot & Spicy",
    default_notes: ["Extra Spicy", "Extra Gravy", "Sweet & Sour"],
  },
  {
    id: 402,
    category_id: 4,
    name: "Fish Devilled (200g)",
    base_price: 1200,
    is_available: true,
    description: "මාළු ඩෙවල් - Fresh sea fish cubes lightly battered and tossed with bell peppers and tangy tomato-chili glaze.",
    station: "Wok Station",
    default_notes: ["Crispy Fish", "Less Spicy"],
  },
  {
    id: 403,
    category_id: 4,
    name: "Prawns Devilled (200g)",
    base_price: 1550,
    is_available: true,
    description: "ඉස්සෝ ඩෙවල් - Plump ocean prawns wok-tossed with hot chilies, onions and savory devilled glaze.",
    station: "Wok Station",
    badge: "Seafood Special",
    default_notes: ["Extra Jumbo Prawns", "Spicy"],
  },
  {
    id: 404,
    category_id: 4,
    name: "Pork Devilled (200g)",
    base_price: 1550,
    is_available: true,
    description: "පෝර්ක් ඩෙවල් - Roast pork cubes tossed with crushed black pepper, capsicum and spicy chili reduction.",
    station: "Wok Station",
    default_notes: ["Crispy Pork", "Black Pepper"],
  },
  {
    id: 405,
    category_id: 4,
    name: "Sausages Devilled (200g)",
    base_price: 800,
    is_available: true,
    description: "සොසේජස් ඩෙවල් - Sliced sausages fried and glazed in spicy devilled sauce with crunchy onions.",
    station: "Wok Station",
    badge: "Snack Favorite",
    default_notes: ["Sweet & Spicy", "Extra Sauce"],
  },

  // ==========================================
  // 5. CHOPSY (චොප්සි)
  // ==========================================
  {
    id: 501,
    category_id: 5,
    name: "Vegetable Chopsy",
    base_price: 700,
    is_available: true,
    description: "එළවළු චොප්සි - Crispy noodles/rice base topped with colorful stir-fried vegetables in savory thick Chinese gravy.",
    station: "Wok Station",
    default_notes: ["Crispy Noodles", "Soft Noodles"],
  },
  {
    id: 502,
    category_id: 5,
    name: "Chicken Chopsy",
    base_price: 1200,
    is_available: true,
    description: "චිකන් චොප්සි - Golden crispy nest smothered with savory chicken strips, mushrooms, baby corn and thick gravy.",
    station: "Wok Station",
    badge: "Popular",
    default_notes: ["Sunny Egg On Top", "Extra Gravy"],
  },
  {
    id: 503,
    category_id: 5,
    name: "Sea Food Chopsy",
    base_price: 1400,
    is_available: true,
    description: "සී ෆුඩ් චොප්සි - Prawns, fish and calamari tossed with Asian greens in rich oyster-soy gravy over crispy noodles.",
    station: "Wok Station",
    badge: "Premium",
    default_notes: ["Seafood Mix", "Crispy Base"],
  },
  {
    id: 504,
    category_id: 5,
    name: "Hot Butter Mushroom",
    base_price: 900,
    is_available: true,
    description: "හොට් බටර් මෂ්රූම් - Crispy battered button mushrooms tossed in rich garlic butter and dried red chilies.",
    station: "Wok Station",
    badge: "Top Seller",
    default_notes: ["Extra Crispy", "Extra Spicy Butter"],
  },

  // ==========================================
  // 6. FRUIT JUICE (නැවුම් පලතුරු යුෂ)
  // ==========================================
  {
    id: 601,
    category_id: 6,
    name: "Lime Juice",
    base_price: 200,
    is_available: true,
    description: "Freshly squeezed Sri Lankan key lime with sugar and salt, served ice cold.",
    station: "Juice Bar",
    default_notes: ["No Sugar", "Extra Ice", "A Touch of Salt"],
  },
  {
    id: 602,
    category_id: 6,
    name: "Watermelon Juice",
    base_price: 250,
    is_available: true,
    description: "Pure refreshing sweet red watermelon, blended fresh to order.",
    station: "Juice Bar",
    badge: "Refreshing",
    default_notes: ["No Sugar", "Less Ice"],
  },
  {
    id: 603,
    category_id: 6,
    name: "Pineapple Juice",
    base_price: 250,
    is_available: true,
    description: "Sweet and tangy tropical Ceylon pineapple juice.",
    station: "Juice Bar",
    default_notes: ["Chilled", "No Sugar"],
  },
  {
    id: 604,
    category_id: 6,
    name: "Woodapple Juice",
    base_price: 250,
    is_available: true,
    description: "Traditional Sri Lankan woodapple nectar with jaggery and coconut milk blend.",
    station: "Juice Bar",
    badge: "Traditional",
    default_notes: ["Sweet", "Cold"],
  },
  {
    id: 605,
    category_id: 6,
    name: "Papaya Juice",
    base_price: 250,
    is_available: true,
    description: "Ripe golden papaya blended with a splash of fresh lime.",
    station: "Juice Bar",
    default_notes: ["Extra Lime Squeeze"],
  },
  {
    id: 606,
    category_id: 6,
    name: "Mix Fruit Juice",
    base_price: 250,
    is_available: true,
    description: "Tropical blend of watermelon, pineapple, papaya, and mango.",
    station: "Juice Bar",
    badge: "Popular",
    default_notes: ["All Fruits Blend", "Cold"],
  },

  // ==========================================
  // 7. DESSERTS & ICE CREAM (අතුරුපස)
  // ==========================================
  {
    id: 701,
    category_id: 7,
    name: "Fruit Salad + Ice Cream",
    base_price: 200,
    is_available: true,
    description: "Fresh diced tropical fruit cocktail topped with a scoop of creamy vanilla ice cream.",
    station: "Dessert Bar",
    badge: "Favorite",
    default_notes: ["Vanilla Ice Cream", "Extra Honey"],
  },
  {
    id: 702,
    category_id: 7,
    name: "Ice Cream",
    base_price: 180,
    is_available: true,
    description: "Two generous scoops of rich vanilla or chocolate ice cream with chocolate drizzle.",
    station: "Dessert Bar",
    default_notes: ["Vanilla", "Chocolate", "Strawberry"],
  },
  {
    id: 703,
    category_id: 7,
    name: "Fruits & Nuts",
    base_price: 200,
    is_available: true,
    description: "Fresh seasonal fruit bowl served with roasted cashew nuts and kithul treacle drizzle.",
    station: "Dessert Bar",
    default_notes: ["Extra Cashews", "Kithul Treacle"],
  },
  {
    id: 704,
    category_id: 7,
    name: "Yoghurt",
    base_price: 80,
    is_available: true,
    description: "යෝගට් - Chilled creamy sweet yoghurt cup.",
    station: "Dessert Bar",
    has_stepper: true,
    badge: "Chilled",
  },

  // ==========================================
  // 8. SOFT DRINKS & WATER (බීම වර්ග සහ ජලය)
  // ==========================================
  {
    id: 801,
    category_id: 8,
    name: "Water Bottle (500ml)",
    base_price: 80,
    is_available: true,
    description: "වතුර බෝතල් 500ml - Pure chilled mineral water.",
    station: "Beverage Bar",
    has_stepper: true,
    badge: "500ml",
  },
  {
    id: 802,
    category_id: 8,
    name: "Water Bottle (1L)",
    base_price: 120,
    is_available: true,
    description: "වතුර බෝතල් 1L - 1 Litre pure chilled mineral water.",
    station: "Beverage Bar",
    has_stepper: true,
    badge: "1 Litre",
  },
  {
    id: 803,
    category_id: 8,
    name: "Coca-Cola Buddy",
    base_price: 100,
    is_available: true,
    description: "කොකාකෝලා බඩී - Chilled 250ml buddy bottle.",
    station: "Beverage Bar",
    has_stepper: true,
  },
  {
    id: 804,
    category_id: 8,
    name: "Sprite Buddy",
    base_price: 100,
    is_available: true,
    description: "ස්ප්‍රයිට් බඩී - Chilled 250ml lemon-lime buddy bottle.",
    station: "Beverage Bar",
    has_stepper: true,
  },
  {
    id: 805,
    category_id: 8,
    name: "EGB Can",
    base_price: 150,
    is_available: true,
    description: "ඊජීබී කෑන් - Elephant House Ginger Beer 330ml can.",
    station: "Beverage Bar",
    has_stepper: true,
    badge: "Popular",
  },

  // ==========================================
  // 9. EXTRAS & ADD-ONS (අමතර කෑම)
  // ==========================================
  {
    id: 901,
    category_id: 9,
    name: "Omelette",
    base_price: 100,
    is_available: true,
    description: "ඔම්ලට් - Freshly prepared egg omelette with sliced onions and green chilies.",
    station: "Wok Station",
    has_stepper: true,
    badge: "Fresh Egg",
    default_notes: ["Spicy", "No Chilies", "Extra Pepper"],
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
  cashier_name: "Sameera (Head Cashier)",
  register_number: "REG-01",
  branch_name: "Labuduwa, Galle",
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
