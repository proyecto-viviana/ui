import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { TooltipFixture, tooltipCases } from "./fixtures/tooltip";

describe("public Tooltip SSR routes", () => {
  for (const kind of tooltipCases) {
    it(`serializes the ${kind} outer route without portal content`, () => {
      const calls: string[] = [];
      let id = "";
      const html = renderToString(() => (
        <TooltipFixture
          kind={kind}
          created={() => calls.push("created")}
          disposed={() => calls.push("disposed")}
          changed={() => calls.push("changed")}
          ref={() => calls.push("ref")}
          id={(value) => {
            id = value;
          }}
        />
      ));
      expect(calls).toEqual([]);
      expect(html).toContain(`data-tooltip-route="${kind}"`);
      expect(html).not.toContain('role="tooltip"');
      expect(html).not.toContain("Helpful description");
      expect(html).not.toContain("data-overlay-container");
      if (kind !== "standalone") {
        expect(html).toContain("Helpful action");
        expect(html).toContain("data-tooltip-trigger");
        expect(html).toContain("display:contents");
      }
      expect(id).not.toBe("");
      expect(html).toContain(`for="${id}"`);
      expect(html).toContain(`id="${id}"`);
      expect(html).toMatch(/\s_hk=/);
      const output = resolve(import.meta.dirname, "../../../output");
      mkdirSync(output, { recursive: true });
      writeFileSync(resolve(output, `tooltip-${kind}-ssr.html`), html, "utf8");
    });
  }
});
