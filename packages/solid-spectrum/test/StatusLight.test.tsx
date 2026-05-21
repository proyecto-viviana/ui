/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Skeleton } from "../src/skeleton";
import { StatusLight, StatusLightContext, type StatusLightProps } from "../src/statuslight";

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it("supports role, aria attributes, context props, and unsafe escape hatches", () => {
    const { container } = render(() => (
      <StatusLightContext.Provider
        value={{
          role: "status",
          variant: "negative",
          size: "XL",
          UNSAFE_className: "context-status",
          UNSAFE_style: { color: "red", margin: "2px" },
          "aria-describedby": "context-description",
        }}
      >
        <StatusLight
          data-testid="status-light-root"
          aria-label="Connection status"
          UNSAFE_className="local-status"
          UNSAFE_style={{ margin: "4px" }}
        >
          Offline
        </StatusLight>
      </StatusLightContext.Provider>
    ));

    const root = screen.getByRole("status", { name: "Connection status" }) as HTMLElement;
    expect(root).toHaveClass("context-status");
    expect(root).toHaveClass("local-status");
    expect(root).toHaveAttribute("aria-describedby", "context-description");
    expect(root.style.color).toBe("red");
    expect(root.style.margin).toBe("4px");
    expect(container.querySelector("svg")?.className.baseVal).not.toBe("");
  });

  it("filters S2-excluded compatibility props from the root and indicator", () => {
    const onClick = vi.fn();
    const props = {
      class: "legacy-status",
      indicatorClass: "legacy-indicator",
      style: { margin: "99px" },
      onClick,
      "data-testid": "status-light-root",
    } as unknown as StatusLightProps;

    const { container } = render(() => <StatusLight {...props}>Boundary</StatusLight>);

    const root = screen.getByTestId("status-light-root");
    root.click();
    expect(root).not.toHaveClass("legacy-status");
    expect(root.style.margin).toBe("");
    expect(onClick).not.toHaveBeenCalled();
    expect(container.querySelector("svg")).not.toHaveClass("legacy-indicator");
  });

  it("filters labelable aria attributes unless role is status", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

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
    expect(warn).toHaveBeenCalledWith("A labelled StatusLight must have a role.");
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
