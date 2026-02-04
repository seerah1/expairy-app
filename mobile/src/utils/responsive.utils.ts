import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BASE_WIDTH = 375; // iPhone SE / standard design width

/**
 * Scale function for spacing, padding, margin, gap, borderRadius, icon sizes, width/height
 * Linear scaling based on screen width
 */
export const s = (size: number): number => {
  return Math.round((width / BASE_WIDTH) * size);
};

/**
 * Moderate scale function for font sizes
 * Dampened scaling so text doesn't grow/shrink too aggressively
 * @param size - The base size to scale
 * @param factor - The scaling factor (default 0.3)
 */
export const ms = (size: number, factor: number = 0.3): number => {
  return Math.round(size + (s(size) - size) * factor);
};
