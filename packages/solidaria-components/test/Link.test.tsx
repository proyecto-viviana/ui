/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Link } from "../src/Link";
import { RouterProvider } from "../src/RouterProvider";
import {
  setupUser,
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

describe("Link", () => {
  it("should render a link with default class", () => {
    render(() => <Link>Test</Link>);
    const link = screen.getByRole("link");
    expect(link.tagName).toBe("SPAN");
    expect(link).toHaveClass("solidaria-Link");
  });

  it("should render a link with custom class", () => {
    render(() => <Link class="test">Test</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("test");
  });

  it("should support DOM props", () => {
    render(() => <Link data-foo="bar">Test</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("data-foo", "bar");
  });

  it("should render an anchor element when href is provided", () => {
    render(() => <Link href="https://example.com">Test</Link>);
    const link = screen.getByRole("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("should resolve href using RouterProvider useHref", () => {
    render(() => (
      <RouterProvider navigate={() => {}} useHref={(href) => `/app${href}`}>
        <Link href="/docs">Docs</Link>
      </RouterProvider>
    ));
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/app/docs");
  });

  it("should navigate via RouterProvider for client-side same-origin links", () => {
    const navigate = vi.fn();
    render(() => (
      <RouterProvider navigate={navigate}>
        <Link href="/docs" routerOptions={{ replace: true }}>
          Docs
        </Link>
      </RouterProvider>
    ));
    const link = screen.getByRole("link");
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith("/docs", { replace: true });
  });

  it("should not navigate via RouterProvider for target _blank links", () => {
    const navigate = vi.fn();
    render(() => (
      <RouterProvider navigate={navigate}>
        <Link href="/docs" target="_blank">
          Docs
        </Link>
      </RouterProvider>
    ));
    const link = screen.getByRole("link");
    fireEvent.click(link);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("should support render props", async () => {
    const user = setupUser();
    render(() => <Link>{(renderProps) => (renderProps.isHovered ? "Hovered" : "Test")}</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Test");

    await user.hover(link);
    expect(link).toHaveTextContent("Hovered");
  });

  it("should support hover state", async () => {
    const user = setupUser();
    const hoverStartSpy = vi.fn();
    const hoverChangeSpy = vi.fn();
    const hoverEndSpy = vi.fn();

    render(() => (
      <Link
        class={(renderProps) => (renderProps.isHovered ? "hover" : "")}
        onHoverStart={hoverStartSpy}
        onHoverChange={hoverChangeSpy}
        onHoverEnd={hoverEndSpy}
      >
        Test
      </Link>
    ));
    const link = screen.getByRole("link");

    expect(link).not.toHaveAttribute("data-hovered");
    expect(link).not.toHaveClass("hover");

    await user.hover(link);
    expect(link).toHaveAttribute("data-hovered", "true");
    expect(link).toHaveClass("hover");
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

    await user.unhover(link);
    expect(link).not.toHaveAttribute("data-hovered");
    expect(link).not.toHaveClass("hover");
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
  });

  it("should support focus ring", async () => {
    const user = setupUser();
    render(() => (
      <Link class={(renderProps) => (renderProps.isFocusVisible ? "focus" : "")}>Test</Link>
    ));
    const link = screen.getByRole("link");

    expect(link).not.toHaveAttribute("data-focus-visible");
    expect(link).not.toHaveClass("focus");

    await user.tab();
    expect(document.activeElement).toBe(link);
    expect(link).toHaveAttribute("data-focus-visible", "true");
    expect(link).toHaveClass("focus");

    await user.tab();
    expect(link).not.toHaveAttribute("data-focus-visible");
    expect(link).not.toHaveClass("focus");
  });

  it("should support press state", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => (
      <Link class={(renderProps) => (renderProps.isPressed ? "pressed" : "")} onPress={onPress}>
        Test
      </Link>
    ));
    const link = screen.getByRole("link");

    expect(link).not.toHaveAttribute("data-pressed");
    expect(link).not.toHaveClass("pressed");

    // Use click which is more reliable than pointer events in jsdom
    await user.click(link);

    // After click completes, press state should be cleared and onPress called
    expect(link).not.toHaveAttribute("data-pressed");
    expect(link).not.toHaveClass("pressed");
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should support disabled state", () => {
    render(() => (
      <Link isDisabled class={(renderProps) => (renderProps.isDisabled ? "disabled" : "")}>
        Test
      </Link>
    ));
    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("data-disabled", "true");
    expect(link).toHaveClass("disabled");
  });

  it("should support aria-current", () => {
    render(() => <Link aria-current="page">Test</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-current", "true");
  });

  it("should support target and rel attributes", () => {
    render(() => (
      <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
        Test
      </Link>
    ));
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should support anchor-specific link attributes", () => {
    render(() => (
      <Link
        href="https://example.com/file"
        hrefLang="es"
        download="guide.pdf"
        ping="https://example.com/ping"
        referrerPolicy="no-referrer"
      >
        Test
      </Link>
    ));
    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("hreflang", "es");
    expect(link).toHaveAttribute("download", "guide.pdf");
    expect(link).toHaveAttribute("ping", "https://example.com/ping");
    expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
  });

  it("should render as span when disabled with href", () => {
    render(() => (
      <Link href="https://example.com" isDisabled>
        Test
      </Link>
    ));
    const link = screen.getByRole("link");
    expect(link.tagName).toBe("SPAN");
  });

  it("should support slot prop", () => {
    render(() => <Link slot="nav-link">Test</Link>);
    const link = screen.getByRole("link");
    expect(link).toBeTruthy();
  });

  it("should support style as an object", () => {
    render(() => <Link style={{ color: "blue" }}>Test</Link>);
    const link = screen.getByRole("link") as HTMLElement;
    expect(link.style.color).toBe("blue");
  });

  it("should support style as a function", () => {
    render(() => (
      <Link style={(props) => ({ opacity: props.isDisabled ? "0.5" : "1" })}>Test</Link>
    ));
    const link = screen.getByRole("link") as HTMLElement;
    expect(link.style.opacity).toBe("1");
  });

  it("should call onPress handler", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => <Link onPress={onPress}>Test</Link>);
    const link = screen.getByRole("link");

    await user.click(link);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should not call onPress when disabled", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => (
      <Link isDisabled onPress={onPress}>
        Test
      </Link>
    ));
    const link = screen.getByRole("link");

    await user.click(link);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("should support aria-label", () => {
    render(() => <Link aria-label="Go home">🏠</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Go home");
  });

  describe("a11y validation", () => {
    it("axe: with href", async () => {
      const { container } = render(() => <Link href="https://example.com">Example</Link>);
      await assertNoA11yViolations(container);
    });

    it("axe: disabled", async () => {
      const { container } = render(() => <Link isDisabled>Disabled link</Link>);
      await assertNoA11yViolations(container);
    });

    it('axe: aria-current="page"', async () => {
      const { container } = render(() => (
        <Link href="/home" aria-current="page">
          Home
        </Link>
      ));
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs", () => {
      render(() => <Link href="https://example.com">Example</Link>);
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: id forwards", () => {
      render(() => (
        <Link id="nav-link" href="/home">
          Home
        </Link>
      ));
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("id", "nav-link");
    });
  });
});
