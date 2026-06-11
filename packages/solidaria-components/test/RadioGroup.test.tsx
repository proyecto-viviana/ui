/**
 * Tests for solidaria-components RadioGroup and Radio
 *
 * These tests verify the headless RadioGroup/Radio components follow
 * react-aria-components patterns.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@solidjs/testing-library";
import {
  Radio,
  RadioContext,
  RadioGroup,
  RadioGroupContext,
  type RadioRenderProps,
  type RadioGroupRenderProps,
} from "../src/RadioGroup";
import { SelectionIndicator } from "../src/SelectionIndicator";
import { FieldError } from "../src/FieldError";
import { Button } from "../src/Button";
import { Dialog, DialogTrigger } from "../src/Dialog";
import { Modal } from "../src/Modal";
import {
  setupUser,
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

describe("RadioGroup", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("should render a radio group with default class", () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveClass("solidaria-RadioGroup");
    });

    it("should render a radio group with custom class", () => {
      render(() => (
        <RadioGroup aria-label="Options" class="custom-group">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveClass("custom-group");
    });

    it("should render children radios", () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      expect(screen.getByText("Option A")).toBeInTheDocument();
      expect(screen.getByText("Option B")).toBeInTheDocument();
    });

    it("should render radios with default class", () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const radio = screen.getByRole("radio");
      const label = radio.closest("label");
      expect(label).toHaveClass("solidaria-Radio");
    });

    it("should render radios with custom class", () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a" class="custom-radio">
            Option A
          </Radio>
        </RadioGroup>
      ));

      const radio = screen.getByRole("radio");
      const label = radio.closest("label");
      expect(label).toHaveClass("custom-radio");
    });

    it("should support custom render function", () => {
      render(() => (
        <RadioGroup aria-label="Options" render={(props) => <div {...props} data-custom="true" />}>
          <Radio value="a" render={(props) => <label {...props} data-custom="true" />}>
            Option A
          </Radio>
          <Radio value="b" render={(props) => <label {...props} data-custom="true" />}>
            Option B
          </Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-custom", "true");
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio.closest("label")).toHaveAttribute("data-custom", "true");
      }
    });

    it("should support group and radio help text", () => {
      render(() => (
        <RadioGroup aria-label="Options" isInvalid description="Pick one" errorMessage="Required">
          <Radio value="a" description="First option" errorMessage="Radio required">
            Option A
          </Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      const radio = screen.getByRole("radio");
      const groupText = group
        .getAttribute("aria-describedby")!
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" ");
      const radioText = radio
        .getAttribute("aria-describedby")!
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" ");

      expect(groupText).toBe("Pick one Required");
      expect(radioText).toBe("First option Radio required Required Pick one");
    });

    it("should render a radio group with default classes", () => {
      render(() => (
        <RadioGroup aria-label="Test">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("class", "solidaria-RadioGroup");
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio.closest("label")).toHaveAttribute("class", "solidaria-Radio");
      }
    });

    it("should render a radio group with custom classes", () => {
      render(() => (
        <RadioGroup aria-label="Test" class="group">
          <Radio value="a" class="radio">
            A
          </Radio>
          <Radio value="b" class="radio">
            B
          </Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("class", "group");
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio.closest("label")).toHaveAttribute("class", "radio");
      }
    });

    it("should support DOM props", () => {
      render(() => (
        <RadioGroup aria-label="Test" data-foo="bar">
          <Radio value="a" data-test="test">
            A
          </Radio>
          <Radio value="b" data-test="test">
            B
          </Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-foo", "bar");
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio.closest("label")).toHaveAttribute("data-test", "test");
        expect(radio).not.toHaveAttribute("data-test");
      }
    });

    it("should support slot", () => {
      render(() => (
        <RadioGroupContext.Provider value={{ slots: { test: { "aria-label": "test" } } }}>
          <RadioContext.Provider value={{ "data-test": "test" }}>
            <RadioGroup slot="test">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          </RadioContext.Provider>
        </RadioGroupContext.Provider>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("slot", "test");
      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-label", "test");
      for (const radio of screen.getAllByRole("radio")) {
        expect(radio.closest("label")).toHaveAttribute("data-test", "test");
      }
    });
  });

  describe("selection", () => {
    it("should select a radio on click", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio");
      const labelA = radios[0].closest("label")!;
      const labelB = radios[1].closest("label")!;

      expect(labelA).not.toHaveAttribute("data-selected");
      expect(labelB).not.toHaveAttribute("data-selected");

      await user.click(radios[0]);
      expect(labelA).toHaveAttribute("data-selected");
      expect(labelB).not.toHaveAttribute("data-selected");
    });

    it("should only allow one selection", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio");
      const labelA = radios[0].closest("label")!;
      const labelB = radios[1].closest("label")!;

      await user.click(radios[0]);
      expect(labelA).toHaveAttribute("data-selected");
      expect(labelB).not.toHaveAttribute("data-selected");

      await user.click(radios[1]);
      expect(labelA).not.toHaveAttribute("data-selected");
      expect(labelB).toHaveAttribute("data-selected");
    });

    it("should support defaultValue", () => {
      render(() => (
        <RadioGroup aria-label="Options" defaultValue="b">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      // Verify via data attribute that the second radio is selected
      const radios = screen.getAllByRole("radio");
      const labelA = radios[0].closest("label")!;
      const labelB = radios[1].closest("label")!;
      expect(labelA).not.toHaveAttribute("data-selected");
      expect(labelB).toHaveAttribute("data-selected");
    });

    it("should support controlled value", () => {
      render(() => (
        <RadioGroup aria-label="Options" value="a">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      // Verify via data attribute that the first radio is selected
      const radios = screen.getAllByRole("radio");
      const labelA = radios[0].closest("label")!;
      const labelB = radios[1].closest("label")!;
      expect(labelA).toHaveAttribute("data-selected");
      expect(labelB).not.toHaveAttribute("data-selected");
    });

    it("should call onChange when selection changes", async () => {
      const onChange = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options" onChange={onChange}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      await user.click(screen.getAllByRole("radio")[0]);
      expect(onChange).toHaveBeenCalledWith("a");

      await user.click(screen.getAllByRole("radio")[1]);
      expect(onChange).toHaveBeenCalledWith("b");
    });

    it("should work in fully controlled mode with signal", async () => {
      const { createSignal } = await import("solid-js");

      // Create a wrapper component that properly passes the signal value
      // In SolidJS, the value needs to be read inside a reactive context
      function ControlledRadioGroup() {
        const [value, setValue] = createSignal<string | null>(null);

        return (
          <RadioGroup aria-label="Options" value={value()} onChange={(v) => setValue(v)}>
            <Radio value="a">Option A</Radio>
            <Radio value="b">Option B</Radio>
          </RadioGroup>
        );
      }

      render(() => <ControlledRadioGroup />);

      const radios = screen.getAllByRole("radio");
      const labelA = radios[0].closest("label")!;
      const labelB = radios[1].closest("label")!;

      // Initially no selection
      expect(labelA).not.toHaveAttribute("data-selected");
      expect(labelB).not.toHaveAttribute("data-selected");

      // Click first radio
      await user.click(radios[0]);
      expect(labelA).toHaveAttribute("data-selected");
      expect(labelB).not.toHaveAttribute("data-selected");

      // Click second radio
      await user.click(radios[1]);
      expect(labelA).not.toHaveAttribute("data-selected");
      expect(labelB).toHaveAttribute("data-selected");
    });

    it("should render SelectionIndicator only for selected radio", async () => {
      render(() => (
        <RadioGroup aria-label="Options" defaultValue="a">
          <Radio value="a">
            {() => (
              <>
                Option A<SelectionIndicator>Selected</SelectionIndicator>
              </>
            )}
          </Radio>
          <Radio value="b">
            {() => (
              <>
                Option B<SelectionIndicator>Selected</SelectionIndicator>
              </>
            )}
          </Radio>
        </RadioGroup>
      ));

      expect(screen.getAllByText("Selected")).toHaveLength(1);

      const radios = screen.getAllByRole("radio");
      await user.click(radios[1]);

      expect(screen.getAllByText("Selected")).toHaveLength(1);
      expect(radios[1].closest("label")?.textContent).toContain("Selected");
    });
  });

  describe("render props", () => {
    // Note: These tests use render props without nested Radio components
    // because SolidJS's JSX evaluation order can cause context lookup issues
    // when Radio is defined inside a render prop function that's evaluated
    // before the context provider renders.
    it("should support render props for RadioGroup children", () => {
      render(() => (
        <RadioGroup aria-label="Options" isDisabled>
          {(props: RadioGroupRenderProps) => (
            <div data-testid="content">{props.isDisabled ? "Disabled Group" : "Enabled Group"}</div>
          )}
        </RadioGroup>
      ));

      expect(screen.getByText("Disabled Group")).toBeInTheDocument();
    });

    it("should support render props", () => {
      render(() => (
        <RadioGroup aria-label="Options" isRequired>
          {({ isRequired }) => <div data-required={isRequired}>Test</div>}
        </RadioGroup>
      ));

      expect(screen.getByText("Test")).toHaveAttribute("data-required", "true");
    });

    it("should provide state in RadioGroup render props", () => {
      render(() => (
        <RadioGroup aria-label="Options" defaultValue="b">
          {(props: RadioGroupRenderProps) => (
            <div data-testid="content">Selected: {props.state.selectedValue() ?? "none"}</div>
          )}
        </RadioGroup>
      ));

      expect(screen.getByText("Selected: b")).toBeInTheDocument();
    });

    it("should support render props for Radio children", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">
            {(props: RadioRenderProps) => (
              <span>{props.isSelected ? "Selected" : "Not Selected"}</span>
            )}
          </Radio>
        </RadioGroup>
      ));

      expect(screen.getByText("Not Selected")).toBeInTheDocument();

      await user.click(screen.getByRole("radio"));
      expect(screen.getByText("Selected")).toBeInTheDocument();
    });

    it("should support Radio render props", async () => {
      render(() => (
        <RadioGroup aria-label="Options" defaultValue="a">
          <Radio value="a">{({ isSelected }) => (isSelected ? "A (selected)" : "A")}</Radio>
          <Radio value="b">{({ isSelected }) => (isSelected ? "B (selected)" : "B")}</Radio>
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio");
      expect(radios[0].closest("label")).toHaveTextContent("A (selected)");
      expect(radios[1].closest("label")).toHaveTextContent("B");

      await user.click(radios[1]);
      expect(radios[0].closest("label")).toHaveTextContent("A");
      expect(radios[1].closest("label")).toHaveTextContent("B (selected)");
    });

    it("should support render props for Radio class", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio
            value="a"
            class={(props: RadioRenderProps) => (props.isSelected ? "selected" : "unselected")}
          >
            Option A
          </Radio>
        </RadioGroup>
      ));

      const label = screen.getByRole("radio").closest("label");
      expect(label).toHaveClass("unselected");

      await user.click(screen.getByRole("radio"));
      expect(label).toHaveClass("selected");
    });

    it("should provide isHovered in Radio render props", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio
            value="a"
            class={(props: RadioRenderProps) => (props.isHovered ? "hovered" : "not-hovered")}
          >
            Option A
          </Radio>
        </RadioGroup>
      ));

      const label = screen.getByRole("radio").closest("label")!;
      expect(label).toHaveClass("not-hovered");

      await user.hover(label);
      expect(label).toHaveClass("hovered");
    });

    it("should support hover", async () => {
      const hoverStartSpy = vi.fn();
      const hoverChangeSpy = vi.fn();
      const hoverEndSpy = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio
            value="a"
            class={({ isHovered }) => (isHovered ? "hover" : "")}
            onHoverStart={hoverStartSpy}
            onHoverChange={hoverChangeSpy}
            onHoverEnd={hoverEndSpy}
          >
            A
          </Radio>
        </RadioGroup>
      ));
      const label = screen.getByRole("radio").closest("label")!;

      await user.hover(label);
      expect(label).toHaveAttribute("data-hovered");
      expect(label).toHaveClass("hover");
      expect(hoverStartSpy).toHaveBeenCalledTimes(1);
      expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

      await user.unhover(label);
      expect(label).not.toHaveAttribute("data-hovered");
      expect(hoverEndSpy).toHaveBeenCalledTimes(1);
      expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
    });

    it("should support press state", async () => {
      const onPress = vi.fn();
      const onClick = vi.fn();
      const onClickCapture = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio
            value="a"
            class={({ isPressed }) => (isPressed ? "pressed" : "")}
            onClick={onClick}
            onClickCapture={onClickCapture}
            onPress={onPress}
          >
            A
          </Radio>
        </RadioGroup>
      ));
      const label = screen.getByRole("radio").closest("label")!;

      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");

      fireEvent.pointerDown(label, { pointerType: "mouse", button: 0 });
      expect(label).toHaveAttribute("data-pressed");
      expect(label).toHaveClass("pressed");

      fireEvent.pointerUp(label, { pointerType: "mouse", button: 0 });
      fireEvent.click(label);
      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClickCapture).toHaveBeenCalledTimes(1);
    });

    it("should support press state with keyboard", async () => {
      const onPress = vi.fn();
      const onClick = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio
            value="a"
            class={({ isPressed }) => (isPressed ? "pressed" : "")}
            onClick={onClick}
            onPress={onPress}
          >
            A
          </Radio>
        </RadioGroup>
      ));
      const label = screen.getByRole("radio").closest("label")!;

      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");

      await user.tab();
      await user.keyboard("[Space>]");
      expect(label).toHaveAttribute("data-pressed");
      expect(label).toHaveClass("pressed");

      await user.keyboard("[/Space]");
      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("supports help text", () => {
      render(() => (
        <RadioGroup aria-label="Test" isInvalid description="Description" errorMessage="Error">
          <Radio value="a">A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-describedby");
      expect(
        group
          .getAttribute("aria-describedby")!
          .split(" ")
          .map((id) => document.getElementById(id)?.textContent)
          .join(" "),
      ).toBe("Description Error");

      const radio = screen.getByRole("radio");
      expect(radio).toHaveAttribute("aria-describedby");
      expect(
        radio
          .getAttribute("aria-describedby")!
          .split(" ")
          .map((id) => document.getElementById(id)?.textContent)
          .join(" "),
      ).toBe("Error Description");
    });
  });

  describe("data attributes", () => {
    it("should set data-orientation on group", () => {
      render(() => (
        <RadioGroup aria-label="Options" orientation="horizontal">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-orientation", "horizontal");
    });

    it("should default to vertical orientation", () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-orientation", "vertical");
    });

    it("should set data-disabled on group when disabled", () => {
      render(() => (
        <RadioGroup aria-label="Options" isDisabled>
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-disabled");
    });

    it("should set data-readonly on group when readonly", () => {
      render(() => (
        <RadioGroup aria-label="Options" isReadOnly>
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-readonly");
    });

    it("should set data-required on group when required", () => {
      render(() => (
        <RadioGroup aria-label="Options" isRequired>
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-required");
    });

    it("should set data-invalid on group when invalid", () => {
      render(() => (
        <RadioGroup aria-label="Options" isInvalid>
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-invalid");
    });

    it("should set data-selected on radio when selected", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const label = screen.getByRole("radio").closest("label")!;
      expect(label).not.toHaveAttribute("data-selected");

      await user.click(screen.getByRole("radio"));
      expect(label).toHaveAttribute("data-selected");
    });

    it("should set data-disabled on radio when radio is disabled", () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a" isDisabled>
            Option A
          </Radio>
        </RadioGroup>
      ));

      const label = screen.getByRole("radio").closest("label")!;
      expect(label).toHaveAttribute("data-disabled");
    });

    it("should set data-focus-visible on radio on keyboard focus", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      const label = screen.getAllByRole("radio")[0].closest("label")!;
      expect(label).not.toHaveAttribute("data-focus-visible");

      await user.tab();
      expect(label).toHaveAttribute("data-focus-visible");
    });

    it("should support focus ring", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a" class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}>
            A
          </Radio>
          <Radio value="b" class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}>
            B
          </Radio>
        </RadioGroup>
      ));
      const radio = screen.getAllByRole("radio")[0];
      const label = radio.closest("label")!;

      expect(label).not.toHaveAttribute("data-focus-visible");
      expect(label).not.toHaveClass("focus");

      await user.tab();
      expect(document.activeElement).toBe(radio);
      expect(label).toHaveAttribute("data-focus-visible");
      expect(label).toHaveClass("focus");
    });

    it("should support disabled state on radio", () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a" isDisabled class={({ isDisabled }) => (isDisabled ? "disabled" : "")}>
            A
          </Radio>
        </RadioGroup>
      ));
      const radio = screen.getByRole("radio");
      const label = radio.closest("label")!;

      expect(radio).toBeDisabled();
      expect(label).toHaveAttribute("data-disabled");
      expect(label).toHaveClass("disabled");
    });

    it("should support disabled state on group", () => {
      const className = ({ isDisabled }: RadioGroupRenderProps | RadioRenderProps) =>
        isDisabled ? "disabled" : "";
      render(() => (
        <RadioGroup
          aria-label="Options"
          isDisabled
          class={className as (props: RadioGroupRenderProps) => string}
        >
          <Radio value="a" class={className as (props: RadioRenderProps) => string}>
            A
          </Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      const radio = screen.getByRole("radio");
      const label = radio.closest("label")!;

      expect(group).toHaveAttribute("aria-disabled");
      expect(group).toHaveClass("disabled");
      expect(radio).toBeDisabled();
      expect(label).toHaveAttribute("data-disabled");
      expect(label).toHaveClass("disabled");
    });

    it("should support selected state", async () => {
      const onChange = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options" onChange={onChange}>
          <Radio value="a" class={({ isSelected }) => (isSelected ? "selected" : "")}>
            A
          </Radio>
          <Radio value="b" class={({ isSelected }) => (isSelected ? "selected" : "")}>
            B
          </Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");
      const label = radios[0].closest("label")!;

      await user.click(radios[0]);
      expect(onChange).toHaveBeenLastCalledWith("a");
      expect(radios[0]).toBeChecked();
      expect(label).toHaveAttribute("data-selected");
      expect(label).toHaveClass("selected");
    });

    it("should support read only state", () => {
      const className = ({ isReadOnly }: RadioGroupRenderProps | RadioRenderProps) =>
        isReadOnly ? "readonly" : "";
      render(() => (
        <RadioGroup
          aria-label="Options"
          isReadOnly
          class={className as (props: RadioGroupRenderProps) => string}
        >
          <Radio value="a" class={className as (props: RadioRenderProps) => string}>
            A
          </Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-readonly");
      expect(screen.getByRole("radiogroup")).toHaveClass("readonly");
      expect(screen.getByRole("radio").closest("label")).toHaveAttribute("data-readonly");
      expect(screen.getByRole("radio").closest("label")).toHaveClass("readonly");
    });

    it("should support invalid state", () => {
      const className = ({ isInvalid }: RadioGroupRenderProps | RadioRenderProps) =>
        isInvalid ? "invalid" : "";
      render(() => (
        <RadioGroup
          aria-label="Options"
          isInvalid
          class={className as (props: RadioGroupRenderProps) => string}
        >
          <Radio value="a" class={className as (props: RadioRenderProps) => string}>
            A
          </Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("radiogroup")).toHaveClass("invalid");
      expect(screen.getByRole("radio").closest("label")).toHaveAttribute("data-invalid");
      expect(screen.getByRole("radio").closest("label")).toHaveClass("invalid");
    });

    it("should support required state", () => {
      const className = ({ isRequired }: RadioGroupRenderProps | RadioRenderProps) =>
        isRequired ? "required" : "";
      render(() => (
        <RadioGroup
          aria-label="Options"
          isRequired
          class={className as (props: RadioGroupRenderProps) => string}
        >
          <Radio value="a" class={className as (props: RadioRenderProps) => string}>
            A
          </Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true");
      expect(screen.getByRole("radiogroup")).toHaveClass("required");
      expect(screen.getByRole("radio").closest("label")).toHaveAttribute("data-required");
      expect(screen.getByRole("radio").closest("label")).toHaveClass("required");
    });

    it("should support orientation", async () => {
      render(() => (
        <RadioGroup
          aria-label="Options"
          orientation="horizontal"
          class={({ orientation }) => orientation}
        >
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-orientation", "horizontal");
      expect(screen.getByRole("radiogroup")).toHaveClass("horizontal");
    });

    it("should support form prop", () => {
      render(() => (
        <RadioGroup aria-label="Options" form="test">
          <Radio value="a">A</Radio>
        </RadioGroup>
      ));

      expect(screen.getByRole("radio")).toHaveAttribute("form", "test");
    });

    it("should support focus events", async () => {
      const onBlur = vi.fn();
      const onFocus = vi.fn();
      const onFocusChange = vi.fn();
      render(() => (
        <>
          <RadioGroup
            aria-label="Options"
            onBlur={onBlur}
            onFocus={onFocus}
            onFocusChange={onFocusChange}
          >
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
          <button>After</button>
        </>
      ));
      const radios = screen.getAllByRole("radio");

      await user.tab();
      expect(document.activeElement).toBe(radios[0]);
      expect(onBlur).not.toHaveBeenCalled();
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onFocusChange).toHaveBeenCalledTimes(1);
      expect(onFocusChange).toHaveBeenLastCalledWith(true);

      await user.keyboard("[ArrowRight]");
      expect(onBlur).not.toHaveBeenCalled();
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onFocusChange).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onFocusChange).toHaveBeenCalledTimes(2);
      expect(onFocusChange).toHaveBeenLastCalledWith(false);
    });

    it("should support refs", () => {
      let groupRef: HTMLDivElement | undefined;
      let radioRef: HTMLLabelElement | undefined;
      render(() => (
        <RadioGroup
          aria-label="Options"
          ref={(el) => {
            groupRef = el;
          }}
        >
          <Radio
            ref={(el) => {
              radioRef = el;
            }}
            value="a"
          >
            A
          </Radio>
        </RadioGroup>
      ));

      expect(groupRef).toBe(screen.getByRole("radiogroup"));
      expect(radioRef).toBe(screen.getByRole("radio").closest(".solidaria-Radio"));
    });

    it("should support input ref", () => {
      let inputRef: HTMLInputElement | undefined;
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio
            inputRef={(el) => {
              inputRef = el;
            }}
            value="a"
          >
            A
          </Radio>
        </RadioGroup>
      ));

      expect(inputRef).toBe(screen.getByRole("radio"));
    });

    it("should support and merge input ref on context", () => {
      let inputRef: HTMLInputElement | undefined;
      let contextInputRef: HTMLInputElement | undefined;
      render(() => (
        <RadioGroup aria-label="Options">
          <RadioContext.Provider
            value={{
              inputRef: (el) => {
                contextInputRef = el;
              },
            }}
          >
            <Radio
              inputRef={(el) => {
                inputRef = el;
              }}
              value="a"
            >
              A
            </Radio>
          </RadioContext.Provider>
        </RadioGroup>
      ));

      expect(inputRef).toBe(screen.getByRole("radio"));
      expect(contextInputRef).toBe(screen.getByRole("radio"));
    });

    it("should navigate within the group using ArrowRight/Left but skip non-radios", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">
            <object tabIndex={-1}>
              <img alt="" />
            </object>
            <span>A</span>
          </Radio>
          <Radio value="b">B</Radio>
          <Radio value="c">C</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");

      await user.tab();
      expect(document.activeElement).toBe(radios[0]);
      await user.keyboard("[ArrowRight]");
      expect(document.activeElement).toBe(radios[1]);
      await user.keyboard("[ArrowLeft]");
      expect(document.activeElement).toBe(radios[0]);
    });

    it("should not navigate within the group using Tab", async () => {
      render(() => (
        <>
          <RadioGroup aria-label="Options">
            <Radio value="a" class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}>
              A
            </Radio>
            <Radio value="b" class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}>
              B
            </Radio>
            <Radio value="c" class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}>
              C
            </Radio>
          </RadioGroup>
          <button>After</button>
        </>
      ));

      const radios = screen.getAllByRole("radio");
      const labels = radios.map((radio) => radio.closest("label")!);
      const expectNotFocused = (...items: HTMLLabelElement[]) => {
        for (const label of items) {
          expect(label).not.toHaveAttribute("data-focus-visible");
          expect(label).not.toHaveClass("focus");
        }
      };

      expectNotFocused(...labels);

      await user.tab();
      expect(document.activeElement).toBe(radios[0]);
      expect(labels[0]).toHaveAttribute("data-focus-visible");
      expect(labels[0]).toHaveClass("focus");
      expectNotFocused(labels[1], labels[2]);

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
      expectNotFocused(...labels);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(radios[2]);
      expect(labels[2]).toHaveAttribute("data-focus-visible");
      expect(labels[2]).toHaveClass("focus");
      expectNotFocused(labels[0], labels[1]);
    });

    it("should not navigate within the group using Tab in Dialog", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      render(() => (
        <DialogTrigger>
          <Button>Trigger</Button>
          <Modal data-test="modal">
            <Dialog role="alertdialog" data-test="dialog">
              {({ close }) => (
                <>
                  <RadioGroup aria-label="Options">
                    <Radio
                      value="a"
                      class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}
                    >
                      A
                    </Radio>
                    <Radio
                      value="b"
                      class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}
                    >
                      B
                    </Radio>
                    <Radio
                      value="c"
                      class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}
                    >
                      C
                    </Radio>
                  </RadioGroup>
                  <Button onPress={close}>Close</Button>
                </>
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      ));

      await user.click(screen.getByRole("button", { name: "Trigger" }));
      vi.runAllTimers();

      const dialog = screen.getByRole("alertdialog");
      const radios = within(dialog).getAllByRole("radio");
      const labels = radios.map((radio) => radio.closest("label")!);
      const expectNotFocused = (...items: HTMLLabelElement[]) => {
        for (const label of items) {
          expect(label).not.toHaveAttribute("data-focus-visible");
          expect(label).not.toHaveClass("focus");
        }
      };

      await waitFor(() => {
        expect(document.activeElement).toBe(radios[0]);
      });
      expectNotFocused(labels[1], labels[2]);

      await user.tab();
      const close = within(dialog).getByRole("button", { name: "Close" });
      expect(document.activeElement).toBe(close);
      expectNotFocused(...labels);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(radios[2]);
      expect(labels[2]).toHaveAttribute("data-focus-visible");
      expect(labels[2]).toHaveClass("focus");
      expectNotFocused(labels[0], labels[1]);

      vi.useRealTimers();
    });

    it("should not trigger onBlur/onFocus on sequential presses of a Radio", async () => {
      const onBlur = vi.fn();
      const onFocus = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a" onFocus={onFocus} onBlur={onBlur}>
            A
          </Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ));

      const label = screen.getAllByRole("radio")[0].closest("label")!;

      await user.click(label);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).not.toHaveBeenCalled();

      onFocus.mockClear();

      await user.click(label);
      expect(onFocus).not.toHaveBeenCalled();
      expect(onBlur).not.toHaveBeenCalled();
    });

    it("should trigger onBlur when moving focus between different Radio buttons", async () => {
      const onBlurA = vi.fn();
      const onFocusA = vi.fn();
      const onBlurB = vi.fn();
      const onFocusB = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a" onFocus={onFocusA} onBlur={onBlurA}>
            A
          </Radio>
          <Radio value="b" onFocus={onFocusB} onBlur={onBlurB}>
            B
          </Radio>
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio");
      const labelA = radios[0].closest("label")!;
      const labelB = radios[1].closest("label")!;

      await user.click(labelA);
      expect(onFocusA).toHaveBeenCalledTimes(1);
      expect(onBlurA).not.toHaveBeenCalled();

      await user.click(labelB);
      expect(onFocusB).toHaveBeenCalledTimes(1);
      expect(onBlurA).toHaveBeenCalledTimes(1);
      expect(onBlurB).not.toHaveBeenCalled();
    });

    it("should support aria-describedby on a radio", () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a" aria-describedby="test">
            A
          </Radio>
          <Radio value="b" aria-describedby="test">
            B
          </Radio>
        </RadioGroup>
      ));

      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toHaveAttribute("aria-describedby", "test");
      }
    });

    it("should render data- attributes only on the outer Radio element or RadioGroup", () => {
      render(() => (
        <RadioGroup aria-label="Options" data-testid="radio-group">
          <Radio data-testid="radio-a" value="a">
            A
          </Radio>
          <Radio value="b">B</Radio>
          <Radio value="c">C</Radio>
        </RadioGroup>
      ));

      const radio = screen.getAllByTestId("radio-a");
      expect(radio).toHaveLength(1);
      expect(radio[0].nodeName).toBe("LABEL");
      expect(screen.getAllByRole("radiogroup")).toHaveLength(1);
      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-testid", "radio-group");
    });
  });

  describe("disabled state", () => {
    it("should disable all radios when group is disabled", async () => {
      const onChange = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options" isDisabled onChange={onChange}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toBeDisabled();
      expect(radios[1]).toBeDisabled();

      await user.click(radios[0]);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should disable individual radio when isDisabled is set", async () => {
      const onChange = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options" onChange={onChange}>
          <Radio value="a" isDisabled>
            Option A
          </Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toBeDisabled();
      expect(radios[1]).not.toBeDisabled();

      await user.click(radios[0]);
      expect(onChange).not.toHaveBeenCalled();

      await user.click(radios[1]);
      expect(onChange).toHaveBeenCalledWith("b");
    });
  });

  describe("readonly state", () => {
    it("should not allow selection changes when readonly", async () => {
      const onChange = vi.fn();
      render(() => (
        <RadioGroup aria-label="Options" isReadOnly defaultValue="a" onChange={onChange}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio");
      const labelA = radios[0].closest("label")!;
      // Verify selection via data attribute
      expect(labelA).toHaveAttribute("data-selected");

      await user.click(radios[1]);
      expect(onChange).not.toHaveBeenCalled();
      // Should still be selected
      expect(labelA).toHaveAttribute("data-selected");
    });
  });

  describe("keyboard interaction", () => {
    it("should focus on first radio with Tab", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      await user.tab();
      const radios = screen.getAllByRole("radio");
      expect(document.activeElement).toBe(radios[0]);
    });

    // Note: React Aria doesn't test Tab focusing on selected radio.
    // Native radio groups focus the selected radio on Tab, but this is native
    // browser behavior. We test arrow key focus navigation which is the custom behavior.

    it("should navigate with arrow keys", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
          <Radio value="c">Option C</Radio>
        </RadioGroup>
      ));

      await user.tab();
      const radios = screen.getAllByRole("radio");
      expect(document.activeElement).toBe(radios[0]);

      await user.keyboard("{ArrowDown}");
      expect(document.activeElement).toBe(radios[1]);

      await user.keyboard("{ArrowDown}");
      expect(document.activeElement).toBe(radios[2]);

      await user.keyboard("{ArrowUp}");
      expect(document.activeElement).toBe(radios[1]);
    });

    // Note: React Aria doesn't test arrow key selection.
    // Arrow keys selecting radios is native browser behavior.
    // We test focus movement which is the custom behavior we implement.

    it("should wrap around with arrow keys", async () => {
      render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      await user.tab();
      const radios = screen.getAllByRole("radio");

      await user.keyboard("{ArrowUp}");
      expect(document.activeElement).toBe(radios[1]);
    });
  });

  describe("accessibility", () => {
    it("should have proper aria-label", () => {
      render(() => (
        <RadioGroup aria-label="Test Options">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-label", "Test Options");
    });

    it("should set data-required on group when required", () => {
      render(() => (
        <RadioGroup aria-label="Options" isRequired>
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      // Required state is indicated on the group via data attribute
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-required");
    });

    it("should set data-invalid on group when invalid", () => {
      render(() => (
        <RadioGroup aria-label="Options" isInvalid>
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      // Invalid state is indicated on the group via data attribute
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-invalid");
    });

    it("supports validation errors", async () => {
      render(() => (
        <form data-testid="form">
          <RadioGroup isRequired aria-labelledby="radio-label">
            <span id="radio-label">Test</span>
            <Radio value="a">A</Radio>
            <FieldError />
          </RadioGroup>
        </form>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).not.toHaveAttribute("aria-describedby");
      expect(group).not.toHaveAttribute("data-invalid");

      const radios = screen.getAllByRole("radio");
      for (const input of radios) {
        expect(input).toHaveAttribute("required");
        expect(input).not.toHaveAttribute("aria-required");
        expect(input).not.toBeValid();
      }

      screen.getByTestId("form").checkValidity();
      radios[0].dispatchEvent(new Event("invalid", { cancelable: true }));
      await waitFor(() => expect(group).toHaveAttribute("aria-describedby"));
      expect(document.getElementById(group.getAttribute("aria-describedby")!)).toHaveTextContent(
        "Constraints not satisfied",
      );
      expect(group).toHaveAttribute("data-invalid");
      expect(document.activeElement).toBe(radios[0]);

      await user.click(radios[0]);
      for (const input of radios) {
        expect(input).toBeValid();
      }

      expect(group).not.toHaveAttribute("aria-describedby");
      expect(group).not.toHaveAttribute("data-invalid");
    });

    it("supports validation errors when last radio is disabled", async () => {
      render(() => (
        <form data-testid="form">
          <RadioGroup isRequired aria-labelledby="radio-label">
            <span id="radio-label">Test</span>
            <Radio value="a">A</Radio>
            <Radio value="b" isDisabled>
              B
            </Radio>
            <FieldError />
          </RadioGroup>
        </form>
      ));

      const group = screen.getByRole("radiogroup");
      expect(group).not.toHaveAttribute("aria-describedby");
      expect(group).not.toHaveAttribute("data-invalid");

      const radios = screen.getAllByRole("radio");
      for (const input of radios) {
        expect(input).toHaveAttribute("required");
        expect(input).not.toHaveAttribute("aria-required");
      }
      expect(radios[0]).not.toBeValid();

      screen.getByTestId("form").checkValidity();
      radios[0].dispatchEvent(new Event("invalid", { cancelable: true }));
      await waitFor(() => expect(group).toHaveAttribute("aria-describedby"));
      expect(document.getElementById(group.getAttribute("aria-describedby")!)).toHaveTextContent(
        "Constraints not satisfied",
      );
      expect(group).toHaveAttribute("data-invalid");
      expect(document.activeElement).toBe(radios[0]);

      await user.click(radios[0]);
      for (const input of radios) {
        expect(input).toBeValid();
      }

      expect(group).not.toHaveAttribute("aria-describedby");
      expect(group).not.toHaveAttribute("data-invalid");
    });
  });

  describe("Radio outside RadioGroup", () => {
    it("should render nothing when Radio is used outside RadioGroup", () => {
      // Radio renders null when used outside RadioGroup context
      // This is intentional to support HMR/hot reloading during development
      const { container } = render(() => <Radio value="a">Option A</Radio>);

      // Should render nothing (empty container)
      expect(container.querySelector(".solidaria-Radio")).toBeNull();
      expect(screen.queryByRole("radio")).toBeNull();
    });
  });

  describe("a11y validation", () => {
    it("axe: default", async () => {
      const { container } = render(() => (
        <RadioGroup aria-label="Options">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: with selection", async () => {
      const { container } = render(() => (
        <RadioGroup aria-label="Options" defaultValue="a">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: disabled", async () => {
      const { container } = render(() => (
        <RadioGroup aria-label="Options" isDisabled>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: invalid", async () => {
      const { container } = render(() => (
        <RadioGroup aria-label="Options" isInvalid>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs", () => {
      render(() => (
        <RadioGroup aria-label="Options" defaultValue="a">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: id forwards on group", () => {
      render(() => (
        <RadioGroup aria-label="Options" id="my-radio-group">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("id", "my-radio-group");
    });
  });
});
