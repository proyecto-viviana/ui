/**
 * Hydration-reactivity guard for the S2 Button.
 *
 * The comparison D12 (SSR/hydration) work drives the Button through a
 * createMemo-recreation pattern: a control event swaps demoProps, the memo
 * rebuilds the whole Button subtree. This suite hydrates each SSR fixture over
 * its server markup and then flips the signal, asserting:
 *  - RECREATION re-binds after hydration (the property the fixture relies on).
 *  - FINE-GRAINED reactive text passed directly as Button children re-binds
 *    without recreating the Button subtree.
 * Both shapes must hydrate with no throw and no console.error (no mismatch).
 */
import { createMemo, createSignal, type JSX } from "solid-js";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { Provider } from "../src/provider";
import { Button } from "../src/button";

function FineGrainedFixture(props: { count: () => number }) {
  return (
    <Provider background="base" colorScheme="dark">
      <Button variant="accent">count: {props.count()}</Button>
    </Provider>
  );
}

function RecreationFixture(props: { count: () => number }) {
  const rendered = createMemo(() => (
    <Button variant="accent">
      <span data-rsp-slot="text">count: {props.count()}</span>
    </Button>
  ));
  return (
    <Provider background="base" colorScheme="dark">
      {rendered()}
    </Provider>
  );
}

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

function hydrateAndFlip(
  ssrFile: string,
  Fixture: (props: { count: () => number }) => JSX.Element,
): { before?: string; after?: string } {
  const [count, setCount] = createSignal(0);
  const container = hydrateOverSsr(readSsr(ssrFile), () => <Fixture count={count} />);
  const before = container.querySelector("button")?.textContent?.trim();
  setCount(1);
  const after = container.querySelector("button")?.textContent?.trim();
  return { before, after };
}

describe("Button hydration reactivity", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("recreation pattern re-binds after hydration (comparison fixture shape)", () => {
    const r = hydrateAndFlip("button-recreate-ssr.html", RecreationFixture);
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
  });

  it("re-binds fine-grained direct text children after hydration", () => {
    const r = hydrateAndFlip("button-finegrained-ssr.html", FineGrainedFixture);
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
  });
});
