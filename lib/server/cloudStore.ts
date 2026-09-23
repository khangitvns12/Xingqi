import fs from 'fs';
import path from 'path';
import { UserAccount, ADMIN_USER, DEFAULT_USER, SEED_ACCOUNTS } from '../storage/userStore';
import {
  CustomFrame,
  DharmaIdol,
  CustomArtifact,
  CustomTitle,
  DEFAULT_FRAMES,
  DEFAULT_DHARMA_IDOLS,
  DEFAULT_ARTIFACTS,
  DEFAULT_CUSTOM_TITLES,
} from '../cultivation/shopAndFrames';

export interface CloudStoreData {
  accounts: UserAccount[];
  customFrames: CustomFrame[];
  dharmaIdols: DharmaIdol[];
  customArtifacts: CustomArtifact[];
  customTitles: CustomTitle[];
  lastUpdated: number;
  version: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'cloud_store.json');

// In-memory cache for ultra-fast access
let memoryStore: CloudStoreData | null = null;

function getInitialStore(): CloudStoreData {
  return {
    accounts: [...SEED_ACCOUNTS],
    customFrames: [...DEFAULT_FRAMES],
    dharmaIdols: [...DEFAULT_DHARMA_IDOLS],
    customArtifacts: [...DEFAULT_ARTIFACTS],
    customTitles: [...DEFAULT_CUSTOM_TITLES],
    lastUpdated: Date.now(),
    version: '1.3.1',
  };
}

export function loadServerCloudStore(): CloudStoreData {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content) as CloudStoreData;
      if (parsed && Array.isArray(parsed.accounts)) {
        // Ensure Admin and Default user exist
        const hasAdmin = parsed.accounts.some((a) => a.id === ADMIN_USER.id || a.username === ADMIN_USER.username);
        if (!hasAdmin) parsed.accounts.unshift(ADMIN_USER);

        const hasDefault = parsed.accounts.some((a) => a.id === DEFAULT_USER.id || a.username === DEFAULT_USER.username);
        if (!hasDefault) parsed.accounts.push(DEFAULT_USER);

        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch (err) {
    console.error('[CloudStore] Error reading store from disk:', err);
  }

  memoryStore = getInitialStore();
  saveServerCloudStore(memoryStore);
  return memoryStore;
}

export function saveServerCloudStore(data: CloudStoreData): void {
  memoryStore = {
    ...data,
    lastUpdated: Date.now(),
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CloudStore] Error writing store to disk:', err);
  }
}

// Helpers for specific entities
export function upsertAccountInServer(account: UserAccount): UserAccount {
  const store = loadServerCloudStore();
  const index = store.accounts.findIndex(
    (a) => a.id === account.id || a.username.toLowerCase() === account.username.toLowerCase()
  );

  if (index >= 0) {
    // Merge existing account preserving stats if newer
    store.accounts[index] = {
      ...store.accounts[index],
      ...account,
      lastActive: Date.now(),
    };
  } else {
    store.accounts.push({
      ...account,
      lastActive: Date.now(),
    });
  }

  saveServerCloudStore(store);
  return store.accounts[index >= 0 ? index : store.accounts.length - 1];
}

export function upsertFramesInServer(frames: CustomFrame[]): CustomFrame[] {
  const store = loadServerCloudStore();
  // Merge frames by ID
  const map = new Map<string, CustomFrame>();
  store.customFrames.forEach((f) => map.set(f.id, f));
  frames.forEach((f) => map.set(f.id, f));

  store.customFrames = Array.from(map.values());
  saveServerCloudStore(store);
  return store.customFrames;
}

export function upsertDharmaInServer(idols: DharmaIdol[]): DharmaIdol[] {
  const store = loadServerCloudStore();
  const map = new Map<string, DharmaIdol>();
  store.dharmaIdols.forEach((d) => map.set(d.id, d));
  idols.forEach((d) => map.set(d.id, d));

  store.dharmaIdols = Array.from(map.values());
  saveServerCloudStore(store);
  return store.dharmaIdols;
}

export function upsertArtifactsInServer(artifacts: CustomArtifact[]): CustomArtifact[] {
  const store = loadServerCloudStore();
  const map = new Map<string, CustomArtifact>();
  store.customArtifacts.forEach((a) => map.set(a.id, a));
  artifacts.forEach((a) => map.set(a.id, a));

  store.customArtifacts = Array.from(map.values());
  saveServerCloudStore(store);
  return store.customArtifacts;
}

export function upsertTitlesInServer(titles: CustomTitle[]): CustomTitle[] {
  const store = loadServerCloudStore();
  const map = new Map<string, CustomTitle>();
  store.customTitles.forEach((t) => map.set(t.id, t));
  titles.forEach((t) => map.set(t.id, t));

  store.customTitles = Array.from(map.values());
  saveServerCloudStore(store);
  return store.customTitles;
}
