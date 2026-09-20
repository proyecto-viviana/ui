/**
 * Tests for createRadioGroup, createRadio, and createRadioGroupState
 *
 * These tests are ported from @react-spectrum/radio's Radio.test.js
 * to ensure 1:1 parity with React-Aria's implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { JSX, createRoot } from "solid-js";
import {
  createRadioGroup,
  createRadio,
  createRadioGroupState,
  I18nProvider,
  type RadioGroupState,
  type AriaRadioGroupProps,
  type AriaRadioProps,
} from "../src";

// ============================================
// TEST COMPONENTS
// ============================================

interface RadioProps extends Omit<AriaRadioProps, "value"> {
  value: string;
  children?: JSX.Element;
  radioGroupState: RadioGroupState;
}

function Radio(props: RadioProps) {
  let inputRef: HTMLInputElement | null = null;

  const radio = createRadio(
    () => ({
      value: props.value,
      children: props.children,
      isDisabled: props.isDisabled,
      "aria-label": props["aria-label"],
      autoFocus: props.autoFocus,
    }),
    props.radioGroupState,
    () => inputRef,
  );

  // Use direct bindings for checked and onChange for proper reactivity
  // The inputProps spread can cause issues with SolidJS's reactivity system
  return (
    <label>
      <input
        ref={(el) => (inputRef = el)}
        type="radio"
        name={radio.inputProps.name}
        value={props.value}
        disabled={radio.inputProps.disabled}
        tabIndex={radio.inputProps.tabIndex}
        checked={radio.isSelected()}
        onChange={radio.inputProps.onChange}
      />
      {props.children}
    </label>
  );
}

interface RadioGroupProps extends AriaRadioGroupProps {
  value?: string | null;
  defaultValue?: string | null;
  initialValue?: string | null; // Alias for defaultValue to work around SolidJS prop handling
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  orientation?: "horizontal" | "vertical";
  name?: string;
  children?: (state: RadioGroupState) => JSX.Element;
  "data-testid"?: string;
}

function RadioGroup(props: RadioGroupProps) {
  // Use initialValue as a workaround since defaultValue might be filtered by SolidJS/JSX
  const state = createRadioGroupState(() => ({
    value: props.value,
    defaultValue: props.defaultValue ?? props.initialValue,
    onChange: props.onChange,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
    name: props.name,
    orientation: props.orientation,
  }));

  const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } = createRadioGroup(
    () => ({
      label: props.label,
      "aria-label": props["aria-label"],
      name: props.name,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isRequired: props.isRequired,
      isInvalid: props.isInvalid,
      orientation: props.orientation,
      description: props.description,
      errorMessage: props.errorMessage,
    }),
    state,
  );

  return (
    <div {...radioGroupProps} data-testid={props["data-testid"]}>
      {props.label && <span {...labelProps}>{props.label}</span>}
      {props.children?.(state)}
      {props.description && <div {...descriptionProps}>{props.description}</div>}
      {props.isInvalid && props.errorMessage && (
        <div {...errorMessageProps}>{props.errorMessage}</div>
      )}
    </div>
  );
}

// ============================================
// TESTS
// ============================================

describe("Radio Group", () => {
  let onChangeSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChangeSpy = vi.fn();
  });

  afterEach(() => {
    onChangeSpy.mockClear();
  });

  it("createRadioGroupState works correctly", () => {
    createRoot((dispose) => {
      // Test the state directly
      const state = createRadioGroupState({
        defaultValue: "cats",
      });

      expect(state.selectedValue()).toBe("cats");

      state.setSelectedValue("dogs");
      expect(state.selectedValue()).toBe("dogs");

      dispose();
    });
  });

  it("createRadioGroupState controlled mode works correctly", () => {
    createRoot((dispose) => {
      // Test controlled mode
      const state = createRadioGroupState(() => ({
        value: "dragons",
      }));

      expect(state.selectedValue()).toBe("dragons");

      dispose();
    });
  });

  it("createRadio isSelected works with controlled state", () => {
    createRoot((dispose) => {
      // Test createRadio directly with controlled state
      const state = createRadioGroupState(() => ({
        value: "dragons",
      }));

      let inputRef: HTMLInputElement | null = null;
      const radio = createRadio(
        () => ({ value: "dragons", "aria-label": "Dragons" }),
        state,
        () => inputRef,
      );

      // isSelected should return true for dragons
      expect(radio.isSelected()).toBe(true);

      // checked in inputProps should also be true
      expect(radio.inputProps.checked).toBe(true);

      dispose();
    });
  });

  it("controlled value renders checked correctly", () => {
    // Simplified test with direct rendering
    function SimpleRadioGroup() {
      const state = createRadioGroupState(() => ({
        value: "dragons",
      }));

      return (
        <div>
          <SimpleRadio state={state} value="dogs" />
          <SimpleRadio state={state} value="cats" />
          <SimpleRadio state={state} value="dragons" />
        </div>
      );
    }

    function SimpleRadio(props: { state: RadioGroupState; value: string }) {
      let inputRef: HTMLInputElement | null = null;
      const radio = createRadio(
        () => ({ value: props.value, "aria-label": props.value }),
        props.state,
        () => inputRef,
      );

      return (
        <input
          ref={(el) => (inputRef = el)}
          type="radio"
          checked={radio.isSelected()}
          data-value={props.value}
        />
      );
    }

    render(() => <SimpleRadioGroup />);

    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(3);

    // Dragons should be checked initially
    expect((radios[0] as HTMLInputElement).checked).toBe(false);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
    expect((radios[2] as HTMLInputElement).checked).toBe(true);
  });

  it("controlled value via props renders correctly", () => {
    // Test that passes value through props
    function ControlledGroup(props: { controlledValue: string }) {
      const state = createRadioGroupState(() => ({
        value: props.controlledValue,
      }));

      return (
        <div>
          <SimpleRadio2 state={state} value="dogs" />
          <SimpleRadio2 state={state} value="cats" />
          <SimpleRadio2 state={state} value="dragons" />
        </div>
      );
    }

    function SimpleRadio2(props: { state: RadioGroupState; value: string }) {
      let inputRef: HTMLInputElement | null = null;
      const radio = createRadio(
        () => ({ value: props.value, "aria-label": props.value }),
        props.state,
        () => inputRef,
      );

      return (
        <input
          ref={(el) => (inputRef = el)}
          type="radio"
          checked={radio.isSelected()}
          data-value={props.value}
        />
      );
    }

    render(() => <ControlledGroup controlledValue="dragons" />);

    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(3);

    // Dragons should be checked
    expect((radios[0] as HTMLInputElement).checked).toBe(false);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
    expect((radios[2] as HTMLInputElement).checked).toBe(true);
  });

  it("handles defaults", async () => {
    render(() => (
      <RadioGroup aria-label="favorite pet" onChange={onChangeSpy}>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    const radios = screen.getAllByRole("radio");

    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);

    // All radios should share the same name
    const groupName = radios[0].getAttribute("name");
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute("name", groupName);
    });

    expect((radios[0] as HTMLInputElement).value).toBe("dogs");
    expect((radios[1] as HTMLInputElement).value).toBe("cats");
    expect((radios[2] as HTMLInputElement).value).toBe("dragons");

    // No radio should be checked initially
    expect((radios[0] as HTMLInputElement).checked).toBe(false);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
    expect((radios[2] as HTMLInputElement).checked).toBe(false);

    // Click on dogs
    fireEvent.click(radios[0]);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith("dogs");

    expect((radios[0] as HTMLInputElement).checked).toBe(true);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
    expect((radios[2] as HTMLInputElement).checked).toBe(false);
  });

  it("renders without labels using aria-label", () => {
    render(() => (
      <RadioGroup aria-label="favorite pet">
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs" aria-label="dogs" />
            <Radio radioGroupState={state} value="cats" aria-label="cats" />
            <Radio radioGroupState={state} value="dragons" aria-label="dragons" />
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    const radios = screen.getAllByRole("radio");

    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);

    const groupName = radios[0].getAttribute("name");
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute("name", groupName);
    });
  });

  it("can be given a group name", () => {
    render(() => (
      <RadioGroup aria-label="favorite pet" name="customName">
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute("name", "customName");
    });
  });

  it("can have a single disabled radio", () => {
    render(() => (
      <RadioGroup aria-label="favorite pet" onChange={onChangeSpy}>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats" isDisabled>
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radios = screen.getAllByRole("radio");

    expect(radios[0]).not.toHaveAttribute("disabled");
    expect(radios[1]).toHaveAttribute("disabled");
    expect(radios[2]).not.toHaveAttribute("disabled");

    // Click on disabled radio should not trigger onChange
    fireEvent.click(radios[1]);
    expect(onChangeSpy).not.toHaveBeenCalled();

    // Click on enabled radio should work
    fireEvent.click(radios[0]);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith("dogs");
  });

  it("can be readonly", () => {
    render(() => (
      <RadioGroup aria-label="favorite pet" isReadOnly onChange={onChangeSpy}>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute("aria-readonly", "true");

    const radios = screen.getAllByRole("radio");
    // Individual radios should not have readonly attribute
    radios.forEach((radio) => {
      expect(radio).not.toHaveAttribute("aria-readonly");
    });

    // Clicking should not change value in readonly mode
    fireEvent.click(radios[1]);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it("can have a default value", () => {
    render(() => (
      <RadioGroup aria-label="favorite pet" initialValue="dragons" onChange={onChangeSpy}>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radios = screen.getAllByRole("radio");

    expect(onChangeSpy).not.toHaveBeenCalled();
    expect((radios[0] as HTMLInputElement).checked).toBe(false);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
    expect((radios[2] as HTMLInputElement).checked).toBe(true);

    // Click on dogs
    fireEvent.click(radios[0]);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith("dogs");
    expect((radios[0] as HTMLInputElement).checked).toBe(true);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
    expect((radios[2] as HTMLInputElement).checked).toBe(false);
  });

  it("can be controlled", () => {
    render(() => (
      <RadioGroup aria-label="favorite pet" value="dragons" onChange={onChangeSpy}>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radios = screen.getAllByRole("radio");

    expect(onChangeSpy).not.toHaveBeenCalled();
    expect((radios[0] as HTMLInputElement).checked).toBe(false);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
    expect((radios[2] as HTMLInputElement).checked).toBe(true);

    // Click on dogs - onChange is called but value doesn't change (controlled)
    fireEvent.click(radios[0]);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith("dogs");
    // Value stays the same because it's controlled
    expect((radios[0] as HTMLInputElement).checked).toBe(false);
    expect((radios[1] as HTMLInputElement).checked).toBe(false);
    expect((radios[2] as HTMLInputElement).checked).toBe(true);
  });

  it("supports labeling", () => {
    render(() => (
      <RadioGroup label="Favorite Pet">
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    const labelId = radioGroup.getAttribute("aria-labelledby");
    expect(labelId).toBeDefined();

    const label = document.getElementById(labelId!);
    expect(label).toHaveTextContent("Favorite Pet");
  });

  it("supports aria-label", () => {
    render(() => (
      <RadioGroup aria-label="Favorite Pet">
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute("aria-label", "Favorite Pet");
  });

  it("supports custom props", () => {
    render(() => (
      <RadioGroup aria-label="favorite pet" data-testid="test">
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByTestId("test");
    expect(radioGroup).toBeTruthy();
  });

  it("sets aria-orientation by default", () => {
    render(() => (
      <RadioGroup label="Favorite Pet">
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute("aria-orientation", "vertical");
  });

  it("sets aria-orientation based on the orientation prop", () => {
    render(() => (
      <RadioGroup label="Favorite Pet" orientation="horizontal">
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("sets aria-invalid when isInvalid", () => {
    render(() => (
      <RadioGroup label="Favorite Pet" isInvalid>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute("aria-invalid", "true");
  });

  it("exposes validation metadata from state", () => {
    createRoot((dispose) => {
      const state = createRadioGroupState({ isInvalid: true });
      const aria = createRadioGroup(() => ({ "aria-label": "favorite pet" }), state);

      expect(aria.isInvalid).toBe(true);
      expect(aria.validationErrors).toEqual([]);
      expect(aria.validationDetails.customError).toBe(true);
      expect(aria.validationDetails.valid).toBe(false);

      dispose();
    });
  });

  it("sets aria-required when isRequired is true", () => {
    render(() => (
      <RadioGroup label="Favorite Pet" isRequired>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute("aria-required", "true");

    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio).not.toHaveAttribute("aria-required");
    });
  });

  it("sets aria-disabled when isDisabled is true", () => {
    render(() => (
      <RadioGroup label="Favorite Pet" isDisabled>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute("aria-disabled", "true");
  });

  it("should support help text description", async () => {
    render(() => (
      <RadioGroup label="Favorite Pet" description="Help text">
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const group = screen.getByRole("radiogroup");
    await waitFor(() => {
      const ids = (group.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
      expect(ids.some((id) => document.getElementById(id)?.textContent === "Help text")).toBe(true);
    });
  });

  it("should support error message", async () => {
    render(() => (
      <RadioGroup label="Favorite Pet" errorMessage="Error message" isInvalid>
        {(state) => (
          <>
            <Radio radioGroupState={state} value="dogs">
              Dogs
            </Radio>
            <Radio radioGroupState={state} value="cats">
              Cats
            </Radio>
            <Radio radioGroupState={state} value="dragons">
              Dragons
            </Radio>
          </>
        )}
      </RadioGroup>
    ));

    const group = screen.getByRole("radiogroup");
    await waitFor(() => {
      const ids = (group.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
      expect(ids.some((id) => document.getElementById(id)?.textContent === "Error message")).toBe(
        true,
      );
    });
  });

  describe("keyboard navigation", () => {
    it("moves selection with arrow keys and wraps in LTR", () => {
      render(() => (
        <RadioGroup aria-label="favorite pet" defaultValue="dogs">
          {(state) => (
            <>
              <Radio radioGroupState={state} value="dogs">
                Dogs
              </Radio>
              <Radio radioGroupState={state} value="cats">
                Cats
              </Radio>
              <Radio radioGroupState={state} value="dragons">
                Dragons
              </Radio>
            </>
          )}
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];

      radios[0].focus();
      fireEvent.keyDown(radios[0], { key: "ArrowRight" });
      expect(document.activeElement).toBe(radios[1]);
      expect(radios[1].checked).toBe(true);

      fireEvent.keyDown(radios[1], { key: "ArrowRight" });
      expect(document.activeElement).toBe(radios[2]);
      expect(radios[2].checked).toBe(true);

      // Wrap from last to first.
      fireEvent.keyDown(radios[2], { key: "ArrowRight" });
      expect(document.activeElement).toBe(radios[0]);
      expect(radios[0].checked).toBe(true);
    });

    it("uses RTL-aware horizontal arrow direction", () => {
      render(() => (
        <I18nProvider locale="ar-SA">
          <RadioGroup aria-label="favorite pet" orientation="horizontal" defaultValue="cats">
            {(state) => (
              <>
                <Radio radioGroupState={state} value="dogs">
                  Dogs
                </Radio>
                <Radio radioGroupState={state} value="cats">
                  Cats
                </Radio>
                <Radio radioGroupState={state} value="dragons">
                  Dragons
                </Radio>
              </>
            )}
          </RadioGroup>
        </I18nProvider>
      ));

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];

      // In RTL + horizontal, ArrowRight should move to previous.
      radios[1].focus();
      fireEvent.keyDown(radios[1], { key: "ArrowRight" });
      expect(document.activeElement).toBe(radios[0]);
      expect(radios[0].checked).toBe(true);

      // In RTL + horizontal, ArrowLeft should move to next.
      fireEvent.keyDown(radios[0], { key: "ArrowLeft" });
      expect(document.activeElement).toBe(radios[1]);
      expect(radios[1].checked).toBe(true);
    });

    it("skips disabled radios during arrow navigation", () => {
      render(() => (
        <RadioGroup aria-label="favorite pet" defaultValue="dogs">
          {(state) => (
            <>
              <Radio radioGroupState={state} value="dogs">
                Dogs
              </Radio>
              <Radio radioGroupState={state} value="cats" isDisabled>
                Cats
              </Radio>
              <Radio radioGroupState={state} value="dragons">
                Dragons
              </Radio>
            </>
          )}
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio") as HTMLInputElement[];

      radios[0].focus();
      fireEvent.keyDown(radios[0], { key: "ArrowRight" });

      expect(document.activeElement).toBe(radios[2]);
      expect(radios[2].checked).toBe(true);
      expect(radios[1].checked).toBe(false);
    });
  });

  describe("roving tabIndex", () => {
    it("RadioGroup default roving tabIndex", () => {
      render(() => (
        <RadioGroup aria-label="favorite pet">
          {(state) => (
            <>
              <Radio radioGroupState={state} value="dogs">
                Dogs
              </Radio>
              <Radio radioGroupState={state} value="cats">
                Cats
              </Radio>
              <Radio radioGroupState={state} value="dragons">
                Dragons
              </Radio>
            </>
          )}
        </RadioGroup>
      ));

      const radios = screen.getAllByRole("radio");

      // When no selection, all radios should be focusable (tabIndex=0)
      // This allows focus from either direction
      expect(radios[0]).toHaveAttribute("tabIndex", "0");
      expect(radios[1]).toHaveAttribute("tabIndex", "0");
      expect(radios[2]).toHaveAttribute("tabIndex", "0");

      // Focus the first radio
      radios[0].focus();
      expect(document.activeElement).toBe(radios[0]);

      // Click second radio
      fireEvent.click(radios[1]);
      expect(document.activeElement).toBe(radios[1]);

      // After selection, only selected radio should have tabIndex=0
      expect(radios[0]).toHaveAttribute("tabIndex", "-1");
      expect(radios[1]).toHaveAttribute("tabIndex", "0");
      expect(radios[2]).toHaveAttribute("tabIndex", "-1");
    });
  });
});
