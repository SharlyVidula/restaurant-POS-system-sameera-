import React, { useState } from 'react';
import { X, GitBranch, RefreshCw, CheckCircle2, Download, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';

interface GitUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitUpdateModal: React.FC<GitUpdateModalProps> = ({ isOpen, onClose }) => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'offline' | 'error'>('idle');
  const [latestCommit, setLatestCommit] = useState<{ message: string; date: string; sha: string } | null>(null);

  if (!isOpen) return null;

  const handleCheckUpdates = async () => {
    setChecking(true);
    setStatus('idle');
    try {
      // Check if Electron API is available
      if ((window as any).electronAPI?.checkForGitUpdates) {
        const res = await (window as any).electronAPI.checkForGitUpdates();
        if (res.hasUpdate) {
          setLatestCommit({ message: res.message, date: res.date, sha: res.sha });
          setStatus('success');
        } else {
          setStatus('idle');
        }
      } else {
        // Web fallback: query GitHub REST API
        const response = await fetch('https://api.github.com/repos/SharlyVidula/restaurant-POS-system-sameera-/commits/main', {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setLatestCommit({
            message: data.commit.message,
            date: new Date(data.commit.author.date).toLocaleString('en-GB'),
            sha: data.sha.substring(0, 7)
          });
          setStatus('success');
        } else {
          setStatus('offline');
        }
      }
    } catch (e) {
      console.warn("Could not check git updates", e);
      setStatus('offline');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Git Update Synchronizer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v1.0.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Southern Spoon POS • GitHub Repo Sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Remote Repository:</span>
              <span className="text-slate-200 font-bold">SharlyVidula/restaurant-POS...</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Target Branch:</span>
              <span className="text-amber-400 font-bold">main</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Offline Cache Mode:</span>
              <span className="text-emerald-400 font-bold">ACTIVE (Zero downtime)</span>
            </div>
          </div>

          {status === 'success' && latestCommit && (
            <div className="p-3.5 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Connected to GitHub Repo</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Latest Commit: <span className="text-amber-300 font-bold">#{latestCommit.sha}</span>
              </p>
              <p className="text-[11px] text-slate-400 italic">
                "{latestCommit.message}"
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Synced at: {latestCommit.date}
              </p>
            </div>
          )}

          {status === 'offline' && (
            <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-500/30 text-xs text-amber-300">
              <span className="font-bold block">Offline Mode Active:</span>
              Could not reach GitHub servers. The POS continues running completely offline from local storage.
            </div>
          )}

          {/* Quick instructions */}
          <div className="text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">To apply updates at the restaurant:</p>
            <p className="flex items-center gap-1 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Double click <strong>Launch-SouthernSpoon-POS.bat</strong> on the Desktop.</span>
            </p>
            <p className="text-slate-500">It automatically pulls the newest code from Git before launching!</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Close
          </button>

          <button
            onClick={handleCheckUpdates}
            disabled={checking}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-glow-amber flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking GitHub...' : 'Check Git Repo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
