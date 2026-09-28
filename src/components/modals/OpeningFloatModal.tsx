import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import { posDatabase } from '../../db/sqlite';
import { 
  Banknote, 
  Coins, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Sparkles, 
  Printer, 
  KeyRound, 
  Calculator, 
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const OpeningFloatModal: React.FC = () => {
  const {
    isOpeningFloatModalOpen,
    closeOpeningFloatModal,
    activeShift,
    setOpeningFloat,
    restaurant,
  } = usePosStore();

  const [floatAmount, setFloatAmount] = useState<number>(activeShift?.opening_float > 0 ? activeShift.opening_float : 15000);
  const [cashierName, setCashierName] = useState<string>(activeShift?.cashier_name || 'Sameera (Head Cashier)');
  const [notes, setNotes] = useState<string>('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [kickDrawer, setKickDrawer] = useState<boolean>(true);
  const [printSlip, setPrintSlip] = useState<boolean>(true);
  const [mode, setMode] = useState<'quick' | 'breakdown'>('quick');

  // Sri Lanka Rupee denominations
  const [denominations, setDenominations] = useState<{ [key: string]: number }>({
    '5000': 0,
    '1000': 0,
    '500': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    'coins': 0,
  });

  const todayDateFormatted = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    if (isOpeningFloatModalOpen) {
      setAdminPin('');
      setPinError(null);
      if (activeShift?.opening_float && activeShift.opening_float > 0) {
        setFloatAmount(activeShift.opening_float);
      } else {
        setFloatAmount(15000);
      }
      setCashierName(activeShift?.cashier_name || 'Sameera (Head Cashier)');
    }
  }, [isOpeningFloatModalOpen, activeShift]);

  // Recalculate total when denominations change in breakdown mode
  const updateDenomination = (denom: string, count: number) => {
    const val = Math.max(0, count || 0);
    const updated = { ...denominations, [denom]: val };
    setDenominations(updated);

    const total = 
      (updated['5000'] * 5000) +
      (updated['1000'] * 1000) +
      (updated['500'] * 500) +
      (updated['100'] * 100) +
      (updated['50'] * 50) +
      (updated['20'] * 20) +
      (updated['coins'] || 0);
    
    setFloatAmount(total);
  };

  if (!isOpeningFloatModalOpen) return null;

  const presets = [5000, 10000, 15000, 20000, 25000, 30000, 50000];

  const handlePresetClick = (amount: number) => {
    setFloatAmount(amount);
    setMode('quick');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (floatAmount <= 0) {
      setPinError('Opening float must be greater than Rs. 0');
      return;
    }

    if (!adminPin) {
      setPinError('Please enter Admin Supervisor PIN to authorize');
      return;
    }

    const isValid = posDatabase.verifyAdminPin(adminPin);
    if (!isValid) {
      setPinError('Incorrect Admin PIN. Please verify credentials.');
      setAdminPin('');
      return;
    }

    setPinError(null);
    setOpeningFloat(
      floatAmount,
      cashierName,
      notes || 'Day Start Float Setup',
      mode === 'breakdown' ? denominations : undefined,
      kickDrawer,
      printSlip
    );
  };

  const isMandatory = !activeShift?.is_float_set;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  {isMandatory ? 'Set Daily Opening Float' : 'Adjust Opening Cash Float'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DAY START
                </span>
              </div>
              <p className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{todayDateFormatted}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-mono">{activeShift?.register_number || 'REG-01'}</span>
              </p>
            </div>
          </div>

          {!isMandatory && (
            <button
              onClick={closeOpeningFloatModal}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notice Banner */}
        <div className="px-4 py-2.5 bg-amber-950/30 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300/90">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] leading-snug">
              Admin Supervisor must verify and set the cash drawer float for today's service.
            </span>
          </div>
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setMode('quick')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                mode === 'quick' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Quick Preset
            </button>
            <button
              type="button"
              onClick={() => setMode('breakdown')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                mode === 'breakdown' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3 h-3" />
              <span>Count Notes</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Main Float Amount Input */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Opening Cash Float Amount (LKR)
            </label>
            <div className="flex items-center justify-center gap-2 my-1">
              <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">Rs.</span>
              <input
                type="number"
                min="0"
                step="100"
                value={floatAmount || ''}
                onChange={(e) => {
                  setFloatAmount(parseFloat(e.target.value) || 0);
                  setPinError(null);
                }}
                className="bg-transparent border-b-2 border-amber-500/60 focus:border-amber-400 text-2xl sm:text-3xl font-black font-mono text-slate-100 text-center w-48 sm:w-56 focus:outline-none tracking-wide"
                placeholder="0"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {floatAmount > 0 
                ? `Rs. ${floatAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })} Sri Lankan Rupees` 
                : 'Enter morning cash drawer float'}
            </p>
          </div>

          {/* Quick Presets */}
          {mode === 'quick' && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-2">
                Quick Select Common Floats:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((amt) => {
                  const isSelected = floatAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetClick(amt)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all border ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-glow-amber scale-102 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      Rs. {(amt / 1000).toFixed(0)}k
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Denomination Breakdown Mode */}
          {mode === 'breakdown' && (
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Physical Currency Count</span>
                </span>
                <span className="text-[10px] text-slate-400">Total: Rs. {floatAmount.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: '5000', label: 'Rs. 5,000 Notes', mult: 5000 },
                  { key: '1000', label: 'Rs. 1,000 Notes', mult: 1000 },
                  { key: '500', label: 'Rs. 500 Notes', mult: 500 },
                  { key: '100', label: 'Rs. 100 Notes', mult: 100 },
                  { key: '50', label: 'Rs. 50 Notes', mult: 50 },
                  { key: '20', label: 'Rs. 20 Notes', mult: 20 },
                ].map(({ key, label, mult }) => (
                  <div key={key} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] font-medium text-slate-300">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={denominations[key] || ''}
                        onChange={(e) => updateDenomination(key, parseInt(e.target.value, 10) || 0)}
                        placeholder="0"
                        className="w-12 text-center bg-slate-950 border border-slate-700 rounded-lg py-0.5 font-mono text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono w-14 text-right">
                        {(denominations[key] || 0) * mult > 0 ? `Rs. ${((denominations[key] || 0) * mult).toLocaleString()}` : '0'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coins Total */}
              <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-[11px] font-medium text-slate-300">Loose Coins Total (Rs.)</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={denominations['coins'] || ''}
                  onChange={(e) => updateDenomination('coins', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-24 text-right bg-slate-950 border border-slate-700 rounded-lg py-0.5 px-2 font-mono text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Cashier & Session Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Cashier on Duty
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                placeholder="e.g. Sameera"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Opening Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Morning Shift Start"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Admin Supervisor PIN Authorization */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Supervisor Authorization PIN</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Confidential Access Code
              </span>
            </div>

            <div>
              <input
                type="password"
                maxLength={6}
                value={adminPin}
                onChange={(e) => {
                  setAdminPin(e.target.value);
                  setPinError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                placeholder="Enter Secret Admin PIN"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-[0.3em] text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
              />
            </div>

            {pinError && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold animate-fadeIn justify-center pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}
          </div>

          {/* Hardware Solenoid & ESC/POS Voucher Options */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-300 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={kickDrawer}
                onChange={(e) => setKickDrawer(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] text-slate-300">
                Kick Open Cash Drawer (Deposit Float)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printSlip}
                onChange={(e) => setPrintSlip(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] text-slate-300 flex items-center gap-1">
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Float Slip</span>
              </span>
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {!isMandatory ? (
            <button
              type="button"
              onClick={closeOpeningFloatModal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex-1"
            >
              Cancel
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 px-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Shift: #{activeShift?.id}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-glow-amber flex items-center justify-center gap-2 transition-all active:scale-95 flex-1"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Set Opening Float (Rs. {floatAmount.toLocaleString('en-LK')})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
