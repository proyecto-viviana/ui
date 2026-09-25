/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { Form } from "../src/form";
import { TextField } from "../src/textfield";

describe("Form (viviana-ui)", () => {
  it("renders a styled form root", () => {
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

  it("drops native required when Form validationBehavior is aria and isRequired is inherited", () => {
    render(() => (
      <Form validationBehavior="aria" isRequired aria-label="Aria form">
        <TextField label="Name" description="Inherited from the parent form." />
      </Form>
    ));

    const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input.validity.valueMissing).toBe(false);
  });

  it("drops native required when Form validationBehavior is aria and TextField sets isRequired", () => {
    render(() => (
      <Form validationBehavior="aria" aria-label="Aria field form">
        <TextField label="Name" isRequired />
      </Form>
    ));

    const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
    expect(input).not.toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input.validity.valueMissing).toBe(false);
  });

  it("tracks a live form validationBehavior change on a descendant TextField", () => {
    const [behavior, setBehavior] = createSignal<"aria" | "native">("native");

    render(() => (
      <Form validationBehavior={behavior()} isRequired aria-label="Live descendant form">
        <TextField label="Name" />
      </Form>
    ));

    const form = screen.getByRole("form", { name: "Live descendant form" }) as HTMLFormElement;
    const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;

    expect(form.noValidate).toBe(false);
    expect(input.required).toBe(true);
    expect(input).not.toHaveAttribute("aria-required");

    setBehavior("aria");
    flush();

    expect(form.noValidate).toBe(true);
    expect(input.required).toBe(false);
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("allows form submit when validationBehavior is aria and required field is empty", () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

    render(() => (
      <Form validationBehavior="aria" isRequired aria-label="Aria submit form" onSubmit={onSubmit}>
        <TextField label="Name" />
        <button type="submit">Submit</button>
      </Form>
    ));

    const form = screen.getByRole("form", { name: "Aria submit form" }) as HTMLFormElement;
    const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;

    expect(form.noValidate).toBe(true);
    expect(input.required).toBe(false);
    expect(input).toHaveAttribute("aria-required", "true");

    form.requestSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("allows form submit after live validationBehavior change to aria", () => {
    const [behavior, setBehavior] = createSignal<"aria" | "native">("native");
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

    render(() => (
      <Form
        validationBehavior={behavior()}
        isRequired
        aria-label="Live submit form"
        onSubmit={onSubmit}
      >
        <TextField label="Name" />
        <button type="submit">Submit</button>
      </Form>
    ));

    const form = screen.getByRole("form", { name: "Live submit form" }) as HTMLFormElement;

    form.requestSubmit();
    expect(onSubmit).not.toHaveBeenCalled();

    setBehavior("aria");
    flush();

    form.requestSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("tracks live size and labelPosition changes on the form grid class", () => {
    const [size, setSize] = createSignal<"S" | "M" | "L" | "XL">("M");
    const [labelPosition, setLabelPosition] = createSignal<"top" | "side">("top");

    render(() => (
      <Form size={size()} labelPosition={labelPosition()} aria-label="Live grid form">
        <TextField label="Name" />
      </Form>
    ));

    const form = screen.getByRole("form", { name: "Live grid form" }) as HTMLFormElement;
    const initialClass = form.className;

    setSize("XL");
    flush();
    const xlClass = form.className;
    expect(xlClass).not.toBe(initialClass);

    setLabelPosition("side");
    flush();
    const sideClass = form.className;
    expect(sideClass).not.toBe(xlClass);
  });
});
