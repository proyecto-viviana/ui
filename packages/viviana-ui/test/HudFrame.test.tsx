/** @vitest-environment jsdom */
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { HudFrame } from "../src/hudframe";
import { declarationsFor, reducedMotionDeclarationsFor } from "./pixel-css";

function frameOf(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

/** The decoration layers, in DOM order, excluding the framed content. */
function overlays(container: HTMLElement): HTMLElement[] {
  return [...frameOf(container).children].filter((el) =>
    el.hasAttribute("aria-hidden"),
  ) as HTMLElement[];
}

describe("HudFrame", () => {
  it("keeps the framed content's semantics and leaves it clickable", () => {
    const { container, getByRole } = render(() => (
      <HudFrame scanlines sweep>
        <button type="button">Play</button>
      </HudFrame>
    ));

    /* The wrapper must not claim a role of its own — a frame around a control is
     * chrome, and an img/group here would relabel the control's context. */
    expect(frameOf(container).tagName).toBe("DIV");
    expect(frameOf(container)).not.toHaveAttribute("role");
    expect(getByRole("button", { name: "Play" })).toBeTruthy();

    /* Every overlay sits above the content, so if any of them took pointer events
     * the button underneath would stop being pressable. */
    const layers = overlays(container);
    expect(layers).toHaveLength(3); // scanlines, sweep, brackets
    for (const layer of layers) {
      expect(layer).toHaveAttribute("aria-hidden", "true");
      expect(declarationsFor(layer)).toContain("pointer-events:none");
    }
  });

  it("draws only the layers that were asked for", () => {
    const bare = render(() => <HudFrame>content</HudFrame>);
    /* Brackets are the frame; scanlines and the sweep are opt-in. */
    expect(overlays(bare.container)).toHaveLength(1);

    const lined = render(() => <HudFrame scanlines>content</HudFrame>);
    expect(overlays(lined.container)).toHaveLength(2);
  });

  it("scales the bracket arms with `brackets` and leaves the stroke alone", () => {
    const arms = (size: "S" | "M" | "L") => {
      const { container } = render(() => <HudFrame brackets={size}>x</HudFrame>);
      const bracket = overlays(container).at(-1)!;
      return /background-size:([^;]*)/.exec(declarationsFor(bracket))?.[1] ?? "";
    };

    /* S is the token default so a themed HUD can retune it; M and L are fixed. */
    expect(arms("S")).toContain("var(--hud-bracket,14px)");
    expect(arms("M")).toContain("22px");
    expect(arms("L")).toContain("26px");
    /* The stroke is the same hairline at every arm length — a longer arm must not
     * read as a thicker one. */
    for (const size of ["S", "M", "L"] as const) {
      expect(arms(size)).toContain("var(--hud-stroke,2px)");
    }
    /* Eight marks: two arms per corner. */
    expect(arms("M").match(/var\(--hud-stroke/g)).toHaveLength(8);
  });

  it("recolours brackets and sweep together per channel, never with the CTA fuchsia", () => {
    const inkOf = (channel?: "info" | "live") => {
      const { container } = render(() => (
        <HudFrame channel={channel} sweep>
          x
        </HudFrame>
      ));
      const layers = overlays(container);
      return layers.map((layer) => declarationsFor(layer)).join(";");
    };

    expect(inkOf()).toContain("--pv-hud-ink:var(--status-info)");
    const live = inkOf("live");
    expect(live).toContain("--pv-hud-ink:var(--status-fault)");
    /* The recording channel is the register's REC red. `--accent-live` is the CTA
     * fuchsia, rationed to one filled ask per view — a frame is never that ask. */
    expect(live).not.toContain("--accent-live");
  });

  it("stops the sweep under reduced motion instead of hiding it with JS", () => {
    const { container } = render(() => <HudFrame sweep>x</HudFrame>);
    const sweep = overlays(container)[0]!;

    expect(declarationsFor(sweep)).toContain("animation-name:");
    expect(declarationsFor(sweep)).toContain("animation-iteration-count:infinite");
    /* Gated in CSS, not matchMedia: hydration trusts the server DOM, so a runtime
     * check would paint one frame of motion before it could take effect. */
    expect(reducedMotionDeclarationsFor(sweep)).toContain("animation-name:none");
  });
});
