import React, { useEffect } from 'react';
import { usePosStore } from './store/posStore';
import { PosHeader } from './components/header/PosHeader';
import { CategoryTabs } from './components/menu/CategoryTabs';
import { MenuItemCard } from './components/menu/MenuItemCard';
import { OrderCart } from './components/cart/OrderCart';
import { VariantModal } from './components/modals/VariantModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { TableModal } from './components/modals/TableModal';
import { PrintPreviewModal } from './components/modals/PrintPreviewModal';
import { XReportModal } from './components/modals/XReportModal';
import { ZReportModal } from './components/modals/ZReportModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { Sparkles, Utensils } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    init, 
    menuItems, 
    selectedCategoryId, 
    searchQuery,
    categories 
  } = usePosStore();

  useEffect(() => {
    init();
  }, [init]);

  // Filter items by category and search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId === null || item.category_id === selectedCategoryId;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.variants && item.variants.some(v => v.variant_name.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const selectedCategoryObj = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 font-sans select-none">
      {/* Top POS Header */}
      <PosHeader />

      {/* Main Workspace: Menu on Left/Center, Live Cart on Right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Category Navigator & Food Item Grid */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0e1424]">
          {/* Category Tabs & Search Bar */}
          <CategoryTabs />

          {/* Items Header Banner */}
          <div className="px-5 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                {selectedCategoryObj ? selectedCategoryObj.name : 'Full Menu Catalog'}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                {filteredItems.length} items
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="hidden sm:inline">Galle Fort Station Dispatch Enabled</span>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                <Utensils className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-semibold">No menu items match your search.</p>
                <p className="text-xs text-slate-600 mt-1">Try clearing filters or search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Side: Live Order Cart & Settle Panel */}
        <aside className="h-full">
          <OrderCart />
        </aside>
      </div>

      {/* Interactive Modals */}
      <VariantModal />
      <PaymentModal />
      <TableModal />
      <PrintPreviewModal />
      <XReportModal />
      <ZReportModal />
      <HistoryModal />
    </div>
  );
};

export default App;
