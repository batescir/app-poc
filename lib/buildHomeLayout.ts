import type { Block, Story } from '../services/homepage/types';

export type LayoutConfig = {
  maxFeaturedStories: number;
  maxSectionStories: number;
  maxBlocks: number;
};

export const defaultLayoutConfig: LayoutConfig = {
  maxFeaturedStories: 12,
  maxSectionStories: 10,
  maxBlocks: 20,
};

export type HeroLayoutBlock = { type: 'hero'; key: string; story: Story };
export type FeaturedLayoutBlock = { type: 'featured'; key: string; heading?: string; stories: Story[] };
export type SectionLayoutBlock = { type: 'section'; key: string; heading: string; stories: Story[] };
export type HomeLayoutBlock = HeroLayoutBlock | FeaturedLayoutBlock | SectionLayoutBlock;

const isRenderable = (s: Story) => s.headline.trim().length > 0 && s.path.trim().length > 0;

/** Pure: applies display limits and maps parsed blocks to typed render blocks. Preserves page order. */
export function buildHomeLayout(blocks: Block[], config: LayoutConfig = defaultLayoutConfig): HomeLayoutBlock[] {
  const out: HomeLayoutBlock[] = [];
  blocks.forEach((block, index) => {
    if (out.length >= config.maxBlocks) return;
    const stories = block.stories.filter(isRenderable);
    if (stories.length === 0) return;
    const key = `${block.type}-${index}-${stories[0].path}`;

    if (block.type === 'hero') {
      out.push({ type: 'hero', key, story: stories[0] });
    } else if (block.type === 'section' && block.heading) {
      out.push({ type: 'section', key, heading: block.heading, stories: stories.slice(0, config.maxSectionStories) });
    } else {
      out.push({
        type: 'featured',
        key,
        heading: block.heading,
        stories: stories.slice(0, config.maxFeaturedStories),
      });
    }
  });
  return out;
}
