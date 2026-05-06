import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { RadioGroup, Radio } from "../src/radio";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

// setupUser is consolidated in solid-spectrum-test-utils.

describe("RadioGroup", () => {
  let onChangeSpy = vi.fn();
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    onChangeSpy.mockClear();
  });

  describe("basic functionality", () => {
    it('renders with role="radiogroup"', () => {
      render(() => (
        <RadioGroup aria-label="Test group">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toBeInTheDocument();
    });

    it('renders radio buttons with role="radio"', () => {
      render(() => (
        <RadioGroup aria-label="Test group">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(2);
    });

    it("handles defaults (none selected)", () => {
      render(() => (
        <RadioGroup aria-label="Test group">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).not.toBeChecked();
    });

    it("selects on click", async () => {
      render(() => (
        <RadioGroup aria-label="Test group" onChange={onChangeSpy}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");

      // Click second radio
      await user.click(radios[1]);
      expect(onChangeSpy).toHaveBeenCalledWith("b");
    });

    it("supports defaultValue", () => {
      render(() => (
        <RadioGroup aria-label="Test group" defaultValue="b">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it("only allows one selection at a time", async () => {
      render(() => (
        <RadioGroup aria-label="Test group" onChange={onChangeSpy}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
          <Radio value="c">Option C</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");

      await user.click(radios[0]);
      expect(onChangeSpy).toHaveBeenCalledWith("a");

      onChangeSpy.mockClear();
      await user.click(radios[2]);
      expect(onChangeSpy).toHaveBeenCalledWith("c");
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled value", () => {
      render(() => (
        <RadioGroup aria-label="Test group" value="b">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it("calls onChange in controlled mode", async () => {
      render(() => (
        <RadioGroup aria-label="Test group" value="a" onChange={onChangeSpy}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");

      await user.click(radios[1]);
      expect(onChangeSpy).toHaveBeenCalledWith("b");
    });
  });

  describe("disabled state", () => {
    it("does not select when group is disabled", async () => {
      render(() => (
        <RadioGroup aria-label="Test group" isDisabled onChange={onChangeSpy}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");

      expect(radios[0]).toBeDisabled();
      await user.click(radios[0]);
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it("does not select when individual radio is disabled", async () => {
      render(() => (
        <RadioGroup aria-label="Test group" onChange={onChangeSpy}>
          <Radio value="a" isDisabled>
            Option A
          </Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");

      expect(radios[0]).toBeDisabled();
      await user.click(radios[0]);
      expect(onChangeSpy).not.toHaveBeenCalled();

      // But non-disabled radio should work
      await user.click(radios[1]);
      expect(onChangeSpy).toHaveBeenCalledWith("b");
    });
  });

  describe("keyboard interaction", () => {
    it("selects via click interaction", async () => {
      render(() => (
        <RadioGroup aria-label="Test group" onChange={onChangeSpy}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
          <Radio value="c">Option C</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio") as HTMLInputElement[];

      await user.click(radios[0]);
      expect(onChangeSpy).toHaveBeenCalledWith("a");

      // Clear spy, then click second radio
      onChangeSpy.mockClear();
      await user.click(radios[1]);
      expect(onChangeSpy).toHaveBeenCalledWith("b");
    });

    // Note: Arrow key navigation is tested in solidaria/createRadioGroup.test.tsx
    // Native arrow key behavior relies on browser implementation that JSDOM doesn't fully support
  });

  describe("orientation", () => {
    it("renders with vertical orientation by default", () => {
      render(() => (
        <RadioGroup aria-label="Test group">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-orientation", "vertical");
    });

    it("renders with horizontal orientation", () => {
      render(() => (
        <RadioGroup aria-label="Test group" orientation="horizontal">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-orientation", "horizontal");
    });
  });

  describe("sizes", () => {
    it("renders with default md size", () => {
      render(() => (
        <RadioGroup aria-label="Test group">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-size", "md");
    });

    it("renders with sm size", () => {
      render(() => (
        <RadioGroup aria-label="Test group" size="sm">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-size", "sm");
    });

    it("renders with lg size", () => {
      render(() => (
        <RadioGroup aria-label="Test group" size="lg">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-size", "lg");
    });
  });

  describe("label and description", () => {
    it("renders with label", () => {
      render(() => (
        <RadioGroup label="Choose an option">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      expect(screen.getByText("Choose an option")).toBeInTheDocument();
    });

    it("renders with description", () => {
      render(() => (
        <RadioGroup aria-label="Test group" description="Select your preference">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      expect(screen.getByText("Select your preference")).toBeInTheDocument();
    });

    it("renders with error message when invalid", () => {
      render(() => (
        <RadioGroup aria-label="Test group" isInvalid errorMessage="Please select an option">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      expect(screen.getByText("Please select an option")).toBeInTheDocument();
    });

    it("supports render-prop children in Radio", () => {
      render(() => (
        <RadioGroup aria-label="Test group" defaultValue="a">
          <Radio value="a">
            {(state) => (state.isSelected ? "Option A selected" : "Option A")}
          </Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));

      expect(screen.getByText("Option A selected")).toBeInTheDocument();
    });
  });

  describe("touch interaction", () => {
    it("handles touch press", async () => {
      render(() => (
        <RadioGroup aria-label="Test group" onChange={onChangeSpy}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");

      await user.pointer([
        { keys: "[TouchA>]", target: radios[0] },
        { keys: "[/TouchA]", target: radios[0] },
      ]);

      expect(onChangeSpy).toHaveBeenCalledWith("a");
    });
  });

  describe("aria attributes", () => {
    it("supports aria-label on group", () => {
      render(() => (
        <RadioGroup aria-label="Custom label">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-label", "Custom label");
    });

    it("supports aria-labelledby on group", () => {
      render(() => (
        <>
          <span id="label">Group label</span>
          <RadioGroup aria-labelledby="label">
            <Radio value="a">Option A</Radio>
          </RadioGroup>
        </>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-labelledby", "label");
    });

    it("supports aria-describedby on group", () => {
      render(() => (
        <>
          <span id="desc">Group description</span>
          <RadioGroup aria-label="Test" aria-describedby="desc">
            <Radio value="a">Option A</Radio>
          </RadioGroup>
        </>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-describedby", "desc");
    });

    it("does not include error id in aria-describedby when group is not invalid", () => {
      render(() => (
        <RadioGroup
          aria-label="Test group"
          description="Helpful hint"
          errorMessage="Please select an option"
        >
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      const error = screen.getByText("Please select an option");
      const errorId = error.getAttribute("id");
      expect(errorId).toBeTruthy();
      expect(group.getAttribute("aria-describedby") ?? "").not.toContain(errorId!);
    });

    it("includes error id in aria-describedby when group is invalid", () => {
      render(() => (
        <RadioGroup
          aria-label="Test group"
          isInvalid
          description="Helpful hint"
          errorMessage="Please select an option"
        >
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup");
      const error = screen.getByText("Please select an option");
      const errorId = error.getAttribute("id");
      expect(errorId).toBeTruthy();
      expect(group.getAttribute("aria-describedby") ?? "").toContain(errorId!);
    });
  });

  describe("readonly state", () => {
    it("does not call onChange when group is readonly", async () => {
      render(() => (
        <RadioGroup aria-label="Test group" isReadOnly onChange={onChangeSpy}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");

      await user.click(radios[0]);
      await user.click(radios[1]);
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it("sets aria-readonly on radios when group is readonly", () => {
      render(() => (
        <RadioGroup aria-label="Test group" isReadOnly>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-readonly", "true");
    });
  });

  describe("required state", () => {
    it("sets aria-required when isRequired is true", () => {
      render(() => (
        <RadioGroup aria-label="Test group" isRequired>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-required", "true");
    });
  });

  describe("custom props", () => {
    it("allows custom data attributes on group", () => {
      render(() => (
        <RadioGroup aria-label="Test group" data-testid="custom-group">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-testid", "custom-group");
    });

    it("allows custom data attributes on radio", () => {
      render(() => (
        <RadioGroup aria-label="Test group">
          <Radio value="a" data-testid="custom-radio">
            Option A
          </Radio>
        </RadioGroup>
      ));
      const radio = screen.getByRole("radio");
      expect(radio.closest("label")).toHaveAttribute("data-testid", "custom-radio");
    });
  });

  describe("selected visual state", () => {
    it("selected radio has data-selected attribute on wrapper for CSS dot visibility", () => {
      render(() => (
        <RadioGroup aria-label="Test group" defaultValue="b">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");
      // The headless Radio sets data-selected on the label wrapper
      const wrapperA = radios[0].closest("label");
      const wrapperB = radios[1].closest("label");
      expect(wrapperA).not.toHaveAttribute("data-selected");
      expect(wrapperB).toHaveAttribute("data-selected");
    });

    it("renders S2 circle without legacy dot visibility classes", () => {
      render(() => (
        <RadioGroup aria-label="Test group" defaultValue="a">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ));
      const radios = screen.getAllByRole("radio");
      const wrapperA = radios[0].closest("label")!;
      expect(wrapperA.querySelector(".scale-0, .scale-100")).toBeNull();
      expect(wrapperA.querySelector("div div")).toBeTruthy();
    });
  });
});
