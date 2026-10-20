import { appConfig } from '../../../config/app.config';
import { FetchTimeoutError, fetchHomepage } from '../fetchHomepage';

const hangingFetch = ((_url: string, init?: RequestInit) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
  })) as unknown as typeof fetch;

describe('fetchHomepage', () => {
  it('requests homepageUrl with the configured user agent', async () => {
    const fetchImpl = jest.fn(async () => ({ ok: true, status: 200, text: async () => '<html></html>' }));
    await expect(fetchHomepage({ fetchImpl: fetchImpl as unknown as typeof fetch })).resolves.toBe('<html></html>');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = (fetchImpl.mock.calls[0] as unknown) as [string, RequestInit];
    expect(url).toBe(appConfig.homepageUrl);
    expect((init.headers as Record<string, string>)['User-Agent']).toBe(appConfig.userAgent);
  });

  it('aborts and throws FetchTimeoutError after the timeout', async () => {
    await expect(fetchHomepage({ fetchImpl: hangingFetch, timeoutMs: 20 })).rejects.toBeInstanceOf(FetchTimeoutError);
  });

  it('rejects on HTTP errors without retrying', async () => {
    const fetchImpl = jest.fn(async () => ({ ok: false, status: 503, text: async () => '' }));
    await expect(fetchHomepage({ fetchImpl: fetchImpl as unknown as typeof fetch })).rejects.toThrow('503');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
