import type { Block, Story } from '../../services/homepage/types';
import { buildHomeLayout, defaultLayoutConfig, type LayoutConfig } from '../buildHomeLayout';

const story = (n: number, extra: Partial<Story> = {}): Story => ({ path: `/a/2024/01/01/s${n}/`, headline: `Story ${n}`, ...extra });
const stories = (from: number, count: number) => Array.from({ length: count }, (_, i) => story(from + i));

const config: LayoutConfig = { maxFeaturedStories: 3, maxSectionStories: 2, maxBlocks: 10 };

describe('buildHomeLayout', () => {
  const blocks: Block[] = [
    { type: 'hero', stories: stories(0, 2) },
    { type: 'featured', stories: stories(10, 5) },
    { type: 'section', heading: 'Opinions', stories: stories(20, 5) },
  ];

  it('preserves block order and types', () => {
    expect(buildHomeLayout(blocks, config).map((b) => b.type)).toEqual(['hero', 'featured', 'section']);
  });

  it('shows only the first story in the hero', () => {
    const [hero] = buildHomeLayout(blocks, config);
    expect(hero).toMatchObject({ type: 'hero', story: story(0) });
  });

  it('applies featured and section display limits', () => {
    const [, featured, section] = buildHomeLayout(blocks, config);
    expect(featured.type === 'featured' && featured.stories.map((s) => s.path)).toEqual(stories(10, 3).map((s) => s.path));
    expect(section.type === 'section' && section.stories).toHaveLength(2);
  });

  it('applies the block limit', () => {
    expect(buildHomeLayout(blocks, { ...config, maxBlocks: 2 })).toHaveLength(2);
  });

  it('drops empty blocks and stories without headline or path', () => {
    const layout = buildHomeLayout(
      [
        { type: 'featured', stories: [] },
        { type: 'section', heading: 'X', stories: [story(1, { headline: '  ' }), story(2, { path: '' })] },
        { type: 'featured', stories: [story(3)] },
      ],
      config,
    );
    expect(layout).toHaveLength(1);
    expect(layout[0].type).toBe('featured');
  });

  it('renders a heading-less section as featured', () => {
    expect(buildHomeLayout([{ type: 'section', stories: [story(1)] }], config)[0].type).toBe('featured');
  });

  it('is pure and produces unique keys', () => {
    const copy = JSON.parse(JSON.stringify(blocks));
    const layout = buildHomeLayout(blocks, defaultLayoutConfig);
    expect(blocks).toEqual(copy);
    expect(new Set(layout.map((b) => b.key)).size).toBe(layout.length);
  });
});
