export interface CultivationRealm {
  id: string;
  name: string;
  level: number;
  minElo: number;
  requiredExp: number;
  tagline: string;
  colorName: string;
  textColor: string;
  badgeBg: string;
  glowColor: string;
  borderClass: string;
  auraCss: string;
  avatarGlowCss: string;
  breakthroughRate: number; // percentage
  pillNeeded: string;
}

export const CULTIVATION_REALMS: CultivationRealm[] = [
  {
    id: 'luyen_khi',
    name: 'Luyện Khí Kỳ',
    level: 1,
    minElo: 1000,
    requiredExp: 300,
    tagline: 'Sơ nhập Tiên Đạo, dẫn khí nhập thể',
    colorName: 'Thanh Diệp Lam',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
    glowColor: '#10b981',
    borderClass: 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    auraCss: 'ring-2 ring-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    avatarGlowCss: 'shadow-[0_0_25px_rgba(16,185,129,0.6)] border-2 border-emerald-400',
    breakthroughRate: 95,
    pillNeeded: 'Tụ Khí Đan',
  },
  {
    id: 'truc_co',
    name: 'Trúc Cơ Kỳ',
    level: 2,
    minElo: 1200,
    requiredExp: 600,
    tagline: 'Đúc thành Đạo Cơ, thần thức sơ thành',
    colorName: 'Lam Ngọc Quang',
    textColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300',
    glowColor: '#06b6d4',
    borderClass: 'border-cyan-500/70 shadow-[0_0_18px_rgba(6,182,212,0.5)]',
    auraCss: 'ring-2 ring-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.6)]',
    avatarGlowCss: 'shadow-[0_0_30px_rgba(6,182,212,0.7)] border-2 border-cyan-400',
    breakthroughRate: 85,
    pillNeeded: 'Trúc Cơ Đan',
  },
  {
    id: 'kim_dan',
    name: 'Kim Đan Kỳ',
    level: 3,
    minElo: 1400,
    requiredExp: 1000,
    tagline: 'Nhất lạp Kim Đan thôn nhập phúc, ngã mệnh do ngã bất do thiên',
    colorName: 'Hoàng Kim Đan Sa',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
    glowColor: '#f59e0b',
    borderClass: 'border-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.6)]',
    auraCss: 'ring-2 ring-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.7)]',
    avatarGlowCss: 'shadow-[0_0_35px_rgba(245,158,11,0.8)] border-2 border-amber-300',
    breakthroughRate: 75,
    pillNeeded: 'Hàng Long Kim Đan',
  },
  {
    id: 'nguyen_anh',
    name: 'Nguyên Anh Kỳ',
    level: 4,
    minElo: 1600,
    requiredExp: 1600,
    tagline: 'Phá toái đan thành anh, thần du thiên địa',
    colorName: 'Tử Điện Lôi Quang',
    textColor: 'text-purple-400',
    badgeBg: 'bg-purple-950/80 border-purple-500/50 text-purple-300',
    glowColor: '#a855f7',
    borderClass: 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.7)]',
    auraCss: 'ring-2 ring-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.8)]',
    avatarGlowCss: 'shadow-[0_0_40px_rgba(168,85,247,0.9)] border-2 border-purple-400',
    breakthroughRate: 65,
    pillNeeded: 'Hóa Anh Đan',
  },
  {
    id: 'hoa_than',
    name: 'Hóa Thần Kỳ',
    level: 5,
    minElo: 1800,
    requiredExp: 2400,
    tagline: 'Lĩnh ngộ Thiên Địa Pháp Tắc, ý niệm thông thiên',
    colorName: 'Chu Tước Hỏa Diễm',
    textColor: 'text-rose-400',
    badgeBg: 'bg-rose-950/80 border-rose-500/60 text-rose-300',
    glowColor: '#f43f5e',
    borderClass: 'border-rose-500 shadow-[0_0_28px_rgba(244,63,94,0.7)]',
    auraCss: 'ring-2 ring-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.8)]',
    avatarGlowCss: 'shadow-[0_0_45px_rgba(244,63,94,0.9)] border-2 border-rose-400',
    breakthroughRate: 55,
    pillNeeded: 'Thần Hóa Đan',
  },
  {
    id: 'luyen_hu',
    name: 'Luyện Hư Kỳ',
    level: 6,
    minElo: 2000,
    requiredExp: 3500,
    tagline: 'Phản phác quy chân, thân hóa hư vô',
    colorName: 'Băng Phách Huyền Minh',
    textColor: 'text-sky-300',
    badgeBg: 'bg-sky-950/80 border-sky-400/60 text-sky-200',
    glowColor: '#38bdf8',
    borderClass: 'border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.8)]',
    auraCss: 'ring-2 ring-sky-300 shadow-[0_0_45px_rgba(56,189,248,0.9)]',
    avatarGlowCss: 'shadow-[0_0_50px_rgba(56,189,248,1)] border-2 border-sky-300',
    breakthroughRate: 50,
    pillNeeded: 'Hư Thiên Đan',
  },
  {
    id: 'hop_the',
    name: 'Hợp Thể Kỳ',
    level: 7,
    minElo: 2200,
    requiredExp: 5000,
    tagline: 'Thiên Nhân Hợp Nhất, đại đạo tương dung',
    colorName: 'Thái Cực Lưỡng Nghi',
    textColor: 'text-teal-300',
    badgeBg: 'bg-teal-950/80 border-teal-400/70 text-teal-200',
    glowColor: '#2dd4bf',
    borderClass: 'border-teal-300 shadow-[0_0_32px_rgba(45,212,191,0.8)]',
    auraCss: 'ring-2 ring-teal-300 shadow-[0_0_50px_rgba(45,212,191,0.9)]',
    avatarGlowCss: 'shadow-[0_0_55px_rgba(45,212,191,1)] border-2 border-teal-200',
    breakthroughRate: 45,
    pillNeeded: 'Hợp Đạo Quả',
  },
  {
    id: 'dai_thua',
    name: 'Đại Thừa Kỳ',
    level: 8,
    minElo: 2400,
    requiredExp: 7000,
    tagline: 'Pháp tướng viên mãn, chuẩn bị đắc đạo thành tiên',
    colorName: 'Hồng Mông Tử Khí',
    textColor: 'text-fuchsia-400',
    badgeBg: 'bg-fuchsia-950/80 border-fuchsia-400/80 text-fuchsia-200',
    glowColor: '#e879f9',
    borderClass: 'border-fuchsia-400 shadow-[0_0_36px_rgba(232,121,249,0.9)]',
    auraCss: 'ring-2 ring-fuchsia-400 shadow-[0_0_55px_rgba(232,121,249,1)]',
    avatarGlowCss: 'shadow-[0_0_60px_rgba(232,121,249,1)] border-2 border-fuchsia-300',
    breakthroughRate: 40,
    pillNeeded: 'Cửu Chuyển Hoàn Hồn Đan',
  },
  {
    id: 'do_kiep',
    name: 'Độ Kiếp Kỳ',
    level: 9,
    minElo: 2600,
    requiredExp: 10000,
    tagline: 'Nghịch thiên nhi hành, cửu trọng thiên kiếp trui rèn tiên cốt',
    colorName: 'Cửu Sắc Lôi Kiếp',
    textColor: 'text-yellow-300',
    badgeBg: 'bg-yellow-950/90 border-yellow-400 text-yellow-100',
    glowColor: '#facc15',
    borderClass: 'border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,1)] animate-pulse',
    auraCss: 'ring-2 ring-yellow-400 shadow-[0_0_65px_rgba(250,204,21,1)] animate-pulse',
    avatarGlowCss: 'shadow-[0_0_70px_rgba(250,204,21,1)] border-2 border-yellow-200 animate-pulse',
    breakthroughRate: 35,
    pillNeeded: 'Hóa Kiếp Thần Đan',
  },
  {
    id: 'tien_de',
    name: 'Vô Thượng Tiên Đế',
    level: 10,
    minElo: 2800,
    requiredExp: 20000,
    tagline: 'Chưởng quản vạn giới thiên đạo, Tiên Kỳ vô địch',
    colorName: 'Vô Thượng Thần Quang',
    textColor: 'text-orange-300',
    badgeBg: 'bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-amber-950/90 border-amber-300 text-amber-200',
    glowColor: '#fbbf24',
    borderClass: 'border-amber-300 shadow-[0_0_50px_rgba(251,191,36,1)] animate-pulse',
    auraCss: 'ring-4 ring-amber-300 shadow-[0_0_80px_rgba(251,191,36,1)] animate-pulse',
    avatarGlowCss: 'shadow-[0_0_85px_rgba(251,191,36,1)] border-3 border-amber-200 animate-pulse',
    breakthroughRate: 30,
    pillNeeded: 'Hỗn Độn Tiên Căn',
  },
];

export interface TitleItem {
  id: string;
  name: string;
  description: string;
  unlockedAtRealm: number;
  textColor: string;
  bgGradient: string;
  icon: string;
}

export const DAOIST_TITLES: TitleItem[] = [
  {
    id: 'title_1',
    name: 'Kỳ Đạo Đạo Đồng',
    description: 'Tân thủ bước vào con đường cờ tướng tiên hiệp',
    unlockedAtRealm: 1,
    textColor: 'text-emerald-300',
    bgGradient: 'from-emerald-900/60 to-emerald-950/60 border-emerald-500/40',
    icon: '🌱',
  },
  {
    id: 'title_2',
    name: 'Bạch Vân Kỳ Sĩ',
    description: 'Đạo hữu ngao du bốn bể, thong dong đánh cờ',
    unlockedAtRealm: 2,
    textColor: 'text-cyan-300',
    bgGradient: 'from-cyan-900/60 to-cyan-950/60 border-cyan-500/40',
    icon: '☁️',
  },
  {
    id: 'title_3',
    name: 'Diệu Thủ Đan Tâm',
    description: 'Nước cờ tinh xảo, tâm cảnh vững như bàn thạch',
    unlockedAtRealm: 3,
    textColor: 'text-amber-300',
    bgGradient: 'from-amber-900/60 to-amber-950/60 border-amber-500/40',
    icon: '✨',
  },
  {
    id: 'title_4',
    name: 'Cửu Tiêu Kiếm Tiên',
    description: 'Sát phạt quyết đoán, một nước cờ định đoạt giang sơn',
    unlockedAtRealm: 4,
    textColor: 'text-purple-300',
    bgGradient: 'from-purple-900/60 to-purple-950/60 border-purple-500/40',
    icon: '⚔️',
  },
  {
    id: 'title_5',
    name: 'Thần Toán Chân Quân',
    description: 'Tính trước trăm nước, liệu sự như thần',
    unlockedAtRealm: 5,
    textColor: 'text-rose-300',
    bgGradient: 'from-rose-900/60 to-rose-950/60 border-rose-500/40',
    icon: '🔮',
  },
  {
    id: 'title_6',
    name: 'Bắc Minh Thần Quân',
    description: 'Thâm trầm như biển lớn, nuốt trọn thiên hạ',
    unlockedAtRealm: 6,
    textColor: 'text-sky-300',
    bgGradient: 'from-sky-900/60 to-sky-950/60 border-sky-500/40',
    icon: '🌊',
  },
  {
    id: 'title_7',
    name: 'Lưỡng Nghi Tông Sư',
    description: 'Thấu hiểu âm dương biến hóa, hư thực khó lường',
    unlockedAtRealm: 7,
    textColor: 'text-teal-300',
    bgGradient: 'from-teal-900/60 to-teal-950/60 border-teal-500/40',
    icon: '☯️',
  },
  {
    id: 'title_8',
    name: 'Bất Bại Thần Vương',
    description: 'Trăm trận trăm thắng, khí phách ngút trời',
    unlockedAtRealm: 8,
    textColor: 'text-fuchsia-300',
    bgGradient: 'from-fuchsia-900/60 to-fuchsia-950/60 border-fuchsia-500/40',
    icon: '👑',
  },
  {
    id: 'title_9',
    name: 'Thiên Kiếp Kiếm Tôn',
    description: 'Trải qua lôi kiếp vạn lần, mình đồng da sắt',
    unlockedAtRealm: 9,
    textColor: 'text-yellow-300',
    bgGradient: 'from-yellow-900/70 to-amber-950/70 border-yellow-400',
    icon: '⚡',
  },
  {
    id: 'title_10',
    name: 'Vô Thượng Tiên Đế',
    description: 'Đỉnh phong kỳ đạo vạn giới, nhất ngôn cửu đỉnh',
    unlockedAtRealm: 10,
    textColor: 'text-amber-200',
    bgGradient: 'from-amber-600/40 via-purple-600/40 to-amber-600/40 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    icon: '🌌',
  },
];

export function getRealmByLevel(level: number): CultivationRealm {
  const found = CULTIVATION_REALMS.find((r) => r.level === level);
  return found || CULTIVATION_REALMS[0];
}

export function getRealmByElo(elo: number): CultivationRealm {
  for (let i = CULTIVATION_REALMS.length - 1; i >= 0; i--) {
    if (elo >= CULTIVATION_REALMS[i].minElo) {
      return CULTIVATION_REALMS[i];
    }
  }
  return CULTIVATION_REALMS[0];
}

export interface CultivatorAvatar {
  id: string;
  name: string;
  url: string;
  minRealmLevel: number;
}

export const CULTIVATOR_AVATARS: CultivatorAvatar[] = [
  {
    id: 'av_1',
    name: 'Thanh Phong Đạo Sĩ',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 1,
  },
  {
    id: 'av_2',
    name: 'Linh Lung Tiên Tử',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 1,
  },
  {
    id: 'av_3',
    name: 'Tử Tiêu Kiếm Tu',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 2,
  },
  {
    id: 'av_4',
    name: 'Bạch Y Tiên Tôn',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 3,
  },
  {
    id: 'av_5',
    name: 'Băng Phách Tiên Cơ',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 4,
  },
  {
    id: 'av_6',
    name: 'Hắc Bào Ma Tôn',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    minRealmLevel: 5,
  },
];
