/**
 * SSR half of the field-adornment hydration twin (#545 class 2), for both
 * `TextField` and `SearchField`.
 *
 * The server never applies element refs, so this half passes both before and
 * after the fix — it exists to write the markup TextField.hydrate.test.tsx
 * adopts, which is where the defect lands. Run this first.
 */
import { renderToString, isServer } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  ChildrenSnapshotInBodyFixture,
  ChildrenSnapshotInJsxFixture,
  SearchFieldReactiveAdornmentsFixture,
  TextFieldAdornmentsFixture,
  TextFieldReactiveAdornmentsFixture,
} from "./fixtures/textfield-adornments";

/**
 * `renderToString` interleaves hydration markers between an adornment's label
 * and the value behind it (`wrapped: <!--!$-->0</kbd>`), so match across the
 * markers and stop at the tag that closes the text node.
 *
 * Anchored, not bridged: `/wrapped:[\s\S]*0/` matches any later `0` in a class
 * atom, an id or a hydration key, and a server render of `999` satisfied it.
 * The three sibling bridges passed a `999` render only because nothing happened
 * to follow them, which the next markup change would have taken away.
 */
function serves(label: string, value: string): RegExp {
  return new RegExp(`${label}: (?:<!--[^>]*-->)*${value}<`);
}

describe("viviana-ui field adornments SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders both adornments once into hydratable markup", () => {
    const html = renderToString(() => <TextFieldAdornmentsFixture />);

    expect(html).toContain("Ask the tutor");
    expect(html.match(/⌘/g) ?? []).toHaveLength(1);
    expect(html.match(/↵/g) ?? []).toHaveLength(1);

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "viviana-ui-textfield-adornments-ssr.html"), html, "utf8");
  });

  it("writes both fields' reactive-adornment markup and the two controls (#545, #611)", () => {
    const textField = renderToString(() => <TextFieldReactiveAdornmentsFixture count={() => 0} />);
    const searchField = renderToString(() => (
      <SearchFieldReactiveAdornmentsFixture count={() => 0} />
    ));
    const inJsx = renderToString(() => <ChildrenSnapshotInJsxFixture count={() => 0} />);
    const inBody = renderToString(() => <ChildrenSnapshotInBodyFixture count={() => 0} />);

    for (const html of [textField, searchField]) {
      expect(html).toMatch(serves("wrapped", "0"));
      expect(html).toMatch(serves("bare", "0"));
    }
    expect(inJsx).toMatch(serves("control", "0"));
    expect(inBody).toMatch(serves("control", "0"));

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      resolve(outDir, "viviana-ui-textfield-reactive-adornments-ssr.html"),
      textField,
      "utf8",
    );
    writeFileSync(
      resolve(outDir, "viviana-ui-searchfield-reactive-adornments-ssr.html"),
      searchField,
      "utf8",
    );
    writeFileSync(resolve(outDir, "viviana-ui-children-snapshot-in-jsx-ssr.html"), inJsx, "utf8");
    writeFileSync(resolve(outDir, "viviana-ui-children-snapshot-in-body-ssr.html"), inBody, "utf8");
  });
});
