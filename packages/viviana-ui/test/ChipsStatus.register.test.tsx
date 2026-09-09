/** @vitest-environment jsdom */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Badge } from "../src/badge";
import { Meter } from "../src/meter";
import { ProgressBar } from "../src/progress-bar";
import { StatusLight } from "../src/statuslight";
import { TagGroup } from "../src/tag-group";
import { glasselatedRamps } from "../src/style/glasselated-ramps";

const sheetPath = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!sheetPath) throw new Error("build viviana-ui before running this test");
const sheet = readFileSync(sheetPath, "utf8");

/* The style() macro hashes each declaration into its own atom class, so the only way to
 * read a component's paint back is to take the classes it actually put on the element and
 * look their rules up in the built sheet. Asserting on the source string instead would
 * pass on a class that never reaches the DOM. */
function declarationsOf(element: Element): string {
  return [...element.classList]
    .map((atom) => {
      const escaped = atom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\.${escaped}\\{([^}]*)\\}`).exec(sheet)?.[1] ?? "";
    })
    .join(";");
}

describe("status channels", () => {
  /* The four channels are ONE vocabulary: a fault dot, a fault badge and a fault meter
     have to be the same red, because they report the same thing in the same view. The
     failure this pins is the easy one — reaching for the nearest ramp stop
     (`negative-900`, `notice-1100`) per component, which drifts them apart by a shade
     each and makes the status colour meaningless as a signal. */
  it.each([
    ["notice", "--status-signal"],
    ["negative", "--status-fault"],
    ["metric", "--status-metric"],
  ])("paints the %s StatusLight dot from the channel token", (variant, token) => {
    const { container, unmount } = render(() => (
      <StatusLight variant={variant as "notice"}>Signal</StatusLight>
    ));
    const dot = container.querySelector("svg")!;
    expect(declarationsOf(dot)).toContain(`var(${token})`);
    unmount();
  });

  it.each([
    ["notice", "--status-signal"],
    ["negative", "--status-fault"],
    ["metric", "--status-metric"],
  ])("paints the %s Meter fill from the same channel token", (variant, token) => {
    const { container, unmount } = render(() => (
      <Meter aria-label="Signal" value={40} variant={variant as "notice"} />
    ));
    const fill = container.querySelector("[role=meter] > div > div")!;
    expect(declarationsOf(fill)).toContain(`var(${token})`);
    unmount();
  });

  it("keeps positive on the library's own green rather than inventing a fifth channel", () => {
    /* There is no `--status-positive`: success is the semantic trio's green. A "fix" that
       adds one would fork the trio the Button and Toast already share. */
    const { container } = render(() => <Meter aria-label="Done" value={40} variant="positive" />);
    const fill = container.querySelector("[role=meter] > div > div")!;
    expect(declarationsOf(fill)).not.toContain("--status-");
  });
});

describe("Badge stamp", () => {
  it("gives the stamp its own vertical padding", () => {
    /* `control()` leaves paddingY unset for controls that get their height from a fixed
       min-height. A badge has none, so with no paddingY its height collapsed onto the
       line box and the pill sat tight around its own text. */
    render(() => <Badge>NEW</Badge>);
    const badge = screen.getByText("NEW").closest("[class]")!.parentElement!;
    const declarations = declarationsOf(badge);
    expect(declarations).toContain("9px");
    expect(declarations).toMatch(/padding(-block|-top)[^;]*:/);
  });

  it("marks the live badge with the register's pulse", () => {
    /* LIVE is the one badge allowed a fuchsia fill (DECISIONS B-3). It has to be
       distinguishable from a plain accent badge that merely happens to be pink, and the
       thing that distinguishes it is the pulse. */
    const { container } = render(() => <Badge variant="live">LIVE</Badge>);
    const badge = container.firstElementChild!;
    expect(declarationsOf(badge)).toContain("animation");
  });
});

describe("ProgressBar bracket form", () => {
  it("reads the same value as the bar, without adding a second announcement", () => {
    /* The bracket is a picture of the value drawn in text. If it reached the a11y tree the
       bar would announce "40%" twice, once as a role value and once as a glyph run that no
       screen reader can pronounce. */
    render(() => <ProgressBar aria-label="Chapter" value={40} trackStyle="bracket" />);
    const bar = screen.getByRole("progressbar", { name: "Chapter" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    const run = bar.querySelector('[aria-hidden="true"]')!;
    expect(run.textContent).toBe("[▮▮▮▮▯▯▯▯▯▯]");
  });

  it("draws every cell filled at the maximum and none at the minimum", () => {
    const { container, unmount } = render(() => (
      <ProgressBar aria-label="Full" value={100} trackStyle="bracket" />
    ));
    expect(container.textContent).toContain("[▮▮▮▮▮▮▮▮▮▮]");
    unmount();
    const empty = render(() => <ProgressBar aria-label="Empty" value={0} trackStyle="bracket" />);
    expect(empty.container.textContent).toContain("[▯▯▯▯▯▯▯▯▯▯]");
  });

  it("falls back to the sweeping bar when the value is unknown", () => {
    /* A fixed glyph run cannot express "indeterminate": ten empty cells would read as 0%,
       which is a value the component does not have. */
    render(() => <ProgressBar aria-label="Loading" isIndeterminate trackStyle="bracket" />);
    const bar = screen.getByRole("progressbar", { name: "Loading" });
    expect(bar.textContent).not.toContain("▯");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });
});

describe("ProgressBar segments", () => {
  it("cuts the track into sections proportional to their weights", () => {
    render(() => <ProgressBar aria-label="Run" value={0} segments={[3, 1]} />);
    const track = screen.getByRole("progressbar", { name: "Run" }).lastElementChild!;
    const widths = [...track.children]
      .filter((child) => !child.hasAttribute("aria-hidden"))
      .map((child) => (child as HTMLElement).style.width);
    expect(widths).toEqual(["75%", "25%"]);
  });

  it("flows one fill across the section boundary instead of filling each section", () => {
    /* The naive implementation gives every section the whole percentage, so 50% draws two
       half-full chapters instead of one finished chapter and one untouched one. */
    render(() => <ProgressBar aria-label="Run" value={50} segments={[1, 1]} />);
    const track = screen.getByRole("progressbar", { name: "Run" }).lastElementChild!;
    const fills = [...track.children]
      .filter((child) => !child.hasAttribute("aria-hidden"))
      .map((child) => (child.firstElementChild as HTMLElement).style.width);
    expect(fills).toEqual(["100%", "0%"]);
  });

  it("keeps the pending dither in the section it actually reaches", () => {
    render(() => <ProgressBar aria-label="Run" value={50} pendingValue={75} segments={[1, 1]} />);
    const track = screen.getByRole("progressbar", { name: "Run" }).lastElementChild!;
    const sections = [...track.children].filter((child) => !child.hasAttribute("aria-hidden"));
    expect(sections[0].querySelectorAll('[aria-hidden="true"]').length).toBe(0);
    expect((sections[1].lastElementChild as HTMLElement).style.width).toBe("50%");
  });

  it("ignores a division that cannot divide anything", () => {
    /* One weight, or weights that are all zero, is not a chapter bar — it is a plain bar
       with an extra wrapper. Silently drawing that wrapper changes the DOM contract for
       callers who pass a computed array that happened to come back short. */
    render(() => <ProgressBar aria-label="Run" value={40} segments={[1]} />);
    const track = screen.getByRole("progressbar", { name: "Run" }).lastElementChild!;
    const fill = track.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("40%");
  });
});

describe("Tag chip ink", () => {
  it("draws a resting chip in the well's quiet ink, not a grey ramp step", () => {
    /* The chip IS a well the size of a word — same fill, same border, same dither. Its
       label coming off the neutral ramp is what made a row of chips read as grey buttons
       sitting on the terminal instead of as part of it. */
    render(() => (
      <TagGroup aria-label="Topics" items={[{ id: "solid", name: "Solid" }]}>
        {(item: { id: string; name: string }) => item.name}
      </TagGroup>
    ));
    const tag = screen.getByRole("row");
    expect(declarationsOf(tag)).toContain("var(--terminal-dim)");
  });

  it("lifts the ink on hover instead of exchanging the chip's plate", () => {
    /* The register lights a resting well from its edge and its ink. Swapping the FILL on
       hover (the previous `surface-hover` step) reads as a different chip appearing under
       the cursor, and the handoff's own `brightness(1.1)` would drag the label down to
       4.47:1 on the light column — under the 4.5:1 floor. */
    render(() => (
      <TagGroup aria-label="Topics" items={[{ id: "css", name: "CSS" }]}>
        {(item: { id: string; name: string }) => item.name}
      </TagGroup>
    ));
    const tag = screen.getByRole("row");
    fireEvent.pointerEnter(tag, { pointerType: "mouse" });
    fireEvent.mouseEnter(tag);
    const declarations = declarationsOf(screen.getByRole("row"));
    expect(declarations).not.toContain("var(--surface-hover)");
    expect(declarations).toContain("var(--terminal-");
  });
});

/* A bold badge is the only place in this batch where ink sits on a saturated fill, and
   both pairs it draws were measurable AA failures on /showcase/chips: black on the light
   metric cyan (4.30:1) and white on the dark neutral gray (4.17:1). The paint is a PAIR,
   so this reads both halves out of the same sources the component reads — the ramp for
   the fill, the badge source for the ink — and measures them. A per-component ink literal
   and a per-component fill literal each look fine in isolation, which is exactly how
   those two shipped. */
function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const channel = (value: number) => {
    const x = value / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

function ratio(ink: string, fill: string): number {
  const [hi, lo] = [luminance(ink), luminance(fill)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

function rampStop(name: string, scheme: "light" | "dark"): string {
  const token = glasselatedRamps[name];
  if (!token || token.type !== "color") throw new Error(`missing ramp ${name}`);
  return scheme === "light" ? token.light : token.dark;
}

/* `--status-metric` is a CSS variable, not a ramp stop, so its two values come out of the
   token file per scheme — the same file the browser reads. */
const tokensCss = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "../src/viviana-tokens.css"),
  "utf8",
);

function schemeBlock(scheme: "light" | "dark"): string {
  const source =
    scheme === "light"
      ? /\[data-color-scheme="light"\]\s*\{([\s\S]*?)\n\}/.exec(tokensCss)?.[1]
      : /:root,\s*\[data-color-scheme="dark"\]\s*\{([\s\S]*?)\n\}/.exec(tokensCss)?.[1];
  if (!source) throw new Error(`${scheme} scheme block missing from viviana-tokens.css`);
  return source;
}

/* A semantic alias is declared once, in the root (dark) block; only the palette stop it
   points at is re-declared per scheme. So resolution reads the requested scheme first and
   falls back to root for the alias itself — exactly the cascade the browser performs. */
function cssToken(name: string, scheme: "light" | "dark"): string {
  const read = (block: string) => new RegExp(`${name}:\\s*([^;]+);`).exec(block)?.[1]?.trim();
  const value = read(schemeBlock(scheme)) ?? read(schemeBlock("dark"));
  if (!value) throw new Error(`${name} missing from the ${scheme} scheme block`);
  return value.startsWith("#") ? value : cssToken(value.replace(/^var\(|\)$/g, ""), scheme);
}

const badgeSource = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "../src/badge/index.tsx"),
  "utf8",
);

const INK = { white: "#ffffff", black: "#000000" } as const;

describe("bold badge ink clears AA on its own fill", () => {
  it("inks the metric badge per scheme, because one ink cannot serve both", () => {
    expect(badgeSource).toContain('metric: lightDark("white", "black")');
    const light = cssToken("--status-metric", "light");
    const dark = cssToken("--status-metric", "dark");
    expect(ratio(INK.white, light), "white on light metric").toBeGreaterThanOrEqual(4.5);
    expect(ratio(INK.black, dark), "black on dark metric").toBeGreaterThanOrEqual(4.5);
    /* The collapse this forbids: a single ink for both columns. */
    expect(ratio(INK.black, light), "black on light metric").toBeLessThan(4.5);
    expect(ratio(INK.white, dark), "white on dark metric").toBeLessThan(4.5);
  });

  it("sinks the subtle accent ink a stop, because its plate is the same hue", () => {
    /* The failure this pins: reusing the panel-grade link blue as ink on a plate tinted
       with that same blue. It measures 4.14:1 on the light column — the pair that made
       /showcase/chips red — and nothing about either literal looks wrong alone. */
    expect(badgeSource).toContain('accent: "blue-1000"');
    expect(badgeSource).toContain('informative: "blue-1000"');
    expect(ratio(rampStop("blue-1000", "light"), "#dae9fb")).toBeGreaterThanOrEqual(4.5);
    expect(ratio(rampStop("blue-1000", "dark"), "#020e1b")).toBeGreaterThanOrEqual(4.5);
    expect(ratio(cssToken("--text-link", "light"), "#dae9fb")).toBeLessThan(4.5);
  });

  it("keeps white legible on the neutral badge fill in both schemes", () => {
    expect(badgeSource).toContain('neutral: lightDark("gray-600", "gray-200")');
    expect(ratio(INK.white, rampStop("gray-600", "light"))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(INK.white, rampStop("gray-200", "dark"))).toBeGreaterThanOrEqual(4.5);
  });
});
