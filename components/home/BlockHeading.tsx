import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { maxFontScale, spacing, typeScale } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

function BlockHeadingComponent({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[typeScale.sectionHeading, styles.heading, { color: colors.text }]}
      allowFontScaling
      maxFontSizeMultiplier={maxFontScale.headline}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.sm },
});

export const BlockHeading = memo(BlockHeadingComponent);
