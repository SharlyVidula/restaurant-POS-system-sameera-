import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { CartItemModifier } from '../../types';
import { X, Plus, Minus, Check, Sparkles, ChefHat, Layers } from 'lucide-react';

export const VariantModal: React.FC = () => {
  const { variantModalItem, closeVariantModal, addBatchToCart } = usePosStore();

  const hasVariants = !!(variantModalItem?.variants && variantModalItem.variants.length > 0);

  // Variant portion quantities (variant_id -> quantity)
  const [variantQuantities, setVariantQuantities] = useState<Record<number, number>>(() => {
    if (variantModalItem?.variants && variantModalItem.variants.length > 0) {
      const initial: Record<number, number> = {};
      variantModalItem.variants.forEach((v, idx) => {
        // Default the first portion to 1, others to 0
        initial[v.id] = idx === 0 ? 1 : 0;
      });
      return initial;
    }
    return {};
  });

  // Quantity for items without variants
  const [nonVariantQuantity, setNonVariantQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [selectedPresetNotes, setSelectedPresetNotes] = useState<string[]>([]);
  
  // Modifiers (for juices, kottu, fried rice, etc.)
  const isJuice = variantModalItem?.category_id === 5;
  const isKottu = variantModalItem?.category_id === 3;
  const isFriedRice = variantModalItem?.category_id === 2;

  const [sugarLevel, setSugarLevel] = useState<'Normal Sugar' | 'Less Sugar' | 'No Sugar'>('Normal Sugar');
  const [withIce, setWithIce] = useState<boolean>(true);
  const [extraAddons, setExtraAddons] = useState<CartItemModifier[]>([]);

  if (!variantModalItem) return null;

  const togglePresetNote = (note: string) => {
    if (selectedPresetNotes.includes(note)) {
      setSelectedPresetNotes(selectedPresetNotes.filter(n => n !== note));
    } else {
      setSelectedPresetNotes([...selectedPresetNotes, note]);
    }
  };

  const toggleAddon = (name: string, price: number) => {
    const exists = extraAddons.find(a => a.name === name);
    if (exists) {
      setExtraAddons(extraAddons.filter(a => a.name !== name));
    } else {
      setExtraAddons([...extraAddons, { name, price }]);
    }
  };

  const updateVariantQty = (variantId: number, delta: number) => {
    setVariantQuantities(prev => {
      const current = prev[variantId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [variantId]: next };
    });
  };

  const setVariantExactQty = (variantId: number, val: number) => {
    const next = Math.max(0, val || 0);
    setVariantQuantities(prev => ({ ...prev, [variantId]: next }));
  };

  // Compute calculated pricing
  const basePrice = variantModalItem.base_price;
  const addonsTotal = extraAddons.reduce((acc, a) => acc + a.price, 0);

  let totalItemsCount = 0;
  let totalPrice = 0;

  if (hasVariants && variantModalItem.variants) {
    variantModalItem.variants.forEach(v => {
      const q = variantQuantities[v.id] || 0;
      totalItemsCount += q;
      const portionUnitPrice = (basePrice + v.price_adjustment) + addonsTotal;
      totalPrice += portionUnitPrice * q;
    });
  } else {
    totalItemsCount = nonVariantQuantity;
    totalPrice = (basePrice + addonsTotal) * nonVariantQuantity;
  }

  const handleConfirm = () => {
    if (totalItemsCount <= 0) return;

    // Build combined modifiers array
    const modifiers: CartItemModifier[] = [...extraAddons];

    if (isJuice) {
      modifiers.push({ name: sugarLevel, price: 0 });
      modifiers.push({ name: withIce ? 'With Ice' : 'No Ice', price: 0 });
    }

    // Build combined notes
    const allNotes = [...selectedPresetNotes];
    if (customNote.trim()) {
      allNotes.push(customNote.trim());
    }

    if (hasVariants && variantModalItem.variants) {
      const batch = variantModalItem.variants
        .filter(v => (variantQuantities[v.id] || 0) > 0)
        .map(v => ({
          variant: v,
          quantity: variantQuantities[v.id],
        }));

      addBatchToCart(
        variantModalItem,
        batch,
        allNotes.join(', '),
        modifiers
      );
    } else {
      addBatchToCart(
        variantModalItem,
        [{ quantity: nonVariantQuantity }],
        allNotes.join(', '),
        modifiers
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                {variantModalItem.name}
              </h2>
              {variantModalItem.station && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
                  {variantModalItem.station}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasVariants 
                ? 'Select quantities for each portion size & preparation notes' 
                : 'Select quantity & preparation notes'}
            </p>
          </div>

          <button
            onClick={closeVariantModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Variants / Portion Sizes with Individual Quantity Selectors */}
          {hasVariants && variantModalItem.variants && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Portions & Quantities</span>
                </label>
                <span className="text-[11px] font-medium text-amber-400/90">
                  Select multiple portion sizes
                </span>
              </div>

              <div className="space-y-2.5">
                {variantModalItem.variants.map((v) => {
                  const qty = variantQuantities[v.id] || 0;
                  const isSelected = qty > 0;
                  const itemUnitPrice = variantModalItem.base_price + v.price_adjustment + addonsTotal;
                  const lineTotal = itemUnitPrice * qty;

                  return (
                    <div
                      key={v.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      {/* Portion Info */}
                      <div 
                        className="flex-1 cursor-pointer select-none"
                        onClick={() => {
                          if (qty === 0) updateVariantQty(v.id, 1);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-amber-400 bg-amber-500' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                          </div>
                          <span className={`text-sm font-bold ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                            {v.variant_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 ml-6 text-xs">
                          <span className="font-mono text-slate-400 font-semibold">
                            Rs. {itemUnitPrice.toLocaleString()} each
                          </span>
                          {isSelected && (
                            <span className="text-amber-400 font-bold font-mono">
                              • Subtotal: Rs. {lineTotal.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tactile Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shrink-0 shadow-inner">
                        <button
                          type="button"
                          onClick={() => updateVariantQty(v.id, -1)}
                          disabled={qty <= 0}
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 flex items-center justify-center font-bold transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => setVariantExactQty(v.id, parseInt(e.target.value, 10) || 0)}
                          className={`w-9 text-center font-mono font-bold text-sm bg-transparent focus:outline-none ${
                            isSelected ? 'text-amber-300' : 'text-slate-500'
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => updateVariantQty(v.id, 1)}
                          className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 active:scale-95 flex items-center justify-center font-bold transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Portions Summary Breakdown */}
              {totalItemsCount > 1 && (
                <div className="mt-2.5 p-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs animate-fadeIn">
                  <span className="text-slate-400 font-medium">Portions Summary:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {variantModalItem.variants
                      .filter(v => (variantQuantities[v.id] || 0) > 0)
                      .map(v => `${variantQuantities[v.id]} × ${v.variant_name}`)
                      .join('  +  ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Juice Modifiers (Sugar & Ice) */}
          {isJuice && (
            <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sugar Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Normal Sugar', 'Less Sugar', 'No Sugar'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSugarLevel(lvl)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        sugarLevel === lvl
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Ice Preference
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithIce(true)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      withIce
                        ? 'bg-blue-500 text-white border-blue-400 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    ❄ With Ice
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithIce(false)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      !withIce
                        ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    🌡 No Ice (Room Temp)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fried Rice Add-ons */}
          {isFriedRice && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Portion Size & Add-ons
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Large / Sharing Portion', price: 200 },
                  { name: 'Fried Bullseye Egg', price: 80 },
                  { name: 'Extra Chili Paste Cup', price: 50 },
                  { name: 'Extra Roast Chicken Piece', price: 200 },
                ].map((addon) => {
                  const isChecked = !!extraAddons.find(a => a.name === addon.name);
                  return (
                    <button
                      key={addon.name}
                      type="button"
                      onClick={() => toggleAddon(addon.name, addon.price)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold">{addon.name}</span>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        +Rs. {addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kottu Station Add-ons */}
          {isKottu && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Portion Size & Add-ons
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Large / Sharing Portion', price: 200 },
                  { name: 'Extra Melted Cheese', price: 250 },
                  { name: 'Extra Curry Gravy Cup', price: 100 },
                  { name: 'Extra Roast Chicken Piece', price: 200 },
                  { name: 'Fried Bullseye Egg', price: 80 },
                ].map((addon) => {
                  const isChecked = !!extraAddons.find(a => a.name === addon.name);
                  return (
                    <button
                      key={addon.name}
                      type="button"
                      onClick={() => toggleAddon(addon.name, addon.price)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold">{addon.name}</span>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        +Rs. {addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preset Cooking Notes */}
          {variantModalItem.default_notes && variantModalItem.default_notes.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Instructions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {variantModalItem.default_notes.map((note) => {
                  const isSelected = selectedPresetNotes.includes(note);
                  return (
                    <button
                      key={note}
                      type="button"
                      onClick={() => togglePresetNote(note)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? `✓ ${note}` : `+ ${note}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Preparation Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Custom Kitchen Instruction
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g., Very spicy, less salt, extra lime..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer: Quantity (for non-variant items) & Confirm */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0">
          {/* Non-variant single item quantity stepper */}
          {!hasVariants && (
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setNonVariantQuantity(Math.max(1, nonVariantQuantity - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-sm text-slate-100">
                {nonVariantQuantity}
              </span>
              <button
                type="button"
                onClick={() => setNonVariantQuantity(nonVariantQuantity + 1)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Add to Order Button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={totalItemsCount <= 0}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-glow-amber flex items-center justify-between transition-all active:scale-98"
          >
            <span>
              {totalItemsCount <= 0 
                ? 'Select at least 1 portion' 
                : hasVariants 
                ? `Add ${totalItemsCount} ${totalItemsCount === 1 ? 'Portion' : 'Portions'} to Order` 
                : `Add to Order (${totalItemsCount})`}
            </span>
            <span className="font-mono text-base font-extrabold">
              Rs. {totalPrice.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
