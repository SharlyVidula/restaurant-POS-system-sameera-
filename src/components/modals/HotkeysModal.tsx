import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { MenuItem } from '../../types';
import { 
  X, 
  Search, 
  Keyboard, 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  Save, 
  ChefHat, 
  Sparkles,
  Tag,
  Hash
} from 'lucide-react';

export const HotkeysModal: React.FC = () => {
  const { 
    isHotkeysModalOpen, 
    closeHotkeysModal, 
    menuItems, 
    categories, 
    batchUpdateHotkeys 
  } = usePosStore();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  
  // Local state for batch editing: itemId -> hotkey string
  const [hotkeyMap, setHotkeyMap] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    menuItems.forEach(item => {
      map[item.id] = item.hotkey || String(item.id);
    });
    return map;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isHotkeysModalOpen) return null;

  // Collision detection: check for duplicate non-empty hotkeys
  const codeCounts: Record<string, number> = {};
  Object.values(hotkeyMap).forEach(code => {
    const trimmed = code.trim().toLowerCase();
    if (trimmed) {
      codeCounts[trimmed] = (codeCounts[trimmed] || 0) + 1;
    }
  });

  const hasDuplicates = Object.values(codeCounts).some(count => count > 1);

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCat === null || item.category_id === selectedCat;
    const currentCode = hotkeyMap[item.id] || '';
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).includes(search) ||
      currentCode.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleHotkeyChange = (itemId: number, val: string) => {
    // Only allow alphanumeric or dash/underscore, max 6 chars
    const cleaned = val.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 6);
    setHotkeyMap(prev => ({
      ...prev,
      [itemId]: cleaned
    }));
    setSavedSuccess(false);
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Reset all menu items' hotkeys to their default standard numbers (e.g. 101, 102)?")) {
      const resetMap: Record<number, string> = {};
      menuItems.forEach(item => {
        resetMap[item.id] = String(item.id);
      });
      setHotkeyMap(resetMap);
      setSavedSuccess(false);
    }
  };

  const handleSave = () => {
    batchUpdateHotkeys(hotkeyMap);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-glow-amber">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-100 tracking-wide">
                  Menu Item Hotkey Manager
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign numeric hotkeys to menu items so cashiers can punch orders directly from keyboard or numpad.
              </p>
            </div>
          </div>

          <button
            onClick={closeHotkeysModal}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Category Filter */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by item name, ID, or hotkey code..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all shadow-sm"
              title="Reset all items to standard numbers (item ID)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Standard PLU</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-glow-amber'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Hotkeys</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCat(null)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border shrink-0 ${
              selectedCat === null
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map(cat => {
            const count = menuItems.filter(m => m.category_id === cat.id).length;
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Duplicate warning alert if any */}
        {hasDuplicates && (
          <div className="px-5 py-2.5 bg-amber-950/40 border-b border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Notice: Duplicate hotkey numbers detected. Highlighted items share the same hotkey code.</span>
          </div>
        )}

        {/* Items Table List */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Item ID</th>
                  <th className="py-3 px-4">Menu Item</th>
                  <th className="py-3 px-4">Category / Station</th>
                  <th className="py-3 px-4 text-right">Base Price</th>
                  <th className="py-3 px-4 w-[200px]">Hotkey Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredItems.map(item => {
                  const currentCode = hotkeyMap[item.id] || '';
                  const trimmedLower = currentCode.trim().toLowerCase();
                  const isDuplicate = trimmedLower && (codeCounts[trimmedLower] || 0) > 1;

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono text-slate-500 font-bold">
                        #{item.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </div>
                        {item.variants && item.variants.length > 0 && (
                          <span className="text-[10px] text-slate-500">
                            {item.variants.length} portions (Half / Full)
                          </span>
                        )}
                      </td>

                      {/* Station */}
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 inline-flex items-center gap-1">
                          <ChefHat className="w-2.5 h-2.5 text-amber-400" />
                          <span>{item.station || 'Kitchen'}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                        Rs. {item.base_price.toLocaleString()}
                      </td>

                      {/* Hotkey Input */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`relative flex items-center rounded-xl border transition-all ${
                            isDuplicate
                              ? 'border-amber-500 bg-amber-950/30'
                              : 'border-slate-700 bg-slate-900 focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20'
                          }`}>
                            <span className="pl-2.5 text-slate-500 font-mono text-xs">
                              #
                            </span>
                            <input
                              type="text"
                              value={currentCode}
                              onChange={e => handleHotkeyChange(item.id, e.target.value)}
                              placeholder={String(item.id)}
                              className="w-24 bg-transparent px-1.5 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-none"
                            />
                          </div>

                          <button
                            onClick={() => handleHotkeyChange(item.id, String(item.id))}
                            title="Reset this item to its default ID"
                            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cashiers can simply punch the number on their keyboard or numpad and press Enter!</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={closeHotkeysModal}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all"
            >
              Close
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-glow-amber transition-all"
            >
              Save All Hotkeys
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
