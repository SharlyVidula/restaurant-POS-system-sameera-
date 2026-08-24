import React from 'react';
import { MenuItem } from '../../types';
import { usePosStore } from '../../store/posStore';
import { Plus, Minus, SlidersHorizontal, Sparkles, ChefHat } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { 
    openVariantModal, 
    addToCart, 
    quickAddStepper, 
    cart, 
    toggleItemAvailability 
  } = usePosStore();

  // Check if item is in cart (for non-variant items)
  const cartItem = cart.find(c => c.menu_item_id === item.id && !c.variant_id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  const hasVariants = item.variants && item.variants.length > 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click if clicking steppers or availability
    if ((e.target as HTMLElement).closest('.stop-propagation')) {
      return;
    }

    if (!item.is_available) return;

    if (hasVariants) {
      openVariantModal(item);
    } else {
      addToCart(item, undefined, 1);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-3.5 select-none ${
        !item.is_available
          ? 'bg-slate-950/40 border-slate-800 opacity-60 grayscale cursor-not-allowed'
          : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-950/20 active:scale-[0.98] cursor-pointer'
      }`}
    >
      {/* Header Badges */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.station && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
                <ChefHat className="w-2.5 h-2.5 text-amber-400" />
                <span>{item.station}</span>
              </span>
            )}
            {item.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>{item.badge}</span>
              </span>
            )}
          </div>

          {/* Quick Out-of-Stock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleItemAvailability(item.id);
            }}
            title={item.is_available ? "In Stock (Click to 86 / mark unavailable)" : "Out of Stock (Click to enable)"}
            className={`stop-propagation w-2.5 h-2.5 rounded-full transition-all ${
              item.is_available ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-red-500 ring-4 ring-red-500/20'
            }`}
          />
        </div>

        {/* Item Title & Details */}
        <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer: Pricing & Action mechanism */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {hasVariants ? 'Starts from' : 'Price'}
          </span>
          <span className="font-mono font-extrabold text-sm text-amber-400">
            Rs. {item.base_price.toLocaleString('en-LK', { minimumFractionDigits: 0 })}
          </span>
        </div>

        {/* Variant Chooser Button */}
        {hasVariants && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.is_available) openVariantModal(item);
            }}
            disabled={!item.is_available}
            className="stop-propagation flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-xs font-bold transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Options ({item.variants?.length})</span>
          </button>
        )}

        {/* Short Eats & Drinks Quick Stepper (+1, +2, +5) */}
        {!hasVariants && item.has_stepper && (
          <div className="stop-propagation flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {currentQty > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  quickAddStepper(item, -1);
                }}
                className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center font-bold text-xs transition-all"
              >
                <Minus className="w-3 h-3" />
              </button>
            )}

            {currentQty > 0 && (
              <span className="px-1.5 font-mono text-xs font-bold text-amber-400">
                {currentQty}
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                quickAddStepper(item, 1);
              }}
              disabled={!item.is_available}
              className="px-2 h-6 rounded-lg bg-slate-800 text-slate-200 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all"
            >
              +1
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                quickAddStepper(item, 2);
              }}
              disabled={!item.is_available}
              className="px-2 h-6 rounded-lg bg-slate-800 text-slate-200 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all"
            >
              +2
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                quickAddStepper(item, 5);
              }}
              disabled={!item.is_available}
              className="px-2 h-6 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all"
            >
              +5
            </button>
          </div>
        )}

        {/* Standard single item + add */}
        {!hasVariants && !item.has_stepper && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.is_available) addToCart(item, undefined, 1);
            }}
            disabled={!item.is_available}
            className="stop-propagation w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 flex items-center justify-center font-bold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
