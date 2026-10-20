import { Pressable, StyleSheet, Text, View } from 'react-native';

import { maxFontScale, minTapTarget, radius, spacing, typeScale } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

type Props = { message: string; onRetry: () => void };

export function ErrorState({ message, onRetry }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        accessibilityRole="header"
        style={[typeScale.sectionHeading, { color: colors.text }]}
        allowFontScaling
        maxFontSizeMultiplier={maxFontScale.headline}
      >
        Couldn&apos;t load the homepage
      </Text>
      <Text
        style={[typeScale.body, styles.message, { color: colors.textMuted }]}
        allowFontScaling
        maxFontSizeMultiplier={maxFontScale.body}
      >
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading the homepage"
        style={({ pressed }) => [styles.button, { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={[typeScale.headline, { color: colors.onAccent }]} allowFontScaling maxFontSizeMultiplier={maxFontScale.caption}>
          Retry
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  message: { textAlign: 'center' },
  button: {
    minHeight: minTapTarget,
    minWidth: 120,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
