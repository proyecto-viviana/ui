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

  it("forwards documented ARIA description props through the S2 wrapper", () => {
    render(() => (
      <>
        <span id="form-description">Description</span>
        <div id="form-details">Details</div>
        <Form
          aria-label="Project form"
          aria-describedby="form-description"
          aria-details="form-details"
        >
          <TextField label="Name" />
        </Form>
      </>
    ));

    const form = screen.getByRole("form", { name: "Project form" });
    expect(form).toHaveAttribute("aria-describedby", "form-description");
    expect(form).toHaveAttribute("aria-details", "form-details");
  });

  it("does not leak S2 visual props as root marker attributes", () => {
    render(() => (
      <Form
        aria-label="Project form"
        size="XL"
        labelPosition="side"
        labelAlign="end"
        necessityIndicator="label"
        isRequired
        isDisabled
        isEmphasized
      >
        <TextField label="Name" />
      </Form>
    ));

    const form = screen.getByRole("form", { name: "Project form" });
    expect(form).not.toHaveAttribute("data-size");
    expect(form).not.toHaveAttribute("data-label-position");
    expect(form).not.toHaveAttribute("data-label-align");
    expect(form).not.toHaveAttribute("data-necessity-indicator");
    expect(form).not.toHaveAttribute("data-required");
    expect(form).not.toHaveAttribute("data-disabled");
    expect(form).not.toHaveAttribute("data-emphasized");
  });

  it("exposes the S2 form root ref", () => {
    const callbackRef = vi.fn();
    const objectRef: { current: HTMLFormElement | null } = { current: null };

    render(() => (
      <>
        <Form aria-label="Callback form" ref={callbackRef}>
          <TextField label="Name" />
        </Form>
        <Form aria-label="Object form" ref={objectRef}>
          <TextField label="Email" />
        </Form>
      </>
    ));

    const callbackForm = screen.getByRole("form", { name: "Callback form" });
    const objectForm = screen.getByRole("form", { name: "Object form" });
    expect(callbackRef).toHaveBeenCalledWith(callbackForm);
    expect(objectRef.current).toBe(objectForm);
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
