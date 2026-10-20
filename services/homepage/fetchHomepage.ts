import { appConfig } from '../../config/app.config';

export class FetchTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Homepage request timed out after ${timeoutMs}ms`);
    this.name = 'FetchTimeoutError';
  }
}

export type FetchHomepageOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

/** Fetches the homepage HTML once. No retries: callers decide when to fetch. */
export async function fetchHomepage({
  fetchImpl = fetch,
  timeoutMs = appConfig.requestTimeoutMs,
}: FetchHomepageOptions = {}): Promise<string> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetchImpl(appConfig.homepageUrl, {
      headers: { 'User-Agent': appConfig.userAgent, Accept: 'text/html' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Homepage request failed with HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    if (timedOut) throw new FetchTimeoutError(timeoutMs);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
