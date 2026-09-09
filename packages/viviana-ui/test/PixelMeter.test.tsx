/** @vitest-environment jsdom */
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { PixelMeter } from "../src/meter";
import { declarationsFor, reducedMotionDeclarationsFor } from "./pixel-css";

function cells(meter: HTMLElement): HTMLElement[] {
  const field = meter.querySelector<HTMLElement>('[aria-hidden="true"]');
  if (!field) throw new Error("no cell container rendered");
  return [...field.children] as HTMLElement[];
}

type CellInk = "rest" | "low" | "mid" | "full" | "lead";

/* Read the drawn state back off the emitted paint, because that IS the thing a
 * reader of the meter sees: an unlit cell is the hairline, a lit one is the channel
 * ink (optionally mixed down), the leading edge is transparent with the dither. */
function inkOf(cell: HTMLElement): CellInk {
  const declarations = declarationsFor(cell);
  if (declarations.includes("repeating-conic-gradient")) return "lead";
  if (declarations.includes("var(--border-subtle)")) return "rest";
  if (declarations.includes("var(--pv-pixel-ink) 28%")) return "low";
  if (declarations.includes("var(--pv-pixel-ink) 62%")) return "mid";
  if (declarations.includes("background-color:var(--pv-pixel-ink)")) return "full";
  throw new Error(`unclassifiable cell paint: ${declarations}`);
}

describe("PixelMeter", () => {
  it("keeps the headless meter's value contract while the cells stay decoration", () => {
    render(() => <PixelMeter label="Streak" value={9} maxValue={14} />);

    const meter = screen.getByRole("meter", { name: "Streak" });
    expect(meter).toHaveAttribute("aria-valuenow", "9");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "14");
    /* 14 cells is 14 graphics; a reader must get one meter, not fourteen. */
    expect(meter.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryAllByRole("presentation")).toHaveLength(0);
  });

  it("names the ring from a label that is not buried in the hidden cell layer", () => {
    render(() => <PixelMeter shape="ring" label="Focus" value={10} maxValue={16} />);

    const meter = screen.getByRole("meter", { name: "Focus" });
    const label = screen.getByText("Focus");
    expect(meter).toHaveAttribute("aria-labelledby", label.id);
    /* The centred label is positioned over the ring, not parented into it: inside
     * the aria-hidden cell container its text would still paint but the meter's
     * name would come back empty. */
    expect(label.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("draws one cell per unit of the row, one leading edge, and hairline for the rest", () => {
    render(() => <PixelMeter label="Streak" value={9} maxValue={14} />);

    const drawn = cells(screen.getByRole("meter", { name: "Streak" })).map(inkOf);
    expect(drawn).toHaveLength(14);
    expect(drawn.filter((ink) => ink === "full")).toHaveLength(9);
    /* The dither marks the cell in flight, so it sits AT the boundary — one past
     * the last lit cell, never on top of it and never one short. */
    expect(drawn[9]).toBe("lead");
    expect(drawn.slice(10).every((ink) => ink === "rest")).toBe(true);
    /* With the default two levels there is no partial strength at all. */
    expect(drawn.some((ink) => ink === "low" || ink === "mid")).toBe(false);
  });

  it("fixes the ring at 16 blocks and the activity map at 26 × 7, whatever the range", () => {
    const ring = render(() => <PixelMeter shape="ring" aria-label="Ring" value={3} maxValue={5} />);
    const grid = render(() => <PixelMeter shape="grid" aria-label="Map" value={40} />);

    const ringCells = cells(ring.getByRole("meter"));
    const gridCells = cells(grid.getByRole("meter"));
    expect(ringCells).toHaveLength(16);
    expect(gridCells).toHaveLength(182);
    /* The ring's geometry is per-index and computed once, so the blocks must land
     * on distinct points — a shared origin collapses the ring into one dot. */
    const origins = new Set(ringCells.map((cell) => `${cell.style.left},${cell.style.top}`));
    expect(origins.size).toBe(16);

    ring.unmount();
    grid.unmount();
  });

  it("fades the trailing cells only as far as `levels` allows", () => {
    const four = render(() => (
      <PixelMeter shape="grid" aria-label="Map" value={100} maxValue={182} levels={4} />
    ));
    const three = render(() => (
      <PixelMeter shape="grid" aria-label="Map" value={100} maxValue={182} levels={3} />
    ));

    const fourInk = cells(four.getByRole("meter")).map(inkOf);
    const threeInk = cells(three.getByRole("meter")).map(inkOf);
    /* Depth back from the boundary picks the strength: dimmest last. */
    expect(fourInk.slice(97, 101)).toEqual(["full", "mid", "low", "lead"]);
    /* Three levels drops the dimmest stop entirely rather than rescaling it. */
    expect(threeInk.slice(97, 101)).toEqual(["full", "full", "mid", "lead"]);
    expect(threeInk.some((ink) => ink === "low")).toBe(false);

    four.unmount();
    three.unmount();
  });

  it("blinks the ring, in steps, and only the ring — and stops under reduced motion", () => {
    const ring = render(() => <PixelMeter shape="ring" aria-label="Ring" value={10} />);
    const row = render(() => <PixelMeter aria-label="Streak" value={9} maxValue={14} />);

    const block = cells(ring.getByRole("meter"))[3]!;
    expect(declarationsFor(block)).toMatch(/animation-duration:2\.6s/);
    expect(declarationsFor(block)).toMatch(/animation-timing-function:step-end/);
    /* The chase is staggered per block; one delay for all of them is a strobe. */
    expect(block.style.animationDelay).toBe("0.48s");
    /* The gate is the CSS media condition, not a runtime matchMedia read — Solid
     * hydration trusts the server DOM. */
    expect(reducedMotionDeclarationsFor(block)).toMatch(/animation-name:none/);

    /* A 14-cell row blinking in place would read as broken, not as live work. */
    expect(declarationsFor(cells(row.getByRole("meter"))[0]!)).not.toMatch(/animation-/);

    ring.unmount();
    row.unmount();
  });

  it("takes its ink from the reported channel", () => {
    const fault = render(() => (
      <PixelMeter aria-label="Errors" value={4} maxValue={14} channel="fault" />
    ));
    const metric = render(() => <PixelMeter aria-label="Load" value={4} maxValue={14} />);

    const faultField = fault.getByRole("meter").querySelector<HTMLElement>('[aria-hidden="true"]')!;
    const infoField = metric.getByRole("meter").querySelector<HTMLElement>('[aria-hidden="true"]')!;
    expect(declarationsFor(faultField)).toMatch(/--pv-pixel-ink:var\(--status-fault\)/);
    expect(declarationsFor(infoField)).toMatch(/--pv-pixel-ink:var\(--status-info\)/);

    fault.unmount();
    metric.unmount();
  });
});
