import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { 
  X, 
  Printer, 
  Binary, 
  FileText, 
  Copy, 
  Check, 
  Sparkles,
  Download,
  Receipt
} from 'lucide-react';

export const PrintPreviewModal: React.FC = () => {
  const { printPreview, closePrintPreview, restaurant } = usePosStore();
  const [activeTab, setActiveTab] = useState<'visual' | 'hexdump'>('visual');
  const [copied, setCopied] = useState(false);
  const [paperWidth, setPaperWidth] = useState<80 | 58>(80);

  if (!printPreview) return null;

  const copyHex = () => {
    navigator.clipboard.writeText(printPreview.hexDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <span>{printPreview.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ESC/POS 200 DPI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Hardware Thermal Printer Emulator ({paperWidth}mm Roll)
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
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40 flex justify-center scrollbar-thin scrollbar-thumb-slate-800">
          {activeTab === 'visual' ? (
            /* Realistic Thermal Paper Roll */
            <div
              style={{ width: paperWidth === 80 ? '380px' : '290px' }}
              className="bg-[#fcfaf2] text-[#111] p-6 shadow-receipt rounded-sm font-mono text-[11px] leading-relaxed relative animate-print-slip select-text border border-amber-900/10"
            >
              {/* Paper Jagged Top Tear Effect */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_4px,#fcfaf2_4px)] bg-[length:12px_12px] -mt-1" />

              {/* Receipt Body */}
              <div className="text-center space-y-0.5 pb-2">
                <div className="font-extrabold text-sm tracking-wider uppercase">
                  {restaurant.name}
                </div>
                <div className="font-bold text-xs">{restaurant.branch}</div>
                <div className="text-[10px] text-gray-700">{restaurant.address}</div>
                <div className="text-[10px] text-gray-700">{restaurant.city}</div>
                <div className="text-[10px] text-gray-700">Hotline: {restaurant.hotline}</div>
                <div className="text-[10px] font-semibold">{restaurant.tax_number}</div>
                <div className="border-b-2 border-dashed border-gray-900 my-2" />
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>Type: {printPreview.type}</span>
                  <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier: Kasun Perera</span>
                  <span>Time: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="border-b border-dashed border-gray-800 my-1.5" />
              </div>

              {/* Sample Ticket Preview Representation */}
              <div className="py-2 text-[10px] leading-snug space-y-1">
                <div className="flex justify-between font-extrabold border-b border-gray-400 pb-1">
                  <span>DESCRIPTION</span>
                  <span>AMOUNT</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Rice & Curry (Ambulthiyal)</span>
                  <span>Rs. 750.00</span>
                </div>
                <div className="text-[9px] text-gray-600 pl-2 italic">* Extra Pol Sambol</div>

                <div className="flex justify-between font-semibold">
                  <span>Spicy Chicken Kottu (Standard)</span>
                  <span>Rs. 850.00</span>
                </div>
                <div className="text-[9px] text-gray-600 pl-2 italic">* + Extra Cheese, Extra Gravy</div>

                <div className="flex justify-between font-semibold">
                  <span>2x Plain Hopper (Appa)</span>
                  <span>Rs. 100.00</span>
                </div>

                <div className="flex justify-between font-semibold">
                  <span>Elephant Ginger Beer (EGB)</span>
                  <span>Rs. 180.00</span>
                </div>

                <div className="border-b-2 border-dashed border-gray-900 my-2" />

                <div className="flex justify-between font-bold">
                  <span>SUBTOTAL:</span>
                  <span>Rs. 1,880.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge (10%):</span>
                  <span>Rs. 188.00</span>
                </div>
                <div className="border-b border-gray-900 my-1" />
                <div className="flex justify-between font-black text-xs">
                  <span>TOTAL NET:</span>
                  <span>Rs. 2,068.00</span>
                </div>
                <div className="flex justify-between">
                  <span>CASH TENDERED:</span>
                  <span>Rs. 5,000.00</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>CHANGE RETURNED:</span>
                  <span>Rs. 2,932.00</span>
                </div>
              </div>

              {/* Paper Footer */}
              <div className="border-t-2 border-dashed border-gray-900 pt-2 text-center text-[9px] space-y-0.5 text-gray-700">
                <div className="font-bold">WiFi: {restaurant.wifi_ssid} | Pass: {restaurant.wifi_pass}</div>
                <div className="font-extrabold text-[10px] text-black mt-1">
                  {restaurant.footer_message}
                </div>
                <div>*** Authentic Southern Ceylon Taste ***</div>
              </div>

              {/* Paper Jagged Bottom Tear Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_4px,#fcfaf2_4px)] bg-[length:12px_12px] -mb-1 rotate-180" />
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
                {printPreview.hexDump}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>ESC/POS Hardware Ready</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closePrintPreview}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Done
            </button>
            <button
              onClick={() => {
                alert("Thermal print job sent to hardware printer queue over ESC/POS protocol!");
                closePrintPreview();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-glow-amber flex items-center gap-1.5 transition-all"
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
