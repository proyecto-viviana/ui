/** Write actual server markup first; the client twin must adopt this exact output. */
import { renderToString, isServer } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { LAND_CARDS, LandingLinkedCardsFixture } from "./fixtures/landing-hydration";

describe("landing linked-card diagnostic SSR", () => {
  it("uses the server compilation", () => {
    expect(isServer).toBe(true);
  });

  it("writes the preceding email, three exact linked cards, and following generated-ID field", () => {
    expect(LAND_CARDS).toHaveLength(3);
    const html = renderToString(() => <LandingLinkedCardsFixture />);
    expect(html.length).toBeGreaterThan(0);
    const anchors = html.match(/<a\b[^>]*>/g) ?? [];
    expect(anchors).toHaveLength(3);
    expect(anchors.map((anchor) => /\bhref="([^"]+)"/.exec(anchor)?.[1])).toEqual(
      LAND_CARDS.map((card) => `/examples/${card.slug}`),
    );
    for (const card of LAND_CARDS) {
      expect(html).toContain(`href="/examples/${card.slug}"`);
      expect(html).toContain(`src="${card.thumb}"`);
      expect(html).toContain(card.tag);
      expect(html).toContain(card.title);
      expect(html).toContain(card.meta);
    }
    expect(html).toContain("Following landing cards");
    const inputIds = Array.from(html.matchAll(/<input\b[^>]*\bid="([^"]+)"/g), (match) => match[1]);
    expect(inputIds).toHaveLength(2);
    expect(new Set(inputIds).size).toBe(2);
    expect(html).toContain('aria-label="Email address"');
    expect(html).toContain('type="email"');
    expect(html).toContain('placeholder="you@school.edu"');
    expect(html.indexOf(`<input`)).toBeLessThan(
      html.indexOf(`href="/examples/${LAND_CARDS[0].slug}"`),
    );
    expect(html.lastIndexOf(`<input`)).toBeGreaterThan(
      html.indexOf(`href="/examples/${LAND_CARDS[2].slug}"`),
    );
    inputIds.forEach((id) => expect(id.length).toBeGreaterThan(0));
    expect(html).toContain(`for="${inputIds[1]}"`);

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "viviana-ui-landing-linked-cards-ssr.html"), html, "utf8");
  });
});
