'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { CULTIVATION_REALMS, DAOIST_TITLES, getRealmByLevel } from '../cultivation/realms';
import { GamePlayer, GameRoom } from '../xiangqi/types';

export type { UserAccount, SystemConfig } from './userTypes';
export {
  DEFAULT_SYSTEM_CONFIG,
  ADMIN_USER,
  DEFAULT_USER,
  GUEST_USER,
  SEED_ACCOUNTS,
  STORAGE_KEY,
  ACCOUNTS_STORAGE_KEY,
  SYSTEM_CONFIG_KEY,
  KICKED_KEY,
} from './userTypes';

import {
  UserAccount,
  SystemConfig,
  DEFAULT_SYSTEM_CONFIG,
  ADMIN_USER,
  DEFAULT_USER,
  GUEST_USER,
  SEED_ACCOUNTS,
  STORAGE_KEY,
  ACCOUNTS_STORAGE_KEY,
  SYSTEM_CONFIG_KEY,
  KICKED_KEY,
  sanitizeUserAccount,
  BOT_USER_IDS,
} from './userTypes';

let memorySystemConfig: SystemConfig | null = null;

export function loadSystemConfig(): SystemConfig {
  if (memorySystemConfig) return memorySystemConfig;
  if (typeof window === 'undefined') return DEFAULT_SYSTEM_CONFIG;
  try {
    const raw = localStorage.getItem(SYSTEM_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.defaultElo === 'number') {
        const conf: SystemConfig = { ...DEFAULT_SYSTEM_CONFIG, ...parsed };
        memorySystemConfig = conf;
        return conf;
      }
    }
  } catch {
    // fallback
  }
  memorySystemConfig = DEFAULT_SYSTEM_CONFIG;
  return DEFAULT_SYSTEM_CONFIG;
}

export function saveSystemConfig(config: Partial<SystemConfig>): SystemConfig {
  const current = loadSystemConfig();
  const updated: SystemConfig = {
    ...current,
    ...config,
    id: 'system_config',
    lastUpdated: Date.now(),
  };
  memorySystemConfig = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(updated));
      // Asynchronously push to server encrypted DB
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_SYSTEM_CONFIG', systemConfig: updated }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
  return updated;
}



type UserListener = () => void;
const userListeners = new Set<UserListener>();

export function subscribeUser(listener: UserListener): () => void {
  userListeners.add(listener);
  return () => {
    userListeners.delete(listener);
  };
}

export function notifyUserChange(): void {
  userListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

let cachedUserRaw: string | null = null;
let cachedUser: UserAccount = GUEST_USER;

export function getUserSnapshot(): UserAccount {
  if (typeof window === 'undefined') return GUEST_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedUserRaw) {
      cachedUserRaw = raw;
      cachedUser = raw ? sanitizeUserAccount(JSON.parse(raw)) : GUEST_USER;
    }
  } catch {
    return GUEST_USER;
  }
  return cachedUser;
}

export function getServerUserSnapshot(): UserAccount {
  return GUEST_USER;
}

export function getOnlineAccounts(currentUser?: UserAccount): UserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const accounts = loadAllAccounts();
    const now = Date.now();
    const seen = new Set<string>();
    const list: UserAccount[] = [];

    accounts.forEach((acc) => {
      if (acc.id === GUEST_USER.id) return;
      if (BOT_USER_IDS.has(acc.id)) return;
      if (seen.has(acc.id)) return;

      const isCurrent = Boolean(currentUser && acc.id === currentUser.id);
      const isRecentlyActive = Boolean(acc.lastActive && now - acc.lastActive < 20 * 60 * 1000);
      const isOnline = Boolean(acc.isOnline) || isRecentlyActive || isCurrent;

      if (isOnline) {
        seen.add(acc.id);
        list.push(acc);
      }
    });

    return list;
  } catch {
    return [];
  }
}

export function getOnlineUsersCount(currentUser?: UserAccount): number {
  if (typeof window === 'undefined') return 1;
  try {
    const list = getOnlineAccounts(currentUser);
    return Math.max(1, list.length);
  } catch {
    return 1;
  }
}

export function findAccountById(id: string): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const accounts = loadAllAccounts();
    return accounts.find((a) => a.id === id) || null;
  } catch {
    return null;
  }
}

export function findAccountByDaoName(daoName: string): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const accounts = loadAllAccounts();
    return accounts.find((a) => a.daoName.toLowerCase() === daoName.toLowerCase()) || null;
  } catch {
    return null;
  }
}

export function logoutUser(): UserAccount {
  if (typeof window === 'undefined') return GUEST_USER;
  try {
    const current = getUserSnapshot();
    if (current && current.id !== GUEST_USER.id) {
      const accounts = loadAllAccounts();
      const idx = accounts.findIndex((a) => a.id === current.id);
      if (idx >= 0) {
        const offAcc = { ...accounts[idx], isOnline: false, lastActive: Date.now() };
        accounts[idx] = offAcc;
        memoryAccounts = accounts;
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SYNC_ACCOUNT', account: offAcc }),
        }).catch(() => {});
      }
    }

    try {
      document.cookie = 'tkd_uid=; path=/; max-age=0; SameSite=Lax';
    } catch {
      // ignore
    }

    const raw = JSON.stringify(GUEST_USER);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedUserRaw = raw;
    cachedUser = GUEST_USER;
    notifyUserChange();
    return GUEST_USER;
  } catch {
    return GUEST_USER;
  }
}

export function useCurrentUser(): [
  UserAccount,
  (updated: Partial<UserAccount>) => void,
  (user: UserAccount) => void,
  () => UserAccount
] {
  const user = useSyncExternalStore(subscribeUser, getUserSnapshot, getServerUserSnapshot);

  const updateUser = useCallback((updated: Partial<UserAccount>) => {
    const current = getUserSnapshot();
    const next = { ...current, ...updated };
    saveUserProfile(next);
  }, []);

  const switchUser = useCallback((newUser: UserAccount) => {
    saveUserProfile(newUser);
  }, []);

  const logout = useCallback(() => {
    return logoutUser();
  }, []);

  return [user, updateUser, switchUser, logout];
}

export function loadUserProfile(): UserAccount {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return sanitizeUserAccount(JSON.parse(raw));
    }
  } catch {
    // fallback
  }
  return DEFAULT_USER;
}

export function saveUserProfile(user: UserAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    const sanitized = sanitizeUserAccount(user);
    const stampedUser: UserAccount = {
      ...sanitized,
      lastActive: now,
      updatedAt: now,
    };
    const raw = JSON.stringify(stampedUser);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedUserRaw = raw;
    cachedUser = stampedUser;

    // Sync to accounts list if not guest
    if (!stampedUser.isGuest && stampedUser.id !== GUEST_USER.id) {
      const accounts = loadAllAccounts();
      const idx = accounts.findIndex((a) => a.id === stampedUser.id);
      const updatedAccount: UserAccount = {
        ...stampedUser,
        isOnline: true,
      };
      if (idx >= 0) {
        accounts[idx] = updatedAccount;
      } else {
        accounts.push(updatedAccount);
      }
      memoryAccounts = accounts;
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));

      // Persist long-lived browser session cookie so cache clearance never wipes identity
      try {
        document.cookie = `tkd_uid=${encodeURIComponent(stampedUser.id)}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // ignore
      }

      // Asynchronously sync active account to cloud server
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_ACCOUNT', account: updatedAccount }),
      }).catch(() => {});

      // Heartbeat to multiplayer runtime
      fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'HEARTBEAT', user: updatedAccount, status: 'lobby' }),
      }).catch(() => {});
    }
    notifyUserChange();
  } catch {
    // fallback
  }
}

let memoryAccounts: UserAccount[] | null = null;

export function loadAllAccounts(): UserAccount[] {
  if (memoryAccounts) {
    return memoryAccounts
      .map(sanitizeUserAccount)
      .filter((a) => !BOT_USER_IDS.has(a.id) && !a.username.includes('kiem_ma') && !a.username.includes('bang_phach') && !a.username.includes('bach_van') && !a.username.includes('tu_tieu'));
  }
  if (typeof window === 'undefined') {
    return SEED_ACCOUNTS.map(sanitizeUserAccount);
  }
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed: UserAccount[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = parsed
          .map(sanitizeUserAccount)
          .filter((a) => !BOT_USER_IDS.has(a.id) && !a.username.includes('kiem_ma') && !a.username.includes('bang_phach') && !a.username.includes('bach_van') && !a.username.includes('tu_tieu'));
        // Ensure admin account is present
        const hasAdmin = sanitized.some((a) => a.username === 'admin');
        if (!hasAdmin) {
          sanitized.unshift(sanitizeUserAccount(ADMIN_USER));
        }
        memoryAccounts = sanitized;
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(sanitized));
        return sanitized;
      }
    }
    // First time init
    const initial = SEED_ACCOUNTS.map(sanitizeUserAccount);
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(initial));
    memoryAccounts = initial;
    return initial;
  } catch {
    // fallback
  }
  memoryAccounts = SEED_ACCOUNTS.map(sanitizeUserAccount);
  return memoryAccounts;
}

export function deleteAccount(userId: string): UserAccount[] {
  const current = loadAllAccounts();
  const updated = current.filter((a) => a.id !== userId);
  memoryAccounts = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_ACCOUNT', id: userId, accounts: updated }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
  return updated;
}

export function saveAllAccounts(accounts: UserAccount[]): void {
  memoryAccounts = accounts;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    // Asynchronously sync all accounts to cloud server
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'FULL_MERGE', payload: { accounts } }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

/**
 * Sync user accounts from cloud server.
 * Merges server accounts with local storage and updates current user if newer.
 */
export async function syncUserFromCloud(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.accounts)) return false;

    const localAccounts = loadAllAccounts();
    const map = new Map<string, UserAccount>();

    // Seed local accounts
    localAccounts.forEach((acc) => map.set(acc.id, acc));

    // Merge or overwrite with cloud accounts
    data.accounts.forEach((rawServerAcc: UserAccount) => {
      const serverAcc = sanitizeUserAccount(rawServerAcc);
      const local = map.get(serverAcc.id);
      if (!local) {
        map.set(serverAcc.id, serverAcc);
      } else {
        // Merge unlocked items sets so no unlocks on either device are lost
        const mergedUnlockedFrames = Array.from(new Set([...(local.unlockedFrameIds || []), ...(serverAcc.unlockedFrameIds || [])]));
        const mergedUnlockedDharma = Array.from(new Set([...(local.unlockedDharmaIds || []), ...(serverAcc.unlockedDharmaIds || [])]));
        const mergedUnlockedArtifacts = Array.from(new Set([...(local.unlockedArtifactIds || []), ...(serverAcc.unlockedArtifactIds || [])]));
        const mergedUnlockedTitles = Array.from(new Set([...(local.unlockedTitleIds || []), ...(serverAcc.unlockedTitleIds || [])]));
        const mergedUnlockedAvatars = Array.from(new Set([...(local.unlockedAvatarIds || []), ...(serverAcc.unlockedAvatarIds || [])]));

        // Check timestamps: server is only newer if strictly greater than local timestamp
        const serverTime = Math.max(serverAcc.updatedAt || 0, serverAcc.lastActive || 0);
        const localTime = Math.max(local.updatedAt || 0, local.lastActive || 0);
        const serverIsNewer = serverTime > localTime;
        const primary = serverIsNewer ? serverAcc : local;
        const secondary = serverIsNewer ? local : serverAcc;

        const mergedAccount = sanitizeUserAccount({
          ...secondary,
          ...primary,
          unlockedFrameIds: mergedUnlockedFrames,
          unlockedDharmaIds: mergedUnlockedDharma,
          unlockedArtifactIds: mergedUnlockedArtifacts,
          unlockedTitleIds: mergedUnlockedTitles,
          unlockedAvatarIds: mergedUnlockedAvatars,
          selectedFrameId: primary.selectedFrameId ?? secondary.selectedFrameId,
          selectedDharmaId: primary.selectedDharmaId ?? secondary.selectedDharmaId,
          selectedArtifactId: primary.selectedArtifactId ?? secondary.selectedArtifactId,
          selectedTitleId: primary.selectedTitleId ?? secondary.selectedTitleId,
          selectedAvatarId: primary.selectedAvatarId ?? secondary.selectedAvatarId,
          avatarUrl: primary.avatarUrl || secondary.avatarUrl,
          daoName: primary.daoName || secondary.daoName,
          sect: primary.sect || secondary.sect,
          spiritStones: Math.max(local.spiritStones || 0, serverAcc.spiritStones || 0),
          elo: primary.elo ?? secondary.elo,
          exp: Math.max(local.exp || 0, serverAcc.exp || 0),
          realmLevel: Math.max(local.realmLevel || 1, serverAcc.realmLevel || 1),
          pills: {
            ...(secondary.pills || {}),
            ...(primary.pills || {}),
          },
          updatedAt: Math.max(serverTime, localTime),
          lastActive: Math.max(serverTime, localTime),
        });

        map.set(serverAcc.id, mergedAccount);
      }
    });

    const mergedAccounts = Array.from(map.values());
    memoryAccounts = mergedAccounts;
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(mergedAccounts));

    // Check if currently active user was updated in cloud
    const current = getUserSnapshot();
    if (current && !current.isGuest && current.id !== GUEST_USER.id) {
      const matched = mergedAccounts.find((a) => a.id === current.id || a.username.toLowerCase() === current.username.toLowerCase());
      if (matched) {
        const raw = JSON.stringify(matched);
        localStorage.setItem(STORAGE_KEY, raw);
        cachedUserRaw = raw;
        cachedUser = matched;
        notifyUserChange();
      }
    }

    if (data.systemConfig && typeof data.systemConfig.defaultElo === 'number') {
      memorySystemConfig = { ...DEFAULT_SYSTEM_CONFIG, ...data.systemConfig };
      localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(memorySystemConfig));
    }

    return true;
  } catch (err) {
    console.warn('[Sync] Could not pull accounts from cloud:', err);
    return false;
  }
}

export function updateUserByAdmin(userId: string, data: Partial<UserAccount>): UserAccount | null {
  const accounts = loadAllAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx < 0) return null;

  const now = Date.now();
  const updated: UserAccount = {
    ...accounts[idx],
    ...data,
    updatedAt: now,
    lastActive: now,
  };
  accounts[idx] = updated;
  saveAllAccounts(accounts);

  // If current logged-in user is updated, sync active profile
  const current = loadUserProfile();
  if (current.id === userId) {
    saveUserProfile(updated);
  }

  return updated;
}

export function banUserByAdmin(userId: string, reason?: string): void {
  const accounts = loadAllAccounts();
  const acc = accounts.find((a) => a.id === userId);
  if (!acc) return;
  if (acc.role === 'admin' || acc.username === 'admin') return; // Cannot ban admin

  updateUserByAdmin(userId, {
    isBanned: true,
    banReason: reason?.trim() || 'Vi phạm Thiên Quy Tiên Giới / Dùng tà thuật gian lận cờ tướng',
  });
  // Also kick immediately
  kickUserByAdmin(userId);
}

export function unbanUserByAdmin(userId: string): void {
  updateUserByAdmin(userId, {
    isBanned: false,
    banReason: undefined,
  });
}

export function kickUserByAdmin(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KICKED_KEY);
    const kicked: Record<string, number> = raw ? JSON.parse(raw) : {};
    kicked[userId] = Date.now();
    localStorage.setItem(KICKED_KEY, JSON.stringify(kicked));
  } catch {
    // fallback
  }
}

export function checkUserKicked(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(KICKED_KEY);
    if (!raw) return false;
    const kicked: Record<string, number> = JSON.parse(raw);
    if (kicked[userId]) {
      // Clear kick flag once detected
      delete kicked[userId];
      localStorage.setItem(KICKED_KEY, JSON.stringify(kicked));
      return true;
    }
  } catch {
    // fallback
  }
  return false;
}

export function deleteUserByAdmin(userId: string): boolean {
  const accounts = loadAllAccounts();
  const target = accounts.find((a) => a.id === userId);
  if (!target || target.role === 'admin' || target.username === 'admin') return false;

  deleteAccount(userId);
  return true;
}

// Initial active rooms in the lobby
export const INITIAL_LOBBY_ROOMS: GameRoom[] = [
  {
    id: 'room_101',
    name: '☯️ Tiên Đạo Luận Kỳ (10 Phút)',
    hostId: 'ai_cult_2',
    hostName: 'Thanh Phong Trưởng Lão',
    hostRealm: 'Trúc Cơ Kỳ',
    hostElo: 1350,
    timeLimit: 10,
    increment: 5,
    isRanked: true,
    status: 'waiting',
    players: {
      red: {
        id: 'ai_cult_2',
        name: 'Thanh Phong Trưởng Lão',
        title: 'Bạch Vân Kỳ Sĩ',
        realm: 'Trúc Cơ Kỳ',
        realmLevel: 2,
        elo: 1350,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        frameColor: '#06b6d4',
        side: 'red',
        isAi: true,
        timeLeft: 600,
      },
    },
    spectatorCount: 4,
    createdAt: Date.now() - 120000,
  },
  {
    id: 'room_102',
    name: '⚡ Đao Kiếm Vô Tình - Cờ Chớp 5P',
    hostId: 'ai_cult_3',
    hostName: 'Tử Tiêu Kiếm Tôn',
    hostRealm: 'Kim Đan Kỳ',
    hostElo: 1580,
    timeLimit: 5,
    increment: 3,
    isRanked: true,
    status: 'waiting',
    players: {
      red: {
        id: 'ai_cult_3',
        name: 'Tử Tiêu Kiếm Tôn',
        title: 'Diệu Thủ Đan Tâm',
        realm: 'Kim Đan Kỳ',
        realmLevel: 3,
        elo: 1580,
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
        frameColor: '#f59e0b',
        side: 'red',
        isAi: true,
        timeLeft: 300,
      },
    },
    spectatorCount: 7,
    createdAt: Date.now() - 45000,
  },
  {
    id: 'room_103',
    name: '❄️ Hàn Băng Động Phủ - Luận Đạo Tự Do',
    hostId: 'ai_cult_4',
    hostName: 'Băng Phách Tiên Cơ',
    hostRealm: 'Nguyên Anh Kỳ',
    hostElo: 1780,
    timeLimit: 15,
    increment: 10,
    isRanked: false,
    status: 'waiting',
    players: {
      red: {
        id: 'ai_cult_4',
        name: 'Băng Phách Tiên Cơ',
        title: 'Cửu Tiêu Kiếm Tiên',
        realm: 'Nguyên Anh Kỳ',
        realmLevel: 4,
        elo: 1780,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        frameColor: '#a855f7',
        side: 'red',
        isAi: true,
        timeLeft: 900,
      },
    },
    spectatorCount: 12,
    createdAt: Date.now() - 180000,
  },
  {
    id: 'room_104',
    name: '🔥 Ma Đạo Trảm Long Đài (2000+ Elo)',
    hostId: 'ai_cult_5',
    hostName: 'Độc Cô Kiếm Ma',
    hostRealm: 'Hóa Thần Kỳ',
    hostElo: 2050,
    timeLimit: 10,
    increment: 5,
    isRanked: true,
    status: 'playing',
    players: {
      red: {
        id: 'ai_cult_5',
        name: 'Độc Cô Kiếm Ma',
        title: 'Thần Toán Chân Quân',
        realm: 'Hóa Thần Kỳ',
        realmLevel: 5,
        elo: 2050,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        frameColor: '#f43f5e',
        side: 'red',
        isAi: true,
        timeLeft: 480,
      },
      black: {
        id: 'rival_master',
        name: 'Huyền Thiên Chân Nhân',
        title: 'Bắc Minh Thần Quân',
        realm: 'Luyện Hư Kỳ',
        realmLevel: 6,
        elo: 2020,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        frameColor: '#38bdf8',
        side: 'black',
        isAi: true,
        timeLeft: 512,
      },
    },
    spectatorCount: 29,
    createdAt: Date.now() - 320000,
  },
];

// Leaderboard / Phong Thần Bảng
export interface LeaderboardEntry {
  id?: string;
  rank: number;
  name: string;
  title: string;
  sect: string;
  realm: string;
  realmLevel: number;
  elo: number;
  wins: number;
  winRate: number;
  avatarUrl: string;
  isCurrentUser?: boolean;
  account?: UserAccount;
}

export function generateLeaderboard(currentUser: UserAccount): LeaderboardEntry[] {
  const registeredAccounts = loadAllAccounts().filter(
    (a) => !a.isBanned && !BOT_USER_IDS.has(a.id) && !a.username.includes('kiem_ma') && !a.username.includes('bang_phach') && !a.username.includes('bach_van') && !a.username.includes('tu_tieu')
  );

  const safeCurrentUser = sanitizeUserAccount(currentUser);
  const isGuest = safeCurrentUser.id === GUEST_USER.id || safeCurrentUser.isGuest;

  // Convert registered accounts into entries
  const allEntries: Omit<LeaderboardEntry, 'rank'>[] = registeredAccounts.map((rawAcc) => {
    const acc = sanitizeUserAccount(rawAcc);
    const realm = getRealmByLevel(acc.realmLevel);
    const title = DAOIST_TITLES.find((t) => t.id === acc.selectedTitleId)?.name || 'Kỳ Đạo Tu Sĩ';
    const mCount = acc.stats?.totalMatches || 1;
    const wins = acc.stats?.wins || 0;
    const isCurrent = !isGuest && acc.id === safeCurrentUser.id;

    return {
      id: acc.id,
      name: acc.daoName,
      title,
      sect: acc.sect,
      realm: realm.name,
      realmLevel: acc.realmLevel,
      elo: acc.elo,
      wins,
      winRate: Math.round((wins / mCount) * 100),
      avatarUrl: acc.avatarUrl,
      isCurrentUser: isCurrent,
      account: acc,
    };
  });

  // If current logged-in user is not in registeredAccounts, add them
  if (!isGuest && !allEntries.some((e) => e.id === safeCurrentUser.id)) {
    const userRealm = getRealmByLevel(safeCurrentUser.realmLevel);
    const userTitle = DAOIST_TITLES.find((t) => t.id === safeCurrentUser.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng';
    const totalMatches = safeCurrentUser.stats?.totalMatches || 1;
    const userWins = safeCurrentUser.stats?.wins || 0;
    const userWinRate = Math.round((userWins / totalMatches) * 100);

    allEntries.push({
      id: safeCurrentUser.id,
      name: safeCurrentUser.daoName,
      title: userTitle,
      sect: safeCurrentUser.sect,
      realm: userRealm.name,
      realmLevel: safeCurrentUser.realmLevel,
      elo: safeCurrentUser.elo,
      wins: userWins,
      winRate: userWinRate,
      avatarUrl: safeCurrentUser.avatarUrl,
      isCurrentUser: true,
      account: safeCurrentUser,
    });
  }

  allEntries.sort((a, b) => b.elo - a.elo);

  return allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

// Patch Notes & Version Roadmap
export interface PatchNote {
  version: string;
  releaseDate: string;
  title: string;
  status: 'released' | 'upcoming';
  highlights: string[];
}

export const GAME_PATCH_NOTES: PatchNote[] = [
  {
    version: 'v1.3.0',
    releaseDate: '2026-09-22',
    title: 'Đại Đạo Quy Nhất - Chuẩn Hóa Mobile & Khung Avatar',
    status: 'released',
    highlights: [
      'Căn chỉnh chính xác tuyệt đối Avatar & Khung Viền: Loại bỏ hoàn toàn lỗi lệch tâm, đồng bộ scale và offset chuẩn xác ở mọi kích thước (SM, MD, LG, XL, 2XL).',
      'Tối ưu chuẩn HTML5 Mobile & Viewport: Thích ứng hoàn hảo mọi thiết bị iOS & Android, safe area insets, touch target tiêu chuẩn ≥44px.',
      'Bàn cờ Tiên Ngọc mượt mà trên di động: Khắc phục thanh cuộn, chống giật lác khi pinch-to-zoom và lật bàn cờ.',
      'Nâng cấp Tiên Các & Bảng Quản Trị Viên: Hỗ trợ nạp Linh Thạch, mua sắm Khung Tiên và Pháp Tướng thần thông.',
      'Tối ưu kích thước gói build tĩnh tương thích hoàn hảo Cloudflare Pages & Vercel.',
    ],
  },
  {
    version: 'v1.2.0',
    releaseDate: '2026-09-20',
    title: 'Tiên Duyên Khởi Sự - Kỳ Đạo Tái Khởi',
    status: 'released',
    highlights: [
      'Ra mắt hệ thống Sảnh Chờ Tiên Giới & Ghép cặp ELO thời gian thực.',
      'Cập nhật hiệu ứng kỹ năng bắt quân tiên hiệp: Cửu Thiên Lôi Đình, Tam Muội Chân Hỏa, Vạn Kiếm Quy Tông.',
      'Hệ thống 10 Cảnh Giới Tu Tiên & Đột Phá Lôi Kiếp từ Luyện Khí đến Vô Thượng Tiên Đế.',
      'Giao diện Profile với khung hào quang phát sáng xoay chuyển theo cảnh giới.',
      'Bảng Vàng Phong Thần (Leaderboard) theo dõi thứ hạng thiên kiêu tam giới.',
      'Tối ưu hóa đa nền tảng PC & Mobile với bàn cờ tỷ lệ chuẩn mượt mà.',
    ],
  },
  {
    version: 'v1.4.0',
    releaseDate: 'Dự kiến 11/2026',
    title: 'Vạn Tiên Hội Đạo - Giải Đấu Thiên Tôn',
    status: 'upcoming',
    highlights: [
      'Giải đấu PvP định kỳ hàng tuần với danh hiệu độc quyền "Vạn Giới Kỳ Thánh".',
      'Hệ thống xem trực tiếp ván đấu cao thủ với bình luận viên phân tích thế cờ.',
      'Tích hợp Thần Thú Giám Cờ (Kỳ Lân, Chu Tước) hỗ trợ đếm nước và gợi ý tàn cuộc.',
    ],
  },
];
