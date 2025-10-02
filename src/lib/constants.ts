
import type { Category, FrameOption, BundleDeal } from '@/lib/types';

export const CATEGORIES: Category[] = [
  'EVO WALL POSTER & FRAMES',
  'CAR FRAMES AND WALL POSTERS',
  'ANIME FRAMES AND WALLPOSTERS',
  'SUPERHERO FRAMES AND POSTERS',
];

export const FRAME_OPTIONS: FrameOption[] = [
  { size: 'A4', finish: 'Black', price: 377 },
  { size: 'A3', finish: 'Black', price: 477 },
];

export const BUNDLE_DEALS: BundleDeal[] = [
  { buy: 15, get: 8, total: 23 },
  { buy: 12, get: 6, total: 18 },
  { buy: 10, get: 4, total: 14 },
];

export const MIN_ORDER_QUANTITY = 6;

export const POSTER_SIZES = {
  A4: { price: 79 },
  A3: { price: 109 },
};
