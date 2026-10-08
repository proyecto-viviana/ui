/**
 * Server-render half of the TokenField hydration regression.
 */
import { isServer, renderToString } from "@solidjs/web";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { Label } from "../src/Label";
import { Token, TokenField, TokenFieldValue, TokenInput } from "../src/TokenField";

function value() {
  return new TokenFieldValue([{ type: "text", text: "hello" }]);
}

function TokenFieldFixture() {
  return (
    <TokenField defaultValue={value()}>
      {() => (
        <>
          <Label>Recipients</Label>
          <TokenInput>{(segment) => <Token>{segment.text}</Token>}</TokenInput>
        </>
      )}
    </TokenField>
  );
}

function StaticTokenFieldFixture() {
  return (
    <TokenField defaultValue={value()}>
      <Label>Recipients</Label>
      <TokenInput>{(segment) => <Token>{segment.text}</Token>}</TokenInput>
    </TokenField>
  );
}

describe("TokenField SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders a labelled textbox and writes hydratable markup", () => {
    const html = renderToString(() => <TokenFieldFixture />);
    const labelledBy = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeTruthy();
    expect(html).toContain('role="textbox"');
    expect(html).toContain(`id="${labelledBy}"`);
    expect(html).toContain("Recipients");
    expect(html).toContain("hello");
    expect(html).not.toMatch(/<label[\s>]/);

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "tokenfield-ssr.html"), html, "utf8");
  });

  it("renders a static Label as the textbox span", () => {
    const html = renderToString(() => <StaticTokenFieldFixture />);
    const labelledBy = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeTruthy();
    expect(html).toMatch(new RegExp(`<span\\b[^>]*\\bid="${labelledBy}"`));
    expect(html).not.toMatch(/<label[\s>]/);
    expect(html).toContain("Recipients");

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "tokenfield-static-label-ssr.html"), html, "utf8");
  });
});
