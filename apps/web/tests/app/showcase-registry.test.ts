/* Coverage contract for the /showcase registry: every public component-like
   export of @proyecto-viviana/ui must be claimed by exactly one panel, and no
   panel may claim a name the package does not export. The barrel is parsed
   textually — it uses only named `export {...}` blocks (no `export *`), so
   stripping `export type {...}` blocks and collecting the value-export names
   is exact. */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PANELS } from "../../src/components/showcase/registry";

const here = dirname(fileURLToPath(import.meta.url));
const BARREL = resolve(here, "../../../../packages/viviana-ui/src/index.ts");

/** Value exports that are real components but intentionally have no showcase
 * panel home. Keep this list empty unless there is a written reason. */
const EXEMPT: readonly string[] = [];

function barrelValueExports(): Set<string> {
  const src = readFileSync(BARREL, "utf8");
  // Drop type-only export blocks, then collect names from the value blocks.
  const valueOnly = src.replace(/export\s+type\s*\{[^}]*\}\s*from\s*"[^"]+";/g, "");
  const names = new Set<string>();
  for (const block of valueOnly.matchAll(/export\s*\{([^}]*)\}\s*from\s*"[^"]+";/g)) {
    for (const raw of block[1].split(",")) {
      // Honor per-name `type X` markers and `X as Y` renames (exported name wins).
      const entry = raw.trim();
      if (entry === "" || entry.startsWith("type ")) continue;
      const name = entry.includes(" as ") ? entry.split(" as ").at(-1)!.trim() : entry;
      names.add(name);
    }
  }
  return names;
}

function componentLike(names: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const n of names) {
    if (!/^[A-Z]/.test(n)) continue; // components are PascalCase
    if (n.endsWith("Icon") && n !== "Icon") continue; // icon glyphs: not panel material
    if (n.endsWith("Context")) continue; // wiring, not surface
    if (n.startsWith("I18n")) continue; // i18n infra (I18nProvider)
    out.add(n);
  }
  return out;
}

describe("showcase registry coverage", () => {
  const exported = componentLike(barrelValueExports());
  const claimed = PANELS.flatMap((p) => p.components.map((c) => ({ panel: p.slug, name: c })));

  it("parses a plausible export surface", () => {
    // Guard against the parser silently matching nothing.
    expect(exported.size).toBeGreaterThan(100);
    expect(exported.has("Button")).toBe(true);
  });

  it("claims no name the package does not export", () => {
    const phantom = claimed.filter((c) => !exported.has(c.name));
    expect(phantom, `registry claims non-exported names: ${phantom.map((c) => `${c.name} (${c.panel})`).join(", ")}`).toEqual([]);
  });

  it("claims every component-like export exactly once", () => {
    const counts = new Map<string, number>();
    for (const c of claimed) counts.set(c.name, (counts.get(c.name) ?? 0) + 1);
    const missing = [...exported].filter((n) => !counts.has(n) && !EXEMPT.includes(n)).sort();
    const duplicated = [...counts].filter(([, n]) => n > 1).map(([name]) => name);
    expect(missing, `exports without a panel home: ${missing.join(", ")}`).toEqual([]);
    expect(duplicated, `exports claimed by more than one panel: ${duplicated.join(", ")}`).toEqual([]);
  });
});
