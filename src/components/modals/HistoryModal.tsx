import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { Order } from '../../types';
import { posDatabase } from '../../db/sqlite';
import { buildCustomerReceiptEscPos, buildKotEscPos } from '../../utils/escpos';
import { 
  X, 
  History, 
  Printer, 
  RotateCcw, 
  Ban, 
  Search, 
  FileText, 
  Send,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';

export const HistoryModal: React.FC = () => {
  const { 
    isHistoryModalOpen, 
    closeHistoryModal, 
    recentOrders, 
    restaurant, 
    setPrintPreview, 
    loadOrderIntoCart 
  } = usePosStore();

  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!isHistoryModalOpen) return null;

  const filteredOrders = recentOrders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.table_number && o.table_number.toLowerCase().includes(search.toLowerCase())) ||
    (o.customer_name && o.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleReprintReceipt = (order: Order) => {
    const builder = buildCustomerReceiptEscPos(order, restaurant, 80);
    setPrintPreview({
      title: `Reprint Customer Receipt - #${order.order_number}`,
      type: 'RECEIPT',
      plainText: `Reprint for #${order.order_number}`,
      hexDump: builder.getHexDump(),
      width: 80,
    });
    closeHistoryModal();
  };

  const handleReprintKOT = (order: Order) => {
    const builder = buildKotEscPos(
      order.order_number,
      order.order_type,
      order.table_number,
      order.items,
      order.cashier_name,
      80
    );
    setPrintPreview({
      title: `Reprint Kitchen Ticket (KOT) - #${order.order_number}`,
      type: 'KOT',
      plainText: `KOT Reprint for #${order.order_number}`,
      hexDump: builder.getHexDump(),
      width: 80,
    });
    closeHistoryModal();
  };

  const handleVoidOrder = (order: Order) => {
    const reason = prompt("Enter reason for voiding this order (e.g., Customer cancelled, Entered in error):");
    if (reason && reason.trim()) {
      posDatabase.voidOrder(order.id, reason.trim());
      usePosStore.getState().init();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Order History & Past Receipts
              </h2>
              <p className="text-xs text-slate-400">
                Recall, reprint thermal slips, or reload past orders
              </p>
            </div>
          </div>

          <button
            onClick={closeHistoryModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order # (e.g. GAL-0101) or table..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Orders List / Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 flex-1 overflow-hidden">
          {/* Left: Orders List */}
          <div className="overflow-y-auto p-4 space-y-2.5 max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-800">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No orders found.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-slate-100 ring-1 ring-amber-500'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-amber-400">
                        #{order.order_number}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.payment_status === 'void'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{order.order_type.toUpperCase()} {order.table_number ? `(${order.table_number})` : ''}</span>
                      <span className="font-mono font-black text-slate-200">
                        Rs. {order.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{order.created_at}</span>
                      <span className="capitalize">{order.payment_method || 'Unpaid'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Selected Order Details */}
          <div className="p-5 overflow-y-auto max-h-[60vh] flex flex-col justify-between scrollbar-thin scrollbar-thumb-slate-800">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-slate-100">
                        Order #{selectedOrder.order_number}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedOrder.created_at} • Cashier: {selectedOrder.cashier_name}
                      </p>
                    </div>
                    <span className="font-mono text-lg font-black text-amber-400">
                      Rs. {selectedOrder.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Ordered Items ({selectedOrder.items.length})
                  </span>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="font-semibold text-slate-200">
                          {item.quantity}x {item.item_name}
                        </span>
                        {item.variant_name && (
                          <span className="text-[10px] text-amber-400 ml-1">
                            [{item.variant_name}]
                          </span>
                        )}
                        {item.notes && (
                          <p className="text-[10px] text-slate-500 italic">* {item.notes}</p>
                        )}
                      </div>
                      <span className="font-mono text-slate-200">
                        Rs. {item.total_price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleReprintReceipt(selectedOrder)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reprint Receipt</span>
                    </button>

                    <button
                      onClick={() => handleReprintKOT(selectedOrder)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                    >
                      <Send className="w-3.5 h-3.5 text-orange-400" />
                      <span>Reprint KOT</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => loadOrderIntoCart(selectedOrder)}
                      className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-amber-500/30"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-order to Cart</span>
                    </button>

                    {selectedOrder.payment_status !== 'void' && (
                      <button
                        onClick={() => handleVoidOrder(selectedOrder)}
                        className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-rose-500/30"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Void Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select an order from the list to view breakdown & print slips.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={closeHistoryModal}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
