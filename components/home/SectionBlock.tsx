import { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, type ListRenderItem } from 'react-native';

import type { SectionLayoutBlock } from '../../lib/buildHomeLayout';
import { openStory } from '../../lib/openStory';
import type { Story } from '../../services/homepage/types';
import { imageSizes, maxFontScale, minTapTarget, radius, spacing, typeScale } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { BlockHeading } from './BlockHeading';
import { StoryImage } from './StoryImage';

const StoryCard = memo(function StoryCard({ story }: { story: Story }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => openStory(story.path)}
      accessibilityRole="link"
      accessibilityLabel={story.headline}
      accessibilityHint="Opens the story on adn.com"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {story.imageUrl ? <StoryImage uri={story.imageUrl} headline={story.headline} style={styles.cardImage} /> : null}
      <Text
        style={[typeScale.cardHeadline, styles.cardHeadline, { color: colors.text }]}
        numberOfLines={story.imageUrl ? 4 : 7}
        allowFontScaling
        maxFontSizeMultiplier={maxFontScale.headline}
      >
        {story.headline}
      </Text>
    </Pressable>
  );
});

const keyExtractor = (story: Story) => story.path;

function SectionBlockComponent({ block }: { block: SectionLayoutBlock }) {
  const renderItem = useCallback<ListRenderItem<Story>>(({ item }) => <StoryCard story={item} />, []);
  return (
    <View style={styles.container}>
      <BlockHeading title={block.heading} />
      <FlatList
        horizontal
        data={block.stories}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        accessibilityLabel={`${block.heading} stories`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.lg },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md },
  card: {
    width: imageSizes.cardWidth,
    minHeight: minTapTarget,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: imageSizes.cardImageHeight },
  cardHeadline: { padding: spacing.md },
});

export const SectionBlock = memo(SectionBlockComponent);
