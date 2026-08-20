/**
 * VisuallyHidden tests
 *
 * Tests for VisuallyHidden component functionality including:
 * - Rendering
 * - Accessibility
 * - Element type customization
 */

import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { VisuallyHidden } from "../src/VisuallyHidden";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

describe("VisuallyHidden", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render children", () => {
      render(() => <VisuallyHidden>Hidden Content</VisuallyHidden>);

      expect(screen.getByText("Hidden Content")).toBeInTheDocument();
    });

    it("should render as span by default", () => {
      render(() => <VisuallyHidden>Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      expect(element.tagName.toLowerCase()).toBe("span");
    });

    it("should render with custom element type", () => {
      render(() => <VisuallyHidden elementType="div">Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      expect(element.tagName.toLowerCase()).toBe("div");
    });

    it("should render as h1 when specified", () => {
      render(() => <VisuallyHidden elementType="h1">Heading</VisuallyHidden>);

      const element = screen.getByText("Heading");
      expect(element.tagName.toLowerCase()).toBe("h1");
    });

    it("should render nested elements", () => {
      render(() => (
        <VisuallyHidden>
          <span>Nested content</span>
        </VisuallyHidden>
      ));

      expect(screen.getByText("Nested content")).toBeInTheDocument();
    });
  });

  // ============================================
  // STYLES
  // ============================================

  describe("styles", () => {
    it("should have visually hidden styles", () => {
      render(() => <VisuallyHidden>Content</VisuallyHidden>);

      const element = screen.getByText("Content");

      // Check that it has style attribute
      expect(element).toHaveAttribute("style");
    });

    it("should have position absolute", () => {
      render(() => <VisuallyHidden>Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      const style = element.getAttribute("style");

      expect(style).toContain("position");
    });

    it("should have clip style", () => {
      render(() => <VisuallyHidden>Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      const style = element.getAttribute("style");

      expect(style).toContain("clip");
    });

    it("should have overflow hidden", () => {
      render(() => <VisuallyHidden>Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      const style = element.getAttribute("style");

      expect(style).toContain("overflow");
    });

    it("should have 1px dimensions", () => {
      render(() => <VisuallyHidden>Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      const style = element.getAttribute("style");

      expect(style).toContain("1px");
    });
  });

  // ============================================
  // ACCESSIBILITY
  // ============================================

  describe("accessibility", () => {
    it("should be accessible to screen readers", () => {
      render(() => <VisuallyHidden>Screen reader text</VisuallyHidden>);

      // Content should be in the document (accessible)
      expect(screen.getByText("Screen reader text")).toBeInTheDocument();
    });

    it("should pass through aria attributes", () => {
      render(() => <VisuallyHidden aria-label="Custom label">Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      expect(element).toHaveAttribute("aria-label", "Custom label");
    });

    it("should pass through id attribute", () => {
      render(() => <VisuallyHidden id="hidden-element">Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      expect(element).toHaveAttribute("id", "hidden-element");
    });

    it("should pass through role attribute", () => {
      render(() => <VisuallyHidden role="status">Status message</VisuallyHidden>);

      const element = screen.getByRole("status");
      expect(element).toBeInTheDocument();
    });
  });

  // ============================================
  // PROPS PASSTHROUGH
  // ============================================

  describe("props passthrough", () => {
    it("should pass through data attributes", () => {
      render(() => <VisuallyHidden data-testid="hidden">Content</VisuallyHidden>);

      const element = screen.getByTestId("hidden");
      expect(element).toBeInTheDocument();
    });

    it("should pass through class name", () => {
      render(() => <VisuallyHidden class="my-hidden-class">Content</VisuallyHidden>);

      const element = screen.getByText("Content");
      expect(element).toHaveClass("my-hidden-class");
    });
  });

  // ============================================
  // USE CASES
  // ============================================

  describe("use cases", () => {
    it("should work for skip links", () => {
      render(() => (
        <a href="#main">
          <VisuallyHidden>Skip to main content</VisuallyHidden>
        </a>
      ));

      expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    });

    it("should work for icon button labels", () => {
      render(() => (
        <button type="button">
          <span aria-hidden="true">X</span>
          <VisuallyHidden>Close dialog</VisuallyHidden>
        </button>
      ));

      expect(screen.getByText("Close dialog")).toBeInTheDocument();
    });

    it("should work for form field descriptions", () => {
      render(() => (
        <div>
          <label>
            Email
            <VisuallyHidden> (required)</VisuallyHidden>
          </label>
        </div>
      ));

      expect(screen.getByText(/required/)).toBeInTheDocument();
    });

    it("keeps hidden styles when focused without isFocusable", async () => {
      const user = setupUser();
      render(() => (
        <>
          <button type="button">Button A</button>
          <VisuallyHidden>
            <button type="button">Hidden button</button>
          </VisuallyHidden>
          <button type="button">Button C</button>
        </>
      ));

      const buttons = screen.getAllByRole("button");
      const hiddenWrapper = buttons[1].parentElement as HTMLElement;
      const hiddenStyle = hiddenWrapper.getAttribute("style");

      await user.tab();
      await user.tab();

      expect(document.activeElement).toBe(buttons[1]);
      expect(hiddenWrapper.getAttribute("style")).toEqual(hiddenStyle);
    });

    it("unhides on focus when isFocusable is true", async () => {
      const user = setupUser();
      render(() => (
        <>
          <button type="button">Button A</button>
          <VisuallyHidden isFocusable>
            <button type="button">Focusable hidden button</button>
          </VisuallyHidden>
          <button type="button">Button C</button>
        </>
      ));

      const buttons = screen.getAllByRole("button");
      const hiddenWrapper = buttons[1].parentElement as HTMLElement;
      const hiddenStyle = hiddenWrapper.getAttribute("style");

      await user.tab();
      await user.tab();

      expect(document.activeElement).toBe(buttons[1]);
      expect(hiddenWrapper.getAttribute("style")).not.toEqual(hiddenStyle);
      expect(hiddenWrapper.getAttribute("style") ?? "").toHaveLength(0);
    });
  });
});
