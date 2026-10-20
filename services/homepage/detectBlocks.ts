/**
 * The only module that knows adn.com's markup.
 *
 * Rules were written from the output of `npm run inspect` (tools/inspect-homepage.ts)
 * against the live page and are verified against __fixtures__/homepage.html.
 * When adn.com changes, re-run the inspection tool and adjust the constants below.
 */
import { DomUtils, parseDocument } from 'htmlparser2';
import type { AnyNode, Element } from 'domhandler';

import { appConfig } from '../../config/app.config';
import { parseUrl, resolveUrl, sameSite } from '../../lib/resolveUrl';
import type { Block, DetectResult, SkippedBlock, Story } from './types';

/** Stories live inside the ARIA main landmark (`section[role="main"]`). Header/footer nav is outside it. */
export const MAIN_REGION_ROLE = 'main';

/** Story URLs are dated: /{section}/{subsection?}/{yyyy}/{mm}/{dd}/{slug}/ (section is optional). */
export const STORY_PATH_PATTERN = /^\/(?:[a-z0-9-]+\/)*\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\/?$/i;

/**
 * Paths that match STORY_PATH_PATTERN but are site furniture, not stories
 * (the "Do you have suggestions for coverage?" button).
 */
export const NON_STORY_PATH_PATTERN = /^\/uncategorized\//i;

/**
 * Layout containers ("chains") that group stories into a homepage block. Class names are
 * the only signal adn.com exposes for block boundaries; the innermost matching container
 * that holds stories becomes a block.
 */
export const BLOCK_CONTAINER_CLASS =
  /^(?:chain-container|b-triple-chain|b-quad-chain|adn-single-chain(?:null)?|b-numbered-list|adn-promo-results__wrapper)$/;

/** Block headings are h1-h6 elements outside any story and outside any link ("Opinions", "Latest"). */
export const HEADING_TAG = /^h[1-6]$/;

/** Story summary: a paragraph inside the story with at least this many characters (skips list numbers). */
export const SUMMARY_MIN_LENGTH = 20;

/** The first story of the first block on the page is the hero. */
export const HERO_FROM_FIRST_BLOCK = true;

type Segment = { heading?: string; units: Element[] };

const log = (message: string) => {
  if (process.env.NODE_ENV !== 'test') console.log(`[detectBlocks] ${message}`);
};

function textOf(node: AnyNode): string {
  return DomUtils.textContent(node).replace(/\s+/g, ' ').trim();
}

function isTag(node: AnyNode | null | undefined): node is Element {
  return !!node && node.type === 'tag';
}

function classTokens(el: Element): string[] {
  return (el.attribs.class ?? '').trim().split(/\s+/).filter(Boolean);
}

function isBlockContainer(el: Element): boolean {
  return classTokens(el).some((c) => BLOCK_CONTAINER_CLASS.test(c));
}

function storyPathOf(el: Element): string | null {
  if (el.name !== 'a' || !el.attribs.href) return null;
  const abs = resolveUrl(el.attribs.href, appConfig.homepageUrl);
  if (!abs || !sameSite(abs, appConfig.homepageUrl)) return null;
  const path = parseUrl(abs)?.pathname ?? null;
  if (!path || !STORY_PATH_PATTERN.test(path) || NON_STORY_PATH_PATTERN.test(path)) return null;
  return path;
}

function storyPathsIn(el: Element): Set<string> {
  const paths = new Set<string>();
  for (const a of DomUtils.getElementsByTagName('a', el, true)) {
    const p = storyPathOf(a);
    if (p) paths.add(p);
  }
  return paths;
}

/** Climbs from a story link to the largest ancestor that links to that one story only. */
function storyUnitFor(link: Element, path: string, boundary: Element): Element {
  let unit: Element = link;
  let parent = link.parent;
  while (isTag(parent) && parent !== boundary && !isBlockContainer(parent)) {
    const paths = storyPathsIn(parent);
    if (paths.size !== 1 || !paths.has(path)) break;
    const current = unit;
    const holdsBlockHeading = DomUtils.findOne(
      (el) => HEADING_TAG.test(el.name) && el !== current && !isInside(el, current) && storyPathsIn(el).size === 0,
      parent.children,
      true,
    );
    if (holdsBlockHeading) break;
    unit = parent;
    parent = parent.parent;
  }
  return unit;
}

function isInside(node: AnyNode, ancestor: Element): boolean {
  let cur = node.parent;
  while (cur) {
    if (cur === ancestor) return true;
    cur = cur.parent;
  }
  return false;
}

function hasAncestor(node: AnyNode, test: (el: Element) => boolean, stop: Element): boolean {
  let cur = node.parent;
  while (isTag(cur) && cur !== stop) {
    if (test(cur)) return true;
    cur = cur.parent;
  }
  return false;
}

function extractStory(unit: Element, path: string): Story | null {
  const heading = DomUtils.findOne((el) => HEADING_TAG.test(el.name), [unit], true);
  let headline = heading ? textOf(heading) : '';
  if (!headline) {
    const links = DomUtils.findAll((el) => storyPathOf(el) === path && el.attribs['aria-hidden'] !== 'true', [unit]);
    headline = links.map(textOf).sort((a, b) => b.length - a.length)[0] ?? '';
  }
  if (!headline) return null;

  const img = DomUtils.findOne((el) => el.name === 'img', [unit], true);
  const rawSrc = img?.attribs.src || img?.attribs.srcset?.split(',')[0]?.trim().split(/\s+/)[0];
  const imageUrl = rawSrc ? (resolveUrl(rawSrc, appConfig.homepageUrl) ?? undefined) : undefined;

  const summaryEl = DomUtils.findOne(
    (el) =>
      el.name === 'p' &&
      textOf(el).length >= SUMMARY_MIN_LENGTH &&
      !(heading && isInside(el, heading)) &&
      !DomUtils.findOne((c) => c.name === 'a', el.children),
    [unit],
    true,
  );

  const story: Story = { path, headline };
  if (summaryEl) story.summary = textOf(summaryEl);
  if (imageUrl) story.imageUrl = imageUrl;
  return story;
}

export function detectBlocks(html: string): DetectResult {
  const skipped: SkippedBlock[] = [];
  const skip = (entry: SkippedBlock) => {
    skipped.push(entry);
    log(`skipped ${entry.rule}${entry.heading ? ` "${entry.heading}"` : ''}: ${entry.reason}`);
  };

  const doc = parseDocument(html);
  let root = DomUtils.findOne((el) => el.attribs.role === MAIN_REGION_ROLE, doc.children, true) as Element | null;
  if (!root) {
    skip({ rule: 'MAIN_REGION_ROLE', reason: `no element with role="${MAIN_REGION_ROLE}"; no blocks read` });
    return { blocks: [], skipped };
  }
  const main: Element = root;

  // Story units in document order.
  const unitPath = new Map<Element, string>();
  for (const a of DomUtils.getElementsByTagName('a', main, true)) {
    const path = storyPathOf(a);
    if (!path) continue;
    const unit = storyUnitFor(a, path, main);
    if (!unitPath.has(unit) && ![...unitPath.keys()].some((u) => isInside(unit, u))) unitPath.set(unit, path);
  }
  if (unitPath.size === 0) {
    skip({ rule: 'STORY_PATH_PATTERN', reason: 'no story links found in the main region' });
    return { blocks: [], skipped };
  }
  const isUnit = (el: Element) => unitPath.has(el);

  // Innermost block containers that hold story units.
  const containers = DomUtils.findAll(
    isBlockContainer,
    main.children,
  ).filter((c) => [...unitPath.keys()].some((u) => isInside(u, c)));
  const blockContainers = containers.filter((c) => !containers.some((other) => other !== c && isInside(other, c)));
  if (blockContainers.length === 0) {
    skip({ rule: 'BLOCK_CONTAINER_CLASS', reason: 'no block containers found around stories' });
    return { blocks: [], skipped };
  }

  const orphans = [...unitPath.keys()].filter((u) => !blockContainers.some((c) => isInside(u, c)));
  if (orphans.length > 0) {
    skip({ rule: 'BLOCK_CONTAINER_CLASS', reason: `${orphans.length} story link(s) outside any block container` });
  }

  // Split each container into segments at block headings.
  const segments: Segment[] = [];
  for (const container of blockContainers) {
    let current: Segment = { units: [] };
    const pushCurrent = () => {
      if (current.heading || current.units.length) segments.push(current);
    };
    DomUtils.filter(
      (node) => {
        if (!isTag(node)) return false;
        if (isUnit(node)) {
          current.units.push(node);
        } else if (
          HEADING_TAG.test(node.name) &&
          !hasAncestor(node, (el) => isUnit(el) || el.name === 'a', container) &&
          storyPathsIn(node).size === 0 &&
          textOf(node)
        ) {
          pushCurrent();
          current = { heading: textOf(node), units: [] };
        }
        return false;
      },
      [container],
      true,
    );
    pushCurrent();
  }

  // Build blocks: dedupe by path (first occurrence wins), never emit empty blocks.
  const seen = new Set<string>();
  const blocks: Block[] = [];
  let heroAssigned = !HERO_FROM_FIRST_BLOCK;
  for (const segment of segments) {
    const stories: Story[] = [];
    let duplicates = 0;
    let invalid = 0;
    for (const unit of segment.units) {
      const path = unitPath.get(unit)!;
      if (seen.has(path)) {
        duplicates++;
        continue;
      }
      const story = extractStory(unit, path);
      if (!story) {
        invalid++;
        continue;
      }
      seen.add(path);
      stories.push(story);
    }
    if (invalid) log(`skipped ${invalid} story(ies) without a headline${segment.heading ? ` in "${segment.heading}"` : ''}`);

    if (stories.length === 0) {
      const reason = segment.units.length === 0
        ? 'heading with no stories'
        : duplicates
          ? `all ${duplicates} stories already appear earlier on the page`
          : 'no story had a headline and link';
      skip({ rule: segment.heading ? 'HEADING_TAG' : 'BLOCK_CONTAINER_CLASS', heading: segment.heading, reason });
      continue;
    }

    if (!heroAssigned) {
      heroAssigned = true;
      blocks.push({ type: 'hero', stories: [stories[0]] });
      if (stories.length > 1) blocks.push({ type: 'featured', heading: segment.heading, stories: stories.slice(1) });
      continue;
    }
    blocks.push(segment.heading ? { type: 'section', heading: segment.heading, stories } : { type: 'featured', stories });
  }

  return { blocks, skipped };
}
