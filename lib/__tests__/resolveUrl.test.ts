import { resolveUrl, sameSite } from '../resolveUrl';

const base = 'https://adn.com/';

describe('resolveUrl', () => {
  it.each([
    ['/politics/2024/01/01/x/', 'https://adn.com/politics/2024/01/01/x/'],
    ['//www.adn.com/img.jpg', 'https://www.adn.com/img.jpg'],
    ['https://www.adn.com/resizer/v2/a.jpg?w=1&h=2', 'https://www.adn.com/resizer/v2/a.jpg?w=1&h=2'],
    ['img/a.jpg', 'https://adn.com/img/a.jpg'],
    ['../a/./b/', 'https://adn.com/a/b/'],
  ])('%s -> %s', (href, expected) => {
    expect(resolveUrl(href, base)).toBe(expected);
  });

  it('rejects non-http schemes and empty input', () => {
    expect(resolveUrl('javascript:alert(1)', base)).toBeNull();
    expect(resolveUrl('mailto:a@b.c', base)).toBeNull();
    expect(resolveUrl('  ', base)).toBeNull();
  });

  it('treats www and bare host as the same site', () => {
    expect(sameSite('https://www.adn.com/a', base)).toBe(true);
    expect(sameSite('https://example.com/a', base)).toBe(false);
  });
});
