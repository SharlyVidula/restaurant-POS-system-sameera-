import { posDatabase } from '../db/sqlite';
import { DailySalesReportData, MonthlySalesReportData } from '../types';

export const DEFAULT_CLOUD_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxSAOlCD3EkPY7dExpk-ZJESJSaL7BbmUvUZc5pYqGdxXmuH2ZRH5rDaM_yYPMAszemZw/exec';

export interface CloudSyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingCount: number;
  syncInProgress: boolean;
  lastMessage: string;
}

type SyncListener = (status: CloudSyncStatus) => void;

class CloudSyncService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private lastSyncTime: string | null = null;
  private syncInProgress: boolean = false;
  private lastMessage: string = 'Initialized';
  private listeners: Set<SyncListener> = new Set();
  private autoSyncInterval: number | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      this.lastSyncTime = localStorage.getItem('southern_spoon_last_cloud_sync') || null;
      this.isOnline = navigator.onLine;

      window.addEventListener('online', () => {
        this.isOnline = true;
        this.lastMessage = 'Internet Connected';
        this.notify();
        this.triggerSync('auto_connect');
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.lastMessage = 'Offline - Local Mode Active';
        this.notify();
      });

      // Periodic check every 5 minutes if online
      this.autoSyncInterval = window.setInterval(() => {
        if (this.isOnline && !this.syncInProgress) {
          this.triggerSync('interval');
        }
      }, 5 * 60 * 1000);
    }
  }

  public getStatus(): CloudSyncStatus {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingCount: 0,
      syncInProgress: this.syncInProgress,
      lastMessage: this.lastMessage,
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach(l => l(status));
  }

  /**
   * Build sync snapshot payload
   */
  public generateSyncPayload(): {
    sync_id: string;
    timestamp: string;
    terminal: string;
    daily: DailySalesReportData;
    monthly: MonthlySalesReportData;
    order_count: number;
  } {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const daily = posDatabase.getDailySalesReport(dateStr);
    const monthly = posDatabase.getMonthlySalesReport(today.getFullYear(), today.getMonth() + 1);

    return {
      sync_id: `SYNC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      terminal: 'REG-01 (Labuduwa)',
      daily,
      monthly,
      order_count: posDatabase.getOrders().length,
    };
  }

  /**
   * Trigger cloud sync safely (never throws)
   */
  public async triggerSync(reason: string = 'manual'): Promise<{ success: boolean; message: string }> {
    if (!this.isOnline) {
      this.lastMessage = 'No Internet Connection. Operates locally in offline mode.';
      this.notify();
      return { success: false, message: this.lastMessage };
    }

    if (this.syncInProgress) {
      return { success: false, message: 'Sync already in progress' };
    }

    this.syncInProgress = true;
    this.lastMessage = 'Syncing sales data to cloud...';
    this.notify();

    try {
      const payload = this.generateSyncPayload();

      // Cloud endpoint (custom or default Google Sheets web app)
      const cloudEndpoint = this.getCloudEndpoint();

      if (cloudEndpoint && cloudEndpoint.startsWith('http')) {
        const isGoogleScript = cloudEndpoint.includes('script.google.com');
        const res = await fetch(cloudEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
          mode: isGoogleScript ? 'no-cors' : 'cors',
        });

        if (!isGoogleScript && !res.ok) {
          throw new Error(`Cloud server responded with status: ${res.status}`);
        }
      }

      // Record successful sync
      const timestamp = new Date().toLocaleTimeString() + ' (' + new Date().toLocaleDateString('en-GB') + ')';
      this.lastSyncTime = timestamp;
      if (typeof window !== 'undefined') {
        localStorage.setItem('southern_spoon_last_cloud_sync', timestamp);
      }

      this.lastMessage = `Cloud Sync Success • ${payload.daily.order_count} orders synced (${reason})`;
      this.syncInProgress = false;
      this.notify();

      return {
        success: true,
        message: this.lastMessage,
      };
    } catch (err: any) {
      console.warn('[Cloud Sync Notice] Cloud sync deferred (local data intact):', err?.message);
      this.lastMessage = `Sync deferred: ${err?.message || 'Network error'}. Local data 100% safe.`;
      this.syncInProgress = false;
      this.notify();
      return {
        success: false,
        message: this.lastMessage,
      };
    }
  }

  public setCloudEndpoint(url: string): void {
    if (typeof window !== 'undefined') {
      if (url && url !== DEFAULT_CLOUD_ENDPOINT) {
        localStorage.setItem('southern_spoon_cloud_endpoint', url);
      } else {
        localStorage.removeItem('southern_spoon_cloud_endpoint');
      }
    }
  }

  public getCloudEndpoint(): string {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem('southern_spoon_cloud_endpoint');
      if (custom) return custom;
    }
    return DEFAULT_CLOUD_ENDPOINT;
  }
}

export const cloudSyncService = new CloudSyncService();

