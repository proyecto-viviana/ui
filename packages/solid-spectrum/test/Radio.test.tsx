import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { Form } from "../src/form";
import { RadioGroup, Radio, RadioContext, RadioGroupContext } from "../src/radio";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { hc } from "../../../apps/comparison/src/components/solid/solid-h";

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

    it("keeps controlled value reactive", async () => {
      function Demo() {
        const [value, setValue] = createSignal("a");
        return (
          <RadioGroup aria-label="Test group" value={value()} onChange={setValue}>
            <Radio value="a">Option A</Radio>
            <Radio value="b">Option B</Radio>
            <Radio value="c">Option C</Radio>
          </RadioGroup>
        );
      }

      render(() => <Demo />);

      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toBeChecked();
      await user.click(screen.getByText("Option B"));
      await waitFor(() => expect(radios[1]).toBeChecked());
      expect(radios[0]).not.toBeChecked();
      expect(screen.getAllByRole("radio")[1]).toBe(radios[1]);

      await user.click(screen.getByText("Option C"));
      await waitFor(() => expect(radios[2]).toBeChecked());
      expect(radios[1]).not.toBeChecked();
      expect(screen.getAllByRole("radio")[2]).toBe(radios[2]);
    });

    it("keeps controlled value reactive through comparison h composition", async () => {
      function Demo() {
        const [value, setValue] = createSignal("a");

        return hc(
          "div",
          {
            get "data-value"() {
              return value();
            },
          },
          [
            hc(
              RadioGroup,
              {
                "aria-label": "Test group",
                get value() {
                  return value();
                },
                onChange: setValue,
              },
              [
                hc(Radio, { value: "a" }, ["Option A"]),
                hc(Radio, { value: "b" }, ["Option B"]),
                hc(Radio, { value: "c" }, ["Option C"]),
              ],
            ),
          ],
        );
      }

      render(() => hc(Demo, {}));

      const root = screen.getByRole("radiogroup").closest("[data-value]")!;
      const radios = screen.getAllByRole("radio");

      expect(radios[0]).toBeChecked();
      await user.click(screen.getByText("Option B"));
      expect(root).toHaveAttribute("data-value", "b");
      await waitFor(() => expect(radios[1]).toBeChecked());
      expect(radios[0]).not.toBeChecked();
      expect(screen.getAllByRole("radio")[1]).toBe(radios[1]);

      await user.click(screen.getByText("Option C"));
      expect(root).toHaveAttribute("data-value", "c");
      await waitFor(() => expect(radios[2]).toBeChecked());
      expect(radios[1]).not.toBeChecked();
      expect(screen.getAllByRole("radio")[2]).toBe(radios[2]);
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
    it("renders with default M size", () => {
      render(() => (
        <RadioGroup aria-label="Test group">
          <Radio value="a">Option A</Radio>
        </RadioGroup>
      ));
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("data-size", "M");
    });

    it("renders with S2 and legacy size aliases", () => {
      render(() => (
        <>
          <RadioGroup aria-label="Small group" size="sm">
            <Radio value="a">Option A</Radio>
          </RadioGroup>
          <RadioGroup aria-label="Large group" size="XL">
            <Radio value="b">Option B</Radio>
          </RadioGroup>
        </>
      ));

      expect(screen.getByRole("radiogroup", { name: "Small group" })).toHaveAttribute(
        "data-size",
        "S",
      );
      expect(screen.getByRole("radiogroup", { name: "Large group" })).toHaveAttribute(
        "data-size",
        "XL",
      );
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

    it("renders S2 label placement, necessity label, and contextual help", () => {
      render(() => (
        <RadioGroup
          label="Plan"
          labelPosition="side"
          labelAlign="end"
          necessityIndicator="label"
          isRequired
          contextualHelp={<span>Billing help</span>}
        >
          <Radio value="starter">Starter</Radio>
        </RadioGroup>
      ));

      const group = screen.getByRole("radiogroup", { name: /Plan/ });
      expect(group).toBeInTheDocument();
      expect(screen.getByText("(required)")).toBeInTheDocument();
      expect(screen.getByText("Billing help")).toBeInTheDocument();
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
      expect(screen.queryByText("Please select an option")).not.toBeInTheDocument();
      expect(group.getAttribute("aria-describedby") ?? "").not.toContain("error");
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
      const errorId = error.closest('[role="alert"]')?.getAttribute("id");
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

    it("defaults required radio inputs to native validation", () => {
      render(() => (
        <RadioGroup label="Plans" name="plan" form="checkout" isRequired>
          <Radio value="starter">Starter</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
      ));

      const starter = screen.getByRole("radio", { name: "Starter" });
      expect(starter).toHaveAttribute("name", "plan");
      expect(starter).toHaveAttribute("form", "checkout");
      expect(starter).toHaveAttribute("required");
      expect(starter).not.toHaveAttribute("aria-required");
    });

    it("keeps aria validation required state on the group, not child inputs", () => {
      render(() => (
        <RadioGroup label="Plans" name="plan" isRequired validationBehavior="aria">
          <Radio value="starter">Starter</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
      ));

      const starter = screen.getByRole("radio", { name: "Starter" });
      expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true");
      expect(starter).toHaveAttribute("name", "plan");
      expect(starter).not.toHaveAttribute("required");
      expect(starter).not.toHaveAttribute("aria-required");
    });
  });

  describe("Spectrum context and Form integration", () => {
    it("merges RadioGroupContext props, unsafe style, and refs", () => {
      const ref = vi.fn();

      render(() => (
        <RadioGroupContext.Provider
          value={{
            label: "Context plan",
            defaultValue: "pro",
            name: "plan",
            form: "checkout",
            UNSAFE_className: "context-group",
            UNSAFE_style: { margin: "2px" },
            ref,
          }}
        >
          <RadioGroup>
            <Radio value="starter">Starter</Radio>
            <Radio value="pro">Pro</Radio>
          </RadioGroup>
        </RadioGroupContext.Provider>
      ));

      const group = screen.getByRole("radiogroup", { name: "Context plan" });
      const pro = screen.getByRole("radio", { name: "Pro" });

      expect(group).toHaveClass("context-group");
      expect(group).toHaveStyle({ margin: "2px" });
      expect(ref).toHaveBeenCalledWith(group);
      expect(pro).toBeChecked();
      expect(pro).toHaveAttribute("name", "plan");
      expect(pro).toHaveAttribute("form", "checkout");
    });

    it("merges RadioContext props, unsafe style, and refs", () => {
      const ref = vi.fn();
      const inputRef = vi.fn();

      render(() => (
        <RadioGroup label="Plans">
          <RadioContext.Provider
            value={{
              value: "starter",
              children: "Starter",
              UNSAFE_className: "context-radio",
              UNSAFE_style: { margin: "1px" },
              ref,
              inputRef,
            }}
          >
            <Radio />
          </RadioContext.Provider>
        </RadioGroup>
      ));

      const radio = screen.getByRole("radio", { name: "Starter" }) as HTMLInputElement;
      const root = radio.closest(".context-radio") as HTMLElement;

      expect(root).toHaveClass("context-radio");
      expect(root).toHaveStyle({ margin: "1px" });
      expect(ref).toHaveBeenCalledWith(root);
      expect(inputRef).toHaveBeenCalledWith(radio);
    });

    it("inherits Form props on RadioGroup without forcing required on selected children", () => {
      render(() => (
        <Form isRequired isDisabled necessityIndicator="label" size="XL">
          <RadioGroup label="Plans" defaultValue="starter">
            <Radio value="starter">Starter</Radio>
            <Radio value="pro">Pro</Radio>
          </RadioGroup>
        </Form>
      ));

      const group = screen.getByRole("radiogroup", { name: /Plans/ });
      const starter = screen.getByRole("radio", { name: "Starter" });

      expect(group).toHaveAttribute("data-size", "XL");
      expect(starter).toBeDisabled();
      expect(starter).toBeChecked();
      expect(starter).not.toHaveAttribute("aria-required");
      expect(screen.getByText("(required)")).toBeInTheDocument();
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
