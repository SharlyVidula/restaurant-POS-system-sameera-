import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import { 
  Store, 
  Clock, 
  KeyRound, 
  Layers, 
  ReceiptText, 
  FileSpreadsheet, 
  History, 
  Sparkles,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  GitBranch
} from 'lucide-react';
import { OrderType } from '../../types';
import { GitUpdateModal } from '../modals/GitUpdateModal';
import southernSpoonLogo from '../../assets/logo.png';

export const PosHeader: React.FC = () => {
  const {
    restaurant,
    activeShift,
    orderType,
    setOrderType,
    selectedTable,
    openTableModal,
    openXReport,
    openZReport,
    openHistoryModal,
    triggerDrawerKick,
    drawerPulseActive,
    cart
  } = usePosStore();

  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const orderTypes: { type: OrderType; label: string; icon: React.ReactNode }[] = [
    { type: 'dine_in', label: 'Dine-In', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { type: 'takeaway', label: 'Takeaway', icon: <ShoppingBag className="w-4 h-4" /> },
    { type: 'delivery', label: 'Delivery', icon: <Bike className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-between shadow-lg sticky top-0 z-30 select-none">
        {/* Restaurant Brand & Branch */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg shadow-amber-950/40 border border-amber-500/40 p-0.5 relative group overflow-hidden shrink-0">
            <img 
              src={southernSpoonLogo} 
              alt="Southern Spoon" 
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-amber-400/20 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm lg:text-base tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
                {restaurant.name}
              </h1>
              <span className="bg-amber-950/90 text-amber-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-700/60">
                {restaurant.branch}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="font-medium text-amber-500/90">Authentic Sri Lankan Cuisine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span className="text-emerald-400 font-mono text-[10px]">Offline POS</span>
            </p>
          </div>
        </div>

      {/* Order Mode Switcher */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
        {orderTypes.map(({ type, label, icon }) => {
          const isActive = orderType === type;
          return (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {icon}
              <span>{label}</span>
              {type === 'dine_in' && selectedTable && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-slate-900/80 text-amber-300 rounded font-mono font-bold">
                  {selectedTable.table_number}
                </span>
              )}
            </button>
          );
        })}

        {orderType === 'dine_in' && (
          <button
            onClick={openTableModal}
            className={`ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedTable
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30 animate-pulse'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{selectedTable ? `Table: ${selectedTable.table_number}` : 'Select Table'}</span>
          </button>
        )}
      </div>

      {/* Quick Action Tools & Shift Controls */}
      <div className="flex items-center gap-2">
        {/* Cash Drawer Kick Button */}
        <button
          onClick={() => triggerDrawerKick('Manual Cash Drawer Open')}
          title="Kick Cash Drawer (ESC/POS 24V Pulse)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            drawerPulseActive
              ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-glow-emerald animate-pulse-drawer'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <KeyRound className={`w-3.5 h-3.5 ${drawerPulseActive ? 'text-white' : 'text-emerald-400'}`} />
          <span className="hidden md:inline">Open Drawer</span>
        </button>

        {/* Order History */}
        <button
          onClick={openHistoryModal}
          title="Order History & Receipts"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
        >
          <History className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Orders</span>
        </button>

        {/* X-Report */}
        <button
          onClick={openXReport}
          title="X-Report: Shift Snapshot"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-amber-400 border border-amber-700/40 hover:bg-amber-950/40 transition-all"
        >
          <ReceiptText className="w-3.5 h-3.5" />
          <span>X-Report</span>
        </button>

        {/* Z-Report */}
        <button
          onClick={openZReport}
          title="Z-Report: End of Day Closure"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-900/60 to-rose-900/60 text-rose-300 border border-rose-700/50 hover:from-red-800 hover:to-rose-800 transition-all"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-rose-400" />
          <span>Z-Report</span>
        </button>

        {/* Git Update Sync */}
        <button
          onClick={() => setIsGitModalOpen(true)}
          title="Check GitHub for Updates"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-300 transition-all"
        >
          <GitBranch className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden xl:inline">Sync Git</span>
        </button>

        {/* Live Clock & Shift Info */}
        <div className="hidden lg:flex flex-col text-right pl-2 border-l border-slate-800">
          <div className="flex items-center justify-end gap-1.5 text-slate-200 font-mono text-xs font-bold">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{time}</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
            <span>{activeShift.cashier_name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-500/80 font-mono">{activeShift.register_number}</span>
          </div>
        </div>
      </div>
    </header>

    <GitUpdateModal 
      isOpen={isGitModalOpen} 
      onClose={() => setIsGitModalOpen(false)} 
    />
  </>
  );
};
