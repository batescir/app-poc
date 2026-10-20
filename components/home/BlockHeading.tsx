import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { maxFontScale, spacing, typeScale } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

function BlockHeadingComponent({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[typeScale.sectionHeading, styles.heading, { color: colors.text, borderLeftColor: colors.accent }]}
      allowFontScaling
      maxFontSizeMultiplier={maxFontScale.headline}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 4,
  },
});

export const BlockHeading = memo(BlockHeadingComponent);
