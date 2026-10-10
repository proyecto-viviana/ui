/**
 * Hydration-reactivity guard for styled components (@proyecto-viviana/ui).
 *
 * Verifies that fine-grained reactive text passed directly as children to
 * ActionButton, ToggleButton, LinkButton, Badge, Radio, SegmentedControl, and TagGroup
 * re-binds after hydration without recreating the host element.
 */
import { createSignal, flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
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
  TagGroupLabelFixture,
  SelectBoxFixture,
} from "./fixtures/styled-children";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

async function hydrateAndFlip(
  ssrFile: string,
  selector: string,
  Fixture: (props: { count: () => number }) => JSX.Element,
): Promise<{
  container: HTMLElement;
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
  return { container, before, after, serverElement, afterElement };
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
    const grid = r.container.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    expect(grid).toHaveAttribute("aria-label", "Tags");
    expect(grid).not.toHaveAttribute("aria-labelledby");
  });

  it("SelectBox re-binds fine-grained text without recreating host", async () => {
    const r = await hydrateAndFlip(
      "vui-selectbox-finegrained-ssr.html",
      '[role="option"]',
      SelectBoxFixture,
    );
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterElement).toBe(r.serverElement);
  });
  it("TagGroup keeps live label precedence and original grid/rows after hydration", async () => {
    const [label, setLabel] = createSignal<string | undefined>(undefined);
    const [labelledBy, setLabelledBy] = createSignal("taggroup-label-a");
    const onEvent = vi.fn();
    let serverGrid: Element | null = null;
    let serverRows: Element[] = [];
    const container = await hydrateOverSsr(
      readSsr("vui-taggroup-live-label-ssr.html"),
      () => <TagGroupLabelFixture label={label} labelledBy={labelledBy} onEvent={onEvent} />,
      {
        beforeHydrate(container) {
          serverGrid = container.querySelector('[role="grid"]');
          serverRows = Array.from(container.querySelectorAll('[role="row"]'));
          expect(serverGrid).not.toBeNull();
          expect(serverGrid).toHaveAttribute("aria-labelledby", "taggroup-label-a");
          expect(serverRows).toHaveLength(2);
        },
      },
    );
    const grid = container.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    const assertRetained = () => {
      expect(container.querySelector('[role="grid"]')).toBe(serverGrid);
      const rows = container.querySelectorAll('[role="row"]');
      expect(rows).toHaveLength(serverRows.length);
      serverRows.forEach((row, index) => expect(rows[index]).toBe(row));
      expect(onEvent).not.toHaveBeenCalled();
    };
    const assertExternal = (id: string, name: string) => {
      expect(grid).toHaveAttribute("aria-labelledby", id);
      expect(grid).toHaveAccessibleName(name);
      assertRetained();
    };
    assertExternal("taggroup-label-a", "External A");
    setLabelledBy("taggroup-label-b");
    flush();
    assertExternal("taggroup-label-b", "External B");

    setLabel("Visible topics");
    flush();
    const visibleLabel = Array.from(container.querySelectorAll("span")).find(
      (element) => element.textContent === "Visible topics",
    );
    expect(visibleLabel).toBeDefined();
    const generatedId = visibleLabel?.id;
    expect(generatedId).toBeTruthy();
    expect(generatedId).not.toBe("taggroup-label-b");
    expect(grid).toHaveAttribute("aria-labelledby", generatedId);
    expect(grid).toHaveAccessibleName("Visible topics");
    assertRetained();

    setLabelledBy("taggroup-label-c");
    flush();
    expect(grid).toHaveAttribute("aria-labelledby", generatedId);
    expect(grid).toHaveAccessibleName("Visible topics");
    assertRetained();
    setLabel("");
    flush();
    assertExternal("taggroup-label-c", "External C");
    setLabel(undefined);
    flush();
    assertExternal("taggroup-label-c", "External C");

    setLabel("Visible topics again");
    flush();
    const restoredLabel = Array.from(container.querySelectorAll("span")).find(
      (element) => element.textContent === "Visible topics again",
    );
    expect(restoredLabel).toBeDefined();
    expect(restoredLabel).toHaveAttribute("id", generatedId);
    expect(grid).toHaveAttribute("aria-labelledby", generatedId);
    expect(grid).toHaveAccessibleName("Visible topics again");
    assertRetained();
    setLabel(undefined);
    flush();
    assertExternal("taggroup-label-c", "External C");
  });
});
