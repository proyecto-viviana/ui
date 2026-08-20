import { describe, it, expect, vi } from "vite-plus/test";
import { render, fireEvent } from "@solidjs/testing-library";
import { Focusable } from "../src/Focusable";

describe("Focusable", () => {
  it("renders its child element", () => {
    const { getByTestId } = render(() => (
      <Focusable>
        <div data-testid="child" tabIndex={0}>
          Focusable content
        </div>
      </Focusable>
    ));
    expect(getByTestId("child")).toBeDefined();
    expect(getByTestId("child").textContent).toBe("Focusable content");
  });

  it("can be exported from index", async () => {
    const mod = await import("../src/index");
    expect(mod.Focusable).toBeDefined();
  });

  it("renders without errors when disabled", () => {
    const { getByTestId } = render(() => (
      <Focusable isDisabled>
        <div data-testid="child" tabIndex={0}>
          Disabled
        </div>
      </Focusable>
    ));
    expect(getByTestId("child")).toBeDefined();
  });

  it("forwards ref via callback", () => {
    let capturedRef: HTMLElement | undefined;
    render(() => (
      <Focusable
        ref={(el) => {
          capturedRef = el;
        }}
      >
        <div tabIndex={0}>Content</div>
      </Focusable>
    ));
    expect(capturedRef).toBeInstanceOf(HTMLElement);
  });

  it("applies default focusable tabIndex when child does not define one", () => {
    const { getByTestId } = render(() => (
      <Focusable>
        <div data-testid="focus-target">Focusable content</div>
      </Focusable>
    ));

    expect(getByTestId("focus-target")).toHaveAttribute("tabindex", "0");
  });

  it("preserves explicit child tabIndex", () => {
    const { getByTestId } = render(() => (
      <Focusable>
        <div data-testid="focus-target" tabIndex={-1}>
          Focusable content
        </div>
      </Focusable>
    ));

    expect(getByTestId("focus-target")).toHaveAttribute("tabindex", "-1");
  });
});
