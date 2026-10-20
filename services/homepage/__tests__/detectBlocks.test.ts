import { readFileSync } from 'fs';
import { join } from 'path';

import {
  MAIN_REGION_ROLE,
  NON_STORY_PATH_PATTERN,
  STORY_PATH_PATTERN,
  detectBlocks,
} from '../detectBlocks';

const fixture = readFileSync(join(__dirname, '..', '__fixtures__', 'homepage.html'), 'utf8');
const result = detectBlocks(fixture);
const stories = result.blocks.flatMap((b) => b.stories);

// Independent, regex-based reading of the fixture's own numbers (no hardcoded live counts).
const mainStart = fixture.indexOf(`role="${MAIN_REGION_ROLE}"`);
const mainHtml = fixture.slice(mainStart);
const hrefs = [...mainHtml.matchAll(/href="([^"]+)"/g)]
  .map((m) => m[1].replace(/^https?:\/\/(www\.)?adn\.com/, ''))
  .filter((p) => STORY_PATH_PATTERN.test(p) && !NON_STORY_PATH_PATTERN.test(p));
const uniqueFixturePaths = [...new Set(hrefs)];

describe('detectBlocks against the saved fixture', () => {
  it('finds the main region in the fixture', () => {
    expect(mainStart).toBeGreaterThan(-1);
  });

  it('returns every unique story in the main region exactly once', () => {
    expect(stories.length).toBe(uniqueFixturePaths.length);
    expect(new Set(stories.map((s) => s.path))).toEqual(new Set(uniqueFixturePaths));
  });

  it('deduplicates by path, keeping the first occurrence', () => {
    expect(hrefs.length).toBeGreaterThan(uniqueFixturePaths.length);
    const paths = stories.map((s) => s.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('keeps stories and blocks in page order', () => {
    expect(stories.map((s) => s.path)).toEqual(uniqueFixturePaths);
    const headingPositions = result.blocks
      .filter((b) => b.heading)
      .map((b) => mainHtml.indexOf(`>${b.heading}<`));
    headingPositions.forEach((pos) => expect(pos).toBeGreaterThan(-1));
    expect([...headingPositions].sort((a, b) => a - b)).toEqual(headingPositions);
  });

  it('starts with a single-story hero and has featured and section blocks', () => {
    expect(result.blocks[0].type).toBe('hero');
    expect(result.blocks[0].stories).toHaveLength(1);
    expect(result.blocks.filter((b) => b.type === 'hero')).toHaveLength(1);
    expect(result.blocks.some((b) => b.type === 'featured')).toBe(true);
    expect(result.blocks.some((b) => b.type === 'section')).toBe(true);
    result.blocks.filter((b) => b.type === 'section').forEach((b) => expect(b.heading).toBeTruthy());
  });

  it('never returns an empty block or story', () => {
    for (const block of result.blocks) expect(block.stories.length).toBeGreaterThan(0);
    for (const story of stories) {
      expect(story.headline.trim()).not.toBe('');
      expect(story.path).toMatch(STORY_PATH_PATTERN);
      if (story.summary !== undefined) expect(story.summary.trim()).not.toBe('');
      if (story.imageUrl !== undefined) expect(story.imageUrl).toMatch(/^https?:\/\//);
    }
  });

  it('decodes entities in headlines', () => {
    for (const story of stories) expect(story.headline).not.toMatch(/&(#x?[0-9a-f]+|[a-z]+);/i);
  });

  it('logs blocks it skipped with a reason', () => {
    for (const s of result.skipped) expect(s.reason).toBeTruthy();
  });
});

describe('detectBlocks on unexpected markup', () => {
  const article = (path: string, headline: string, extra = '') =>
    `<article><a href="${path}" aria-hidden="true"><img src="/img/${headline.length}.jpg"></a><h2><a href="${path}">${headline}</a></h2>${extra}</article>`;

  it('does not throw on malformed markup and still reads what it can', () => {
    const html = `<html><body><section role="main"><div class="chain-container"><div><article><h2><a href="/news/2024/01/02/a-story/">Unclosed story<p>Dangling summary text that goes on</div></section><<<>>>`;
    expect(() => detectBlocks(html)).not.toThrow();
    const { blocks } = detectBlocks(html);
    expect(blocks.flatMap((b) => b.stories).map((s) => s.path)).toEqual(['/news/2024/01/02/a-story/']);
  });

  it('returns no blocks and logs when there is no main region', () => {
    const { blocks, skipped } = detectBlocks('<html><body><p>nothing here</p></body></html>');
    expect(blocks).toEqual([]);
    expect(skipped[0].rule).toBe('MAIN_REGION_ROLE');
  });

  it('skips a block whose heading has no stories without failing the page', () => {
    const html = `<section role="main">
      <div class="chain-container">${article('/a/2024/01/01/one/', 'One')}${article('/a/2024/01/01/two/', 'Two')}</div>
      <div class="b-triple-chain"><div><h2>Empty Section</h2></div><div><h2>Opinions</h2>${article('/opinions/2024/01/01/three/', 'Three')}</div></div>
    </section>`;
    const { blocks, skipped } = detectBlocks(html);
    expect(blocks.map((b) => [b.type, b.heading])).toEqual([
      ['hero', undefined],
      ['featured', undefined],
      ['section', 'Opinions'],
    ]);
    expect(skipped).toEqual([expect.objectContaining({ heading: 'Empty Section' })]);
  });

  it('resolves relative links and images against homepageUrl and keeps stories without a summary', () => {
    const html = `<section role="main"><div class="chain-container">${article('/a/2024/01/01/one/', 'One')}${article(
      'https://www.adn.com/b/2024/01/01/two/',
      'Two',
      '<p>A summary that is long enough to count.</p>',
    )}</div></section>`;
    const [hero, featured] = detectBlocks(html).blocks;
    expect(hero.stories[0]).toEqual({ path: '/a/2024/01/01/one/', headline: 'One', imageUrl: 'https://adn.com/img/3.jpg' });
    expect(featured.stories[0].summary).toBe('A summary that is long enough to count.');
  });

  it('skips stories without a headline', () => {
    const html = `<section role="main"><div class="chain-container"><article><a href="/a/2024/01/01/x/"><img src="/x.jpg"></a></article>${article('/a/2024/01/01/y/', 'Y')}</div></section>`;
    expect(detectBlocks(html).blocks.flatMap((b) => b.stories).map((s) => s.headline)).toEqual(['Y']);
  });
});
