/**
 * Document types for classification
 */
export const DOCUMENT_TYPES = [
  'Passport',
  'Driver License',
  'ID Card',
  'Insurance Policy',
  'Medical Record',
  'Visa',
  'Vehicle Registration',
  'Professional License',
  'Other',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/**
 * Document type icons mapping (for UI display)
 */
export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  Passport: '🛂',
  'Driver License': '🚗',
  'ID Card': '🪪',
  'Insurance Policy': '📋',
  'Medical Record': '🏥',
  Visa: '✈️',
  'Vehicle Registration': '🚙',
  'Professional License': '📜',
  Other: '📄',
};
