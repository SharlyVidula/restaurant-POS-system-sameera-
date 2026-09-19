import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { CashTransaction } from '../../types';
import { 
  X, 
  KeyRound, 
  HandCoins, 
  Truck, 
  Receipt, 
  ShieldCheck, 
  FileText, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  User, 
  HelpCircle,
  History
} from 'lucide-react';

export const CashPayoutModal: React.FC = () => {
  const { 
    isCashPayoutModalOpen, 
    closeCashPayoutModal, 
    activeShift, 
    submitCashPayout,
    cashTransactions,
    currentUserRole 
  } = usePosStore();

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [txnType, setTxnType] = useState<CashTransaction['type']>('lending');
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [authorizedBy, setAuthorizedBy] = useState<string>('Admin Manager');

  if (!isCashPayoutModalOpen) return null;

  const numericAmount = parseFloat(amount) || 0;
  const isDeduction = txnType === 'lending' || txnType === 'expense' || txnType === 'drop';
  const currentExpected = activeShift.cash_drawer_expected;
  const nextExpected = isDeduction ? currentExpected - numericAmount : currentExpected + numericAmount;

  const quickRecipients = [
    'Staff Advance',
    'Fish Market (Galle)',
    'Vegetable Vendor',
    'Ice Supplier',
    'Driver / Courier',
    'Owner Draw'
  ];

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;
    if (!recipient.trim()) return;
    if (!reason.trim()) return;

    submitCashPayout({
      type: txnType,
      amount: numericAmount,
      recipient: recipient.trim(),
      reason: reason.trim(),
      authorized_by: authorizedBy,
      cashier_name: activeShift.cashier_name,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-950 to-orange-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Manual Cash Drawer Release
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Admin Authorized
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log Lending, Petty Cash, or Supplier Payouts with Hardware Solenoid Kick
              </p>
            </div>
          </div>

          <button
            onClick={closeCashPayoutModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Record Cash Out / In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Shift Payout Logs ({cashTransactions.length})</span>
          </button>
        </div>

        {/* Content View */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Type Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Transaction Reason / Purpose
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxnType('lending')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      txnType === 'lending'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-glow-amber'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <HandCoins className="w-4 h-4" />
                    <span>Cash Lending</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTxnType('expense')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      txnType === 'expense'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Supplier / Expense</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTxnType('float_in')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      txnType === 'float_in'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>Float In / Top-Up</span>
                  </button>
                </div>
              </div>

              {/* Amount Input & Quick Chips */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Amount Released (LKR) *
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Current Drawer: Rs. {currentExpected.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-sm">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono text-lg font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-[11px] font-mono text-slate-300 font-semibold transition-all"
                    >
                      +Rs. {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient / To Whom */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Handed Over To (Recipient Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Sunil (Fish Market) or Nimal (Staff Advance)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-semibold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Quick Recipient Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickRecipients.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRecipient(item)}
                      className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-[10px] text-slate-400 hover:text-slate-200 transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Detailed Reason / Purpose *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bought 4kg Fresh Seer Fish for dinner service"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Drawer Balance Impact Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Current Expected Cash:</span>
                  <span className="font-mono">Rs. {currentExpected.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-400">
                  <span>{isDeduction ? '(-) Cash Release / Out:' : '(+) Cash In / Float:'}</span>
                  <span className="font-mono">{isDeduction ? '-' : '+'} Rs. {numericAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-slate-800 pt-1 flex justify-between font-extrabold text-amber-400">
                  <span>New Expected Drawer Balance:</span>
                  <span className="font-mono">Rs. {nextExpected.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Submission Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={numericAmount <= 0 || !recipient.trim() || !reason.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-glow-amber flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Release Cash Drawer & Print Voucher Slip</span>
                </button>
              </div>
            </form>
          ) : (
            /* Shift Payouts History View */
            <div className="space-y-2">
              {cashTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No cash payouts or lending recorded in this session.
                </div>
              ) : (
                cashTransactions.map(txn => (
                  <div 
                    key={txn.id} 
                    className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition-all"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                          txn.type === 'lending' ? 'bg-amber-500/20 text-amber-300' :
                          txn.type === 'expense' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {txn.type}
                        </span>
                        <span className="text-slate-200">{txn.recipient}</span>
                      </span>
                      <span className="font-mono font-black text-amber-400">
                        Rs. {txn.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">
                      "{txn.reason}"
                    </p>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Auth: {txn.authorized_by} • Cashier: {txn.cashier_name}</span>
                      <span>{txn.timestamp}</span>
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
