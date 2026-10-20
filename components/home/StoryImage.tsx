import { Image, type ImageStyle } from 'expo-image';
import { memo } from 'react';
import type { StyleProp } from 'react-native';

import { useTheme } from '../../theme/useTheme';

type Props = {
  uri: string;
  headline: string;
  style: StyleProp<ImageStyle>;
};

function StoryImageComponent({ uri, headline, style }: Props) {
  const { colors } = useTheme();
  return (
    <Image
      source={{ uri }}
      style={[{ backgroundColor: colors.skeleton }, style]}
      contentFit="cover"
      transition={150}
      accessible
      accessibilityLabel={`Photo: ${headline}`}
      accessibilityIgnoresInvertColors
    />
  );
}

export const StoryImage = memo(StoryImageComponent);
