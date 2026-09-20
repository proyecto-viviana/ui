import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import {
  fallbackFunction,
  focusHookCases,
  FocusHookFixture,
  FocusScopeFixture,
  hookCases,
  HydrationHookFixture,
  scopeModes,
} from "./fixtures/hydrationHooks";
import { getAutoFocusQueueLength } from "../src/focus/createAutoFocus";
import { getFocusStackLength } from "../src/focus/createFocusRestore";

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

describe("focus hook owner SSR parity", () => {
  for (const kind of focusHookCases) {
    it(`serializes ${kind} with inert server APIs and a following ID`, () => {
      const calls: string[] = [];
      const snapshots: unknown[] = [];
      let followingId = "";
      const html = renderToString(() => (
        <FocusHookFixture
          kind={kind}
          id={(id) => {
            followingId = id;
          }}
          readRef={() => calls.push("ref")}
          focused={() => calls.push("focus")}
          restored={() => calls.push("restore")}
          auto={(api) => {
            api.focus();
            api.cancel();
            snapshots.push({ queued: getAutoFocusQueueLength() });
          }}
          restore={(api) => {
            api.saveCurrentFocus();
            snapshots.push({ saved: api.getSavedElement(), restored: api.restore() });
            api.clear();
          }}
          virtual={(api) => {
            api.focusNext();
            snapshots.push({
              key: api.focusedKey(),
              active: api.containerProps["aria-activedescendant"](),
            });
          }}
        />
      ));
      expect(calls).toEqual([]);
      expect(getAutoFocusQueueLength()).toBe(0);
      expect(getFocusStackLength()).toBe(0);
      expect(snapshots).toEqual([
        kind === "auto-focus"
          ? { queued: 0 }
          : kind === "focus-restore"
            ? { saved: null, restored: false }
            : { key: null, active: undefined },
      ]);
      expect(followingId).not.toBe("");
      expect(html).toContain(`id="${followingId}"`);
      expect(html).toContain(`data-focus-hook="${kind}"`);
      expect(html).toMatch(/\s_hk=/);
      const output = resolve(import.meta.dirname, "../../../output");
      mkdirSync(output, { recursive: true });
      writeFileSync(resolve(output, `hook-${kind}-ssr.html`), html, "utf8");
    });
  }
});

describe("FocusScope SSR structure and context", () => {
  for (const mode of scopeModes) {
    it(`serializes ${mode} scope sentinels and an inert descendant manager`, () => {
      const managers: boolean[] = [];
      const calls: unknown[] = [];
      const refs: Element[] = [];
      let id = "";
      const html = renderToString(() => (
        <FocusScopeFixture
          mode={mode}
          manager={(manager) => {
            managers.push(!!manager);
            if (manager) {
              calls.push(
                manager.focusFirst(),
                manager.focusLast(),
                manager.focusNext(),
                manager.focusPrevious(),
              );
            }
          }}
          id={(value) => {
            id = value;
          }}
          ref={(node) => refs.push(node)}
        />
      ));
      expect(managers).toEqual([true]);
      expect(calls).toEqual([null, null, null, null]);
      expect(refs).toEqual([]);
      expect(id).not.toBe("");
      expect(html).toContain(`for="${id}"`);
      expect(html).toContain(`id="${id}"`);
      expect(html.match(/data-focus-scope-start/g)).toHaveLength(1);
      expect(html.match(/data-focus-scope-end/g)).toHaveLength(1);
      expect(html).toMatch(/<span[^>]*data-focus-scope-start[^>]*hidden/);
      expect(html).toMatch(/<span[^>]*data-focus-scope-end[^>]*hidden/);
      expect(html.indexOf("data-focus-scope-start")).toBeLessThan(html.indexOf("data-scope-first"));
      expect(html.indexOf("data-scope-last")).toBeLessThan(html.indexOf("data-focus-scope-end"));
      expect(html).toMatch(/\s_hk=/);
      const output = resolve(import.meta.dirname, "../../../output");
      mkdirSync(output, { recursive: true });
      writeFileSync(resolve(output, `focus-scope-${mode}-ssr.html`), html, "utf8");
    });
  }
});
