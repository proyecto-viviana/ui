/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { FieldError } from "../src/form";

describe("FieldError (solid-spectrum)", () => {
  it("renders validation errors with solid-spectrum styling", () => {
    render(() => (
      <FieldError
        validation={{
          isInvalid: true,
          validationErrors: ["This field is required"],
          validationDetails: {} as ValidityState,
        }}
      />
    ));

    const error = screen.getByText("This field is required");
    expect(error).toBeInTheDocument();
    // Error styling is emitted through the style() macro (the `negative` color),
    // so assert the element carries generated classes rather than a utility name.
    expect(error.className).not.toBe("");
  });

  it("does not render when validation is not invalid", () => {
    render(() => (
      <FieldError
        validation={{
          isInvalid: false,
          validationErrors: ["Should not render"],
          validationDetails: {} as ValidityState,
        }}
      />
    ));

    expect(screen.queryByText("Should not render")).not.toBeInTheDocument();
  });
});
