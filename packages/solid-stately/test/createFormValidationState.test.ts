/**
 * Tests for createFormValidationState
 */

import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import {
  createFormValidationState,
  DEFAULT_VALIDATION_RESULT,
  VALID_VALIDITY_STATE,
  mergeValidation,
  FormValidationContext,
  type ValidationResult,
} from "../src/form/createFormValidationState";

describe("createFormValidationState", () => {
  describe("initial state", () => {
    it("should return valid state by default", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test",
        });

        expect(state.realtimeValidation().isInvalid).toBe(false);
        expect(state.displayValidation().isInvalid).toBe(false);
        expect(state.realtimeValidation().validationErrors).toEqual([]);
        expect(state.displayValidation().validationErrors).toEqual([]);

        dispose();
      });
    });

    it("should reflect controlled isInvalid prop", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test",
          isInvalid: true,
        });

        expect(state.realtimeValidation().isInvalid).toBe(true);
        expect(state.displayValidation().isInvalid).toBe(true);

        dispose();
      });
    });

    it("should support deprecated validationState prop", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test",
          validationState: "invalid",
        });

        expect(state.realtimeValidation().isInvalid).toBe(true);
        expect(state.displayValidation().isInvalid).toBe(true);

        dispose();
      });
    });
  });

  describe("client-side validation", () => {
    it("should run custom validate function", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "",
          validate: (value) => {
            if (!value) return "Value is required";
            return null;
          },
        });

        expect(state.realtimeValidation().isInvalid).toBe(true);
        expect(state.realtimeValidation().validationErrors).toEqual(["Value is required"]);

        dispose();
      });
    });

    it("should return valid when validate returns null", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "valid",
          validate: (value) => {
            if (!value) return "Value is required";
            return null;
          },
        });

        expect(state.realtimeValidation().isInvalid).toBe(false);
        expect(state.realtimeValidation().validationErrors).toEqual([]);

        dispose();
      });
    });

    it("should handle validate returning array of errors", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "ab",
          validate: (value) => {
            const errors = [];
            if (value.length < 3) errors.push("Too short");
            if (!/[0-9]/.test(value)) errors.push("Must contain number");
            return errors.length ? errors : null;
          },
        });

        expect(state.realtimeValidation().isInvalid).toBe(true);
        expect(state.realtimeValidation().validationErrors).toEqual([
          "Too short",
          "Must contain number",
        ]);

        dispose();
      });
    });

    it("should handle validate returning boolean true", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test",
          validate: () => true,
        });

        // true is truthy but not an error message
        expect(state.realtimeValidation().isInvalid).toBe(false);
        expect(state.realtimeValidation().validationErrors).toEqual([]);

        dispose();
      });
    });

    it("should skip validation when value is null", () => {
      createRoot((dispose) => {
        const validate = vi.fn(() => "Error");
        const state = createFormValidationState({
          value: null,
          validate,
        });

        expect(validate).not.toHaveBeenCalled();
        expect(state.realtimeValidation().isInvalid).toBe(false);

        dispose();
      });
    });
  });

  describe("builtin validation", () => {
    it("should use builtin validation when provided", () => {
      createRoot((dispose) => {
        const builtinValidation: ValidationResult = {
          isInvalid: true,
          validationErrors: ["This field is required"],
          validationDetails: {
            ...VALID_VALIDITY_STATE,
            valueMissing: true,
            valid: false,
          },
        };

        const state = createFormValidationState({
          value: "",
          builtinValidation,
        });

        expect(state.realtimeValidation().isInvalid).toBe(true);
        expect(state.realtimeValidation().validationErrors).toEqual(["This field is required"]);
        expect(state.realtimeValidation().validationDetails.valueMissing).toBe(true);

        dispose();
      });
    });

    it("should ignore valid builtin validation", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test",
          builtinValidation: {
            isInvalid: false,
            validationErrors: [],
            validationDetails: VALID_VALIDITY_STATE,
          },
        });

        expect(state.realtimeValidation().isInvalid).toBe(false);

        dispose();
      });
    });
  });

  describe("validation behavior", () => {
    it("should show errors in realtime for aria behavior", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "",
          validationBehavior: "aria",
          validate: (v) => (v ? null : "Required"),
        });

        expect(state.displayValidation().isInvalid).toBe(true);
        expect(state.displayValidation().validationErrors).toEqual(["Required"]);

        dispose();
      });
    });

    it("should not show errors until commit for native behavior", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal("");

        const state = createFormValidationState({
          get value() {
            return value();
          },
          validationBehavior: "native",
          validate: (v) => (v ? null : "Required"),
        });

        // Realtime shows the error
        expect(state.realtimeValidation().isInvalid).toBe(true);
        // Display doesn't show it yet
        expect(state.displayValidation().isInvalid).toBe(false);

        dispose();
      });
    });
  });

  describe("updateValidation", () => {
    it("should update current validity in aria mode", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test",
          validationBehavior: "aria",
        });

        expect(state.displayValidation().isInvalid).toBe(false);

        state.updateValidation({
          isInvalid: true,
          validationErrors: ["Custom error"],
          validationDetails: VALID_VALIDITY_STATE,
        });

        expect(state.displayValidation().isInvalid).toBe(true);
        expect(state.displayValidation().validationErrors).toEqual(["Custom error"]);

        dispose();
      });
    });

    it("should queue validation for native mode", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test",
          validationBehavior: "native",
        });

        state.updateValidation({
          isInvalid: true,
          validationErrors: ["Custom error"],
          validationDetails: VALID_VALIDITY_STATE,
        });

        // Not displayed until commit
        expect(state.displayValidation().isInvalid).toBe(false);

        dispose();
      });
    });
  });

  describe("commitValidation", () => {
    it("should commit pending validation in native mode", async () => {
      await createRoot(async (dispose) => {
        const state = createFormValidationState({
          value: "",
          validationBehavior: "native",
          validate: (v) => (v ? null : "Required"),
        });

        expect(state.displayValidation().isInvalid).toBe(false);

        state.commitValidation();

        // Allow effect to run
        await Promise.resolve();

        expect(state.displayValidation().isInvalid).toBe(true);
        expect(state.displayValidation().validationErrors).toEqual(["Required"]);

        dispose();
      });
    });
  });

  describe("resetValidation", () => {
    it("should reset manually updated validation to valid", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test", // valid value, no validate function
          validationBehavior: "native",
        });

        // Manually update validation
        state.updateValidation({
          isInvalid: true,
          validationErrors: ["Manual error"],
          validationDetails: VALID_VALIDITY_STATE,
        });

        state.resetValidation();

        // After reset, should show valid
        expect(state.displayValidation().isInvalid).toBe(false);
        expect(state.displayValidation().validationErrors).toEqual([]);

        dispose();
      });
    });

    it("should clear server error cleared flag", () => {
      createRoot((dispose) => {
        const state = createFormValidationState({
          value: "test",
        });

        state.resetValidation();

        // Reset should have been called without error
        expect(state.displayValidation().isInvalid).toBe(false);

        dispose();
      });
    });
  });
});

describe("mergeValidation", () => {
  it("should merge multiple validation results", () => {
    const result1: ValidationResult = {
      isInvalid: true,
      validationErrors: ["Error 1"],
      validationDetails: { ...VALID_VALIDITY_STATE, valueMissing: true, valid: false },
    };

    const result2: ValidationResult = {
      isInvalid: true,
      validationErrors: ["Error 2"],
      validationDetails: { ...VALID_VALIDITY_STATE, patternMismatch: true, valid: false },
    };

    const merged = mergeValidation(result1, result2);

    expect(merged.isInvalid).toBe(true);
    expect(merged.validationErrors).toContain("Error 1");
    expect(merged.validationErrors).toContain("Error 2");
    expect(merged.validationDetails.valueMissing).toBe(true);
    expect(merged.validationDetails.patternMismatch).toBe(true);
    expect(merged.validationDetails.valid).toBe(false);
  });

  it("should dedupe duplicate errors", () => {
    const result1: ValidationResult = {
      isInvalid: true,
      validationErrors: ["Same error"],
      validationDetails: VALID_VALIDITY_STATE,
    };

    const result2: ValidationResult = {
      isInvalid: true,
      validationErrors: ["Same error"],
      validationDetails: VALID_VALIDITY_STATE,
    };

    const merged = mergeValidation(result1, result2);

    expect(merged.validationErrors).toEqual(["Same error"]);
  });

  it("should return valid when all results are valid", () => {
    const merged = mergeValidation(DEFAULT_VALIDATION_RESULT, DEFAULT_VALIDATION_RESULT);

    expect(merged.isInvalid).toBe(false);
    expect(merged.validationDetails.valid).toBe(true);
  });
});

describe("constants", () => {
  it("VALID_VALIDITY_STATE should have all false except valid", () => {
    expect(VALID_VALIDITY_STATE.valid).toBe(true);
    expect(VALID_VALIDITY_STATE.badInput).toBe(false);
    expect(VALID_VALIDITY_STATE.customError).toBe(false);
    expect(VALID_VALIDITY_STATE.patternMismatch).toBe(false);
    expect(VALID_VALIDITY_STATE.rangeOverflow).toBe(false);
    expect(VALID_VALIDITY_STATE.rangeUnderflow).toBe(false);
    expect(VALID_VALIDITY_STATE.stepMismatch).toBe(false);
    expect(VALID_VALIDITY_STATE.tooLong).toBe(false);
    expect(VALID_VALIDITY_STATE.tooShort).toBe(false);
    expect(VALID_VALIDITY_STATE.typeMismatch).toBe(false);
    expect(VALID_VALIDITY_STATE.valueMissing).toBe(false);
  });

  it("DEFAULT_VALIDATION_RESULT should be valid", () => {
    expect(DEFAULT_VALIDATION_RESULT.isInvalid).toBe(false);
    expect(DEFAULT_VALIDATION_RESULT.validationErrors).toEqual([]);
    expect(DEFAULT_VALIDATION_RESULT.validationDetails.valid).toBe(true);
  });
});
