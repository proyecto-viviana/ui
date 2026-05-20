/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Link, LinkContext } from "../src/link";
import { LinkButton } from "../src/button/LinkButton";
import { Provider } from "../src/provider";
import { Skeleton } from "../src/skeleton";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

describe("Link (solid-spectrum)", () => {
  it("renders the S2-styled link element by default", () => {
    render(() => <Link>Test</Link>);
    const link = screen.getByRole("link");

    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("SPAN");
    expect(link.className).not.toBe("");
    expect(link).not.toHaveClass("solidaria-Link");
  });

  it("should render an anchor when href is provided", () => {
    render(() => <Link href="https://example.com">Test</Link>);
    const link = screen.getByRole("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("changes the generated S2 class for secondary variant", () => {
    render(() => (
      <>
        <Link>Primary</Link>
        <Link variant="secondary">Secondary</Link>
      </>
    ));

    const primary = screen.getByRole("link", { name: "Primary" });
    const secondary = screen.getByRole("link", { name: "Secondary" });
    expect(secondary.className).not.toBe(primary.className);
  });

  it("should support standalone style", () => {
    render(() => (
      <>
        <Link>Inline</Link>
        <Link isStandalone>Standalone</Link>
      </>
    ));

    expect(screen.getByRole("link", { name: "Standalone" }).className).not.toBe(
      screen.getByRole("link", { name: "Inline" }).className,
    );
  });

  it("should support quiet style with standalone", async () => {
    const user = setupUser();
    render(() => (
      <Link isStandalone isQuiet>
        Test
      </Link>
    ));
    const link = screen.getByRole("link");
    const initialClassName = link.className;

    await user.hover(link);
    expect(link).toHaveAttribute("data-hovered", "true");
    expect(link.className).not.toBe(initialClassName);
  });

  it("should support static color styles", () => {
    render(() => (
      <>
        <Link>Default</Link>
        <Link staticColor="white">White</Link>
        <Link staticColor="black">Black</Link>
      </>
    ));

    const defaultClassName = screen.getByRole("link", { name: "Default" }).className;
    expect(screen.getByRole("link", { name: "White" }).className).not.toBe(defaultClassName);
    expect(screen.getByRole("link", { name: "Black" }).className).not.toBe(defaultClassName);
  });

  it("matches the S2 prop boundary without legacy aliases or disabled/hover/click props", async () => {
    const user = setupUser();
    const onClick = vi.fn();
    const onHoverStart = vi.fn();
    const onPress = vi.fn();
    render(() => (
      <Link
        {...({
          class: "custom-class",
          isDisabled: true,
          onClick,
          onHoverStart,
        } as Record<string, unknown>)}
        href="/docs"
        UNSAFE_className="unsafe-class"
        onPress={onPress}
      >
        Test
      </Link>
    ));
    const link = screen.getByRole("link");
    expect(link).not.toHaveClass("custom-class");
    expect(link).toHaveClass("unsafe-class");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).not.toHaveAttribute("aria-disabled");
    expect(link).not.toHaveAttribute("data-disabled");

    await user.hover(link);
    await user.click(link);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("should support UNSAFE_style", () => {
    render(() => <Link UNSAFE_style={{ color: "blue" }}>Test</Link>);
    const link = screen.getByRole("link") as HTMLElement;
    expect(link.style.color).toBe("blue");
  });

  it("should call onPress when clicked", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => <Link onPress={onPress}>Test</Link>);
    const link = screen.getByRole("link");

    await user.click(link);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should support focus visible styling", async () => {
    const user = setupUser();
    render(() => <Link>Test</Link>);
    const link = screen.getByRole("link");

    await user.tab();
    expect(document.activeElement).toBe(link);
    expect(link).toHaveAttribute("data-focus-visible", "true");
  });

  it("supports the S2 press event surface", async () => {
    const user = setupUser();
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const onPressChange = vi.fn();
    const onPressUp = vi.fn();
    const onPress = vi.fn();

    render(() => (
      <Link
        onPress={onPress}
        onPressStart={onPressStart}
        onPressEnd={onPressEnd}
        onPressChange={onPressChange}
        onPressUp={onPressUp}
      >
        Test
      </Link>
    ));
    const link = screen.getByRole("link");

    await user.click(link);
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
    expect(onPressChange).toHaveBeenCalledWith(true);
    expect(onPressChange).toHaveBeenCalledWith(false);
    expect(onPressUp).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not inherit Provider disabled state", () => {
    render(() => (
      <Provider isDisabled>
        <Link href="https://example.com">Test</Link>
      </Provider>
    ));

    const link = screen.getByRole("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).not.toHaveAttribute("aria-disabled");
    expect(link).not.toHaveAttribute("data-disabled");
  });

  it("should support aria-current", () => {
    render(() => <Link aria-current="page">Test</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-current", "true");
  });

  it("passes native anchor attributes through to href links", () => {
    render(() => (
      <Link
        href="/download"
        target="_blank"
        rel="noopener"
        download="report.csv"
        hrefLang="en"
        ping="https://example.com/ping"
        referrerPolicy="no-referrer"
        aria-describedby="download-description"
        aria-details="download-details"
      >
        Download report
      </Link>
    ));

    const link = screen.getByRole("link", { name: "Download report" });
    expect(link).toHaveAttribute("href", "/download");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(link).toHaveAttribute("download", "report.csv");
    expect(link).toHaveAttribute("hreflang", "en");
    expect(link).toHaveAttribute("ping", "https://example.com/ping");
    expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(link).toHaveAttribute("aria-describedby", "download-description");
    expect(link).toHaveAttribute("aria-details", "download-details");
  });

  it("exposes the S2 link ref", () => {
    const callbackRef = vi.fn();
    const objectRef: { current: HTMLElement | null } = { current: null };

    render(() => (
      <>
        <Link href="/callback" ref={callbackRef}>
          Callback ref
        </Link>
        <Link href="/object" ref={objectRef}>
          Object ref
        </Link>
      </>
    ));

    const callbackLink = screen.getByRole("link", { name: "Callback ref" });
    const objectLink = screen.getByRole("link", { name: "Object ref" });
    expect(callbackRef).toHaveBeenCalledWith(callbackLink);
    expect(objectRef.current).toBe(objectLink);
  });

  it("applies LinkContext styles and lets local unsafe props override class props", () => {
    render(() => (
      <LinkContext.Provider
        value={{
          variant: "secondary",
          isStandalone: true,
          UNSAFE_className: "context-link",
          UNSAFE_style: { margin: "2px", padding: "1px" },
        }}
      >
        <Link UNSAFE_className="local-link" UNSAFE_style={{ margin: "4px" }}>
          Context
        </Link>
      </LinkContext.Provider>
    ));

    const link = screen.getByRole("link");
    expect(link).toHaveClass("local-link");
    expect(link).not.toHaveClass("context-link");
    expect(link).toHaveStyle({ margin: "4px", padding: "1px" });
  });

  it("should apply skeleton text and inert state", () => {
    render(() => (
      <Skeleton isLoading>
        <Link>Loading link</Link>
      </Skeleton>
    ));

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("inert", "true");
    expect(link.querySelector("span[inert]")).toBeInTheDocument();
  });
});

describe("LinkButton (solid-spectrum)", () => {
  it("renders an anchor with S2 button styling and text slot", () => {
    render(() => <LinkButton href="https://example.com">Open docs</LinkButton>);

    const link = screen.getByRole("link", { name: "Open docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link.className).not.toBe("");
    expect(link).not.toHaveAttribute("data-variant");
    expect(link).not.toHaveAttribute("data-style");
    expect(link).not.toHaveAttribute("data-size");
    expect(link.querySelector('[data-rsp-slot="text"]')?.textContent).toBe("Open docs");
  });

  it("supports S2 button visual props", () => {
    render(() => (
      <LinkButton href="/billing" variant="accent" fillStyle="outline" size="XL">
        Billing
      </LinkButton>
    ));

    const link = screen.getByRole("link", { name: "Billing" });
    expect(link.className).not.toBe("");
    expect(link).not.toHaveAttribute("data-variant");
    expect(link).not.toHaveAttribute("data-style");
    expect(link).not.toHaveAttribute("data-size");
  });

  it("does not call onPress while disabled", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(() => (
      <LinkButton href="/settings" isDisabled onPress={onPress}>
        Settings
      </LinkButton>
    ));

    const link = screen.getByText("Settings").closest("[data-disabled]");
    expect(link).toHaveAttribute("aria-disabled", "true");

    await user.click(link!);
    expect(onPress).not.toHaveBeenCalled();
  });
});
