import { useColorScheme } from 'react-native';

import { palette, type ColorTokens } from './tokens';

export type Theme = { scheme: 'light' | 'dark'; colors: ColorTokens };

export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: palette[scheme] };
}
