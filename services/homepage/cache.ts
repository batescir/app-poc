import AsyncStorage from '@react-native-async-storage/async-storage';

import { appConfig } from '../../config/app.config';
import type { Block, SkippedBlock } from './types';

export type CachedLayout = {
  savedAt: number;
  blocks: Block[];
  skipped: SkippedBlock[];
};

export async function readCachedLayout(): Promise<CachedLayout | null> {
  try {
    const raw = await AsyncStorage.getItem(appConfig.cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLayout;
    if (typeof parsed?.savedAt !== 'number' || !Array.isArray(parsed.blocks)) return null;
    return { ...parsed, skipped: parsed.skipped ?? [] };
  } catch {
    return null;
  }
}

/** Stores parsed blocks (never raw HTML). No-op when `cacheLayout` is off. */
export async function writeCachedLayout(blocks: Block[], skipped: SkippedBlock[], now = Date.now()): Promise<void> {
  if (!appConfig.cacheLayout) return;
  const value: CachedLayout = { savedAt: now, blocks, skipped };
  try {
    await AsyncStorage.setItem(appConfig.cacheKey, JSON.stringify(value));
  } catch {
    // Cache is best-effort.
  }
}

export function isCacheFresh(cache: CachedLayout, now = Date.now()): boolean {
  return now - cache.savedAt < appConfig.cacheTtlMinutes * 60_000;
}
