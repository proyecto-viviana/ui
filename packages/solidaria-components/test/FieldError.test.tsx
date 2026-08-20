/**
 * Tests for solidaria-components FieldError
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import type { ValidationResult } from "@proyecto-viviana/solid-stately";
import { FieldError, FieldErrorContext } from "../src/FieldError";

const invalidResult: ValidationResult = {
  isInvalid: true,
  validationErrors: ["First error", "Second error"],
  validationDetails: {
    badInput: false,
    customError: true,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valueMissing: false,
    valid: false,
  },
};

describe("FieldError", () => {
  it("renders nothing when validation is valid", () => {
    const { container } = render(() => (
      <FieldError
        validation={{
          ...invalidResult,
          isInvalid: false,
          validationErrors: [],
          validationDetails: {
            ...invalidResult.validationDetails,
            valid: true,
            customError: false,
          },
        }}
      />
    ));
    expect(container).toBeEmptyDOMElement();
  });

  it("renders default joined error messages", () => {
    render(() => <FieldError validation={invalidResult} />);
    const error = screen.getByText("First error Second error");
    expect(error).toHaveClass("solidaria-FieldError");
    expect(error).toHaveAttribute("slot", "errorMessage");
  });

  it("uses context validation when prop is omitted", () => {
    render(() => (
      <FieldErrorContext.Provider value={invalidResult}>
        <FieldError />
      </FieldErrorContext.Provider>
    ));

    expect(screen.getByText("First error Second error")).toBeInTheDocument();
  });

  it("supports render props", () => {
    render(() => (
      <FieldError validation={invalidResult}>
        {(validation) => <span>{validation.validationErrors.length} errors</span>}
      </FieldError>
    ));

    expect(screen.getByText("2 errors")).toBeInTheDocument();
  });
});
