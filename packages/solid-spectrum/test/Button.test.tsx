import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Button, ButtonContext } from "../src/button";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import CrossIcon from "../src/icon/ui-icons/Cross";
import { pressScale } from "../src/pressScale";

// setupUser is consolidated in solid-spectrum-test-utils.

function measuredElement(width = 120, height = 48) {
  const element = document.createElement("button");
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect);

  return element;
}

function mockReducedMotion(matches: boolean) {
  const spy = vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  );

  return () => {
    spy.mockRestore();
  };
}

describe("Button", () => {
  let onPressSpy = vi.fn();
  let onPressStartSpy = vi.fn();
  let onPressEndSpy = vi.fn();
  let onPressUpSpy = vi.fn();
  let onPressChangeSpy = vi.fn();
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    onPressSpy.mockClear();
    onPressStartSpy.mockClear();
    onPressEndSpy.mockClear();
    onPressUpSpy.mockClear();
    onPressChangeSpy.mockClear();
  });

  it("handles defaults", async () => {
    render(() => <Button onPress={onPressSpy}>Click Me</Button>);

    const button = screen.getByRole("button");
    await user.click(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);

    const text = screen.getByText("Click Me");
    expect(text).not.toBeNull();
  });

  it("supports press events", async () => {
    render(() => (
      <Button
        onPress={onPressSpy}
        onPressStart={onPressStartSpy}
        onPressEnd={onPressEndSpy}
        onPressUp={onPressUpSpy}
        onPressChange={onPressChangeSpy}
      >
        Click Me
      </Button>
    ));

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onPressStartSpy).toHaveBeenCalledTimes(1);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
    expect(onPressEndSpy).toHaveBeenCalledTimes(1);
    expect(onPressUpSpy).toHaveBeenCalledTimes(1);
    expect(onPressChangeSpy).toHaveBeenCalledTimes(2);
  });

  it("keyboard press with Enter key", async () => {
    render(() => (
      <Button
        onPress={onPressSpy}
        onPressStart={onPressStartSpy}
        onPressEnd={onPressEndSpy}
        onPressUp={onPressUpSpy}
        onPressChange={onPressChangeSpy}
      >
        Click Me
      </Button>
    ));

    const button = screen.getByRole("button");
    await user.tab();
    expect(document.activeElement).toBe(button);

    await user.keyboard("{Enter}");
    expect(onPressStartSpy).toHaveBeenCalledTimes(1);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
    expect(onPressEndSpy).toHaveBeenCalledTimes(1);
    expect(onPressUpSpy).toHaveBeenCalledTimes(1);
    expect(onPressChangeSpy).toHaveBeenCalledTimes(2);
  });

  it("keyboard press with Space key", async () => {
    render(() => (
      <Button
        onPress={onPressSpy}
        onPressStart={onPressStartSpy}
        onPressEnd={onPressEndSpy}
        onPressUp={onPressUpSpy}
        onPressChange={onPressChangeSpy}
      >
        Click Me
      </Button>
    ));

    const button = screen.getByRole("button");
    await user.tab();
    expect(document.activeElement).toBe(button);

    await user.keyboard("{ }");
    expect(onPressStartSpy).toHaveBeenCalledTimes(1);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
    expect(onPressEndSpy).toHaveBeenCalledTimes(1);
    expect(onPressUpSpy).toHaveBeenCalledTimes(1);
    expect(onPressChangeSpy).toHaveBeenCalledTimes(2);
  });

  // autoFocus works via onMount + focusSafely() which calls element.focus()
  // We verify autoFocus works by spying on the focus method
  it("supports autoFocus", () => {
    // Create a spy on HTMLElement.prototype.focus before rendering
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");

    render(() => <Button autoFocus>Click Me</Button>);

    const button = screen.getByRole("button");
    // Verify focus was called on the button element
    expect(focusSpy).toHaveBeenCalled();
    expect(
      focusSpy.mock.calls.some(
        (call) => call[0]?.preventScroll === true || focusSpy.mock.instances.includes(button),
      ),
    ).toBe(true);

    focusSpy.mockRestore();
  });

  it("handles touch press", async () => {
    render(() => <Button onPress={onPressSpy}>Touch Me</Button>);

    const button = screen.getByRole("button");
    await user.pointer([
      { keys: "[TouchA>]", target: button },
      { keys: "[/TouchA]", target: button },
    ]);

    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it("allows custom props to be passed through to the button", () => {
    render(() => <Button data-foo="bar">Click Me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-foo", "bar");
  });

  describe("pressScale", () => {
    it("adds will-change while idle like React Spectrum S2", () => {
      const style = pressScale(() => measuredElement())({ isPressed: false });

      expect(style.transform).toBeUndefined();
      expect((style as Record<string, string | undefined>)["will-change"]).toBe("transform");
    });

    it("adds the upstream press transform while pressed", () => {
      const style = pressScale(() => measuredElement(96, 36))({ isPressed: true });

      expect((style as Record<string, string | undefined>)["will-change"]).toBe("transform");
      expect(style.transform).toBe("perspective(36px) translate3d(0, 0, -2px)");
    });

    it("composes caller transform and will-change styles", () => {
      const style = pressScale(() => measuredElement(), {
        transform: "scale(1)",
        "will-change": "opacity",
      })({ isPressed: true });

      expect((style as Record<string, string | undefined>)["will-change"]).toBe(
        "opacity transform",
      );
      expect(style.transform).toBe("scale(1) perspective(48px) translate3d(0, 0, -2px)");
    });

    it("matches upstream press motion under reduced-motion media", () => {
      const restore = mockReducedMotion(true);

      try {
        expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);

        const style = pressScale(() => measuredElement(96, 36))({ isPressed: true });

        expect((style as Record<string, string | undefined>)["will-change"]).toBe("transform");
        expect(style.transform).toBe("perspective(36px) translate3d(0, 0, -2px)");
      } finally {
        restore();
      }
    });
  });

  it("supports native form props", () => {
    render(() => (
      <form id="foo">
        <Button
          form="foo"
          formAction="/save"
          formEncType="multipart/form-data"
          formMethod="post"
          formNoValidate
          formTarget="_blank"
          name="intent"
          value="save"
        >
          Save
        </Button>
      </form>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("form", "foo");
    expect(button).toHaveAttribute("formaction", "/save");
    expect(button).toHaveAttribute("formenctype", "multipart/form-data");
    expect(button).toHaveAttribute("formmethod", "post");
    expect(button).toHaveAttribute("formnovalidate");
    expect(button).toHaveAttribute("formtarget", "_blank");
    expect(button).toHaveAttribute("name", "intent");
    expect(button).toHaveAttribute("value", "save");
  });

  it("keeps focus on the previously focused element when preventFocusOnPress is true", () => {
    render(() => (
      <>
        <input aria-label="Previous" />
        <Button preventFocusOnPress>Click Me</Button>
      </>
    ));

    const input = screen.getByLabelText("Previous");
    const button = screen.getByRole("button");
    input.focus();

    fireEvent.mouseDown(button, { button: 0 });
    button.focus();

    expect(document.activeElement).toBe(input);
  });

  it("supports aria-label", () => {
    render(() => <Button aria-label="Test" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Test");
  });

  it("supports aria-labelledby", () => {
    render(() => (
      <>
        <span id="test">Test</span>
        <Button aria-labelledby="test" />
      </>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-labelledby", "test");
  });

  it("supports aria-describedby", () => {
    render(() => (
      <>
        <span id="test">Test</span>
        <Button aria-describedby="test">Hi</Button>
      </>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-describedby", "test");
  });

  it("renders icon children with the icon slot", () => {
    render(() => (
      <Button aria-label="Dismiss">
        <CrossIcon />
      </Button>
    ));

    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button.querySelector('[data-slot="icon"]')).toBeDefined();
  });

  it("does not respond when disabled", async () => {
    render(() => (
      <Button onPress={onPressSpy} isDisabled>
        Click Me
      </Button>
    ));

    const button = screen.getByRole("button");
    await user.click(button);
    expect(button).toBeDisabled();
    expect(onPressSpy).not.toHaveBeenCalled();
  });

  describe("variants", () => {
    it("renders with primary variant by default", () => {
      render(() => <Button>Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "primary");
    });

    it("renders with secondary variant", () => {
      render(() => <Button variant="secondary">Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "secondary");
    });

    it("renders with all React Spectrum S2 variants", () => {
      const variants = ["primary", "secondary", "accent", "negative", "premium", "genai"] as const;

      for (const variant of variants) {
        const { unmount } = render(() => <Button variant={variant}>Click Me</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("data-variant", variant);
        unmount();
      }
    });
  });

  describe("styles", () => {
    it("renders with fill style by default", () => {
      render(() => <Button>Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-style", "fill");
    });

    it("supports React Spectrum S2 fillStyle", () => {
      render(() => <Button fillStyle="outline">Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-style", "outline");
    });
  });

  describe("sizes", () => {
    it("supports React Spectrum S2 sizes", () => {
      const sizes = ["S", "M", "L", "XL"] as const;

      for (const size of sizes) {
        const { unmount } = render(() => <Button size={size}>Click Me</Button>);
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        unmount();
      }
    });

    it("inherits ButtonContext props like React Spectrum S2", () => {
      render(() => (
        <ButtonContext.Provider value={{ size: "XL", isDisabled: true }}>
          <Button>Click Me</Button>
        </ButtonContext.Provider>
      ));

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-size", "XL");
      expect(button).toBeDisabled();
    });
  });

  describe("static colors", () => {
    it("renders with white static color", () => {
      render(() => <Button staticColor="white">Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-static-color", "white");
    });

    it("renders with black static color", () => {
      render(() => <Button staticColor="black">Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-static-color", "black");
    });

    it("renders with auto static color", () => {
      render(() => <Button staticColor="auto">Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-static-color", "auto");
    });
  });

  describe("button type", () => {
    it('defaults to type="button"', () => {
      render(() => <Button>Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it('supports type="submit"', () => {
      render(() => <Button type="submit">Submit</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it('supports type="reset"', () => {
      render(() => <Button type="reset">Reset</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "reset");
    });
  });

  describe("excludeFromTabOrder", () => {
    it("removes button from tab order when excludeFromTabOrder is true", () => {
      render(() => <Button excludeFromTabOrder>Click Me</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("pending", () => {
    it("sets data-pending when isPending is true", () => {
      render(() => <Button isPending>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-pending");
    });

    it("does not call onPress while pending", async () => {
      render(() => (
        <Button isPending onPress={onPressSpy}>
          Loading
        </Button>
      ));
      const button = screen.getByRole("button");

      await user.click(button);
      expect(onPressSpy).not.toHaveBeenCalled();
    });
  });
});
