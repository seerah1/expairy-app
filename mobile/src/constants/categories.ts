/**
 * Food categories for classification
 */
export const FOOD_CATEGORIES = [
  'Dairy',
  'Meat',
  'Vegetables',
  'Fruits',
  'Grains',
  'Beverages',
  'Condiments',
  'Frozen',
  'Canned',
  'Other',
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

/**
 * Category icons mapping (for UI display)
 * Note: Emojis removed for professional design
 */
// export const CATEGORY_ICONS: Record<FoodCategory, string> = {
//   Dairy: '🥛',
//   Meat: '🥩',
//   Vegetables: '🥬',
//   Fruits: '🍎',
//   Grains: '🌾',
//   Beverages: '🥤',
//   Condiments: '🧂',
//   Frozen: '❄️',
//   Canned: '🥫',
//   Other: '📦',
// };
