/**
 * Hydration half of the TokenField server-render regression.
 */
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
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

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/tokenfield-ssr.html"),
  "utf8",
);

const staticSsrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/tokenfield-static-label-ssr.html"),
  "utf8",
);

describe("TokenField hydration over server markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates without a mismatch and keeps the label relationship", async () => {
    const selector = '[role="textbox"], span[id]';
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(ssrHtml, () => <TokenFieldFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll(selector));
        expect(serverNodes).toHaveLength(2);
      },
    });
    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    const textbox = container.querySelector<HTMLElement>('[role="textbox"]');
    const label = container.querySelector<HTMLElement>("span[id]");
    expect(textbox).not.toBeNull();
    expect(label).not.toBeNull();
    expect(textbox?.getAttribute("aria-labelledby")).toBe(label?.id);
    expect(label?.textContent).toBe("Recipients");
  });

  it("hydrates a static Label as a span with the textbox label id", async () => {
    const selector = '[role="textbox"], span[id]';
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(staticSsrHtml, () => <StaticTokenFieldFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll(selector));
        expect(serverNodes).toHaveLength(2);
        expect(container.querySelector("label")).toBeNull();
      },
    });
    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    const textbox = container.querySelector<HTMLElement>('[role="textbox"]');
    const label = container.querySelector<HTMLElement>("span[id]");
    expect(label?.tagName).toBe("SPAN");
    expect(textbox?.getAttribute("aria-labelledby")).toBe(label?.id);
    expect(label?.textContent).toBe("Recipients");
  });
});
