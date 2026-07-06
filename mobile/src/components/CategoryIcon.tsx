import type { Category } from '../data/ingredients';
import { CATS } from '../theme';

type Props = { category: Category; size?: number; color?: string };

export default function CategoryIcon({ category, size = 28, color }: Props) {
  const { Icon, color: catColor } = CATS[category];
  return <Icon size={size} color={color || catColor} />;
}
