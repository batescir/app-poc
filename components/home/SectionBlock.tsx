import { memo, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, type ListRenderItem } from 'react-native';

import type { SectionLayoutBlock } from '../../lib/buildHomeLayout';
import { openStory } from '../../lib/openStory';
import type { Story } from '../../services/homepage/types';
import { divider, imageSizes, maxFontScale, minTapTarget, pageGutter, spacing, typeScale } from '../../theme/tokens';
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
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}
    >
      {story.imageUrl ? <StoryImage uri={story.imageUrl} headline={story.headline} style={styles.cardImage} /> : null}
      <Text
        style={[typeScale.cardHeadline, styles.cardHeadline, { color: colors.text }]}
        numberOfLines={story.imageUrl ? 4 : 8}
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
  const { colors } = useTheme();
  const renderItem = useCallback<ListRenderItem<Story>>(({ item }) => <StoryCard story={item} />, []);
  return (
    <View style={styles.container}>
      <View style={[styles.rule, { borderTopColor: colors.border }]}>
        <BlockHeading title={block.heading} />
      </View>
      <FlatList
        horizontal
        data={block.stories}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        accessibilityLabel={`${block.heading} stories`}
      />
      <View style={[styles.bottomRule, { borderBottomColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg },
  rule: { marginHorizontal: pageGutter, borderTopWidth: divider.width, paddingTop: spacing.lg },
  list: { paddingHorizontal: pageGutter, gap: spacing.lg },
  card: { width: imageSizes.cardWidth, minHeight: minTapTarget },
  cardImage: { width: '100%', aspectRatio: imageSizes.cardAspectRatio },
  cardHeadline: { marginTop: spacing.xs },
  bottomRule: { marginHorizontal: pageGutter, marginTop: spacing.lg, borderBottomWidth: divider.width },
});

export const SectionBlock = memo(SectionBlockComponent);
