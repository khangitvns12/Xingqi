export interface CultivationRealm {
  id: string;
  level: number;
  name: string;
  expRequired: number;
  requiredExp?: number;
  eloMin: number;
  minElo: number;
  color: string;
  glowColor: string;
  borderGlow: string;
  avatarGlowCss: string;
  badgeBg: string;
  auraCss: string;
  description: string;
  tagline: string;
  breakthroughRate: number;
  pillNeeded: string;
}

export const CULTIVATION_REALMS: CultivationRealm[] = [
  {
    id: 'realm_1',
    level: 1,
    name: 'Luyện Khí Kỳ',
    expRequired: 1000,
    eloMin: 1000,
    minElo: 1000,
    color: '#10b981',
    glowColor: '#10b981',
    borderGlow: 'border-emerald-500/40',
    avatarGlowCss: 'shadow-[0_0_12px_rgba(16,185,129,0.4)] ring-emerald-500/50',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    auraCss: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    description: 'Vừa bước chân vào con đường tu tiên, hấp thu thiên địa linh khí sơ cấp.',
    tagline: 'Sơ nhập tiên môn, luyện khí hóa thần',
    breakthroughRate: 90,
    pillNeeded: 'Tụ Khí Đan',
  },
  {
    id: 'realm_2',
    level: 2,
    name: 'Trúc Cơ Kỳ',
    expRequired: 2500,
    eloMin: 1200,
    minElo: 1200,
    color: '#06b6d4',
    glowColor: '#06b6d4',
    borderGlow: 'border-cyan-500/40',
    avatarGlowCss: 'shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-cyan-500/60',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    auraCss: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    description: 'Xây dựng đạo cơ vững chắc, đan điền khai mở, linh lực lưu chuyển thông suốt.',
    tagline: 'Đúc kết đạo cơ, khai mở đan điền',
    breakthroughRate: 80,
    pillNeeded: 'Trúc Cơ Đan',
  },
  {
    id: 'realm_3',
    level: 3,
    name: 'Kim Đan Kỳ',
    expRequired: 5000,
    eloMin: 1400,
    minElo: 1400,
    color: '#eab308',
    glowColor: '#eab308',
    borderGlow: 'border-yellow-500/50',
    avatarGlowCss: 'shadow-[0_0_18px_rgba(234,179,8,0.6)] ring-yellow-500/70',
    badgeBg: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50',
    auraCss: 'shadow-[0_0_18px_rgba(234,179,8,0.5)]',
    description: 'Ngưng kết cửu chuyển kim đan, thọ nguyên kéo dài ngàn năm, uy chấn một phương.',
    tagline: 'Ngưng tụ kim đan, thọ nguyên thiên niên',
    breakthroughRate: 70,
    pillNeeded: 'Kim Đan Thần Đan',
  },
  {
    id: 'realm_4',
    level: 4,
    name: 'Nguyên Anh Kỳ',
    expRequired: 10000,
    eloMin: 1600,
    minElo: 1600,
    color: '#a855f7',
    glowColor: '#a855f7',
    borderGlow: 'border-purple-500/50',
    avatarGlowCss: 'shadow-[0_0_20px_rgba(168,85,247,0.6)] ring-purple-500/70',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
    auraCss: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    description: 'Phá đan thành anh, linh hồn xuất khiếu, ngự phong lôi sấm sét giữa càn khôn.',
    tagline: 'Phá đan xuất anh, linh hồn ngao du',
    breakthroughRate: 60,
    pillNeeded: 'Nguyên Anh Đan',
  },
  {
    id: 'realm_5',
    level: 5,
    name: 'Hóa Thần Kỳ',
    expRequired: 20000,
    eloMin: 1750,
    minElo: 1750,
    color: '#ec4899',
    glowColor: '#ec4899',
    borderGlow: 'border-pink-500/60',
    avatarGlowCss: 'shadow-[0_0_22px_rgba(236,72,153,0.7)] ring-pink-500/80',
    badgeBg: 'bg-pink-950/80 text-pink-300 border-pink-500/60',
    auraCss: 'shadow-[0_0_22px_rgba(236,72,153,0.6)]',
    description: 'Thần thức bao trùm vạn dặm, lĩnh ngộ sơ bộ thiên địa quy tắc, siêu thoát phàm trần.',
    tagline: 'Thần thức hóa hình, dung nhập thiên địa',
    breakthroughRate: 50,
    pillNeeded: 'Hóa Thần Đan',
  },
  {
    id: 'realm_6',
    level: 6,
    name: 'Luyện Hư Kỳ',
    expRequired: 35000,
    eloMin: 1900,
    minElo: 1900,
    color: '#3b82f6',
    glowColor: '#3b82f6',
    borderGlow: 'border-blue-500/60',
    avatarGlowCss: 'shadow-[0_0_25px_rgba(59,130,246,0.7)] ring-blue-500/80',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-500/60',
    auraCss: 'shadow-[0_0_25px_rgba(59,130,246,0.6)]',
    description: 'Thân dung hư không, một bước vượt ngàn trùng tinh tú, chưởng khống hư không chi lực.',
    tagline: 'Thân dung hư không, chưởng khống pháp tắc',
    breakthroughRate: 45,
    pillNeeded: 'Luyện Hư Đan',
  },
  {
    id: 'realm_7',
    level: 7,
    name: 'Hợp Thể Kỳ',
    expRequired: 55000,
    eloMin: 2000,
    minElo: 2000,
    color: '#f97316',
    glowColor: '#f97316',
    borderGlow: 'border-orange-500/70',
    avatarGlowCss: 'shadow-[0_0_28px_rgba(249,115,22,0.8)] ring-orange-500/90',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-500/70',
    auraCss: 'shadow-[0_0_28px_rgba(249,115,22,0.7)]',
    description: 'Nhục thân và nguyên thần hoàn mỹ hợp nhất, bất tử bất diệt trước phàm hỏa.',
    tagline: 'Hợp nhất nguyên thần, nhục thân bất tử',
    breakthroughRate: 40,
    pillNeeded: 'Hợp Thể Đan',
  },
  {
    id: 'realm_8',
    level: 8,
    name: 'Đại Thừa Kỳ',
    expRequired: 80000,
    eloMin: 2100,
    minElo: 2100,
    color: '#ef4444',
    glowColor: '#ef4444',
    borderGlow: 'border-red-500/80',
    avatarGlowCss: 'shadow-[0_0_30px_rgba(239,68,68,0.85)] ring-red-500',
    badgeBg: 'bg-red-950/80 text-red-300 border-red-500/80',
    auraCss: 'shadow-[0_0_30px_rgba(239,68,68,0.8)]',
    description: 'Đạo pháp đại thành, một ý niệm dời non lấp bể, chỉ đợi thiên kiếp buông xuống.',
    tagline: 'Đại đạo viên mãn, ngự trị càn khôn',
    breakthroughRate: 35,
    pillNeeded: 'Đại Thừa Đan',
  },
  {
    id: 'realm_9',
    level: 9,
    name: 'Độ Kiếp Kỳ',
    expRequired: 120000,
    eloMin: 2200,
    minElo: 2200,
    color: '#e11d48',
    glowColor: '#e11d48',
    borderGlow: 'border-rose-500',
    avatarGlowCss: 'shadow-[0_0_35px_rgba(225,29,72,0.9)] ring-rose-500',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500',
    auraCss: 'shadow-[0_0_35px_rgba(225,29,72,0.85)]',
    description: 'Nghênh đón chín chín tám mươi mốt đạo cửu thiên thần lôi, đạp phá hư không.',
    tagline: 'Nghênh tiếp lôi kiếp, đạp phá hư không',
    breakthroughRate: 30,
    pillNeeded: 'Độ Kiếp Đan',
  },
  {
    id: 'realm_10',
    level: 10,
    name: 'Chân Tiên Cảnh',
    expRequired: 200000,
    eloMin: 2300,
    minElo: 2300,
    color: '#ffd700',
    glowColor: '#ffd700',
    borderGlow: 'border-amber-400',
    avatarGlowCss: 'shadow-[0_0_40px_rgba(255,215,0,1)] ring-amber-400 ring-offset-2',
    badgeBg: 'bg-amber-950/90 text-amber-300 border-amber-400',
    auraCss: 'shadow-[0_0_40px_rgba(255,215,0,0.9)]',
    description: 'Vượt qua luân hồi, thọ cùng trời đất, chấp chưởng thiên đạo vạn linh.',
    tagline: 'Chân tiên giáng thế, vạn cổ trường tồn',
    breakthroughRate: 100,
    pillNeeded: 'Vô Thượng Tiên Đan',
  },
];

export function getRealmByLevel(level: number): CultivationRealm {
  const safeLevel = Math.max(1, Math.min(10, Math.floor(level || 1)));
  const found = CULTIVATION_REALMS.find((r) => r.level === safeLevel) || CULTIVATION_REALMS[0];
  return {
    ...found,
    requiredExp: found.expRequired,
  };
}

export interface DaoistTitle {
  id: string;
  name: string;
  realmLevel: number;
  unlockedAtRealm: number;
  color: string;
  textColor?: string;
  description?: string;
  icon?: string;
}

export const DAOIST_TITLES: DaoistTitle[] = [
  { id: 'title_1', name: 'Kỳ Đạo Đạo Đồng', realmLevel: 1, unlockedAtRealm: 1, color: '#10b981', textColor: 'text-emerald-400', icon: '🌱', description: 'Đạo đồng mới nhập môn, bước đầu lĩnh hội kỳ đạo càn khôn.' },
  { id: 'title_2', name: 'Bạch Vân Kỳ Sĩ', realmLevel: 2, unlockedAtRealm: 2, color: '#06b6d4', textColor: 'text-cyan-400', icon: '☁️', description: 'Kỳ sĩ tự tại như mây trắng, bàn cờ thanh tịnh thong dong.' },
  { id: 'title_3', name: 'Thanh Hư Kỳ Tướng', realmLevel: 3, unlockedAtRealm: 3, color: '#eab308', textColor: 'text-yellow-400', icon: '⚔️', description: 'Kỳ tướng tung hoành trận mạc, dụng binh như thần.' },
  { id: 'title_4', name: 'Uẩn Linh Kỳ Vương', realmLevel: 4, unlockedAtRealm: 4, color: '#a855f7', textColor: 'text-purple-400', icon: '🔮', description: 'Kỳ vương ngưng tụ linh khí, nắm giữ thế cờ huyền diệu.' },
  { id: 'title_5', name: 'Thông Huyền Kỳ Hoàng', realmLevel: 5, unlockedAtRealm: 5, color: '#ec4899', textColor: 'text-pink-400', icon: '👑', description: 'Kỳ hoàng thông hiểu huyền cơ, xoay chuyển càn khôn trong gang tấc.' },
  { id: 'title_6', name: 'Thái Cực Kỳ Tôn', realmLevel: 6, unlockedAtRealm: 6, color: '#3b82f6', textColor: 'text-blue-400', icon: '☯️', description: 'Kỳ tôn am hiểu âm dương thái cực, hư thực biến hóa khôn lường.' },
  { id: 'title_7', name: 'Vạn Kiếm Kỳ Thánh', realmLevel: 7, unlockedAtRealm: 7, color: '#f97316', textColor: 'text-orange-400', icon: '🗡️', description: 'Kỳ thánh vạn kiếm quy tông, sát khí ngút trời bàn cờ.' },
  { id: 'title_8', name: 'Độc Cô Kỳ Thần', realmLevel: 8, unlockedAtRealm: 8, color: '#ef4444', textColor: 'text-red-400', icon: '⚡', description: 'Kỳ thần cầu một trận bại không được, độc cô cầu bại tam giới.' },
  { id: 'title_9', name: 'Cửu U Kỳ Đế', realmLevel: 9, unlockedAtRealm: 9, color: '#e11d48', textColor: 'text-rose-400', icon: '🔥', description: 'Kỳ đế uy chấn cửu u, một bước cờ định đoạt sinh tử muôn loài.' },
  { id: 'title_10', name: 'Vô Thượng Tiên Tôn', realmLevel: 10, unlockedAtRealm: 10, color: '#ffd700', textColor: 'text-amber-400', icon: '✨', description: 'Tiên tôn siêu thoát thiên địa, coi tam giới như một bàn cờ.' },
];

export interface CultivatorAvatar {
  id: string;
  name: string;
  url: string;
  minRealmLevel: number;
}

export const CULTIVATOR_AVATARS: CultivatorAvatar[] = [
  {
    id: 'av_1',
    name: 'Thanh Phong Đạo Đồng',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 1,
  },
  {
    id: 'av_2',
    name: 'Bạch Vân Cư Sĩ',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 2,
  },
  {
    id: 'av_3',
    name: 'Huyền Linh Tiên Tử',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 3,
  },
  {
    id: 'av_4',
    name: 'Vạn Kiếm Tiên Nhân',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 4,
  },
  {
    id: 'av_5',
    name: 'Cửu U Ma Tôn',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 5,
  },
  {
    id: 'av_10',
    name: 'Thái Thượng Chí Tôn',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 10,
  },
];
