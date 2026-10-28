import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { DeliveryPlatform } from '../../types';
import { 
  X, 
  ShoppingBag, 
  Bike, 
  Plus, 
  Clock, 
  Receipt, 
  Check, 
  Trash2, 
  Phone, 
  User, 
  MapPin, 
  Send,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Keyboard,
  CornerDownLeft
} from 'lucide-react';

export const QueueModal: React.FC = () => {
  const { 
    isQueueModalOpen, 
    closeQueueModal, 
    queueModalType, 
    openQueueModal,
    takeawayQueues,
    deliveryQueues,
    selectedTakeawayQueue,
    selectedDeliveryQueue,
    selectTakeawayQueue,
    selectDeliveryQueue,
    addTakeawayQueue,
    addDeliveryQueue,
    clearQueueSession,
    tableSessions,
    orderType,
  } = usePosStore();

  const [activeTab, setActiveTab] = useState<'takeaway' | 'delivery'>(queueModalType || 'takeaway');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');
  const [focusedQueueIndex, setFocusedQueueIndex] = useState<number>(0);
  
  // New Takeaway Queue form state
  const [showAddTakeaway, setShowAddTakeaway] = useState(false);
  const [newTakeawayLabel, setNewTakeawayLabel] = useState('');

  // New Delivery Queue form state
  const [showAddDelivery, setShowAddDelivery] = useState(false);
  const [deliveryPlatform, setDeliveryPlatform] = useState<DeliveryPlatform>('uber_eats');
  const [deliveryLabel, setDeliveryLabel] = useState('');
  const [deliveryCustomer, setDeliveryCustomer] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryRider, setDeliveryRider] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Sync tab with modal type when modal opens
  React.useEffect(() => {
    if (queueModalType) {
      setActiveTab(queueModalType);
      setFocusedQueueIndex(0);
    }
  }, [queueModalType]);

  if (!isQueueModalOpen) return null;

  // Platform badges styling helper
  const getPlatformBadge = (platform?: DeliveryPlatform) => {
    switch (platform) {
      case 'uber_eats':
        return {
          label: 'Uber Eats',
          bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
          dot: 'bg-emerald-400',
        };
      case 'pickme':
        return {
          label: 'PickMe Food',
          bg: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
          dot: 'bg-amber-400',
        };
      case 'direct':
        return {
          label: 'Direct Phone',
          bg: 'bg-blue-950/80 text-blue-400 border-blue-500/40',
          dot: 'bg-blue-400',
        };
      case 'in_house':
        return {
          label: 'In-House Rider',
          bg: 'bg-purple-950/80 text-purple-400 border-purple-500/40',
          dot: 'bg-purple-400',
        };
      default:
        return {
          label: 'Delivery',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  // Active stats
  const activeTakeawayCount = Object.keys(tableSessions).filter(
    k => k.startsWith('takeaway-') && (tableSessions[k].cart?.length || 0) > 0
  ).length;

  const activeDeliveryCount = Object.keys(tableSessions).filter(
    k => k.startsWith('delivery-') && (tableSessions[k].cart?.length || 0) > 0
  ).length;

  const currentTabActiveCount = activeTab === 'takeaway' ? activeTakeawayCount : activeDeliveryCount;

  // Filter delivery queues
  const filteredDeliveryQueues = deliveryQueues.filter(q => {
    if (selectedPlatformFilter === 'all') return true;
    return q.platform === selectedPlatformFilter;
  });

  // Keyboard navigation for QueueModal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        setActiveTab(prev => (prev === 'takeaway' ? 'delivery' : 'takeaway'));
        setFocusedQueueIndex(0);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeQueueModal();
        return;
      }

      const currentList = activeTab === 'takeaway' ? takeawayQueues : filteredDeliveryQueues;
      if (currentList.length === 0) return;

      const cols = activeTab === 'takeaway' ? 4 : 3;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedQueueIndex(prev => (prev < currentList.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedQueueIndex(prev => (prev > 0 ? prev - 1 : currentList.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedQueueIndex(prev => {
          const next = prev + cols;
          return next < currentList.length ? next : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedQueueIndex(prev => {
          const next = prev - cols;
          return next >= 0 ? next : prev;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeQueue = currentList[focusedQueueIndex];
        if (activeQueue) {
          if (activeTab === 'takeaway') {
            selectTakeawayQueue(activeQueue.id);
          } else {
            selectDeliveryQueue(activeQueue.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, takeawayQueues, filteredDeliveryQueues, focusedQueueIndex, selectTakeawayQueue, selectDeliveryQueue, closeQueueModal]);

  const handleCreateTakeawayQueue = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = addTakeawayQueue(newTakeawayLabel.trim() || undefined);
    setNewTakeawayLabel('');
    setShowAddTakeaway(false);
    selectTakeawayQueue(newId);
  };

  const handleCreateDeliveryQueue = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = addDeliveryQueue(
      deliveryPlatform,
      deliveryLabel.trim() || undefined,
      deliveryCustomer.trim() || undefined,
      deliveryPhone.trim() || undefined,
      deliveryRider.trim() || undefined,
      deliveryAddress.trim() || undefined
    );
    setDeliveryLabel('');
    setDeliveryCustomer('');
    setDeliveryPhone('');
    setDeliveryRider('');
    setDeliveryAddress('');
    setShowAddDelivery(false);
    selectDeliveryQueue(newId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border transition-colors ${
              activeTab === 'takeaway'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {activeTab === 'takeaway' ? (
                <ShoppingBag className="w-5 h-5" />
              ) : (
                <Bike className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Order Queues & Dispatch</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  {currentTabActiveCount} Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Independent billing per queue • Switch between orders just like dining tables
              </p>
            </div>
          </div>

          <button
            onClick={closeQueueModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector & Stats Ribbon */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Main Queue Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('takeaway')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'takeaway'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway Queues</span>
              {activeTakeawayCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'takeaway' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {activeTakeawayCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'delivery'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery Queues</span>
              {activeDeliveryCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'delivery' ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {activeDeliveryCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Action Button */}
          {activeTab === 'takeaway' ? (
            <button
              onClick={() => setShowAddTakeaway(!showAddTakeaway)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Takeaway Queue</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddDelivery(!showAddDelivery)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Delivery Ticket</span>
            </button>
          )}
        </div>

        {/* Optional Add Takeaway Queue Form */}
        {showAddTakeaway && activeTab === 'takeaway' && (
          <form 
            onSubmit={handleCreateTakeawayQueue}
            className="p-4 bg-slate-950/90 border-b border-amber-500/30 flex items-center gap-3 animate-fadeIn"
          >
            <div className="flex-1">
              <input
                type="text"
                value={newTakeawayLabel}
                onChange={(e) => setNewTakeawayLabel(e.target.value)}
                placeholder="Queue identifier or Token (e.g. TK-09, Token #42, Guest Kasun)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              Create & Open
            </button>
            <button
              type="button"
              onClick={() => setShowAddTakeaway(false)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Optional Add Delivery Queue Form */}
        {showAddDelivery && activeTab === 'delivery' && (
          <form 
            onSubmit={handleCreateDeliveryQueue}
            className="p-4 bg-slate-950/95 border-b border-emerald-500/30 space-y-3 animate-fadeIn"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Platform Channel</label>
                <select
                  value={deliveryPlatform}
                  onChange={(e) => setDeliveryPlatform(e.target.value as DeliveryPlatform)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="uber_eats">Uber Eats</option>
                  <option value="pickme">PickMe Food</option>
                  <option value="direct">Direct Phone</option>
                  <option value="in_house">In-House Rider</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Queue ID / Tag</label>
                <input
                  type="text"
                  value={deliveryLabel}
                  onChange={(e) => setDeliveryLabel(e.target.value)}
                  placeholder="Auto (e.g. DL-09)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Customer / Guest</label>
                <input
                  type="text"
                  value={deliveryCustomer}
                  onChange={(e) => setDeliveryCustomer(e.target.value)}
                  placeholder="Name"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="077..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  value={deliveryRider}
                  onChange={(e) => setDeliveryRider(e.target.value)}
                  placeholder="Rider / Driver Name (e.g. Kamal - Bike 6789)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Delivery Address / Landmark (e.g. Lighthouse Street, Fort)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddDelivery(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
              >
                Create Delivery Ticket
              </button>
            </div>
          </form>
        )}

        {/* Legend & Channel Filter (for Delivery) */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Status Indicators */}
          <div className="flex items-center gap-4 font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Available (Ready)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Active Order (In Prep)</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Billed / Ready for Pickup</span>
            </div>
          </div>

          {/* Delivery Channel Filters */}
          {activeTab === 'delivery' && (
            <div className="flex items-center gap-1">
              {['all', 'uber_eats', 'pickme', 'direct', 'in_house'].map((chan) => (
                <button
                  key={chan}
                  onClick={() => setSelectedPlatformFilter(chan)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all border ${
                    selectedPlatformFilter === chan
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'text-slate-400 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  {chan === 'all' ? 'All Channels' : chan === 'uber_eats' ? 'Uber Eats' : chan === 'pickme' ? 'PickMe' : chan === 'direct' ? 'Direct' : 'In-House'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Grid View */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {activeTab === 'takeaway' ? (
            /* --- TAKEAWAY QUEUES GRID --- */
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Takeaway Customer Order Queues
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {takeawayQueues.length} slots configured
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {takeawayQueues.map((queue, idx) => {
                  const sessionKey = `takeaway-${queue.id}`;
                  const session = tableSessions[sessionKey];
                  const sessionItemCount = session?.cart ? session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
                  const isCurrentSelected = orderType === 'takeaway' && selectedTakeawayQueue === queue.id;
                  const isKeyboardFocused = activeTab === 'takeaway' && focusedQueueIndex === idx;
                  const isOccupied = sessionItemCount > 0 || queue.status === 'occupied';

                  // Calculate subtotal for session if any
                  const totalAmount = session?.cart ? session.cart.reduce((sum, i) => sum + i.total_price, 0) : queue.current_amount || 0;

                  let statusBorder = 'border-slate-800 hover:border-emerald-500/50';
                  let statusBg = 'bg-slate-950/60';
                  let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                  if (isOccupied) {
                    statusBorder = 'border-amber-500/50 hover:border-amber-400';
                    statusBg = 'bg-amber-950/20';
                    statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  }

                  if (isKeyboardFocused) {
                    statusBorder = 'border-amber-400 ring-2 ring-amber-400 shadow-glow-amber';
                    statusBg = 'bg-amber-950/30';
                  } else if (isCurrentSelected) {
                    statusBorder = 'border-emerald-400 ring-2 ring-emerald-400 shadow-glow-emerald';
                  }

                  return (
                    <div
                      key={queue.id}
                      onClick={() => selectTakeawayQueue(queue.id)}
                      className={`p-3.5 rounded-2xl border ${statusBorder} ${statusBg} cursor-pointer transition-all duration-200 flex flex-col justify-between select-none hover:scale-[1.02] active:scale-95 group relative ${
                        isKeyboardFocused ? 'scale-[1.02]' : ''
                      }`}
                    >
                      <div>
                        {/* Queue Header Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-mono font-black text-base text-slate-100">
                              {queue.queue_number}
                            </span>
                            {isKeyboardFocused && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                <CornerDownLeft className="w-2.5 h-2.5" />
                                <span>Enter</span>
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${statusBadge}`}>
                            {isOccupied ? 'In Order' : 'Available'}
                          </span>
                        </div>

                        {/* Customer Info (if available) */}
                        <div className="space-y-1 my-1.5 min-h-[38px]">
                          {(session?.customerName || queue.customer_name) ? (
                            <div className="flex items-center gap-1 text-slate-200 text-xs font-semibold truncate">
                              <User className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{session?.customerName || queue.customer_name}</span>
                              {(session?.customerPhone || queue.customer_phone) && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ({session?.customerPhone || queue.customer_phone})
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">
                              {isOccupied ? 'Guest Takeaway' : 'Walk-in / Ready'}
                            </p>
                          )}

                          {sessionItemCount > 0 ? (
                            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                              <Receipt className="w-3 h-3 text-amber-400" />
                              <span>{sessionItemCount} {sessionItemCount === 1 ? 'item' : 'items'} in order</span>
                            </div>
                          ) : queue.occupied_at ? (
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>Since {queue.occupied_at}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Bottom Price & Select Indicator */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {totalAmount > 0 ? (
                          <span className="font-mono text-xs font-bold text-amber-400">
                            Rs. {totalAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            Available
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          {isOccupied && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Clear and release Takeaway Queue ${queue.queue_number}?`)) {
                                  clearQueueSession('takeaway', queue.id);
                                }
                              }}
                              title="Clear / release queue"
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}

                          {isCurrentSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* --- DELIVERY QUEUES GRID --- */
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Delivery Dispatch & Rider Queues
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {filteredDeliveryQueues.length} delivery slots
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDeliveryQueues.map((queue, idx) => {
                  const sessionKey = `delivery-${queue.id}`;
                  const session = tableSessions[sessionKey];
                  const sessionItemCount = session?.cart ? session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
                  const isCurrentSelected = orderType === 'delivery' && selectedDeliveryQueue === queue.id;
                  const isKeyboardFocused = activeTab === 'delivery' && focusedQueueIndex === idx;
                  const isOccupied = sessionItemCount > 0 || queue.status === 'occupied';

                  const platformInfo = getPlatformBadge(queue.platform);
                  const totalAmount = session?.cart ? session.cart.reduce((sum, i) => sum + i.total_price, 0) : queue.current_amount || 0;

                  let statusBorder = 'border-slate-800 hover:border-emerald-500/50';
                  let statusBg = 'bg-slate-950/60';

                  if (isOccupied) {
                    statusBorder = 'border-emerald-500/60 hover:border-emerald-400';
                    statusBg = 'bg-emerald-950/20';
                  }

                  if (isKeyboardFocused) {
                    statusBorder = 'border-amber-400 ring-2 ring-amber-400 shadow-glow-amber';
                    statusBg = 'bg-amber-950/30';
                  } else if (isCurrentSelected) {
                    statusBorder = 'border-emerald-400 ring-2 ring-emerald-400 shadow-glow-emerald';
                  }

                  return (
                    <div
                      key={queue.id}
                      onClick={() => selectDeliveryQueue(queue.id)}
                      className={`p-3.5 rounded-2xl border ${statusBorder} ${statusBg} cursor-pointer transition-all duration-200 flex flex-col justify-between select-none hover:scale-[1.01] active:scale-95 group relative ${
                        isKeyboardFocused ? 'scale-[1.02]' : ''
                      }`}
                    >
                      <div>
                        {/* Header: Platform & Queue Code */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-base text-slate-100">
                              {queue.queue_number}
                            </span>
                            {isKeyboardFocused && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                <CornerDownLeft className="w-2.5 h-2.5" />
                                <span>Enter</span>
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${platformInfo.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${platformInfo.dot}`}></span>
                              <span>{queue.platform_label || platformInfo.label}</span>
                            </span>
                          </div>

                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${
                            isOccupied
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {isOccupied ? 'Dispatch Active' : 'Slot Available'}
                          </span>
                        </div>

                        {/* Customer & Delivery Specifics */}
                        <div className="space-y-1.5 my-2">
                          {(session?.customerName || queue.customer_name) ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                              <User className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{session?.customerName || queue.customer_name}</span>
                              {(session?.customerPhone || queue.customer_phone) && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({session?.customerPhone || queue.customer_phone})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic">
                              {isOccupied ? 'Customer Unspecified' : 'Ready for Order'}
                            </div>
                          )}

                          {/* Rider Info if available */}
                          {(queue.rider_name) && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                              <Bike className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">Rider: {queue.rider_name}</span>
                            </div>
                          )}

                          {/* Delivery Address if available */}
                          {(queue.delivery_address) && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{queue.delivery_address}</span>
                            </div>
                          )}

                          {/* Items / Running summary */}
                          {sessionItemCount > 0 && (
                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold pt-0.5">
                              <Receipt className="w-3 h-3 text-emerald-400" />
                              <span>{sessionItemCount} {sessionItemCount === 1 ? 'item' : 'items'} in order</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Row */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {totalAmount > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Total</span>
                            <span className="font-mono text-xs font-black text-emerald-400">
                              Rs. {totalAmount.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            Slot Ready
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          {isOccupied && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Clear and release Delivery Queue ${queue.queue_number}?`)) {
                                  clearQueueSession('delivery', queue.id);
                                }
                              }}
                              title="Clear / release queue"
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}

                          {isCurrentSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono font-semibold">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>[↑ ↓ ← → Navigate • Enter ↵ Select • Tab Switch Mode • Esc Close]</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Click any queue card or press Enter to switch immediately</span>
            </div>
          </div>

          <button
            onClick={closeQueueModal}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Close (Esc)
          </button>
        </div>

      </div>
    </div>
  );
};
