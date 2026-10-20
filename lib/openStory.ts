import { Linking } from 'react-native';

import { appConfig } from '../config/app.config';

export function storyUrl(path: string): string {
  return appConfig.storyUrlPattern.replace('{path}', path);
}

export function openStory(path: string): Promise<void> {
  return Linking.openURL(storyUrl(path)).catch((err) => {
    console.warn(`Could not open ${storyUrl(path)}`, err);
  });
}
