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
import { Label } from "../src/Label";
import { SearchField, SearchFieldInput } from "../src/SearchField";
import { ToggleSwitch } from "../src/Switch";
import { Input, TextField } from "../src/TextField";
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

  // The styled layers hand their props on as a spread. mergeProps walks that
  // object once in the ToggleButton body; the walk is not a read of the values.
  it("ToggleButton takes signal-driven props through a spread without a strict-read report", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [on, setOn] = createSignal(false);
    const props = () => ({
      isSelected: on(),
      class: on() ? "on" : "off",
      onPress: () => {},
    });

    render(() => <ToggleButton {...props()}>Pin</ToggleButton>);
    const button = screen.getByRole("button", { name: "Pin" });

    expect(strictReads(warn)).toEqual([]);
    expect(button).toHaveClass("off");

    setOn(true);
    flush();

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("on");
  });

  it("Switch and Checkbox follow signal-driven selection and disability", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [on, setOn] = createSignal(false);

    render(() => (
      <>
        <ToggleSwitch isSelected={on()} isDisabled={on()}>
          Snap
        </ToggleSwitch>
        <Checkbox isSelected={on()} isDisabled={on()}>
          Lock
        </Checkbox>
      </>
    ));
    const toggle = screen.getByRole("switch", { name: "Snap" }) as HTMLInputElement;
    const checkbox = screen.getByRole("checkbox", { name: "Lock" }) as HTMLInputElement;

    expect(strictReads(warn)).toEqual([]);
    expect(toggle.checked).toBe(false);
    expect(checkbox.checked).toBe(false);

    setOn(true);
    flush();

    expect(toggle.checked).toBe(true);
    expect(toggle).toBeDisabled();
    expect(checkbox.checked).toBe(true);
    expect(checkbox).toBeDisabled();
  });

  it("TextField keeps its value, disability and label link live through context", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [value, setValue] = createSignal("one");
    const [disabled, setDisabled] = createSignal(false);
    const [id, setId] = createSignal("first");

    render(() => (
      <TextField value={value()} isDisabled={disabled()} id={id()}>
        <Label>Name</Label>
        <Input />
      </TextField>
    ));
    const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
    const label = screen.getByText("Name") as HTMLLabelElement;

    expect(strictReads(warn)).toEqual([]);
    expect(input.value).toBe("one");
    expect(label.htmlFor).toBe(input.id);

    setValue("two");
    setDisabled(true);
    setId("second");
    flush();

    expect(input.value).toBe("two");
    expect(input).toBeDisabled();
    expect(input.id).toBe("second");
    expect(label.htmlFor).toBe("second");
  });

  it("SearchField keeps its value and disability live", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [value, setValue] = createSignal("one");
    const [disabled, setDisabled] = createSignal(false);

    render(() => (
      <SearchField aria-label="Find" value={value()} isDisabled={disabled()}>
        <SearchFieldInput />
      </SearchField>
    ));
    const input = screen.getByRole("searchbox", { name: "Find" }) as HTMLInputElement;

    expect(strictReads(warn)).toEqual([]);
    expect(input.value).toBe("one");

    setValue("two");
    setDisabled(true);
    flush();

    expect(input.value).toBe("two");
    expect(input).toBeDisabled();
  });
});
