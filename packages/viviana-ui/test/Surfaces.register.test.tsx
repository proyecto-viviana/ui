/** @vitest-environment jsdom */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { render } from "@solidjs/testing-library";
import { Avatar, AvatarGroup } from "../src/avatar";
import { AssetCard, Card, CardPreview } from "../src/card";
import { Image } from "../src/image";
import { Well } from "../src/well";

const sheetPath = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!sheetPath) throw new Error("build viviana-ui before running this test");
const sheet = readFileSync(sheetPath, "utf8");

/* The style() macro hashes every declaration into its own atom class, so a component's
 * paint can only be read back by taking the classes it actually put on the element and
 * looking their rules up in the built sheet. Asserting on the source string instead
 * would pass on an atom that never reaches the DOM. */
function declarationsOf(element: Element): string {
  return [...element.classList]
    .map((atom) => {
      const escaped = atom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\.${escaped}\\{([^}]*)\\}`).exec(sheet)?.[1] ?? "";
    })
    .join(";");
}

function readSource(relative: string): string {
  for (const base of ["packages/viviana-ui", "."]) {
    const candidate = resolve(process.cwd(), base, relative);
    if (existsSync(candidate)) return readFileSync(candidate, "utf8");
  }
  throw new Error(`cannot locate ${relative} from ${process.cwd()}`);
}

describe("Well tone and size", () => {
  it("sits the deep well on the deep surface, not on the standard plate", () => {
    /* `tone` is a style() condition, not a data attribute: forget to thread it through
       the call and the deep well silently renders as an ordinary well — same colour,
       no error, and the nav container stops reading as a container. */
    const standard = render(() => <Well>log</Well>);
    const deep = render(() => <Well tone="deep">nav</Well>);
    expect(declarationsOf(standard.container.firstElementChild!)).toContain("var(--surface-well)");
    const deepPaint = declarationsOf(deep.container.firstElementChild!);
    expect(deepPaint).toContain("var(--surface-well-tutor)");
    expect(deepPaint).not.toMatch(/background-color:var\(--surface-well\)/);
  });

  it("keeps the scan dither on both tones", () => {
    /* The dither is what separates a well from a plain rectangle. A `tone` branch that
       re-declared the background instead of only its colour would drop wellScan()'s
       layer on the deep well and leave a flat plate. */
    for (const el of [
      render(() => <Well>a</Well>).container.firstElementChild!,
      render(() => <Well tone="deep">b</Well>).container.firstElementChild!,
    ]) {
      expect(declarationsOf(el)).toContain("--well-scan");
    }
  });

  it("drops to the 8px container inset at size S", () => {
    /* The nav well holds rows that pad themselves; at the reading well's 16px the
       plate double-pads them and the rows stop reaching its edge. */
    expect(
      declarationsOf(render(() => <Well size="S">a</Well>).container.firstElementChild!),
    ).toContain("padding-top:8px");
    expect(declarationsOf(render(() => <Well>a</Well>).container.firstElementChild!)).toContain(
      "padding-top:16px",
    );
  });
});

describe("Image isPixelated", () => {
  it("resamples with nearest neighbour only when asked", () => {
    /* Two failure modes in one assertion: an opt-in wired to the wrong prop is a
       no-op, and one applied unconditionally pixelates every photograph in the
       library. */
    const plain = render(() => <Image src="/a.png" alt="" />);
    const pixel = render(() => <Image src="/a.png" alt="" isPixelated />);
    expect(declarationsOf(pixel.container.querySelector("img")!)).toContain(
      "image-rendering:pixelated",
    );
    expect(declarationsOf(plain.container.querySelector("img")!)).not.toContain("image-rendering");
  });
});

describe("CardPreview corner tag", () => {
  it("floats the tag outside the clip that crops the media", () => {
    /* The preview clips its children to the card radius. A tag rendered inside that
       clip is cropped by it and cannot overhang; it has to be a sibling of the clip
       and a child of the positioned preview. */
    const { container } = render(() => (
      <Card id="c">
        <CardPreview tag="SHADERS">
          <Image src="/a.png" alt="" />
        </CardPreview>
      </Card>
    ));
    const preview = container.querySelector('[slot="preview"]')!;
    const tag = [...preview.children].find((child) => child.textContent === "SHADERS")!;
    expect(tag).toBeTruthy();
    expect(tag.parentElement).toBe(preview);
    const paint = declarationsOf(tag);
    expect(paint).toContain("position:absolute");
    expect(paint).toContain("backdrop-filter:blur(6px)");
    /* White ink needs the scrim under it; without a fill the tag is invisible on a
       light cover. */
    expect(paint).toMatch(/background-color:#000000[0-9a-f]{2}/);
  });

  it("renders nothing when no tag is given", () => {
    const { container } = render(() => (
      <Card id="c">
        <CardPreview>
          <Image src="/a.png" alt="" />
        </CardPreview>
      </Card>
    ));
    const preview = container.querySelector('[slot="preview"]')!;
    /* Only the clip. A tag element rendered unconditionally would paint an empty
       scrim chip over every card that never asked for one. */
    expect(preview.querySelectorAll(":scope > div")).toHaveLength(1);
  });
});

describe("Card signal edge", () => {
  it("takes the yellow detail edge, never the create fuchsia", () => {
    /* The signal card is the register's "look here" surface and fuchsia is reserved
       for the filled ask — a signal card wearing the CTA colour reads as a button. */
    const { container } = render(() => (
      <Card id="c" mesh="signal">
        x
      </Card>
    ));
    const edge = /border-color:([^;}]*)/.exec(declarationsOf(container.firstElementChild!))?.[1];
    /* `detail-soft` compiles to its literal light-dark() pair, so the assertion names
       the yellow rather than a variable: #f5c800 light / #ffe03a dark. */
    expect(edge).toContain("#f5c800");
    expect(edge).toContain("#ffe03a");
    /* The CTA fuchsia in both columns (glasselated-ramps.ts). */
    expect(edge).not.toMatch(/#d9128f|#ff4fc3/i);
  });

  it("leaves the ambient card on the neutral edge", () => {
    const { container } = render(() => (
      <Card id="c" mesh="ambient">
        x
      </Card>
    ));
    expect(declarationsOf(container.firstElementChild!)).not.toMatch(/#f5c800|#ffe03a/i);
  });
});

describe("AssetCard cover band", () => {
  it("crops the asset to a fixed 110px band instead of letterboxing it", () => {
    /* S2's asset thumbnail is a square `contain` fit, which pillarboxes every
       non-square asset. The register draws one cover height across the row, so
       neighbouring cards line up. */
    const { container } = render(() => (
      <AssetCard id="a">
        <CardPreview>
          <Image src="/a.png" alt="" />
        </CardPreview>
      </AssetCard>
    ));
    /* Image puts the context `styles` on its wrapper and the <img> inherits the fit
       (`objectFit: "inherit"`), so the band lives on the wrapper, not the element. */
    const wrapper = container.querySelector("img")!.closest("div")!;
    const paint = declarationsOf(wrapper);
    expect(paint).toContain("height:110px");
    expect(paint).toContain("object-fit:cover");
    expect(paint).not.toContain("object-fit:contain");
  });
});

describe("Avatar stack geometry", () => {
  it("rings each stacked avatar in the opaque raised surface at 2px", () => {
    /* Ringing in the translucent card fill lets the avatar below tint through and the
       stack reads as one smear; the ring must be the opaque token. */
    const { container } = render(() => (
      <AvatarGroup label="3 collaborators" size={30}>
        <Avatar src="/a.png" />
        <Avatar src="/b.png" />
      </AvatarGroup>
    ));
    const avatars = [...container.querySelectorAll("img")];
    const paint = declarationsOf(avatars[0]!.closest("div")!);
    expect(paint).toContain("outline-width:2px");
    expect(paint).toContain("var(--surface-raised)");
  });

  it("overlaps by 30% of the diameter, and never the first avatar", () => {
    /* A flat -9px would only be right at 30px; the ratio is what keeps the stack
       coherent across the size ramp. A missing :first-child reset indents the whole
       group by one overlap. */
    const source = readSource("src/avatar/index.tsx");
    expect(source).toContain('"calc(var(--size) * -0.3)"');
    expect(source).toMatch(/":first-child":\s*0/);
  });
});

describe("Skeleton shape", () => {
  it("draws its placeholders on the inset surface at the 4px corner", () => {
    /* The skeleton stands in for content on a card, so it takes the recessed inset
       fill; a ramp grey reads as a filled block, and the card's own 12px corner reads
       as a second card. */
    const skeleton = readSource("src/skeleton/index.tsx");
    expect(skeleton).toContain("var(--surface-inset)");
    expect([...skeleton.matchAll(/borderRadius: "sm"/g)]).toHaveLength(2);
    /* `sm` is the theme's 4px corner (style/spectrum-theme.ts, corner-radius-small);
       the sheet is what proves it survived to CSS. */
    expect(sheet).toContain("border-end-end-radius:.25rem");
  });
});
