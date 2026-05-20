/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { createPointerEvent } from "@proyecto-viviana/solidaria-test-utils";
import { ContextualHelp } from "../src/contextualhelp";
import { ContextualHelpTrigger } from "../src/menu/ContextualHelpTrigger";

describe("ContextualHelpTrigger (solid-spectrum)", () => {
  const defaultChildren: [any, any] = [
    <span>Need help?</span>,
    <div>This is the help content.</div>,
  ];

  it("renders styled trigger", () => {
    render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Need help?")).toBeInTheDocument();
  });

  it("popover has styled content", () => {
    render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("This is the help content.")).toBeInTheDocument();
  });

  it("applies custom class", () => {
    const { container } = render(() => (
      <ContextualHelpTrigger class="my-help-trigger">{defaultChildren}</ContextualHelpTrigger>
    ));
    const wrapper = container.querySelector(".solidaria-ContextualHelpTrigger");
    expect(wrapper?.className).toContain("my-help-trigger");
  });

  it("opens and closes correctly", () => {
    render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
    const trigger = screen.getByRole("button");

    // Open
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close via Escape
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("provides a default accessible label when rendered as icon-only trigger", () => {
    render(() => <ContextualHelpTrigger content="Icon-only help content" />);

    expect(screen.getByRole("button", { name: "Contextual help" })).toBeInTheDocument();
  });

  it("allows overriding aria-label", () => {
    render(() => <ContextualHelpTrigger content="Help content" aria-label="More details" />);

    expect(screen.getByRole("button", { name: "More details" })).toBeInTheDocument();
  });
});

describe("ContextualHelp (solid-spectrum)", () => {
  it("opens a dialog popover from touch press instead of a tooltip", async () => {
    render(() => <ContextualHelp>Touch-accessible help content</ContextualHelp>);

    const trigger = screen.getByRole("button", { name: "Contextual help" });
    trigger.dispatchEvent(
      createPointerEvent("pointerdown", {
        pointerId: 1,
        pointerType: "touch",
        clientX: 0,
        clientY: 0,
      }),
    );
    trigger.dispatchEvent(
      createPointerEvent("pointerup", {
        pointerId: 1,
        pointerType: "touch",
        clientX: 0,
        clientY: 0,
      }),
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Contextual help" })).toBeInTheDocument();
    });
    expect(screen.getByText("Touch-accessible help content")).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", screen.getByRole("dialog").id);
  });

  it("supports controlled open state and info variant labels", async () => {
    render(() => (
      <ContextualHelp variant="info" isOpen>
        Informative contextual help content
      </ContextualHelp>
    ));

    expect(
      screen.getByRole("button", { name: "More information", hidden: true }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "More information" })).toBeInTheDocument();
    });
  });

  it("keeps the legacy content alias while rendering as a popover dialog", async () => {
    render(() => <ContextualHelp content="Alias help content" triggerLabel="Why unavailable?" />);

    const trigger = screen.getByRole("button", { name: "Why unavailable?" });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Why unavailable?" })).toBeInTheDocument();
    });
    expect(screen.getByText("Alias help content")).toBeInTheDocument();
  });
});
