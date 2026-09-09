import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { meshStrip } from "../src/style/meshStrip";

/* Resolved against the working directory, not `import.meta.url`: this file is read
 * by the DOM-environment runner from the repo root, where `import.meta.url` is an
 * http URL and `fileURLToPath` throws before a single test runs. */
function readSource(relative: string): string {
  for (const base of ["packages/viviana-ui", "."]) {
    const candidate = resolve(process.cwd(), base, relative);
    if (existsSync(candidate)) return readFileSync(candidate, "utf8");
  }
  throw new Error(`cannot locate ${relative} from ${process.cwd()}`);
}

const cardSource = readSource("src/card/index.tsx");
const meshFieldSource = readSource("src/card/mesh-field.ts");
const tokens = readSource("src/viviana-tokens.css");

/* The mesh card's paint is a css() escape hatch, so nothing about it typechecks and
 * every one of these lines is load-bearing: drop it and the card still renders, just
 * without the treatment (or, for --bd, with a flat accent wash that never clears). */
describe("mesh card paint", () => {
  it("registers --bd as an animatable percentage that rests collapsed", () => {
    /* Unregistered, --bd is an unparsed token: the ring's radial-gradient mask is
     * invalid and --ring-c floods the whole card. A <color> syntax (or a non-zero
     * initial value) is the same bug in a different costume. */
    const block = /@property --bd \{([^}]*)\}/.exec(tokens)?.[1] ?? "";
    expect(block).toMatch(/syntax:\s*"<percentage>"/);
    expect(block).toMatch(/initial-value:\s*0%/);
    expect(block).toMatch(/inherits:\s*false/);
    expect(cardSource).toContain("--bd 0.6s steps(10, end)");
  });

  it("lights only the innermost hovered card", () => {
    /* Nested cards would otherwise both light: the outer one is hovered whenever the
     * inner one is. Both pseudo-elements need the guard, not just the spotlight. */
    const guards = cardSource.match(/&:hover:not\(:has\(\[data-mesh]:hover\)\)::(after|before)/g);
    expect(guards?.sort()).toEqual([
      "&:hover:not(:has([data-mesh]:hover))::after",
      "&:hover:not(:has([data-mesh]:hover))::before",
    ]);
  });

  it("keeps the spotlight layer beneath the card's own content", () => {
    /* z-index:-1 escapes the card and paints behind the page without a stacking
     * context of its own. */
    expect(cardSource).toContain("isolation: isolate");
    expect(cardSource).toMatch(/&::after \{[^}]*z-index: -1;/);
  });

  it("masks the spotlight through grain, intersected rather than stacked", () => {
    expect(cardSource).toContain("mask-composite: intersect;");
    expect(cardSource).toContain("mask-size: 180px 180px, 100% 100%;");
    expect(cardSource).toContain("feTurbulence");
  });

  it("boosts the card's own weave for the spotlight instead of minting a second one", () => {
    /* Same seed, same options, brighter strokes — an independent weave would shear
     * against the resting one under the cursor. */
    expect(meshStrip({ dark: true, seed: 42, boost: 2.4 })).not.toBe(
      meshStrip({ dark: true, seed: 42 }),
    );
    expect(cardSource).toContain("boost: 2.4");
    expect(cardSource).toContain('"--gl-weave"');
    expect(cardSource).toContain('"--gl-grain"');
  });

  it("anchors the weave to the page, and re-anchors when layout moves", () => {
    /* Without the scroll offsets each card restarts the pattern at its own corner and
     * the wall of cards stops reading as one mesh. */
    expect(meshFieldSource).toContain("window.scrollX");
    expect(meshFieldSource).toContain("window.scrollY");
    expect(meshFieldSource).toContain('window.addEventListener("resize", align)');
    expect(meshFieldSource).toContain('window.removeEventListener("resize", align)');
  });

  it("tears the cursor listener down with the card", () => {
    /* A document-level mousemove that outlives its card leaks a listener per mount
     * and writes to a detached node on every frame. */
    expect(meshFieldSource).toContain('document.removeEventListener("mousemove", onMove)');
    expect(meshFieldSource).toContain("cancelAnimationFrame(frame)");
    expect(meshFieldSource).toContain("clearTimeout(settle)");
  });
});
