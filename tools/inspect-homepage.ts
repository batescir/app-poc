/**
 * Inspection tool: run with `npm run inspect`.
 * Fetches the live homepage, reports how story links are structured, and saves
 * the raw HTML as the parser fixture. Detection rules in
 * services/homepage/detectBlocks.ts are written from this tool's output.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DomUtils, parseDocument } from 'htmlparser2';
import type { AnyNode, Element } from 'domhandler';

import { appConfig } from '../config/app.config';

const FIXTURE_PATH = join(__dirname, '..', 'services', 'homepage', '__fixtures__', 'homepage.html');
const DATED_PATH = /^\/(?:[a-z0-9-]+\/)*\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\/?$/i;

function toPath(href: string): string | null {
  try {
    const url = new URL(href, appConfig.homepageUrl);
    const home = new URL(appConfig.homepageUrl);
    if (url.hostname.replace(/^www\./, '') !== home.hostname.replace(/^www\./, '')) return null;
    return url.pathname;
  } catch {
    return null;
  }
}

function patternOf(path: string): string {
  return path
    .split('/')
    .map((seg, i, all) => {
      if (!seg) return seg;
      if (/^\d{4}$/.test(seg)) return '{yyyy}';
      if (/^\d{2}$/.test(seg)) return '{nn}';
      if (i === all.length - 1 || (i === all.length - 2 && all[all.length - 1] === '')) {
        return seg.includes('-') ? '{slug}' : seg;
      }
      return seg.includes('-') && seg.length > 30 ? '{slug}' : seg;
    })
    .join('/');
}

function signature(el: Element): string {
  const parts = [el.name];
  for (const attr of ['role', 'aria-label', 'id']) {
    if (el.attribs[attr]) parts.push(`[${attr}="${el.attribs[attr]}"]`);
  }
  if (el.attribs.class) parts.push('.' + el.attribs.class.trim().split(/\s+/).slice(0, 3).join('.'));
  return parts.join('');
}

function ancestors(node: AnyNode): Element[] {
  const out: Element[] = [];
  let cur = node.parent;
  while (cur && cur.type === 'tag') {
    out.push(cur as Element);
    cur = cur.parent;
  }
  return out;
}

function text(node: AnyNode): string {
  return DomUtils.textContent(node).replace(/\s+/g, ' ').trim();
}

async function main() {
  console.log(`Fetching ${appConfig.homepageUrl} as "${appConfig.userAgent}"`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), appConfig.requestTimeoutMs);
  const res = await fetch(appConfig.homepageUrl, {
    headers: { 'User-Agent': appConfig.userAgent },
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));
  console.log(`HTTP ${res.status}, final URL ${res.url}`);
  const html = await res.text();
  console.log(`HTML length: ${html.length}`);

  mkdirSync(dirname(FIXTURE_PATH), { recursive: true });
  writeFileSync(FIXTURE_PATH, html);
  console.log(`Saved fixture to ${FIXTURE_PATH}\n`);

  const doc = parseDocument(html);
  const anchors = DomUtils.findAll((el) => el.name === 'a' && !!el.attribs.href, doc.children);
  const storyAnchors = anchors.filter((a) => {
    const path = toPath(a.attribs.href);
    return path !== null && DATED_PATH.test(path);
  });

  console.log(`== 1. Story links in raw HTML ==`);
  console.log(`Anchors total: ${anchors.length}; dated story links: ${storyAnchors.length}`);
  if (storyAnchors.length === 0) {
    console.log('No story links found in raw HTML. The page loads stories with JavaScript. STOP.');
    process.exitCode = 2;
    return;
  }

  console.log(`\n== 2. Link patterns (internal links, by count) ==`);
  const patterns = new Map<string, number>();
  for (const a of anchors) {
    const path = toPath(a.attribs.href);
    if (!path) continue;
    const p = patternOf(path);
    patterns.set(p, (patterns.get(p) ?? 0) + 1);
  }
  [...patterns.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, 40)
    .forEach(([p, n]) => console.log(`${String(n).padStart(4)}  ${p}`));

  console.log(`\n== 3. Landmarks containing story links ==`);
  const landmarkCounts = new Map<string, number>();
  for (const a of storyAnchors) {
    const lm = ancestors(a).find((el) => el.attribs.role || ['main', 'header', 'footer', 'nav', 'aside'].includes(el.name));
    const key = lm ? signature(lm) : '(none)';
    landmarkCounts.set(key, (landmarkCounts.get(key) ?? 0) + 1);
  }
  landmarkCounts.forEach((n, k) => console.log(`${String(n).padStart(4)}  ${k}`));

  console.log(`\n== 4. Nearest story wrapper elements ==`);
  const wrapperCounts = new Map<string, number>();
  for (const a of storyAnchors) {
    const w = ancestors(a).find((el) => el.name === 'article' || el.name === 'li');
    const key = w ? w.name : '(none)';
    wrapperCounts.set(key, (wrapperCounts.get(key) ?? 0) + 1);
  }
  wrapperCounts.forEach((n, k) => console.log(`${String(n).padStart(4)}  ${k}`));

  console.log(`\n== 5. Candidate block containers (ancestor signatures holding story links) ==`);
  const containerCounts = new Map<string, Set<string>>();
  for (const a of storyAnchors) {
    for (const el of ancestors(a).slice(0, 8)) {
      const key = signature(el);
      if (!containerCounts.has(key)) containerCounts.set(key, new Set());
      containerCounts.get(key)!.add(toPath(a.attribs.href)!);
    }
  }
  [...containerCounts.entries()]
    .filter(([k]) => !k.startsWith('a') && !k.startsWith('h') && !k.startsWith('figure'))
    .sort((x, y) => y[1].size - x[1].size)
    .slice(0, 30)
    .forEach(([k, s]) => console.log(`${String(s.size).padStart(4)} unique stories  ${k}`));

  console.log(`\n== 6. Document-order outline (headings without story links, and story articles) ==`);
  const main = DomUtils.findOne((el) => el.attribs.role === 'main' || el.name === 'main', doc.children);
  const scope = main ? [main] : doc.children;
  const seen = new Set<string>();
  DomUtils.filter(
    (node) => {
      if (node.type !== 'tag') return false;
      const el = node as Element;
      if (/^h[1-6]$/.test(el.name)) {
        const hasStory = DomUtils.findOne((c) => c.name === 'a' && DATED_PATH.test(toPath(c.attribs.href ?? '') ?? ''), el.children);
        if (!hasStory) {
          const chain = ancestors(el).slice(0, 4).map(signature).join(' < ');
          console.log(`HEADING ${el.name} "${text(el)}"  in ${chain}`);
        }
      }
      if (el.name === 'a' && DATED_PATH.test(toPath(el.attribs.href ?? '') ?? '') && !ancestors(el).some((x) => x.name === 'article')) {
        const path = toPath(el.attribs.href)!;
        if (el.attribs['aria-hidden'] !== 'true' && text(el)) {
          const dup = seen.has(path) ? ' (dup)' : '';
          seen.add(path);
          const container = ancestors(el).slice(0, 3).map(signature).join(' < ');
          console.log(`  LINK${dup} "${text(el).slice(0, 60)}"  in ${container}`);
        }
      }
      if (el.name === 'article') {
        const link = DomUtils.findOne((c) => c.name === 'a' && DATED_PATH.test(toPath(c.attribs.href ?? '') ?? ''), el.children);
        if (link) {
          const path = toPath(link.attribs.href)!;
          const dup = seen.has(path) ? ' (dup)' : '';
          seen.add(path);
          const img = DomUtils.findOne((c) => c.name === 'img', el.children) ? ' img' : '';
          const para = DomUtils.findOne((c) => c.name === 'p' && text(c).length > 0, el.children);
          const summary = para ? ` p.${(para.attribs.class ?? '').trim().replace(/\s+/g, '.')}` : '';
          const heading = DomUtils.findOne((c) => /^h[1-6]$/.test(c.name), el.children);
          const container = ancestors(el)
            .slice(0, 3)
            .map(signature)
            .join(' < ');
          console.log(`  STORY${img}${summary}${dup} ${heading ? heading.name : '-'} "${text(heading ?? link).slice(0, 60)}"  in ${container}`);
        }
      }
      return false;
    },
    scope,
    true,
  );
  console.log(`\nUnique story paths: ${new Set(storyAnchors.map((a) => toPath(a.attribs.href))).size}`);
}

main().catch((err) => {
  console.error('Inspection failed:', err);
  process.exitCode = 1;
});
