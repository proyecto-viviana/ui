/**
 * Hydration-reactivity guard for the Button (@proyecto-viviana/ui).
 *
 * This suite hydrates each SSR fixture over its server markup and then flips
 * the signal, asserting:
 *  - RECREATION re-binds after hydration.
 *  - FINE-GRAINED reactive text passed directly as Button children re-binds
 *    without recreating the Button subtree (host identity survives setCount).
 * Both shapes must hydrate with no throw and no console.error (no mismatch).
 */
import { createMemo, createSignal, flush } from "solid-js";
import type { JSX } from "@solidjs/web";
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

async function hydrateAndFlip(
  ssrFile: string,
  Fixture: (props: { count: () => number }) => JSX.Element,
): Promise<{
  before?: string;
  after?: string;
  serverButton: HTMLButtonElement | null;
  afterButton: HTMLButtonElement | null;
}> {
  const [count, setCount] = createSignal(0);
  let serverButton: HTMLButtonElement | null = null;
  const container = await hydrateOverSsr(readSsr(ssrFile), () => <Fixture count={count} />, {
    beforeHydrate(container) {
      serverButton = container.querySelector("button");
      expect(serverButton).not.toBeNull();
    },
  });
  expect(container.querySelector("button")).toBe(serverButton);
  const before = container.querySelector("button")?.textContent?.trim();
  setCount(1);
  flush();
  const afterButton = container.querySelector("button");
  const after = afterButton?.textContent?.trim();
  return { before, after, serverButton, afterButton };
}

describe("Button hydration reactivity (@proyecto-viviana/ui)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("recreation pattern re-binds after hydration", async () => {
    const r = await hydrateAndFlip("vui-button-recreate-ssr.html", RecreationFixture);
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
  });

  it("re-binds fine-grained direct text children after hydration", async () => {
    const r = await hydrateAndFlip("vui-button-finegrained-ssr.html", FineGrainedFixture);
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
    expect(r.afterButton).toBe(r.serverButton);
  });
});
