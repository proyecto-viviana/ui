import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { fallbackFunction, hookCases, HydrationHookFixture } from "./fixtures/hydrationHooks";

describe("hook owner SSR parity", () => {
  for (const kind of hookCases) {
    it(`serializes ${kind} without browser work`, () => {
      const states: unknown[] = [];
      const calls: number[] = [];
      let followingId = "";
      const html = renderToString(() => (
        <HydrationHookFixture
          kind={kind}
          state={(read) => states.push(read())}
          id={(id) => {
            followingId = id;
          }}
          ran={(value) => calls.push(value)}
        />
      ));
      expect(calls).toEqual([]);
      const expected =
        kind === "hydration-state" || kind === "is-ssr"
          ? true
          : kind === "browser-function"
            ? fallbackFunction
            : kind === "browser-value"
              ? "fallback"
              : kind === "browser-effect"
                ? 0
                : false;
      expect(states).toEqual([expected]);
      expect(followingId).not.toBe("");
      expect(html).toContain(`id="${followingId}"`);
      expect(html).toMatch(/\s_hk=/);
      const output = resolve(import.meta.dirname, "../../../output");
      mkdirSync(output, { recursive: true });
      writeFileSync(resolve(output, `hook-${kind}-ssr.html`), html, "utf8");
    });
  }
});
