export interface CustomFrame {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  color?: string;
  glowColor?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  description?: string;
  rarity?: string;
  minRealmLevel?: number;
  isPreset?: boolean;
  inShop?: boolean;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface DharmaIdol {
  id: string;
  name: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  rarity?: string;
  auraColor?: string;
  isAnimated?: boolean;
  minRealmLevel?: number;
  inShop?: boolean;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CustomArtifact {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  rarity?: string;
  auraColor?: string;
  skillBonus?: string;
  effect?: string;
  isAnimated?: boolean;
  minRealmLevel?: number;
  inShop?: boolean;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

export const DEFAULT_CUSTOM_FRAMES: CustomFrame[] = [
  {
    id: 'frame_celestial_gold',
    name: 'Thần Hoàng Kim Long Hào Quang',
    price: 1500,
    color: '#ffd700',
    glowColor: '#f59e0b',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Khung hào quang kim sắc chí tôn hội tụ long khí tiên gia.',
    rarity: 'legendary',
    minRealmLevel: 6,
    isPreset: true,
  },
  {
    id: 'frame_purple_thunder',
    name: 'Cửu Tiêu Lôi Đình Huyễn Quang',
    price: 1200,
    color: '#a855f7',
    glowColor: '#9333ea',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Lôi đình cửu tiêu lượn quanh bảo vệ nguyên thần, uy áp lăng lệ.',
    rarity: 'epic',
    minRealmLevel: 4,
    isPreset: true,
  },
  {
    id: 'frame_emerald_lotus',
    name: 'Bích Ngọc Thanh Liên Vòng Sáng',
    price: 800,
    color: '#10b981',
    glowColor: '#059669',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Hoa sen ngọc bích thanh tịnh xua tan tạp niệm, tịnh hóa tâm ma.',
    rarity: 'rare',
    minRealmLevel: 2,
    isPreset: true,
  },
  {
    id: 'frame_phoenix_fire',
    name: 'Phượng Hoàng Liệt Hỏa Kim Quang',
    price: 1000,
    color: '#f97316',
    glowColor: '#ea580c',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Niết bàn chi hỏa thiêu đốt hư không, bộc phát sức mạnh kinh thế.',
    rarity: 'epic',
    minRealmLevel: 3,
    isPreset: true,
  },
  {
    id: 'frame_ice_crystal',
    name: 'Vạn Niên Hàn Băng Phách Quang',
    price: 900,
    color: '#06b6d4',
    glowColor: '#0891b2',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Hàn băng ngưng kết ngàn năm phong tỏa sát khí đối thủ.',
    rarity: 'rare',
    minRealmLevel: 2,
    isPreset: true,
  },
];

export const DEFAULT_DHARMA_IDOLS: DharmaIdol[] = [
  {
    id: 'dharma_sword_god',
    name: 'Kiếm Thần Hiển Thánh',
    title: 'Vạn Kiếm Quy Tông',
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
    description: 'Pháp tướng vô thượng kiếm ý, triệu hoán vạn thanh phi kiếm tề xuất.',
    rarity: 'legendary',
    auraColor: '#ffd700',
    minRealmLevel: 5,
  },
  {
    id: 'dharma_buddha_gold',
    name: 'Kim Thân La Hán',
    title: 'Bất Hoại Pháp Thân',
    price: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&q=80',
    description: 'Pháp thân kim cương hộ thể, vạn tà bất xâm, phòng ngự tuyệt đối.',
    rarity: 'epic',
    auraColor: '#eab308',
    minRealmLevel: 4,
  },
  {
    id: 'dharma_dragon_emperor',
    name: 'Thương Long Thần Đế',
    title: 'Long Uy Trấn Thế',
    price: 3000,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    description: 'Chân long thượng cổ thức tỉnh gầm thét, chấn nhiếp muôn trùng kỳ sĩ.',
    rarity: 'legendary',
    auraColor: '#06b6d4',
    minRealmLevel: 6,
  },
  {
    id: 'dharma_nine_tails',
    name: 'Cửu Vĩ Thiên Hồ',
    title: 'Huyễn Hoang Mị Ảnh',
    price: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
    description: 'Huyễn ảo khôn lường, dẫn dụ đối thủ lạc vào mê trận không lối thoát.',
    rarity: 'rare',
    auraColor: '#ec4899',
    minRealmLevel: 3,
  },
];

export const DEFAULT_CUSTOM_ARTIFACTS: CustomArtifact[] = [
  {
    id: 'art_tru_tien_kiem',
    name: 'Tru Tiên Cổ Kiếm',
    price: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=300&auto=format&fit=crop&q=80',
    description: 'Thượng cổ thần binh, chém đứt nhân quả luân hồi.',
    rarity: 'legendary',
    auraColor: '#ffd700',
    skillBonus: 'Gia tăng 15% uy lực chiêu thức bắt quân',
    minRealmLevel: 7,
  },
  {
    id: 'art_dong_hoang_chung',
    name: 'Đông Hoàng Thần Chung',
    price: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&auto=format&fit=crop&q=80',
    description: 'Thiên địa đệ nhất chí bảo, trấn áp thời không và khí vận.',
    rarity: 'legendary',
    auraColor: '#06b6d4',
    skillBonus: 'Tăng thêm 3 giây mỗi nước đi',
    minRealmLevel: 6,
  },
  {
    id: 'art_bat_quai_kinh',
    name: 'Cửu Cung Bát Quái Kính',
    price: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    description: 'Soi chiếu âm dương hư thực, phán đoán thế trận tinh thông.',
    rarity: 'rare',
    auraColor: '#a855f7',
    skillBonus: 'Tăng điểm tu vi nhận được sau mỗi ván thắng',
    minRealmLevel: 2,
  },
];

const FRAMES_STORAGE_KEY = 'tien_ky_dao_custom_frames_v2';
const DHARMA_STORAGE_KEY = 'tien_ky_dao_dharma_idols_v2';
const ARTIFACTS_STORAGE_KEY = 'tien_ky_dao_custom_artifacts_v2';

export function loadCustomFrames(): CustomFrame[] {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_FRAMES;
  try {
    const raw = localStorage.getItem(FRAMES_STORAGE_KEY);
    if (!raw) return DEFAULT_CUSTOM_FRAMES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CUSTOM_FRAMES;
    const ids = new Set(parsed.map((f: CustomFrame) => f.id));
    const missingPresets = DEFAULT_CUSTOM_FRAMES.filter((f) => !ids.has(f.id));
    return [...parsed, ...missingPresets];
  } catch {
    return DEFAULT_CUSTOM_FRAMES;
  }
}

export function saveCustomFrames(frames: CustomFrame[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FRAMES_STORAGE_KEY, JSON.stringify(frames));
  } catch {
    // ignore
  }
}

export function loadDharmaIdols(): DharmaIdol[] {
  if (typeof window === 'undefined') return DEFAULT_DHARMA_IDOLS;
  try {
    const raw = localStorage.getItem(DHARMA_STORAGE_KEY);
    if (!raw) return DEFAULT_DHARMA_IDOLS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_DHARMA_IDOLS;
    const ids = new Set(parsed.map((d: DharmaIdol) => d.id));
    const missing = DEFAULT_DHARMA_IDOLS.filter((d) => !ids.has(d.id));
    return [...parsed, ...missing];
  } catch {
    return DEFAULT_DHARMA_IDOLS;
  }
}

export function saveDharmaIdols(idols: DharmaIdol[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DHARMA_STORAGE_KEY, JSON.stringify(idols));
  } catch {
    // ignore
  }
}

export function loadCustomArtifacts(): CustomArtifact[] {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_ARTIFACTS;
  try {
    const raw = localStorage.getItem(ARTIFACTS_STORAGE_KEY);
    if (!raw) return DEFAULT_CUSTOM_ARTIFACTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CUSTOM_ARTIFACTS;
    const ids = new Set(parsed.map((a: CustomArtifact) => a.id));
    const missing = DEFAULT_CUSTOM_ARTIFACTS.filter((a) => !ids.has(a.id));
    return [...parsed, ...missing];
  } catch {
    return DEFAULT_CUSTOM_ARTIFACTS;
  }
}

export function saveCustomArtifacts(artifacts: CustomArtifact[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARTIFACTS_STORAGE_KEY, JSON.stringify(artifacts));
  } catch {
    // ignore
  }
}

export interface CustomTitle {
  id: string;
  name: string;
  price: number;
  color?: string;
  textColor?: string;
  bgGradient?: string;
  badgeImageUrl?: string;
  icon?: string;
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  minRealmLevel?: number;
  unlockedAtRealm?: number;
  inShop?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

const TITLES_STORAGE_KEY = 'tien_ky_dao_custom_titles_v2';
const DEFAULT_TITLES: CustomTitle[] = [
  { id: 'title_celestial_master', name: 'Thần Thông Quảng Đại', price: 1500, color: '#ffd700', rarity: 'legendary', minRealmLevel: 6, unlockedAtRealm: 6 },
  { id: 'title_sword_immortal', name: 'Nhất Kiếm Khuynh Thành', price: 1200, color: '#a855f7', rarity: 'epic', minRealmLevel: 4, unlockedAtRealm: 4 },
  { id: 'title_lotus_sage', name: 'Bạch Liên Chân Nhân', price: 800, color: '#10b981', rarity: 'rare', minRealmLevel: 2, unlockedAtRealm: 2 },
];

export function loadCustomTitles(): CustomTitle[] {
  if (typeof window === 'undefined') return DEFAULT_TITLES;
  try {
    const raw = localStorage.getItem(TITLES_STORAGE_KEY);
    if (!raw) return DEFAULT_TITLES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TITLES;
  } catch {
    return DEFAULT_TITLES;
  }
}

export function saveCustomTitles(titles: CustomTitle[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TITLES_STORAGE_KEY, JSON.stringify(titles));
  } catch {
    // ignore
  }
}

export function deleteCustomFrame(id: string): CustomFrame[] {
  const frames = loadCustomFrames().filter((f) => f.id !== id);
  saveCustomFrames(frames);
  return frames;
}

export function deleteDharmaIdol(id: string): DharmaIdol[] {
  const idols = loadDharmaIdols().filter((d) => d.id !== id);
  saveDharmaIdols(idols);
  return idols;
}

export function deleteCustomArtifact(id: string): CustomArtifact[] {
  const artifacts = loadCustomArtifacts().filter((a) => a.id !== id);
  saveCustomArtifacts(artifacts);
  return artifacts;
}

export function deleteCustomTitle(id: string): CustomTitle[] {
  const titles = loadCustomTitles().filter((t) => t.id !== id);
  saveCustomTitles(titles);
  return titles;
}

export async function syncItemsFromCloud(): Promise<void> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success) {
      if (Array.isArray(data.customFrames) && data.customFrames.length > 0) {
        saveCustomFrames(data.customFrames);
      }
      if (Array.isArray(data.dharmaIdols) && data.dharmaIdols.length > 0) {
        saveDharmaIdols(data.dharmaIdols);
      }
      if (Array.isArray(data.customArtifacts) && data.customArtifacts.length > 0) {
        saveCustomArtifacts(data.customArtifacts);
      }
      if (Array.isArray(data.customTitles) && data.customTitles.length > 0) {
        saveCustomTitles(data.customTitles);
      }
    }
  } catch {
    // ignore
  }
}
