/**
 * Date utility functions for mobile app
 */

/**
 * Calculate remaining days until expiry
 * @param expiryDate - Expiry date in ISO format (YYYY-MM-DD)
 * @returns Number of days remaining (negative if expired)
 */
export const calculateRemainingDays = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Calculate status based on remaining days
 * @param remainingDays - Number of days remaining
 * @returns Status: 'Expired', 'Expiring Soon', or 'Safe'
 */
export const calculateStatus = (remainingDays: number): 'Expired' | 'Expiring Soon' | 'Safe' => {
  if (remainingDays < 0) {
    return 'Expired';
  } else if (remainingDays <= 7) {
    return 'Expiring Soon';
  } else {
    return 'Safe';
  }
};

/**
 * Format date to ISO format (YYYY-MM-DD)
 * @param date - Date object
 * @returns ISO formatted date string
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display
 * @param dateString - Date string in ISO format
 * @returns Formatted date string (e.g., "Jan 23, 2026")
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get relative time string
 * @param remainingDays - Number of days remaining
 * @returns Relative time string (e.g., "Expires in 5 days", "Expired 2 days ago")
 */
export const getRelativeTimeString = (remainingDays: number): string => {
  if (remainingDays === 0) {
    return 'Expires today';
  } else if (remainingDays === 1) {
    return 'Expires tomorrow';
  } else if (remainingDays > 1) {
    return `Expires in ${remainingDays} days`;
  } else if (remainingDays === -1) {
    return 'Expired yesterday';
  } else {
    return `Expired ${Math.abs(remainingDays)} days ago`;
  }
};

/**
 * Validate date string format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export const isValidDateString = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};
