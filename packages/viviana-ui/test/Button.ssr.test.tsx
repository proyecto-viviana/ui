/**
 * SSR half of the Button hydration-reactivity regression (@proyecto-viviana/ui).
 *
 * Emits hydratable server markup for the two Button children shapes:
 *  - recreation: the comparison fixture's pattern.
 *  - finegrained: reactive text passed directly as Button children.
 *
 * Runs under vitest.ssr.config.ts (renderToString, hydratable). The companion
 * Button.hydrate.test.tsx hydrates over this output.
 */
import { renderToString } from "@solidjs/web";
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

describe("Button SSR (@proyecto-viviana/ui)", () => {
  it("renders hydratable markup for both children shapes", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    const fine = renderToString(() => <FineGrainedFixture count={() => 0} />);
    const recreate = renderToString(() => <RecreationFixture count={() => 0} />);

    expect(fine).toMatch(/count:[\s\S]*0/);
    expect(recreate).toMatch(/count:[\s\S]*0/);
    expect(recreate).toContain('data-rsp-slot="text"');

    writeFileSync(resolve(outDir, "vui-button-finegrained-ssr.html"), fine, "utf8");
    writeFileSync(resolve(outDir, "vui-button-recreate-ssr.html"), recreate, "utf8");
  });
});
