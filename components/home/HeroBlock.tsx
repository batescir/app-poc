import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HeroLayoutBlock } from '../../lib/buildHomeLayout';
import { openStory } from '../../lib/openStory';
import { imageSizes, maxFontScale, minTapTarget, spacing, typeScale } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { StoryImage } from './StoryImage';

function HeroBlockComponent({ block }: { block: HeroLayoutBlock }) {
  const { colors } = useTheme();
  const { story } = block;
  return (
    <Pressable
      onPress={() => openStory(story.path)}
      accessibilityRole="link"
      accessibilityLabel={story.headline}
      accessibilityHint="Opens the story on adn.com"
      style={({ pressed }) => [styles.container, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      {story.imageUrl ? <StoryImage uri={story.imageUrl} headline={story.headline} style={styles.image} /> : null}
      <View style={styles.text}>
        <Text
          style={[typeScale.heroHeadline, { color: colors.text }]}
          allowFontScaling
          maxFontSizeMultiplier={maxFontScale.headline}
        >
          {story.headline}
        </Text>
        {story.summary ? (
          <Text
            style={[typeScale.body, styles.summary, { color: colors.textMuted }]}
            allowFontScaling
            maxFontSizeMultiplier={maxFontScale.body}
          >
            {story.summary}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: minTapTarget, borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: spacing.lg },
  image: { width: '100%', aspectRatio: imageSizes.heroAspectRatio },
  text: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  summary: { marginTop: spacing.sm },
});

export const HeroBlock = memo(HeroBlockComponent);
