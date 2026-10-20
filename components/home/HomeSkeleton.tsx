import { StyleSheet, View } from 'react-native';

import { imageSizes, radius, spacing } from '../../theme/tokens';
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
          <View style={[styles.thumb, bone]} />
          <View style={styles.rowText}>
            <View style={[styles.line, styles.lineWide, bone]} />
            <View style={[styles.line, bone]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { width: '100%', aspectRatio: imageSizes.heroAspectRatio },
  pad: { padding: spacing.lg, gap: spacing.sm },
  line: { height: 16, borderRadius: radius.sm, width: '60%' },
  lineWide: { width: '90%' },
  row: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  thumb: { width: imageSizes.thumbnail, height: imageSizes.thumbnail, borderRadius: radius.sm },
  rowText: { flex: 1, gap: spacing.sm, justifyContent: 'center' },
});
