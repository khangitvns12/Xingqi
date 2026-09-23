import fs from 'fs';
import path from 'path';
import {
  UserAccount,
  ADMIN_USER,
  DEFAULT_USER,
  SEED_ACCOUNTS,
  SystemConfig,
  DEFAULT_SYSTEM_CONFIG,
  sanitizeUserAccount,
  BOT_USER_IDS,
} from '../storage/userTypes';
import {
  CustomFrame,
  DharmaIdol,
  CustomArtifact,
  CustomTitle,
  DEFAULT_FRAMES,
  DEFAULT_DHARMA_IDOLS,
  DEFAULT_ARTIFACTS,
  DEFAULT_CUSTOM_TITLES,
} from '../cultivation/shopTypes';
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
    if (Array.isArray(memoryStore.accounts)) {
      memoryStore.accounts = memoryStore.accounts.map(sanitizeUserAccount);
    }
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
  if (Array.isArray(store.accounts)) {
    store.accounts = store.accounts
      .map(sanitizeUserAccount)
      .filter(
        (a) =>
          !BOT_USER_IDS.has(a.id) &&
          !a.username.includes('kiem_ma') &&
          !a.username.includes('bang_phach') &&
          !a.username.includes('bach_van') &&
          !a.username.includes('tu_tieu')
      );
  } else {
    store.accounts = [...SEED_ACCOUNTS];
  }

  // Ensure Admin and Default user exist ONLY if not already present
  const hasAdmin = store.accounts.some((a) => a.id === ADMIN_USER.id || a.username.toLowerCase() === ADMIN_USER.username.toLowerCase());
  if (!hasAdmin) {
    store.accounts.unshift(sanitizeUserAccount({ ...ADMIN_USER }));
  }

  const hasDefault = store.accounts.some((a) => a.id === DEFAULT_USER.id || a.username.toLowerCase() === DEFAULT_USER.username.toLowerCase());
  if (!hasDefault) {
    store.accounts.push(sanitizeUserAccount({ ...DEFAULT_USER }));
  }

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

  const updatedAccount: UserAccount = sanitizeUserAccount({
    ...(index >= 0 ? store.accounts[index] : {}),
    ...account,
    updatedAt: account.updatedAt || Date.now(),
    lastActive: Date.now(),
  });

  if (index >= 0) {
    store.accounts[index] = updatedAccount;
  } else {
    store.accounts.push(updatedAccount);
  }

  saveServerCloudStore(store);
  return updatedAccount;
}

export function batchUpsertAccountsInServer(accounts: UserAccount[]): UserAccount[] {
  const store = loadServerCloudStore();
  const map = new Map<string, UserAccount>();

  store.accounts.forEach((a) => {
    const sanitized = sanitizeUserAccount(a);
    map.set(sanitized.id, sanitized);
    map.set(sanitized.username.toLowerCase(), sanitized);
  });

  accounts.forEach((acc) => {
    const existing = map.get(acc.id) || map.get(acc.username.toLowerCase());
    const merged: UserAccount = sanitizeUserAccount({
      ...(existing || {}),
      ...acc,
      updatedAt: acc.updatedAt || Date.now(),
      lastActive: Date.now(),
    });
    map.set(merged.id, merged);
  });

  // Unique list by id
  const dedupedMap = new Map<string, UserAccount>();
  Array.from(map.values()).forEach((acc) => dedupedMap.set(acc.id, acc));

  store.accounts = Array.from(dedupedMap.values());
  saveServerCloudStore(store);
  return store.accounts;
}

export function upsertFramesInServer(frames: CustomFrame[]): CustomFrame[] {
  const store = loadServerCloudStore();
  const map = new Map<string, CustomFrame>();
  store.customFrames.forEach((f) => map.set(f.id, f));
  frames.forEach((f) => {
    const existing = map.get(f.id);
    map.set(f.id, {
      ...(existing || {}),
      ...f,
      updatedAt: f.updatedAt || Date.now(),
    });
  });

  store.customFrames = Array.from(map.values());
  saveServerCloudStore(store);
  return store.customFrames;
}

export function upsertDharmaInServer(idols: DharmaIdol[]): DharmaIdol[] {
  const store = loadServerCloudStore();
  const map = new Map<string, DharmaIdol>();
  store.dharmaIdols.forEach((d) => map.set(d.id, d));
  idols.forEach((d) => {
    const existing = map.get(d.id);
    map.set(d.id, {
      ...(existing || {}),
      ...d,
      updatedAt: d.updatedAt || Date.now(),
    });
  });

  store.dharmaIdols = Array.from(map.values());
  saveServerCloudStore(store);
  return store.dharmaIdols;
}

export function upsertArtifactsInServer(artifacts: CustomArtifact[]): CustomArtifact[] {
  const store = loadServerCloudStore();
  const map = new Map<string, CustomArtifact>();
  store.customArtifacts.forEach((a) => map.set(a.id, a));
  artifacts.forEach((a) => {
    const existing = map.get(a.id);
    map.set(a.id, {
      ...(existing || {}),
      ...a,
      updatedAt: a.updatedAt || Date.now(),
    });
  });

  store.customArtifacts = Array.from(map.values());
  saveServerCloudStore(store);
  return store.customArtifacts;
}

export function upsertTitlesInServer(titles: CustomTitle[]): CustomTitle[] {
  const store = loadServerCloudStore();
  const map = new Map<string, CustomTitle>();
  store.customTitles.forEach((t) => map.set(t.id, t));
  titles.forEach((t) => {
    const existing = map.get(t.id);
    map.set(t.id, {
      ...(existing || {}),
      ...t,
      updatedAt: t.updatedAt || Date.now(),
    });
  });

  store.customTitles = Array.from(map.values());
  saveServerCloudStore(store);
  return store.customTitles;
}

export function deleteAccountInServer(accountId: string): UserAccount[] {
  const store = loadServerCloudStore();
  store.accounts = store.accounts.filter((a) => a.id !== accountId);
  saveServerCloudStore(store);
  return store.accounts;
}

export function deleteFrameInServer(frameId: string): CustomFrame[] {
  const store = loadServerCloudStore();
  store.customFrames = store.customFrames.filter((f) => f.id !== frameId);
  saveServerCloudStore(store);
  return store.customFrames;
}

export function replaceFramesInServer(frames: CustomFrame[]): CustomFrame[] {
  const store = loadServerCloudStore();
  store.customFrames = frames.map((f) => ({ ...f, updatedAt: Date.now() }));
  saveServerCloudStore(store);
  return store.customFrames;
}

export function deleteDharmaInServer(dharmaId: string): DharmaIdol[] {
  const store = loadServerCloudStore();
  store.dharmaIdols = store.dharmaIdols.filter((d) => d.id !== dharmaId);
  saveServerCloudStore(store);
  return store.dharmaIdols;
}

export function replaceDharmaInServer(dharmaIdols: DharmaIdol[]): DharmaIdol[] {
  const store = loadServerCloudStore();
  store.dharmaIdols = dharmaIdols.map((d) => ({ ...d, updatedAt: Date.now() }));
  saveServerCloudStore(store);
  return store.dharmaIdols;
}

export function deleteArtifactInServer(artifactId: string): CustomArtifact[] {
  const store = loadServerCloudStore();
  store.customArtifacts = store.customArtifacts.filter((a) => a.id !== artifactId);
  saveServerCloudStore(store);
  return store.customArtifacts;
}

export function replaceArtifactsInServer(artifacts: CustomArtifact[]): CustomArtifact[] {
  const store = loadServerCloudStore();
  store.customArtifacts = artifacts.map((a) => ({ ...a, updatedAt: Date.now() }));
  saveServerCloudStore(store);
  return store.customArtifacts;
}

export function deleteTitleInServer(titleId: string): CustomTitle[] {
  const store = loadServerCloudStore();
  store.customTitles = store.customTitles.filter((t) => t.id !== titleId);
  saveServerCloudStore(store);
  return store.customTitles;
}

export function replaceTitlesInServer(titles: CustomTitle[]): CustomTitle[] {
  const store = loadServerCloudStore();
  store.customTitles = titles.map((t) => ({ ...t, updatedAt: Date.now() }));
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
