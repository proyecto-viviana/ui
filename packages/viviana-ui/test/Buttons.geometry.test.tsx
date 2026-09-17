import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { ActionButton, Button } from "../src/button";
import { Divider } from "../src/divider";
import { NotificationBadge } from "../src/notificationbadge";

/* The macro bakes every declaration into an opaque atom, so the only honest way to
 * read the paint back is to resolve the rendered class list against the stylesheet
 * this build emitted. Same harness as ProgressCircle.motion.test.tsx. */
const sheetPath = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!sheetPath) throw new Error("build viviana-ui before running this test");
const sheet = readFileSync(sheetPath, "utf8");

/** Unconditional declarations: `.atom{...}` only. */
function declarationsFor(element: Element): string {
  return element.className
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (atom) =>
        new RegExp(`\\.${atom.replace(/[-.]/g, "\\$&")}\\{([^}]*)\\}`).exec(sheet)?.[1] ?? "",
    )
    .join(";");
}

/** Every rule an element's atoms appear in, conditional selectors included — the only
 * way to see a `:has()` branch, which no jsdom render can trigger. */
function rulesFor(element: Element): string {
  return element.className
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((atom) => [
      ...sheet.matchAll(new RegExp(`\\.${atom.replace(/[-.]/g, "\\$&")}([^{]*)\\{([^}]*)\\}`, "g")),
    ])
    .map((match) => `${match[1]}{${match[2]}}`)
    .join("\n");
}

function buttonEl(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>("button");
  if (!el) throw new Error("no button rendered");
  return el;
}

/* Terminal Glass draws ONE button geometry — 5px corner, mono 13px, 7px/14px — and the
 * failure this guards is the one that already shipped once: a variant map that quietly
 * keeps Spectrum's 14px UI face and 12px derived padding, so a Viviana button beside a
 * handoff mock is a different object at a glance. Asserted on two variants because the
 * geometry is variant-independent by construction; if a variant ever grows its own
 * padding branch, one of these fails. */
describe("Button geometry (Terminal Glass)", () => {
  it("draws every variant at the register's mono 13px on a 5px corner with 14px flanks", () => {
    for (const variant of ["primary", "create", "terminal"] as const) {
      const view = render(() => <Button variant={variant}>Run</Button>);
      const css = declarationsFor(buttonEl(view.container));
      expect(css, variant).toMatch(/font-size:13px/);
      expect(css, variant).toMatch(/padding-inline-start:14px/);
      expect(css, variant).toMatch(/padding-inline-end:14px/);
      expect(css, variant).toMatch(/border-start-start-radius:5px/);
      /* The register's rim is on EVERY fillStyle, filled included. */
      expect(css, variant).toMatch(/box-shadow:/);
      /* Mono, not the UI face: `control()` owns the family and must not be overridden
       * by the font-size re-value above. */
      expect(css, variant).toMatch(/font-family:var\(--s2-font-family-code/);
      view.unmount();
    }
  });

  it("keeps the icon-only button unpadded after the flank re-value", () => {
    /* `paddingX` REPLACES control()'s map wholesale, so restating the 14px without
     * restating the icon-only branch would put 14px flanks on a square icon button and
     * turn it into a lozenge. jsdom cannot match `:has()`, so this reads the rule. */
    const view = render(() => <Button>Run</Button>);
    const rules = rulesFor(buttonEl(view.container));
    expect(rules).toMatch(/:has\(\[slot=icon\][^{]*\{padding-inline-start:0\}/);
    expect(rules).toMatch(/:has\(\[slot=icon\][^{]*\{padding-inline-end:0\}/);
    view.unmount();
  });
});

/* RUN is the register's console affordance: matte well, well rim, blue ink, tracked
 * out. The failure mode is it collapsing onto `create` (the CTA fuchsia) or onto
 * `primary` — three different jobs that must not share paint. */
describe("Button variant=terminal", () => {
  it("paints the well, not a CTA fill, and tracks its label out", () => {
    const terminal = render(() => <Button variant="terminal">RUN</Button>);
    const create = render(() => <Button variant="create">Create</Button>);

    const css = declarationsFor(buttonEl(terminal.container));
    /* Fills reach the element through a custom property, so the value is read there. */
    expect(css).toMatch(/--\w+:var\(--surface-well\)/);
    expect(css).toMatch(/border-color:var\(--well-border/);
    expect(css).toMatch(/letter-spacing:\.?0?\.06em/);

    /* Never the ask colour: fuchsia is reserved for `create`. */
    const createFill = /--\w+:(light-dark\([^)]*\))/.exec(
      declarationsFor(buttonEl(create.container)),
    )?.[1];
    expect(createFill).toBeTruthy();
    expect(css).not.toContain(createFill!);

    terminal.unmount();
    create.unmount();
  });

  it("inks the label dark enough to read on the light well", () => {
    /* The handoff's own `--terminal-prompt` (--blue-400, #3d9be8) is ~2.4:1 on the light
     * well and fails AA outright; the ramp's end stop is the same colour in dark and a
     * readable one in light. A revert to the prompt token would pass a screenshot and
     * fail a human. */
    const view = render(() => <Button variant="terminal">RUN</Button>);
    const css = declarationsFor(buttonEl(view.container));
    /* blue-1100, the ramp's end stop: identical to `--terminal-prompt` in dark
     * (#99d8ff) and readable in light, where the prompt token (#3d9be8) is not. */
    expect(css).toMatch(/color:light-dark\(#094aa2,#99d8ff\)/);
    expect(css).not.toMatch(/color:light-dark\(#3d9be8/);
    view.unmount();
  });
});

/* The outlined CTA is the register's second create affordance, and the trap is that
 * `fillStyle` OWNS the colour result once it matches: an outline create with no leaf of
 * its own resolves to nothing and renders as a black-rimmed ghost. */
describe("Button variant=create fillStyle=outline", () => {
  it("drops the fill but keeps the create rim and ink", () => {
    const view = render(() => (
      <Button variant="create" fillStyle="outline">
        Create
      </Button>
    ));
    const css = declarationsFor(buttonEl(view.container));
    const filled = render(() => <Button variant="create">Create</Button>);
    const filledCss = declarationsFor(buttonEl(filled.container));
    const createFill = /--\w+:(light-dark\([^)]*\))/.exec(filledCss)?.[1];
    expect(createFill).toBeTruthy();

    expect(css).toMatch(/--\w+:transparent/);
    expect(css).not.toMatch(new RegExp(`--\\w+:${createFill!.replace(/[()#]/g, "\\$&")}`));
    /* The rim survives the fill being dropped — this is the branch that renders as a
     * black-rimmed ghost when the outline sub-map has no create leaf. */
    expect(css).toMatch(new RegExp(`border-color:${createFill!.replace(/[()#]/g, "\\$&")}`));
    filled.unmount();
    view.unmount();
  });
});

/* The icon rail is round; a labelled ActionButton is not. Both halves matter: a circle
 * that leaks onto labelled buttons restyles every toolbar in the library. */
describe("ActionButton icon-only circle", () => {
  it("rounds and squares the icon-only button, and only that one", () => {
    const view = render(() => <ActionButton aria-label="Notifications" />);
    const el = buttonEl(view.container);
    const rules = rulesFor(el);
    /* `pill` is height/2, so the circle only exists if the box is square too. */
    expect(rules).toMatch(/:has\(\[slot=icon\][^{]*\{border-(start-start|top-left)-radius:calc\(/);
    expect(rules).toMatch(/:has\(\[slot=icon\][^{]*\{min-width:/);
    /* A labelled ActionButton keeps the 5px control corner. */
    expect(declarationsFor(el)).toMatch(/border-(start-start|top-left)-radius:5px/);
    view.unmount();
  });
});

/* The count badge is the one non-`create` surface that keeps the ask colour, and it is
 * set in the pixel face. Regressing it to Spectrum's accent blue + UI face makes it
 * indistinguishable from an informative chip. */
describe("NotificationBadge stamp", () => {
  it("stamps the count in the pixel face on the ask fill", () => {
    const view = render(() => <NotificationBadge value={3} />);
    const el = view.container.querySelector<HTMLElement>("span");
    if (!el) throw new Error("no badge rendered");
    const css = declarationsFor(el);
    expect(css).toMatch(/font-family:var\(--s2-font-family-display/);
    expect(css).toMatch(/font-weight:700/);
    expect(css).toMatch(/font-size:10px/);
    /* The badge fill IS the create fill, asserted against the Button that owns it
     * rather than against a hex, so re-valuing the ask colour moves both together or
     * fails here. */
    const createButton = render(() => <Button variant="create">Create</Button>);
    const createCss = declarationsFor(buttonEl(createButton.container));
    const createFill = /--\w+:(light-dark\([^)]*\))/.exec(createCss)?.[1];
    /* Anchored: `outline-color` also matches a bare /color:/ probe. */
    const createInk = /(?:^|;)color:(light-dark\([^)]*\))/.exec(createCss)?.[1];
    expect(createFill).toBeTruthy();
    expect(createInk).toBeTruthy();
    expect(css).toContain(createFill!);
    expect(css).toContain(`color:${createInk}`);
    /* The rim is not forced-colors-only any more, and it must not grow the box. */
    expect(css).toMatch(new RegExp(`border-color:${createFill!.replace(/[()#]/g, "\\$&")}`));
    expect(css).toMatch(/box-sizing:border-box/);
    expect(css).toMatch(/--\w+:17px/);
    expect(css).toMatch(/min-width:17px/);
    createButton.unmount();
    view.unmount();
  });
});

/* One rule weight in this register, and it is a hairline. */
describe("Divider hairline", () => {
  it("draws the default rule 1px in the register's edge token", () => {
    const view = render(() => <Divider />);
    const el = view.container.querySelector<HTMLElement>("hr,[role=separator]");
    if (!el) throw new Error("no divider rendered");
    const css = declarationsFor(el);
    expect(css).toMatch(/height:1px/);
    expect(css).toMatch(/background-color:var\(--border-default\)/);
    view.unmount();
  });
});
