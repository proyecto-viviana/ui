/**
 * Hydration half of the field-adornment twin (#545 class 2), for both
 * components the baseline carries `children()` rows for: `TextField` and
 * `SearchField`.
 *
 * Reads the markup TextField.ssr.test.tsx writes (run that first) and hydrates
 * a DOM-compiled TextField over it. This is the environment that reproduced
 * `/showcase/inputs`: the client applies the input's ref with `getOwner() ===
 * null`, the ref reads `context.inputProps`, the prefix proxy resolves the
 * computed adornment id set, and that re-runs the `suffix` getter — a
 * `useContext` with no owner, i.e. `NoOwnerError` and a blank route.
 *
 * The reactive cases below answer the question that fix left open (#545, #611):
 * `children()` rendered as JSX is what `guard:idiomatic-solid` flags as the
 * #135 freeze, so does an adornment carrying a signal still update once the
 * page is hydrated? Measured here: it does, for wrapped and for bare mixed
 * text, in the server's own claimed nodes, in each field component — SearchField
 * gates its adornments through three `<Show>`s rather than TextField's two, so
 * it is rendered rather than reasoned from TextField. The freeze needs the
 * snapshot to be read untracked — the two controls show both sides, and reading
 * each adornment once in either field's body instead of in the JSX fails
 * `bare: 1` here.
 */
import { createSignal, flush } from "solid-js";
import type { JSX } from "@solidjs/web";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import {
  ChildrenSnapshotInBodyFixture,
  ChildrenSnapshotInJsxFixture,
  SearchFieldReactiveAdornmentsFixture,
  TextFieldAdornmentsFixture,
  TextFieldReactiveAdornmentsFixture,
} from "./fixtures/textfield-adornments";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

const ssrHtml = readSsr("viviana-ui-textfield-adornments-ssr.html");

/**
 * Hydrate `Fixture` over its server markup, flip the signal, report the text.
 * `selector` names host elements the client must claim rather than rebuild —
 * without that identity check an "it updates" reading could just be a subtree
 * Solid threw away and rendered fresh.
 */
async function hydrateAndFlip(
  ssrFile: string,
  Fixture: (props: { count: () => number }) => JSX.Element,
  selector: string,
): Promise<{ before: string; after: string }> {
  const [count, setCount] = createSignal(0);
  let serverNodes: Element[] = [];
  const container = await hydrateOverSsr(readSsr(ssrFile), () => <Fixture count={count} />, {
    beforeHydrate(container) {
      serverNodes = Array.from(container.querySelectorAll(selector));
      expect(serverNodes.length).toBeGreaterThan(0);
    },
  });
  const hydratedNodes = Array.from(container.querySelectorAll(selector));
  expect(hydratedNodes).toHaveLength(serverNodes.length);
  serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));

  const before = container.textContent ?? "";
  setCount(1);
  flush();
  return { before, after: container.textContent ?? "" };
}

describe("viviana-ui field adornments hydrate over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates a context-reading prefix and suffix without throwing", async () => {
    const selector = "input, kbd";
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(ssrHtml, () => <TextFieldAdornmentsFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll(selector));
        expect(serverNodes).toHaveLength(3);
      },
    });

    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    expect(container.textContent).toContain("⌘");
    expect(container.textContent).toContain("↵");
  });

  it("keeps reactive TextField adornment text live after hydration (#545, #611)", async () => {
    const r = await hydrateAndFlip(
      "viviana-ui-textfield-reactive-adornments-ssr.html",
      TextFieldReactiveAdornmentsFixture,
      "input, kbd",
    );
    expect(r.before).toContain("wrapped: 0");
    expect(r.before).toContain("bare: 0");
    expect(r.after).toContain("wrapped: 1");
    expect(r.after).toContain("bare: 1");
  });

  it("keeps reactive SearchField adornment text live after hydration (#545, #611)", async () => {
    const r = await hydrateAndFlip(
      "viviana-ui-searchfield-reactive-adornments-ssr.html",
      SearchFieldReactiveAdornmentsFixture,
      "input, kbd",
    );
    expect(r.before).toContain("wrapped: 0");
    expect(r.before).toContain("bare: 0");
    expect(r.after).toContain("wrapped: 1");
    expect(r.after).toContain("bare: 1");
  });

  it("control: a children() snapshot read inside JSX stays live", async () => {
    const r = await hydrateAndFlip(
      "viviana-ui-children-snapshot-in-jsx-ssr.html",
      ChildrenSnapshotInJsxFixture,
      "em[data-control]",
    );
    expect(r.before).toContain("control: 0");
    expect(r.after).toContain("control: 1");
  });

  it("control: a children() snapshot read in the component body freezes", async () => {
    const r = await hydrateAndFlip(
      "viviana-ui-children-snapshot-in-body-ssr.html",
      ChildrenSnapshotInBodyFixture,
      "em[data-control]",
    );
    expect(r.before).toContain("control: 0");
    expect(r.after).toContain("control: 0");
  });
});
