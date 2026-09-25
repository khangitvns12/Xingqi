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
    accounts: [], // Đạo tịch (tài khoản/mật khẩu) tuyệt đối không lưu trên máy chủ
    customFrames: [...DEFAULT_FRAMES],
    dharmaIdols: [...DEFAULT_DHARMA_IDOLS],
    customArtifacts: [...DEFAULT_ARTIFACTS],
    customTitles: [...DEFAULT_CUSTOM_TITLES],
    systemConfig: { ...DEFAULT_SYSTEM_CONFIG },
    lastUpdated: Date.now(),
    version: '1.5.0',
    isEncrypted: true,
  };
}

export function loadServerCloudStore(): CloudStoreData {
  if (memoryStore) {
    memoryStore.accounts = []; // Luôn đảm bảo rỗng trên máy chủ
    return memoryStore;
  }

  try {
    // 1. Try reading encrypted database first
    if (fs.existsSync(ENCRYPTED_DB_FILE)) {
      const decrypted = readEncryptedFile<CloudStoreData>(ENCRYPTED_DB_FILE);
      if (decrypted) {
        decrypted.accounts = []; // Xoá bỏ mọi đạo tịch đã lưu
        ensureRequiredDefaults(decrypted);
        memoryStore = decrypted;
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

function ensureRequiredDefaults(store: CloudStoreData): void {
  // Đạo tịch người dùng được lưu trữ an toàn 100% tại Client (LocalStorage & IndexedDB).
  // Máy chủ không lưu trữ tài khoản, mật khẩu hay đạo tịch cá nhân.
  store.accounts = [];

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
    accounts: [], // Bảo đảm an toàn bảo mật: Tuyệt đối không ghi thông tin tài khoản lên ổ cứng máy chủ
    isEncrypted: true,
    lastUpdated: Date.now(),
  };

  try {
    // Write AES-256-GCM encrypted database file (chỉ chứa vật phẩm, khung, tượng pháp, cấu hình)
    writeEncryptedFile(ENCRYPTED_DB_FILE, memoryStore);
  } catch (err) {
    console.error('[CloudStore] Error writing encrypted store to disk:', err);
  }
}

// Helpers for specific entities
export function upsertAccountInServer(account: UserAccount): UserAccount {
  // Không lưu đạo tịch người dùng lên máy chủ
  return sanitizeUserAccount(account);
}

export function batchUpsertAccountsInServer(accounts: UserAccount[]): UserAccount[] {
  // Không lưu đạo tịch người dùng lên máy chủ
  return accounts.map(sanitizeUserAccount);
}

export function deleteAccountInServer(_idOrUsername: string): boolean {
  return true;
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
