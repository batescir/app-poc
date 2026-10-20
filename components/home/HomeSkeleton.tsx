import { StyleSheet, View } from 'react-native';

import { imageSizes, pageGutter, radius, spacing } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

export function HomeSkeleton() {
  const { colors } = useTheme();
  const bone = { backgroundColor: colors.skeleton };
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessible
      accessibilityLabel="Loading homepage"
      accessibilityRole="progressbar"
      testID="home-skeleton"
    >
      <View style={[styles.hero, bone]} />
      <View style={styles.pad}>
        <View style={[styles.line, styles.lineWide, bone]} />
        <View style={[styles.line, bone]} />
      </View>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.row}>
          <View style={styles.rowText}>
            <View style={[styles.line, styles.lineWide, bone]} />
            <View style={[styles.line, bone]} />
          </View>
          <View style={[styles.thumb, bone]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: pageGutter, paddingTop: spacing.lg },
  hero: { width: '100%', aspectRatio: imageSizes.heroAspectRatio },
  pad: { paddingVertical: spacing.lg, gap: spacing.sm },
  line: { height: 16, borderRadius: radius.sm, width: '60%' },
  lineWide: { width: '90%' },
  row: { flexDirection: 'row', paddingVertical: spacing.lg, gap: spacing.md },
  thumb: {
    width: `${imageSizes.featuredImageWidthRatio * 100}%`,
    aspectRatio: imageSizes.featuredAspectRatio,
    borderRadius: radius.sm,
  },
  rowText: { flex: 1, gap: spacing.sm, justifyContent: 'flex-start' },
});
