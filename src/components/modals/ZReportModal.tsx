import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { posDatabase } from '../../db/sqlite';
import { X, FileSpreadsheet, AlertTriangle, Printer, Banknote, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ZReportModal: React.FC = () => {
  const { 
    isZReportModalOpen, 
    closeZReport, 
    activeShift, 
    performZClosure 
  } = usePosStore();

  const expectedCash = activeShift.cash_drawer_expected;
  const [countedCash, setCountedCash] = useState<number>(expectedCash);
  const [closingCashier, setClosingCashier] = useState<string>(activeShift.cashier_name);
  const [closureNotes, setClosureNotes] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isZReportModalOpen) return null;

  const discrepancy = countedCash - expectedCash;

  const handlePerformZReport = () => {
    performZClosure(countedCash, closingCashier, closureNotes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-rose-900/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950/90 via-slate-950 to-rose-950/90 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Z-Report (End of Day Closure)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  FINAL SESSION LOCK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Register: {activeShift.register_number} • Started: {activeShift.opened_at}
              </p>
            </div>
          </div>

          <button
            onClick={closeZReport}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 bg-rose-950/40 border-b border-rose-900/30 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>
            Executing a Z-Report permanently closes this shift, reconciles cash drawer totals, and prints the legal day-end financial slip.
          </span>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* Expected vs Counted Cash */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Expected System Cash
              </span>
              <span className="font-mono text-lg font-black text-amber-400">
                Rs. {expectedCash.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Float (Rs. {activeShift.opening_float.toLocaleString()}) + Sales
                {activeShift.total_payouts ? ` - Payouts (Rs. ${activeShift.total_payouts.toLocaleString()})` : ''}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Actual Counted Cash
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={countedCash}
                  onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 font-mono text-lg font-black text-emerald-400 focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Physical drawer count
              </span>
            </div>
          </div>

          {/* Discrepancy (Over / Short) Display */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between ${
            discrepancy === 0
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
              : discrepancy > 0
              ? 'bg-blue-950/30 border-blue-800 text-blue-400'
              : 'bg-rose-950/30 border-rose-800 text-rose-400'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider">
              Drawer Discrepancy (Over/Short)
            </span>
            <span className="font-mono text-sm font-black">
              {discrepancy === 0 ? '✓ Balanced (Rs. 0.00)' : discrepancy > 0 ? `+ Rs. ${discrepancy.toLocaleString('en-LK', { minimumFractionDigits: 2 })} (OVER)` : `- Rs. ${Math.abs(discrepancy).toLocaleString('en-LK', { minimumFractionDigits: 2 })} (SHORT)`}
            </span>
          </div>

          {/* Cashier & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Closing Cashier / Manager Name
              </label>
              <input
                type="text"
                value={closingCashier}
                onChange={(e) => setClosingCashier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Shift Handover / Discrepancy Notes
              </label>
              <input
                type="text"
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                placeholder="e.g., Petty cash withdrawal of Rs. 500 for fresh mint leaves..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={closeZReport}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handlePerformZReport}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Close Shift & Print Legal Z-Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
