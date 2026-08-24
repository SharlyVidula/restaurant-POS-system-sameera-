import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { ItemVariant, CartItemModifier } from '../../types';
import { X, Plus, Minus, Check, Sparkles, ChefHat } from 'lucide-react';

export const VariantModal: React.FC = () => {
  const { variantModalItem, closeVariantModal, addToCart } = usePosStore();

  if (!variantModalItem) return null;

  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | undefined>(
    variantModalItem.variants && variantModalItem.variants.length > 0
      ? variantModalItem.variants[0]
      : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [selectedPresetNotes, setSelectedPresetNotes] = useState<string[]>([]);
  
  // Modifiers (for juices, kottu, etc.)
  const isJuice = variantModalItem.category_id === 5;
  const isKottu = variantModalItem.category_id === 3;

  const [sugarLevel, setSugarLevel] = useState<'Normal Sugar' | 'Less Sugar' | 'No Sugar'>('Normal Sugar');
  const [withIce, setWithIce] = useState<boolean>(true);
  const [extraAddons, setExtraAddons] = useState<CartItemModifier[]>([]);

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

  // Compute calculated unit price
  const basePrice = variantModalItem.base_price;
  const variantAdj = selectedVariant ? selectedVariant.price_adjustment : 0;
  const addonsTotal = extraAddons.reduce((acc, a) => acc + a.price, 0);
  const unitPrice = basePrice + variantAdj + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
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

    addToCart(
      variantModalItem,
      selectedVariant,
      quantity,
      allNotes.join(', '),
      modifiers
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
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
              Select portion, preparation style & modifiers
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
        <div className="p-5 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Variants / Protein / Portion Options */}
          {variantModalItem.variants && variantModalItem.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Choose Variation / Portion
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {variantModalItem.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const itemPrice = variantModalItem.base_price + v.price_adjustment;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-semibold">{v.variant_name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        Rs. {itemPrice.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
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
                      onClick={() => setSugarLevel(lvl)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        sugarLevel === lvl
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
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

          {/* Kottu Station Add-ons */}
          {isKottu && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Special Add-ons & Gravy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Extra Melted Cheese', price: 250 },
                  { name: 'Extra Curry Gravy Cup', price: 100 },
                  { name: 'Extra Roast Chicken Piece', price: 200 },
                  { name: 'Fried Bullseye Egg', price: 80 },
                ].map((addon) => {
                  const isChecked = !!extraAddons.find(a => a.name === addon.name);
                  return (
                    <button
                      key={addon.name}
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
                      onClick={() => togglePresetNote(note)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
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

        {/* Footer: Quantity & Confirm */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-mono font-bold text-sm text-slate-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-glow-amber flex items-center justify-between transition-all active:scale-98"
          >
            <span>Add to Order</span>
            <span className="font-mono text-base font-extrabold">
              Rs. {totalPrice.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
