import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { Button } from "../src/components/button";

describe("Geist Button", () => {
  it("uses the Geist defaults and a safe native type", () => {
    render(() => <Button>Upload</Button>);

    const button = screen.getByRole("button", { name: "Upload" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-geist-component", "Button");
    expect(button).toHaveClass(
      "pv-geist-Button",
      "pv-geist-Button--variant-default",
      "pv-geist-Button--size-medium",
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

  it("keeps a loading button focusable and ignores press", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(() => (
      <Button loading onClick={onClick}>
        Upload
      </Button>
    ));

    const button = screen.getByRole("button", { name: /Upload/ });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("reacts when the loading prop changes", () => {
    const [loading, setLoading] = createSignal(false);
    render(() => <Button loading={loading()}>Upload</Button>);

    const button = screen.getByRole("button", { name: "Upload" });
    expect(button).not.toHaveAttribute("aria-disabled", "true");

    setLoading(true);
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();

    setLoading(false);
    expect(button).not.toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
  });

  it.each(["default", "error", "warning", "secondary", "tertiary"] as const)(
    "applies the %s variant",
    (variant) => {
      const view = render(() => <Button variant={variant}>Action</Button>);
      expect(screen.getByRole("button")).toHaveClass(`pv-geist-Button--variant-${variant}`);
      view.unmount();
    },
  );

  it.each(["tiny", "small", "medium", "large"] as const)("applies the %s size", (size) => {
    const view = render(() => <Button size={size}>Action</Button>);
    expect(screen.getByRole("button")).toHaveClass(`pv-geist-Button--size-${size}`);
    view.unmount();
  });

  it("requires an accessible name on svgOnly buttons", () => {
    render(() => (
      <Button svgOnly aria-label="Upload" shape="square">
        <svg data-testid="icon" />
      </Button>
    ));
    expect(screen.getByRole("button", { name: "Upload" })).toHaveClass(
      "pv-geist-Button--svgOnly",
      "pv-geist-Button--shape-square",
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders prefix and suffix around the label", () => {
    render(() => (
      <Button prefix={<span data-testid="prefix" />} suffix={<span data-testid="suffix" />}>
        Upload
      </Button>
    ));
    expect(screen.getByTestId("prefix")).toBeInTheDocument();
    expect(screen.getByTestId("suffix")).toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();
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

  it("marks an explicit disabled prop and ignores press", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(() => (
      <Button disabled onClick={onClick}>
        Delete
      </Button>
    ));
    const button = screen.getByRole("button", { name: "Delete" });

    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
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

  it("updates direct reactive text children", () => {
    const [label, setLabel] = createSignal("Save");
    render(() => <Button>{label()}</Button>);

    const button = screen.getByRole("button");
    expect(button.querySelector(".pv-geist-Button__label")).toHaveTextContent("Save");
    setLabel("Saved");
    expect(button.querySelector(".pv-geist-Button__label")).toHaveTextContent("Saved");
  });
});
