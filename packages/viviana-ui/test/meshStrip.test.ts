import { describe, expect, it } from "vite-plus/test";
import { meshStrip } from "../src/style/meshStrip";

/* The weave is a seeded generator that returns a data URI, so nothing about it typechecks:
 * a wrong hex here is a card that quietly still paints the v1 warm palette behind v2
 * content, and a broken LCG is a card whose SSR output and hydration pass disagree. */
describe("meshStrip", () => {
  it("weaves only Terminal Glass channels", () => {
    /* Amber (#F9B45C / #C96A00) and the ambient orange thread (#E8A34F / #B86A14) are the
     * v1 values; the register has no warm channel other than yellow. */
    for (const dark of [true, false]) {
      for (const variant of ["ambient", "signal"] as const) {
        const strip = decodeURIComponent(meshStrip({ dark, variant }));
        for (const retired of ["F9B45C", "C96A00", "E8A34F", "B86A14", "6FA8DC"]) {
          expect(strip, `${variant}/${dark ? "dark" : "light"}`).not.toContain(retired);
        }
      }
    }
  });

  it("puts the detail yellow in the signal weave and the CTA fuchsia in the ambient mix", () => {
    expect(decodeURIComponent(meshStrip({ dark: true, variant: "signal" }))).toContain("FFE03A");
    expect(decodeURIComponent(meshStrip({ dark: false, variant: "signal" }))).toContain("C9A000");
    expect(decodeURIComponent(meshStrip({ dark: true, variant: "ambient" }))).toContain("D95FB0");
    expect(decodeURIComponent(meshStrip({ dark: false, variant: "ambient" }))).toContain("B80F7A");
  });

  it("stays pure, so a server render and its hydration agree byte for byte", () => {
    expect(meshStrip({ seed: 7 })).toBe(meshStrip({ seed: 7 }));
    expect(meshStrip({ seed: 7 })).not.toBe(meshStrip({ seed: 8 }));
  });
});
