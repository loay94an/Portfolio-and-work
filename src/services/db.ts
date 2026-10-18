import { AppState } from '../types';
import { parseAndInspectBackup } from './backupParser';

// 🔴 تم تغيير اسم القاعدة إلى v15 لإجبار المتصفح على إنشاء قاعدة جديدة وتجاهل القديمة
const DB_NAME = 'SmartWalletDB_v15'; 
const DB_VERSION = 1;
const STATE_STORE = 'app_state';
// 🔴 تم تغيير مفتاح التخزين الاحتياطي أيضاً
const LEGACY_STORAGE_KEY = 'wallet_v15'; 

export const DEFAULT_RATES: Record<string, number> = {
  SAR: 3.75,
  AED: 3.67,
  EGP: 50.0,
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  KWD: 0.31,
  QAR: 3.64,
  JOD: 0.71,
  BHD: 0.38,
  OMR: 0.38,
  TND: 3.15,
  MAD: 10.0,
  DZD: 135.0,
};

export const INITIAL_STATE: AppState = {
  transactions: [],
  categories: [
    { id: 'cat_food', name: 'طعام ومشتريات', type: 'expense' },
    { id: 'cat_salary', name: 'راتب ودخل', type: 'income' },
    { id: 'cat_transport', name: 'مواصلات وبنزين', type: 'expense' },
    { id: 'cat_bills', name: 'فواتير واشتراكات', type: 'expense' },
    { id: 'cat_freelance', name: 'أعمال حرة', type: 'income' },
    { id: 'cat_shopping', name: 'تسوق وملابس', type: 'expense' },
  ],
  people: [],
  debts: [],
  payments: [],
  works: [],
  workLogs: [],
  workPayments: [],
  workGoals: [],
  budgets: [],
  financialGoals: [],
  notebooks: [],
  standardNotes: [],
  mindMaps: [],
  exchangeRates: { ...DEFAULT_RATES },
  settings: {
    currency: 'ر.س',
    language: 'ar',
    theme: 'purple',
    autoCloudSync: false,
    syncKey: 'WALLET-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    userEmail: '',
  },
  security: {
    enabled: false,
    type: 'off',
    pin: '',
    pattern: [],
  },
  lastUpdated: new Date().toISOString(),
};

class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  public isIndexedDBSupported: boolean = typeof window !== 'undefined' && 'indexedDB' in window;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!this.isIndexedDBSupported) {
        reject(new Error('IndexedDB is not supported in this browser'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STATE_STORE)) {
          db.createObjectStore(STATE_STORE);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  async loadState(): Promise<AppState> {
    try {
      if (this.isIndexedDBSupported) {
        const db = await this.openDB();
        const stateFromIDB = await new Promise<AppState | null>((resolve, reject) => {
          const transaction = db.transaction(STATE_STORE, 'readonly');
          const store = transaction.objectStore(STATE_STORE);
          const req = store.get('current_state');

          req.onsuccess = () => {
            resolve(req.result || null);
          };
          req.onerror = () => {
            reject(req.error);
          };
        });

        if (stateFromIDB) {
          return this.sanitizeState(stateFromIDB);
        }
      }
    } catch (err) {
      console.warn('Could not read state from IndexedDB, falling back to localStorage:', err);
    }

    try {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        const migrated = this.sanitizeState({ ...INITIAL_STATE, ...parsed });
        await this.saveState(migrated);
        return migrated;
      }
    } catch (e) {
      console.warn('Error reading legacy localStorage:', e);
    }

    const defaultState = this.sanitizeState(INITIAL_STATE);
    await this.saveState(defaultState);
    return defaultState;
  }

  async saveState(state: AppState): Promise<void> {
    const updatedState = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updatedState));
    } catch (e) {}

    if (!this.isIndexedDBSupported) return;

    try {
      const db = await this.openDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STATE_STORE, 'readwrite');
        const store = transaction.objectStore(STATE_STORE);
        const req = store.put(updatedState, 'current_state');

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error('Error saving state to IndexedDB:', err);
    }
  }

  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem('currentWorkId');
      localStorage.removeItem('timer_state');
      localStorage.removeItem('wallet_theme');
      localStorage.removeItem('wallet_lang');
    } catch (e) {}

    if (this.isIndexedDBSupported) {
      try {
        const db = await this.openDB();
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(STATE_STORE, 'readwrite');
          const store = transaction.objectStore(STATE_STORE);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.error('Error clearing IndexedDB:', err);
      }
    }
  }

  async getStorageInfo(): Promise<{ usedBytes: number; quotaBytes: number; isPersisted: boolean }> {
    let usedBytes = 0;
    let quotaBytes = 0;
    let isPersisted = false;

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usedBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || 0;
      } catch (e) {}
    }

    if (navigator.storage && navigator.storage.persisted) {
      try {
        isPersisted = await navigator.storage.persisted();
      } catch (e) {}
    }

    return { usedBytes, quotaBytes, isPersisted };
  }

  public sanitizeState(raw: any): AppState {
    if (!raw) return INITIAL_STATE;
    const parsed = parseAndInspectBackup(raw);
    if (parsed.success && parsed.inspection) {
      return parsed.inspection.state;
    }
    return INITIAL_STATE;
  }
}

export const dbService = new IndexedDBStorage();
