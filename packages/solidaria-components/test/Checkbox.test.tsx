/**
 * Tests for solidaria-components Checkbox and CheckboxGroup
 *
 * These tests verify the headless Checkbox/CheckboxGroup components follow
 * react-aria-components patterns.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import {
  Checkbox,
  CheckboxContext,
  CheckboxGroup,
  type CheckboxRenderProps,
  type CheckboxGroupRenderProps,
} from "../src/Checkbox";
import { Form } from "../src/Form";
import {
  setupUser,
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

describe("Checkbox", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("should render a checkbox with default class", () => {
      render(() => <Checkbox>Test</Checkbox>);
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label");
      expect(label).toHaveClass("solidaria-Checkbox");
    });

    it("should render a checkbox with custom class", () => {
      render(() => <Checkbox class="custom-class">Test</Checkbox>);
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label");
      expect(label).toHaveClass("custom-class");
    });

    it("should render children", () => {
      render(() => <Checkbox>Accept terms</Checkbox>);
      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("should support checkbox description and error message", () => {
      render(() => (
        <Checkbox isInvalid description="Choose this option" errorMessage="Required">
          Test
        </Checkbox>
      ));

      const checkbox = screen.getByRole("checkbox");
      const describedBy = checkbox.getAttribute("aria-describedby")!.split(" ");
      const describedText = describedBy
        .map((id) => document.getElementById(id)?.textContent)
        .join(" ");
      expect(describedText).toBe("Choose this option Required");
    });

    it("should support checkbox group description and error message", () => {
      render(() => (
        <CheckboxGroup
          aria-label="Options"
          isInvalid
          description="Pick at least one"
          errorMessage="Required"
        >
          <Checkbox value="a">A</Checkbox>
        </CheckboxGroup>
      ));

      const group = screen.getByRole("group");
      const checkbox = screen.getByRole("checkbox");
      const groupText = group
        .getAttribute("aria-describedby")!
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" ");
      const checkboxText = checkbox
        .getAttribute("aria-describedby")!
        .split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" ");

      expect(groupText).toBe("Pick at least one Required");
      expect(checkboxText).toBe("Required Pick at least one");
    });

    it("should support DOM props", () => {
      render(() => <Checkbox data-foo="bar">Test</Checkbox>);
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label")!;

      expect(label).toHaveAttribute("data-foo", "bar");
      expect(checkbox).not.toHaveAttribute("data-foo");
    });

    it("should support custom render function", () => {
      render(() => (
        <Checkbox render={(props) => <label {...props} data-custom="bar" />}>Test</Checkbox>
      ));

      const checkbox = screen.getByRole("checkbox").closest("label");
      expect(checkbox).toHaveAttribute("data-custom", "bar");
    });

    it("should support slot", () => {
      render(() => (
        <CheckboxContext.Provider value={{ slots: { test: { "aria-label": "test" } } }}>
          <Checkbox slot="test">Test</Checkbox>
        </CheckboxContext.Provider>
      ));

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.closest("label")).toHaveAttribute("slot", "test");
      expect(checkbox).toHaveAttribute("aria-label", "test");
    });
  });

  describe("render props", () => {
    it("should support render props for children", async () => {
      render(() => (
        <Checkbox>
          {(props: CheckboxRenderProps) => (
            <span>{props.isSelected ? "Checked" : "Unchecked"}</span>
          )}
        </Checkbox>
      ));

      expect(screen.getByText("Unchecked")).toBeInTheDocument();

      await user.click(screen.getByRole("checkbox"));
      expect(screen.getByText("Checked")).toBeInTheDocument();
    });

    it("should support render props for class", async () => {
      render(() => (
        <Checkbox
          class={(props: CheckboxRenderProps) => (props.isSelected ? "checked" : "unchecked")}
        >
          Test
        </Checkbox>
      ));

      const label = screen.getByRole("checkbox").closest("label");
      expect(label).toHaveClass("unchecked");

      await user.click(screen.getByRole("checkbox"));
      expect(label).toHaveClass("checked");
    });

    it("should provide isHovered in render props", async () => {
      render(() => (
        <Checkbox
          class={(props: CheckboxRenderProps) => (props.isHovered ? "hovered" : "not-hovered")}
        >
          Test
        </Checkbox>
      ));

      const label = screen.getByRole("checkbox").closest("label")!;
      expect(label).toHaveClass("not-hovered");

      await user.hover(label);
      expect(label).toHaveClass("hovered");
    });

    it("should support hover", async () => {
      const hoverStartSpy = vi.fn();
      const hoverChangeSpy = vi.fn();
      const hoverEndSpy = vi.fn();
      render(() => (
        <Checkbox
          class={({ isHovered }) => (isHovered ? "hover" : "")}
          onHoverStart={hoverStartSpy}
          onHoverChange={hoverChangeSpy}
          onHoverEnd={hoverEndSpy}
        >
          Test
        </Checkbox>
      ));
      const label = screen.getByRole("checkbox").closest("label")!;

      expect(label).not.toHaveAttribute("data-hovered");
      expect(label).not.toHaveClass("hover");

      await user.hover(label);
      expect(label).toHaveAttribute("data-hovered");
      expect(label).toHaveClass("hover");
      expect(hoverStartSpy).toHaveBeenCalledTimes(1);
      expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

      await user.unhover(label);
      expect(label).not.toHaveAttribute("data-hovered");
      expect(label).not.toHaveClass("hover");
      expect(hoverEndSpy).toHaveBeenCalledTimes(1);
      expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
    });

    it("should support press state", async () => {
      render(() => (
        <Checkbox class={({ isPressed }) => (isPressed ? "pressed" : "")}>Test</Checkbox>
      ));
      const label = screen.getByRole("checkbox").closest("label")!;

      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");

      fireEvent.pointerDown(label, { pointerType: "mouse", button: 0 });
      expect(label).toHaveAttribute("data-pressed");
      expect(label).toHaveClass("pressed");

      fireEvent.pointerUp(label, { pointerType: "mouse", button: 0 });
      fireEvent.click(label);
      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");
    });

    it("should provide isIndeterminate in render props", () => {
      render(() => (
        <Checkbox isIndeterminate>
          {(props: CheckboxRenderProps) => (
            <span>{props.isIndeterminate ? "Indeterminate" : "Determinate"}</span>
          )}
        </Checkbox>
      ));

      expect(screen.getByText("Indeterminate")).toBeInTheDocument();
    });
  });

  describe("data attributes", () => {
    it("should set data-selected when checked", async () => {
      render(() => <Checkbox>Test</Checkbox>);
      const label = screen.getByRole("checkbox").closest("label")!;

      expect(label).not.toHaveAttribute("data-selected");

      await user.click(screen.getByRole("checkbox"));
      expect(label).toHaveAttribute("data-selected");
    });

    it("should set data-indeterminate when indeterminate", () => {
      render(() => <Checkbox isIndeterminate>Test</Checkbox>);
      const label = screen.getByRole("checkbox").closest("label")!;
      expect(label).toHaveAttribute("data-indeterminate");
    });

    it("should set data-disabled when disabled", () => {
      render(() => <Checkbox isDisabled>Test</Checkbox>);
      const label = screen.getByRole("checkbox").closest("label")!;
      expect(label).toHaveAttribute("data-disabled");
    });

    it("should set data-readonly when readonly", () => {
      render(() => <Checkbox isReadOnly>Test</Checkbox>);
      const label = screen.getByRole("checkbox").closest("label")!;
      expect(label).toHaveAttribute("data-readonly");
    });

    it("should set data-invalid when invalid", () => {
      render(() => <Checkbox isInvalid>Test</Checkbox>);
      const label = screen.getByRole("checkbox").closest("label")!;
      expect(label).toHaveAttribute("data-invalid");
    });

    it("should set data-focus-visible on keyboard focus", async () => {
      render(() => <Checkbox>Test</Checkbox>);
      const label = screen.getByRole("checkbox").closest("label")!;

      expect(label).not.toHaveAttribute("data-focus-visible");

      await user.tab();
      expect(label).toHaveAttribute("data-focus-visible");
    });

    it("should support focus ring", async () => {
      render(() => (
        <Checkbox class={({ isFocusVisible }) => (isFocusVisible ? "focus" : "")}>Test</Checkbox>
      ));
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label")!;

      expect(label).not.toHaveAttribute("data-focus-visible");
      expect(label).not.toHaveClass("focus");

      await user.tab();
      expect(document.activeElement).toBe(checkbox);
      expect(label).toHaveAttribute("data-focus-visible");
      expect(label).toHaveClass("focus");
    });

    it("should support focus events", async () => {
      const onBlur = vi.fn();
      const onFocus = vi.fn();
      const onFocusChange = vi.fn();
      render(() => (
        <>
          <Checkbox onFocus={onFocus} onFocusChange={onFocusChange} onBlur={onBlur}>
            Test
          </Checkbox>
          <button>Steal focus</button>
        </>
      ));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("checkbox"));
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onFocusChange).toHaveBeenLastCalledWith(true);
      expect(onBlur).not.toHaveBeenCalled();

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Steal focus" }));
      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(onFocusChange).toHaveBeenLastCalledWith(false);
    });
  });

  describe("controlled/uncontrolled", () => {
    it("should work as uncontrolled with defaultSelected", async () => {
      render(() => <Checkbox defaultSelected>Test</Checkbox>);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should work as controlled with isSelected", () => {
      render(() => <Checkbox isSelected>Test</Checkbox>);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should call onChange when clicked", async () => {
      const onChange = vi.fn();
      render(() => <Checkbox onChange={onChange}>Test</Checkbox>);

      await user.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith(true);

      await user.click(screen.getByRole("checkbox"));
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("should support selected state", async () => {
      const onChange = vi.fn();
      render(() => (
        <Checkbox onChange={onChange} class={({ isSelected }) => (isSelected ? "selected" : "")}>
          Test
        </Checkbox>
      ));
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label")!;

      expect(checkbox).not.toBeChecked();
      expect(label).not.toHaveAttribute("data-selected");
      expect(label).not.toHaveClass("selected");

      await user.click(checkbox);
      expect(onChange).toHaveBeenLastCalledWith(true);
      expect(checkbox).toBeChecked();
      expect(label).toHaveAttribute("data-selected");
      expect(label).toHaveClass("selected");
    });
  });

  describe("disabled state", () => {
    it("should not toggle when disabled", async () => {
      const onChange = vi.fn();
      render(() => (
        <Checkbox isDisabled onChange={onChange}>
          Test
        </Checkbox>
      ));

      await user.click(screen.getByRole("checkbox"));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should support disabled state", () => {
      render(() => (
        <Checkbox isDisabled class={({ isDisabled }) => (isDisabled ? "disabled" : "")}>
          Test
        </Checkbox>
      ));
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label")!;

      expect(checkbox).toBeDisabled();
      expect(label).toHaveAttribute("data-disabled");
      expect(label).toHaveClass("disabled");
    });
  });

  describe("readonly state", () => {
    it("should not toggle when readonly", async () => {
      const onChange = vi.fn();
      render(() => (
        <Checkbox isReadOnly defaultSelected onChange={onChange}>
          Test
        </Checkbox>
      ));

      await user.click(screen.getByRole("checkbox"));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should support read only state", () => {
      render(() => (
        <Checkbox isReadOnly class={({ isReadOnly }) => (isReadOnly ? "readonly" : "")}>
          Test
        </Checkbox>
      ));
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label")!;

      expect(checkbox).toHaveAttribute("aria-readonly", "true");
      expect(label).toHaveAttribute("data-readonly");
      expect(label).toHaveClass("readonly");
    });
  });

  describe("keyboard interaction", () => {
    // React Aria tests Space key for isPressed state, not for toggle.
    // The actual toggle relies on native browser behavior (tested via click).
    // This matches react-aria-components/test/Checkbox.test.js pattern.
    it("should show pressed state on Space key", async () => {
      render(() => (
        <Checkbox class={({ isPressed }: CheckboxRenderProps) => (isPressed ? "pressed" : "")}>
          Test
        </Checkbox>
      ));

      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label") as HTMLElement;

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

    it("should support press state with keyboard", async () => {
      const onPress = vi.fn();
      render(() => (
        <Checkbox onPress={onPress} class={({ isPressed }) => (isPressed ? "pressed" : "")}>
          Test
        </Checkbox>
      ));
      const label = screen.getByRole("checkbox").closest("label")!;

      await user.tab();
      await user.keyboard("[Space>]");
      expect(label).toHaveAttribute("data-pressed");
      expect(label).toHaveClass("pressed");

      await user.keyboard("[/Space]");
      expect(label).not.toHaveAttribute("data-pressed");
      expect(label).not.toHaveClass("pressed");
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("should support indeterminate state", () => {
      render(() => (
        <Checkbox
          isIndeterminate
          class={({ isIndeterminate }) => (isIndeterminate ? "indeterminate" : "")}
        >
          Test
        </Checkbox>
      ));
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      const label = checkbox.closest("label")!;

      expect(checkbox.indeterminate).toBe(true);
      expect(label).toHaveAttribute("data-indeterminate");
      expect(label).toHaveClass("indeterminate");
    });

    it("should support invalid state", () => {
      render(() => (
        <Checkbox isInvalid class={({ isInvalid }) => (isInvalid ? "invalid" : "")}>
          Test
        </Checkbox>
      ));
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label")!;

      expect(checkbox).toHaveAttribute("aria-invalid", "true");
      expect(label).toHaveAttribute("data-invalid");
      expect(label).toHaveClass("invalid");
    });

    it("should support required state", () => {
      render(() => (
        <Checkbox
          isRequired
          validationBehavior="native"
          class={({ isRequired }) => (isRequired ? "required" : "")}
        >
          Test
        </Checkbox>
      ));
      const checkbox = screen.getByRole("checkbox");
      const label = checkbox.closest("label")!;

      expect(checkbox).toHaveAttribute("required");
      expect(label).toHaveAttribute("data-required");
      expect(label).toHaveClass("required");
    });

    it("should default required state to native validation", () => {
      render(() => <Checkbox isRequired>Test</Checkbox>);
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).toHaveAttribute("required");
      expect(checkbox).not.toHaveAttribute("aria-required");
    });

    it("should inherit Form validation behavior", () => {
      render(() => (
        <Form validationBehavior="aria">
          <Checkbox isRequired>Test</Checkbox>
        </Form>
      ));
      const checkbox = screen.getByRole("checkbox");

      expect(checkbox).not.toHaveAttribute("required");
      expect(checkbox).toHaveAttribute("aria-required", "true");
    });

    it("should support render props", async () => {
      render(() => (
        <Checkbox>{({ isSelected }) => (isSelected ? "Selected" : "Not Selected")}</Checkbox>
      ));
      const label = screen.getByRole("checkbox").closest("label")!;

      expect(label).toHaveTextContent("Not Selected");
      await user.click(label);
      expect(label).toHaveTextContent("Selected");
    });

    it("should support form prop", () => {
      render(() => <Checkbox form="test">Test</Checkbox>);
      expect(screen.getByRole("checkbox")).toHaveAttribute("form", "test");
    });

    it("should support refs", () => {
      let ref: HTMLLabelElement | undefined;
      render(() => (
        <Checkbox
          ref={(el) => {
            ref = el;
          }}
        >
          Test
        </Checkbox>
      ));

      expect(ref).toBe(screen.getByRole("checkbox").closest(".solidaria-Checkbox"));
    });

    it("should support input ref", () => {
      let inputRef: HTMLInputElement | undefined;
      render(() => (
        <Checkbox
          inputRef={(el) => {
            inputRef = el;
          }}
        >
          Test
        </Checkbox>
      ));

      expect(inputRef).toBe(screen.getByRole("checkbox"));
    });

    it("should support and merge input ref on context", () => {
      let inputRef: HTMLInputElement | undefined;
      let contextInputRef: HTMLInputElement | undefined;
      render(() => (
        <CheckboxContext.Provider
          value={{
            inputRef: (el) => {
              contextInputRef = el;
            },
          }}
        >
          <Checkbox
            inputRef={(el) => {
              inputRef = el;
            }}
          >
            Test
          </Checkbox>
        </CheckboxContext.Provider>
      ));

      expect(inputRef).toBe(screen.getByRole("checkbox"));
      expect(contextInputRef).toBe(screen.getByRole("checkbox"));
    });

    it("should not trigger onBlur/onFocus on sequential presses", async () => {
      const onBlur = vi.fn();
      const onFocus = vi.fn();
      render(() => (
        <Checkbox onFocus={onFocus} onBlur={onBlur}>
          Test
        </Checkbox>
      ));

      const label = screen.getByRole("checkbox").closest("label")!;

      await user.click(label);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).not.toHaveBeenCalled();

      onFocus.mockClear();

      await user.click(label);
      expect(onFocus).not.toHaveBeenCalled();
      expect(onBlur).not.toHaveBeenCalled();
    });
  });
});

describe("CheckboxGroup", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("should render a checkbox group with default class", () => {
      render(() => (
        <CheckboxGroup aria-label="Options">
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));

      const group = screen.getByRole("group");
      expect(group).toHaveClass("solidaria-CheckboxGroup");
    });

    it("should render children checkboxes", () => {
      render(() => (
        <CheckboxGroup aria-label="Options">
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));

      expect(screen.getByText("Option A")).toBeInTheDocument();
      expect(screen.getByText("Option B")).toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("should select multiple checkboxes", async () => {
      render(() => (
        <CheckboxGroup aria-label="Options">
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));

      const checkboxes = screen.getAllByRole("checkbox");

      await user.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();

      await user.click(checkboxes[1]);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });

    it("should support controlled value", () => {
      render(() => (
        <CheckboxGroup aria-label="Options" value={["a"]}>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it("should support defaultValue", async () => {
      render(() => (
        <CheckboxGroup aria-label="Options" defaultValue={["b"]}>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });

    it("should call onChange with updated values", async () => {
      const onChange = vi.fn();
      render(() => (
        <CheckboxGroup aria-label="Options" onChange={onChange}>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));

      const checkboxes = screen.getAllByRole("checkbox");

      await user.click(checkboxes[0]);
      expect(onChange).toHaveBeenCalledWith(["a"]);

      await user.click(checkboxes[1]);
      expect(onChange).toHaveBeenCalledWith(["a", "b"]);

      await user.click(checkboxes[0]);
      expect(onChange).toHaveBeenCalledWith(["b"]);
    });
  });

  describe("data attributes", () => {
    it("should set data-disabled on group when disabled", () => {
      render(() => (
        <CheckboxGroup aria-label="Options" isDisabled>
          <Checkbox value="a">Option A</Checkbox>
        </CheckboxGroup>
      ));

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("data-disabled");
    });

    it("should set data-readonly on group when readonly", () => {
      render(() => (
        <CheckboxGroup aria-label="Options" isReadOnly>
          <Checkbox value="a">Option A</Checkbox>
        </CheckboxGroup>
      ));

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("data-readonly");
    });

    it("should set data-invalid on group when invalid", () => {
      render(() => (
        <CheckboxGroup aria-label="Options" isInvalid>
          <Checkbox value="a">Option A</Checkbox>
        </CheckboxGroup>
      ));

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("data-invalid");
    });

    it("should default required items to native validation", () => {
      render(() => (
        <CheckboxGroup aria-label="Options" isRequired>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));

      for (const checkbox of screen.getAllByRole("checkbox")) {
        expect(checkbox).toHaveAttribute("required");
        expect(checkbox).not.toHaveAttribute("aria-required");
      }
    });

    it("should inherit Form validation behavior for required items", () => {
      render(() => (
        <Form validationBehavior="aria">
          <CheckboxGroup aria-label="Options" isRequired>
            <Checkbox value="a">Option A</Checkbox>
            <Checkbox value="b">Option B</Checkbox>
          </CheckboxGroup>
        </Form>
      ));

      for (const checkbox of screen.getAllByRole("checkbox")) {
        expect(checkbox).not.toHaveAttribute("required");
        expect(checkbox).toHaveAttribute("aria-required", "true");
      }
    });
  });

  describe("group disabled state", () => {
    it("should disable all checkboxes when group is disabled", async () => {
      const onChange = vi.fn();
      render(() => (
        <CheckboxGroup aria-label="Options" isDisabled onChange={onChange}>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));

      await user.click(screen.getAllByRole("checkbox")[0]);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("render props", () => {
    it("should support render props for children", () => {
      render(() => (
        <CheckboxGroup aria-label="Options" isDisabled>
          {(props: CheckboxGroupRenderProps) => (
            <div data-testid="content">
              {props.isDisabled ? "Disabled Group" : "Enabled Group"}
              <Checkbox value="a">Option A</Checkbox>
            </div>
          )}
        </CheckboxGroup>
      ));

      expect(screen.getByText("Disabled Group")).toBeInTheDocument();
    });

    it("should provide state in render props", () => {
      render(() => (
        <CheckboxGroup aria-label="Options" defaultValue={["a", "b"]}>
          {(props: CheckboxGroupRenderProps) => (
            <div data-testid="content">
              Selected: {props.state.value().join(", ")}
              <Checkbox value="a">Option A</Checkbox>
              <Checkbox value="b">Option B</Checkbox>
            </div>
          )}
        </CheckboxGroup>
      ));

      expect(screen.getByText("Selected: a, b")).toBeInTheDocument();
    });
  });

  describe("a11y validation", () => {
    it("axe: default Checkbox", async () => {
      const { container } = render(() => <Checkbox>Accept terms</Checkbox>);
      await assertNoA11yViolations(container);
    });

    it("axe: checked", async () => {
      const { container } = render(() => <Checkbox defaultSelected>Accept terms</Checkbox>);
      await assertNoA11yViolations(container);
    });

    it("axe: indeterminate", async () => {
      const { container } = render(() => <Checkbox isIndeterminate>Select all</Checkbox>);
      await assertNoA11yViolations(container);
    });

    it("axe: disabled", async () => {
      const { container } = render(() => <Checkbox isDisabled>Disabled option</Checkbox>);
      await assertNoA11yViolations(container);
    });

    it("axe: invalid", async () => {
      const { container } = render(() => <Checkbox isInvalid>Required field</Checkbox>);
      await assertNoA11yViolations(container);
    });

    it("axe: CheckboxGroup", async () => {
      const { container } = render(() => (
        <CheckboxGroup aria-label="Options">
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: CheckboxGroup no dangling refs", () => {
      render(() => (
        <CheckboxGroup aria-label="Options" defaultValue={["a"]}>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      ));
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: data-testid forwards on Checkbox", () => {
      render(() => <Checkbox data-testid="terms-cb">Accept terms</Checkbox>);
      const elements = screen.getAllByTestId("terms-cb");
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
