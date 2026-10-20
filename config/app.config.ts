export type AppConfig = {
  homepageUrl: string;
  userAgent: string;
  requestTimeoutMs: number;
  cacheLayout: boolean;
  cacheTtlMinutes: number;
  storyUrlPattern: string;
  useMockData: boolean;
  cacheKey: string;
};

export const appConfig: AppConfig = {
  homepageUrl: 'https://adn.com/',
  userAgent: 'ADN-App/1.0',
  requestTimeoutMs: 8000,
  cacheLayout: true,
  cacheTtlMinutes: 5,
  storyUrlPattern: 'https://adn.com{path}',
  useMockData: true,
  cacheKey: 'adn.homepage.layout',
};
