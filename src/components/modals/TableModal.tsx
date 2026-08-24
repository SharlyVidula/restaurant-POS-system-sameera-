import React from 'react';
import { usePosStore } from '../../store/posStore';
import { DiningTable } from '../../types';
import { X, Users, Clock, Receipt, Check, Layers } from 'lucide-react';

export const TableModal: React.FC = () => {
  const { 
    isTableModalOpen, 
    closeTableModal, 
    tables, 
    selectedTable, 
    selectTable 
  } = usePosStore();

  if (!isTableModalOpen) return null;

  const zones = ['Galle Fort Courtyard', 'Main Dining Hall', 'AC Lounge'] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Dining Floor & Table Layout
              </h2>
              <p className="text-xs text-slate-400">
                Select a dining table to assign or transfer order
              </p>
            </div>
          </div>

          <button
            onClick={closeTableModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Vacant (Available)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Occupied (Dining)</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Billed (Settling)</span>
          </div>
        </div>

        {/* Tables by Zone */}
        <div className="p-5 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {zones.map((zone) => {
            const zoneTables = tables.filter((t) => t.zone === zone);
            return (
              <div key={zone}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <span>{zone}</span>
                  <span className="text-[10px] text-slate-600 font-mono">({zoneTables.length} tables)</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {zoneTables.map((table) => {
                    const isSelected = selectedTable?.id === table.id;
                    const isOccupied = table.status === 'occupied';
                    const isBilled = table.status === 'billed';

                    let statusBorder = 'border-slate-800 hover:border-emerald-500/50';
                    let statusBg = 'bg-slate-950/60';
                    let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                    if (isOccupied) {
                      statusBorder = 'border-amber-500/50 hover:border-amber-400';
                      statusBg = 'bg-amber-950/20';
                      statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                    } else if (isBilled) {
                      statusBorder = 'border-blue-500/50 hover:border-blue-400';
                      statusBg = 'bg-blue-950/20';
                      statusBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                    }

                    if (isSelected) {
                      statusBorder = 'border-amber-400 ring-2 ring-amber-400 shadow-glow-amber';
                    }

                    return (
                      <div
                        key={table.id}
                        onClick={() => selectTable(table)}
                        className={`p-3.5 rounded-2xl border ${statusBorder} ${statusBg} cursor-pointer transition-all duration-200 flex flex-col justify-between select-none hover:scale-[1.02] active:scale-95`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-black text-base text-slate-100">
                            {table.table_number}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${statusBadge}`}>
                            {table.status}
                          </span>
                        </div>

                        <div className="space-y-1 my-1">
                          <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span>Capacity: {table.capacity}p</span>
                          </div>

                          {table.occupied_at && (
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>Since {table.occupied_at}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          {table.current_amount ? (
                            <span className="font-mono text-xs font-bold text-amber-400">
                              Rs. {table.current_amount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-semibold">
                              Available
                            </span>
                          )}

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
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

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={closeTableModal}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
