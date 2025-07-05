import type { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  'Groceries': '#4CAF50', // Green
  'Rent': '#3F51B5', // Indigo
  'Utilities': '#FFC107', // Amber
  'Transport': '#FF5722', // Deep Orange
  'Entertainment': '#9C27B0', // Purple
  'Other': '#607D8B', // Blue Grey
};

export const DEFAULT_COLOR = '#BDBDBD'; // Grey

export function getCategoryColor(category: Category | undefined | null): string {
  if (!category) return DEFAULT_COLOR;
  return CATEGORY_COLORS[category] || DEFAULT_COLOR;
}

export function getTextColorForBackground(hexColor: string): string {
  if (!hexColor) return '#000000';
  const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  if (cleanHex.length !== 6) return '#000000';
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 150) ? '#000000' : '#FFFFFF';
}
