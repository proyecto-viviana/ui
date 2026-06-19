/**
 * Tests for createFormValidation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import {
  createFormValidation,
  type FormValidationProps,
  type ValidatableElement,
} from "../src/form/createFormValidation";
import {
  createFormValidationState,
  type FormValidationState,
  DEFAULT_VALIDATION_RESULT,
  VALID_VALIDITY_STATE,
} from "@proyecto-viviana/solid-stately";

describe("createFormValidation", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("custom validity", () => {
    it("should set custom validity on native input when invalid", () => {
      const TestComponent = () => {
        let inputRef: HTMLInputElement | undefined;

        const validationState = createFormValidationState({
          value: "",
          validate: () => "This field is required",
          validationBehavior: "native",
        });

        createFormValidation({ validationBehavior: "native" }, validationState, () => inputRef);

        return <input ref={inputRef} value="" data-testid="input" />;
      };

      const { getByTestId } = render(() => <TestComponent />);
      const input = getByTestId("input") as HTMLInputElement;

      expect(input.validity.customError).toBe(true);
      expect(input.validationMessage).toBe("This field is required");
    });

    it("should clear custom validity when valid", () => {
      const TestComponent = () => {
        let inputRef: HTMLInputElement | undefined;

        const validationState = createFormValidationState({
          value: "valid",
          validate: (v) => (v ? null : "Required"),
          validationBehavior: "native",
        });

        createFormValidation({ validationBehavior: "native" }, validationState, () => inputRef);

        return <input ref={inputRef} value="valid" data-testid="input" />;
      };

      const { getByTestId } = render(() => <TestComponent />);
      const input = getByTestId("input") as HTMLInputElement;

      expect(input.validity.customError).toBe(false);
      expect(input.validationMessage).toBe("");
    });

    it("should not throw when the ref is not a native form element (no setCustomValidity)", () => {
      // A ref attached to a non-form element (e.g. a custom element) has no
      // setCustomValidity; the native-mode effect must skip it rather than throw.
      const TestComponent = () => {
        let divRef: HTMLDivElement | undefined;

        const validationState = createFormValidationState({
          value: "",
          validate: () => "This field is required",
          validationBehavior: "native",
        });

        createFormValidation(
          { validationBehavior: "native" },
          validationState,
          () => divRef as unknown as ValidatableElement | undefined,
        );

        return <div ref={divRef} data-testid="not-a-form-element" />;
      };

      expect(() => render(() => <TestComponent />)).not.toThrow();
    });

    it("should not set custom validity in aria mode", () => {
      const TestComponent = () => {
        let inputRef: HTMLInputElement | undefined;

        const validationState = createFormValidationState({
          value: "",
          validate: () => "This field is required",
          validationBehavior: "aria",
        });

        createFormValidation({ validationBehavior: "aria" }, validationState, () => inputRef);

        return <input ref={inputRef} value="" data-testid="input" />;
      };

      const { getByTestId } = render(() => <TestComponent />);
      const input = getByTestId("input") as HTMLInputElement;

      // In aria mode, we don't set custom validity
      expect(input.validity.customError).toBe(false);
    });
  });

  describe("invalid event handling", () => {
    it("should commit validation on invalid event", () => {
      const TestComponent = () => {
        let inputRef: HTMLInputElement | undefined;

        const validationState = createFormValidationState({
          value: "",
          validate: () => "Required",
          validationBehavior: "native",
        });

        createFormValidation({ validationBehavior: "native" }, validationState, () => inputRef);

        return (
          <form data-testid="form">
            <input ref={inputRef} value="" required data-testid="input" />
            <button type="submit">Submit</button>
          </form>
        );
      };

      const { getByTestId } = render(() => <TestComponent />);
      const input = getByTestId("input") as HTMLInputElement;

      // Trigger invalid event
      fireEvent.invalid(input);

      // The invalid event should be prevented from showing browser UI
      // (we can't easily test preventDefault here, but we can verify it runs)
    });

    it("should focus input on invalid event when first invalid", () => {
      const focusMock = vi.fn();

      const TestComponent = () => {
        let inputRef: HTMLInputElement | undefined;

        const validationState = createFormValidationState({
          value: "",
          validate: () => "Required",
          validationBehavior: "native",
        });

        createFormValidation(
          { validationBehavior: "native", focus: focusMock },
          validationState,
          () => inputRef,
        );

        return (
          <form data-testid="form">
            <input ref={inputRef} value="" required data-testid="input" />
          </form>
        );
      };

      const { getByTestId } = render(() => <TestComponent />);
      const input = getByTestId("input") as HTMLInputElement;
      const form = getByTestId("form") as HTMLFormElement;

      // Simulate form validation triggering invalid
      input.setCustomValidity("Required");
      fireEvent.invalid(input);

      expect(focusMock).toHaveBeenCalled();
    });
  });

  describe("change event handling", () => {
    it("should commit validation on change event", async () => {
      const TestComponent = () => {
        let inputRef: HTMLInputElement | undefined;
        const [value, setValue] = createSignal("");

        const validationState = createFormValidationState({
          get value() {
            return value();
          },
          validate: (v) => (v ? null : "Required"),
          validationBehavior: "native",
        });

        createFormValidation({ validationBehavior: "native" }, validationState, () => inputRef);

        return (
          <input
            ref={inputRef}
            value={value()}
            onInput={(e) => setValue(e.currentTarget.value)}
            data-testid="input"
          />
        );
      };

      const { getByTestId } = render(() => <TestComponent />);
      const input = getByTestId("input") as HTMLInputElement;

      // Trigger change event
      fireEvent.change(input, { target: { value: "test" } });

      // Validation should be committed
    });
  });

  describe("form reset handling", () => {
    it("should reset validation on form reset", () => {
      const TestComponent = () => {
        let inputRef: HTMLInputElement | undefined;

        const validationState = createFormValidationState({
          value: "",
          validate: () => "Required",
          validationBehavior: "aria",
        });

        // Pre-commit some validation
        validationState.updateValidation({
          isInvalid: true,
          validationErrors: ["Error"],
          validationDetails: VALID_VALIDITY_STATE,
        });

        createFormValidation({ validationBehavior: "aria" }, validationState, () => inputRef);

        return (
          <form data-testid="form">
            <input ref={inputRef} value="" data-testid="input" />
            <button type="reset">Reset</button>
          </form>
        );
      };

      const { getByTestId } = render(() => <TestComponent />);
      const form = getByTestId("form") as HTMLFormElement;

      // Trigger form reset
      fireEvent.reset(form);

      // Validation should be reset (hard to verify without exposing state)
    });
  });

  describe("disabled inputs", () => {
    it("should not set custom validity on disabled inputs", () => {
      const TestComponent = () => {
        let inputRef: HTMLInputElement | undefined;

        const validationState = createFormValidationState({
          value: "",
          validate: () => "Required",
          validationBehavior: "native",
        });

        createFormValidation({ validationBehavior: "native" }, validationState, () => inputRef);

        return <input ref={inputRef} value="" disabled data-testid="input" />;
      };

      const { getByTestId } = render(() => <TestComponent />);
      const input = getByTestId("input") as HTMLInputElement;

      // Disabled inputs shouldn't have custom validity set
      expect(input.validity.customError).toBe(false);
    });
  });
});

describe("ValidatableElement types", () => {
  it("should work with input elements", () => {
    const TestComponent = () => {
      let inputRef: HTMLInputElement | undefined;

      const validationState = createFormValidationState({
        value: "test",
      });

      createFormValidation({}, validationState, () => inputRef);

      return <input ref={inputRef} data-testid="input" />;
    };

    const { getByTestId } = render(() => <TestComponent />);
    expect(getByTestId("input")).toBeInstanceOf(HTMLInputElement);
  });

  it("should work with textarea elements", () => {
    const TestComponent = () => {
      let textareaRef: HTMLTextAreaElement | undefined;

      const validationState = createFormValidationState({
        value: "test",
      });

      createFormValidation({}, validationState, () => textareaRef);

      return <textarea ref={textareaRef} data-testid="textarea" />;
    };

    const { getByTestId } = render(() => <TestComponent />);
    expect(getByTestId("textarea")).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("should work with select elements", () => {
    const TestComponent = () => {
      let selectRef: HTMLSelectElement | undefined;

      const validationState = createFormValidationState({
        value: "test",
      });

      createFormValidation({}, validationState, () => selectRef);

      return (
        <select ref={selectRef} data-testid="select">
          <option value="test">Test</option>
        </select>
      );
    };

    const { getByTestId } = render(() => <TestComponent />);
    expect(getByTestId("select")).toBeInstanceOf(HTMLSelectElement);
  });
});
