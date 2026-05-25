/**
 * @vitest-environment jsdom
 */

import { createSignal } from "solid-js";
import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { useModalProvider } from "@proyecto-viviana/solidaria";
import { Provider, useProvider, useProviderProps } from "../src/provider";
import { Checkbox } from "../src/checkbox";
import { ToggleSwitch } from "../src/switch/ToggleSwitch";
import { ActionButton } from "../src/button/ActionButton";
import { TextField } from "../src/textfield";

describe("Provider parity", () => {
  it("applies scoped wrapper semantics for locale, direction, scale, and color scheme", () => {
    render(() => (
      <Provider locale="ar-SA" colorScheme="dark" scale="large" data-testid="provider">
        <span>content</span>
      </Provider>
    ));

    const provider = screen.getByTestId("provider");
    expect(provider.className).toBeTruthy();
    expect(provider.className).not.toContain("vui-");
    expect(provider).toHaveAttribute("lang", "ar-SA");
    expect(provider).toHaveAttribute("dir", "rtl");
    expect(provider).toHaveAttribute("data-color-scheme", "dark");
  });

  it("nested providers follow ancestor color scheme updates by default", async () => {
    const [colorScheme, setColorScheme] = createSignal<"light" | "dark">("dark");

    render(() => (
      <>
        <button onClick={() => setColorScheme("light")}>Switch</button>
        <Provider colorScheme={colorScheme()} data-testid="outer">
          <Provider data-testid="inner">
            <span>content</span>
          </Provider>
        </Provider>
      </>
    ));

    expect(screen.getByTestId("outer")).toHaveAttribute("data-color-scheme", "dark");
    expect(screen.getByTestId("inner")).toHaveAttribute("data-color-scheme", "dark");

    await setupUser().click(screen.getByRole("button", { name: "Switch" }));

    expect(screen.getByTestId("outer")).toHaveAttribute("data-color-scheme", "light");
    expect(screen.getByTestId("inner")).toHaveAttribute("data-color-scheme", "light");
  });

  it("nested providers can override inherited color scheme explicitly", () => {
    render(() => (
      <Provider colorScheme="dark" data-testid="outer">
        <Provider colorScheme="light" data-testid="inner">
          <span>content</span>
        </Provider>
      </Provider>
    ));

    expect(screen.getByTestId("outer")).toHaveAttribute("data-color-scheme", "dark");
    expect(screen.getByTestId("inner")).toHaveAttribute("data-color-scheme", "light");
  });

  it("exposes provider context and merges inherited props with explicit overrides", () => {
    function Consumer() {
      const provider = useProvider();
      const merged = useProviderProps({
        isDisabled: false,
        validationState: "valid" as const,
      });

      return (
        <div
          data-testid="consumer"
          data-color-scheme={provider.colorScheme}
          data-scale={provider.scale}
          data-locale={provider.locale}
          data-quiet={String(merged.isQuiet)}
          data-disabled={String(merged.isDisabled)}
          data-validation={merged.validationState}
        />
      );
    }

    render(() => (
      <Provider
        colorScheme="dark"
        scale="large"
        locale="en-US"
        isQuiet
        isDisabled
        validationState="invalid"
      >
        <Consumer />
      </Provider>
    ));

    const consumer = screen.getByTestId("consumer");
    expect(consumer).toHaveAttribute("data-color-scheme", "dark");
    expect(consumer).toHaveAttribute("data-scale", "large");
    expect(consumer).toHaveAttribute("data-locale", "en-US");
    expect(consumer).toHaveAttribute("data-quiet", "true");
    expect(consumer).toHaveAttribute("data-disabled", "false");
    expect(consumer).toHaveAttribute("data-validation", "valid");
  });

  it("wraps descendants in a modal provider", () => {
    function Consumer() {
      const { modalProviderProps } = useModalProvider();
      return <div data-testid="consumer" data-hidden={String(modalProviderProps["aria-hidden"])} />;
    }

    render(() => (
      <Provider>
        <Consumer />
      </Provider>
    ));

    expect(screen.getByTestId("consumer")).toHaveAttribute("data-hidden", "undefined");
  });

  it("propagates read only state to descendant styled controls", async () => {
    const user = setupUser();
    const onCheckboxChange = vi.fn();
    const onSwitchChange = vi.fn();

    render(() => (
      <Provider isReadOnly>
        <Checkbox onChange={onCheckboxChange}>Terms</Checkbox>
        <ToggleSwitch onChange={onSwitchChange}>Alerts</ToggleSwitch>
      </Provider>
    ));

    const checkbox = screen.getByLabelText("Terms");
    const switchControl = screen.getByLabelText("Alerts");

    expect(checkbox).toHaveAttribute("aria-readonly", "true");
    expect(switchControl).toHaveAttribute("aria-readonly", "true");

    await user.click(checkbox);
    await user.click(switchControl);

    expect(onCheckboxChange).not.toHaveBeenCalled();
    expect(onSwitchChange).not.toHaveBeenCalled();
  });

  it("propagates disabled and validation state to descendant styled controls", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(() => (
      <Provider isDisabled isRequired validationState="invalid">
        <ActionButton onClick={onPress}>Archive</ActionButton>
        <TextField label="Name" errorMessage="Required field" isDisabled={false} />
      </Provider>
    ));

    const button = screen.getByRole("button", { name: "Archive" });
    await user.click(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(
      screen.getByText("Name").closest("label")?.querySelector('svg[aria-hidden="true"]'),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
  });
});
