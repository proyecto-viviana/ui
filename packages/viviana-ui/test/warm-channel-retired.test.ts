import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

/* Terminal Glass has no warm channel: amber, orange and violet were deleted outright
 * rather than aliased, because an alias is exactly what let v1's warm pixels stay
 * reachable from every colour prop. Two failure modes survive both a typecheck and a
 * build: a retired hex pasted back into a component (it bakes into an atom and ships),
 * and a half-removal where one layer still offers `orange` while the layer under it no
 * longer resolves it — which paints Adobe's stock orange, not a register colour. */
const srcDir = join(dirname(fileURLToPath(import.meta.url)), "../src");

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "pixel-icons" || entry === "s2-icons") continue; // generated glyph data
      out.push(...sourceFiles(full));
      continue;
    }
    if (/\.(ts|tsx|css)$/.test(entry)) out.push(full);
  }
  return out;
}

/* v1's warm ramp anchors and the two retired brand hexes, as published in the frozen
 * register. Any of these back in the tree means the warm channel returned. */
const RETIRED_HEXES = [
  "#ff6b35",
  "#f79009",
  "#f9b45c",
  "#c96a00",
  "#e8a34f",
  "#b86a14",
  "#8b5cf6",
  "#ffedb0",
  "#f5d88a",
];

describe("retired warm channel", () => {
  it("keeps every retired hex out of the shipped source", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(srcDir)) {
      const text = readFileSync(file, "utf8").toLowerCase();
      for (const hex of RETIRED_HEXES) {
        if (text.includes(hex)) offenders.push(`${file}: ${hex}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("offers no `orange` colour on any public prop", () => {
    const badge = readFileSync(join(srcDir, "badge/index.tsx"), "utf8");
    const iconStyle = readFileSync(join(srcDir, "style/index.ts"), "utf8");
    expect(badge).not.toMatch(/^\s*\|\s*"orange"\s*$/m);
    expect(iconStyle).not.toMatch(/^\s*\|\s*"orange"\s*$/m);
  });

  it("publishes no orange semantic token for a prop to resolve", () => {
    /* The base Spectrum ramp stays (Adobe's own values, unreferenced); what must not
       come back is a semantic key, since that is what a colour prop looks up. */
    const theme = readFileSync(join(srcDir, "style/spectrum-theme.ts"), "utf8");
    expect(theme).not.toMatch(/"?orange"?:\s*weirdColorToken/);
    expect(theme).not.toMatch(/"orange-subtle":/);
  });
});
