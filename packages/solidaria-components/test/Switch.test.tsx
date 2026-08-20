/**
 * Tests for solidaria-components ToggleSwitch
 *
 * These tests verify the headless ToggleSwitch component follows
 * react-aria-components patterns.
 *
 * Note: The component is named ToggleSwitch to avoid conflict with
 * SolidJS's built-in Switch component.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { ToggleSwitch, type ToggleSwitchRenderProps } from "../src/Switch";
import {
  setupUser,
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

describe("ToggleSwitch", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("should render a switch with default class", () => {
      render(() => <ToggleSwitch aria-label="Toggle">Toggle</ToggleSwitch>);
      const checkbox = screen.getByRole("switch");
      const label = checkbox.closest("label");
      expect(label).toHaveClass("solidaria-ToggleSwitch");
    });

    it("should render a switch with custom class", () => {
      render(() => (
        <ToggleSwitch aria-label="Toggle" class="custom-class">
          Toggle
        </ToggleSwitch>
      ));
      const checkbox = screen.getByRole("switch");
      const label = checkbox.closest("label");
      expect(label).toHaveClass("custom-class");
    });

    it("should render children", () => {
      render(() => <ToggleSwitch aria-label="Toggle">Enable feature</ToggleSwitch>);
      expect(screen.getByText("Enable feature")).toBeInTheDocument();
    });

    it('should render with role="switch"', () => {
      render(() => <ToggleSwitch aria-label="Toggle">Toggle</ToggleSwitch>);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeInTheDocument();
    });

    it("should support description and error message", () => {
      render(() => (
        <ToggleSwitch
          aria-label="Toggle"
          isInvalid
          description="Turns the feature on"
          errorMessage="Required"
        >
          Toggle
        </ToggleSwitch>
      ));

      const switchEl = screen.getByRole("switch");
      const describedText = switchEl
        .getAttribute("aria-describedby")!
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" ");
      expect(describedText).toBe("Turns the feature on Required");
    });
  });

  describe("render props", () => {
    it("should support render props for children", async () => {
      render(() => (
        <ToggleSwitch aria-label="Toggle">
          {(props: ToggleSwitchRenderProps) => <span>{props.isSelected ? "On" : "Off"}</span>}
        </ToggleSwitch>
      ));

      expect(screen.getByText("Off")).toBeInTheDocument();

      await user.click(screen.getByRole("switch"));
      expect(screen.getByText("On")).toBeInTheDocument();
    });

    it("should support render props for class", async () => {
      render(() => (
        <ToggleSwitch
          aria-label="Toggle"
          class={(props: ToggleSwitchRenderProps) => (props.isSelected ? "on" : "off")}
        >
          Toggle
        </ToggleSwitch>
      ));

      const label = screen.getByRole("switch").closest("label");
      expect(label).toHaveClass("off");

      await user.click(screen.getByRole("switch"));
      expect(label).toHaveClass("on");
    });

    it("should provide isHovered in render props", async () => {
      render(() => (
        <ToggleSwitch
          aria-label="Toggle"
          class={(props: ToggleSwitchRenderProps) => (props.isHovered ? "hovered" : "not-hovered")}
        >
          Toggle
        </ToggleSwitch>
      ));

      const label = screen.getByRole("switch").closest("label")!;
      expect(label).toHaveClass("not-hovered");

      await user.hover(label);
      expect(label).toHaveClass("hovered");
    });

    it("should provide isFocusVisible in render props", async () => {
      render(() => (
        <ToggleSwitch
          aria-label="Toggle"
          class={(props: ToggleSwitchRenderProps) =>
            props.isFocusVisible ? "focus-visible" : "no-focus"
          }
        >
          Toggle
        </ToggleSwitch>
      ));

      const label = screen.getByRole("switch").closest("label")!;
      expect(label).toHaveClass("no-focus");

      await user.tab();
      expect(label).toHaveClass("focus-visible");
    });
  });

  describe("data attributes", () => {
    it("should set data-selected when selected", async () => {
      render(() => <ToggleSwitch aria-label="Toggle">Toggle</ToggleSwitch>);
      const label = screen.getByRole("switch").closest("label")!;

      expect(label).not.toHaveAttribute("data-selected");

      await user.click(screen.getByRole("switch"));
      expect(label).toHaveAttribute("data-selected");
    });

    it("should set data-hovered when hovered", async () => {
      render(() => <ToggleSwitch aria-label="Toggle">Toggle</ToggleSwitch>);
      const label = screen.getByRole("switch").closest("label")!;

      expect(label).not.toHaveAttribute("data-hovered");

      await user.hover(label);
      expect(label).toHaveAttribute("data-hovered");
    });

    it("should set data-disabled when disabled", () => {
      render(() => (
        <ToggleSwitch aria-label="Toggle" isDisabled>
          Toggle
        </ToggleSwitch>
      ));
      const label = screen.getByRole("switch").closest("label")!;
      expect(label).toHaveAttribute("data-disabled");
    });

    it("should set data-readonly when readonly", () => {
      render(() => (
        <ToggleSwitch aria-label="Toggle" isReadOnly>
          Toggle
        </ToggleSwitch>
      ));
      const label = screen.getByRole("switch").closest("label")!;
      expect(label).toHaveAttribute("data-readonly");
    });

    it("should set data-focus-visible on keyboard focus", async () => {
      render(() => <ToggleSwitch aria-label="Toggle">Toggle</ToggleSwitch>);
      const label = screen.getByRole("switch").closest("label")!;

      expect(label).not.toHaveAttribute("data-focus-visible");

      await user.tab();
      expect(label).toHaveAttribute("data-focus-visible");
    });
  });

  describe("controlled/uncontrolled", () => {
    it("should clear pointer press state after clicking the native input", async () => {
      render(() => (
        <ToggleSwitch
          aria-label="Toggle"
          class={({ isPressed }) => (isPressed ? "pressed" : "released")}
        >
          Toggle
        </ToggleSwitch>
      ));

      const switchEl = screen.getByRole("switch");
      const label = switchEl.closest("label")!;

      await user.click(switchEl);

      await waitFor(() => {
        expect(label).not.toHaveAttribute("data-pressed");
        expect(label).toHaveClass("released");
        expect((switchEl as HTMLInputElement).style.userSelect).toBe("");
      });
    });

    it("should work as uncontrolled with defaultSelected", async () => {
      render(() => (
        <ToggleSwitch aria-label="Toggle" defaultSelected>
          Toggle
        </ToggleSwitch>
      ));

      const switchEl = screen.getByRole("switch");
      const label = switchEl.closest("label")!;
      expect(label).toHaveAttribute("data-selected");

      await user.click(switchEl);
      expect(label).not.toHaveAttribute("data-selected");
    });

    it("should work as controlled with isSelected", () => {
      render(() => (
        <ToggleSwitch aria-label="Toggle" isSelected>
          Toggle
        </ToggleSwitch>
      ));

      const switchEl = screen.getByRole("switch");
      const label = switchEl.closest("label")!;
      expect(label).toHaveAttribute("data-selected");
    });

    it("should call onChange when toggled", async () => {
      const onChange = vi.fn();
      render(() => (
        <ToggleSwitch aria-label="Toggle" onChange={onChange}>
          Toggle
        </ToggleSwitch>
      ));

      await user.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledWith(true);

      await user.click(screen.getByRole("switch"));
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe("disabled state", () => {
    it("should not toggle when disabled", async () => {
      const onChange = vi.fn();
      render(() => (
        <ToggleSwitch aria-label="Toggle" isDisabled onChange={onChange}>
          Toggle
        </ToggleSwitch>
      ));

      await user.click(screen.getByRole("switch"));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should disable the input when disabled", () => {
      render(() => (
        <ToggleSwitch aria-label="Toggle" isDisabled>
          Toggle
        </ToggleSwitch>
      ));
      expect(screen.getByRole("switch")).toBeDisabled();
    });
  });

  describe("readonly state", () => {
    it("should not toggle when readonly", async () => {
      const onChange = vi.fn();
      render(() => (
        <ToggleSwitch aria-label="Toggle" isReadOnly defaultSelected onChange={onChange}>
          Toggle
        </ToggleSwitch>
      ));

      await user.click(screen.getByRole("switch"));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("keyboard interaction", () => {
    // React Aria tests Space key for isPressed state, not for toggle.
    // The actual toggle relies on native browser behavior (tested via click).
    // This matches react-aria-components/test/Switch.test.js pattern.
    it("should show pressed state on Space key", async () => {
      render(() => (
        <ToggleSwitch
          aria-label="Toggle"
          class={({ isPressed }: ToggleSwitchRenderProps) => (isPressed ? "pressed" : "")}
        >
          Toggle
        </ToggleSwitch>
      ));

      const switchEl = screen.getByRole("switch");
      const label = switchEl.closest("label") as HTMLElement;

      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");

      await user.tab();
      await user.keyboard("[Space>]");
      expect(label).toHaveAttribute("data-pressed", "true");
      expect(label).toHaveClass("pressed");

      await user.keyboard("[/Space]");
      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");
    });
  });

  describe("accessibility", () => {
    it("should support aria-label", () => {
      render(() => <ToggleSwitch aria-label="Enable notifications">Toggle</ToggleSwitch>);
      const switchEl = screen.getByRole("switch", { name: "Enable notifications" });
      expect(switchEl).toBeInTheDocument();
    });

    it("should support aria-describedby", () => {
      render(() => (
        <>
          <span id="desc">This enables the feature</span>
          <ToggleSwitch aria-label="Toggle" aria-describedby="desc">
            Toggle
          </ToggleSwitch>
        </>
      ));
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveAttribute("aria-describedby", "desc");
    });

    it("should toggle checked state", async () => {
      render(() => <ToggleSwitch aria-label="Toggle">Toggle</ToggleSwitch>);

      const switchEl = screen.getByRole("switch");
      const label = switchEl.closest("label")!;

      // Initially not selected
      expect(label).not.toHaveAttribute("data-selected");

      await user.click(switchEl);
      // Now selected
      expect(label).toHaveAttribute("data-selected");
    });
  });

  describe("a11y validation", () => {
    it("axe: default", async () => {
      const { container } = render(() => (
        <ToggleSwitch aria-label="Enable feature">Toggle</ToggleSwitch>
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: selected", async () => {
      const { container } = render(() => (
        <ToggleSwitch aria-label="Enable feature" defaultSelected>
          Toggle
        </ToggleSwitch>
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: disabled", async () => {
      const { container } = render(() => (
        <ToggleSwitch aria-label="Enable feature" isDisabled>
          Toggle
        </ToggleSwitch>
      ));
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs", () => {
      render(() => (
        <>
          <span id="switch-desc">Toggles the feature</span>
          <ToggleSwitch aria-label="Enable feature" aria-describedby="switch-desc">
            Toggle
          </ToggleSwitch>
        </>
      ));
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: data-testid forwards", () => {
      render(() => (
        <ToggleSwitch aria-label="Toggle" data-testid="my-switch">
          Toggle
        </ToggleSwitch>
      ));
      const elements = screen.getAllByTestId("my-switch");
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
