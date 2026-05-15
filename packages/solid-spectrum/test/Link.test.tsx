/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Link, LinkContext } from "../src/link";
import { LinkButton } from "../src/button/LinkButton";
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

  it("maps the legacy subtle variant to the S2 secondary style", () => {
    render(() => (
      <>
        <Link variant="secondary">Secondary</Link>
        <Link variant="subtle">Subtle</Link>
      </>
    ));

    expect(screen.getByRole("link", { name: "Subtle" }).className).toBe(
      screen.getByRole("link", { name: "Secondary" }).className,
    );
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

  it("should support custom class", () => {
    render(() => (
      <Link class="custom-class" UNSAFE_className="unsafe-class">
        Test
      </Link>
    ));
    const link = screen.getByRole("link");
    expect(link).toHaveClass("custom-class");
    expect(link).toHaveClass("unsafe-class");
  });

  it("should support UNSAFE_style", () => {
    render(() => <Link UNSAFE_style={{ color: "blue" }}>Test</Link>);
    const link = screen.getByRole("link") as HTMLElement;
    expect(link.style.color).toBe("blue");
  });

  it("should support disabled state", () => {
    render(() => <Link isDisabled>Test</Link>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("data-disabled", "true");
  });

  it("should call onPress when clicked", async () => {
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

  it("should render as a span when disabled with href", () => {
    render(() => (
      <Link href="https://example.com" isDisabled>
        Test
      </Link>
    ));

    const link = screen.getByRole("link");
    expect(link.tagName).toBe("SPAN");
    expect(link).not.toHaveAttribute("href");
  });

  it("should support focus visible styling", async () => {
    const user = setupUser();
    render(() => <Link>Test</Link>);
    const link = screen.getByRole("link");

    await user.tab();
    expect(document.activeElement).toBe(link);
    expect(link).toHaveAttribute("data-focus-visible", "true");
  });

  it("should support hover events", async () => {
    const user = setupUser();
    const onHoverStart = vi.fn();
    const onHoverEnd = vi.fn();

    render(() => (
      <Link onHoverStart={onHoverStart} onHoverEnd={onHoverEnd}>
        Test
      </Link>
    ));
    const link = screen.getByRole("link");

    await user.hover(link);
    expect(onHoverStart).toHaveBeenCalledTimes(1);

    await user.unhover(link);
    expect(onHoverEnd).toHaveBeenCalledTimes(1);
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
        referrerPolicy="no-referrer"
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
    expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
  });

  it("should support context props", () => {
    render(() => (
      <LinkContext.Provider
        value={{
          variant: "secondary",
          isStandalone: true,
          UNSAFE_className: "context-link",
        }}
      >
        <Link>Context</Link>
      </LinkContext.Provider>
    ));

    const link = screen.getByRole("link");
    expect(link).toHaveClass("context-link");
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
  it("renders an anchor with S2 button data attributes and text slot", () => {
    render(() => <LinkButton href="https://example.com">Open docs</LinkButton>);

    const link = screen.getByRole("link", { name: "Open docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("data-variant", "primary");
    expect(link).toHaveAttribute("data-style", "fill");
    expect(link).toHaveAttribute("data-size", "M");
    expect(link.querySelector('[data-rsp-slot="text"]')?.textContent).toBe("Open docs");
  });

  it("supports S2 button visual props", () => {
    render(() => (
      <LinkButton href="/billing" variant="accent" fillStyle="outline" size="XL">
        Billing
      </LinkButton>
    ));

    const link = screen.getByRole("link", { name: "Billing" });
    expect(link).toHaveAttribute("data-variant", "accent");
    expect(link).toHaveAttribute("data-style", "outline");
    expect(link).toHaveAttribute("data-size", "XL");
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
