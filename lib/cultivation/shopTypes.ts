import {
  CustomFrame,
  DharmaIdol,
  CustomArtifact,
  DEFAULT_CUSTOM_FRAMES,
  DEFAULT_DHARMA_IDOLS,
  DEFAULT_CUSTOM_ARTIFACTS,
} from './shopAndFrames';

export type { CustomFrame, DharmaIdol, CustomArtifact };
export const DEFAULT_FRAMES = DEFAULT_CUSTOM_FRAMES;
export const DEFAULT_ARTIFACTS = DEFAULT_CUSTOM_ARTIFACTS;
export { DEFAULT_DHARMA_IDOLS };

export interface CustomTitle {
  id: string;
  name: string;
  price: number;
  color?: string;
  description?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  minRealmLevel?: number;
  updatedAt?: number;
}

export const DEFAULT_CUSTOM_TITLES: CustomTitle[] = [
  {
    id: 'title_celestial_master',
    name: 'Thần Thông Quảng Đại',
    price: 1500,
    color: '#ffd700',
    description: 'Danh hiệu dành cho những kỳ thủ pháp lực vô biên.',
    rarity: 'legendary',
    minRealmLevel: 6,
  },
  {
    id: 'title_sword_immortal',
    name: 'Nhất Kiếm Khuynh Thành',
    price: 1200,
    color: '#a855f7',
    description: 'Kiếm ý tung hoành khắp tam giới lục đạo.',
    rarity: 'epic',
    minRealmLevel: 4,
  },
  {
    id: 'title_lotus_sage',
    name: 'Bạch Liên Chân Nhân',
    price: 800,
    color: '#10b981',
    description: 'Tâm như bạch liên, bất nhiễm trần ai thế tục.',
    rarity: 'rare',
    minRealmLevel: 2,
  },
];
