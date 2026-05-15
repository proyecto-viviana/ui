/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Button, Form, Skeleton, TextField } from "../src";

describe("Form (solid-spectrum)", () => {
  it("renders an S2 styled form root", () => {
    const { container } = render(() => (
      <Form aria-label="Project form" data-testid="form-root">
        <TextField label="Name" />
      </Form>
    ));

    const form = screen.getByTestId("form-root");
    expect(form.tagName).toBe("FORM");
    expect(form.className).not.toBe("solidaria-Form");
    expect(form.className).not.toBe("");
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("supports validation behavior and unsafe escape hatches", () => {
    render(() => (
      <Form
        validationBehavior="aria"
        UNSAFE_className="custom-form"
        UNSAFE_style={{ margin: "2px" }}
        data-testid="form-root"
      >
        <TextField label="Name" />
      </Form>
    ));

    const form = screen.getByTestId("form-root") as HTMLFormElement;
    expect(form).toHaveAttribute("novalidate");
    expect(form).toHaveClass("custom-form");
    expect(form.style.margin).toBe("2px");
  });

  it("provides S2 field props to TextField and Button children", () => {
    render(() => (
      <Form
        size="XL"
        labelPosition="side"
        labelAlign="end"
        necessityIndicator="label"
        isRequired
        isDisabled
      >
        <TextField label="Project" />
        <Button>Submit</Button>
      </Form>
    ));

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const button = screen.getByRole("button", { name: "Submit" }) as HTMLButtonElement;

    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(button).toBeDisabled();
    expect(screen.getByText("(required)")).toBeInTheDocument();
  });

  it("disables form-aware descendants inside Skeleton", () => {
    render(() => (
      <Skeleton isLoading>
        <Form>
          <TextField label="Loading" />
          <Button>Submit</Button>
        </Form>
      </Skeleton>
    ));

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });
});
