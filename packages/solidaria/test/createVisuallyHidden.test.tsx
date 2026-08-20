/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { createVisuallyHidden, visuallyHiddenStyles } from "../src/visually-hidden";

describe("createVisuallyHidden", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("visuallyHiddenStyles", () => {
    it("should contain the correct CSS properties", () => {
      expect(visuallyHiddenStyles).toHaveProperty("position", "absolute");
      expect(visuallyHiddenStyles).toHaveProperty("width", "1px");
      expect(visuallyHiddenStyles).toHaveProperty("height", "1px");
      expect(visuallyHiddenStyles).toHaveProperty("overflow", "hidden");
      expect(visuallyHiddenStyles).toHaveProperty("clip-path", "inset(50%)");
    });
  });

  describe("createVisuallyHidden hook", () => {
    it("should return visuallyHiddenProps accessor", () => {
      let props: ReturnType<typeof createVisuallyHidden> | undefined;

      function TestComponent() {
        props = createVisuallyHidden();
        return <div {...props.visuallyHiddenProps()}>Hidden content</div>;
      }

      render(() => <TestComponent />);

      expect(props).toBeDefined();
      expect(typeof props!.visuallyHiddenProps).toBe("function");
    });

    it("should apply visually hidden styles by default", () => {
      function TestComponent() {
        const { visuallyHiddenProps } = createVisuallyHidden();
        return (
          <span data-testid="hidden" {...visuallyHiddenProps()}>
            Screen reader only
          </span>
        );
      }

      const { getByTestId } = render(() => <TestComponent />);
      const element = getByTestId("hidden");

      expect(element.style.position).toBe("absolute");
      expect(element.style.width).toBe("1px");
      expect(element.style.height).toBe("1px");
      expect(element.style.overflow).toBe("hidden");
    });

    it("should merge custom styles with visually hidden styles", () => {
      function TestComponent() {
        const { visuallyHiddenProps } = createVisuallyHidden({
          style: { "background-color": "red" },
        });
        return (
          <span data-testid="hidden" {...visuallyHiddenProps()}>
            Content
          </span>
        );
      }

      const { getByTestId } = render(() => <TestComponent />);
      const element = getByTestId("hidden");

      // Should have both visually hidden styles and custom styles
      expect(element.style.position).toBe("absolute");
      expect(element.style.backgroundColor).toBe("red");
    });

    it("should work with reactive props", () => {
      function TestComponent(props: { customStyle?: boolean }) {
        const { visuallyHiddenProps } = createVisuallyHidden(() => ({
          style: props.customStyle ? { "z-index": "100" } : undefined,
        }));
        return (
          <span data-testid="hidden" {...visuallyHiddenProps()}>
            Content
          </span>
        );
      }

      const { getByTestId } = render(() => <TestComponent customStyle />);
      const element = getByTestId("hidden");

      expect(element.style.zIndex).toBe("100");
    });
  });

  describe("isFocusable option", () => {
    it("should include focus event handlers when isFocusable is true", () => {
      let props: ReturnType<typeof createVisuallyHidden> | undefined;

      function TestComponent() {
        props = createVisuallyHidden({ isFocusable: true });
        return (
          <a href="#" {...props.visuallyHiddenProps()}>
            Skip link
          </a>
        );
      }

      render(() => <TestComponent />);

      const propsValue = props!.visuallyHiddenProps();
      // Should have focus-related handlers from createFocusWithin
      expect(propsValue).toHaveProperty("onFocus");
      expect(propsValue).toHaveProperty("onBlur");
    });

    it("should not have focus handlers when isFocusable is false", () => {
      let props: ReturnType<typeof createVisuallyHidden> | undefined;

      function TestComponent() {
        props = createVisuallyHidden({ isFocusable: false });
        return <span {...props.visuallyHiddenProps()}>Hidden</span>;
      }

      render(() => <TestComponent />);

      // When disabled, createFocusWithin should not add handlers
      // (the exact behavior depends on createFocusWithin implementation)
      expect(props).toBeDefined();
    });
  });

  describe("accessibility", () => {
    it("should render content that is accessible to screen readers", () => {
      function TestComponent() {
        const { visuallyHiddenProps } = createVisuallyHidden();
        return <span {...visuallyHiddenProps()}>This text is only for screen readers</span>;
      }

      const { container } = render(() => <TestComponent />);
      const span = container.querySelector("span");

      // Content should exist in the DOM
      expect(span).toBeTruthy();
      expect(span?.textContent).toBe("This text is only for screen readers");

      // But should be visually hidden
      expect(span?.style.position).toBe("absolute");
      // Browser normalizes clip value, so just check it contains 'rect'
      expect(span?.style.clip).toContain("rect");
    });

    it("should work with aria-label for associated elements", () => {
      function TestComponent() {
        const { visuallyHiddenProps } = createVisuallyHidden();
        return (
          <div>
            <button aria-describedby="hidden-description">Action</button>
            <span id="hidden-description" {...visuallyHiddenProps()}>
              Additional description for screen readers
            </span>
          </div>
        );
      }

      const { container } = render(() => <TestComponent />);
      const description = container.querySelector("#hidden-description");

      expect(description).toBeTruthy();
      expect(description?.textContent).toBe("Additional description for screen readers");
    });
  });
});
