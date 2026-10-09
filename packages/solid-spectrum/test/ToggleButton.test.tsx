import { createSignal, flush, onCleanup } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { ToggleButton } from "../src";
import { BellIcon } from "../src/icon/s2wf-icons/BellIcon";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

describe("ToggleButton (solid-spectrum)", () => {
  let previousRootDisposed = false;

  it("owns a rendered Solid root until case teardown", () => {
    render(() => {
      onCleanup(() => {
        previousRootDisposed = true;
      });
      return <ToggleButton aria-label="Pin">Pin</ToggleButton>;
    });

    expect(previousRootDisposed).toBe(false);
    expect(screen.getByRole("button", { name: "Pin" })).toHaveAttribute("aria-pressed", "false");
  });

  it("disposes the previous root before mounting the same accessible label", () => {
    expect(previousRootDisposed).toBe(true);
    render(() => <ToggleButton aria-label="Pin">Pin</ToggleButton>);
    expect(screen.getByRole("button", { name: "Pin" })).toHaveAttribute("aria-pressed", "false");
  });

  it("forwards standalone id and uncontrolled selection through the styled wrapper", async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(() => (
      <ToggleButton id="pin-toggle" defaultSelected onChange={onChange}>
        Pin
      </ToggleButton>
    ));

    const button = screen.getByRole("button", { name: "Pin" });
    expect(button).toHaveAttribute("id", "pin-toggle");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button.querySelector('[data-rsp-slot="text"]')).not.toBeNull();

    await user.click(button);

    expect(onChange).toHaveBeenCalledWith(false);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange once then onPress once through the styled button", async () => {
    const user = setupUser();
    const order: string[] = [];
    const onChange = vi.fn(() => {
      order.push("onChange");
    });
    const onPress = vi.fn(() => {
      order.push("onPress");
    });
    render(() => (
      <ToggleButton onChange={onChange} onPress={onPress}>
        Pin
      </ToggleButton>
    ));
    const button = screen.getByRole("button", { name: "Pin" });

    await user.keyboard("{Shift>}");
    await user.click(button);
    await user.keyboard("{/Shift}");
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onPress).toHaveBeenCalledTimes(3);
    expect(order).toEqual(["onChange", "onPress", "onChange", "onPress", "onChange", "onPress"]);
    expect(onPress).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ shiftKey: true, target: button }),
    );
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("does not press a disabled styled toggle", async () => {
    const user = setupUser();
    const onChange = vi.fn();
    const onPress = vi.fn();
    render(() => (
      <ToggleButton isDisabled onChange={onChange} onPress={onPress}>
        Pin
      </ToggleButton>
    ));
    await user.click(screen.getByRole("button", { name: "Pin" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it("supports S2 visual props, icon context, and disabled selection state", () => {
    render(() => (
      <ToggleButton
        aria-label="Close"
        size="XL"
        staticColor="white"
        isQuiet
        isEmphasized
        isDisabled
        isSelected
      >
        <BellIcon />
      </ToggleButton>
    ));

    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).not.toHaveAttribute("data-size");
    expect(button).not.toHaveAttribute("data-static-color");
    expect(button).not.toHaveAttribute("data-quiet");
    expect(button).not.toHaveAttribute("data-emphasized");
    expect(button.querySelector('[data-slot="icon"]')).not.toBeNull();
  });

  it("updates mixed text children reactively without recreating the button", () => {
    let setCount!: (value: number) => void;
    render(() => {
      const [count, updateCount] = createSignal(0);
      setCount = updateCount;
      return <ToggleButton>count: {count()}</ToggleButton>;
    });

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("count: 0");
    setCount(1);
    flush();
    expect(screen.getByRole("button")).toBe(button);
    expect(button).toHaveTextContent("count: 1");
  });
});
