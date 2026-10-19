# ADN Homepage POC

A proof-of-concept native mobile app for ADN (adn.com, Anchorage Daily News). The app has one screen: a homepage that mirrors the layout and story order of https://adn.com/. It runs on iOS and Android through Expo, with no web build.

## Platform requirement

Build this with Expo and native React Native. Use the Expo SDK's native runtime (`npx create-expo-app`, then `npx expo start`), and render every screen with React Native components that compile to native iOS and Android views. Do not use a web runtime, Expo web output, a WebView, or a hybrid wrapper for any part of the UI. The app must run in the Expo Go client or a development build on iOS and Android.

## Goal

Show the stories that adn.com's homepage shows, in the same block order and arrangement, rendered with native React Native components. This is a proof of concept. Prove that the page can be read and rendered natively, and keep everything else out of scope.

## Stack

- Latest stable Expo SDK, Expo Router, and TypeScript.
- Use only native components: `View`, `Text`, `Image`, `ScrollView`, `FlatList`, `Pressable` from `react-native`, plus `expo-image` for images.
- Use `htmlparser2` to read the homepage HTML. It is the only parser dependency to add. Do not use `DOMParser`, browser DOM APIs, WebView, `dangerouslySetInnerHTML`, or any HTML rendering library. Do not render adn.com's header, footer, navigation, or styling.
- Cache storage: `@react-native-async-storage/async-storage`. This is the only storage dependency. It is a data-storage library, not a rendering library, so it does not conflict with the native-components rule.
- Testing: Jest with `jest-expo`.

## Out of scope

Section pages, the burger menu, story detail screens, search, settings, authentication, paywalls, subscriptions, push notifications, and Arc XP API calls. Do not add any of them.

## Configuration

Create `/config/app.config.ts` with a typed `appConfig` object:

- `homepageUrl: "https://adn.com/"`
- `userAgent: "ADN-App/1.0"`
- `requestTimeoutMs: 8000`
- `cacheLayout: true`
- `cacheTtlMinutes: 5`
- `storyUrlPattern: "https://adn.com{path}"`
- `useMockData: true`
- `cacheKey: "adn.homepage.layout"`

Nothing else may hardcode the URL, user agent, timeouts, cache key, or story URL pattern.

## Step 1: Inspection tool (do this first)

Create `/tools/inspect-homepage.ts`, a Node script that runs outside the app. It fetches `homepageUrl` with `userAgent` and reports:

- Whether story links appear in the raw HTML. If they don't, the page loads them with JavaScript, and the POC cannot read the homepage without a different approach. Report this and stop.
- Each distinct story-link pattern, with counts.
- The candidate block containers the story links sit in, with nearby heading text, so the hero, featured, and section areas can be identified.
- The raw HTML saved to `/services/homepage/__fixtures__/homepage.html`.

Write the detection rules from this tool's output on the live page. Do not write rules from memory or guess at markup. The fixture is a snapshot taken on the inspection date, so the POC matches the live page only as of that date.

## Step 2: Fetch and parse

`/services/homepage/fetchHomepage.ts` fetches the homepage HTML with `userAgent` and aborts after `requestTimeoutMs`.

- Automatic fetches happen at most once per launch, and only when the cache is older than `cacheTtlMinutes`.
- Pull-to-refresh forces a fetch regardless of cache age. The once-per-launch limit applies only to automatic fetches.
- Do not poll, retry in a loop, or fetch any other adn.com page.

## Step 3: Detection rules

`/services/homepage/detectBlocks.ts` is the only file that knows adn.com's markup. It returns an ordered list of blocks in the page's order. Each block has a type (`hero`, `featured`, or `section`), an optional heading, and an ordered list of stories. Each story has `path`, `headline`, `summary` (optional), and `imageUrl` (optional).

Rules:

- Prefer stable signals (path patterns, heading text, ARIA roles) over class names.
- Keep each rule as a named constant so it can be changed in one line.
- If a rule finds nothing, skip that block and log it. Do not fail the whole page.
- Deduplicate stories by path, keeping the first occurrence.
- Do not cap the number of stories in the parser.
- Resolve every relative `href` and image `src` against `homepageUrl` before storing it.
- `summary` is optional. Render a story without one rather than skipping it. Skip only a story that lacks a headline or link.

## Step 4: Cache

- Store the parsed blocks and a timestamp under `cacheKey` in AsyncStorage. Do not store raw HTML.
- Cache the layout only when `cacheLayout` is true.

## Step 5: Render

- `buildHomeLayout(blocks, layoutConfig)` is a pure function that applies display limits and returns typed blocks. Screens render blocks and do not decide layout.
- The homepage is a single vertical `FlatList` of blocks, in the order the page produced.
- A `hero` block shows its first story full-width with image, headline, and summary.
- A `featured` block shows its stories as a list, each with a thumbnail on the left and headline on the right.
- A `section` block shows its heading and a horizontal `FlatList` of story cards.
- Tapping a story opens `storyUrlPattern` with its path in the system browser, using `Linking.openURL`. There is no in-app story screen.
- Never render an empty card.

## Step 6: Fallback

If the fetch fails, times out, or finds no blocks, show the last cached layout when one exists. If there is no cache, show a native error state with a retry button. Do not invent a layout.

## Mock mode

When `useMockData` is true, load the saved fixture (`__fixtures__/homepage.html`) through the same parser instead of fetching. The app then runs fully offline and matches the live page as of the inspection date.

## Visibility (development only)

Show whether the layout came from live, cached, or fixture data, and list any skipped blocks with reasons.

## Styling

- Colors, type scale, and spacing live in `/theme/tokens.ts`. Support light and dark mode with `useColorScheme`.
- Support Dynamic Type with `allowFontScaling` and sensible caps.
- Tap targets are at least 44pt. Every pressable and image has an accessibility label.

## States

- Loading skeleton for the homepage.
- Error state with a retry button.
- Pull-to-refresh.
- Memoize list items and set `keyExtractor` on every list.

## Tests (Jest with jest-expo)

- Parser tests against the saved fixture. Assert against the fixture's own counts, not hardcoded live numbers, so a page change produces a clear, expected failure rather than a mystery one. Cover story count, block order, deduplication, and that no story is empty.
- Tests for malformed markup, a missing block, a timeout, and the cache fallback.
- Tests for `buildHomeLayout` display limits.

## Deliverables

1. Expo Router project with a single homepage route and the folders `/app`, `/config`, `/components/home`, `/services/homepage`, `/services/homepage/__fixtures__`, `/tools`, `/theme`, `/lib`.
2. `/config/app.config.ts`.
3. `/tools/inspect-homepage.ts` and the saved fixture.
4. `fetchHomepage.ts`, `detectBlocks.ts`, and the cache logic.
5. `buildHomeLayout` and the block components.
6. The homepage screen with loading, error, and pull-to-refresh states.
7. Jest configuration and tests as described.
8. A setup section in this README covering running the inspection tool, refreshing the fixture, updating detection rules when adn.com changes, and the dependencies added (`htmlparser2`, `@react-native-async-storage/async-storage`, `jest-expo`).

## Definition of done

The app runs in Expo with the fixture on iOS and Android simulators. The homepage shows adn.com's stories in the page's block order. Tests pass. Tapping a story opens it on adn.com.

## Working rules

- Work on a feature branch and open a PR when done.
- Do not invent markup, story data, or URLs. If the inspection tool shows the page loads stories with JavaScript, stop at Step 1 and report it.
- If adn.com is unreachable from your environment, stop at Step 1, leave `detectBlocks.ts` with no rules, mark it UNVERIFIED, and report that.
- In the PR summary, list what was built, which tests pass, which detection rules are verified against the live page, and a note that fetching adn.com's homepage from a client app should be confirmed with the site owner before any release.
