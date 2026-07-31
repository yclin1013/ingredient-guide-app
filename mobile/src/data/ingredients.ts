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

/** 把月份陣列拆成連續區間（月份文字，例如 "12–2月"），12 月接 1 月視為連續 */
export function getSeasonRanges(months: number[]): string[] {
  const uniqueSorted = [...new Set(months)].sort((a, b) => a - b);
  if (uniqueSorted.length === 0) return [];
  if (uniqueSorted.length >= 12) return ['全年供應'];

  const present = new Set(uniqueSorted);
  const prevMonth = (m: number) => (m === 1 ? 12 : m - 1);
  const nextMonth = (m: number) => (m === 12 ? 1 : m + 1);

  const starts = uniqueSorted.filter((m) => !present.has(prevMonth(m)));
  return starts.map((start) => {
    let end = start;
    while (present.has(nextMonth(end)) && nextMonth(end) !== start) {
      end = nextMonth(end);
    }
    return start === end ? `${start}月` : `${start}–${end}月`;
  });
}

export function formatSeasonShort(item: Ingredient): string {
  if (item.variants) return '依品種而異';
  if (!item.months) return item.seasonNote || '全年供應';
  const ranges = getSeasonRanges(item.months);
  if (ranges.length === 0) return item.seasonNote || '全年供應';
  return ranges.join('、');
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
