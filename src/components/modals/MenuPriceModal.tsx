import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import { MenuItem, ItemVariant } from '../../types';
import { 
  X, 
  Search, 
  Check, 
  History, 
  Flame, 
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
  Package,
  Plus,
  Trash2,
  ChefHat,
  Tag,
  AlertCircle,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  FolderPlus
} from 'lucide-react';

const STATIONS: MenuItem['station'][] = [
  'Wok Station',
  'Kottu Griddle',
  'Curry Counter',
  'Kitchen',
  'Juice Bar',
  'Beverage Bar',
  'Dessert Bar',
  'Short Eats',
];

const BADGES = [
  'None',
  'Popular',
  'Bestseller',
  'Special',
  'Chef Special',
  'Must Try',
  'New',
];

export const MenuPriceModal: React.FC = () => {
  const { 
    isMenuPriceModalOpen, 
    closeMenuPriceModal, 
    menuItems, 
    categories, 
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    priceAudits 
  } = usePosStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'add' | 'history'>('editor');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Selected item state for editing
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number>(1);
  const [editStation, setEditStation] = useState<MenuItem['station']>('Wok Station');
  const [editBadge, setEditBadge] = useState<string>('None');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editIsAvailable, setEditIsAvailable] = useState<boolean>(true);
  const [editBasePrice, setEditBasePrice] = useState<number>(0);
  const [editHasVariants, setEditHasVariants] = useState<boolean>(false);
  const [editVariants, setEditVariants] = useState<Array<{ id: number; variant_name: string; price_adjustment: number }>>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

  // Add Item form state
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number>(categories[0]?.id || 1);
  const [newStation, setNewStation] = useState<MenuItem['station']>('Wok Station');
  const [newBadge, setNewBadge] = useState<string>('None');
  const [newDescription, setNewDescription] = useState('');
  const [newBasePrice, setNewBasePrice] = useState<number>(500);
  const [newHasVariants, setNewHasVariants] = useState<boolean>(true);
  const [newVariants, setNewVariants] = useState<Array<{ id: number; variant_name: string; price_adjustment: number }>>([
    { id: 1, variant_name: 'Half Portion', price_adjustment: 0 },
    { id: 2, variant_name: 'Full Portion', price_adjustment: 200 }
  ]);
  const [newDefaultNotes, setNewDefaultNotes] = useState('');
  const [addNotice, setAddNotice] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // New Category inline creation state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');

  if (!isMenuPriceModalOpen) return null;

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditCategoryId(item.category_id);
    setEditStation(item.station || 'Wok Station');
    setEditBadge(item.badge || 'None');
    setEditDescription(item.description || '');
    setEditIsAvailable(item.is_available);
    setEditBasePrice(item.base_price);
    const hasV = !!(item.variants && item.variants.length > 0);
    setEditHasVariants(hasV);
    setEditVariants(
      hasV 
        ? item.variants!.map(v => ({ id: v.id, variant_name: v.variant_name, price_adjustment: v.price_adjustment }))
        : [
            { id: 1, variant_name: 'Half Portion', price_adjustment: 0 },
            { id: 2, variant_name: 'Full Portion', price_adjustment: 200 }
          ]
    );
    setSavedNotice(null);
    setDeleteConfirm(false);
  };

  useEffect(() => {
    if (isMenuPriceModalOpen) {
      if (menuItems.length > 0 && !selectedItem) {
        handleSelectItem(menuItems[0]);
      }
      setSavedNotice(null);
      setDeleteConfirm(false);
    }
  }, [isMenuPriceModalOpen, menuItems]);

  const handleStepPrice = (delta: number) => {
    setEditBasePrice(prev => Math.max(0, prev + delta));
  };

  const handleStepNewPrice = (delta: number) => {
    setNewBasePrice(prev => Math.max(0, prev + delta));
  };

  const handleApplyPresetVariants = (preset: 'half_full' | 'sm_med_lg' | 'single_double', isNew: boolean = false) => {
    let variants: Array<{ id: number; variant_name: string; price_adjustment: number }> = [];
    if (preset === 'half_full') {
      variants = [
        { id: 1, variant_name: 'Half Portion', price_adjustment: 0 },
        { id: 2, variant_name: 'Full Portion', price_adjustment: 200 }
      ];
    } else if (preset === 'sm_med_lg') {
      variants = [
        { id: 1, variant_name: 'Small', price_adjustment: 0 },
        { id: 2, variant_name: 'Regular', price_adjustment: 150 },
        { id: 3, variant_name: 'Large', price_adjustment: 300 }
      ];
    } else if (preset === 'single_double') {
      variants = [
        { id: 1, variant_name: 'Single Portion', price_adjustment: 0 },
        { id: 2, variant_name: 'Double Portion', price_adjustment: 250 }
      ];
    }

    if (isNew) {
      setNewVariants(variants);
      setNewHasVariants(true);
    } else {
      setEditVariants(variants);
      setEditHasVariants(true);
    }
  };

  const handleAddVariantRow = (isNew: boolean = false) => {
    if (isNew) {
      setNewVariants(prev => [
        ...prev,
        { id: Date.now(), variant_name: `Portion ${prev.length + 1}`, price_adjustment: 100 }
      ]);
    } else {
      setEditVariants(prev => [
        ...prev,
        { id: Date.now(), variant_name: `Portion ${prev.length + 1}`, price_adjustment: 100 }
      ]);
    }
  };

  const handleRemoveVariantRow = (index: number, isNew: boolean = false) => {
    if (isNew) {
      setNewVariants(prev => prev.filter((_, i) => i !== index));
    } else {
      setEditVariants(prev => prev.filter((_, i) => i !== index));
    }
  };

  // When changing category in Add Item form, automatically configure portion suggestions
  const handleNewCategoryChange = (catId: number) => {
    setNewCategoryId(catId);
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    // Auto default station based on category
    if (cat.name === 'Rice') {
      setNewStation('Wok Station');
      setNewHasVariants(true);
      handleApplyPresetVariants('half_full', true);
    } else if (cat.name === 'Kottu') {
      setNewStation('Kottu Griddle');
      setNewHasVariants(true);
      handleApplyPresetVariants('half_full', true);
    } else if (cat.name === 'Noodles') {
      setNewStation('Wok Station');
      setNewHasVariants(true);
      handleApplyPresetVariants('half_full', true);
    } else if (cat.name === 'Fruit Juice') {
      setNewStation('Juice Bar');
      setNewHasVariants(false);
    } else if (cat.name === 'Desserts') {
      setNewStation('Dessert Bar');
      setNewHasVariants(false);
    } else if (cat.name === 'Soft Drinks') {
      setNewStation('Beverage Bar');
      setNewHasVariants(false);
    } else if (cat.name.includes('Devilled')) {
      setNewStation('Kitchen');
      setNewHasVariants(false);
    }
  };

  const handleSaveItem = () => {
    if (!selectedItem) return;
    if (!editName.trim()) {
      alert('Item name cannot be empty');
      return;
    }

    const cleanedVariants: ItemVariant[] | undefined = editHasVariants && editVariants.length > 0
      ? editVariants.map((v, i) => ({
          id: v.id && v.id > 100 ? v.id : (selectedItem.id * 100 + i + 1),
          menu_item_id: selectedItem.id,
          variant_name: v.variant_name.trim() || `Portion ${i + 1}`,
          price_adjustment: Number(v.price_adjustment) || 0,
        }))
      : undefined;

    const updatedItem: MenuItem = {
      ...selectedItem,
      name: editName.trim(),
      category_id: editCategoryId,
      station: editStation,
      badge: editBadge === 'None' ? undefined : editBadge,
      description: editDescription.trim() || undefined,
      is_available: editIsAvailable,
      base_price: Number(editBasePrice) || 0,
      variants: cleanedVariants,
    };

    const success = updateMenuItem(updatedItem);
    if (success) {
      setSelectedItem(updatedItem);
      setSavedNotice(`Saved changes for ${updatedItem.name}`);
      setTimeout(() => setSavedNotice(null), 3500);
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    const success = deleteMenuItem(selectedItem.id);
    if (success) {
      setDeleteConfirm(false);
      setSelectedItem(null);
      setSavedNotice(`Deleted item`);
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newName.trim()) {
      setAddError('Please enter a name for the new item.');
      return;
    }

    if (newBasePrice < 0 || isNaN(Number(newBasePrice))) {
      setAddError('Please enter a valid base price.');
      return;
    }

    let variantsToSave: ItemVariant[] | undefined = undefined;
    if (newHasVariants) {
      if (newVariants.length === 0) {
        setAddError('Please add at least one portion size or disable portions.');
        return;
      }
      variantsToSave = newVariants.map((v, idx) => ({
        id: Date.now() + idx,
        menu_item_id: 0,
        variant_name: v.variant_name.trim() || `Portion ${idx + 1}`,
        price_adjustment: Number(v.price_adjustment) || 0,
      }));
    }

    const created = addMenuItem({
      name: newName.trim(),
      category_id: newCategoryId,
      base_price: Number(newBasePrice),
      is_available: true,
      description: newDescription.trim() || undefined,
      station: newStation,
      badge: newBadge === 'None' ? undefined : newBadge,
      variants: variantsToSave,
      default_notes: newDefaultNotes 
        ? newDefaultNotes.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
    });

    setAddNotice(`Successfully added "${created.name}" to inventory!`);
    
    // Reset form
    setNewName('');
    setNewDescription('');
    setNewDefaultNotes('');
    
    // Switch to editor with newly created item
    setTimeout(() => {
      setAddNotice(null);
      handleSelectItem(created);
      setActiveTab('editor');
    }, 1200);
  };

  const handleAddNewCategory = () => {
    if (!newCategoryTitle.trim()) return;
    const createdCat = addCategory(newCategoryTitle.trim());
    setNewCategoryId(createdCat.id);
    setIsAddingCategory(false);
    setNewCategoryTitle('');
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === null || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-glow-amber">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Inventory & Menu Management
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ADMIN SUPERVISOR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage all food categories, menu items, base prices, portion sizes, and stock availability
              </p>
            </div>
          </div>

          <button
            onClick={closeMenuPriceModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Items & Prices ({menuItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                  : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add New Item</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Price Audit Log ({priceAudits.length})</span>
            </button>
          </div>

          {activeTab === 'editor' && (
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search food item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* TAB 1: ITEMS & PRICES DIRECTORY */}
          {activeTab === 'editor' && (
            <>
              {/* Left Column: Category Filter & Item List */}
              <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col overflow-hidden bg-slate-950/50">
                {/* Category horizontal scroll */}
                <div className="p-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === null
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    All ({menuItems.length})
                  </button>
                  {categories.map(cat => {
                    const count = menuItems.filter(m => m.category_id === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                  {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No items found matching the selected filter.
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          selectedItem?.id === item.id
                            ? 'bg-amber-500/15 border-amber-500 shadow-glow-amber'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${item.is_available ? 'bg-emerald-400' : 'bg-red-500'}`} />
                            <span className="font-bold text-xs text-slate-200 truncate block">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                            <span>{categories.find(c => c.id === item.category_id)?.name}</span>
                            {item.station && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400/80">{item.station}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-black text-xs text-amber-400">
                            Rs. {item.base_price.toLocaleString()}
                          </div>
                          {item.variants && item.variants.length > 0 ? (
                            <div className="text-[9px] text-emerald-400 font-semibold">
                              {item.variants.length} portions
                            </div>
                          ) : (
                            <div className="text-[9px] text-slate-500">
                              Single size
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Edit Selected Item Details & Prices & Portions */}
              <div className="w-full md:w-7/12 p-4 sm:p-5 overflow-y-auto flex flex-col justify-between bg-slate-900/80 scrollbar-thin scrollbar-thumb-slate-800">
                {selectedItem ? (
                  <div className="space-y-4">
                    {/* Item Identity Header */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                          Editing Food Item #{selectedItem.id}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-100">
                          {selectedItem.name}
                        </h3>
                      </div>

                      {/* Stock availability toggle */}
                      <button
                        type="button"
                        onClick={() => setEditIsAvailable(!editIsAvailable)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          editIsAvailable
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : 'bg-red-950/80 text-red-300 border-red-700/60'
                        }`}
                      >
                        {editIsAvailable ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-red-400" />}
                        <span>{editIsAvailable ? 'In Stock (Available)' : 'Out of Stock (86)'}</span>
                      </button>
                    </div>

                    {/* Basic Info Fields: Name, Category, Station */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Item Category
                        </label>
                        <select
                          value={editCategoryId}
                          onChange={(e) => setEditCategoryId(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Kitchen Station
                        </label>
                        <select
                          value={editStation}
                          onChange={(e) => setEditStation(e.target.value as MenuItem['station'])}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                        >
                          {STATIONS.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Promotional Badge
                        </label>
                        <select
                          value={editBadge}
                          onChange={(e) => setEditBadge(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                        >
                          {BADGES.map(badge => (
                            <option key={badge} value={badge}>
                              {badge}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Description / Sinhala Notes
                      </label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="e.g. එළවළු රයිස් - Fresh wok-fried vegetables..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Base Price Adjuster */}
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Base Price (LKR)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                            Rs.
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={editBasePrice}
                            onChange={(e) => setEditBasePrice(parseFloat(e.target.value) || 0)}
                            className="w-full pl-12 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono text-base font-black focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* Quick Stepper Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStepPrice(-50)}
                            className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 active:scale-95 transition-all cursor-pointer"
                          >
                            -50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepPrice(50)}
                            className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 active:scale-95 transition-all cursor-pointer"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStepPrice(100)}
                            className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 active:scale-95 transition-all cursor-pointer"
                          >
                            +100
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Portion Sizes / Variants Configuration */}
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">
                              Portion Sizes (Variants)
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              e.g. Half / Full, Regular / Large
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Enable if this item is offered in multiple portion sizes
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditHasVariants(!editHasVariants)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            editHasVariants
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {editHasVariants ? <ToggleRight className="w-4 h-4 text-amber-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                          <span>{editHasVariants ? 'Portions Active' : 'Single Size'}</span>
                        </button>
                      </div>

                      {editHasVariants ? (
                        <div className="space-y-2.5 pt-1">
                          {/* Quick presets */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
                            <button
                              type="button"
                              onClick={() => handleApplyPresetVariants('half_full')}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-300 cursor-pointer"
                            >
                              Half / Full (+Rs. 200)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyPresetVariants('sm_med_lg')}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-300 cursor-pointer"
                            >
                              Small / Regular / Large
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyPresetVariants('single_double')}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-300 cursor-pointer"
                            >
                              Single / Double
                            </button>
                          </div>

                          {/* Variant items table */}
                          <div className="space-y-1.5">
                            {editVariants.map((variant, index) => (
                              <div
                                key={variant.id || index}
                                className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                              >
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={variant.variant_name}
                                    placeholder="Portion name (e.g. Full Portion)"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditVariants(prev => prev.map((v, i) => i === index ? { ...v, variant_name: val } : v));
                                    }}
                                    className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-bold text-slate-200 focus:border-amber-500 focus:outline-none"
                                  />
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-slate-400 font-mono font-bold">+Rs.</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="10"
                                    value={variant.price_adjustment}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setEditVariants(prev => prev.map((v, i) => i === index ? { ...v, price_adjustment: val } : v));
                                    }}
                                    className="w-20 px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-amber-400 font-mono text-xs font-bold text-right focus:border-amber-500 focus:outline-none"
                                  />
                                </div>

                                <div className="text-right min-w-[90px]">
                                  <span className="text-[9px] text-slate-500 block">Total</span>
                                  <span className="text-xs font-mono font-black text-emerald-400">
                                    Rs. {(editBasePrice + variant.price_adjustment).toLocaleString()}
                                  </span>
                                </div>

                                {editVariants.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariantRow(index)}
                                    className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddVariantRow(false)}
                            className="w-full py-1.5 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/50 text-[11px] font-bold text-slate-400 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Another Portion Size</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          This item does not contain portion sizes. It is sold at the fixed Base Price of Rs. {editBasePrice.toLocaleString()}.
                        </p>
                      )}
                    </div>

                    {/* Saved Notice */}
                    {savedNotice && (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{savedNotice}</span>
                      </div>
                    )}

                    {/* Actions: Save & Delete */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSaveItem}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-glow-amber flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save & Apply Changes</span>
                      </button>

                      {deleteConfirm ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDeleteItem}
                            className="px-3 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(false)}
                            className="px-3 py-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(true)}
                          className="px-3 py-3 rounded-2xl bg-slate-950 border border-red-900/60 hover:border-red-700 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Delete this item from inventory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <Package className="w-12 h-12 mb-2 stroke-[1.5] text-slate-600" />
                    <p className="text-sm font-bold text-slate-400">Select an item from the left</p>
                    <p className="text-xs text-slate-500 mt-1">Tap any menu item to update base prices or portion rates</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: ADD NEW ITEM TO INVENTORY */}
          {activeTab === 'add' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-900/70 scrollbar-thin scrollbar-thumb-slate-800">
              <form onSubmit={handleCreateNewItem} className="max-w-3xl mx-auto space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-emerald-950/60 rounded-2xl border border-emerald-800/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-100">
                      Add New Food or Beverage Item
                    </h3>
                    <p className="text-xs text-slate-400">
                      Create a new dish or drink for any menu category with custom base price & portion sizing
                    </p>
                  </div>
                </div>

                {addNotice && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{addNotice}</span>
                  </div>
                )}

                {addError && (
                  <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}

                {/* Primary Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Item Name */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Item Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Seafood Cheese Kottu, Mango Smoothie, Pepper Pork..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-slate-100 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Category Selector (All Categories) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Category <span className="text-amber-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <FolderPlus className="w-3 h-3" />
                        <span>{isAddingCategory ? 'Cancel' : '+ New Category'}</span>
                      </button>
                    </div>

                    {isAddingCategory ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Category name..."
                          value={newCategoryTitle}
                          onChange={(e) => setNewCategoryTitle(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-slate-100 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    ) : null}

                    <select
                      value={newCategoryId}
                      onChange={(e) => handleNewCategoryChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-100 focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Kitchen Station */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Kitchen Station
                    </label>
                    <select
                      value={newStation}
                      onChange={(e) => setNewStation(e.target.value as MenuItem['station'])}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-100 focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      {STATIONS.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Badge */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Promotional Badge
                    </label>
                    <select
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-100 focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      {BADGES.map(badge => (
                        <option key={badge} value={badge}>
                          {badge}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Base Price (LKR) <span className="text-amber-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                          Rs.
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          required
                          value={newBasePrice}
                          onChange={(e) => setNewBasePrice(parseFloat(e.target.value) || 0)}
                          className="w-full pl-12 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-mono text-base font-black focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepNewPrice(50)}
                          className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 active:scale-95 cursor-pointer"
                        >
                          +50
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepNewPrice(100)}
                          className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 active:scale-95 cursor-pointer"
                        >
                          +100
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description / Sinhala text */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Description & Sinhala Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. චීස් කොත්තු - Fresh diced roti tossed with roast chicken, egg and creamy cheddar cheese."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Portion Sizes Config */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          Portion Sizes Configuration
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Optional
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Enable this for items with Half/Full or Size portions (Rice, Kottu, Noodles, etc.)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewHasVariants(!newHasVariants)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newHasVariants
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {newHasVariants ? <ToggleRight className="w-4 h-4 text-amber-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                      <span>{newHasVariants ? 'Has Portions' : 'Single Size (No Portions)'}</span>
                    </button>
                  </div>

                  {newHasVariants ? (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetVariants('half_full', true)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-300 cursor-pointer"
                        >
                          Half / Full (+Rs. 200)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetVariants('sm_med_lg', true)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-300 cursor-pointer"
                        >
                          Small / Regular / Large
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetVariants('single_double', true)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-bold text-slate-300 cursor-pointer"
                        >
                          Single / Double
                        </button>
                      </div>

                      <div className="space-y-2">
                        {newVariants.map((variant, index) => (
                          <div
                            key={variant.id || index}
                            className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div className="flex-1">
                              <label className="text-[9px] text-slate-500 font-bold block mb-1">
                                Portion Name
                              </label>
                              <input
                                type="text"
                                value={variant.variant_name}
                                placeholder="e.g. Half Portion"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewVariants(prev => prev.map((v, i) => i === index ? { ...v, variant_name: val } : v));
                                }}
                                className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-bold text-slate-200 focus:border-amber-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] text-slate-500 font-bold block mb-1">
                                Extra Price (+Rs)
                              </label>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400 font-mono font-bold">+</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={variant.price_adjustment}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setNewVariants(prev => prev.map((v, i) => i === index ? { ...v, price_adjustment: val } : v));
                                  }}
                                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-amber-400 font-mono text-xs font-bold text-right focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="text-right min-w-[100px]">
                              <span className="text-[9px] text-slate-500 block mb-1">Selling Price</span>
                              <span className="text-sm font-mono font-black text-emerald-400">
                                Rs. {(newBasePrice + variant.price_adjustment).toLocaleString()}
                              </span>
                            </div>

                            {newVariants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantRow(index, true)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 cursor-pointer self-end mb-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddVariantRow(true)}
                        className="w-full py-2 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/50 text-xs font-bold text-slate-400 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Another Portion Variant</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      This item will be created as a single-size item sold for Rs. {newBasePrice.toLocaleString()}.
                    </p>
                  )}
                </div>

                {/* Default Kitchen Notes */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Default Kitchen Customization Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra Spicy, Less Oil, Less Gravy, No Onions"
                    value={newDefaultNotes}
                    onChange={(e) => setNewDefaultNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-glow-emerald flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create & Add Item to Inventory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PRICE & INVENTORY AUDIT LOG */}
          {activeTab === 'history' && (
            <div className="p-6 overflow-y-auto flex-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Audit Log History
                </span>
                <span className="text-[11px] text-slate-500">
                  {priceAudits.length} recorded modifications
                </span>
              </div>

              {priceAudits.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  No price or inventory changes recorded yet.
                </div>
              ) : (
                priceAudits.map(audit => (
                  <div 
                    key={audit.id} 
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block text-sm">
                        {audit.item_name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Modified by <span className="text-amber-400 font-medium">{audit.changed_by}</span> • {audit.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      {audit.old_price > 0 && (
                        <span className="line-through text-slate-500 text-xs">
                          Rs. {audit.old_price.toLocaleString()}
                        </span>
                      )}
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-black text-amber-400 text-sm">
                        Rs. {audit.new_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
