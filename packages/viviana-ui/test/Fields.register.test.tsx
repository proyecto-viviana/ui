/** @vitest-environment jsdom */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { render } from "@solidjs/testing-library";
import { DropZone } from "../src/dropzone";
import { Keyboard } from "../src/text/Keyboard";
import { SearchField } from "../src/searchfield";

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

describe("SearchField register prompt", () => {
  it("keeps the shortcut chip out of the field's accessible name", () => {
    /* The obvious implementation routes `shortcut` through `suffix`, whose id is joined
       into the input's aria-labelledby — a screen reader would then announce the field as
       "Search lessons ⌘K". The chip is decoration; only a description may carry it. */
    const { container } = render(() => <SearchField aria-label="Search lessons" shortcut="⌘K" />);
    const input = container.querySelector("input")!;
    const named = (input.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => container.ownerDocument.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(named).not.toContain("⌘K");
    expect(input.getAttribute("aria-label") ?? "").not.toContain("⌘K");

    const chip = container.querySelector("kbd")!;
    expect(chip).toHaveTextContent("⌘K");
    expect(chip.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("draws the slash prompt as decoration, and yields it to a caller's prefix", () => {
    /* The prompt is the register's search affordance, but it is a glyph: if it lands in
       the accessible name the field is called "/ Search lessons". And a caller that passes
       its own prefix must not get both. */
    const { container, unmount } = render(() => <SearchField aria-label="Search lessons" />);
    const prompt = container.querySelector('[aria-hidden="true"]')!;
    expect(prompt).toHaveTextContent("/");
    const labelledby = container.querySelector("input")!.getAttribute("aria-labelledby") ?? "";
    for (const id of labelledby.split(/\s+/).filter(Boolean)) {
      expect(container.ownerDocument.getElementById(id)?.textContent).not.toContain("/");
    }
    unmount();

    const withPrefix = render(() => (
      <SearchField aria-label="Search lessons" prefix={<span>find</span>} />
    ));
    expect(withPrefix.container.textContent).not.toContain("/");
  });
});

describe("Keyboard chip", () => {
  it("is drawn as a key chip, not as a run of terminal text", () => {
    /* A bare <kbd> styled as body-sized terminal text is indistinguishable from the copy
       around it; the register draws the key as a bordered chip. */
    const { container } = render(() => <Keyboard>⌘K</Keyboard>);
    const declarations = declarationsOf(container.querySelector("kbd")!);
    expect(declarations).toContain("border-top-width:1px");
    expect(declarations).toContain("border-color:var(--border-subtle)");
    expect(declarations).toContain("font-size:10px");
    expect(declarations).toContain("color:var(--terminal-dim)");
  });
});

describe("DropZone well", () => {
  it("is a matte well with a dashed rim and the register's scan", () => {
    /* The v1 zone was a bare gray-300 dashed box on the page ground: on a glass panel it
       read as a hole, not as a surface waiting for a file. */
    const { container } = render(() => <DropZone>Drop here</DropZone>);
    const declarations = declarationsOf(container.querySelector("[data-rac], [class]")!);
    expect(declarations).toContain("border-style:dashed");
    expect(declarations).toContain("background-color:var(--surface-well)");
    expect(declarations).toContain("repeating-conic-gradient(var(--well-scan)");
    expect(declarations).toContain("border-color:var(--well-border)");
  });
});
