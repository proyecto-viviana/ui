/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Avatar, AvatarContext } from "../src/avatar";

describe("Avatar (solid-spectrum)", () => {
  it("renders the S2 image wrapper with default slot and empty default alt", () => {
    const { container } = render(() => <Avatar />);

    const root = container.querySelector('[slot="avatar"]') as HTMLElement;
    const image = root.querySelector("img");

    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({ width: "1.5rem", height: "1.5rem" });
    expect(root.className).not.toBe("");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("alt", "");
    expect(image).not.toHaveAttribute("src");
  });

  it("supports src, alt, numeric size, and over-background styling", () => {
    const { container } = render(() => (
      <Avatar src="/avatar.png" alt="Alana" size={64} isOverBackground />
    ));

    const root = container.querySelector('[slot="avatar"]') as HTMLElement;
    const image = root.querySelector("img");

    expect(root).toHaveStyle({ width: "4rem", height: "4rem" });
    expect(image).toHaveAttribute("src", "/avatar.png");
    expect(image).toHaveAttribute("alt", "Alana");
    expect(image?.className).not.toBe("");
  });

  it("maps legacy size aliases and ignores legacy fallback content", () => {
    const { container } = render(() => <Avatar alt="John Doe" size="md" fallback="JD" online />);

    const root = container.querySelector('[slot="avatar"]');
    expect(root).toHaveStyle({ width: "2.5rem", height: "2.5rem" });
    expect(screen.queryByText("JD")).not.toBeInTheDocument();
  });

  it("supports context props, local overrides, and unsafe escape hatches", () => {
    const { container } = render(() => (
      <AvatarContext.Provider
        value={{
          size: 80,
          isOverBackground: true,
          UNSAFE_className: "context-avatar",
          UNSAFE_style: { margin: "2px" },
        }}
      >
        <Avatar alt="Kai" size={40} class="local-avatar" />
      </AvatarContext.Provider>
    ));

    const root = container.querySelector('[slot="avatar"]') as HTMLElement;
    expect(root).toHaveStyle({ width: "2.5rem", height: "2.5rem", margin: "2px" });
    expect(root).toHaveClass("context-avatar");
    expect(root).toHaveClass("local-avatar");
  });

  it("matches S2 DOM prop filtering on the root", () => {
    const { container } = render(() => (
      <Avatar id="avatar-id" data-testid="avatar" aria-label="Ignored label" hidden />
    ));

    const root = container.querySelector('[slot="avatar"]') as HTMLElement;
    expect(root).toHaveAttribute("id", "avatar-id");
    expect(root).toHaveAttribute("data-testid", "avatar");
    expect(root).not.toHaveAttribute("aria-label");
    expect(root).not.toHaveAttribute("hidden");
  });

  it("respects slot null for local slot override", () => {
    const { container } = render(() => <Avatar slot={null} alt="No slot" />);
    expect(container.querySelector("[slot]")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("alt", "No slot");
  });
});
