import { Apple, Beef, Fish, Sprout, type LucideIcon } from 'lucide-react-native';
import type { Category } from './data/ingredients';

export const INK = '#1F2E22';
export const MUTED = '#8A8779';
export const PAPER = '#F3F5EE';
export const LINE = '#E4E1D5';
export const STAMP_RED = '#B33A2E';

export const FONT = {
  display: 'NotoSerifTC_700Bold',
  sans: 'NotoSansTC_400Regular',
  sansMedium: 'NotoSansTC_500Medium',
  mono: 'JetBrainsMono_500Medium',
};

export const CATS: Record<Category, { Icon: LucideIcon; color: string }> = {
  蔬菜: { Icon: Sprout, color: '#3F6B4A' },
  水果: { Icon: Apple, color: '#E08A2C' },
  海鮮: { Icon: Fish, color: '#2E6E8E' },
  肉品: { Icon: Beef, color: '#8B4A32' },
};

/** 對應網頁雛形的 color + '1A'（10% 透明度背景） */
export function tint(color: string): string {
  return color + '1A';
}
