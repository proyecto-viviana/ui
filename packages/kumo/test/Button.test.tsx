import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { Button } from "../src/components/button";

describe("Kumo Button", () => {
  it("uses the Kumo defaults and a safe native type", () => {
    render(() => <Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-kumo-component", "Button");
    expect(button).toHaveClass(
      "pv-kumo-Button",
      "pv-kumo-Button--variant-secondary",
      "pv-kumo-Button--size-base",
    );
    expect(button).not.toBeDisabled();
  });

  it("runs the native onClick API for pointer and keyboard input", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(() => <Button onClick={onClick}>Run</Button>);

    const button = screen.getByRole("button", { name: "Run" });
    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("disables interaction while loading and keeps the label", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(() => (
      <Button loading icon={() => <span data-testid="icon" />} onClick={onClick}>
        Save
      </Button>
    ));

    const button = screen.getByRole("button", { name: /Save/ });
    expect(button).toBeDisabled();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(button).not.toHaveClass("pv-kumo-Button--explicitly-disabled");

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("reacts when the loading prop changes", () => {
    const [loading, setLoading] = createSignal(false);
    render(() => <Button loading={loading()}>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).not.toBeDisabled();

    setLoading(true);
    expect(button).toBeDisabled();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();

    setLoading(false);
    expect(button).not.toBeDisabled();
    expect(screen.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
  });

  it.each([
    "primary",
    "secondary",
    "ghost",
    "destructive",
    "secondary-destructive",
    "outline",
  ] as const)("applies the %s variant", (variant) => {
    const view = render(() => <Button variant={variant}>Action</Button>);
    expect(screen.getByRole("button")).toHaveClass(`pv-kumo-Button--variant-${variant}`);
    view.unmount();
  });

  it.each(["xs", "sm", "base", "lg"] as const)("applies the %s size", (size) => {
    const view = render(() => <Button size={size}>Action</Button>);
    expect(screen.getByRole("button")).toHaveClass(`pv-kumo-Button--size-${size}`);
    view.unmount();
  });

  it.each(["square", "circle"] as const)("applies the %s icon-only shape", (shape) => {
    const view = render(() => <Button shape={shape} aria-label="Add" icon={() => <span />} />);
    expect(screen.getByRole("button", { name: "Add" })).toHaveClass(
      `pv-kumo-Button--shape-${shape}`,
    );
    view.unmount();
  });

  it("renders component and element icons", () => {
    const ComponentIcon = () => <svg data-testid="component-icon" />;
    render(() => <Button icon={ComponentIcon}>Component</Button>);
    render(() => <Button icon={<svg data-testid="element-icon" />}>Element</Button>);

    expect(screen.getByTestId("component-icon")).toBeInTheDocument();
    expect(screen.getByTestId("element-icon")).toBeInTheDocument();
  });

  it("forwards native form, data, class, style, and ref props", () => {
    let element: HTMLButtonElement | undefined;
    render(() => (
      <Button
        ref={(value) => (element = value)}
        className="consumer-class"
        data-testid="save"
        form="profile"
        name="intent"
        value="save"
        style={{ "margin-top": "3px" }}
        type="submit"
      >
        Save
      </Button>
    ));

    const button = screen.getByTestId("save");
    expect(element).toBe(button);
    expect(button).toHaveClass("consumer-class");
    expect(button).toHaveAttribute("form", "profile");
    expect(button).toHaveAttribute("name", "intent");
    expect(button).toHaveAttribute("value", "save");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveStyle({ marginTop: "3px" });
  });

  it("sets and permits overrides for the upstream emphasis properties", () => {
    render(() => (
      <Button variant="primary" style={{ "--kumo-button-emphasis-gradient-end": "rebeccapurple" }}>
        Save
      </Button>
    ));

    const button = screen.getByRole("button");
    expect(button.style.getPropertyValue("--kumo-button-emphasis-ring")).toBe(
      "color-mix(in oklch, var(--color-kumo-brand), black 10%)",
    );
    expect(button.style.getPropertyValue("--kumo-button-emphasis-gradient-end")).toBe(
      "rebeccapurple",
    );
  });

  it("marks an explicit disabled prop separately from loading", () => {
    render(() => <Button disabled>Delete</Button>);
    const button = screen.getByRole("button", { name: "Delete" });

    expect(button).toBeDisabled();
    expect(button).toHaveClass("pv-kumo-Button--explicitly-disabled");
  });

  it("does not submit a form at the default type", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    render(() => (
      <form onSubmit={onSubmit}>
        <Button>Save</Button>
      </form>
    ));

    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a native form with type=submit name and value", async () => {
    const user = userEvent.setup();
    let payload: Record<string, string> | undefined;
    const onSubmit = vi.fn((event: Event) => {
      event.preventDefault();
      const submitEvent = event as SubmitEvent;
      const data = new FormData(
        submitEvent.currentTarget as HTMLFormElement,
        submitEvent.submitter ?? undefined,
      );
      payload = Object.fromEntries(data.entries()) as Record<string, string>;
    });
    render(() => (
      <form onSubmit={onSubmit}>
        <input name="worker" type="hidden" value="edge" />
        <Button name="intent" type="submit" value="deploy">
          Deploy
        </Button>
      </form>
    ));

    await user.click(screen.getByRole("button", { name: "Deploy" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(payload).toEqual({ worker: "edge", intent: "deploy" });
  });
});
