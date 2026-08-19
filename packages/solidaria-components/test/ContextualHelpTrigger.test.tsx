/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { ContextualHelpTrigger } from "../src/ContextualHelpTrigger";

describe("ContextualHelpTrigger (headless)", () => {
  const defaultChildren: [any, any] = [
    <span>Help trigger</span>,
    <div>Help content goes here</div>,
  ];

  describe("basic rendering", () => {
    it("renders trigger as button", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("Help trigger")).toBeInTheDocument();
    });

    it("does not show content initially", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      expect(screen.queryByText("Help content goes here")).not.toBeInTheDocument();
    });
  });

  describe("open/close behavior", () => {
    it("opens help popover on click", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("Help content goes here")).toBeInTheDocument();
    });

    it("closes on Escape", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("toggles on repeated click", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      fireEvent.click(trigger);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes on outside pointer interaction", () => {
      render(() => (
        <div>
          <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>
          <button type="button">outside</button>
        </div>
      ));
      fireEvent.click(screen.getByRole("button", { name: "Help trigger" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      const outside = screen.getByRole("button", { name: "outside" });
      fireEvent.pointerDown(outside, { button: 0, isPrimary: true });
      fireEvent.click(outside);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not close when interacting inside the dialog", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      fireEvent.click(screen.getByRole("button"));
      const dialog = screen.getByRole("dialog");
      fireEvent.pointerDown(dialog, { button: 0, isPrimary: true });
      fireEvent.click(dialog);
      expect(dialog).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it('trigger has aria-haspopup="dialog"', () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      expect(screen.getByRole("button").getAttribute("aria-haspopup")).toBe("dialog");
    });

    it("trigger has aria-expanded when open", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      const trigger = screen.getByRole("button");
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });

    it('content has role="dialog"', () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("links trigger aria-controls to dialog id when open", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      const dialog = screen.getByRole("dialog");
      expect(trigger).toHaveAttribute("aria-controls", dialog.id);
    });

    it("labels dialog with trigger via aria-labelledby", () => {
      render(() => <ContextualHelpTrigger>{defaultChildren}</ContextualHelpTrigger>);
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", trigger.id);
    });
  });

  describe("states", () => {
    it("isUnavailable shows data attribute", () => {
      render(() => <ContextualHelpTrigger isUnavailable>{defaultChildren}</ContextualHelpTrigger>);
      expect(screen.getByRole("button").hasAttribute("data-unavailable")).toBe(true);
    });

    it("isDisabled sets disabled and prevents opening", () => {
      render(() => <ContextualHelpTrigger isDisabled>{defaultChildren}</ContextualHelpTrigger>);
      const trigger = screen.getByRole("button");
      expect(trigger).toBeDisabled();
      fireEvent.click(trigger);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
