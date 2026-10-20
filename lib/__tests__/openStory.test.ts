import { Linking } from 'react-native';

import { openStory, storyUrl } from '../openStory';

describe('openStory', () => {
  it('builds the URL from storyUrlPattern and opens it in the system browser', async () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    expect(storyUrl('/a/2024/01/01/x/')).toBe('https://adn.com/a/2024/01/01/x/');
    await openStory('/a/2024/01/01/x/');
    expect(spy).toHaveBeenCalledWith('https://adn.com/a/2024/01/01/x/');
  });
});
