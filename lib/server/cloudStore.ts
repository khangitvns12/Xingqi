import fs from 'fs';
import path from 'path';
import {
  UserAccount,
  ADMIN_USER,
  DEFAULT_USER,
  SEED_ACCOUNTS,
  SystemConfig,
  DEFAULT_SYSTEM_CONFIG,
} from '../storage/userStore';
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
import { readEncryptedFile, writeEncryptedFile } from './encryptedDb';

export interface CloudStoreData {
  accounts: UserAccount[];
  customFrames: CustomFrame[];
  dharmaIdols: DharmaIdol[];
  customArtifacts: CustomArtifact[];
  customTitles: CustomTitle[];
  systemConfig: SystemConfig;
  lastUpdated: number;
  version: string;
  isEncrypted?: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
// Primary encrypted database file
const ENCRYPTED_DB_FILE = path.join(DATA_DIR, 'cloud_store.db.enc');
// Legacy unencrypted path for smooth migration
const LEGACY_DATA_FILE = path.join(DATA_DIR, 'cloud_store.json');

// In-memory cache for ultra-fast access
let memoryStore: CloudStoreData | null = null;

function getInitialStore(): CloudStoreData {
  return {
    accounts: [...SEED_ACCOUNTS],
    customFrames: [...DEFAULT_FRAMES],
    dharmaIdols: [...DEFAULT_DHARMA_IDOLS],
    customArtifacts: [...DEFAULT_ARTIFACTS],
    customTitles: [...DEFAULT_CUSTOM_TITLES],
    systemConfig: { ...DEFAULT_SYSTEM_CONFIG },
    lastUpdated: Date.now(),
    version: '1.4.0',
    isEncrypted: true,
  };
}

export function loadServerCloudStore(): CloudStoreData {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    // 1. Try reading encrypted database first
    if (fs.existsSync(ENCRYPTED_DB_FILE)) {
      const decrypted = readEncryptedFile<CloudStoreData>(ENCRYPTED_DB_FILE);
      if (decrypted && Array.isArray(decrypted.accounts)) {
        ensureRequiredDefaults(decrypted);
        memoryStore = decrypted;
        return memoryStore;
      }
    }

    // 2. Migration: If legacy plain JSON exists, read, migrate, and save encrypted!
    if (fs.existsSync(LEGACY_DATA_FILE)) {
      const content = fs.readFileSync(LEGACY_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content) as CloudStoreData;
      if (parsed && Array.isArray(parsed.accounts)) {
        ensureRequiredDefaults(parsed);
        memoryStore = parsed;
        // Save to encrypted db immediately
        saveServerCloudStore(memoryStore);
        try {
          // Backup legacy file as .bak
          fs.renameSync(LEGACY_DATA_FILE, `${LEGACY_DATA_FILE}.migrated.bak`);
        } catch {
          // ignore
        }
        return memoryStore;
      }
    }
  } catch (err) {
    console.error('[CloudStore] Error reading encrypted store from disk:', err);
  }

  memoryStore = getInitialStore();
  saveServerCloudStore(memoryStore);
  return memoryStore;
}

function ensureRequiredDefaults(store: CloudStoreData): void {
  // Ensure Admin and Default user exist
  const hasAdmin = store.accounts.some((a) => a.id === ADMIN_USER.id || a.username === ADMIN_USER.username);
  if (!hasAdmin) store.accounts.unshift(ADMIN_USER);

  const hasDefault = store.accounts.some((a) => a.id === DEFAULT_USER.id || a.username === DEFAULT_USER.username);
  if (!hasDefault) store.accounts.push(DEFAULT_USER);

  // Ensure systemConfig exists
  if (!store.systemConfig || typeof store.systemConfig.defaultElo !== 'number') {
    store.systemConfig = { ...DEFAULT_SYSTEM_CONFIG };
  }

  if (!Array.isArray(store.customFrames)) store.customFrames = [...DEFAULT_FRAMES];
  if (!Array.isArray(store.dharmaIdols)) store.dharmaIdols = [...DEFAULT_DHARMA_IDOLS];
  if (!Array.isArray(store.customArtifacts)) store.customArtifacts = [...DEFAULT_ARTIFACTS];
  if (!Array.isArray(store.customTitles)) store.customTitles = [...DEFAULT_CUSTOM_TITLES];
}

export function saveServerCloudStore(data: CloudStoreData): void {
  memoryStore = {
    ...data,
    isEncrypted: true,
    lastUpdated: Date.now(),
  };

  try {
    // Write AES-256-GCM encrypted database file
    writeEncryptedFile(ENCRYPTED_DB_FILE, memoryStore);
  } catch (err) {
    console.error('[CloudStore] Error writing encrypted store to disk:', err);
  }
}

// Helpers for specific entities
export function upsertAccountInServer(account: UserAccount): UserAccount {
  const store = loadServerCloudStore();
  const index = store.accounts.findIndex(
    (a) => a.id === account.id || a.username.toLowerCase() === account.username.toLowerCase()
  );

  if (index >= 0) {
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

export function updateSystemConfigInServer(config: Partial<SystemConfig>): SystemConfig {
  const store = loadServerCloudStore();
  store.systemConfig = {
    ...store.systemConfig,
    ...config,
    lastUpdated: Date.now(),
  };
  saveServerCloudStore(store);
  return store.systemConfig;
}
