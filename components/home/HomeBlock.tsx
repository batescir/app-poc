import { memo } from 'react';

import type { HomeLayoutBlock } from '../../lib/buildHomeLayout';
import { FeaturedBlock } from './FeaturedBlock';
import { HeroBlock } from './HeroBlock';
import { SectionBlock } from './SectionBlock';

function HomeBlockComponent({ block }: { block: HomeLayoutBlock }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} />;
    case 'featured':
      return <FeaturedBlock block={block} />;
    case 'section':
      return <SectionBlock block={block} />;
  }
}

export const HomeBlock = memo(HomeBlockComponent);
