/**
 * @vitest-environment jsdom
 *
 * A prop the caller derives from a signal must reach the DOM again when the
 * signal changes. Solid's dev build reports a read that cannot do that as
 * STRICT_READ_UNTRACKED ("will not update"); #651.
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { Checkbox } from "../src/Checkbox";
import { ToggleButton } from "../src/ToggleButton";

function strictReads(warn: ReturnType<typeof vi.spyOn>): string[] {
  return warn.mock.calls
    .map((call) => String(call[0]))
    .filter((message) => message.includes("STRICT_READ_UNTRACKED"))
    .map((message) => message.split("\n")[0]!);
}

describe("reactive props", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ToggleButton reads a signal-driven isSelected and isDisabled where they can update", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [on, setOn] = createSignal(false);

    render(() => (
      <ToggleButton isSelected={on()} isDisabled={on()}>
        Pin
      </ToggleButton>
    ));
    const button = screen.getByRole("button", { name: "Pin" });

    expect(strictReads(warn)).toEqual([]);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).not.toBeDisabled();

    setOn(true);
    flush();

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toBeDisabled();
  });

  it("a ToggleButton follows isSelected once the caller starts supplying it", () => {
    const [selected, setSelected] = createSignal<boolean | undefined>(undefined);

    render(() => <ToggleButton isSelected={selected()}>Pin</ToggleButton>);
    const button = screen.getByRole("button", { name: "Pin" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    setSelected(true);
    flush();

    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("a signal-driven class and style reach the element again", () => {
    const [on, setOn] = createSignal(false);

    render(() => (
      <>
        <ToggleButton class={on() ? "on" : "off"} style={{ color: on() ? "red" : "blue" }}>
          Pin
        </ToggleButton>
        <Checkbox class={on() ? "on" : "off"}>Lock</Checkbox>
      </>
    ));
    const button = screen.getByRole("button", { name: "Pin" });
    const checkbox = screen.getByRole("checkbox", { name: "Lock" }).closest("label")!;

    expect(button).toHaveClass("off");
    expect(button).toHaveStyle({ color: "rgb(0, 0, 255)" });
    expect(checkbox).toHaveClass("off");

    setOn(true);
    flush();

    expect(button).toHaveClass("on");
    expect(button).not.toHaveClass("off");
    expect(button).toHaveStyle({ color: "rgb(255, 0, 0)" });
    expect(checkbox).toHaveClass("on");
  });
});
