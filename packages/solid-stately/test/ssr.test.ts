/**
 * Tests for createId
 *
 * Ported from @react-aria/utils useId.
 */
import { describe, it, expect } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createId } from "../src/ssr";

describe("createId", () => {
  it("consumes an id even when a default id is given", () => {
    // Upstream `useId` always calls `useSSRSafeId` and only then picks the
    // default (`useId.ts:33-46`). Solid 2's `createUniqueId` is order-dependent
    // in both branches (`cl-${counter++}`, or `getNextContextId()` while
    // hydrating), so an early return on `defaultId` shifts every later id in
    // the same render or hydration pass.
    createRoot((dispose) => {
      const counterOf = (id: string) => Number(id.slice(id.lastIndexOf("-") + 1));

      const first = createId();
      createId("given-id");
      const third = createId();

      expect(counterOf(third) - counterOf(first)).toBe(2);

      dispose();
    });
  });

  it("returns the default id when one is given", () => {
    createRoot((dispose) => {
      expect(createId("my-custom-id")).toBe("my-custom-id");
      dispose();
    });
  });
});
