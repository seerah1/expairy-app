/**
 * Storage types for food items
 */
export const STORAGE_TYPES = ['Refrigerator', 'Freezer', 'Pantry', 'Counter'] as const;

export type StorageType = (typeof STORAGE_TYPES)[number];

/**
 * Storage type icons mapping (for UI display)
 * Note: Emojis removed for professional design
 */
// export const STORAGE_TYPE_ICONS: Record<StorageType, string> = {
//   Refrigerator: '🧊',
//   Freezer: '❄️',
//   Pantry: '🚪',
//   Counter: '🏠',
// };
