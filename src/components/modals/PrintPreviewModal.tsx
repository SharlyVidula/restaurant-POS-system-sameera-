import React, { useState, useMemo } from 'react';
import { usePosStore } from '../../store/posStore';
import { 
  X, 
  Printer, 
  Binary, 
  FileText, 
  Copy, 
  Check, 
  Receipt,
  Send,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { buildCustomerReceiptEscPos, buildKotEscPos, buildBillEscPos } from '../../utils/escpos';
import thermalLogo from '../../assets/thermal_logo.png';

export const PrintPreviewModal: React.FC = () => {
  const { printPreview, closePrintPreview, restaurant } = usePosStore();
  const [activeTab, setActiveTab] = useState<'visual' | 'hexdump'>('visual');
  const [copied, setCopied] = useState(false);
  const [paperWidth, setPaperWidth] = useState<80 | 58>(printPreview?.width || 80);
  const [currentSlipType, setCurrentSlipType] = useState<'RECEIPT' | 'KOT' | 'BILL' | 'X_REPORT' | 'Z_REPORT' | 'PAYOUT_VOUCHER'>(
    printPreview?.type || 'RECEIPT'
  );
  const [printSuccessNotice, setPrintSuccessNotice] = useState(false);

  if (!printPreview) return null;

  const order = printPreview.order;
  const kotData = printPreview.kotData;
  const xReportData = printPreview.xReportData;
  const zReportData = printPreview.zReportData;
  const payoutData = printPreview.payoutData;

  // Dynamically calculate ESC/POS Hex Dump based on selected slip type and paper width
  const currentHexDump = useMemo(() => {
    if (order) {
      if (currentSlipType === 'RECEIPT') {
        return buildCustomerReceiptEscPos(order, restaurant, paperWidth).getHexDump();
      } else if (currentSlipType === 'KOT') {
        return buildKotEscPos(
          order.order_number,
          order.order_type,
          order.table_number,
          order.items,
          order.cashier_name,
          paperWidth
        ).getHexDump();
      } else if (currentSlipType === 'BILL') {
        return buildBillEscPos(order, restaurant, paperWidth).getHexDump();
      }
    } else if (kotData && currentSlipType === 'KOT') {
      return buildKotEscPos(
        kotData.orderNumber,
        kotData.orderType,
        kotData.tableNumber,
        kotData.items,
        kotData.cashierName,
        paperWidth
      ).getHexDump();
    }
    return printPreview.hexDump;
  }, [order, kotData, currentSlipType, restaurant, paperWidth, printPreview.hexDump]);

  const copyHex = () => {
    navigator.clipboard.writeText(currentHexDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = async () => {
    setPrintSuccessNotice(true);
    let printedViaEscpos = false;

    // 1. Commercial POS direct ESC/POS hardware print (sends raw 1-bit thermal raster bytes directly to printer)
    if (typeof (window as any).electronAPI?.printReceipt === 'function' && currentHexDump) {
      try {
        const res = await (window as any).electronAPI.printReceipt(currentHexDump);
        if (res && res.success) {
          printedViaEscpos = true;
        }
      } catch (err) {
        console.warn('Hardware ESC/POS direct dispatch error, falling back:', err);
      }
    }

    // 2. Direct silent kiosk HTML print fallback (if direct ESC/POS hardware is not available)
    if (!printedViaEscpos) {
      if (typeof (window as any).electronAPI?.silentPrint === 'function') {
        (window as any).electronAPI.silentPrint();
      } else {
        window.print();
      }
    }

    setTimeout(() => setPrintSuccessNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>
                  {order 
                    ? currentSlipType === 'RECEIPT' 
                      ? `Receipt - #${order.order_number}`
                      : currentSlipType === 'KOT'
                      ? `Kitchen Ticket - #${order.order_number}`
                      : `Guest Check - #${order.order_number}`
                    : kotData
                    ? `Kitchen Ticket - #${kotData.orderNumber}`
                    : printPreview.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ESC/POS 200 DPI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Thermal Printer Emulator ({paperWidth}mm Roll)
              </p>
            </div>
          </div>

          <button
            onClick={closePrintPreview}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Slip Type Selector (Allows printing Receipt, KOT, or Bill for ANY order) */}
        {order && (
          <div className="px-4 py-2 bg-slate-950/95 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Slip:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCurrentSlipType('RECEIPT')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentSlipType === 'RECEIPT'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Customer Receipt</span>
              </button>

              <button
                onClick={() => setCurrentSlipType('KOT')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentSlipType === 'KOT'
                    ? 'bg-orange-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kitchen Ticket (KOT)</span>
              </button>

              <button
                onClick={() => setCurrentSlipType('BILL')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentSlipType === 'BILL'
                    ? 'bg-blue-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Guest Bill</span>
              </button>
            </div>
          </div>
        )}

        {/* View Switcher Tabs & Width controls */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'visual'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Thermal Paper Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('hexdump')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'hexdump'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>ESC/POS Hex Dump</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setPaperWidth(80)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-all ${
                paperWidth === 80 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              80mm
            </button>
            <button
              onClick={() => setPaperWidth(58)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-all ${
                paperWidth === 58 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              58mm
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40 flex justify-center items-start scrollbar-thin scrollbar-thumb-slate-800">
          {activeTab === 'visual' ? (
            /* Realistic Thermal Paper Roll */
            <div
              id="thermal-printable-slip"
              style={{ width: paperWidth === 80 ? '380px' : '290px' }}
              className="bg-[#fcfaf2] text-[#111] p-6 shadow-receipt rounded-sm font-mono text-[11px] leading-relaxed relative select-text border border-amber-900/10 h-auto min-h-fit self-start"
            >
              {/* Paper Jagged Top Tear Effect */}
              <div className="tear-effect absolute top-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_4px,#fcfaf2_4px)] bg-[length:12px_12px] -mt-1 pointer-events-none" />

              {/* SLIP CONTENT RENDERING */}
              {currentSlipType === 'RECEIPT' && order ? (
                /* --- DYNAMIC CUSTOMER RECEIPT --- */
                <div>
                  <div className="text-center space-y-0.5 pb-2 flex flex-col items-center">
                    <div className="mb-2 flex justify-center">
                      <img 
                        src={thermalLogo} 
                        alt={restaurant.name} 
                        className="w-28 h-28 object-contain mx-auto"
                      />
                    </div>
                    <div className="font-extrabold text-sm tracking-wider uppercase">
                      {restaurant.name}
                    </div>
                    {restaurant.branch && 
                     restaurant.branch.toLowerCase().trim() !== restaurant.address.toLowerCase().trim() && 
                     !restaurant.address.toLowerCase().includes(restaurant.branch.toLowerCase().trim()) && (
                      <div className="font-bold text-xs">{restaurant.branch}</div>
                    )}
                    <div className="text-[10px] text-gray-700">{restaurant.address}</div>
                    <div className="text-[10px] text-gray-700">{restaurant.city}</div>
                    <div className="text-[10px] text-gray-700">Hotline: {restaurant.hotline}</div>
                    <div className="text-[10px] font-semibold">{restaurant.tax_number}</div>
                    <div className="border-b-2 border-dashed border-gray-900 my-2 w-full" />
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span>Order: #{order.order_number}</span>
                      <span>Type: {order.order_type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date: {order.created_at}</span>
                      <span>{order.table_number ? `Table: ${order.table_number}` : 'Takeaway'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cashier: {order.cashier_name}</span>
                      <span className="font-bold text-emerald-800 uppercase">Paid: {order.payment_method?.toUpperCase()}</span>
                    </div>
                    {order.customer_name && (
                      <div className="text-[9px] text-gray-700">
                        Customer: {order.customer_name} {order.customer_phone ? `(${order.customer_phone})` : ''}
                      </div>
                    )}
                    <div className="border-b border-dashed border-gray-800 my-1.5" />
                  </div>

                  {/* Real Order Items */}
                  <div className="py-2 text-[10px] leading-snug space-y-1.5">
                    <div className="flex justify-between font-extrabold border-b border-gray-400 pb-1">
                      <span>DESCRIPTION</span>
                      <span>AMOUNT</span>
                    </div>

                    {order.items.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between font-semibold">
                          <span>
                            {item.quantity}x {item.item_name}
                            {item.variant_name && ` (${item.variant_name})`}
                          </span>
                          <span>Rs. {item.total_price.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {item.notes && (
                          <div className="text-[9px] text-gray-600 pl-2 italic">
                            * {item.notes}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="border-b-2 border-dashed border-gray-900 my-2" />

                    <div className="flex justify-between font-bold">
                      <span>SUBTOTAL:</span>
                      <span>Rs. {order.subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-800">
                        <span>Discount ({order.discount_percentage || 0}%):</span>
                        <span>- Rs. {order.discount_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {order.service_charge > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge (10%):</span>
                        <span>Rs. {order.service_charge.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {order.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <span>VAT (8%):</span>
                        <span>Rs. {order.tax_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="border-b border-gray-900 my-1" />
                    
                    <div className="flex justify-between font-black text-xs">
                      <span>TOTAL NET:</span>
                      <span>Rs. {order.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Payment specifics */}
                    {order.payment_method === 'cash' && order.cash_tendered !== undefined && (
                      <>
                        <div className="flex justify-between pt-1">
                          <span>CASH TENDERED:</span>
                          <span>Rs. {order.cash_tendered.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>CHANGE RETURNED:</span>
                          <span>Rs. {(order.change_returned || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}

                    {order.payment_method === 'card' && order.card_reference && (
                      <div className="flex justify-between text-[9px] pt-1">
                        <span>Card Approval Ref:</span>
                        <span>{order.card_reference}</span>
                      </div>
                    )}

                    {order.payment_method === 'qr' && order.qr_reference && (
                      <div className="flex justify-between text-[9px] pt-1">
                        <span>LankaQR Txn Ref:</span>
                        <span>{order.qr_reference}</span>
                      </div>
                    )}
                  </div>

                  {/* Paper Footer */}
                  <div className="border-t-2 border-dashed border-gray-900 pt-2 text-center text-[9px] space-y-0.5 text-gray-700">
                    <div className="font-bold">WiFi: {restaurant.wifi_ssid} | Pass: {restaurant.wifi_pass}</div>
                    <div className="font-extrabold text-[10px] text-black mt-1">
                      {restaurant.footer_message}
                    </div>
                    <div>*** Authentic Southern Ceylon Taste ***</div>
                  </div>
                </div>
              ) : currentSlipType === 'KOT' && (order || kotData) ? (
                /* --- DYNAMIC KITCHEN ORDER TICKET (KOT) --- */
                <div>
                  <div className="text-center pb-2">
                    <div className="bg-black text-white font-black py-1 px-2 text-xs tracking-wider mb-1">
                      *** KITCHEN ORDER TICKET (KOT) ***
                    </div>
                    <div className="text-xs font-bold">
                      ORDER #{order ? order.order_number : kotData?.orderNumber}
                    </div>
                    <div className="text-sm font-black mt-1">
                      {order?.table_number 
                        ? `TABLE: ${order.table_number}` 
                        : kotData?.tableNumber 
                        ? `TABLE: ${kotData.tableNumber}` 
                        : `TYPE: ${(order?.order_type || kotData?.orderType || 'TAKEAWAY').toUpperCase()}`}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                      <span>Server: {order?.cashier_name || kotData?.cashierName}</span>
                      <span>Time: {order?.created_at || kotData?.createdAt || new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="border-b-2 border-dashed border-gray-900 my-2" />
                  </div>

                  {/* KOT Items with station and notes */}
                  <div className="py-2 space-y-2">
                    {(order?.items || kotData?.items || []).map((item, idx) => (
                      <div key={idx} className="border-b border-dotted border-gray-400 pb-1.5">
                        <div className="flex justify-between font-black text-xs">
                          <span>{idx + 1}. {item.item_name} {item.variant_name ? `[${item.variant_name}]` : ''}</span>
                          <span className="text-sm font-extrabold">QTY: {item.quantity}</span>
                        </div>
                        {item.station && (
                          <div className="text-[9px] font-bold text-gray-700">
                            Station: [{item.station}]
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] font-bold text-black uppercase pl-2">
                            &gt;&gt;&gt; INSTRUCTION: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* KOT Footer */}
                  <div className="border-t-2 border-dashed border-gray-900 pt-2 text-center text-[10px] font-bold">
                    <div>Total Items: {(order?.items || kotData?.items || []).reduce((sum, i) => sum + i.quantity, 0)}</div>
                    <div className="text-[9px] text-gray-600 mt-1">--- DISPATCH TO STATION ---</div>
                  </div>
                </div>
              ) : currentSlipType === 'BILL' && order ? (
                /* --- DYNAMIC GUEST CHECK / BILL --- */
                <div>
                  <div className="text-center space-y-0.5 pb-2 flex flex-col items-center">
                    <div className="mb-2 flex justify-center">
                      <img 
                        src={thermalLogo} 
                        alt={restaurant.name} 
                        className="w-28 h-28 object-contain mx-auto"
                      />
                    </div>
                    <div className="font-extrabold text-sm tracking-wider uppercase">
                      {restaurant.name}
                    </div>
                    {restaurant.branch && 
                     restaurant.branch.toLowerCase().trim() !== restaurant.address.toLowerCase().trim() && 
                     !restaurant.address.toLowerCase().includes(restaurant.branch.toLowerCase().trim()) && (
                      <div className="font-bold text-xs">{restaurant.branch}</div>
                    )}
                    <div className="text-[10px] text-gray-700">{restaurant.address}</div>
                    <div className="text-[10px] text-gray-700">{restaurant.city}</div>
                    <div className="text-[10px] font-extrabold text-black uppercase mt-1">
                      === GUEST CHECK / PROFORMA BILL ===
                    </div>
                    <div className="text-[9px] text-gray-600 font-semibold">
                      *** NOT A TAX RECEIPT - PENDING SETTLEMENT ***
                    </div>
                    <div className="border-b-2 border-dashed border-gray-900 my-2 w-full" />
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span>Order: #{order.order_number}</span>
                      <span>{order.table_number ? `Table: ${order.table_number}` : `Type: ${order.order_type.toUpperCase()}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date: {order.created_at}</span>
                      <span>Server: {order.cashier_name}</span>
                    </div>
                    <div className="border-b border-dashed border-gray-800 my-1.5" />
                  </div>

                  {/* Items */}
                  <div className="py-2 text-[10px] leading-snug space-y-1.5">
                    <div className="flex justify-between font-extrabold border-b border-gray-400 pb-1">
                      <span>ITEM</span>
                      <span>AMOUNT</span>
                    </div>

                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-semibold">
                        <span>
                          {item.quantity}x {item.item_name}
                          {item.variant_name && ` (${item.variant_name})`}
                        </span>
                        <span>Rs. {item.total_price.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}

                    <div className="border-b-2 border-dashed border-gray-900 my-2" />

                    <div className="flex justify-between font-bold">
                      <span>Subtotal:</span>
                      <span>Rs. {order.subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-800">
                        <span>Discount ({order.discount_percentage || 0}%):</span>
                        <span>- Rs. {order.discount_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {order.service_charge > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge (10%):</span>
                        <span>Rs. {order.service_charge.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {order.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <span>VAT (8%):</span>
                        <span>Rs. {order.tax_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="border-b border-gray-900 my-1" />

                    <div className="flex justify-between font-black text-xs">
                      <span>TOTAL PAYABLE:</span>
                      <span>Rs. {order.total_amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed border-gray-900 pt-2 text-center text-[9px] text-gray-700">
                    <div>Please present this slip at the cashier counter.</div>
                    <div className="font-bold">Cash, Visa, Mastercard & LankaQR accepted</div>
                  </div>
                </div>
              ) : currentSlipType === 'X_REPORT' && xReportData ? (
                /* --- X-REPORT SHIFT SNAPSHOT --- */
                <div>
                  <div className="text-center space-y-0.5 pb-2">
                    <div className="font-extrabold text-xs uppercase tracking-wider">
                      === X-REPORT (SHIFT AUDIT) ===
                    </div>
                    <div className="font-bold text-xs">{restaurant.name}</div>
                    <div className="text-[10px] text-gray-700">Register: {xReportData.shift.register_number}</div>
                    <div className="text-[10px] text-gray-700">Cashier: {xReportData.shift.cashier_name}</div>
                    <div className="text-[9px] text-gray-600">Generated: {xReportData.generated_at}</div>
                    <div className="border-b-2 border-dashed border-gray-900 my-2" />
                  </div>

                  <div className="text-[10px] space-y-1 py-1">
                    <div className="flex justify-between">
                      <span>Shift Opened:</span>
                      <span>{xReportData.shift.opened_at}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Opening Cash Float:</span>
                      <span>Rs. {xReportData.shift.opening_float.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Completed Orders:</span>
                      <span>{xReportData.order_count}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Food Items Sold:</span>
                      <span>{xReportData.items_sold_count}</span>
                    </div>
                    <div className="border-b border-gray-800 my-1" />

                    <div className="font-bold uppercase text-[9px] pt-1">Sales by Category:</div>
                    {xReportData.sales_by_category.map((cat, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{cat.category_name} ({cat.item_count})</span>
                        <span>Rs. {cat.total_amount.toLocaleString()}</span>
                      </div>
                    ))}

                    <div className="border-b border-gray-800 my-1" />
                    <div className="font-bold uppercase text-[9px] pt-1">Payment Breakdown:</div>
                    {xReportData.sales_by_payment.map((p, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{p.method.toUpperCase()} ({p.count} txns)</span>
                        <span>Rs. {p.total.toLocaleString()}</span>
                      </div>
                    ))}

                    <div className="border-b-2 border-dashed border-gray-900 my-2" />
                    <div className="flex justify-between font-black text-xs">
                      <span>TOTAL REVENUE:</span>
                      <span>Rs. {xReportData.shift.total_sales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : currentSlipType === 'Z_REPORT' && zReportData ? (
                /* --- Z-REPORT OFFICIAL CLOSURE --- */
                <div>
                  <div className="text-center space-y-0.5 pb-2">
                    <div className="font-extrabold text-xs uppercase tracking-wider text-rose-900">
                      === OFFICIAL Z-REPORT (SESSION CLOSURE) ===
                    </div>
                    <div className="font-bold text-xs">{restaurant.name}</div>
                    <div className="text-[10px] text-gray-700">Register: {zReportData.shift.register_number}</div>
                    <div className="text-[10px] text-gray-700">Closing Cashier: {zReportData.closing_cashier}</div>
                    <div className="text-[9px] text-gray-600">Closed: {zReportData.closing_timestamp}</div>
                    <div className="border-b-2 border-dashed border-gray-900 my-2" />
                  </div>

                  <div className="text-[10px] space-y-1 py-1">
                    <div className="flex justify-between">
                      <span>Expected Cash in Drawer:</span>
                      <span>Rs. {zReportData.shift.cash_drawer_expected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Physical Counted Cash:</span>
                      <span>Rs. {zReportData.drawer_counted.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between font-black ${zReportData.over_short < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      <span>Discrepancy (Over/Short):</span>
                      <span>Rs. {zReportData.over_short > 0 ? `+${zReportData.over_short}` : zReportData.over_short}</span>
                    </div>
                    <div className="border-b border-gray-800 my-1" />
                    <div className="flex justify-between font-black text-xs">
                      <span>FINAL SHIFT TOTAL:</span>
                      <span>Rs. {zReportData.shift.total_sales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : currentSlipType === 'PAYOUT_VOUCHER' && payoutData ? (
                /* --- DYNAMIC CASH PAYOUT / LENDING VOUCHER --- */
                <div>
                  <div className="text-center space-y-0.5 pb-2 flex flex-col items-center">
                    <div className="mb-2 flex justify-center">
                      <img 
                        src={thermalLogo} 
                        alt={restaurant.name} 
                        className="w-24 h-24 object-contain mx-auto"
                      />
                    </div>
                    <div className="font-extrabold text-sm tracking-wider uppercase">
                      {restaurant.name}
                    </div>
                    <div className="text-[10px] text-gray-700">{restaurant.address}</div>
                    <div className="text-xs font-black uppercase text-rose-900 border-2 border-rose-900 px-2 py-0.5 mt-1">
                      *** {payoutData.type.toUpperCase()} VOUCHER ***
                    </div>
                    <div className="border-b-2 border-dashed border-gray-900 my-2 w-full" />
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span>Voucher: #CSH-{payoutData.id.toString().slice(-6)}</span>
                      <span>Type: {payoutData.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date: {payoutData.timestamp}</span>
                      <span>Cashier: {payoutData.cashier_name}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Authorized By:</span>
                      <span className="text-emerald-800 font-extrabold">{payoutData.authorized_by}</span>
                    </div>
                    <div className="border-b border-dashed border-gray-800 my-1.5" />
                  </div>

                  <div className="py-2 space-y-2 text-[10px]">
                    <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                      <span className="font-bold">HANDED OVER TO:</span>
                      <span className="font-black text-xs text-black">{payoutData.recipient}</span>
                    </div>

                    <div className="p-2 border border-gray-300 rounded text-gray-800">
                      <span className="font-bold block mb-0.5">REASON / PURPOSE:</span>
                      <p className="italic">{payoutData.reason}</p>
                    </div>

                    <div className="border-b-2 border-dashed border-gray-900 my-2" />

                    <div className="flex justify-between font-black text-sm text-black">
                      <span>AMOUNT RELEASED:</span>
                      <span className="font-mono font-black text-base">
                        Rs. {payoutData.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="border-t-2 border-dashed border-gray-900 pt-4 mt-2 text-[9px] space-y-4 text-gray-700">
                    <div className="flex justify-between">
                      <div>Recipient Sign: __________________</div>
                    </div>
                    <div className="flex justify-between">
                      <div>Manager Sign:   __________________</div>
                    </div>
                    <div className="text-center italic text-[8px] pt-1">
                      Official Southern Spoon Cash Audit Record • Physical Drawer Released
                    </div>
                  </div>
                </div>
              ) : (
                /* Generic Clean Fallback */
                <div className="py-4 text-center space-y-2 flex flex-col items-center">
                  <img 
                    src={thermalLogo} 
                    alt={restaurant.name} 
                    className="w-24 h-24 object-contain mx-auto mb-2"
                  />
                  <div className="font-bold text-sm uppercase">{restaurant.name}</div>
                  {restaurant.branch && 
                   restaurant.branch.toLowerCase().trim() !== restaurant.address.toLowerCase().trim() && 
                   !restaurant.address.toLowerCase().includes(restaurant.branch.toLowerCase().trim()) && (
                    <div className="text-xs text-gray-600">{restaurant.branch}</div>
                  )}
                  <div className="border-b border-dashed border-gray-800 my-2 w-full" />
                  <div className="text-xs font-semibold">{printPreview.title}</div>
                  <p className="text-[10px] text-gray-700 whitespace-pre-wrap">{printPreview.plainText}</p>
                </div>
              )}

              {/* Feed clearance spacer so physical cutter blade never crops the final receipt text */}
              <div className="hidden print:block print:h-24 w-full" aria-hidden="true" />

              {/* Paper Jagged Bottom Tear Effect */}
              <div className="tear-effect absolute -bottom-2 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_4px,#fcfaf2_4px)] bg-[length:12px_12px] rotate-180 pointer-events-none" />
            </div>
          ) : (
            /* Hex Dump Inspector */
            <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto select-text">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-bold text-[11px] uppercase">
                  ESC/POS Binary Buffer (Hexadecimal representation)
                </span>
                <button
                  onClick={copyHex}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] transition-all"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Hex'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-all leading-relaxed text-slate-300">
                {currentHexDump}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>{printSuccessNotice ? 'Print Initiated!' : 'ESC/POS Hardware Ready'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closePrintPreview}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Done
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-glow-amber flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
