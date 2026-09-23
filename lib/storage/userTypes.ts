import { DAOIST_TITLES } from '../cultivation/realms';

export interface UserStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  winStreak: number;
  maxWinStreak: number;
  highestElo: number;
}

export const DEFAULT_USER_STATS: UserStats = {
  totalMatches: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  winStreak: 0,
  maxWinStreak: 0,
  highestElo: 1200,
};

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
  updatedAt?: number;
  stats: UserStats;
  createdAt: number;
}

export interface SystemConfig {
  id: string;
  defaultAvatarUrl: string;
  defaultAvatarId: string;
  defaultFrameId?: string;
  defaultDharmaId?: string;
  defaultArtifactId?: string;
  defaultTitleId: string;
  defaultSpiritStones: number;
  defaultElo: number;
  defaultRealmLevel: number;
  defaultPills: Record<string, number>;
  lastUpdated: number;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  id: 'system_config',
  defaultAvatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  defaultAvatarId: 'av_1',
  defaultFrameId: '',
  defaultDharmaId: '',
  defaultArtifactId: '',
  defaultTitleId: 'title_1',
  defaultSpiritStones: 200,
  defaultElo: 1200,
  defaultRealmLevel: 1,
  defaultPills: { 'Tụ Khí Đan': 3 },
  lastUpdated: 1700000000000,
};

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
  lastActive: 1700000000000,
  updatedAt: 1700000000000,
  stats: {
    totalMatches: 999,
    wins: 990,
    draws: 8,
    losses: 1,
    winStreak: 250,
    maxWinStreak: 250,
    highestElo: 3000,
  },
  createdAt: 1700000000000,
};

export const DEFAULT_USER: UserAccount = {
  id: 'user_main',
  username: 'daohuuxian',
  password: '123',
  role: 'user',
  daoName: 'Thanh Hư Đạo Nhân',
  sect: 'Cửu Châu Tiên Môn',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  elo: 1250,
  realmLevel: 2,
  exp: 420,
  spiritStones: 580,
  pills: {
    'Tụ Khí Đan': 5,
    'Trúc Cơ Đan': 2,
  },
  selectedTitleId: 'title_2',
  selectedAvatarId: 'av_2',
  selectedFrameId: 'frame_emerald_lotus',
  selectedDharmaId: 'dharma_sword_god',
  selectedArtifactId: 'art_bat_quai_kinh',
  unlockedTitleIds: ['title_1', 'title_2'],
  unlockedAvatarIds: ['av_1', 'av_2', 'av_3'],
  unlockedFrameIds: ['frame_emerald_lotus'],
  unlockedDharmaIds: ['dharma_sword_god'],
  unlockedArtifactIds: ['art_bat_quai_kinh'],
  isOnline: true,
  lastActive: 1700000000000,
  updatedAt: 1700000000000,
  stats: {
    totalMatches: 45,
    wins: 28,
    draws: 5,
    losses: 12,
    winStreak: 3,
    maxWinStreak: 6,
    highestElo: 1290,
  },
  createdAt: 1700000000000,
};

export const GUEST_USER: UserAccount = {
  id: 'user_guest',
  username: 'khach_vang_lai',
  role: 'user',
  isGuest: true,
  daoName: 'Khách Vãng Lai',
  sect: 'Tán Tu Cửu Châu',
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
  unlockedArtifactIds: [],
  isOnline: false,
  lastActive: 1700000000000,
  updatedAt: 1700000000000,
  stats: {
    totalMatches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    winStreak: 0,
    maxWinStreak: 0,
    highestElo: 1000,
  },
  createdAt: 1700000000000,
};

export const BOT_USER_IDS = new Set([
  'user_kiem_ma',
  'user_bang_phach',
  'user_bach_van',
  'user_tu_tieu',
  'user_test_persistence',
]);

export const SEED_ACCOUNTS: UserAccount[] = [
  ADMIN_USER,
  DEFAULT_USER,
];

export const STORAGE_KEY = 'tien_ky_dao_user_v1';
export const ACCOUNTS_STORAGE_KEY = 'tien_ky_dao_accounts_v1';
export const SYSTEM_CONFIG_KEY = 'tien_ky_system_config_v1';
export const KICKED_KEY = 'tien_ky_kicked_users_v1';

export function sanitizeUserAccount(raw: any): UserAccount {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_USER };
  }
  const rawStats = raw.stats || {};
  const wins = Number(rawStats.wins) || 0;
  const draws = Number(rawStats.draws) || 0;
  const losses = Number(rawStats.losses) || 0;
  const computedTotal =
    typeof rawStats.totalMatches === 'number'
      ? rawStats.totalMatches
      : wins + draws + losses;
  const elo = typeof raw.elo === 'number' ? raw.elo : 1200;

  const stats: UserStats = {
    totalMatches: computedTotal,
    wins,
    draws,
    losses,
    winStreak: Number(rawStats.winStreak) || 0,
    maxWinStreak: Number(rawStats.maxWinStreak) || (Number(rawStats.winStreak) || 0),
    highestElo: Math.max(Number(rawStats.highestElo) || elo, elo),
  };

  return {
    id: raw.id || 'user_' + Date.now(),
    username: raw.username || 'daohuuxian',
    password: raw.password || '',
    role: raw.role === 'admin' ? 'admin' : 'user',
    isGuest: Boolean(raw.isGuest),
    daoName: raw.daoName || 'Kỳ Hữu Vô Danh',
    sect: raw.sect || 'Tán Tu Phàm Giới',
    avatarUrl: raw.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    elo,
    realmLevel: typeof raw.realmLevel === 'number' ? raw.realmLevel : 1,
    exp: typeof raw.exp === 'number' ? raw.exp : 0,
    spiritStones: typeof raw.spiritStones === 'number' ? raw.spiritStones : 200,
    pills: raw.pills && typeof raw.pills === 'object' ? raw.pills : { 'Tụ Khí Đan': 3 },
    selectedTitleId: raw.selectedTitleId || 'title_1',
    selectedAvatarId: raw.selectedAvatarId || 'av_1',
    selectedFrameId: raw.selectedFrameId || '',
    unlockedFrameIds: Array.isArray(raw.unlockedFrameIds) ? raw.unlockedFrameIds : [],
    selectedDharmaId: raw.selectedDharmaId || '',
    unlockedDharmaIds: Array.isArray(raw.unlockedDharmaIds) ? raw.unlockedDharmaIds : [],
    selectedArtifactId: raw.selectedArtifactId || '',
    unlockedArtifactIds: Array.isArray(raw.unlockedArtifactIds) ? raw.unlockedArtifactIds : [],
    unlockedTitleIds: Array.isArray(raw.unlockedTitleIds) ? raw.unlockedTitleIds : ['title_1'],
    unlockedAvatarIds: Array.isArray(raw.unlockedAvatarIds) ? raw.unlockedAvatarIds : ['av_1'],
    isBanned: Boolean(raw.isBanned),
    banReason: raw.banReason || '',
    isOnline: Boolean(raw.isOnline),
    lastActive: raw.lastActive || Date.now(),
    updatedAt: raw.updatedAt || Date.now(),
    stats,
    createdAt: raw.createdAt || Date.now(),
  };
}
