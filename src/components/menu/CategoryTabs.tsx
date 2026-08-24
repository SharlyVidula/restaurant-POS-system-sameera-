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
      case 'Rice & Curry':
        return <Soup className="w-4 h-4" />;
      case 'Fried Rice':
        return <Flame className="w-4 h-4" />;
      case 'Kottu Station':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'Short Eats & Breads':
        return <Cookie className="w-4 h-4" />;
      case 'Fresh Juices':
        return <GlassWater className="w-4 h-4" />;
      case 'Soft Drinks':
        return <CupSoda className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-slate-900/60 p-3 border-b border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
      {/* Category Scrollable Pills */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin scrollbar-thumb-slate-700">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
            selectedCategoryId === null
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-glow-amber'
              : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>All Items</span>
        </button>

        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
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

      {/* Instant Search Bar */}
      <div className="relative w-full md:w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu (e.g., kottu, hopper, mango)..."
          className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
