import { StyleSheet, Text, View } from 'react-native';

import type { LayoutSource, SkippedBlock } from '../../services/homepage/types';
import { maxFontScale, spacing, typeScale } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

type Props = { source: LayoutSource; updatedAt: number; skipped: SkippedBlock[]; error?: string };

/** Development-only: shows where the layout came from and which blocks were skipped. */
export function DevStatus({ source, updatedAt, skipped, error }: Props) {
  const { colors } = useTheme();
  const textStyle = [typeScale.caption, { color: colors.text }];
  return (
    <View style={[styles.container, { backgroundColor: colors.devBanner }]} testID="dev-status">
      <Text style={textStyle} allowFontScaling maxFontSizeMultiplier={maxFontScale.caption}>
        DEV · source: {source} · {new Date(updatedAt).toLocaleString()}
      </Text>
      {error ? (
        <Text style={textStyle} allowFontScaling maxFontSizeMultiplier={maxFontScale.caption}>
          Live fetch failed: {error}
        </Text>
      ) : null}
      {skipped.map((s, i) => (
        <Text key={`${s.rule}-${i}`} style={textStyle} allowFontScaling maxFontSizeMultiplier={maxFontScale.caption}>
          skipped {s.heading ? `"${s.heading}"` : s.rule}: {s.reason}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 2 },
});
