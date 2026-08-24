import React from 'react';
import { usePosStore } from '../../store/posStore';
import { posDatabase } from '../../db/sqlite';
import { buildXReportEscPos } from '../../utils/escpos';
import { X, ReceiptText, Printer, Clock, Layers, Banknote, ShieldAlert } from 'lucide-react';

export const XReportModal: React.FC = () => {
  const { isXReportModalOpen, closeXReport, restaurant, setPrintPreview } = usePosStore();

  if (!isXReportModalOpen) return null;

  const reportData = posDatabase.getXReportData();

  const handlePrintXSlip = () => {
    const builder = buildXReportEscPos(reportData, restaurant);
    setPrintPreview({
      title: `X-Report (Shift Snapshot) - ${reportData.shift.register_number}`,
      type: 'X_REPORT',
      plainText: `X-Report generated at ${reportData.generated_at}`,
      hexDump: builder.getHexDump(),
      width: 80,
    });
    closeXReport();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  X-Report (Shift Snapshot)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NON-CLOSING AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mid-shift snapshot • Register: {reportData.shift.register_number} • Cashier: {reportData.shift.cashier_name}
              </p>
            </div>
          </div>

          <button
            onClick={closeXReport}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Key KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Gross Sales
              </span>
              <span className="font-mono text-base font-extrabold text-amber-400">
                Rs. {reportData.shift.total_sales.toLocaleString('en-LK', { minimumFractionDigits: 0 })}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Cash in Drawer
              </span>
              <span className="font-mono text-base font-extrabold text-emerald-400">
                Rs. {reportData.shift.cash_drawer_expected.toLocaleString('en-LK', { minimumFractionDigits: 0 })}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Orders Settled
              </span>
              <span className="font-mono text-base font-extrabold text-blue-400">
                {reportData.order_count}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Opening Float
              </span>
              <span className="font-mono text-base font-extrabold text-slate-300">
                Rs. {reportData.shift.opening_float.toLocaleString('en-LK', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Payment Method Splits */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Payment Splits</span>
              <Banknote className="w-4 h-4 text-emerald-400" />
            </h4>
            <div className="space-y-2">
              {reportData.sales_by_payment.map((pay) => (
                <div key={pay.method} className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">
                    {pay.method} ({pay.count} txns)
                  </span>
                  <span className="font-mono font-bold text-slate-100">
                    Rs. {pay.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Sales Breakdown */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Category Sales Summary</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </h4>
            {reportData.sales_by_category.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No sales recorded yet this shift.</p>
            ) : (
              <div className="space-y-2">
                {reportData.sales_by_category.map((cat) => (
                  <div key={cat.category_name} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">
                      {cat.category_name} ({cat.item_count} items)
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      Rs. {cat.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discounts & Voids */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Total Discounts:</span>
              <span className="font-mono font-bold text-emerald-400">
                Rs. {reportData.discount_total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Void / Cancelled:</span>
              <span className="font-mono font-bold text-rose-400">
                {reportData.void_total} items
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Shift remains active and open
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={closeXReport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Close
            </button>
            <button
              onClick={handlePrintXSlip}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-glow-amber flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print X-Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
