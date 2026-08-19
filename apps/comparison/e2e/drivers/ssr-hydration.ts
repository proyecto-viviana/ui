import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

/**
 * Driver D12 — SSR / hydration oracle (recertification.md Phase 1).
 *
 * Unlike D1–D11, D12 is not a Solid-vs-React byte diff: SSR/hydration
 * correctness is an ABSOLUTE self-consistency invariant, so the oracle is the
 * island's own server HTML. The contract (recertification.md): "Astro island
 * server HTML vs hydrated DOM; stable ids, no mismatch." The driver certifies,
 * for a pre-rendered `client:load` island surface (e.g. `/d12/button`):
 *
 *   1. SSR COMPLETENESS — the target is fully server-rendered (present, correct
 *      tag/name) in the raw server HTML, captured from a `javaScriptEnabled:
 *      false` context so nothing hydrates and the DOM is exactly what the server
 *      sent.
 *   2. STABLE IDS + STRUCTURE — every attribute of the target (its `id`,
 *      `aria-labelledby`/`aria-describedby`, class soup, ...) and its normalized
 *      subtree are byte-identical server vs hydrated. React Aria / solidaria
 *      generate ids; SSR determinism requires the client to reuse the server's,
 *      or the `aria-*` references break silently. This is the crux.
 *   3. NO MISMATCH — zero console errors / pageerrors and no hydration-mismatch
 *      warning fire during the hydrating navigation.
 *   4. INTERACTIVE — a real click after hydration drives the island's action
 *      counter, proving hydration actually bound the event handlers (not just
 *      left the SSR markup in place).
 *
 * Calibrated by perturbation (the D11 methodology): deliberately breaking id
 * stability or SSR completeness reds the corresponding assertion. There is no
 * React positive control because, unlike paint/AX, "server HTML == hydrated DOM"
 * has an absolute right answer that needs no upstream pair.
 */

const defaultHydrationTimeoutMs = 15_000;

/** Serializable snapshot of the certified element, comparable across two pages. */
interface TargetSnapshot {
  tag: string;
  /** Every attribute of the target, name→value (order-independent). */
  attributes: Record<string, string>;
  /** Trimmed accessible text (the accessible name for a text button). */
  text: string;
  /** Comment-stripped, whitespace-collapsed subtree HTML. */
  normalizedHtml: string;
}

/**
 * Strips framework hydration bookkeeping so the structural diff reflects only
 * semantic content: Solid emits hydration markers as HTML comments
 * (`<!--#-->`, `<!--/-->`, ...) that exist in the server stream and are consumed
 * on hydration, and whitespace between tags is not significant. `data-hk`
 * (Solid's hydration key) is deliberately NOT stripped here — its stability is
 * part of the contract and is asserted via the attribute diff.
 */
function normalizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

async function snapshotTarget(target: Locator): Promise<TargetSnapshot> {
  await expect(target).toBeAttached();
  return target.evaluate((element) => {
    const attributes: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
      attributes[attr.name] = attr.value;
    }
    return {
      tag: element.tagName.toLowerCase(),
      attributes,
      text: (element.textContent ?? "").trim(),
      normalizedHtml: element.outerHTML,
    };
  });
}

export interface SsrHydrationCase {
  /** Stable id used in the test title. */
  id: string;
  /** Route of the pre-rendered island surface (e.g. "/d12/button"). */
  route: string;
  /** Resolves the certified element on either the server or the hydrated page. */
  target: (page: Page) => Locator;
  /** Tag the target must be server-rendered as (SSR-completeness sanity). */
  expectTag: string;
  /** Accessible text the target must carry server-side (SSR-completeness sanity). */
  expectText?: string;
  /**
   * Drives a real interaction proving the hydrated island is wired, and asserts
   * its effect (e.g. the action counter increments). Runs only on the hydrated
   * page, after the structural diff.
   */
  interact?: (ctx: { page: Page; target: Locator }) => Promise<void>;
  /** Overrides the hydration-complete wait timeout. */
  hydrationTimeoutMs?: number;
}

export interface SsrHydrationScenario {
  /** Comparison slug (documentation only; the route is per-case). */
  slug: string;
  /** Display title used in test names. */
  title: string;
  cases: readonly SsrHydrationCase[];
}

/**
 * Astro emits directory index pages (`/d12/button/index.html`). Vite preview
 * treats a slashless `/d12/button` as a missing file and SPA-falls back to
 * `/`. A JS-disabled SSR capture cannot recover from that fallback, so D12
 * routes must request the directory URL.
 */
function ssrPageRoute(route: string): string {
  const url = new URL(route, "http://ssr.local");
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

async function captureServerSnapshot(
  browser: Browser,
  baseURL: string | undefined,
  caseDef: SsrHydrationCase,
): Promise<TargetSnapshot> {
  // A JS-disabled context: `page.goto` yields exactly the server HTML with no
  // hydration, so the snapshot is unambiguously "what the server sent".
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const serverPage = await context.newPage();
    await serverPage.goto(ssrPageRoute(caseDef.route), { waitUntil: "domcontentloaded" });
    const target = caseDef.target(serverPage);
    const snapshot = await snapshotTarget(target);
    return snapshot;
  } finally {
    await context.close();
  }
}

export function registerSsrHydrationDriver(scenario: SsrHydrationScenario) {
  test.describe(`D12 SSR/hydration — ${scenario.title}`, () => {
    for (const caseDef of scenario.cases) {
      test(caseDef.id, async ({ page, browser, baseURL }) => {
        test.setTimeout(60_000);

        // 1. SSR completeness — capture the un-hydrated server DOM.
        const server = await captureServerSnapshot(browser, baseURL, caseDef);
        expect(server.tag, "target must be server-rendered as the expected tag").toBe(
          caseDef.expectTag,
        );
        if (caseDef.expectText !== undefined) {
          expect(server.text, "target must carry its accessible text server-side").toBe(
            caseDef.expectText,
          );
        }

        // 3. No mismatch — collect console/page errors across the hydrating load.
        const consoleIssues: string[] = [];
        page.on("console", (msg) => {
          const type = msg.type();
          if (type === "error" || type === "warning") {
            consoleIssues.push(`[${type}] ${msg.text()}`);
          }
        });
        page.on("pageerror", (err) => {
          consoleIssues.push(`[pageerror] ${err.message}`);
        });

        await page.goto(ssrPageRoute(caseDef.route), { waitUntil: "networkidle" });
        // onMount (client-only, post-hydration) flips this marker on the wrapper.
        await expect(page.locator("[data-comparison-hydrated='true']")).toBeAttached({
          timeout: caseDef.hydrationTimeoutMs ?? defaultHydrationTimeoutMs,
        });

        // 2. Stable ids + structure — the hydrated target must match the server.
        const hydrated = await snapshotTarget(caseDef.target(page));
        expect(hydrated.tag).toBe(server.tag);
        expect(hydrated.text).toBe(server.text);
        expect(
          hydrated.attributes,
          "every target attribute (ids, aria, class) must survive hydration",
        ).toEqual(server.attributes);
        expect(normalizeHtml(hydrated.normalizedHtml)).toBe(normalizeHtml(server.normalizedHtml));

        const errors = consoleIssues.filter(
          (m) => m.startsWith("[error]") || m.startsWith("[pageerror]"),
        );
        const hydrationWarnings = consoleIssues.filter((m) => /hydrat|mismatch/i.test(m));
        expect(errors, "no console/page errors during hydration").toEqual([]);
        expect(hydrationWarnings, "no hydration-mismatch warnings").toEqual([]);

        // 4. Interactive — a real click after hydration must drive the island.
        if (caseDef.interact) {
          await caseDef.interact({ page, target: caseDef.target(page) });
        }
      });
    }
  });
}
