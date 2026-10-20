import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FeaturedLayoutBlock } from '../../lib/buildHomeLayout';
import { openStory } from '../../lib/openStory';
import type { Story } from '../../services/homepage/types';
import { imageSizes, maxFontScale, minTapTarget, radius, spacing, typeScale } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { BlockHeading } from './BlockHeading';
import { StoryImage } from './StoryImage';

const FeaturedRow = memo(function FeaturedRow({ story }: { story: Story }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => openStory(story.path)}
      accessibilityRole="link"
      accessibilityLabel={story.headline}
      accessibilityHint="Opens the story on adn.com"
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      {story.imageUrl ? <StoryImage uri={story.imageUrl} headline={story.headline} style={styles.thumb} /> : null}
      <Text
        style={[typeScale.headline, styles.headline, { color: colors.text }]}
        allowFontScaling
        maxFontSizeMultiplier={maxFontScale.headline}
      >
        {story.headline}
      </Text>
    </Pressable>
  );
});

function FeaturedBlockComponent({ block }: { block: FeaturedLayoutBlock }) {
  return (
    <View style={styles.container}>
      {block.heading ? <BlockHeading title={block.heading} /> : null}
      {/* Rows render inline: a nested vertical FlatList inside the page FlatList would not virtualize. */}
      {block.stories.map((story) => (
        <FeaturedRow key={story.path} story={story} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: minTapTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  thumb: { width: imageSizes.thumbnail, height: imageSizes.thumbnail, borderRadius: radius.sm },
  headline: { flex: 1 },
});

export const FeaturedBlock = memo(FeaturedBlockComponent);
