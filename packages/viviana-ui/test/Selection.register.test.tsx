/** @vitest-environment jsdom */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { render } from "@solidjs/testing-library";
import { Checkbox } from "../src/checkbox";
import { Radio, RadioGroup } from "../src/radio";
import { ToggleSwitch } from "../src/switch/ToggleSwitch";
import { SegmentedControl, SegmentedControlItem } from "../src/segmentedcontrol";
import { SelectBox, SelectBoxGroup } from "../src/selectboxgroup";

const sheetPath = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!sheetPath) throw new Error("build viviana-ui before running this test");
const sheet = readFileSync(sheetPath, "utf8");

/* The style() macro hashes each declaration into its own atom class, so the only way to
 * read a component's paint back is to take the classes it actually put on the element and
 * look their rules up in the BUILT sheet. Asserting against the source object instead
 * would pass on a condition branch that never reaches the DOM. Mirrors the harness in
 * Fields.register.test.tsx. */
function escapeAtom(atom: string): string {
  return atom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Only the unconditional `.atom{…}` rules — no media, no state selector. */
function declarationsOf(element: Element): string {
  return [...element.classList]
    .map((atom) => new RegExp(`\\.${escapeAtom(atom)}\\{([^}]*)\\}`).exec(sheet)?.[1] ?? "")
    .join(";");
}

/** The `@media` query an atom's rule is nested inside, or "" when it is top-level. */
function mediaContextOf(atom: string): string {
  const index = sheet.indexOf(`.${atom}{`);
  if (index < 0) return "";
  const opened = sheet.lastIndexOf("@media", index);
  if (opened < 0) return "";
  /* The atom belongs to that block only if no intervening `}` closed it — the sheet
   * emits media blocks as one flat run of atoms. */
  return sheet.slice(opened, index).includes("}@")
    ? ""
    : sheet.slice(opened, sheet.indexOf("{", opened));
}

/** The presentational box/track/handle divs carry no role, so they are addressed structurally. */
function firstDiv(container: HTMLElement, selector: string): HTMLElement {
  return container.querySelector<HTMLElement>(selector)!;
}

describe("Checkbox — the register's pixel choice box", () => {
  it("draws size S square and 2px, not as a rounded Spectrum control", () => {
    /* Regression: the box spread controlBorderRadius("sm"), which rounds EVERY size to
     * 5px, over a flat borderWidth: 1. Under that the quiz checkbox came out as a small
     * pill-cornered hairline box — the one shape this register is drawn against. */
    const { container } = render(() => <Checkbox size="S" aria-label="Right" />);
    const declarations = declarationsOf(firstDiv(container, "label > div"));

    expect(declarations).toContain("border-start-start-radius:0");
    expect(declarations).toContain("border-end-end-radius:0");
    expect(declarations).toContain("border-top-width:2px");
    expect(declarations).toContain("width:calc(.875rem * var(--s2-scale))");
  });

  it("leaves the form sizes on Spectrum's rounded 1px box", () => {
    /* The pixel geometry is an S-only branch. Widening it to M would re-skin every form
     * in the library off one register row. */
    const { container } = render(() => <Checkbox size="M" aria-label="Consent" />);
    const declarations = declarationsOf(firstDiv(container, "label > div"));

    expect(declarations).toContain("border-top-width:1px");
    expect(declarations).toContain("border-start-start-radius:5px");
  });

  it("stamps the mark in the deep well rather than in paper white", () => {
    /* gray-25 is #ffffff in light, so the checkmark read as a hole punched through the
     * accent fill instead of ink stamped into it. */
    const { container } = render(() => <Checkbox defaultSelected aria-label="Right" />);
    const svg = container.querySelector("svg")!;

    expect(declarationsOf(svg)).toContain("--surface-well-deep");
  });
});

describe("Radio — the register's pixel poll radio", () => {
  it("draws size S as a 12px square that floods when selected", () => {
    /* Two coupled regressions guarded here: S inheriting controlSize("sm")'s 14px circle,
     * and the swelling `borderWidth` that punches M/L/XL's 4px centre dot — at S the
     * handoff has no dot at all, the square fills edge to edge, so the border must hold
     * at 2px in the selected state too. */
    const { container } = render(() => (
      <RadioGroup size="S" aria-label="Poll" value="yes">
        <Radio value="yes">Ship it</Radio>
      </RadioGroup>
    ));
    const declarations = declarationsOf(firstDiv(container, "label > div > div"));

    expect(declarations).toContain("width:calc(.75rem * var(--s2-scale))");
    expect(declarations).toContain("border-start-start-radius:0");
    expect(declarations).toContain("border-top-width:2px");
    expect(declarations).not.toMatch(/border-top-width:calc\(/);
  });

  it("keeps the circle sizes on the swelling-border dot", () => {
    const { container } = render(() => (
      <RadioGroup aria-label="Poll" value="yes">
        <Radio value="yes">Ship it</Radio>
      </RadioGroup>
    ));
    const declarations = declarationsOf(firstDiv(container, "label > div > div"));

    expect(declarations).toContain("border-start-start-radius:9999px");
    expect(declarations).toMatch(/border-top-width:calc\(/);
  });
});

describe("ToggleSwitch — the register's pixel toggle", () => {
  it("draws size S as a 34x18 square track with the knob inset 2px", () => {
    /* The track was font-relative at every size, so it drifted out of the column its
     * neighbouring 14px checkbox and 12px radio stand in the moment a row set a larger
     * font — and it kept the pill corner. The padding is what positions the knob; without
     * it the 16px travel is wrong in both directions. */
    const declarations = declarationsOf(
      firstDiv(
        render(() => <ToggleSwitch size="S" aria-label="Autosave" />).container,
        "label > div > div",
      ),
    );

    expect(declarations).toContain("--trackWidth:calc(2.125rem * var(--s2-scale))");
    expect(declarations).toContain("--trackHeight:calc(1.125rem * var(--s2-scale))");
    expect(declarations).toContain("border-start-start-radius:0");
    expect(declarations).toContain("padding-inline-start:2px");
  });

  it("snaps the knob in three steps and lands instantly under reduced motion", () => {
    /* The register's rule is that everything steps (`motionTiming.toggleKnob` = 0.12s
     * steps(3)); the risk is the `transition: "default"` shorthand, which emits its own
     * 150ms cubic-bezier and silently wins whenever it is declared last.
     * The reduced-motion gate must be a CSS media condition, never a runtime matchMedia:
     * Solid hydration trusts the server DOM, so a JS branch never gets applied. And the
     * duration collapses to 0 rather than the transition being dropped, because the
     * knob's END position is the state readout — it has to arrive. */
    const { container } = render(() => <ToggleSwitch size="S" aria-label="Autosave" />);
    const handle = firstDiv(container, "label > div > div > div");
    const declarations = declarationsOf(handle);

    expect(declarations).toContain("transition-timing-function:steps(3,end)");
    expect(declarations).toContain("transition-duration:.12s");
    expect(declarations).not.toContain("cubic-bezier");

    const instant = [...handle.classList].find((atom) =>
      new RegExp(`\\.${escapeAtom(atom)}\\{transition-duration:0s\\}`).test(sheet),
    );
    expect(instant).toBeDefined();
    expect(mediaContextOf(instant!)).toContain("prefers-reduced-motion:reduce");
  });

  it("does not shrink the pixel knob on the perspective trick", () => {
    /* M/L/XL emulate Spectrum's grow-on-select with a 3d perspective scale. Left in place
     * at S it shrinks the 12px square to ~10.7px at rest and snaps it back on selection —
     * exactly the soft motion the register replaces. */
    const { container } = render(() => <ToggleSwitch size="S" aria-label="Autosave" />);
    const handle = firstDiv(container, "label > div > div > div");

    expect(handle.style.transform).toBe("none");
    expect(declarationsOf(handle)).toContain("height:calc(.75rem * var(--s2-scale))");
  });

  it("keeps the perspective placement on the Spectrum sizes", () => {
    const { container } = render(() => <ToggleSwitch aria-label="Autosave" defaultSelected />);
    const handle = firstDiv(container, "label > div > div > div");

    expect(handle.style.transform).toContain("perspective");
  });
});

describe("SegmentedControl — the bracketed selection", () => {
  it("brackets the selected segment without renaming it", () => {
    /* The brackets are the ONLY selection signal left now that the plate is gone, and they
     * must be generated content: folding them into the label would make a screen reader
     * announce "[week]", punctuation and all. */
    const { getByRole } = render(() => (
      <SegmentedControl aria-label="Range" defaultSelectedKey="week">
        <SegmentedControlItem id="day">day</SegmentedControlItem>
        <SegmentedControlItem id="week">week</SegmentedControlItem>
      </SegmentedControl>
    ));

    const selected = getByRole("radio", { name: "week" });
    expect(selected).toHaveAttribute("aria-checked", "true");
    expect(selected.textContent).toBe("week");

    const bracketRuleFor = (segment: Element): string =>
      [...segment.querySelector("span")!.classList]
        .map(
          (atom) =>
            new RegExp(`\\.${escapeAtom(atom)}\\{(&:before[^@]*?)\\}\\.`).exec(sheet)?.[1] ?? "",
        )
        .join("");

    expect(bracketRuleFor(selected)).toContain('content:"["');
    expect(bracketRuleFor(selected)).toContain('content:"]"');
    expect(bracketRuleFor(getByRole("radio", { name: "day" }))).toBe("");
  });

  it("sets the segment as a bare stamp, not as a padded button", () => {
    /* With no plate to hold the label off its own edge, the button band's inline padding
     * only widened the gap unevenly; and the register's segment is 700, not the button's
     * normal weight. */
    const { getByRole } = render(() => (
      <SegmentedControl aria-label="Range" defaultSelectedKey="week">
        <SegmentedControlItem id="week">week</SegmentedControlItem>
      </SegmentedControl>
    ));
    const declarations = declarationsOf(getByRole("radio", { name: "week" }));

    expect(declarations).toContain("padding-inline-start:0");
    expect(declarations).toContain("padding-top:6px");
    expect(declarations).toContain("font-weight:700");
  });
});

describe("SelectBox — the card rung of the surface ladder", () => {
  it("sits on the card radius, blur and rim rather than a hand-assembled surface", () => {
    /* It had assembled the surface by hand and disagreed with the ladder in the three
     * ways a hand-assembled surface does: the panel's 14px radius on a tile nested inside
     * a panel, the opaque CONTROL rim (`edge-glass`) outlining it like a button on dark,
     * and no backdrop blur at all — the one thing that makes a glass surface glass. */
    const { container } = render(() => (
      <SelectBoxGroup
        aria-label="Plans"
        items={[{ id: "starter", label: "Starter" }]}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
      >
        {(item) => (
          <SelectBox id={item.id} textValue={item.label}>
            <span slot="label">{item.label}</span>
          </SelectBox>
        )}
      </SelectBoxGroup>
    ));
    const declarations = declarationsOf(container.querySelector('[role="option"]')!);

    expect(declarations).toContain("border-start-start-radius:12px");
    expect(declarations).toContain("backdrop-filter:var(--blur-card)");
    expect(declarations).toContain("--edge-glass-surface");
    expect(declarations).not.toContain("border-start-start-radius:14px");
  });
});
