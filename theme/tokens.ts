/**
 * Visual tokens matched to adn.com's mobile body styles (measured from the live page and
 * its site stylesheet): PT Serif headlines, Lato section labels, #232B39 text, #CCCCCC
 * story dividers, ADN dark blue #3D4460 and link blue #4255A0, 16px page gutters.
 */
export const palette = {
  light: {
    background: '#FFFFFF',
    surface: '#F2F5FF',
    text: '#232B39',
    textMuted: '#575757',
    border: '#CCCCCC',
    accent: '#4255A0',
    brand: '#3D4460',
    skeleton: '#E6E7EB',
    devBanner: '#FFF4CC',
    onAccent: '#FFFFFF',
  },
  dark: {
    background: '#121418',
    surface: '#1E222B',
    text: '#ECEEF3',
    textMuted: '#A9ADB8',
    border: '#3A3F4B',
    accent: '#8FA3E8',
    brand: '#3D4460',
    skeleton: '#262A33',
    devBanner: '#3A3215',
    onAccent: '#FFFFFF',
  },
} as const;

export type ColorTokens = { [K in keyof typeof palette.light]: string };

/** Font assets loaded in app/_layout.tsx. Each weight is its own family so Android renders it. */
export const fonts = {
  serifRegular: 'PTSerif_400Regular',
  serifBold: 'PTSerif_700Bold',
  sansRegular: 'Lato_400Regular',
  sansBold: 'Lato_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** adn.com mobile gutter (section[role=main] padding). */
export const pageGutter = spacing.lg;

export const typeScale = {
  heroHeadline: { fontFamily: fonts.serifBold, fontSize: 22, lineHeight: 26 },
  sectionHeading: { fontFamily: fonts.sansBold, fontSize: 18, lineHeight: 23 },
  headline: { fontFamily: fonts.serifBold, fontSize: 18, lineHeight: 22 },
  cardHeadline: { fontFamily: fonts.serifBold, fontSize: 16, lineHeight: 20 },
  body: { fontFamily: fonts.sansRegular, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.sansRegular, fontSize: 12, lineHeight: 16 },
} as const;

/** Dynamic Type cap: text grows with the system setting up to this multiplier. */
export const maxFontScale = {
  headline: 1.6,
  body: 1.8,
  caption: 1.4,
} as const;

export const radius = { sm: 0, md: 5 } as const;

export const minTapTarget = 44;

export const divider = { width: 1 } as const;

export const imageSizes = {
  heroAspectRatio: 3 / 2,
  /** Featured rows: image on the right at ~37% of the content width, as on adn.com. */
  featuredImageWidthRatio: 0.37,
  featuredAspectRatio: 3 / 2,
  cardWidth: 260,
  cardAspectRatio: 3 / 2,
} as const;
