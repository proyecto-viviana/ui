/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Divider, DividerContext } from "../src/divider";

describe("Divider (solid-spectrum)", () => {
  it("renders as an S2 horizontal separator by default", () => {
    render(() => <Divider />);
    const divider = screen.getByRole("separator");

    expect(divider.tagName).toBe("HR");
    expect(divider.className).not.toBe("");
    expect(divider).toHaveAttribute("role", "separator");
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
        <Divider aria-label="Context divider" UNSAFE_className="local-divider" />
      </DividerContext.Provider>
    ));

    const divider = screen.getByRole("separator", { name: "Context divider" }) as HTMLElement;
    expect(divider).toHaveClass("context-divider");
    expect(divider).toHaveClass("local-divider");
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
    expect(divider.style.margin).toBe("2px");
  });

  it("passes through documented ARIA description props", () => {
    render(() => (
      <>
        <span id="divider-description">Description</span>
        <div id="divider-details">Details</div>
        <Divider
          aria-label="Detailed divider"
          aria-describedby="divider-description"
          aria-details="divider-details"
        />
      </>
    ));

    const divider = screen.getByRole("separator", { name: "Detailed divider" });
    expect(divider).toHaveAttribute("aria-describedby", "divider-description");
    expect(divider).toHaveAttribute("aria-details", "divider-details");
  });

  it("does not leak S2 visual props as root marker attributes", () => {
    render(() => (
      <Divider aria-label="Visual divider" orientation="vertical" size="L" staticColor="black" />
    ));
    const divider = screen.getByRole("separator", { name: "Visual divider" });
    expect(divider).not.toHaveAttribute("data-size");
    expect(divider).not.toHaveAttribute("data-static-color");
    expect(divider).not.toHaveAttribute("data-orientation");
  });

  it("merges context and local refs", () => {
    const contextRef = vi.fn();
    const localRef = vi.fn();

    render(() => (
      <DividerContext.Provider value={{ ref: contextRef }}>
        <Divider aria-label="Ref divider" ref={localRef} />
      </DividerContext.Provider>
    ));

    const divider = screen.getByRole("separator", { name: "Ref divider" });
    expect(contextRef).toHaveBeenCalledWith(divider);
    expect(localRef).toHaveBeenCalledWith(divider);
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
