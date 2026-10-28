import React, { useState, useEffect, useRef } from 'react';
import { usePosStore } from '../../store/posStore';
import { 
  Keyboard, 
  Check, 
  AlertCircle, 
  Sparkles, 
  CornerDownLeft, 
  X, 
  ChefHat,
  ArrowRight
} from 'lucide-react';

export const QuickHotkeyHUD: React.FC = () => {
  const { 
    menuItems, 
    addItemByHotkey, 
    isPaymentModalOpen, 
    isTableModalOpen, 
    isQueueModalOpen, 
    variantModalItem,
    isHistoryModalOpen,
    isMenuPriceModalOpen,
    isHotkeysModalOpen,
    isAdminAuthModalOpen,
    isOpeningFloatModalOpen,
    orderType,
    selectedTable
  } = usePosStore();

  const [buffer, setBuffer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Is any modal currently open that should suppress hotkey capture?
  const isAnyModalActive = 
    isPaymentModalOpen || 
    isTableModalOpen || 
    isQueueModalOpen || 
    !!variantModalItem || 
    isHistoryModalOpen || 
    isMenuPriceModalOpen || 
    isHotkeysModalOpen ||
    isAdminAuthModalOpen ||
    isOpeningFloatModalOpen;

  // Find live match preview
  const matchedItem = buffer.trim()
    ? menuItems.find(m => 
        (m.hotkey && m.hotkey.toLowerCase() === buffer.trim().toLowerCase()) || 
        String(m.id) === buffer.trim()
      )
    : null;

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is active, let modal handle keys
      if (isAnyModalActive) return;

      // Don't intercept if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      // 1. Digits (Top row 0-9 & Numpad 0-9)
      const isDigit = /^[0-9]$/.test(e.key);
      if (isDigit) {
        e.preventDefault();
        setBuffer(prev => {
          const next = prev + e.key;
          setIsVisible(true);
          return next;
        });
        return;
      }

      // 2. Enter key - commit hotkey
      if (e.key === 'Enter') {
        if (buffer.trim()) {
          e.preventDefault();
          executeAdd(buffer.trim());
        }
        return;
      }

      // 3. Backspace key - remove last digit
      if (e.key === 'Backspace') {
        if (buffer.length > 0) {
          e.preventDefault();
          setBuffer(prev => {
            const next = prev.slice(0, -1);
            if (next.length === 0) setIsVisible(false);
            return next;
          });
        }
        return;
      }

      // 4. Escape key - dismiss HUD
      if (e.key === 'Escape') {
        if (buffer.length > 0) {
          e.preventDefault();
          setBuffer('');
          setIsVisible(false);
          setFeedback(null);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buffer, isAnyModalActive, menuItems]);

  const showFeedbackToast = (type: 'success' | 'error', message: string) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback({ type, message });
    setIsVisible(true);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      setBuffer('');
      setIsVisible(false);
    }, 2400);
  };

  const executeAdd = (code: string) => {
    const result = addItemByHotkey(code);
    if (result.success) {
      showFeedbackToast('success', result.message);
    } else {
      showFeedbackToast('error', result.message);
    }
  };

  // If not visible and no feedback, do not render floating HUD
  if (!isVisible && !feedback && buffer.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideUp select-none pointer-events-auto">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-200 min-w-[340px] max-w-[480px] ${
        feedback?.type === 'error'
          ? 'bg-rose-950/95 border-rose-500/60 shadow-rose-950/50'
          : feedback?.type === 'success'
          ? 'bg-emerald-950/95 border-emerald-500/60 shadow-emerald-950/50'
          : 'bg-slate-900/95 border-amber-500/60 shadow-amber-950/40'
      }`}>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              feedback?.type === 'error'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : feedback?.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              <Keyboard className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Numeric Hotkey Punch
            </span>
          </div>

          <button
            onClick={() => {
              setBuffer('');
              setIsVisible(false);
              setFeedback(null);
            }}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Message Mode */}
        {feedback ? (
          <div className="flex items-center gap-2.5 py-1">
            {feedback.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 stroke-[3]" />
              </div>
            )}
            <p className={`text-sm font-bold ${feedback.type === 'success' ? 'text-emerald-200' : 'text-rose-200'}`}>
              {feedback.message}
            </p>
          </div>
        ) : (
          /* Live Buffer & Matched Item Preview Mode */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Code:</span>
                <span className="font-mono font-black text-2xl text-amber-400 tracking-wider">
                  {buffer}
                  <span className="inline-block w-2.5 h-5 bg-amber-400 ml-1 animate-pulse align-middle" />
                </span>
              </div>

              {matchedItem && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Match Found
                </span>
              )}
            </div>

            {/* Matched item preview details */}
            {matchedItem ? (
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-100">
                      {matchedItem.name}
                    </span>
                    {matchedItem.station && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 flex items-center gap-1">
                        <ChefHat className="w-2.5 h-2.5 text-amber-400" />
                        <span>{matchedItem.station}</span>
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-sm text-amber-400 shrink-0">
                    Rs. {matchedItem.base_price.toLocaleString()}
                  </span>
                </div>

                {matchedItem.variants && matchedItem.variants.length > 0 && (
                  <p className="text-[11px] text-amber-300/90 font-medium">
                    ⚡ Has portions ({matchedItem.variants.map(v => v.variant_name).join(', ')})
                  </p>
                )}
              </div>
            ) : buffer.length > 0 ? (
              <p className="text-xs text-slate-400 italic">
                Searching for item with code #{buffer}...
              </p>
            ) : null}

            {/* Keyboard shortcut action bar */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-amber-400 font-bold">
                  Esc
                </kbd>
                <span>Clear</span>
              </span>

              <button
                onClick={() => executeAdd(buffer)}
                disabled={!matchedItem}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
              >
                <span>Press Enter to Add</span>
                <CornerDownLeft className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
