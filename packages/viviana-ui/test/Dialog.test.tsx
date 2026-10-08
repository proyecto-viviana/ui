/** @vitest-environment jsdom */
import { afterEach, describe, it, expect } from "vite-plus/test";
import { createSignal } from "solid-js";
import { cleanup, render, screen, waitFor, within } from "@solidjs/testing-library";
import { AlertDialog } from "../src/dialog";
afterEach(cleanup);

describe("AlertDialog caller contract", () => {
  it("forwards live caller attributes without replacing the open root or focused child", async () => {
    const [value, setValue] = createSignal<string | undefined>();
    render(() => (
      <>
        <span id="label-A">External A</span>
        <span id="label-B">External B</span>
        <span id="description-A">Description A</span>
        <span id="description-B">Description B</span>
        <span id="details-A">Details A</span>
        <span id="details-B">Details B</span>
        <AlertDialog
          defaultOpen
          title="Generated title"
          id={value() && `dialog-${value()}`}
          data-marker={value()}
          aria-label={value() && `Caller ${value()}`}
          aria-labelledby={value() && `label-${value()}`}
          aria-describedby={value() && `description-${value()}`}
          aria-details={value() && `details-${value()}`}
          {...({ role: "dialog" } as Record<string, unknown>)}
        >
          <span>Generated content</span>
          <input aria-label="Persistent input" />
        </AlertDialog>
      </>
    ));
    const root = screen.getByRole("alertdialog");
    const child = within(root).getByText("Generated content");
    const input = within(root).getByRole("textbox");
    input.focus();
    for (const next of [undefined, "A", "B", undefined, "A"]) {
      setValue(next);
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBe(root);
        expect(within(root).getByText("Generated content")).toBe(child);
        expect(within(root).getByRole("textbox")).toBe(input);
        expect(input).toHaveFocus();
        expect(root).toHaveAttribute("role", "alertdialog");
        if (next) {
          expect(root).toHaveAttribute("id", `dialog-${next}`);
          expect(root).toHaveAttribute("data-marker", next);
          expect(root).toHaveAttribute("aria-label", `Caller ${next}`);
          expect(root).toHaveAttribute("aria-labelledby", `label-${next}`);
          expect(root).toHaveAttribute("aria-describedby", `description-${next}`);
          expect(root).toHaveAttribute("aria-details", `details-${next}`);
          expect(document.getElementById(root.getAttribute("aria-details")!)).toHaveTextContent(
            `Details ${next}`,
          );
          expect(root).toHaveAccessibleName(`External ${next}`);
          expect(root).toHaveAccessibleDescription(`Description ${next}`);
        } else {
          // The trigger may supply its own generated overlay id.
          expect(root.id).not.toMatch(/^dialog-[AB]$/);
          expect(root).not.toHaveAttribute("data-marker");
          expect(root).not.toHaveAttribute("aria-label");
          expect(root).not.toHaveAttribute("aria-details");
          expect(root).toHaveAccessibleName("Generated title");
          expect(root).toHaveAccessibleDescription("Generated content");
          expect(document.getElementById(root.getAttribute("aria-labelledby")!)).toHaveTextContent(
            "Generated title",
          );
          expect(document.getElementById(root.getAttribute("aria-describedby")!)).toContainElement(
            child,
          );
        }
      });
    }
  });

  it("applies external naming precedence and live explicit label fallback", async () => {
    const [label, setLabel] = createSignal<string | undefined>("Caller name");
    const [labelledby, setLabelledby] = createSignal<string | undefined>("external-name");
    render(() => (
      <>
        <span id="external-name">External name</span>
        <AlertDialog
          defaultOpen
          title="Visible title"
          aria-label={label()}
          aria-labelledby={labelledby()}
        >
          Body copy
        </AlertDialog>
      </>
    ));
    const root = screen.getByRole("alertdialog");
    expect(root).toHaveAccessibleName("External name");
    setLabelledby(undefined);
    await waitFor(() => {
      expect(root).toHaveAccessibleName("Caller name");
      expect(root).not.toHaveAttribute("aria-labelledby");
    });
    setLabel("Updated caller name");
    await waitFor(() => {
      expect(root).toHaveAccessibleName("Updated caller name");
      expect(root).not.toHaveAttribute("aria-labelledby");
      expect(root).toHaveAccessibleDescription("Body copy");
      expect(document.getElementById(root.getAttribute("aria-describedby")!)).toHaveTextContent(
        "Body copy",
      );
    });
  });
});
