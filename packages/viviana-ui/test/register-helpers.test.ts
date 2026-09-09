import { describe, expect, it } from "vite-plus/test";
import {
  dither,
  edgeFade,
  glassSurface,
  hudBracket,
  pixelBlocks,
  wellScan,
} from "../src/s2-internal/style-utils";

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

describe("pixelBlocks", () => {
  it("leaves a gutter between blocks instead of painting a continuous bar", () => {
    /* The failure mode: a repeating gradient whose stop is the block width, which tiles
     * edge to edge and produces exactly the solid bar the register refuses to draw for a
     * countable quantity. The transparent leg has to run to `block + gap`. */
    const row = pixelBlocks();
    expect(row.backgroundImage.default).toBe(
      "[repeating-linear-gradient(to right, var(--status-metric) 0 10px, transparent 10px calc(10px + 4px))]",
    );
  });

  it("keeps the blocks square and vertically centred on their track", () => {
    /* Sizing the layer to `100% 100%` instead of `100% block` stretches every block to the
     * track's height, so a 10px block in a 24px tile reads as a bar again. */
    expect(pixelBlocks().backgroundSize).toBe("[100% 10px]");
    expect(pixelBlocks().backgroundPosition).toBe("[left center]");
    expect(pixelBlocks().backgroundRepeat).toBe("[repeat-x]");
  });

  it("threads the channel colour and the handoff's 6-12px geometry", () => {
    const streak = pixelBlocks({ block: "6px", gap: "3px", color: "var(--accent-detail)" });
    expect(streak.backgroundImage.default).toContain("var(--accent-detail) 0 6px");
    expect(streak.backgroundImage.default).toContain("calc(6px + 3px)");
  });

  it("drops the blocks under forced colors", () => {
    expect(pixelBlocks().backgroundImage.forcedColors).toBe("none");
  });
});

describe("hudBracket", () => {
  it("marks four corners, not a border", () => {
    /* Eight layers or it is not a bracket: two arms per corner. Fewer means some corner is
     * drawing an L on one axis only, which reads as a broken border rather than a HUD
     * mark, and nothing else in the output would look wrong. */
    const frame = hudBracket();
    const layers = frame.backgroundImage.default.split("), linear-gradient(");
    expect(layers).toHaveLength(8);
    expect(frame.backgroundPosition.match(/left|right/g)).toHaveLength(8);
    expect(frame.backgroundRepeat).toBe("[no-repeat]");
  });

  it("pairs one arm along each axis at every corner", () => {
    /* Both arms of a corner share its position, and they are the transpose of each other —
     * `arm x stroke` and `stroke x arm`. A pair that came out the same shape draws a
     * square blob in the corner instead of an L, and a size list that fell out of step
     * with the position list moves an arm to the wrong corner. */
    const arm = "var(--hud-bracket, 14px)";
    const stroke = "var(--hud-stroke, 2px)";
    expect(hudBracket().backgroundSize).toBe(
      `[${[`${arm} ${stroke}`, `${stroke} ${arm}`].join(", ")}, ` +
        `${[`${arm} ${stroke}`, `${stroke} ${arm}`].join(", ")}, ` +
        `${[`${arm} ${stroke}`, `${stroke} ${arm}`].join(", ")}, ` +
        `${[`${arm} ${stroke}`, `${stroke} ${arm}`].join(", ")}]`,
    );
    expect(hudBracket().backgroundPosition).toBe(
      "[left top, left top, right top, right top, left bottom, left bottom, right bottom, right bottom]",
    );
  });

  it("steps the arm to the frame sizes the handoff draws, and never the stroke", () => {
    /* 14px is the card token, 22px the theater frame, 26px the top of the documented
     * range. The stroke stays `--hud-stroke` at every size — a bracket that scaled its
     * stroke with its arm would thicken into a corner fill on a full-bleed frame. */
    expect(hudBracket({ size: "M" }).backgroundSize).toContain("22px var(--hud-stroke, 2px)");
    expect(hudBracket({ size: "L" }).backgroundSize).toContain("26px var(--hud-stroke, 2px)");
    for (const size of ["S", "M", "L"] as const) {
      const strokes = hudBracket({ size }).backgroundSize.match(/var\(--hud-stroke, 2px\)/g);
      expect(strokes).toHaveLength(8);
    }
  });

  it("takes the channel colour and drops out under forced colors", () => {
    expect(hudBracket({ color: "var(--accent-detail)" }).backgroundImage.default).toContain(
      "linear-gradient(var(--accent-detail), var(--accent-detail))",
    );
    expect(hudBracket().backgroundImage.forcedColors).toBe("none");
  });
});
