import React from 'react';
import { usePosStore } from '../../store/posStore';
import { 
  Soup, 
  Flame, 
  UtensilsCrossed, 
  Cookie, 
  GlassWater, 
  CupSoda, 
  LayoutGrid,
  Search,
  X
} from 'lucide-react';

export const CategoryTabs: React.FC = () => {
  const { 
    categories, 
    selectedCategoryId, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery 
  } = usePosStore();

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Rice':
      case 'Rice & Curry':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'Kottu':
      case 'Kottu Station':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-red-400" />;
      case 'Noodles':
        return <Soup className="w-3.5 h-3.5 text-orange-400" />;
      case 'Devilled (200g)':
      case 'Devilled':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'Chopsy':
        return <Soup className="w-3.5 h-3.5 text-yellow-400" />;
      case 'Fruit Juice':
      case 'Fresh Juices':
        return <GlassWater className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Desserts':
        return <Cookie className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-slate-900/60 px-3 py-2 border-b border-slate-800/80 flex flex-row gap-2 items-center justify-between overflow-hidden select-none">
      {/* Category Scrollable Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 py-0.5 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
            selectedCategoryId === null
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-glow-amber'
              : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All Items</span>
        </button>

        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-glow-amber'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {getCategoryIcon(cat.name)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Instant Search Bar - Compact on Square Monitors */}
      <div className="relative w-40 sm:w-48 lg:w-56 shrink-0">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full bg-slate-950/90 border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
