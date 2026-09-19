import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import { ShieldCheck, X, Delete, Lock, KeyRound, AlertCircle } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { 
    isAdminAuthModalOpen, 
    closeAdminAuthModal, 
    adminAuthTitle, 
    verifyAndExecuteAdminAuth 
  } = usePosStore();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isAdminAuthModalOpen) {
      setPin('');
      setError(false);
    }
  }, [isAdminAuthModalOpen]);

  if (!isAdminAuthModalOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      // Auto-submit if 4 digits entered and matches default admin pin
      if (newPin.length === 4) {
        const success = verifyAndExecuteAdminAuth(newPin);
        if (!success) {
          setError(true);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;
    const success = verifyAndExecuteAdminAuth(pin);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Security Authorization
              </h2>
              <p className="text-[11px] text-amber-400/90 font-medium">
                Admin Supervisor PIN Required
              </p>
            </div>
          </div>

          <button
            onClick={closeAdminAuthModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Title / Context */}
        <div className="px-5 pt-4 pb-2 text-center">
          <span className="text-xs font-semibold text-slate-300">
            {adminAuthTitle}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Default Admin PIN: <span className="font-mono text-amber-400 font-bold">7788</span>
          </p>
        </div>

        {/* Masked PIN Display */}
        <div className="px-6 py-3 flex flex-col items-center">
          <div className={`flex items-center justify-center gap-3 py-2 px-6 rounded-2xl bg-slate-950 border transition-all ${
            error 
              ? 'border-rose-500 bg-rose-950/30 animate-pulse' 
              : 'border-slate-800 focus-within:border-amber-500'
          }`}>
            {[0, 1, 2, 3].map(idx => (
              <div 
                key={idx} 
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  pin.length > idx 
                    ? error ? 'bg-rose-500 scale-110' : 'bg-amber-400 scale-110 shadow-glow-amber' 
                    : 'border border-slate-700 bg-slate-900'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mt-2 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Incorrect Admin PIN. Please try again.</span>
            </div>
          )}
        </div>

        {/* Touchscreen Numeric Keypad */}
        <div className="p-5 pt-2 grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200 text-lg font-bold font-mono active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            CLEAR
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200 text-lg font-bold font-mono active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Submit Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeAdminAuthModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={pin.length < 4}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-glow-amber flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-1"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authorize</span>
          </button>
        </div>
      </div>
    </div>
  );
};
