import { describe, it, expect, vi } from "vite-plus/test";
import { render, fireEvent } from "@solidjs/testing-library";
import { Pressable } from "../src/Pressable";

describe("Pressable", () => {
  it("renders its child element", () => {
    const { getByTestId } = render(() => (
      <Pressable onPress={() => {}}>
        <div data-testid="child" role="button" tabIndex={0}>
          Pressable
        </div>
      </Pressable>
    ));
    expect(getByTestId("child")).toBeDefined();
    expect(getByTestId("child").textContent).toBe("Pressable");
  });

  it("can be exported from index", async () => {
    const mod = await import("../src/index");
    expect(mod.Pressable).toBeDefined();
  });

  it("renders without errors when disabled", () => {
    const { getByTestId } = render(() => (
      <Pressable isDisabled onPress={() => {}}>
        <div data-testid="child" role="button" tabIndex={0}>
          Disabled
        </div>
      </Pressable>
    ));
    expect(getByTestId("child")).toBeDefined();
  });

  it("forwards ref via callback", () => {
    let capturedRef: HTMLElement | undefined;
    render(() => (
      <Pressable
        ref={(el) => {
          capturedRef = el;
        }}
        onPress={() => {}}
      >
        <div role="button" tabIndex={0}>
          Content
        </div>
      </Pressable>
    ));
    expect(capturedRef).toBeInstanceOf(HTMLElement);
  });

  it("applies default focusable tabIndex when child does not define one", () => {
    const { getByTestId } = render(() => (
      <Pressable onPress={() => {}}>
        <div data-testid="press-target" role="button">
          Pressable
        </div>
      </Pressable>
    ));

    expect(getByTestId("press-target")).toHaveAttribute("tabindex", "0");
  });

  it("adds pressable data attribute used for touch-action CSS", () => {
    const { getByTestId } = render(() => (
      <Pressable onPress={() => {}}>
        <div data-testid="press-target" role="button">
          Pressable
        </div>
      </Pressable>
    ));

    expect(getByTestId("press-target")).toHaveAttribute("data-solidaria-pressable");
  });

  it("preserves explicit child tabIndex", () => {
    const { getByTestId } = render(() => (
      <Pressable onPress={() => {}}>
        <div data-testid="press-target" role="button" tabIndex={-1}>
          Pressable
        </div>
      </Pressable>
    ));

    expect(getByTestId("press-target")).toHaveAttribute("tabindex", "-1");
  });
});
