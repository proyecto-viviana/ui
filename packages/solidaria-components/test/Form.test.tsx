/**
 * Tests for solidaria-components Form
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush, useContext } from "solid-js";
import { FormValidationContext, type ValidationErrors } from "@proyecto-viviana/solid-stately";
import { Form } from "../src/Form";
import { FieldError } from "../src/FieldError";
import { Input, Label, TextField } from "../src/TextField";

function ContextProbe() {
  const errors = useContext(FormValidationContext) as unknown;
  const normalized = typeof errors === "function" ? (errors as () => unknown)() : errors;
  return (
    <div data-testid="errors">{String((normalized as Record<string, unknown>)?.email ?? "")}</div>
  );
}

describe("Form", () => {
  it("renders with default class and native validation behavior", () => {
    render(() => <Form />);
    const form = document.querySelector("form") as HTMLFormElement;
    expect(form).toHaveClass("solidaria-Form");
    expect(form).not.toHaveAttribute("novalidate");
  });

  it("sets noValidate when validationBehavior is aria", () => {
    render(() => <Form validationBehavior="aria" />);
    const form = document.querySelector("form") as HTMLFormElement;
    expect(form).toHaveAttribute("novalidate");
  });

  it("forwards native form props and form events", () => {
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
        onSubmit={onSubmit}
        onReset={onReset}
      >
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
      </Form>
    ));

    const form = screen.getByRole("form") as HTMLFormElement;
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

  it("forwards documented ARIA description props", () => {
    render(() => (
      <>
        <span id="form-description">Description</span>
        <div id="form-details">Details</div>
        <Form
          aria-label="Project form"
          aria-describedby="form-description"
          aria-details="form-details"
        />
      </>
    ));

    const form = screen.getByRole("form", { name: "Project form" });
    expect(form).toHaveAttribute("aria-describedby", "form-description");
    expect(form).toHaveAttribute("aria-details", "form-details");
  });

  it("exposes the underlying form ref", () => {
    const callbackRef = vi.fn();
    const objectRef: { current: HTMLFormElement | null } = { current: null };

    render(() => (
      <>
        <Form aria-label="Callback form" ref={callbackRef} />
        <Form aria-label="Object form" ref={objectRef} />
      </>
    ));

    const callbackForm = screen.getByRole("form", { name: "Callback form" });
    const objectForm = screen.getByRole("form", { name: "Object form" });
    expect(callbackRef).toHaveBeenCalledWith(callbackForm);
    expect(objectRef.current).toBe(objectForm);
  });

  it("provides validation errors through FormValidationContext", () => {
    const validationErrors: ValidationErrors = {
      email: "Invalid email",
    };

    render(() => <Form validationErrors={validationErrors}>{() => <ContextProbe />}</Form>);

    expect(screen.getByTestId("errors")).toHaveTextContent("Invalid email");
  });

  it("shows a replaced validationErrors object after the field commits or the form resets", () => {
    const [errors, setErrors] = createSignal<ValidationErrors>({ email: "First error" });

    render(() => (
      <Form validationErrors={errors()} aria-label="Account">
        <TextField name="email" defaultValue="ada@example.com">
          <Label>Email</Label>
          <Input />
          <FieldError />
        </TextField>
        <button type="reset">Reset</button>
      </Form>
    ));

    expect(screen.getByText("First error")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }));
    flush();
    expect(screen.queryByText("First error")).not.toBeInTheDocument();

    setErrors({ email: "Second error" });
    flush();
    expect(screen.getByText("Second error")).toBeInTheDocument();

    fireEvent.reset(screen.getByRole("form", { name: "Account" }));
    flush();
    expect(screen.queryByText("Second error")).not.toBeInTheDocument();

    setErrors({ email: "Third error" });
    flush();
    expect(screen.getByText("Third error")).toBeInTheDocument();
  });

  describe("validationBehavior is live", () => {
    it("tracks a validationBehavior change on noValidate", () => {
      const [behavior, setBehavior] = createSignal<"aria" | "native">("native");

      render(() => <Form validationBehavior={behavior()} aria-label="Live form" />);

      const form = screen.getByRole("form", { name: "Live form" });
      expect(form).not.toHaveAttribute("novalidate");

      setBehavior("aria");
      flush();
      expect(form).toHaveAttribute("novalidate");

      setBehavior("native");
      flush();
      expect(form).not.toHaveAttribute("novalidate");
    });

    it("tracks a validationBehavior change on the render-prop value", () => {
      const [behavior, setBehavior] = createSignal<"aria" | "native">("native");

      render(() => (
        <Form validationBehavior={behavior()} aria-label="Render form">
          {(renderProps) => <div data-testid="behavior">{renderProps.validationBehavior}</div>}
        </Form>
      ));

      expect(screen.getByTestId("behavior")).toHaveTextContent("native");

      setBehavior("aria");
      flush();
      expect(screen.getByTestId("behavior")).toHaveTextContent("aria");
    });

    it("tracks live class and style changes", () => {
      const [customClass, setCustomClass] = createSignal("class-a");
      const [margin, setMargin] = createSignal("10px");

      render(() => (
        <Form class={customClass()} style={{ margin: margin() }} aria-label="Style form" />
      ));

      const form = screen.getByRole("form", { name: "Style form" });
      expect(form).toHaveClass("class-a");
      expect(form.style.margin).toBe("10px");

      setCustomClass("class-b");
      setMargin("20px");
      flush();

      expect(form).not.toHaveClass("class-a");
      expect(form).toHaveClass("class-b");
      expect(form.style.margin).toBe("20px");
    });
  });

  describe("descendant fields read the form validationBehavior", () => {
    it("switches a descendant TextField from required to aria-required", () => {
      render(() => (
        <Form validationBehavior="aria" aria-label="Aria form">
          <TextField isRequired>
            <Label>Name</Label>
            <Input />
          </TextField>
        </Form>
      ));

      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("keeps a descendant TextField on native required by default", () => {
      render(() => (
        <Form aria-label="Native form">
          <TextField isRequired>
            <Label>Name</Label>
            <Input />
          </TextField>
        </Form>
      ));

      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input).toHaveAttribute("required");
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("inherits form validationBehavior when the field owns an undefined getter", () => {
      const fieldProps = {
        isRequired: true as const,
        get validationBehavior(): "aria" | "native" | undefined {
          return undefined;
        },
      };

      render(() => (
        <Form validationBehavior="aria" aria-label="Undefined getter form">
          <TextField {...fieldProps}>
            <Label>Name</Label>
            <Input />
          </TextField>
        </Form>
      ));

      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("lets a descendant TextField override the form validationBehavior", () => {
      render(() => (
        <Form validationBehavior="aria" aria-label="Override form">
          <TextField isRequired validationBehavior="native">
            <Label>Name</Label>
            <Input />
          </TextField>
        </Form>
      ));

      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input).toHaveAttribute("required");
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("tracks a live form validationBehavior change on a descendant TextField", () => {
      const [behavior, setBehavior] = createSignal<"aria" | "native">("native");

      render(() => (
        <Form validationBehavior={behavior()} aria-label="Live descendant form">
          <TextField isRequired>
            <Label>Name</Label>
            <Input />
          </TextField>
        </Form>
      ));

      const input = screen.getByRole("textbox", { name: "Name" });
      expect(input).toHaveAttribute("required");
      expect(input).not.toHaveAttribute("aria-required");

      setBehavior("aria");
      flush();
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });
  });
});
