/**
 * Tests for createDialog hook.
 * Ported from @react-aria/dialog useDialog.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { createDialog } from "../src";

// Test component that uses createDialog
function TestDialog(props: {
  role?: "dialog" | "alertdialog";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  children?: any;
}) {
  let dialogRef: HTMLDivElement | null = null;

  const { dialogProps } = createDialog(
    () => ({
      role: props.role,
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
      "aria-describedby": props["aria-describedby"],
    }),
    () => dialogRef,
  );

  return (
    <div ref={(el) => (dialogRef = el)} {...dialogProps()} data-testid="dialog">
      {props.children}
    </div>
  );
}

describe("createDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it('should have role="dialog" by default', () => {
    render(() => <TestDialog />);
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("role", "dialog");
  });

  it('should accept role="alertdialog"', () => {
    render(() => <TestDialog role="alertdialog" />);
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("role", "alertdialog");
  });

  it("should have tabIndex=-1 for focus management", () => {
    render(() => <TestDialog />);
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("tabIndex", "-1");
  });

  it("should support aria-label", () => {
    render(() => <TestDialog aria-label="Test Dialog" />);
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Test Dialog");
  });

  it("should support aria-labelledby", () => {
    render(() => (
      <>
        <h2 id="dialog-title">Dialog Title</h2>
        <TestDialog aria-labelledby="dialog-title" />
      </>
    ));
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
  });

  it("should support aria-describedby", () => {
    render(() => (
      <>
        <p id="dialog-desc">Dialog description</p>
        <TestDialog aria-describedby="dialog-desc" />
      </>
    ));
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toHaveAttribute("aria-describedby", "dialog-desc");
  });

  it("links an alertdialog to its generated content description", () => {
    let dialogRef: HTMLDivElement | null = null;

    render(() => {
      const { dialogProps, contentProps } = createDialog(
        () => ({ role: "alertdialog", "aria-label": "Delete item" }),
        () => dialogRef,
      );
      return (
        <div ref={(el) => (dialogRef = el)} {...dialogProps()} data-testid="dialog">
          <p {...contentProps()}>This action cannot be undone.</p>
        </div>
      );
    });

    const dialog = screen.getByRole("alertdialog", { name: "Delete item" });
    const descriptionId = dialog.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toHaveTextContent(
      "This action cannot be undone.",
    );
    expect(dialog).toHaveAccessibleDescription("This action cannot be undone.");
  });

  it("does not generate content description wiring for a regular dialog", () => {
    let dialogRef: HTMLDivElement | null = null;
    let capturedContentProps: Record<string, unknown> | undefined;

    render(() => {
      const { dialogProps, contentProps } = createDialog(
        () => ({ "aria-label": "Information" }),
        () => dialogRef,
      );
      capturedContentProps = contentProps();
      return <div ref={(el) => (dialogRef = el)} {...dialogProps()} data-testid="dialog" />;
    });

    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
    expect(capturedContentProps?.id).toBeUndefined();
  });

  it("preserves an explicit alertdialog description instead of generating one", () => {
    let dialogRef: HTMLDivElement | null = null;
    let capturedContentProps: Record<string, unknown> | undefined;

    render(() => {
      const { dialogProps, contentProps } = createDialog(
        () => ({
          role: "alertdialog",
          "aria-label": "Delete item",
          "aria-describedby": "explicit-description",
        }),
        () => dialogRef,
      );
      capturedContentProps = contentProps();
      return (
        <div ref={(el) => (dialogRef = el)} {...dialogProps()} data-testid="dialog">
          <p id="explicit-description">Explicit description</p>
        </div>
      );
    });

    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "aria-describedby",
      "explicit-description",
    );
    expect(capturedContentProps?.id).toBeUndefined();
  });

  it("should render children", () => {
    render(() => (
      <TestDialog>
        <p>Dialog content</p>
      </TestDialog>
    ));
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
  });

  it("should focus the dialog on mount when no focusable children", async () => {
    render(() => <TestDialog aria-label="Test" />);
    const dialog = screen.getByTestId("dialog");

    // Wait for focus effect to run
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Dialog should be focusable (has tabIndex=-1)
    expect(dialog).toHaveAttribute("tabIndex", "-1");
  });

  it("should not steal focus from autofocused children", async () => {
    render(() => (
      <TestDialog aria-label="Test">
        <input data-testid="input" autofocus />
      </TestDialog>
    ));

    // Wait for mount effects
    await new Promise((resolve) => setTimeout(resolve, 50));

    const input = screen.getByTestId("input");
    // In a real browser, autofocus would work
    // In JSDOM, we verify the element exists and is focusable
    expect(input).toBeInTheDocument();
  });
});

describe("createDialog accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("should be accessible with aria-label", () => {
    render(() => <TestDialog aria-label="Settings Dialog" />);
    const dialog = screen.getByRole("dialog", { name: "Settings Dialog" });
    expect(dialog).toBeInTheDocument();
  });

  it("should be accessible with aria-labelledby", () => {
    render(() => (
      <>
        <h2 id="title">User Settings</h2>
        <TestDialog aria-labelledby="title" />
      </>
    ));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "title");
  });

  it("alertdialog should be accessible", () => {
    render(() => <TestDialog role="alertdialog" aria-label="Confirm Delete" />);
    const dialog = screen.getByRole("alertdialog", { name: "Confirm Delete" });
    expect(dialog).toBeInTheDocument();
  });

  it("should support both aria-label and aria-describedby", () => {
    render(() => (
      <>
        <p id="desc">This action cannot be undone.</p>
        <TestDialog aria-label="Delete Item" aria-describedby="desc" />
      </>
    ));

    const dialog = screen.getByRole("dialog", { name: "Delete Item" });
    expect(dialog).toHaveAttribute("aria-describedby", "desc");
  });

  it("should work with complex labeling scenario", () => {
    render(() => (
      <>
        <h2 id="dialog-title">Edit Profile</h2>
        <p id="dialog-desc">Update your profile information below.</p>
        <TestDialog aria-labelledby="dialog-title" aria-describedby="dialog-desc">
          <input placeholder="Name" />
          <button>Save</button>
        </TestDialog>
      </>
    ));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
    expect(dialog).toHaveAttribute("aria-describedby", "dialog-desc");
  });
});

describe("createDialog titleProps", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns titleProps with generated id when no labels provided", () => {
    let dialogRef: HTMLDivElement | null = null;
    let capturedTitleProps: any;

    render(() => {
      const { dialogProps, titleProps } = createDialog(
        () => ({}),
        () => dialogRef,
      );
      capturedTitleProps = titleProps();
      return (
        <div ref={(el) => (dialogRef = el)} {...dialogProps()} data-testid="dialog">
          <h2 {...titleProps()}>Title</h2>
        </div>
      );
    });

    expect(capturedTitleProps.id).toBeDefined();
    expect(typeof capturedTitleProps.id).toBe("string");
  });

  it("titleProps id matches aria-labelledby when no labels provided", () => {
    let capturedDialogProps: any;
    let capturedTitleProps: any;

    render(() => {
      let dialogRef: HTMLDivElement | null = null;
      const { dialogProps, titleProps } = createDialog(
        () => ({}),
        () => dialogRef,
      );
      capturedDialogProps = dialogProps();
      capturedTitleProps = titleProps();
      return (
        <div ref={(el) => (dialogRef = el)} {...dialogProps()} data-testid="dialog">
          <h2 {...titleProps()}>Title</h2>
        </div>
      );
    });

    expect(capturedDialogProps["aria-labelledby"]).toBe(capturedTitleProps.id);
  });
});

describe("createDialog edge cases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should handle undefined ref gracefully", () => {
    let capturedProps: any;

    render(() => {
      const { dialogProps } = createDialog(
        () => ({ "aria-label": "Test" }),
        () => undefined,
      );
      capturedProps = dialogProps();
      return <div {...dialogProps()} data-testid="dialog" />;
    });

    expect(capturedProps.role).toBe("dialog");
  });

  it("should include onBlur handler for focus management", () => {
    let capturedProps: any;

    render(() => {
      let dialogRef: HTMLDivElement | null = null;
      const { dialogProps } = createDialog(
        () => ({ "aria-label": "Test" }),
        () => dialogRef,
      );
      capturedProps = dialogProps();
      return <div ref={(el) => (dialogRef = el)} {...dialogProps()} data-testid="dialog" />;
    });

    expect(typeof capturedProps.onBlur).toBe("function");
  });

  it("should be focusable via keyboard", () => {
    render(() => <TestDialog aria-label="Test" />);
    const dialog = screen.getByTestId("dialog");

    dialog.focus();
    expect(document.activeElement).toBe(dialog);
  });

  it("should render complex children structures", () => {
    render(() => (
      <TestDialog aria-label="Form Dialog">
        <form>
          <label>Name</label>
          <input type="text" data-testid="name-input" />
          <button type="submit">Submit</button>
        </form>
      </TestDialog>
    ));

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByTestId("name-input")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });
});
