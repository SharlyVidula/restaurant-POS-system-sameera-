import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { MenuItem, ItemVariant } from '../../types';
import { 
  X, 
  Search, 
  Tag, 
  Check, 
  History, 
  Flame, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

export const MenuPriceModal: React.FC = () => {
  const { 
    isMenuPriceModalOpen, 
    closeMenuPriceModal, 
    menuItems, 
    categories, 
    updateMenuItemPrice,
    priceAudits 
  } = usePosStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editVariants, setEditVariants] = useState<ItemVariant[]>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  if (!isMenuPriceModalOpen) return null;

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setEditBasePrice(item.base_price);
    setEditVariants(item.variants ? JSON.parse(JSON.stringify(item.variants)) : []);
    setSavedNotice(null);
  };

  const handleStepPrice = (delta: number) => {
    setEditBasePrice(prev => Math.max(0, prev + delta));
  };

  const handleStepVariantPrice = (variantId: number, delta: number) => {
    setEditVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        return { ...v, price_adjustment: Math.max(0, v.price_adjustment + delta) };
      }
      return v;
    }));
  };

  const handleSavePrice = () => {
    if (!selectedItem) return;

    const variantUpdates = editVariants.map(v => ({
      id: v.id,
      price_adjustment: v.price_adjustment,
    }));

    const success = updateMenuItemPrice(selectedItem.id, editBasePrice, variantUpdates);
    if (success) {
      setSavedNotice(`Updated ${selectedItem.name} to Rs. ${editBasePrice}`);
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === null || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Menu & Item Price Management
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN SUPERVISOR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Update base menu prices and portion variant adjustments in real-time
              </p>
            </div>
          </div>

          <button
            onClick={closeMenuPriceModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher & Search */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Price Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Price Audit Log ({priceAudits.length})</span>
            </button>
          </div>

          {activeTab === 'editor' && (
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search food item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {activeTab === 'editor' ? (
            <>
              {/* Left Column: Category Pills & Item List */}
              <div className="w-full md:w-1/2 border-r border-slate-800 flex flex-col overflow-hidden bg-slate-950/40">
                {/* Category horizontal scroll */}
                <div className="p-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === null
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    All Items ({menuItems.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedItem?.id === item.id
                          ? 'bg-amber-500/15 border-amber-500 shadow-glow-amber'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-200">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{categories.find(c => c.id === item.category_id)?.name}</span>
                          {item.station && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400/80">{item.station}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-amber-400">
                          Rs. {item.base_price.toLocaleString()}
                        </div>
                        {item.variants && item.variants.length > 0 && (
                          <div className="text-[9px] text-slate-500">
                            {item.variants.length} portions
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Selected Item Price Adjuster */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between bg-slate-900/60 scrollbar-thin scrollbar-thumb-slate-800">
                {selectedItem ? (
                  <div className="space-y-6">
                    {/* Item Title Card */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                        Editing Food Item
                      </span>
                      <h3 className="text-base font-extrabold text-slate-100">
                        {selectedItem.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedItem.description || 'Authentic Southern Spoon Dish'}
                      </p>
                    </div>

                    {/* Base Price Adjuster */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Base Price (LKR)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                            Rs.
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={editBasePrice}
                            onChange={(e) => setEditBasePrice(parseFloat(e.target.value) || 0)}
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono text-lg font-black focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* Quick Stepper Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStepPrice(-50)}
                            className="px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 active:scale-95 transition-all"
                          >
                            -50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepPrice(50)}
                            className="px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 active:scale-95 transition-all"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepPrice(100)}
                            className="px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 active:scale-95 transition-all"
                          >
                            +100
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Variant Adjustments (if any) */}
                    {editVariants.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Portion / Variant Add-ons
                        </label>
                        {editVariants.map(variant => (
                          <div 
                            key={variant.id}
                            className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="font-bold text-xs text-slate-200">
                                {variant.variant_name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Total: Rs. {(editBasePrice + variant.price_adjustment).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-mono font-bold">+Rs.</span>
                              <input
                                type="number"
                                min="0"
                                step="10"
                                value={variant.price_adjustment}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setEditVariants(prev => prev.map(v => v.id === variant.id ? { ...v, price_adjustment: val } : v));
                                }}
                                className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono text-xs font-bold text-right focus:border-amber-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleStepVariantPrice(variant.id, 50)}
                                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 active:scale-95"
                              >
                                +50
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Saved Toast Feedback */}
                    {savedNotice && (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{savedNotice}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleSavePrice}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-glow-amber flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save & Apply New Price</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <Tag className="w-12 h-12 mb-2 stroke-[1.5] text-slate-600" />
                    <p className="text-sm font-bold text-slate-400">Select an item from the left</p>
                    <p className="text-xs text-slate-500 mt-1">Tap any menu item to update base prices or portion rates</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Audit Log Tab */
            <div className="p-6 overflow-y-auto flex-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
              {priceAudits.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  No price changes recorded yet. All items are on seed prices.
                </div>
              ) : (
                priceAudits.map(audit => (
                  <div 
                    key={audit.id} 
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">
                        {audit.item_name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Changed by {audit.changed_by} • {audit.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="line-through text-slate-500 text-xs">
                        Rs. {audit.old_price.toLocaleString()}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-black text-amber-400 text-sm">
                        Rs. {audit.new_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
