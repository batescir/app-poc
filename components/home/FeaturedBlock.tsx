import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FeaturedLayoutBlock } from '../../lib/buildHomeLayout';
import { openStory } from '../../lib/openStory';
import type { Story } from '../../services/homepage/types';
import { divider, imageSizes, maxFontScale, minTapTarget, pageGutter, spacing, typeScale } from '../../theme/tokens';
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
      <Text
        style={[typeScale.headline, styles.headline, { color: colors.text }]}
        allowFontScaling
        maxFontSizeMultiplier={maxFontScale.headline}
      >
        {story.headline}
      </Text>
      {story.imageUrl ? <StoryImage uri={story.imageUrl} headline={story.headline} style={styles.image} /> : null}
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
  container: { paddingHorizontal: pageGutter },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: minTapTarget,
    paddingVertical: spacing.lg,
    borderBottomWidth: divider.width,
    gap: spacing.md,
  },
  headline: { flex: 1 },
  image: { width: `${imageSizes.featuredImageWidthRatio * 100}%`, aspectRatio: imageSizes.featuredAspectRatio },
});

export const FeaturedBlock = memo(FeaturedBlockComponent);
