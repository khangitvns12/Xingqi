export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  daoName: string;
  sect: string;
  avatarUrl: string;
  elo: number;
  realmLevel: number;
  exp: number;
  spiritStones: number;
  pills: Record<string, number>;
  selectedTitleId: string;
  selectedAvatarId: string;
  selectedFrameId?: string;
  selectedDharmaId?: string;
  selectedArtifactId?: string;
  unlockedTitleIds: string[];
  unlockedAvatarIds: string[];
  unlockedFrameIds: string[];
  unlockedDharmaIds?: string[];
  unlockedArtifactIds?: string[];
  isOnline?: boolean;
  lastActive: number;
  updatedAt: number;
  role?: 'admin' | 'user';
  isGuest?: boolean;
  isBanned?: boolean;
  banReason?: string;
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

export interface SystemConfig {
  id?: string;
  lastUpdated?: number;
  defaultSpiritStones: number;
  winRewardStones: number;
  drawRewardStones: number;
  lossRewardStones: number;
  winExp: number;
  drawExp: number;
  lossExp: number;
  eloBaseK: number;
  maintenanceMode: boolean;
  welcomeMessage: string;
  allowGuestMode: boolean;
  defaultAvatarUrl?: string;
  defaultAvatarId?: string;
  defaultFrameId?: string;
  defaultDharmaId?: string;
  defaultArtifactId?: string;
  defaultTitleId?: string;
  defaultElo?: number;
  defaultRealmLevel?: number;
  defaultPills?: Record<string, number>;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  id: 'system_config',
  lastUpdated: 1700000000000,
  defaultSpiritStones: 500,
  winRewardStones: 50,
  drawRewardStones: 15,
  lossRewardStones: 5,
  winExp: 150,
  drawExp: 50,
  lossExp: 30,
  eloBaseK: 32,
  maintenanceMode: false,
  welcomeMessage: 'Chào mừng các vị đạo hữu giá lâm Tiên Kỳ Đạo!',
  allowGuestMode: true,
  defaultAvatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  defaultAvatarId: 'av_1',
  defaultFrameId: undefined,
  defaultDharmaId: undefined,
  defaultArtifactId: undefined,
  defaultTitleId: 'title_1',
  defaultElo: 1200,
  defaultRealmLevel: 1,
  defaultPills: { 'Tụ Khí Đan': 3, 'Trúc Cơ Đan': 1 },
};

export const ADMIN_USER: UserAccount = {
  id: 'user_admin',
  username: 'admin',
  password: '123',
  role: 'admin',
  daoName: 'Thái Thượng Trưởng Lão',
  sect: 'Tiên Giới Chấp Pháp Viện',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  elo: 2200,
  realmLevel: 10,
  exp: 99999,
  spiritStones: 88888,
  pills: {
    'Tụ Khí Đan': 99,
    'Trúc Cơ Đan': 50,
    'Kim Đan Thần Đan': 20,
  },
  selectedTitleId: 'title_10',
  selectedAvatarId: 'av_10',
  selectedFrameId: 'frame_celestial_gold',
  selectedDharmaId: 'dharma_sword_god',
  selectedArtifactId: 'art_tru_tien_kiem',
  unlockedTitleIds: ['title_1', 'title_2', 'title_3', 'title_4', 'title_5', 'title_10'],
  unlockedAvatarIds: ['av_1', 'av_2', 'av_3', 'av_4', 'av_10'],
  unlockedFrameIds: ['frame_celestial_gold', 'frame_purple_thunder', 'frame_emerald_lotus', 'frame_phoenix_fire', 'frame_ice_crystal'],
  unlockedDharmaIds: ['dharma_sword_god', 'dharma_buddha_gold', 'dharma_dragon_emperor', 'dharma_nine_tails'],
  unlockedArtifactIds: ['art_tru_tien_kiem', 'art_dong_hoang_chung', 'art_bat_quai_kinh'],
  isOnline: true,
  lastActive: 1700000000000,
  updatedAt: 1700000000000,
  stats: {
    totalMatches: 300,
    wins: 280,
    draws: 15,
    losses: 5,
    winStreak: 30,
    maxWinStreak: 45,
    highestElo: 2350,
  },
  createdAt: 1700000000000,
};

export const DEFAULT_USER: UserAccount = {
  id: 'user_main',
  username: 'bach_van_cu_si',
  password: '123',
  role: 'user',
  daoName: 'Bạch Vân Cư Sĩ',
  sect: 'Bạch Vân Tông',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
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
  'ai_bot',
]);

export const SEED_ACCOUNTS: UserAccount[] = [
  ADMIN_USER,
  DEFAULT_USER,
  {
    id: 'user_kiem_ma',
    username: 'doc_co_kiem_ma',
    role: 'user',
    daoName: 'Độc Cô Cầu Bại',
    sect: 'Vạn Kiếm Quy Tông',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    elo: 1950,
    realmLevel: 8,
    exp: 45000,
    spiritStones: 12500,
    pills: { 'Hóa Thần Đan': 3 },
    selectedTitleId: 'title_8',
    selectedAvatarId: 'av_8',
    selectedFrameId: 'frame_purple_thunder',
    selectedDharmaId: 'dharma_sword_god',
    unlockedTitleIds: ['title_8'],
    unlockedAvatarIds: ['av_8'],
    unlockedFrameIds: ['frame_purple_thunder'],
    unlockedDharmaIds: ['dharma_sword_god'],
    unlockedArtifactIds: [],
    lastActive: 1700000000000,
    updatedAt: 1700000000000,
    stats: {
      totalMatches: 180,
      wins: 145,
      draws: 15,
      losses: 20,
      winStreak: 12,
      maxWinStreak: 18,
      highestElo: 2050,
    },
    createdAt: 1700000000000,
  },
  {
    id: 'user_bang_phach',
    username: 'bang_phach_tien_tu',
    role: 'user',
    daoName: 'Băng Phách Tiên Tử',
    sect: 'Hàn Băng Cung',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    elo: 1680,
    realmLevel: 5,
    exp: 18000,
    spiritStones: 4500,
    pills: { 'Ngưng Anh Đan': 2 },
    selectedTitleId: 'title_5',
    selectedAvatarId: 'av_5',
    selectedFrameId: 'frame_ice_crystal',
    unlockedTitleIds: ['title_5'],
    unlockedAvatarIds: ['av_5'],
    unlockedFrameIds: ['frame_ice_crystal'],
    unlockedDharmaIds: [],
    unlockedArtifactIds: [],
    lastActive: 1700000000000,
    updatedAt: 1700000000000,
    stats: {
      totalMatches: 95,
      wins: 68,
      draws: 9,
      losses: 18,
      winStreak: 5,
      maxWinStreak: 9,
      highestElo: 1720,
    },
    createdAt: 1700000000000,
  },
];

export const STORAGE_KEY = 'tien_ky_dao_user_profile_v2';
export const ACCOUNTS_STORAGE_KEY = 'tien_ky_dao_accounts_list_v2';
export const SYSTEM_CONFIG_KEY = 'tien_ky_dao_system_config_v2';
export const KICKED_KEY = 'tien_ky_dao_user_kicked_v2';

export function sanitizeUserAccount(raw: any): UserAccount {
  if (!raw) return { ...GUEST_USER };
  return {
    id: raw.id || 'user_' + Date.now(),
    username: raw.username || 'vo_danh',
    password: raw.password || '',
    role: raw.role === 'admin' ? 'admin' : 'user',
    daoName: raw.daoName || 'Vô Danh Tu Sĩ',
    sect: raw.sect || 'Tán Tu Cửu Châu',
    avatarUrl: raw.avatarUrl || GUEST_USER.avatarUrl,
    elo: typeof raw.elo === 'number' ? raw.elo : 1000,
    realmLevel: typeof raw.realmLevel === 'number' ? raw.realmLevel : 1,
    exp: typeof raw.exp === 'number' ? raw.exp : 0,
    spiritStones: typeof raw.spiritStones === 'number' ? raw.spiritStones : 100,
    pills: raw.pills && typeof raw.pills === 'object' ? raw.pills : {},
    selectedTitleId: raw.selectedTitleId || 'title_1',
    selectedAvatarId: raw.selectedAvatarId || 'av_1',
    selectedFrameId: raw.selectedFrameId || '',
    selectedDharmaId: raw.selectedDharmaId || '',
    selectedArtifactId: raw.selectedArtifactId || '',
    unlockedTitleIds: Array.isArray(raw.unlockedTitleIds) ? raw.unlockedTitleIds : ['title_1'],
    unlockedAvatarIds: Array.isArray(raw.unlockedAvatarIds) ? raw.unlockedAvatarIds : ['av_1'],
    unlockedFrameIds: Array.isArray(raw.unlockedFrameIds) ? raw.unlockedFrameIds : [],
    unlockedDharmaIds: Array.isArray(raw.unlockedDharmaIds) ? raw.unlockedDharmaIds : [],
    unlockedArtifactIds: Array.isArray(raw.unlockedArtifactIds) ? raw.unlockedArtifactIds : [],
    isOnline: Boolean(raw.isOnline),
    isGuest: Boolean(raw.isGuest),
    isBanned: Boolean(raw.isBanned),
    banReason: raw.banReason || '',
    lastActive: typeof raw.lastActive === 'number' ? raw.lastActive : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    stats: {
      totalMatches: raw.stats?.totalMatches || 0,
      wins: raw.stats?.wins || 0,
      draws: raw.stats?.draws || 0,
      losses: raw.stats?.losses || 0,
      winStreak: raw.stats?.winStreak || 0,
      maxWinStreak: raw.stats?.maxWinStreak || 0,
      highestElo: raw.stats?.highestElo || (raw.elo || 1000),
    },
  };
}
