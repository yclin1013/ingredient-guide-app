import fruitsData from './fruits.json';
import meatsData from './meats.json';
import seafoodData from './seafood.json';
import type { Ingredient } from './types';
import vegetablesData from './vegetables.json';

export type { Category, Ingredient, Nutrient, Variant } from './types';

export const ITEMS: Ingredient[] = [
  ...(vegetablesData as Ingredient[]),
  ...(fruitsData as Ingredient[]),
  ...(seafoodData as Ingredient[]),
  ...(meatsData as Ingredient[]),
];

export function formatSeasonShort(item: Ingredient): string {
  if (item.variants) return '依品種而異';
  if (!item.months) return item.seasonNote || '全年供應';
  if (item.months.length >= 12) return '全年供應';
  const min = Math.min(...item.months);
  const max = Math.max(...item.months);
  return `${min}–${max} 月當季`;
}

export function isMonthsInSeason(months: number[] | undefined, currentMonth: number): boolean {
  return Array.isArray(months) && months.length < 12 && months.includes(currentMonth);
}

export function isItemInSeason(item: Ingredient, currentMonth: number): boolean {
  if (item.variants) return item.variants.some((v) => isMonthsInSeason(v.months, currentMonth));
  return isMonthsInSeason(item.months, currentMonth);
}

export function searchItems(query: string): Ingredient[] {
  const q = query.trim();
  if (!q) return [];
  return ITEMS.filter((i) => i.name.includes(q));
}
