import React, { useState, useEffect } from 'react';
import { usePosStore } from '../../store/posStore';
import { posDatabase } from '../../db/sqlite';
import { buildDailyReportEscPos } from '../../utils/escpos';
import { 
  generateDailyReportAuditText, 
  generateMonthlyReportAuditText, 
  saveReportToComputer 
} from '../../utils/reportExporter';
import { cloudSyncService, CloudSyncStatus } from '../../services/cloudSync';
import { 
  X, 
  Calendar, 
  BarChart3, 
  Cloud, 
  Download, 
  Printer, 
  FolderOpen, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Award
} from 'lucide-react';

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesReportModal: React.FC<SalesReportModalProps> = ({ isOpen, onClose }) => {
  const { restaurant, setPrintPreview } = usePosStore();
  
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'cloud'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Cloud Sync State
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(cloudSyncService.getStatus());
  const [syncing, setSyncing] = useState(false);
  const [cloudEndpoint, setCloudEndpoint] = useState(cloudSyncService.getCloudEndpoint());
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const unsub = cloudSyncService.subscribe((status) => {
      setSyncStatus(status);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const dailyReport = posDatabase.getDailySalesReport(selectedDate);
  const monthlyReport = posDatabase.getMonthlySalesReport(selectedYear, selectedMonth);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackNotice({ type, message });
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 4500);
  };

  const handleSaveDailyAudit = async () => {
    try {
      const { text, filename } = await generateDailyReportAuditText(dailyReport, restaurant);
      const res = await saveReportToComputer(text, filename, 'Daily');
      if (res.success) {
        showToast(res.message || `Saved official daily audit: ${filename}`);
      } else {
        showToast(res.message || 'Failed to save audit file', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error saving file', 'error');
    }
  };

  const handleSaveMonthlyAudit = async () => {
    try {
      const { text, filename } = await generateMonthlyReportAuditText(monthlyReport, restaurant);
      const res = await saveReportToComputer(text, filename, 'Monthly');
      if (res.success) {
        showToast(res.message || `Saved official monthly audit: ${filename}`);
      } else {
        showToast(res.message || 'Failed to save audit file', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Error saving file', 'error');
    }
  };

  const handlePrintDailySlip = () => {
    const builder = buildDailyReportEscPos(dailyReport, restaurant);
    setPrintPreview({
      title: `Daily Sales Audit Slip - ${dailyReport.date}`,
      type: 'X_REPORT',
      plainText: `Daily Sales Report for ${dailyReport.date}`,
      hexDump: builder.getHexDump(),
      width: 80,
    });
  };

  const handleOpenFolder = async (subfolder: 'Daily' | 'Monthly') => {
    if ((window as any).electronAPI?.openReportsFolder) {
      await (window as any).electronAPI.openReportsFolder(subfolder);
    } else {
      showToast("Available in Desktop Electron mode: Reports are stored in Documents/SouthernSpoon_Reports");
    }
  };

  const handleTriggerCloudSync = async () => {
    setSyncing(true);
    try {
      const res = await cloudSyncService.triggerSync('manual_user_click');
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveEndpoint = () => {
    cloudSyncService.setCloudEndpoint(cloudEndpoint.trim());
    showToast("Cloud monitoring endpoint updated successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-100 tracking-wide">
                  Financial Sales Reports & Audits
                </h2>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                  syncStatus.isOnline 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${syncStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{syncStatus.isOnline ? 'Cloud Online' : 'Local Offline Safe'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Official Revenue & Accounting Verification • Southern Spoon Galle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Sales Report</span>
            </button>

            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Monthly Sales Report</span>
            </button>

            <button
              onClick={() => setActiveTab('cloud')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cloud'
                  ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Remote Cloud Sync</span>
            </button>
          </div>

          {/* Quick Date Selectors based on tab */}
          {activeTab === 'daily' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Today
              </button>
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl font-bold focus:outline-none focus:border-amber-500"
              >
                {[
                  { m: 1, name: "January" },
                  { m: 2, name: "February" },
                  { m: 3, name: "March" },
                  { m: 4, name: "April" },
                  { m: 5, name: "May" },
                  { m: 6, name: "June" },
                  { m: 7, name: "July" },
                  { m: 8, name: "August" },
                  { m: 9, name: "September" },
                  { m: 10, name: "October" },
                  { m: 11, name: "November" },
                  { m: 12, name: "December" },
                ].map(item => (
                  <option key={item.m} value={item.m}>{item.name}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl font-mono font-bold focus:outline-none focus:border-amber-500"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Feedback Alert Banner */}
        {feedbackNotice && (
          <div className={`mx-5 mt-3 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn border ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="flex-1">{feedbackNotice.message}</span>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* ======================================================== */}
          {/* TAB 1: DAILY SALES REPORT                                */}
          {/* ======================================================== */}
          {activeTab === 'daily' && (
            <div className="space-y-5">
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Net Settled Revenue
                  </span>
                  <div className="mt-2">
                    <span className="text-xl font-black text-amber-400">
                      Rs. {dailyReport.total_net_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Gross: Rs. {dailyReport.total_gross_sales.toLocaleString('en-LK')}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Orders Settled
                  </span>
                  <div className="mt-2">
                    <span className="text-xl font-black text-slate-100">
                      {dailyReport.order_count}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Avg Check: Rs. {Math.round(dailyReport.average_order_value).toLocaleString('en-LK')}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Food Items Sold
                  </span>
                  <div className="mt-2">
                    <span className="text-xl font-black text-emerald-400">
                      {dailyReport.total_items_sold}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Total portions prepared
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Deductions & Taxes
                  </span>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-slate-300">
                      Rs. {(dailyReport.total_tax + dailyReport.total_service_charge).toLocaleString('en-LK')}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Discounts: -Rs. {dailyReport.total_discount.toLocaleString('en-LK')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Payments & Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Payment Methods */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>Payment Channels</span>
                  </h3>
                  
                  <div className="space-y-2">
                    {dailyReport.sales_by_payment.map((p, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                            {p.method.includes('CASH') ? <Banknote className="w-4 h-4 text-emerald-400" /> :
                             p.method.includes('CARD') ? <CreditCard className="w-4 h-4 text-sky-400" /> :
                             <QrCode className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-200">{p.method}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5">({p.count} bills)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-100">
                            Rs. {p.total.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 ml-2">
                            {p.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {dailyReport.sales_by_payment.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-2 text-center">No transactions recorded for this day</p>
                    )}
                  </div>
                </div>

                {/* Category Sales Breakdown */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                    <span>Category Sales Breakdown</span>
                  </h3>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {dailyReport.sales_by_category.map((cat, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-200">{cat.category_name}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">({cat.item_count} sold)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-100">
                            Rs. {cat.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-bold text-orange-400 ml-2">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {dailyReport.sales_by_category.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-2 text-center">No category sales recorded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Selling Dishes */}
              {dailyReport.top_selling_items.length > 0 && (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Top-Selling Menu Items</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {dailyReport.top_selling_items.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/70 flex justify-between items-center text-xs">
                        <div className="font-semibold text-slate-300 truncate pr-2">
                          <span className="font-mono text-amber-400 mr-1.5">#{idx + 1}</span>
                          {item.item_name}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="font-bold text-slate-100">{item.quantity}x</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">Rs. {item.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Cryptographic Audit Available
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Saves with SHA-256 seal & read-only lock to prevent editing
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenFolder('Daily')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open Reports Folder</span>
                  </button>

                  <button
                    onClick={handlePrintDailySlip}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print 80mm Slip</span>
                  </button>

                  <button
                    onClick={handleSaveDailyAudit}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-glow-amber transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save to Computer (Audit Archive)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MONTHLY SALES REPORT                              */}
          {/* ======================================================== */}
          {activeTab === 'monthly' && (
            <div className="space-y-5">
              {/* Monthly KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Month Revenue
                  </span>
                  <div className="mt-2">
                    <span className="text-xl font-black text-amber-400">
                      Rs. {monthlyReport.total_net_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Period: {monthlyReport.month_name} {monthlyReport.year}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="mt-2">
                    <span className="text-xl font-black text-slate-100">
                      {monthlyReport.total_orders}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Active Days: {monthlyReport.total_days_active} days
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Daily Average
                  </span>
                  <div className="mt-2">
                    <span className="text-xl font-black text-emerald-400">
                      Rs. {Math.round(monthlyReport.average_daily_sales).toLocaleString('en-LK')}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Average revenue per trading day
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Food Portions Sold
                  </span>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-slate-300">
                      {monthlyReport.total_items_sold}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Total items across all categories
                    </p>
                  </div>
                </div>
              </div>

              {/* Day-by-day Trading Table */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Daily Trading Breakdown ({monthlyReport.month_name} {monthlyReport.year})</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {monthlyReport.daily_breakdown.filter(d => d.order_count > 0).length} trading days recorded
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Orders</th>
                        <th className="py-2 px-3">Cash (LKR)</th>
                        <th className="py-2 px-3">Card (LKR)</th>
                        <th className="py-2 px-3">LankaQR (LKR)</th>
                        <th className="py-2 px-3 text-right">Total Net (LKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {monthlyReport.daily_breakdown.map((d, idx) => {
                        const hasSales = d.order_count > 0 || d.total_sales > 0;
                        return (
                          <tr 
                            key={idx} 
                            className={`hover:bg-slate-800/40 transition-colors ${hasSales ? 'text-slate-200 font-semibold' : 'text-slate-600'}`}
                          >
                            <td className="py-2 px-3">{d.date}</td>
                            <td className="py-2 px-3">{d.order_count}</td>
                            <td className="py-2 px-3">Rs. {d.cash_total.toLocaleString('en-LK')}</td>
                            <td className="py-2 px-3">Rs. {d.card_total.toLocaleString('en-LK')}</td>
                            <td className="py-2 px-3">Rs. {d.qr_total.toLocaleString('en-LK')}</td>
                            <td className="py-2 px-3 text-right font-black text-amber-400">
                              Rs. {d.total_sales.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Monthly Tamper-Proof Audit Archive
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Locked text ledger saved directly into computer folder
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenFolder('Monthly')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open Monthly Folder</span>
                  </button>

                  <button
                    onClick={handleSaveMonthlyAudit}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-glow-amber transition-all cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save to Computer (Audit Archive)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: REMOTE CLOUD MONITORING & SYNC                    */}
          {/* ======================================================== */}
          {activeTab === 'cloud' && (
            <div className="space-y-5">
              <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      syncStatus.isOnline 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        Remote Sales Monitoring Engine
                      </h3>
                      <p className="text-xs text-slate-400">
                        Access live sales figures remotely when the cashier PC connects to internet
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTriggerCloudSync}
                    disabled={syncing || !syncStatus.isOnline}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      syncStatus.isOnline 
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-emerald active:scale-95' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Syncing...' : 'Sync Cloud Now'}</span>
                  </button>
                </div>

                {/* Status metrics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">NETWORK STATUS</span>
                    <span className={`font-bold mt-1 block ${syncStatus.isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {syncStatus.isOnline ? '🟢 Connected (Online)' : '🟡 Offline (Zero Downtime)'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">LAST CLOUD SYNC</span>
                    <span className="font-bold text-slate-200 mt-1 block">
                      {syncStatus.lastSyncTime || 'Pending connection'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">TERMINAL REGISTRATION</span>
                    <span className="font-bold text-amber-400 mt-1 block">
                      REG-01 • Labuduwa
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    Auto-sync runs automatically in the background every 5 minutes whenever internet connection is active, ensuring you can monitor daily figures from your laptop or phone.
                  </span>
                </div>
              </div>

              {/* Remote Webhook / Cloud API Config */}
              <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Cloud Endpoint / Webhook URL (Optional)
                </h4>
                <p className="text-xs text-slate-400">
                  Enter your Supabase, Firebase, Google Sheets Webhook, or Cloud API URL to receive live JSON sales payloads automatically whenever orders are settled.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={cloudEndpoint}
                    onChange={(e) => setCloudEndpoint(e.target.value)}
                    placeholder="https://your-cloud-api-or-webhook.com/sync"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSaveEndpoint}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Save Endpoint
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
