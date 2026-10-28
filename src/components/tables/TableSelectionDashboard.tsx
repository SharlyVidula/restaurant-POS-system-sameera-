import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import { DiningTable } from '../../types';
import { 
  Layers, 
  Users, 
  Clock, 
  Receipt, 
  Check, 
  Sparkles, 
  UtensilsCrossed, 
  ArrowRight,
  Keyboard,
  CornerDownLeft
} from 'lucide-react';

export const TableSelectionDashboard: React.FC = () => {
  const { 
    tables, 
    selectedTable, 
    selectTable, 
    tableSessions 
  } = usePosStore();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [focusedTableIndex, setFocusedTableIndex] = useState<number>(0);

  const zones = ['Galle Fort Courtyard', 'Main Dining Hall', 'AC Lounge'] as const;

  // Stats
  const vacantCount = tables.filter(t => {
    const session = tableSessions[`table-${t.id}`];
    const sessionItemCount = session?.cart ? session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    return t.status === 'vacant' && sessionItemCount === 0;
  }).length;

  const occupiedCount = tables.filter(t => {
    const session = tableSessions[`table-${t.id}`];
    const sessionItemCount = session?.cart ? session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    return t.status === 'occupied' || sessionItemCount > 0;
  }).length;

  const billedCount = tables.filter(t => t.status === 'billed').length;

  const filteredZones = selectedZone === 'all' 
    ? zones 
    : zones.filter(z => z === selectedZone);

  // Flattened visible tables in the currently displayed zones
  const visibleTables = tables.filter(t => selectedZone === 'all' || t.zone === selectedZone);

  // Keyboard navigation for tables: Arrow keys to move, Enter to select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (visibleTables.length === 0) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedTableIndex(prev => (prev < visibleTables.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedTableIndex(prev => (prev > 0 ? prev - 1 : visibleTables.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedTableIndex(prev => {
          const next = prev + 4;
          return next < visibleTables.length ? next : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedTableIndex(prev => {
          const next = prev - 4;
          return next >= 0 ? next : prev;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeTable = visibleTables[focusedTableIndex];
        if (activeTable) {
          selectTable(activeTable);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleTables, focusedTableIndex, selectTable]);

  // Keep index within bounds when zone changes
  useEffect(() => {
    if (focusedTableIndex >= visibleTables.length) {
      setFocusedTableIndex(Math.max(0, visibleTables.length - 1));
    }
  }, [visibleTables.length, focusedTableIndex]);

  const activeFocusedTableId = visibleTables[focusedTableIndex]?.id;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0e1424] select-none animate-fadeIn">
      {/* Top Header Banner */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-glow-amber">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100 tracking-wide">
                Dining Floor & Table Selection
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase">
                Required for Dine-In
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a table from the floor layout below to begin adding menu items to that table's bill.
            </p>
          </div>
        </div>

        {/* Keyboard Navigation Badge & Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono font-semibold shadow-sm">
            <Keyboard className="w-3.5 h-3.5 text-amber-400" />
            <span>[↑ ↓ ← → Navigate • Enter ↵ Select Table]</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-emerald-400 bg-emerald-950/40 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{vacantCount} Available</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-amber-400 bg-amber-950/40 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{occupiedCount} Occupied</span>
            </div>
            {billedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-blue-400 bg-blue-950/40 border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>{billedCount} Billed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone Filter Tabs Bar */}
      <div className="px-6 py-2.5 bg-slate-900/50 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedZone('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              selectedZone === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Zones ({tables.length})
          </button>
          {zones.map((zone) => {
            const count = tables.filter(t => t.zone === zone).length;
            const isSelected = selectedZone === zone;
            return (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {zone} ({count})
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Click any table or use keyboard arrows to select</span>
        </div>
      </div>

      {/* Scrollable Floor Plan Layout */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredZones.map((zone) => {
          const zoneTables = tables.filter((t) => t.zone === zone);
          return (
            <div key={zone} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>{zone}</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {zoneTables.length} tables in zone
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {zoneTables.map((table) => {
                  const session = tableSessions[`table-${table.id}`];
                  const sessionItemCount = session?.cart 
                    ? session.cart.reduce((sum, item) => sum + item.quantity, 0) 
                    : 0;

                  const isSelected = selectedTable?.id === table.id;
                  const isKeyboardFocused = activeFocusedTableId === table.id;
                  const isOccupied = table.status === 'occupied' || sessionItemCount > 0;
                  const isBilled = table.status === 'billed';

                  let statusBorder = 'border-slate-800 hover:border-emerald-500/60';
                  let statusBg = 'bg-slate-950/70 hover:bg-slate-900/90';
                  let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                  if (isOccupied) {
                    statusBorder = 'border-amber-500/60 hover:border-amber-400';
                    statusBg = 'bg-amber-950/20 hover:bg-amber-950/30';
                    statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  } else if (isBilled) {
                    statusBorder = 'border-blue-500/60 hover:border-blue-400';
                    statusBg = 'bg-blue-950/20 hover:bg-blue-950/30';
                    statusBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                  }

                  if (isKeyboardFocused) {
                    statusBorder = 'border-amber-400 ring-2 ring-amber-400 shadow-glow-amber';
                    statusBg = 'bg-amber-950/30';
                  } else if (isSelected) {
                    statusBorder = 'border-emerald-400 ring-2 ring-emerald-400 shadow-glow-emerald';
                  }

                  return (
                    <div
                      key={table.id}
                      onClick={() => selectTable(table)}
                      className={`p-4 rounded-2xl border ${statusBorder} ${statusBg} cursor-pointer transition-all duration-200 flex flex-col justify-between select-none hover:scale-[1.02] active:scale-95 shadow-lg group relative ${
                        isKeyboardFocused ? 'scale-[1.02]' : ''
                      }`}
                    >
                      <div>
                        {/* Table Number & Status Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xl text-slate-100 group-hover:text-amber-400 transition-colors">
                              {table.table_number}
                            </span>
                            {isKeyboardFocused && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                <CornerDownLeft className="w-2.5 h-2.5" />
                                <span>Enter</span>
                              </span>
                            )}
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${statusBadge}`}>
                            {isOccupied ? 'Occupied' : isBilled ? 'Billed' : 'Available'}
                          </span>
                        </div>

                        {/* Capacity and details */}
                        <div className="space-y-1.5 my-2">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>Capacity: <strong className="text-slate-300">{table.capacity} Guests</strong></span>
                          </div>

                          {sessionItemCount > 0 ? (
                            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                              <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{sessionItemCount} {sessionItemCount === 1 ? 'item' : 'items'} in order</span>
                            </div>
                          ) : table.occupied_at ? (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Seated {table.occupied_at}</span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-emerald-400 font-medium">
                              Vacant • Ready for seating
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Amount & Action Link */}
                      <div className="mt-2 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                        {table.current_amount ? (
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-slate-500">Bill Total</span>
                            <span className="font-mono text-xs font-extrabold text-amber-400">
                              Rs. {table.current_amount.toLocaleString()}
                            </span>
                          </div>
                        ) : sessionItemCount > 0 ? (
                          <span className="font-mono text-xs font-bold text-amber-400">
                            Active Order
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Open Table</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
