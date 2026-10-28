import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Percent, 
  Receipt, 
  Send, 
  CreditCard, 
  User, 
  Phone, 
  FileText, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Keyboard
} from 'lucide-react';

export const OrderCart: React.FC = () => {
  const {
    cart,
    orderType,
    selectedTable,
    selectTable,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    getSubtotal,
    getDiscountTotal,
    getServiceChargeTotal,
    getTaxTotal,
    getNetTotal,
    discountPercentage,
    setDiscountPercentage,
    includeServiceCharge,
    toggleServiceCharge,
    includeTax,
    toggleTax,
    customerName,
    customerPhone,
    orderNotes,
    setCustomerInfo,
    setOrderNotes,
    fireKOT,
    openPaymentModal,
    openTableModal,
    openQueueModal,
    selectedTakeawayQueue,
    selectedDeliveryQueue,
    deliveryQueues,
    printBillPreview,
    variantModalItem,
    isPaymentModalOpen,
    isTableModalOpen,
    isQueueModalOpen,
    printPreview,
    isHistoryModalOpen,
    isMenuPriceModalOpen,
    isHotkeysModalOpen,
    isAdminAuthModalOpen,
    isOpeningFloatModalOpen,
  } = usePosStore();

    const isAnyModalOpen = !!(
    variantModalItem ||
    isPaymentModalOpen ||
    isTableModalOpen ||
    isQueueModalOpen ||
    printPreview ||
    isHistoryModalOpen ||
    isMenuPriceModalOpen ||
    isHotkeysModalOpen ||
    isAdminAuthModalOpen ||
    isOpeningFloatModalOpen
  );

  const [focusedCartIndex, setFocusedCartIndex] = useState<number>(0);

  // Keep index within bounds
  useEffect(() => {
    if (focusedCartIndex >= cart.length) {
      setFocusedCartIndex(Math.max(0, cart.length - 1));
    }
  }, [cart.length, focusedCartIndex]);

  // Keyboard controls for Cart:
  // Up/Down: choose cart item
  // Left/Right: change quantity (-1 / +1)
  // Delete: remove active item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnyModalOpen) return;
      if (cart.length === 0) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedCartIndex(prev => (prev < cart.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedCartIndex(prev => (prev > 0 ? prev - 1 : cart.length - 1));
      } else if (e.key === 'ArrowRight' || e.key === '+') {
        e.preventDefault();
        const activeItem = cart[focusedCartIndex];
        if (activeItem) {
          updateCartQuantity(activeItem.cart_item_id, 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === '-') {
        e.preventDefault();
        const activeItem = cart[focusedCartIndex];
        if (activeItem) {
          updateCartQuantity(activeItem.cart_item_id, -1);
        }
      } else if (e.key === 'Delete') {
        e.preventDefault();
        const activeItem = cart[focusedCartIndex];
        if (activeItem) {
          removeCartItem(activeItem.cart_item_id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnyModalOpen, cart, focusedCartIndex, updateCartQuantity, removeCartItem]);

  const currentDeliveryQueueObj = deliveryQueues.find(q => q.id === selectedDeliveryQueue);

  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showDiscountPicker, setShowDiscountPicker] = useState(false);

  const subtotal = getSubtotal();
  const discountTotal = getDiscountTotal();
  const serviceChargeTotal = getServiceChargeTotal();
  const taxTotal = getTaxTotal();
  const netTotal = getNetTotal();

  const discountOptions = [0, 5, 10, 15, 20];

  return (
    <div className="w-[320px] sm:w-[340px] lg:w-[350px] xl:w-[390px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl select-none">
      {/* Cart Header */}
      <div className="p-2.5 sm:p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                Current Order
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
              {cart.length > 0 && (
                <span className="hidden sm:inline-flex text-[9px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  [↑ ↓ Item • ← → Qty]
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {orderType === 'dine_in' ? (
                selectedTable ? (
                  <span className="text-emerald-400 font-bold">Table: {selectedTable.table_number} ({selectedTable.zone})</span>
                ) : (
                  <button onClick={() => selectTable(null)} className="text-amber-400 hover:underline font-bold animate-pulse">
                    ⚠ Select Table for Dine-In
                  </button>
                )
              ) : orderType === 'takeaway' ? (
                <button 
                  onClick={() => openQueueModal('takeaway')} 
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 group"
                  title="Click to switch takeaway queue"
                >
                  <span>Queue: {selectedTakeawayQueue}</span>
                  {customerName && <span className="text-slate-300 font-normal">({customerName})</span>}
                  <span className="text-[10px] text-slate-500 group-hover:text-amber-300 underline font-normal ml-0.5">Switch</span>
                </button>
              ) : (
                <button 
                  onClick={() => openQueueModal('delivery')} 
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 group"
                  title="Click to switch delivery queue"
                >
                  <span>Delivery: {selectedDeliveryQueue}</span>
                  {currentDeliveryQueueObj?.platform_label && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
                      {currentDeliveryQueueObj.platform_label}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-300 underline font-normal ml-0.5">Switch</span>
                </button>
              )}
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            title="Clear all cart items"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[11px]">Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
        {cart.length === 0 ? (
          orderType === 'dine_in' && !selectedTable ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 shadow-glow-amber">
                <Layers className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm">Table Selection Required</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                Please select a table from the floor layout to begin adding items to an order.
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mb-3 text-slate-600">
                <Receipt className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-300 text-sm">Cart is Empty</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                Tap items or short eats from the menu to build the order.
              </p>
            </div>
          )
        ) : (
          cart.map((item, idx) => {
            const isFocused = idx === focusedCartIndex;
            return (
            <div
              key={item.cart_item_id}
              onClick={() => setFocusedCartIndex(idx)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isFocused 
                  ? 'border-amber-400 ring-2 ring-amber-400 shadow-glow-amber bg-amber-950/25' 
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-100">
                        {item.item_name}
                      </span>
                      {isFocused && (
                        <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          [← -1 | +1 →]
                        </span>
                      )}
                    </div>
                    {item.variant_name && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                        {item.variant_name}
                      </span>
                    )}
                  </div>

                  {/* Modifiers List */}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.modifiers.map((mod, i) => (
                        <span key={i} className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40 font-mono">
                          +{mod.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      * {item.notes}
                    </p>
                  )}

                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    Rs. {item.unit_price.toLocaleString('en-LK', { minimumFractionDigits: 0 })} each
                  </div>
                </div>

                {/* Line Item Total */}
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-amber-400">
                    Rs. {item.total_price.toLocaleString('en-LK', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Quantity Adjuster Row */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  Station: {item.station}
                </span>

                <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => updateCartQuantity(item.cart_item_id, -1)}
                    className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-xs transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-xs text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.cart_item_id, 1)}
                    className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-center text-xs transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeCartItem(item.cart_item_id)}
                    className="ml-1 p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Customer Info & Discount Collapsible Section */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 space-y-2">
        {/* Toggle Customer / Table Notes */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCustomerDetails(!showCustomerDetails)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Customer & Notes</span>
            {showCustomerDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowDiscountPicker(!showDiscountPicker)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border transition-all ${
              discountPercentage > 0
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <Percent className="w-3 h-3" />
            <span>Discount {discountPercentage > 0 ? `(${discountPercentage}%)` : ''}</span>
          </button>
        </div>

        {/* Customer Input Fields */}
        {showCustomerDetails && (
          <div className="grid grid-cols-2 gap-2 pt-2 animate-fadeIn">
            <div className="relative">
              <User className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerInfo(e.target.value, customerPhone)}
                placeholder="Guest Name"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="relative">
              <Phone className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerInfo(customerName, e.target.value)}
                placeholder="Phone (077...)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="col-span-2 relative">
              <FileText className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Order special instructions / delivery notes..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Discount Quick Buttons */}
        {showDiscountPicker && (
          <div className="flex items-center gap-1.5 pt-1 animate-fadeIn">
            {discountOptions.map((pct) => (
              <button
                key={pct}
                onClick={() => setDiscountPercentage(pct)}
                className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  discountPercentage === pct
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {pct === 0 ? 'None' : `${pct}%`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Financial Summary Breakdown */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono font-semibold text-slate-200">
            Rs. {subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {discountTotal > 0 && (
          <div className="flex justify-between text-xs text-emerald-400 font-medium">
            <span>Discount ({discountPercentage}%)</span>
            <span className="font-mono">
              - Rs. {discountTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {/* Toggles for Service Charge & Tax */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={includeServiceCharge}
              onChange={toggleServiceCharge}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
            />
            <span>Service Charge (10%)</span>
          </label>
          <span className="font-mono text-slate-300">
            Rs. {serviceChargeTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={includeTax}
              onChange={toggleTax}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
            />
            <span>VAT (8%)</span>
          </label>
          <span className="font-mono text-slate-300">
            Rs. {taxTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Net Total Box */}
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider block">
              Net Payable (LKR)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Includes all taxes & charges
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-xl lg:text-2xl text-amber-400 drop-shadow-md">
              Rs. {netTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons - Optimized for 768px/1024px height */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Fire KOT Button */}
          <button
            onClick={fireKOT}
            disabled={cart.length === 0 || (orderType === 'dine_in' && !selectedTable)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-bold text-xs border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <Send className="w-3.5 h-3.5 text-orange-400" />
            <span>Fire KOT</span>
          </button>

          {/* Print Guest Bill Button */}
          <button
            onClick={printBillPreview}
            disabled={cart.length === 0 || (orderType === 'dine_in' && !selectedTable)}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-bold text-xs border border-slate-700 transition-all shadow-md active:scale-95"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Bill</span>
          </button>
        </div>

        {/* Settle Bill Button */}
        <button
          onClick={() => {
            if (orderType === 'dine_in' && !selectedTable) {
              selectTable(null);
              return;
            }
            if (cart.length === 0) return;
            openPaymentModal();
          }}
          disabled={cart.length === 0 || (orderType === 'dine_in' && !selectedTable)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-glow-amber transition-all active:scale-95 border border-amber-400/50"
        >
          <CreditCard className="w-4 h-4" />
          <span>
            {orderType === 'dine_in' && !selectedTable 
              ? 'Select Table on Floor Plan' 
              : orderType === 'takeaway' 
              ? `Pay • ${selectedTakeawayQueue}` 
              : orderType === 'delivery' 
              ? `Dispatch & Pay • ${selectedDeliveryQueue}` 
              : 'Settle / Pay'}
          </span>
        </button>
      </div>
    </div>
  );
};
