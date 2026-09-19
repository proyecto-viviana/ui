/**
 * @vitest-environment jsdom
 *
 * Hydration half of the RadioGroup SSR regression. Reads the server markup
 * produced by RadioGroup.ssr.test.tsx (run that first) and hydrates the
 * DOM-compiled fixture over it, as the site does.
 *
 * The server emits every slot id it holds; after hydration the client probe
 * (`useSlotId` semantics) must keep the ids whose elements exist and drop the
 * rest, so a radio never carries a dangling `aria-describedby`.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { PLANS, RadioGroupFixture } from "./fixtures/radiogroup";

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/radiogroup-ssr.html"),
  "utf8",
);

describe("RadioGroup hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates both groups, keeps the real description id and drops dangling ones", async () => {
    let serverRadios: Element[] = [];
    const container = await hydrateOverSsr(ssrHtml, () => <RadioGroupFixture />, {
      beforeHydrate(container) {
        serverRadios = [...container.querySelectorAll('input[type="radio"]')];
      },
    });
    // The slot-id probe runs in an effect after the hydration walk.
    await Promise.resolve();

    expect(container.querySelectorAll('[role="radiogroup"]')).toHaveLength(2);
    const radios = container.querySelectorAll('input[type="radio"]');
    expect(radios).toHaveLength(PLANS.length + 2);
    for (const [index, radio] of [...radios].entries()) expect(radio).toBe(serverRadios[index]);

    const described = container.querySelector('[data-testid="described"]')!;
    const description = [...described.querySelectorAll("[id]")].find(
      (el) => el.textContent === "Billed monthly",
    );
    expect(description).toBeDefined();
    for (const radio of described.querySelectorAll("input")) {
      const ids = (radio.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
      expect(ids).toContain(description!.id);
      for (const id of ids) expect(document.getElementById(id)).not.toBeNull();
    }

    const bare = container.querySelector('[data-testid="bare"]')!;
    for (const radio of bare.querySelectorAll("input")) {
      expect(radio).not.toHaveAttribute("aria-describedby");
    }
  });
});
