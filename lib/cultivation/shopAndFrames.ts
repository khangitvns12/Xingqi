'use client';

export interface CustomFrame {
  id: string;
  name: string;
  imageUrl: string;
  price: number; // Spirit stones
  inShop: boolean;
  rarity: 'Thượng Phẩm' | 'Cực Phẩm' | 'Tiên Phẩm' | 'Thần Phẩm';
  glowColor: string;
  description: string;
  scale?: number; // AI-aligned scale factor (default ~1.40)
  offsetX?: number; // AI-aligned horizontal offset (px or %)
  offsetY?: number; // AI-aligned vertical offset (px or %)
  createdBy?: string;
  createdAt: number;
}

export interface DharmaIdol {
  id: string;
  name: string;
  imageUrl: string; // Static image or animated (GIF, WebP)
  auraColor: string;
  price: number; // Spirit stones
  inShop: boolean;
  description: string;
  title: string;
  minRealmLevel: number;
  statBonusText?: string;
  isAnimated?: boolean; // Supports GIF / WebP animated
  createdBy?: string;
  createdAt: number;
}

export interface CustomArtifact {
  id: string;
  name: string;
  imageUrl: string; // Static image or animated (GIF, WebP)
  auraColor: string;
  price: number; // Spirit stones
  inShop: boolean;
  rarity: 'Hạ Phẩm' | 'Trung Phẩm' | 'Thượng Phẩm' | 'Cực Phẩm' | 'Tiên Phẩm' | 'Thần Phẩm';
  description: string;
  effect: string;
  minRealmLevel: number;
  isAnimated?: boolean; // Supports GIF / WebP animated
  createdBy?: string;
  createdAt: number;
}

export interface CustomTitle {
  id: string;
  name: string;
  badgeImageUrl?: string; // Admin-uploaded badge image/gif/webp
  icon?: string;
  description: string;
  unlockedAtRealm: number;
  price?: number;
  inShop?: boolean;
  textColor: string;
  bgGradient: string;
  createdBy?: string;
  createdAt: number;
}

export const DEFAULT_FRAMES: CustomFrame[] = [
  {
    id: 'frame_celestial_gold',
    name: 'Kim Long Bát Quái Khung',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=250&auto=format&fit=crop&q=80',
    price: 500,
    inShop: true,
    rarity: 'Thần Phẩm',
    glowColor: '#f59e0b',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Chế tác từ Thái Cổ Thần Kim, khắc ấn Bát Quái đồ và Kim Long hộ thể tỏa kim quang rực rỡ.',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'frame_purple_thunder',
    name: 'Cửu Tiêu Lôi Điện Khung',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=250&auto=format&fit=crop&q=80',
    price: 350,
    inShop: true,
    rarity: 'Tiên Phẩm',
    glowColor: '#c084fc',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Ngưng tụ từ lôi kiếp Cửu Trọng Thiên, tử điện lấp lánh như sấm sét xé toạc hư không.',
    createdAt: Date.now() - 86400000 * 8,
  },
  {
    id: 'frame_emerald_lotus',
    name: 'Thanh Liên Ngọc Bích Khung',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=250&auto=format&fit=crop&q=80',
    price: 250,
    inShop: true,
    rarity: 'Cực Phẩm',
    glowColor: '#10b981',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Cánh hoa sen ngọc bích tỏa tiên khí thanh tịnh, dưỡng tâm an thần khi suy tính nước cờ vi diệu.',
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'frame_phoenix_fire',
    name: 'Phượng Hoàng Chân Hỏa Khung',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=250&auto=format&fit=crop&q=80',
    price: 420,
    inShop: true,
    rarity: 'Tiên Phẩm',
    glowColor: '#f43f5e',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Cánh lửa Niết Bàn của Bất Tử Thần Phượng, bùng cháy uy lực khiến đối thủ chấn động tâm can.',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'frame_ice_crystal',
    name: 'Huyền Băng Hàn Phách Khung',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=250&auto=format&fit=crop&q=80',
    price: 180,
    inShop: true,
    rarity: 'Thượng Phẩm',
    glowColor: '#38bdf8',
    scale: 1.15,
    offsetX: 0,
    offsetY: 0,
    description: 'Băng tinh vạn năm ngưng kết từ Bắc Cực Hàn Đàm, sắc bén và lạnh giá đến thấu xương.',
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const DEFAULT_DHARMA_IDOLS: DharmaIdol[] = [
  {
    id: 'dharma_chaos_emperor',
    name: 'Hỗn Độn Tiên Đế Kim Thân',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    auraColor: '#f59e0b',
    price: 1200,
    inShop: true,
    title: 'Vô Thượng Tiên Tôn',
    minRealmLevel: 5,
    description: 'Hỗn Độn sơ khai sinh Thái Cực, Tiên Đế pháp thân cao vạn trượng tọa trên chín tầng mây, quan sát vạn giới cờ tàn như bụi trần.',
    statBonusText: 'Tăng 20% uy áp khí tức khi vào trận',
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'dharma_sword_god',
    name: 'Vạn Kiếm Quy Tông Pháp Tướng',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    auraColor: '#06b6d4',
    price: 900,
    inShop: true,
    title: 'Kiếm Đạo Độc Tôn',
    minRealmLevel: 3,
    description: 'Vạn thanh phi kiếm lượn quanh hộ thân, sát khí ngút trời, mỗi nước cờ sắc bén như một kiếm kinh lôi trảm phá càn khôn.',
    statBonusText: 'Hiệu ứng hào quang kiếm trận quanh bàn cờ',
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    id: 'dharma_nine_tails',
    name: 'Cửu Vĩ Thiên Hồ Thần Tướng',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    auraColor: '#ec4899',
    price: 750,
    inShop: true,
    title: 'Huyễn Hoặc Yêu Tiên',
    minRealmLevel: 2,
    description: 'Chín đuôi yêu hỏa rực rỡ lay chuyển hư không, thông tuệ tuyệt đỉnh, mị lực khuynh thành mê hoặc mọi mưu đồ của quân cờ đối phương.',
    statBonusText: 'Tăng vẻ lộng lẫy hồ hỏa trong hồ sơ cá nhân',
    createdAt: Date.now() - 86400000 * 9,
  },
  {
    id: 'dharma_dragon_emperor',
    name: 'Thái Cổ Thanh Long Chân Thân',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    auraColor: '#10b981',
    price: 850,
    inShop: true,
    title: 'Tứ Tượng Thần Quân',
    minRealmLevel: 4,
    description: 'Chân Long ngự lôi điện phong vân, vảy rồng sáng chói thiên thu, rống vang một tiếng chấn động ngũ hồ tứ hải.',
    statBonusText: 'Rồng thần uốn lượn sau lưng tại hồ sơ',
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'dharma_asura',
    name: 'Tu La Thần Ma Pháp Tướng',
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80',
    auraColor: '#dc2626',
    price: 1100,
    inShop: true,
    title: 'Huyết Hải Ma Tôn',
    minRealmLevel: 4,
    description: 'Ba đầu sáu tay nắm giữ thần binh hủy thiên diệt địa, chiến ý cuồn cuộn không dứt giữa huyết hải vô biên.',
    statBonusText: 'Huyết diệm ma quang bùng nổ khi chiếu tướng',
    createdAt: Date.now() - 86400000 * 5,
  },
];

export const DEFAULT_ARTIFACTS: CustomArtifact[] = [
  {
    id: 'art_dong_hoang_chung',
    name: 'Đông Hoàng Chung',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80',
    auraColor: '#f59e0b',
    price: 1500,
    inShop: true,
    rarity: 'Thần Phẩm',
    description: 'Thái Cổ Thập Đại Thần Khí đứng đầu, trấn áp chư thiên vạn giới, phòng hộ bất khả xâm phạm.',
    effect: 'Tăng 15% thời gian suy nghĩ mỗi nước đi',
    minRealmLevel: 5,
    isAnimated: false,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'art_chu_tien_kiem',
    name: 'Tru Tiên Cổ Kiếm',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
    auraColor: '#ef4444',
    price: 1200,
    inShop: true,
    rarity: 'Tiên Phẩm',
    description: 'Kiếm khí ngút trời, trảm tiên diệt thần, mỗi lần bắt quân địch đều phát ra kiếm minh chấn động.',
    effect: 'Tăng hiệu ứng sát phạt khi ăn quân cờ',
    minRealmLevel: 4,
    isAnimated: true,
    createdAt: Date.now() - 86400000 * 18,
  },
  {
    id: 'art_bat_quai_kinh',
    name: 'Âm Dương Bát Quái Kính',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    auraColor: '#06b6d4',
    price: 900,
    inShop: true,
    rarity: 'Cực Phẩm',
    description: 'Chiếu thấu hư thực âm dương, phản chiếu mọi sát chiêu quỷ quyệt của đối phương.',
    effect: 'Tăng độ chuẩn xác gợi ý kỳ đạo',
    minRealmLevel: 3,
    isAnimated: false,
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    id: 'art_ngoc_tinh_binh',
    name: 'Cửu Thiên Dương Liễu Tịnh Bình',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    auraColor: '#10b981',
    price: 700,
    inShop: true,
    rarity: 'Thượng Phẩm',
    description: 'Chứa cam lộ tiên thiên sinh sôi bất diệt, hộ trì tâm tính thanh tịnh bất loạn giữa trận cờ gay cấn.',
    effect: 'Tăng 10% Exp tu vi sau mỗi trận thắng',
    minRealmLevel: 2,
    isAnimated: false,
    createdAt: Date.now() - 86400000 * 10,
  },
];

export const DEFAULT_CUSTOM_TITLES: CustomTitle[] = [
  {
    id: 'ctitle_thien_dao',
    name: 'Thiên Đạo Vô Thượng',
    badgeImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    description: 'Danh hiệu tối thượng do Thiên Đạo ban tặng cho bậc đại năng',
    unlockedAtRealm: 8,
    price: 2000,
    inShop: true,
    textColor: 'text-amber-200',
    bgGradient: 'from-amber-600/30 via-purple-600/30 to-amber-600/30 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'ctitle_kiem_ton',
    name: 'Vạn Kiếm Tiên Tôn',
    badgeImageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&auto=format&fit=crop&q=80',
    description: 'Chưởng quản vạn kiếm, sát phạt vô song trên kỳ bàn',
    unlockedAtRealm: 5,
    price: 1000,
    inShop: true,
    textColor: 'text-cyan-300',
    bgGradient: 'from-cyan-900/60 to-purple-900/60 border-cyan-400',
    createdAt: Date.now() - 86400000 * 10,
  },
];

const FRAMES_KEY = 'tien_ky_custom_frames_v1';
const DHARMA_KEY = 'tien_ky_dharma_idols_v1';
const ARTIFACTS_KEY = 'tien_ky_custom_artifacts_v1';
const TITLES_KEY = 'tien_ky_custom_titles_v1';

export function loadCustomFrames(): CustomFrame[] {
  if (typeof window === 'undefined') return DEFAULT_FRAMES;
  try {
    const raw = localStorage.getItem(FRAMES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_FRAMES;
}

export function saveCustomFrames(frames: CustomFrame[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FRAMES_KEY, JSON.stringify(frames));
    // Asynchronously push to server cloud store for cross-device sync
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_FRAMES', frames }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

export function loadDharmaIdols(): DharmaIdol[] {
  if (typeof window === 'undefined') return DEFAULT_DHARMA_IDOLS;
  try {
    const raw = localStorage.getItem(DHARMA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_DHARMA_IDOLS;
}

export function saveDharmaIdols(idols: DharmaIdol[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DHARMA_KEY, JSON.stringify(idols));
    // Asynchronously push to server cloud store
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_DHARMA', dharmaIdols: idols }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

export function loadCustomArtifacts(): CustomArtifact[] {
  if (typeof window === 'undefined') return DEFAULT_ARTIFACTS;
  try {
    const raw = localStorage.getItem(ARTIFACTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_ARTIFACTS;
}

export function saveCustomArtifacts(artifacts: CustomArtifact[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(artifacts));
    // Asynchronously push to server cloud store
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_ARTIFACTS', artifacts }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

export function loadCustomTitles(): CustomTitle[] {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_TITLES;
  try {
    const raw = localStorage.getItem(TITLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CUSTOM_TITLES;
}

export function saveCustomTitles(titles: CustomTitle[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TITLES_KEY, JSON.stringify(titles));
    // Asynchronously push to server cloud store
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SYNC_TITLES', titles }),
    }).catch(() => {});
  } catch {
    // fallback
  }
}

/**
 * Fetch latest items from cloud server and merge into local storage.
 * Used when app mounts on any device (phone, laptop, tablet).
 */
export async function syncItemsFromCloud(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.success) return false;

    // Merge custom frames
    if (Array.isArray(data.customFrames) && data.customFrames.length > 0) {
      const current = loadCustomFrames();
      const map = new Map<string, CustomFrame>();
      current.forEach((f) => map.set(f.id, f));
      data.customFrames.forEach((f: CustomFrame) => map.set(f.id, f));
      const merged = Array.from(map.values());
      localStorage.setItem(FRAMES_KEY, JSON.stringify(merged));
    }

    // Merge dharma idols
    if (Array.isArray(data.dharmaIdols) && data.dharmaIdols.length > 0) {
      const current = loadDharmaIdols();
      const map = new Map<string, DharmaIdol>();
      current.forEach((d) => map.set(d.id, d));
      data.dharmaIdols.forEach((d: DharmaIdol) => map.set(d.id, d));
      const merged = Array.from(map.values());
      localStorage.setItem(DHARMA_KEY, JSON.stringify(merged));
    }

    // Merge artifacts
    if (Array.isArray(data.customArtifacts) && data.customArtifacts.length > 0) {
      const current = loadCustomArtifacts();
      const map = new Map<string, CustomArtifact>();
      current.forEach((a) => map.set(a.id, a));
      data.customArtifacts.forEach((a: CustomArtifact) => map.set(a.id, a));
      const merged = Array.from(map.values());
      localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(merged));
    }

    // Merge titles
    if (Array.isArray(data.customTitles) && data.customTitles.length > 0) {
      const current = loadCustomTitles();
      const map = new Map<string, CustomTitle>();
      current.forEach((t) => map.set(t.id, t));
      data.customTitles.forEach((t: CustomTitle) => map.set(t.id, t));
      const merged = Array.from(map.values());
      localStorage.setItem(TITLES_KEY, JSON.stringify(merged));
    }

    return true;
  } catch (err) {
    console.warn('[Sync] Could not pull items from server cloud:', err);
    return false;
  }
}
