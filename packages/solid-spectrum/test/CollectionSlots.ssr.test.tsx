/**
 * Server markup for collection slot layout (#102).
 *
 * Label, description, icon, and actions classes have to be on the first
 * renderToString result. A later effect cannot add them.
 */
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ActionButton } from "../src/button";
import { ActionButtonGroup } from "../src/actionbuttongroup";
import BellIcon from "../src/icon/s2wf-icons/BellIcon";
import { Provider } from "../src/provider";
import { ListViewSlotStylesFixture, TreeSlotStylesFixture } from "./fixtures/collection-slots";

function tagsWith(html: string, needle: string): string[] {
  const out: string[] = [];
  for (const match of html.matchAll(/<[a-zA-Z][\w:-]*[^>]*?>/g)) {
    if (match[0].includes(needle)) out.push(match[0]);
  }
  return out;
}

function classTokens(tag: string): string[] {
  const value = tag.match(/\bclass="([^"]*)"/)?.[1] ?? "";
  return value.split(/\s+/).filter((token) => token.length > 0 && !token.startsWith("-macro-"));
}

function expectStyledSlot(html: string, marker: string): string[] {
  const tags = tagsWith(html, marker).filter((tag) => classTokens(tag).length > 0);
  expect(tags.length, marker).toBeGreaterThan(0);
  return tags;
}

function expectExtraClass(rowTag: string, bareHtml: string, bareMarker: string): void {
  const bareTag = tagsWith(bareHtml, bareMarker)[0];
  expect(bareTag, bareMarker).toBeTruthy();
  const bare = new Set(classTokens(bareTag));
  expect(classTokens(rowTag).some((token) => !bare.has(token))).toBe(true);
}

describe("collection slot styles are in the server markup (solid-spectrum)", () => {
  const outDir = resolve(import.meta.dirname, "../../../output");
  mkdirSync(outDir, { recursive: true });

  it("renders ListView label, description, icon, and actions classes", () => {
    const html = renderToString(() => <ListViewSlotStylesFixture />);
    const aloneIcon = renderToString(() => (
      <Provider background="base" colorScheme="dark">
        <BellIcon />
      </Provider>
    ));
    const aloneActions = renderToString(() => (
      <Provider background="base" colorScheme="dark">
        <ActionButtonGroup>
          <ActionButton aria-label="Pin">Pin</ActionButton>
        </ActionButtonGroup>
      </Provider>
    ));

    const rows = expectStyledSlot(html, "data-list-view-item");
    expect(rows.some((tag) => tag.includes('data-key="brief"'))).toBe(true);
    const labels = expectStyledSlot(html, 'data-rsp-slot="label"');
    expect(labels.length).toBeGreaterThan(1);
    expect(labels[0]).toContain('slot="label"');
    const descriptions = expectStyledSlot(html, 'data-rsp-slot="description"');
    expect(descriptions.length).toBeGreaterThan(1);
    expect(descriptions[0]).toContain('slot="description"');
    const icons = expectStyledSlot(html, 'data-rsp-slot="icon"');
    expect(icons[0]).toContain('data-slot="icon"');
    expectExtraClass(icons[0], aloneIcon, "<svg");
    const actions = tagsWith(html, 'slot="actions"').filter((tag) => classTokens(tag).length > 0);
    expect(actions.length).toBeGreaterThan(1);
    expectExtraClass(actions[0], aloneActions, 'role="toolbar"');

    writeFileSync(resolve(outDir, "spectrum-listview-slots-ssr.html"), html, "utf8");
  });

  it("renders Tree label, description, icon, and actions classes", () => {
    const html = renderToString(() => <TreeSlotStylesFixture />);
    const aloneIcon = renderToString(() => (
      <Provider background="base" colorScheme="dark">
        <BellIcon />
      </Provider>
    ));
    const aloneActions = renderToString(() => (
      <Provider background="base" colorScheme="dark">
        <ActionButtonGroup>
          <ActionButton aria-label="Pin">Pin</ActionButton>
        </ActionButtonGroup>
      </Provider>
    ));

    const rows = expectStyledSlot(html, "data-tree-view-item");
    expect(rows.some((tag) => tag.includes('data-key="brief"'))).toBe(true);
    const labels = expectStyledSlot(html, 'data-rsp-slot="label"');
    expect(labels.length).toBeGreaterThan(1);
    expect(labels[0]).toContain('slot="label"');
    const descriptions = expectStyledSlot(html, 'data-rsp-slot="description"');
    expect(descriptions.length).toBeGreaterThan(1);
    expect(descriptions[0]).toContain('slot="description"');
    const icons = expectStyledSlot(html, 'data-rsp-slot="icon"');
    expect(icons[0]).toContain('data-slot="icon"');
    expectExtraClass(icons[0], aloneIcon, "<svg");
    const actions = tagsWith(html, 'slot="actions"').filter((tag) => classTokens(tag).length > 0);
    expect(actions.length).toBeGreaterThan(1);
    expectExtraClass(actions[0], aloneActions, 'role="toolbar"');

    writeFileSync(resolve(outDir, "spectrum-tree-slots-ssr.html"), html, "utf8");
  });
});
