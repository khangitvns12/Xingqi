'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { CULTIVATION_REALMS, DAOIST_TITLES, getRealmByLevel } from '../cultivation/realms';
import { GamePlayer, GameRoom } from '../xiangqi/types';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role?: 'admin' | 'user';
  isGuest?: boolean;
  daoName: string; // Đạo Hiệu
  sect: string;    // Tông Môn
  avatarUrl: string;
  elo: number;
  realmLevel: number;
  exp: number;
  spiritStones: number;
  pills: Record<string, number>;
  selectedTitleId: string;
  selectedAvatarId: string;
  selectedFrameId?: string; // Custom frame id
  unlockedFrameIds?: string[];
  selectedDharmaId?: string; // Pháp Tướng id (supports GIF/WebP)
  unlockedDharmaIds?: string[];
  selectedArtifactId?: string; // Pháp Bảo id (supports GIF/WebP)
  unlockedArtifactIds?: string[];
  unlockedTitleIds: string[];
  unlockedAvatarIds: string[];
  isBanned?: boolean;
  banReason?: string;
  isOnline?: boolean;
  lastActive?: number;
  stats: {
    totalMatches: number;
    wins: number;
    draws: number;
    losses: number;
    winStreak: number;
    maxWinStreak: number;
    highestElo: number;
  };
  createdAt: number;
}

export const ADMIN_USER: UserAccount = {
  id: 'user_admin',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  daoName: 'Thiên Đạo Chấp Pháp (Admin)',
  sect: 'Thiên Đạo Chấp Pháp Các',
  avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=250&auto=format&fit=crop&q=80',
  elo: 3000,
  realmLevel: 10,
  exp: 99999,
  spiritStones: 999999,
  pills: {
    'Tụ Khí Đan': 99,
    'Trúc Cơ Đan': 99,
    'Hàng Long Kim Đan': 99,
    'Cửu Chuyển Hoàn Hồn Đan': 99,
  },
  selectedTitleId: 'title_10',
  selectedAvatarId: 'av_10',
  selectedFrameId: 'frame_celestial_gold',
  selectedDharmaId: 'dharma_chaos_emperor',
  selectedArtifactId: 'art_dong_hoang_chung',
  unlockedTitleIds: DAOIST_TITLES.map((t) => t.id),
  unlockedAvatarIds: ['av_1', 'av_2', 'av_3', 'av_4', 'av_5', 'av_6', 'av_7', 'av_8', 'av_9', 'av_10'],
  unlockedFrameIds: ['frame_celestial_gold', 'frame_purple_thunder', 'frame_emerald_lotus', 'frame_phoenix_fire', 'frame_ice_crystal'],
  unlockedDharmaIds: ['dharma_chaos_emperor', 'dharma_sword_god', 'dharma_nine_tails', 'dharma_dragon_emperor', 'dharma_asura'],
  unlockedArtifactIds: ['art_dong_hoang_chung', 'art_chu_tien_kiem', 'art_bat_quai_kinh', 'art_ngoc_tinh_binh'],
  isOnline: true,
  lastActive: Date.now(),
  stats: {
    totalMatches: 999,
    wins: 990,
    draws: 8,
    losses: 1,
    winStreak: 88,
    maxWinStreak: 88,
    highestElo: 3000,
  },
  createdAt: Date.now() - 86400000 * 30,
};

export const DEFAULT_USER: UserAccount = {
  id: 'user_main',
  username: 'daohuuxian',
  password: '123',
  role: 'user',
  isGuest: false,
  daoName: 'Thanh Vân Cư Sĩ',
  sect: 'Tiên Kỳ Các',
  avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  elo: 1250,
  realmLevel: 2,
  exp: 280,
  spiritStones: 860,
  pills: {
    'Tụ Khí Đan': 5,
    'Trúc Cơ Đan': 2,
    'Hàng Long Kim Đan': 1,
  },
  selectedTitleId: 'title_2',
  selectedAvatarId: 'av_3',
  selectedFrameId: 'frame_emerald_lotus',
  selectedDharmaId: 'dharma_sword_god',
  selectedArtifactId: 'art_ngoc_tinh_binh',
  unlockedTitleIds: ['title_1', 'title_2'],
  unlockedAvatarIds: ['av_1', 'av_2', 'av_3'],
  unlockedFrameIds: ['frame_emerald_lotus'],
  unlockedDharmaIds: ['dharma_sword_god'],
  unlockedArtifactIds: ['art_ngoc_tinh_binh'],
  isOnline: true,
  lastActive: Date.now(),
  stats: {
    totalMatches: 14,
    wins: 9,
    draws: 2,
    losses: 3,
    winStreak: 3,
    maxWinStreak: 5,
    highestElo: 1280,
  },
  createdAt: Date.now() - 86400000 * 7,
};

export const GUEST_USER: UserAccount = {
  id: 'guest_user',
  username: 'khach_vang_lai',
  role: 'user',
  isGuest: true,
  daoName: 'Khách Vãng Lai',
  sect: 'Tán Tu Phàm Giới',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  elo: 1000,
  realmLevel: 1,
  exp: 0,
  spiritStones: 100,
  pills: {
    'Tụ Khí Đan': 1,
  },
  selectedTitleId: 'title_1',
  selectedAvatarId: 'av_1',
  unlockedTitleIds: ['title_1'],
  unlockedAvatarIds: ['av_1'],
  unlockedFrameIds: [],
  unlockedDharmaIds: [],
  isOnline: true,
  lastActive: Date.now(),
  stats: {
    totalMatches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    winStreak: 0,
    maxWinStreak: 0,
    highestElo: 1000,
  },
  createdAt: Date.now(),
};

export const SEED_ACCOUNTS: UserAccount[] = [
  ADMIN_USER,
  DEFAULT_USER,
  {
    id: 'user_kiem_ma',
    username: 'kiem_ma_99',
    role: 'user',
    daoName: 'Độc Cô Kiếm Ma',
    sect: 'Vạn Ma Thần Điện',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    elo: 2050,
    realmLevel: 5,
    exp: 720,
    spiritStones: 3400,
    pills: { 'Tụ Khí Đan': 10, 'Hàng Long Kim Đan': 4 },
    selectedTitleId: 'title_5',
    selectedAvatarId: 'av_5',
    selectedFrameId: 'frame_purple_thunder',
    selectedDharmaId: 'dharma_asura',
    unlockedTitleIds: ['title_1', 'title_2', 'title_5'],
    unlockedAvatarIds: ['av_1', 'av_5'],
    unlockedFrameIds: ['frame_purple_thunder'],
    unlockedDharmaIds: ['dharma_asura'],
    isOnline: true,
    lastActive: Date.now() - 60000 * 3,
    stats: { totalMatches: 198, wins: 152, draws: 10, losses: 36, winStreak: 5, maxWinStreak: 12, highestElo: 2110 },
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'user_bang_phach',
    username: 'bang_phach',
    role: 'user',
    daoName: 'Băng Phách Tiên Cơ',
    sect: 'Hàn Băng Thần Cung',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    elo: 1780,
    realmLevel: 4,
    exp: 450,
    spiritStones: 1950,
    pills: { 'Tụ Khí Đan': 8, 'Trúc Cơ Đan': 5 },
    selectedTitleId: 'title_4',
    selectedAvatarId: 'av_4',
    selectedFrameId: 'frame_ice_crystal',
    selectedDharmaId: 'dharma_nine_tails',
    unlockedTitleIds: ['title_1', 'title_4'],
    unlockedAvatarIds: ['av_1', 'av_4'],
    unlockedFrameIds: ['frame_ice_crystal'],
    unlockedDharmaIds: ['dharma_nine_tails'],
    isOnline: true,
    lastActive: Date.now() - 60000 * 7,
    stats: { totalMatches: 142, wins: 105, draws: 8, losses: 29, winStreak: 4, maxWinStreak: 9, highestElo: 1820 },
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'user_bach_van',
    username: 'bach_van_dd',
    role: 'user',
    daoName: 'Bạch Vân Đạo Đồng',
    sect: 'Thanh Vân Tông',
    avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    elo: 1120,
    realmLevel: 1,
    exp: 150,
    spiritStones: 450,
    pills: { 'Tụ Khí Đan': 2 },
    selectedTitleId: 'title_1',
    selectedAvatarId: 'av_1',
    unlockedTitleIds: ['title_1'],
    unlockedAvatarIds: ['av_1'],
    unlockedFrameIds: [],
    unlockedDharmaIds: [],
    isOnline: true,
    lastActive: Date.now() - 60000 * 1,
    stats: { totalMatches: 22, wins: 13, draws: 1, losses: 8, winStreak: 2, maxWinStreak: 3, highestElo: 1150 },
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'user_tu_tieu',
    username: 'tu_tieu_ton',
    role: 'user',
    daoName: 'Tử Tiêu Kiếm Tôn',
    sect: 'Thiên Đao Tông',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    elo: 1580,
    realmLevel: 3,
    exp: 310,
    spiritStones: 1200,
    pills: { 'Trúc Cơ Đan': 3 },
    selectedTitleId: 'title_3',
    selectedAvatarId: 'av_3',
    unlockedTitleIds: ['title_1', 'title_3'],
    unlockedAvatarIds: ['av_1', 'av_3'],
    unlockedFrameIds: [],
    unlockedDharmaIds: [],
    isOnline: false,
    lastActive: Date.now() - 3600000 * 6,
    stats: { totalMatches: 96, wins: 68, draws: 6, losses: 22, winStreak: 0, maxWinStreak: 7, highestElo: 1610 },
    createdAt: Date.now() - 86400000 * 18,
  },
];

const STORAGE_KEY = 'tien_ky_dao_user_v1';
const ACCOUNTS_STORAGE_KEY = 'tien_ky_dao_accounts_v1';

const KICKED_KEY = 'tien_ky_kicked_users_v1';

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
      cachedUser = raw ? JSON.parse(raw) : GUEST_USER;
    }
  } catch {
    return GUEST_USER;
  }
  return cachedUser;
}

export function getServerUserSnapshot(): UserAccount {
  return GUEST_USER;
}

export function getOnlineAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const accounts = loadAllAccounts();
    return accounts.filter((a) => a.isOnline);
  } catch {
    return [];
  }
}

export function getOnlineUsersCount(): number {
  if (typeof window === 'undefined') return 18;
  try {
    const accounts = loadAllAccounts();
    const onlineRegistered = accounts.filter((a) => a.isOnline).length;
    // Active cultivators in realm (registered online + active daoist disciples)
    return Math.max(15, onlineRegistered + 18);
  } catch {
    return 18;
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
        accounts[idx] = { ...accounts[idx], isOnline: false, lastActive: Date.now() };
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      }
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
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return DEFAULT_USER;
}

export function saveUserProfile(user: UserAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = JSON.stringify(user);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedUserRaw = raw;
    cachedUser = user;

    // Sync to accounts list if not guest
    if (!user.isGuest && user.id !== GUEST_USER.id) {
      const accounts = loadAllAccounts();
      const idx = accounts.findIndex((a) => a.id === user.id);
      const updatedAccount: UserAccount = {
        ...user,
        isOnline: true,
        lastActive: Date.now(),
      };
      if (idx >= 0) {
        accounts[idx] = updatedAccount;
      } else {
        accounts.push(updatedAccount);
      }
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    }
    notifyUserChange();
  } catch {
    // fallback
  }
}

export function loadAllAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return SEED_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed: UserAccount[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure admin account is present
        const hasAdmin = parsed.some((a) => a.username === 'admin');
        if (!hasAdmin) {
          parsed.unshift(ADMIN_USER);
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
    // First time init
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
    return SEED_ACCOUNTS;
  } catch {
    // fallback
  }
  return SEED_ACCOUNTS;
}

export function saveAllAccounts(accounts: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // fallback
  }
}

export function updateUserByAdmin(userId: string, data: Partial<UserAccount>): UserAccount | null {
  const accounts = loadAllAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx < 0) return null;

  const updated: UserAccount = {
    ...accounts[idx],
    ...data,
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

  const remaining = accounts.filter((a) => a.id !== userId);
  saveAllAccounts(remaining);
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
  const registeredAccounts = loadAllAccounts().filter((a) => !a.isBanned);

  const baseMasters: Omit<LeaderboardEntry, 'rank'>[] = [
    {
      id: 'master_1',
      name: 'Cửu Thiên Tiên Đế',
      title: 'Vô Thượng Tiên Đế',
      sect: 'Hỗn Độn Tiên Cung',
      realm: 'Vô Thượng Tiên Đế',
      realmLevel: 10,
      elo: 2890,
      wins: 482,
      winRate: 91,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'master_2',
      name: 'Hỗn Độn Kiếm Tôn',
      title: 'Thiên Kiếp Kiếm Tôn',
      sect: 'Vạn Kiếm Quy Tông',
      realm: 'Độ Kiếp Kỳ',
      realmLevel: 9,
      elo: 2640,
      wins: 395,
      winRate: 86,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'master_3',
      name: 'Bắc Minh Lão Tổ',
      title: 'Bất Bại Thần Vương',
      sect: 'Bắc Minh Hải Các',
      realm: 'Đại Thừa Kỳ',
      realmLevel: 8,
      elo: 2430,
      wins: 310,
      winRate: 82,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Thái Hư Đạo Nhân',
      title: 'Lưỡng Nghi Tông Sư',
      sect: 'Thái Hư Quán',
      realm: 'Hợp Thể Kỳ',
      realmLevel: 7,
      elo: 2280,
      wins: 254,
      winRate: 79,
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Độc Cô Kiếm Ma',
      title: 'Thần Toán Chân Quân',
      sect: 'Vạn Ma Thần Điện',
      realm: 'Hóa Thần Kỳ',
      realmLevel: 5,
      elo: 2050,
      wins: 198,
      winRate: 76,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Băng Phách Tiên Cơ',
      title: 'Cửu Tiêu Kiếm Tiên',
      sect: 'Hàn Băng Thần Cung',
      realm: 'Nguyên Anh Kỳ',
      realmLevel: 4,
      elo: 1780,
      wins: 142,
      winRate: 74,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Tử Tiêu Kiếm Tôn',
      title: 'Diệu Thủ Đan Tâm',
      sect: 'Thiên Đao Tông',
      realm: 'Kim Đan Kỳ',
      realmLevel: 3,
      elo: 1580,
      wins: 96,
      winRate: 71,
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Thanh Phong Trưởng Lão',
      title: 'Bạch Vân Kỳ Sĩ',
      sect: 'Thục Sơn Kiếm Phái',
      realm: 'Trúc Cơ Kỳ',
      realmLevel: 2,
      elo: 1350,
      wins: 68,
      winRate: 67,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Bạch Vân Đạo Đồng',
      title: 'Kỳ Đạo Đạo Đồng',
      sect: 'Thanh Vân Tông',
      realm: 'Luyện Khí Kỳ',
      realmLevel: 1,
      elo: 1120,
      wins: 22,
      winRate: 58,
      avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    },
  ];

  // User entry
  const userRealm = getRealmByLevel(currentUser.realmLevel);
  const userTitle = DAOIST_TITLES.find((t) => t.id === currentUser.selectedTitleId)?.name || 'Kỳ Đạo Đạo Đồng';
  const totalMatches = currentUser.stats.totalMatches || 1;
  const userWinRate = Math.round((currentUser.stats.wins / totalMatches) * 100);

  const userEntry: Omit<LeaderboardEntry, 'rank'> = {
    id: currentUser.id,
    name: currentUser.daoName,
    title: userTitle,
    sect: currentUser.sect,
    realm: userRealm.name,
    realmLevel: currentUser.realmLevel,
    elo: currentUser.elo,
    wins: currentUser.stats.wins,
    winRate: userWinRate,
    avatarUrl: currentUser.avatarUrl,
    isCurrentUser: true,
    account: currentUser,
  };

  // Convert other registered accounts into entries
  const otherRegisteredEntries: Omit<LeaderboardEntry, 'rank'>[] = registeredAccounts
    .filter((a) => a.id !== currentUser.id && a.id !== GUEST_USER.id)
    .map((acc) => {
      const realm = getRealmByLevel(acc.realmLevel);
      const title = DAOIST_TITLES.find((t) => t.id === acc.selectedTitleId)?.name || 'Kỳ Đạo Tu Sĩ';
      const mCount = acc.stats.totalMatches || 1;
      return {
        id: acc.id,
        name: acc.daoName,
        title,
        sect: acc.sect,
        realm: realm.name,
        realmLevel: acc.realmLevel,
        elo: acc.elo,
        wins: acc.stats.wins,
        winRate: Math.round((acc.stats.wins / mCount) * 100),
        avatarUrl: acc.avatarUrl,
        account: acc,
      };
    });

  const all = [...baseMasters, ...otherRegisteredEntries, userEntry];
  all.sort((a, b) => b.elo - a.elo);

  return all.map((entry, index) => ({
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
    version: 'v1.3.0',
    releaseDate: 'Dự kiến 10/2026',
    title: 'Đại Chiến Tông Môn & Cờ Thế Thượng Cổ',
    status: 'upcoming',
    highlights: [
      'Chế độ Bang Hội Tông Môn: Thách đấu lãnh địa giữa các tiên môn.',
      'Thần Binh Bàn Cờ: Mở khóa bàn cờ Ngọc Bích Thượng Cổ, Bát Quái Đồ.',
      'Phó bản Phá Cờ Thế: 50+ ván cờ tàn danh gia tu tiên để nhận Linh Thạch & Đan Dược hiếm.',
      'Chế độ Voice Chat Đàm Đạo Tiên Giới trực tiếp trong bàn đấu.',
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
