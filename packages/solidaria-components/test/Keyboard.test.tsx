/**
 * Tests for solidaria-components Keyboard
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { Keyboard, KeyboardContext } from "../src/Keyboard";

describe("Keyboard", () => {
  it("renders semantic kbd element with ltr direction", () => {
    render(() => <Keyboard>Cmd+K</Keyboard>);
    const keyHint = screen.getByText("Cmd+K");
    expect(keyHint.tagName.toLowerCase()).toBe("kbd");
    expect(keyHint).toHaveAttribute("dir", "ltr");
  });

  it("merges props from context", () => {
    render(() => (
      <KeyboardContext.Provider value={{ class: "from-context" }}>
        <Keyboard>⌘</Keyboard>
      </KeyboardContext.Provider>
    ));
    expect(screen.getByText("⌘")).toHaveClass("from-context");
  });
});
