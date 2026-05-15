/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Divider, DividerContext } from "../src/divider";

describe("Divider (solid-spectrum)", () => {
  it("renders as an S2 horizontal separator by default", () => {
    render(() => <Divider />);
    const divider = screen.getByRole("separator");

    expect(divider.tagName).toBe("HR");
    expect(divider.className).not.toBe("");
    expect(divider).not.toHaveAttribute("aria-orientation");
  });

  it("renders vertical orientation through the headless separator branch", () => {
    render(() => <Divider orientation="vertical" />);
    const divider = screen.getByRole("separator");

    expect(divider.tagName).toBe("DIV");
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
  });

  it("supports S2 size and static color branches", () => {
    const { container } = render(() => (
      <>
        <Divider aria-label="small" size="S" />
        <Divider aria-label="medium" size="M" />
        <Divider aria-label="large" size="L" staticColor="white" />
      </>
    ));

    const dividers = Array.from(container.querySelectorAll('[role="separator"], hr'));
    expect(dividers).toHaveLength(3);
    expect(dividers[0]?.className).not.toBe(dividers[1]?.className);
    expect(dividers[2]?.className).not.toBe(dividers[1]?.className);
  });

  it("maps legacy Separator size aliases to S2 sizes", () => {
    const { container } = render(() => (
      <>
        <Divider aria-label="legacy" size="lg" />
        <Divider aria-label="s2" size="L" />
      </>
    ));

    const dividers = Array.from(container.querySelectorAll('[role="separator"], hr'));
    expect(dividers[0]?.className).toBe(dividers[1]?.className);
  });

  it("supports context props and unsafe escape hatches", () => {
    render(() => (
      <DividerContext.Provider
        value={{
          orientation: "vertical",
          size: "L",
          staticColor: "black",
          UNSAFE_className: "context-divider",
          UNSAFE_style: { margin: "2px" },
        }}
      >
        <Divider aria-label="Context divider" class="local-divider" />
      </DividerContext.Provider>
    ));

    const divider = screen.getByRole("separator", { name: "Context divider" }) as HTMLElement;
    expect(divider).toHaveClass("context-divider");
    expect(divider).toHaveClass("local-divider");
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
    expect(divider.style.margin).toBe("2px");
  });

  it("lets local props override context props", () => {
    render(() => (
      <DividerContext.Provider value={{ orientation: "vertical", size: "L" }}>
        <Divider aria-label="Local divider" orientation="horizontal" size="S" />
      </DividerContext.Provider>
    ));

    const divider = screen.getByRole("separator", { name: "Local divider" });
    expect(divider.tagName).toBe("HR");
    expect(divider).not.toHaveAttribute("aria-orientation");
  });
});
