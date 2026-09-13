import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Printer, Database, ArrowRight } from 'lucide-react';
import southernSpoonLogo from '../../assets/logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Starting Southern Spoon Terminal...');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const steps = [
      { progress: 20, message: 'Mounting Offline SQLite Local Database...', step: 'db' },
      { progress: 45, message: 'Loading Southern Spoon Menu & Table Maps...', step: 'menu' },
      { progress: 70, message: 'Probing Hardware Thermal Printers (ESC/POS 80mm)...', step: 'printer' },
      { progress: 90, message: 'Checking RJ11 Cash Drawer 24V Solenoid Interface...', step: 'drawer' },
      { progress: 100, message: 'System Ready for Service! Welcome to Southern Spoon.', step: 'ready' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const item = steps[currentStep];
        setProgress(item.progress);
        setStatusMessage(item.message);
        setCompletedSteps(prev => [...prev, item.step]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(onComplete, 500);
        }, 400);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-[#070a12] flex flex-col items-center justify-center p-6 select-none transition-opacity duration-500 ${
      isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Ambient background glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-600/15 via-rose-600/10 to-transparent blur-3xl pointer-events-none -top-20" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-600/10 via-amber-700/10 to-transparent blur-3xl pointer-events-none -bottom-20" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        
        {/* Brand Logo with Glow */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-500/50 shadow-2xl p-1.5 flex items-center justify-center">
            <img 
              src={southernSpoonLogo} 
              alt="Southern Spoon Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-amber-300 uppercase drop-shadow-md">
          SOUTHERN SPOON
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-amber-500/90 tracking-widest uppercase mt-1">
          Authentic Sri Lankan Cuisine
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-400">
          <span>EST. GALLE • 2026</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Offline POS Terminal</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full mt-8 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span className="text-[11px] text-amber-400/90 truncate max-w-[280px]">
              {statusMessage}
            </span>
            <span className="font-bold text-slate-300">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-300 ease-out shadow-glow-amber"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Hardware Status Indicators */}
        <div className="grid grid-cols-2 gap-2 w-full mt-6 text-[10px] text-slate-400 font-mono">
          <div className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
            completedSteps.includes('db') 
              ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-300' 
              : 'bg-slate-950/50 border-slate-800 text-slate-600'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Storage</span>
          </div>

          <div className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
            completedSteps.includes('printer') 
              ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-300' 
              : 'bg-slate-950/50 border-slate-800 text-slate-600'
          }`}>
            <Printer className="w-3.5 h-3.5" />
            <span>ESC/POS Thermal</span>
          </div>
        </div>

        {/* Fast Skip Option */}
        <button
          onClick={() => {
            setIsFadingOut(true);
            setTimeout(onComplete, 300);
          }}
          className="mt-6 text-xs text-slate-500 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Skip to Terminal</span>
          <ArrowRight className="w-3 h-3" />
        </button>

      </div>
    </div>
  );
};
