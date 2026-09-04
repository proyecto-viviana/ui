import { createSignal } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { FieldErrorContext } from "@proyecto-viviana/solidaria-components";
import { DEFAULT_VALIDATION_RESULT, type ValidationResult } from "@proyecto-viviana/solid-stately";
import { HelpText } from "../src/form/HelpText";

const CONTEXT_ERROR: ValidationResult = {
  ...DEFAULT_VALIDATION_RESULT,
  isInvalid: true,
  validationErrors: ["Context error"],
  validationDetails: {
    ...DEFAULT_VALIDATION_RESULT.validationDetails,
    customError: true,
    valid: false,
  },
};

describe("HelpText (viviana-ui)", () => {
  it("renders description in the description slot", () => {
    render(() => <HelpText description="Help text" />);
    expect(screen.getByText("Help text")).toHaveAttribute("slot", "description");
  });

  it("shows the error and hides description when isInvalid", () => {
    render(() => <HelpText isInvalid errorMessage="Error!" description="Help" />);
    expect(screen.getByText("Error!")).toHaveAttribute("slot", "errorMessage");
    expect(screen.queryByText("Help")).not.toBeInTheDocument();
  });

  it("swaps description for the error when isInvalid flips after mount", () => {
    const [isInvalid, setIsInvalid] = createSignal(false);
    render(() => (
      <HelpText
        isInvalid={isInvalid()}
        description="Enter a quantity."
        errorMessage="Quantity is required."
      />
    ));

    expect(screen.getByText("Enter a quantity.")).toHaveAttribute("slot", "description");
    expect(screen.queryByText("Quantity is required.")).not.toBeInTheDocument();

    setIsInvalid(true);
    expect(screen.queryByText("Enter a quantity.")).not.toBeInTheDocument();
    expect(screen.getByText("Quantity is required.")).toHaveAttribute("slot", "errorMessage");

    setIsInvalid(false);
    expect(screen.getByText("Enter a quantity.")).toHaveAttribute("slot", "description");
    expect(screen.queryByText("Quantity is required.")).not.toBeInTheDocument();
  });

  it("mounts context errors with no local isInvalid", () => {
    render(() => (
      <FieldErrorContext.Provider value={CONTEXT_ERROR}>
        <HelpText description="Enter a quantity." />
      </FieldErrorContext.Provider>
    ));

    expect(screen.queryByText("Enter a quantity.")).not.toBeInTheDocument();
    expect(screen.getByText("Context error")).toHaveAttribute("slot", "errorMessage");
  });

  it("lets FieldErrorContext supply validationErrors instead of DEFAULT_VALIDATION_RESULT", () => {
    render(() => (
      <FieldErrorContext.Provider value={{ validation: CONTEXT_ERROR }}>
        <HelpText />
      </FieldErrorContext.Provider>
    ));

    expect(screen.getByText("Context error")).toHaveAttribute("slot", "errorMessage");
  });
});
