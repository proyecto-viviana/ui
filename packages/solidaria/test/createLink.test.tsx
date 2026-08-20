/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Dynamic } from "solid-js/web";
import { createLink } from "../src/link";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// Test component that uses createLink
function TestLink(props: {
  href?: string;
  hrefLang?: string;
  download?: string | boolean;
  ping?: string;
  referrerPolicy?: string;
  isDisabled?: boolean;
  onPress?: () => void;
  onClick?: () => void;
  elementType?: string;
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | "true" | "false" | boolean;
  children?: string;
}) {
  // Determine the element type first - this must be passed to createLink
  const elementType = () => {
    if (props.elementType === "a" || (!props.elementType && props.href)) {
      return "a";
    }
    return "span";
  };

  const { linkProps, isPressed } = createLink({
    get href() {
      return props.href;
    },
    get hrefLang() {
      return props.hrefLang;
    },
    get download() {
      return props.download;
    },
    get ping() {
      return props.ping;
    },
    get referrerPolicy() {
      return props.referrerPolicy as any;
    },
    get isDisabled() {
      return props.isDisabled;
    },
    get onPress() {
      return props.onPress;
    },
    get onClick() {
      return props.onClick;
    },
    get elementType() {
      return elementType();
    },
    get "aria-current"() {
      return props["aria-current"];
    },
  });

  return (
    <Dynamic component={elementType()} {...linkProps} data-pressed={isPressed() || undefined}>
      {props.children ?? "Test Link"}
    </Dynamic>
  );
}

describe("createLink", () => {
  it('should render a link with role="link" when no href', () => {
    render(() => <TestLink />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("SPAN");
    expect(link).toHaveAttribute("role", "link");
    expect(link).toHaveAttribute("tabIndex", "0");
  });

  it("should render an anchor element when href is provided", () => {
    render(() => <TestLink href="https://example.com" />);
    const link = screen.getByRole("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("should support additional link DOM props for anchor links", () => {
    render(() => (
      <TestLink
        href="https://example.com"
        hrefLang="es"
        download="file.txt"
        ping="https://example.com/ping"
        referrerPolicy="no-referrer"
      />
    ));
    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("hreflang", "es");
    expect(link).toHaveAttribute("download", "file.txt");
    expect(link).toHaveAttribute("ping", "https://example.com/ping");
    expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
  });

  it("should not forward anchor-only props when rendered as non-anchor", () => {
    render(() => <TestLink hrefLang="es" download="file.txt" />);
    const link = screen.getByRole("link");

    expect(link.tagName).toBe("SPAN");
    expect(link).not.toHaveAttribute("hreflang");
    expect(link).not.toHaveAttribute("download");
  });

  it("should support disabled state", () => {
    render(() => <TestLink isDisabled />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).not.toHaveAttribute("tabIndex");
  });

  it("should call onPress when clicked", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => <TestLink onPress={onPress} />);
    const link = screen.getByRole("link");

    await user.click(link);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should not call onPress when disabled", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => <TestLink isDisabled onPress={onPress} />);
    const link = screen.getByRole("link");

    await user.click(link);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("should support aria-current", () => {
    render(() => <TestLink aria-current="page" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("should support keyboard activation with Enter", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => <TestLink onPress={onPress} />);
    const link = screen.getByRole("link");

    link.focus();
    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // Note: Links only respond to Enter key, not Space (per WAI-ARIA guidelines)
  // This matches native <a> behavior and React Aria's implementation

  it("should call onClick handler", async () => {
    const onClick = vi.fn();
    render(() => <TestLink onClick={onClick} />);
    const link = screen.getByRole("link");

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should prevent onClick when disabled", async () => {
    const onClick = vi.fn();
    render(() => <TestLink isDisabled onClick={onClick} href="https://example.com" />);
    const link = screen.getByRole("link");

    fireEvent.click(link);
    // onClick should still be called but default should be prevented
    expect(onClick).not.toHaveBeenCalled();
  });
});
