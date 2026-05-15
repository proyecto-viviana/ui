/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
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

  it("forwards native form props and events through the S2 wrapper", () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const onReset = vi.fn();

    render(() => (
      <Form
        aria-label="Project form"
        action="/projects"
        method="post"
        target="_blank"
        autoComplete="off"
        encType="multipart/form-data"
        name="projectForm"
        rel="noopener"
        data-testid="form-root"
        onSubmit={onSubmit}
        onReset={onReset}
      >
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
      </Form>
    ));

    const form = screen.getByTestId("form-root") as HTMLFormElement;
    expect(form).toHaveAttribute("action", "/projects");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("target", "_blank");
    expect(form).toHaveAttribute("autocomplete", "off");
    expect(form).toHaveAttribute("enctype", "multipart/form-data");
    expect(form).toHaveAttribute("name", "projectForm");
    expect(form).toHaveAttribute("rel", "noopener");

    fireEvent.submit(form);
    fireEvent.reset(form);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
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

  it("lets local form-aware child props override form context outside Skeleton", () => {
    render(() => (
      <Form isDisabled isRequired>
        <TextField label="Project" isDisabled={false} isRequired={false} />
        <Button isDisabled={false}>Submit</Button>
      </Form>
    ));

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const button = screen.getByRole("button", { name: "Submit" }) as HTMLButtonElement;

    expect(input).not.toBeDisabled();
    expect(input).not.toBeRequired();
    expect(button).not.toBeDisabled();
  });

  it("disables form-aware descendants inside Skeleton even when children opt out", () => {
    render(() => (
      <Skeleton isLoading>
        <Form>
          <TextField label="Loading" isDisabled={false} />
          <Button isDisabled={false}>Submit</Button>
        </Form>
      </Skeleton>
    ));

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });
});
