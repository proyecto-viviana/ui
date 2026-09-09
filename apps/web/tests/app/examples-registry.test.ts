/* Contract for the /examples registry.
 *
 * Unlike the showcase registry, this one is NOT a coverage contract: a product
 * screen uses whatever it needs, and no screen owes the package a home for
 * every export. What it must not do is drift — claim a component the package
 * does not ship, name a slug with no route file, or grow a second entry for a
 * slug — because the registry is what writes each screen's title, description
 * and canonical URL. The barrel is parsed textually the same way the showcase
 * test parses it: only named `export {...}` blocks, no `export *`. */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { EXAMPLES, exampleBySlug, exampleSeo } from "../../src/components/examples/registry";

const here = dirname(fileURLToPath(import.meta.url));
const BARREL = resolve(here, "../../../../packages/viviana-ui/src/index.ts");
const ROUTES = resolve(here, "../../src/routes/examples");

/** `route.tsx` is the layout and `index.tsx` is the gallery — neither is a screen. */
const NON_SCREEN_ROUTES = new Set(["route", "index"]);

function barrelValueExports(): Set<string> {
  const src = readFileSync(BARREL, "utf8");
  const valueOnly = src.replace(/export\s+type\s*\{[^}]*\}\s*from\s*"[^"]+";/g, "");
  const names = new Set<string>();
  for (const block of valueOnly.matchAll(/export\s*\{([^}]*)\}\s*from\s*"[^"]+";/g)) {
    for (const raw of block[1].split(",")) {
      const entry = raw.trim();
      if (entry === "" || entry.startsWith("type ")) continue;
      names.add(entry.includes(" as ") ? entry.split(" as ").at(-1)!.trim() : entry);
    }
  }
  return names;
}

function screenRouteSlugs(): string[] {
  return readdirSync(ROUTES)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => name.replace(/\.tsx$/, ""))
    .filter((slug) => !NON_SCREEN_ROUTES.has(slug))
    .sort();
}

describe("examples registry", () => {
  const exported = barrelValueExports();

  it("parses a plausible export surface", () => {
    // Guard against the parser silently matching nothing and passing vacuously.
    expect(exported.size).toBeGreaterThan(100);
    expect(exported.has("Card")).toBe(true);
  });

  it("has unique slugs and two-digit numbers", () => {
    const slugs = EXAMPLES.map((example) => example.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const example of EXAMPLES) {
      expect(example.num, `${example.slug} number`).toMatch(/^\d{2}$/);
      expect(example.slug).toMatch(/^[a-z][a-z-]*$/);
    }
  });

  it("is 1:1 with the screen route files on disk", () => {
    expect(EXAMPLES.map((example) => example.slug).sort()).toEqual(screenRouteSlugs());
  });

  it("claims no component the package does not export", () => {
    const phantom = EXAMPLES.flatMap((example) =>
      example.components
        .filter((name) => !exported.has(name))
        .map((name) => `${name} (${example.slug})`),
    );
    expect(phantom, `registry claims non-exported names: ${phantom.join(", ")}`).toEqual([]);
  });

  it("names at least one register need per screen", () => {
    // `needs[]` is the reconciliation surface against the library workstream:
    // an empty list would silently drop a screen from that reconciliation.
    for (const example of EXAMPLES) {
      expect(example.needs.length, `${example.slug} needs`).toBeGreaterThan(0);
    }
  });

  it("rations the fuchsia fill to at most one ask per screen", () => {
    for (const example of EXAMPLES) {
      expect(typeof example.fuchsiaFill).toBe("string");
    }
  });

  it("derives head tags for every screen", () => {
    for (const example of EXAMPLES) {
      const head = exampleSeo(example.slug);
      // `seo()` suffixes the site name, so match the distinguishing prefix.
      const title = head.meta.find((tag) => "title" in tag)?.title;
      expect(title, `${example.slug} title`).toContain(`${example.title} · Examples`);
      const canonical = head.links.find((link) => link.rel === "canonical")?.href;
      expect(canonical, `${example.slug} canonical`).toContain(`/examples/${example.slug}`);
    }
    expect(() => exampleSeo("nope")).toThrow();
  });

  it("looks screens up by slug", () => {
    expect(exampleBySlug("home")?.title).toBe("Home");
    expect(exampleBySlug("nope")).toBeUndefined();
  });
});
