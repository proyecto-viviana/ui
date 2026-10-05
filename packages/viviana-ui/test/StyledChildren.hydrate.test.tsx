/**
 * Hydration-reactivity guard for styled components (@proyecto-viviana/ui).
 *
 * Verifies that fine-grained reactive text passed directly as children to
 * ActionButton, ToggleButton, LinkButton, Badge, Radio, SegmentedControl, and TagGroup
 * re-binds after hydration without recreating the host element.
 */
import { createSignal, flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import {
  ActionButtonFixture,
  ToggleButtonFixture,
  LinkButtonFixture,
  BadgeFixture,
  RadioFixture,
  SegmentedControlFixture,
  TagGroupFixture,
} from "./fixtures/styled-children";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

async function hydrateAndFlip(
  ssrFile: string,
  selector: string,
  Fixture: (props: { count: () => number }) => JSX.Element,
): Promise<{
  before?: string;
  after?: string;
  serverElement: Element | null;
  afterElement: Element | null;
}> {
  const [count, setCount] = createSignal(0);
  let serverElement: Element | null = null;
  const container = await hydrateOverSsr(readSsr(ssrFile), () => <Fixture count={count} />, {
    beforeHydrate(container) {
      serverElement = container.querySelector(selector);
      expect(serverElement).not.toBeNull();
    },
  });
  expect(container.querySelector(selector)).toBe(serverElement);
  const before = container.querySelector(selector)?.textContent?.trim();
  setCount(1);
  flush();
  const afterElement = container.querySelector(selector);
  const after = afterElement?.textContent?.trim();
  return { before, after, serverElement, afterElement };
}

describe("Styled children hydration reactivity (@proyecto-viviana/ui)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("ActionButton re-binds fine-grained text without recreating host", async () => {
    const r = await hydrateAndFlip(
      "vui-actionbutton-finegrained-ssr.html",
      "button",
      ActionButtonFixture,
    );
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterElement).toBe(r.serverElement);
  });

  it("ToggleButton re-binds fine-grained text without recreating host", async () => {
    const r = await hydrateAndFlip(
      "vui-togglebutton-finegrained-ssr.html",
      "button",
      ToggleButtonFixture,
    );
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterElement).toBe(r.serverElement);
  });

  it("LinkButton re-binds fine-grained text without recreating host", async () => {
    const r = await hydrateAndFlip("vui-linkbutton-finegrained-ssr.html", "a", LinkButtonFixture);
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterElement).toBe(r.serverElement);
  });

  it("Badge re-binds fine-grained text without recreating host", async () => {
    const r = await hydrateAndFlip(
      "vui-badge-finegrained-ssr.html",
      '[role="presentation"]',
      BadgeFixture,
    );
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterElement).toBe(r.serverElement);
  });

  it("Radio re-binds fine-grained text without recreating host", async () => {
    const r = await hydrateAndFlip("vui-radio-finegrained-ssr.html", "label", RadioFixture);
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterElement).toBe(r.serverElement);
  });

  it("SegmentedControl re-binds fine-grained text without recreating host", async () => {
    const r = await hydrateAndFlip(
      "vui-segmentedcontrol-finegrained-ssr.html",
      "button",
      SegmentedControlFixture,
    );
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterElement).toBe(r.serverElement);
  });

  it("TagGroup re-binds fine-grained text without recreating host", async () => {
    const r = await hydrateAndFlip(
      "vui-taggroup-finegrained-ssr.html",
      '[role="row"]',
      TagGroupFixture,
    );
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterElement).toBe(r.serverElement);
  });
});
