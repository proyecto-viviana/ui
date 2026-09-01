/**
 * SSR half of the Button hydration-reactivity regression.
 *
 * Emits hydratable server markup for the two Button children shapes the
 * comparison D12 (SSR/hydration) work depends on characterizing:
 *  - recreation: the comparison fixture's real pattern — a createMemo returns a
 *                fresh Button whose label is wrapped in an explicit
 *                data-rsp-slot="text" span. A control event swaps demoProps, the
 *                memo rebuilds the whole subtree. This is the shape a browser
 *                D12 pair-oracle will drive.
 *  - finegrained: reactive text passed directly as Button children. The
 *                 hydrate half proves this text re-binds without recreation.
 *
 * Runs under vitest.ssr.config.ts (renderToString, hydratable). The companion
 * Button.hydrate.test.tsx hydrates over this output.
 */
import { renderToString } from "solid-js/web";
import { createMemo } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
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

describe("Button SSR", () => {
  it("renders hydratable markup for both children shapes", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    const fine = renderToString(() => <FineGrainedFixture count={() => 0} />);
    const recreate = renderToString(() => <RecreationFixture count={() => 0} />);

    // SSR interleaves hydration markers (count: <!--$-->0<!--/-->), so match loosely.
    expect(fine).toMatch(/count:[\s\S]*0/);
    expect(recreate).toMatch(/count:[\s\S]*0/);
    expect(recreate).toContain('data-rsp-slot="text"');

    writeFileSync(resolve(outDir, "button-finegrained-ssr.html"), fine, "utf8");
    writeFileSync(resolve(outDir, "button-recreate-ssr.html"), recreate, "utf8");
  });
});
