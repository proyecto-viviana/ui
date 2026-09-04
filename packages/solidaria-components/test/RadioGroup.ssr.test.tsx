/**
 * Server-render half of the RadioGroup SSR regression.
 *
 * Runs under vitest.ssr.config.ts (`solid({ ssr: true })`, node env). Writes
 * the server markup to `output/radiogroup-ssr.html`; RadioGroup.hydrate.test.tsx
 * hydrates the DOM-compiled fixture over it. Run this test first.
 *
 * Site Gate 2026-09-02 (`/showcase/selection`): `renderToString` threw
 * "ReferenceError: document is not defined" from `createRadio`'s
 * `inputDescribedBy` — it probed `document.getElementById` for the group's
 * description / error slot ids during render — and the route's error boundary
 * rendered in place of the page. On the server the slot ids are emitted as is,
 * as `useSlotId` yields them before its layout effect.
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { PLANS, RadioGroupFixture } from "./fixtures/radiogroup";

describe("RadioGroup SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders the groups and their radios and writes hydratable markup", () => {
    const html = renderToString(() => <RadioGroupFixture />);

    expect(html.match(/role="radiogroup"/g)).toHaveLength(2);
    expect(html.match(/type="radio"/g)).toHaveLength(PLANS.length + 2);

    // The described group's radios point at the group description that is in
    // the markup. (Slot ids with no element — a radio's own description slot —
    // are emitted too, as upstream does on the server; the client probe drops
    // them after hydration. RadioGroup.hydrate.test.tsx holds that half.)
    const described = html.slice(
      html.indexOf('data-testid="described"'),
      html.indexOf('data-testid="bare"'),
    );
    const descriptionId = described.match(/id="([^"]+)"[^>]*>Billed monthly</)?.[1];
    expect(descriptionId).toBeTruthy();
    const inputs = described.match(/<input[^>]*>/g) ?? [];
    expect(inputs).toHaveLength(PLANS.length);
    for (const input of inputs) {
      const describedBy = input.match(/aria-describedby="([^"]+)"/)?.[1] ?? "";
      expect(describedBy.split(" ")).toContain(descriptionId);
    }

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "radiogroup-ssr.html"), html, "utf8");
  });
});
