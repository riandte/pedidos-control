
const CACHE_PREFIX = 'pedidos_cache_';
const DEFAULT_EXPIRY = 30 * 60 * 1000; // 30 minutos

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export const apiCache = {
  set: <T>(key: string, data: T, expiry: number = DEFAULT_EXPIRY) => {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry,
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (e) {
      console.warn('Erro ao salvar no cache:', e);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const stored = localStorage.getItem(CACHE_PREFIX + key);
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      const now = Date.now();

      if (now - item.timestamp > item.expiry) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return item.data;
    } catch (e) {
      return null;
    }
  },

  clear: (key: string) => {
    localStorage.removeItem(CACHE_PREFIX + key);
  },

  clearAll: () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};
