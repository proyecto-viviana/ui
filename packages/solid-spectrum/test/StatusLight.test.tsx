/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Skeleton } from "../src/skeleton";
import { StatusLight, StatusLightContext } from "../src/statuslight";

describe("StatusLight (solid-spectrum)", () => {
  it("renders the S2 status light structure", () => {
    const { container } = render(() => <StatusLight>Online</StatusLight>);

    const root = screen.getByText("Online").closest("div");
    expect(root).toBeInTheDocument();
    expect(root?.tagName).toBe("DIV");
    expect(root).not.toHaveAttribute("role");
    expect(root?.className).not.toBe("");
    expect(screen.getByText("Online")).toHaveAttribute("data-rsp-slot", "text");
    expect(container.querySelector('svg[aria-hidden="true"] circle')).toBeInTheDocument();
  });

  it("supports S2 variants and sizes", () => {
    const { container } = render(() => (
      <>
        <StatusLight>Default</StatusLight>
        <StatusLight variant="positive" size="XL">
          Positive
        </StatusLight>
        <StatusLight variant="cyan" size="S">
          Cyan
        </StatusLight>
      </>
    ));

    const lights = Array.from(container.querySelectorAll('svg[aria-hidden="true"]'));
    expect(lights).toHaveLength(3);
    expect(lights[1]?.className.baseVal).not.toBe(lights[0]?.className.baseVal);
    expect(lights[2]?.className.baseVal).not.toBe(lights[0]?.className.baseVal);
  });

  it("maps legacy variant and size aliases to S2 styles", () => {
    const { container } = render(() => (
      <>
        <StatusLight variant="info" size="md">
          Info alias
        </StatusLight>
        <StatusLight variant="informative" size="M">
          Informative
        </StatusLight>
      </>
    ));

    const lights = Array.from(container.querySelectorAll('svg[aria-hidden="true"]'));
    expect(lights[0]?.className.baseVal).toBe(lights[1]?.className.baseVal);
  });

  it("supports role, aria attributes, context props, and unsafe escape hatches", () => {
    const { container } = render(() => (
      <StatusLightContext.Provider
        value={{
          role: "status",
          variant: "negative",
          size: "XL",
          UNSAFE_className: "context-status",
          UNSAFE_style: { margin: "2px" },
        }}
      >
        <StatusLight
          class="local-status"
          indicatorClass="legacy-indicator"
          aria-label="Connection status"
        >
          Offline
        </StatusLight>
      </StatusLightContext.Provider>
    ));

    const root = screen.getByRole("status", { name: "Connection status" }) as HTMLElement;
    expect(root).toHaveClass("context-status");
    expect(root).toHaveClass("local-status");
    expect(root.style.margin).toBe("2px");
    expect(container.querySelector("svg")).toHaveClass("legacy-indicator");
  });

  it("filters labelable aria attributes unless role is status", () => {
    render(() => (
      <>
        <StatusLight aria-label="No role">No role</StatusLight>
        <StatusLight role="status" aria-label="With role">
          With role
        </StatusLight>
      </>
    ));

    const unlabelledRoot = screen.getByText("No role").closest("div");
    expect(unlabelledRoot).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("status", { name: "With role" })).toHaveAttribute(
      "aria-label",
      "With role",
    );
  });

  it("uses the shared skeleton consumers for text and light color", () => {
    const { container } = render(() => (
      <Skeleton isLoading>
        <StatusLight>Loading</StatusLight>
      </Skeleton>
    ));

    const text = container.querySelector('[data-rsp-slot="text"]');
    expect(text).toHaveAttribute("inert", "true");
    expect(text?.querySelector("span[inert]")).toBeInTheDocument();
    expect(container.querySelector('svg[aria-hidden="true"]')?.className.baseVal).not.toBe("");
  });
});
