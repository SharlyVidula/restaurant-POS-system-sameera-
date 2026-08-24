import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { PaymentMethod } from '../../types';
import { 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  Printer, 
  KeyRound,
  ArrowRight,
  Sparkles,
  Receipt
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { 
    isPaymentModalOpen, 
    closePaymentModal, 
    getNetTotal, 
    cart, 
    processPayment, 
    selectedTable, 
    orderType 
  } = usePosStore();

  if (!isPaymentModalOpen) return null;

  const netTotal = getNetTotal();
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(netTotal);
  const [cardRef, setCardRef] = useState<string>('');
  const [cardProvider, setCardProvider] = useState<'Visa' | 'Mastercard' | 'Amex'>('Visa');
  const [qrRef, setQrRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sri Lankan currency denominations
  const denominations = [5000, 2000, 1000, 500, 100];

  const handleQuickCash = (amount: number) => {
    setCashTendered(prev => prev + amount);
  };

  const handleExactCash = () => {
    setCashTendered(netTotal);
  };

  const change = Math.max(0, cashTendered - netTotal);
  const isCashSufficient = cashTendered >= netTotal;

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      if (activeMethod === 'cash') {
        await processPayment('cash', cashTendered);
      } else if (activeMethod === 'card') {
        await processPayment('card', undefined, `${cardProvider}: ${cardRef || 'Approved'}`);
      } else if (activeMethod === 'qr') {
        await processPayment('qr', undefined, qrRef || `LankaQR-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Settlement & Payment
              </h2>
              <p className="text-xs text-slate-400">
                {orderType === 'dine_in' && selectedTable ? `Table: ${selectedTable.table_number}` : 'Takeaway Order'} • {cart.length} items
              </p>
            </div>
          </div>

          <button
            onClick={closePaymentModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              Total Amount Due (LKR)
            </span>
            <span className="text-xs text-slate-400">
              Includes service charge & applicable taxes
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-3xl text-amber-400">
              Rs. {netTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveMethod('cash')}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
              activeMethod === 'cash'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500 shadow-glow-emerald'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span className="text-xs font-bold">Cash (LKR)</span>
          </button>

          <button
            onClick={() => setActiveMethod('card')}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
              activeMethod === 'card'
                ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs font-bold">Card Terminal</span>
          </button>

          <button
            onClick={() => setActiveMethod('qr')}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
              activeMethod === 'qr'
                ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span className="text-xs font-bold">LankaQR</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 space-y-4">
          {/* 1. CASH ASSISTANT */}
          {activeMethod === 'cash' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Cash Tendered (LKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 font-mono text-lg font-bold text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Change Return Box */}
                <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Change to Return
                  </span>
                  <span className={`font-mono text-2xl font-black ${
                    change > 0 ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    Rs. {change.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quick Denomination Add
                </label>
                <div className="grid grid-cols-6 gap-2">
                  <button
                    onClick={handleExactCash}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono transition-all"
                  >
                    Exact
                  </button>
                  {denominations.map((denom) => (
                    <button
                      key={denom}
                      onClick={() => handleQuickCash(denom)}
                      className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-bold font-mono transition-all"
                    >
                      +{denom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer notification */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>ESC/POS drawer kick pulse will trigger automatically upon settlement.</span>
              </div>
            </div>
          )}

          {/* 2. CARD TERMINAL */}
          {activeMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Card Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Visa', 'Mastercard', 'Amex'] as const).map((prov) => (
                    <button
                      key={prov}
                      onClick={() => setCardProvider(prov)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        cardProvider === prov
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Terminal Approval / Transaction Reference
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. AUTH-908234"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <p className="text-xs text-slate-500">
                Please charge Rs. {netTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })} on the EDC terminal before confirming.
              </p>
            </div>
          )}

          {/* 3. LANKA QR / DIGITAL */}
          {activeMethod === 'qr' && (
            <div className="space-y-4 text-center">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                {/* Visual LankaQR simulation */}
                <div className="w-40 h-40 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white relative overflow-hidden">
                  <QrCode className="w-28 h-28 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent animate-pulse" />
                </div>
                <div className="text-slate-950 text-[10px] font-bold mt-2 uppercase tracking-wider">
                  LankaQR / Merchant ID: 8892019
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-2">
                  Customer can scan using FriMi, iPay, Genie, Flash or Bank App
                </span>
                <input
                  type="text"
                  value={qrRef}
                  onChange={(e) => setQrRef(e.target.value)}
                  placeholder="Digital Txn Ref (optional)..."
                  className="w-full max-w-xs mx-auto bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer: Confirm Settlement */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={closePaymentModal}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleComplete}
            disabled={isProcessing || (activeMethod === 'cash' && !isCashSufficient)}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm shadow-glow-emerald flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Complete & Print Thermal Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
