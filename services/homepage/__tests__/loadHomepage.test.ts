import AsyncStorage from '@react-native-async-storage/async-storage';

import { appConfig } from '../../../config/app.config';
import { writeCachedLayout } from '../cache';
import { FetchTimeoutError } from '../fetchHomepage';
import { HomepageUnavailableError, loadHomepage, resetLaunchState } from '../loadHomepage';
import type { Block } from '../types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const cachedBlocks: Block[] = [{ type: 'hero', stories: [{ path: '/a/2024/01/01/cached/', headline: 'Cached' }] }];
const liveHtml = `<section role="main"><div class="chain-container"><article><h2><a href="/a/2024/01/01/live/">Live</a></h2></article></div></section>`;
const NOW = 1_700_000_000_000;
const minutes = (n: number) => n * 60_000;

beforeEach(async () => {
  await AsyncStorage.clear();
  resetLaunchState();
});

describe('loadHomepage', () => {
  it('parses the fixture in mock mode without fetching', async () => {
    const fetchHtml = jest.fn();
    const result = await loadHomepage({ useMockData: true, fetchHtml });
    expect(result.source).toBe('fixture');
    expect(result.blocks.length).toBeGreaterThan(0);
    expect(fetchHtml).not.toHaveBeenCalled();
  });

  it('fetches live and caches parsed blocks, not raw HTML', async () => {
    const result = await loadHomepage({ useMockData: false, fetchHtml: async () => liveHtml, now: () => NOW });
    expect(result.source).toBe('live');
    const stored = JSON.parse((await AsyncStorage.getItem(appConfig.cacheKey))!);
    expect(stored).toEqual({ savedAt: NOW, blocks: result.blocks, skipped: result.skipped });
    expect(JSON.stringify(stored)).not.toContain('<section');
  });

  it('falls back to the cache when the fetch times out', async () => {
    await writeCachedLayout(cachedBlocks, [], NOW - minutes(60));
    const result = await loadHomepage({
      useMockData: false,
      fetchHtml: async () => {
        throw new FetchTimeoutError(8000);
      },
      now: () => NOW,
    });
    expect(result).toMatchObject({ source: 'cache', blocks: cachedBlocks, error: expect.stringContaining('timed out') });
  });

  it('falls back to the cache when the page has no blocks', async () => {
    await writeCachedLayout(cachedBlocks, [], NOW - minutes(60));
    const result = await loadHomepage({ useMockData: false, fetchHtml: async () => '<html></html>', now: () => NOW });
    expect(result.source).toBe('cache');
    expect(result.blocks).toEqual(cachedBlocks);
  });

  it('throws when the fetch fails and there is no cache', async () => {
    await expect(
      loadHomepage({ useMockData: false, fetchHtml: async () => Promise.reject(new Error('offline')), now: () => NOW }),
    ).rejects.toBeInstanceOf(HomepageUnavailableError);
  });

  it('uses a fresh cache without fetching', async () => {
    await writeCachedLayout(cachedBlocks, [], NOW - minutes(appConfig.cacheTtlMinutes - 1));
    const fetchHtml = jest.fn(async () => liveHtml);
    const result = await loadHomepage({ useMockData: false, fetchHtml, now: () => NOW });
    expect(result.source).toBe('cache');
    expect(fetchHtml).not.toHaveBeenCalled();
  });

  it('fetches automatically at most once per launch, but pull-to-refresh always fetches', async () => {
    const fetchHtml = jest.fn(async () => Promise.reject(new Error('offline')));
    await writeCachedLayout(cachedBlocks, [], NOW - minutes(60));
    await loadHomepage({ useMockData: false, fetchHtml, now: () => NOW });
    await loadHomepage({ useMockData: false, fetchHtml, now: () => NOW });
    expect(fetchHtml).toHaveBeenCalledTimes(1);
    await loadHomepage({ useMockData: false, fetchHtml, now: () => NOW, force: true });
    await loadHomepage({ useMockData: false, fetchHtml, now: () => NOW, force: true });
    expect(fetchHtml).toHaveBeenCalledTimes(3);
  });
});
