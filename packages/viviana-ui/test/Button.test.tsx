import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { Button, ButtonContext } from "../src/button";

describe("Button", () => {
  it("updates direct reactive text children", () => {
    let setLabel!: (value: string) => void;

    render(() => {
      const [label, updateLabel] = createSignal("Save");
      setLabel = updateLabel;
      return <Button>{label()}</Button>;
    });

    expect(screen.getByRole("button")).toHaveTextContent("Save");
    setLabel("Saved");
    expect(screen.getByRole("button")).toHaveTextContent("Saved");
  });

  it("owns compound pending props across pointer and keyboard presses", async () => {
    const user = setupUser();
    const warnings: string[] = [];
    const warn = vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
      warnings.push(args.map(String).join(" "));
    });
    const onPress = vi.fn();
    let setBusy!: (value: boolean) => void;

    try {
      render(() => {
        const [busy, updateBusy] = createSignal(false);
        const [confirming] = createSignal(false);
        setBusy = updateBusy;

        return (
          <Button
            isPending={busy() && !confirming()}
            onPress={() => {
              onPress();
              setBusy(true);
            }}
          >
            Save
          </Button>
        );
      });

      const button = screen.getByRole("button", { name: "Save" });
      await user.hover(button);
      await user.click(button);

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(button).toHaveAttribute("data-pending");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toBeDisabled();

      await user.click(button);
      button.focus();
      await user.keyboard("{Enter}");
      expect(onPress).toHaveBeenCalledTimes(1);

      setBusy(false);
      expect(button).not.toHaveAttribute("data-pending");
      expect(button).not.toHaveAttribute("aria-disabled");

      await user.keyboard("{Enter}");
      expect(onPress).toHaveBeenCalledTimes(2);

      expect(warnings).toEqual([]);
    } finally {
      warn.mockRestore();
    }
  });

  it("chains ButtonContext onPress with the local onPress", async () => {
    const user = setupUser();
    const calls: string[] = [];

    render(() => (
      <ButtonContext.Provider value={{ onPress: () => calls.push("ctx") }}>
        <Button onPress={() => calls.push("prop")}>Save</Button>
      </ButtonContext.Provider>
    ));

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(calls).toEqual(["ctx", "prop"]);
  });

  it("fires local onPress once when ButtonContext has no onPress", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(() => (
      <ButtonContext.Provider value={{ size: "XL" }}>
        <Button onPress={onPress}>Save</Button>
      </ButtonContext.Provider>
    ));

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
