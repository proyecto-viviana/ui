import { describe, expect, it } from "vite-plus/test";
import { dither, edgeFade, glassSurface, wellScan } from "../src/s2-internal/style-utils";

/* These two helpers are how ~96 components inherit the register by construction, so a
 * regression here is silent and system-wide: nothing throws, the components just stop
 * looking like Terminal Glass. The failure modes named below are the ones that actually
 * happened while porting — a surface tier falling back to its neighbour's translucency,
 * and a dither call site retyping the gradient by hand and drifting off the token. */
describe("glassSurface", () => {
  it("gives the float tier its own density, blur and cast shadow", () => {
    /* A float lands OVER a card. If it inherits the card's translucency and rim it has no
     * visible boundary against the surface underneath it, and its text sits on whatever
     * that surface was showing. */
    const float = glassSurface("float");
    expect(float.backgroundColor).toBe("float");
    expect(float.backdropFilter).toBe("var(--blur-clear)");
    expect(float.boxShadow).toBe("float");
    expect(float.borderRadius).toBe("default");
  });

  it("keeps panel and card on the rim, not the cast shadow", () => {
    /* The register draws no cast shadows on its structural surfaces; the float is the one
     * exception, and it stays an exception. */
    for (const surface of ["panel", "card"] as const) {
      expect(glassSurface(surface).boxShadow).toBe("edge-glass-surface");
      expect(glassSurface(surface).borderRadius).toBe(surface);
    }
  });
});

describe("dither", () => {
  it("defaults to the well scan, so wellScan() stays one value", () => {
    expect(wellScan()).toEqual(dither());
    expect(wellScan().backgroundImage.default).toBe(
      "[repeating-conic-gradient(var(--well-scan) 0% 25%, transparent 0% 50%)]",
    );
    expect(wellScan().backgroundSize).toBe("[var(--dither-tile) var(--dither-tile)]");
  });

  it("threads a tile and an ink through the same gradient", () => {
    const fine = dither({ tile: "var(--dither-tile-fine)", color: "var(--accent-detail)" });
    expect(fine.backgroundImage.default).toBe(
      "[repeating-conic-gradient(var(--accent-detail) 0% 25%, transparent 0% 50%)]",
    );
    expect(fine.backgroundSize).toBe("[var(--dither-tile-fine) var(--dither-tile-fine)]");
  });

  it("drops the dither under forced colors", () => {
    /* The surface is forced there; a checker over it is noise that reads as texture on a
     * high-contrast background. */
    expect(dither().backgroundImage.forcedColors).toBe("none");
  });
});

describe("edgeFade", () => {
  it("composites the Bayer checker with the ramp rather than fading smoothly", () => {
    /* A plain gradient mask is the failure mode: it fades continuously, which reads as
     * anti-aliased next to a register where everything else steps. Both layers must
     * survive, and they must be ADDED — `source-over` would let the checker punch holes
     * through the middle of the container instead of only at its edges. */
    const fade = edgeFade();
    expect(fade.maskImage).toContain("linear-gradient(180deg");
    expect(fade.maskImage).toContain("data:image/svg+xml");
    expect(fade.maskSize).toBe("[100% 100%, 4px 4px]");
    expect(fade.maskRepeat).toBe("[no-repeat, repeat]");
    expect(fade.maskComposite).toBe("[add]");
  });

  it("keeps the fade depth on --gl-fade so a call site tunes one property", () => {
    expect(edgeFade().maskImage).toContain("var(--gl-fade, 24px)");
    expect(edgeFade("inline").maskImage).toContain("linear-gradient(90deg");
  });
});
