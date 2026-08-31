/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { Alert, AlertDismissButton, type AlertRenderProps } from "../src/Alert";

describe("Alert", () => {
  it('should render with role="alert"', () => {
    render(() => <Alert>Something happened</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Something happened");
  });

  it("should render with default class", () => {
    render(() => <Alert>Test</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("solidaria-Alert");
  });

  it("should render with custom class", () => {
    render(() => <Alert class="custom-class">Test</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("custom-class");
  });

  it("should support function class", () => {
    render(() => (
      <Alert variant="error" class={(props: AlertRenderProps) => `alert-${props.variant}`}>
        Test
      </Alert>
    ));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("alert-error");
  });

  it("should set data-variant attribute", () => {
    render(() => <Alert variant="warning">Test</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-variant", "warning");
  });

  it("should default variant to info", () => {
    render(() => <Alert>Test</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-variant", "info");
  });

  it("should set data-dismissible when isDismissible is true", () => {
    render(() => (
      <Alert isDismissible onDismiss={() => {}}>
        Test
      </Alert>
    ));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-dismissible");
  });

  it("should support render props for children", () => {
    render(() => (
      <Alert variant="success">
        {(props: AlertRenderProps) => <span data-testid="content">{props.variant} alert</span>}
      </Alert>
    ));
    expect(screen.getByTestId("content")).toHaveTextContent("success alert");
  });

  it("should support DOM props", () => {
    render(() => <Alert id="my-alert">Test</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("id", "my-alert");
  });
});

describe("AlertDismissButton", () => {
  it("should render as a keyboard-accessible button", () => {
    render(() => (
      <Alert isDismissible onDismiss={() => {}}>
        <span>Content</span>
        <AlertDismissButton>X</AlertDismissButton>
      </Alert>
    ));
    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button).toBeInTheDocument();
  });

  it('should default aria-label to "Dismiss"', () => {
    render(() => (
      <Alert isDismissible onDismiss={() => {}}>
        <AlertDismissButton>X</AlertDismissButton>
      </Alert>
    ));
    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button).toHaveAttribute("aria-label", "Dismiss");
  });

  it("should support custom aria-label", () => {
    render(() => (
      <Alert isDismissible onDismiss={() => {}}>
        <AlertDismissButton aria-label="Close alert">X</AlertDismissButton>
      </Alert>
    ));
    const button = screen.getByRole("button", { name: "Close alert" });
    expect(button).toBeInTheDocument();
  });

  it("should call onDismiss when pressed", async () => {
    const user = setupUser();
    const onDismiss = vi.fn();

    render(() => (
      <Alert isDismissible onDismiss={onDismiss}>
        <span>Content</span>
        <AlertDismissButton>X</AlertDismissButton>
      </Alert>
    ));

    const button = screen.getByRole("button", { name: "Dismiss" });
    await user.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should be keyboard-accessible via Enter", async () => {
    const user = setupUser();
    const onDismiss = vi.fn();

    render(() => (
      <Alert isDismissible onDismiss={onDismiss}>
        <AlertDismissButton>X</AlertDismissButton>
      </Alert>
    ));

    const button = screen.getByRole("button", { name: "Dismiss" });
    button.focus();
    await user.keyboard("{Enter}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should be keyboard-accessible via Space", async () => {
    const user = setupUser();
    const onDismiss = vi.fn();

    render(() => (
      <Alert isDismissible onDismiss={onDismiss}>
        <AlertDismissButton>X</AlertDismissButton>
      </Alert>
    ));

    const button = screen.getByRole("button", { name: "Dismiss" });
    button.focus();
    await user.keyboard(" ");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
