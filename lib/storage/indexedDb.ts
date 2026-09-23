/**
 * IndexedDB storage engine for Tien Ky Dao.
 * Ensures custom uploaded avatars, cropped high-res images, animated frames,
 * and encrypted accounts are safely stored without LocalStorage's 5MB limitation.
 */

const DB_NAME = 'TienKyDaoDatabase_v1';
const DB_VERSION = 1;

export interface DBStoreMap {
  accounts: any;
  customFrames: any;
  dharmaIdols: any;
  customArtifacts: any;
  customTitles: any;
  systemConfig: any;
  uploadedAvatars: any;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

export function getIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const stores = [
          'accounts',
          'customFrames',
          'dharmaIdols',
          'customArtifacts',
          'customTitles',
          'systemConfig',
          'uploadedAvatars',
        ];
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (e) => {
        console.warn('[IndexedDB] Failed to open database:', e);
        resolve(null);
      };
    } catch (err) {
      console.warn('[IndexedDB] Init error:', err);
      resolve(null);
    }
  });

  return dbPromise;
}

export async function idbSet<T extends { id: string }>(storeName: keyof DBStoreMap, value: T): Promise<boolean> {
  try {
    const db = await getIndexedDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function idbGet<T>(storeName: keyof DBStoreMap, id: string): Promise<T | null> {
  try {
    const db = await getIndexedDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbGetAll<T>(storeName: keyof DBStoreMap): Promise<T[]> {
  try {
    const db = await getIndexedDB();
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function idbSaveAll<T extends { id: string }>(storeName: keyof DBStoreMap, items: T[]): Promise<boolean> {
  try {
    const db = await getIndexedDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
