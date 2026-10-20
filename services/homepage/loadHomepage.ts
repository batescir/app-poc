import { appConfig } from '../../config/app.config';
import fixtureHtml from './__fixtures__/homepage.html';
import { isCacheFresh, readCachedLayout, writeCachedLayout } from './cache';
import { detectBlocks } from './detectBlocks';
import { fetchHomepage } from './fetchHomepage';
import type { Block, LayoutSource, SkippedBlock } from './types';

export type HomepageResult = {
  blocks: Block[];
  skipped: SkippedBlock[];
  source: LayoutSource;
  updatedAt: number;
  /** Set when live data was wanted but the fetch or parse failed and the cache was shown instead. */
  error?: string;
};

export class HomepageUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HomepageUnavailableError';
  }
}

export type LoadHomepageOptions = {
  /** Pull-to-refresh / retry: fetch regardless of cache age or the once-per-launch limit. */
  force?: boolean;
  useMockData?: boolean;
  fetchHtml?: () => Promise<string>;
  now?: () => number;
};

let automaticFetchDone = false;

/** Test hook: simulates a fresh app launch. */
export function resetLaunchState(): void {
  automaticFetchDone = false;
}

export async function loadHomepage({
  force = false,
  useMockData = appConfig.useMockData,
  fetchHtml = () => fetchHomepage(),
  now = Date.now,
}: LoadHomepageOptions = {}): Promise<HomepageResult> {
  if (useMockData) {
    const { blocks, skipped } = detectBlocks(fixtureHtml);
    if (blocks.length === 0) throw new HomepageUnavailableError('The saved fixture produced no blocks.');
    return { blocks, skipped, source: 'fixture', updatedAt: now() };
  }

  const cached = appConfig.cacheLayout ? await readCachedLayout() : null;
  const shouldFetch = force || (!automaticFetchDone && !(cached && isCacheFresh(cached, now())));

  if (!shouldFetch) {
    if (cached) return { blocks: cached.blocks, skipped: cached.skipped, source: 'cache', updatedAt: cached.savedAt };
    throw new HomepageUnavailableError('No cached homepage. Pull to refresh or retry.');
  }

  if (!force) automaticFetchDone = true;

  let failure: string;
  try {
    const html = await fetchHtml();
    const { blocks, skipped } = detectBlocks(html);
    if (blocks.length > 0) {
      const updatedAt = now();
      await writeCachedLayout(blocks, skipped, updatedAt);
      return { blocks, skipped, source: 'live', updatedAt };
    }
    failure = 'The homepage loaded but no story blocks were found.';
  } catch (err) {
    failure = err instanceof Error ? err.message : String(err);
  }

  if (cached) {
    return { blocks: cached.blocks, skipped: cached.skipped, source: 'cache', updatedAt: cached.savedAt, error: failure };
  }
  throw new HomepageUnavailableError(failure);
}
