/**
 * Tests for the focusable-utils port (T-57): `isFocusable`, `isTabbable`, and
 * `isElementVisible` mirror @react-aria/utils — a candidate must match the
 * focusable selector AND be visible AND not be inside an `inert` subtree. The
 * visibility/inert cases are discriminating: they fail under the previous
 * simplified `isFocusable` (a tagName/tabindex check with no filtering).
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isFocusable, isTabbable, isElementVisible } from "../src/utils/dom";

describe("isFocusable / isTabbable / isElementVisible", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function mount(html: string): HTMLElement {
    container.innerHTML = html;
    return container.firstElementChild as HTMLElement;
  }

  describe("focusable selector", () => {
    it("matches native focusable elements", () => {
      expect(isFocusable(mount("<input />"))).toBe(true);
      expect(isFocusable(mount("<button>x</button>"))).toBe(true);
      expect(isFocusable(mount("<textarea></textarea>"))).toBe(true);
      expect(isFocusable(mount("<select></select>"))).toBe(true);
      expect(isFocusable(mount('<a href="#">x</a>'))).toBe(true);
    });

    it("rejects non-focusable elements", () => {
      expect(isFocusable(mount("<div>x</div>"))).toBe(false);
      expect(isFocusable(mount("<span>x</span>"))).toBe(false);
      // Anchor without href is not focusable.
      expect(isFocusable(mount("<a>x</a>"))).toBe(false);
    });

    it("rejects disabled native elements", () => {
      expect(isFocusable(mount("<input disabled />"))).toBe(false);
      expect(isFocusable(mount("<button disabled>x</button>"))).toBe(false);
      // type=hidden inputs are not focusable.
      expect(isFocusable(mount('<input type="hidden" />'))).toBe(false);
    });

    it("matches elements with any tabindex and contenteditable", () => {
      expect(isFocusable(mount('<div tabindex="0">x</div>'))).toBe(true);
      expect(isFocusable(mount('<div tabindex="-1">x</div>'))).toBe(true);
      expect(isFocusable(mount('<div contenteditable="true">x</div>'))).toBe(true);
      expect(isFocusable(mount('<div contenteditable="false">x</div>'))).toBe(false);
    });
  });

  describe("visibility filtering", () => {
    it("rejects display:none", () => {
      expect(isFocusable(mount('<input style="display: none" />'))).toBe(false);
    });

    it("rejects visibility:hidden", () => {
      expect(isFocusable(mount('<input style="visibility: hidden" />'))).toBe(false);
    });

    it("rejects elements with the hidden attribute", () => {
      expect(isFocusable(mount("<input hidden />"))).toBe(false);
    });

    it("rejects elements inside a display:none ancestor", () => {
      const parent = mount('<div style="display: none"><input /></div>');
      const input = parent.querySelector("input")!;
      expect(isFocusable(input)).toBe(false);
    });

    it("rejects elements inside a data-react-aria-prevent-focus ancestor", () => {
      const parent = mount("<div data-react-aria-prevent-focus><input /></div>");
      const input = parent.querySelector("input")!;
      expect(isFocusable(input)).toBe(false);
    });

    it("isElementVisible follows the same rules", () => {
      expect(isElementVisible(mount("<input />"))).toBe(true);
      expect(isElementVisible(mount('<input style="display: none" />'))).toBe(false);
      expect(isElementVisible(mount('<input style="visibility: hidden" />'))).toBe(false);
    });
  });

  describe("inert", () => {
    it("rejects elements inside an inert subtree", () => {
      const parent = mount("<div><input /></div>");
      const input = parent.querySelector("input")!;
      expect(isFocusable(input)).toBe(true);

      parent.inert = true;
      expect(isFocusable(input)).toBe(false);

      parent.inert = false;
      expect(isFocusable(input)).toBe(true);
    });
  });

  describe("tabbable vs focusable", () => {
    it('tabindex="-1" is focusable but not tabbable', () => {
      const el = mount('<div tabindex="-1">x</div>');
      expect(isFocusable(el)).toBe(true);
      expect(isTabbable(el)).toBe(false);
    });

    it('tabindex="0" is both focusable and tabbable', () => {
      const el = mount('<div tabindex="0">x</div>');
      expect(isFocusable(el)).toBe(true);
      expect(isTabbable(el)).toBe(true);
    });

    it("a hidden tabbable candidate is not tabbable", () => {
      const el = mount('<button style="display: none">x</button>');
      expect(isTabbable(el)).toBe(false);
    });
  });

  describe("skipVisibilityCheck", () => {
    it("bypasses the visibility check but keeps selector + inert filtering", () => {
      // Hidden, so not focusable normally...
      const hidden = mount('<button style="display: none">x</button>');
      expect(isFocusable(hidden)).toBe(false);
      // ...but focusable when visibility is skipped (the press-path preventFocus walk).
      expect(isFocusable(hidden, { skipVisibilityCheck: true })).toBe(true);

      // Selector filtering still applies.
      expect(isFocusable(mount("<div>x</div>"), { skipVisibilityCheck: true })).toBe(false);

      // Inert filtering still applies.
      const parent = mount('<div><button style="display: none">x</button></div>');
      const button = parent.querySelector("button")!;
      parent.inert = true;
      expect(isFocusable(button, { skipVisibilityCheck: true })).toBe(false);
    });
  });

  describe("detached document", () => {
    let detachedDocument: Document;

    beforeEach(() => {
      detachedDocument = document.implementation.createHTMLDocument("");
      // Sanity check that we are reproducing the detached condition.
      expect(detachedDocument.defaultView).toBe(null);
    });

    it("does not throw for isFocusable / isTabbable", () => {
      const button = detachedDocument.createElement("button");
      detachedDocument.body.appendChild(button);
      expect(() => isFocusable(button)).not.toThrow();
      expect(() => isFocusable(button, { skipVisibilityCheck: true })).not.toThrow();
      expect(isFocusable(button, { skipVisibilityCheck: true })).toBe(true);
      expect(() => isTabbable(button)).not.toThrow();
    });

    it("does not throw when an ancestor is inert", () => {
      const wrapper = detachedDocument.createElement("div");
      wrapper.inert = true;
      const button = detachedDocument.createElement("button");
      wrapper.appendChild(button);
      detachedDocument.body.appendChild(wrapper);
      expect(() => isFocusable(button, { skipVisibilityCheck: true })).not.toThrow();
    });
  });

  describe("cross-realm (Solid Portal into another document)", () => {
    let iframe: HTMLIFrameElement;

    beforeEach(() => {
      iframe = document.createElement("iframe");
      document.body.appendChild(iframe);
    });

    afterEach(() => {
      iframe.remove();
    });

    it("recognizes a main-realm node adopted into an iframe document", () => {
      const iframeDocument = iframe.contentWindow!.document;
      const root = iframeDocument.createElement("div");
      iframeDocument.body.appendChild(root);

      // Created by the main document (mirrors Solid's Portal cloning the template
      // with the global document), then adopted into the iframe document.
      const input = document.createElement("input");
      root.appendChild(input);

      expect(input.ownerDocument).toBe(iframeDocument);
      expect(isElementVisible(input)).toBe(true);
      expect(isFocusable(input)).toBe(true);
      expect(isTabbable(input)).toBe(true);
    });
  });
});
