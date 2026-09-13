/**
 * @file lib/storage.ts
 * Lightweight LocalStorage helper for saving custom TikTok Shop fee settings.
 */

import { TikTokFeeSettings } from '../types';
import { DEFAULT_TIKTOK_FEES } from './priceSolver';

const STORAGE_KEY_TIKTOK_FEES = '3d_calc_tiktok_fees_v3';

export function loadTikTokFeeSettings(): TikTokFeeSettings {
  if (typeof window === 'undefined') return DEFAULT_TIKTOK_FEES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIKTOK_FEES);
    if (!raw) return DEFAULT_TIKTOK_FEES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TIKTOK_FEES, ...parsed };
  } catch {
    return DEFAULT_TIKTOK_FEES;
  }
}

export function saveTikTokFeeSettings(fees: TikTokFeeSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TIKTOK_FEES, JSON.stringify(fees));
  } catch (err) {
    console.error('Error saving TikTok fee settings:', err);
  }
}
