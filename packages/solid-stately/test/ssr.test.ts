/**
 * Tests for createId
 *
 * Ported from @react-aria/utils useId.
 */
import { describe, it, expect } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createId } from "../src/ssr";

describe("createId", () => {
  it("does not consume an id when a default id is given (#596)", () => {
    // Ticket #596 restored early return on defaultId across solidaria and solid-stately.
    createRoot((dispose) => {
      const counterOf = (id: string) => Number(id.slice(id.lastIndexOf("-") + 1));

      const first = createId();
      const custom = createId("given-id");
      const third = createId();

      expect(custom).toBe("given-id");
      expect(counterOf(third) - counterOf(first)).toBe(1);

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
