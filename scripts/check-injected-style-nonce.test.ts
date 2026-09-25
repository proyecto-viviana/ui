/**
 * A guard that has never gone red is a claim, not a proof.
 * These fixtures verify that check-injected-style-nonce flags un-nonced
 * createElement("style") sites and passes nonced sites (#594).
 */
import { describe, expect, it } from "vite-plus/test";
import { findUnnoncedStyleInjections } from "./check-injected-style-nonce";
import { readFileSync } from "node:fs";

const UNNONCED_SITE = `
function injectBadStyle() {
  const style = document.createElement("style");
  style.id = "bad-style";
  document.head.appendChild(style);
}
`;

const NONCED_SITE = `
function injectGoodStyle() {
  const style = document.createElement("style");
  style.id = "good-style";
  const nonce = getNonce();
  if (nonce) {
    style.nonce = nonce;
  }
  document.head.appendChild(style);
}
`;

const REASSIGNED_NONCED_SITE = `
function injectScrollContainment(doc: Document) {
  let style = doc.createElement("style");
  let nonce = getNonce(doc);
  if (nonce) {
    style.nonce = nonce;
  }
  doc.head.prepend(style);
}
`;

describe("check-injected-style-nonce", () => {
  it("flags an un-nonced style element injection with line number", () => {
    const unnonced = findUnnoncedStyleInjections(UNNONCED_SITE, "bad.ts");
    expect(unnonced).toEqual([{ line: 3, variableName: "style" }]);
  });

  it("passes when style.nonce is set", () => {
    const unnonced = findUnnoncedStyleInjections(NONCED_SITE, "good.ts");
    expect(unnonced).toEqual([]);
  });

  it("passes when let style is nonced in custom doc scope", () => {
    const unnonced = findUnnoncedStyleInjections(REASSIGNED_NONCED_SITE, "custom.ts");
    expect(unnonced).toEqual([]);
  });

  it("reads real createPress.ts as clean", () => {
    const source = readFileSync("packages/solidaria/src/interactions/createPress.ts", "utf8");
    expect(findUnnoncedStyleInjections(source, "createPress.ts")).toEqual([]);
  });

  it("reads real solid-spectrum/toast/index.tsx as clean", () => {
    const source = readFileSync("packages/solid-spectrum/src/toast/index.tsx", "utf8");
    expect(findUnnoncedStyleInjections(source, "toast.tsx")).toEqual([]);
  });

  it("reads real solid-spectrum/table/index.tsx as clean", () => {
    const source = readFileSync("packages/solid-spectrum/src/table/index.tsx", "utf8");
    expect(findUnnoncedStyleInjections(source, "table.tsx")).toEqual([]);
  });

  it("reads real viviana-ui/theme-transition.ts as clean", () => {
    const source = readFileSync("packages/viviana-ui/src/provider/theme-transition.ts", "utf8");
    expect(findUnnoncedStyleInjections(source, "theme-transition.ts")).toEqual([]);
  });
});
