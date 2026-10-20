export const palette = {
  light: {
    background: '#FFFFFF',
    surface: '#F4F4F2',
    text: '#111111',
    textMuted: '#55585C',
    border: '#DDDDDA',
    accent: '#B5121B',
    skeleton: '#E6E6E3',
    devBanner: '#FFF4CC',
    onAccent: '#FFFFFF',
  },
  dark: {
    background: '#0F1012',
    surface: '#1B1D20',
    text: '#F2F2F0',
    textMuted: '#A7AAAF',
    border: '#2E3135',
    accent: '#F0545C',
    skeleton: '#26292D',
    devBanner: '#3A3215',
    onAccent: '#FFFFFF',
  },
} as const;

export type ColorTokens = { [K in keyof typeof palette.light]: string };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const typeScale = {
  heroHeadline: { fontSize: 26, lineHeight: 32, fontWeight: '700' as const },
  sectionHeading: { fontSize: 20, lineHeight: 26, fontWeight: '800' as const },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  cardHeadline: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

/** Dynamic Type cap: text grows with the system setting up to this multiplier. */
export const maxFontScale = {
  headline: 1.6,
  body: 1.8,
  caption: 1.4,
} as const;

export const radius = { sm: 4, md: 8 } as const;

export const minTapTarget = 44;

export const imageSizes = {
  heroAspectRatio: 3 / 2,
  thumbnail: 96,
  cardWidth: 220,
  cardImageHeight: 132,
} as const;
