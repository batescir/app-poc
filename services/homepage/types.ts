export type BlockType = 'hero' | 'featured' | 'section';

export type Story = {
  path: string;
  headline: string;
  summary?: string;
  imageUrl?: string;
};

export type Block = {
  type: BlockType;
  heading?: string;
  stories: Story[];
};

export type SkippedBlock = {
  rule: string;
  heading?: string;
  reason: string;
};

export type DetectResult = {
  blocks: Block[];
  skipped: SkippedBlock[];
};

export type LayoutSource = 'live' | 'cache' | 'fixture';
