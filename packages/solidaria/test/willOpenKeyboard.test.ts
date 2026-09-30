/**
 * @vitest-environment jsdom
 *
 * Virtual keyboard. Pin: react-aria/src/utils/keyboard.tsx.
 * Any input outside the non-text denylist opens the keyboard, including hidden.
 * Contenteditable follows HTMLElement.isContentEditable, including descendants.
 */

import { afterEach, describe, expect, it } from "vite-plus/test";
import { willOpenKeyboard } from "../src/utils/dom";

const nonTextInputTypes = [
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
] as const;

describe("willOpenKeyboard", () => {
  const nodes = new Set<Element>();

  afterEach(() => {
    for (const node of nodes) {
      node.remove();
    }
    nodes.clear();
  });

  function mount(node: Element): Element {
    document.body.append(node);
    nodes.add(node);
    return node;
  }

  it("returns false for null and for a plain element", () => {
    expect(willOpenKeyboard(null)).toBe(false);
    expect(willOpenKeyboard(mount(document.createElement("div")))).toBe(false);
    expect(willOpenKeyboard(mount(document.createElement("button")))).toBe(false);
  });

  it("opens the keyboard for a text input and a textarea", () => {
    const input = document.createElement("input");
    const area = document.createElement("textarea");
    expect(willOpenKeyboard(mount(input))).toBe(true);
    expect(willOpenKeyboard(mount(area))).toBe(true);
  });

  it("does not open the keyboard for non-text input types", () => {
    for (const type of nonTextInputTypes) {
      const input = document.createElement("input");
      input.type = type;
      expect(willOpenKeyboard(mount(input)), type).toBe(false);
    }
  });

  it("opens the keyboard for a hidden input", () => {
    const input = document.createElement("input");
    input.type = "hidden";
    expect(input.type).toBe("hidden");
    expect(willOpenKeyboard(mount(input))).toBe(true);
  });

  it("opens the keyboard when isContentEditable is true on a descendant", () => {
    const host = document.createElement("div");
    const child = document.createElement("span");
    host.append(child);
    mount(host);
    Object.defineProperty(child, "isContentEditable", { configurable: true, get: () => true });
    expect(child.hasAttribute("contenteditable")).toBe(false);
    expect(willOpenKeyboard(child)).toBe(true);
  });

  it("stays closed when isContentEditable is false", () => {
    const host = document.createElement("div");
    host.setAttribute("contenteditable", "true");
    mount(host);
    Object.defineProperty(host, "isContentEditable", { configurable: true, get: () => false });
    expect(willOpenKeyboard(host)).toBe(false);
  });
});
