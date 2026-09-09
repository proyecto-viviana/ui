/** @vitest-environment jsdom */
import { render, screen, within } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { TerminalLog } from "../src/well";
import { declarationsFor, reducedMotionDeclarationsFor } from "./pixel-css";

const BOOT = [
  { time: "09:12", text: "boot", channel: "muted" as const },
  { time: "09:13", text: "link up", channel: "info" as const },
  { time: "09:14", text: "sync failed", channel: "fault" as const },
];

describe("TerminalLog", () => {
  it("renders the transcript as an ordered list with real timestamps", () => {
    render(() => <TerminalLog aria-label="Console" lines={BOOT} />);

    const log = screen.getByLabelText("Console");
    expect(log.tagName).toBe("OL");
    const items = within(log).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    /* A timestamp is machine-readable content, not decoration in front of it. */
    expect(within(items[0]!).getByText("09:12").tagName).toBe("TIME");
    /* No live region: nothing here should be announced as it renders. */
    expect(log).not.toHaveAttribute("aria-live");
    expect(log).not.toHaveAttribute("role");
  });

  it("inks each span on its own channel and falls back to the line's", () => {
    render(() => (
      <TerminalLog
        aria-label="Console"
        lines={[
          {
            channel: "prompt",
            spans: [{ text: "run build" }, { text: " ok", channel: "metric" }],
          },
        ]}
      />
    ));

    const [command, result] = within(screen.getByLabelText("Console"))
      .getAllByRole("listitem")[0]!
      .querySelectorAll<HTMLElement>("span");
    /* Spans without a channel report on the line's channel — silently dropping to
     * the well's grey would erase the distinction between a prompt and its echo. */
    expect(declarationsFor(command!)).toMatch(/color:var\(--terminal-prompt\)/);
    expect(declarationsFor(result!)).toMatch(/color:var\(--status-metric\)/);
  });

  it("staggers the boot reveal per line, and only when asked", () => {
    const booting = render(() => <TerminalLog aria-label="Boot" lines={BOOT} bootIn />);
    const plain = render(() => <TerminalLog aria-label="Plain" lines={BOOT} />);

    const bootItems = within(booting.getByLabelText("Boot")).getAllByRole("listitem");
    /* Each line waits one step longer than the one above it; a shared delay would
     * flash the whole log in at once, which is not a boot. */
    expect(bootItems.map((item) => item.style.animationDelay)).toEqual(["0.3s", "0.58s", "0.86s"]);
    /* `both` keeps a line hidden through its delay — without it the stagger is
     * invisible because every line is already painted. */
    expect(declarationsFor(bootItems[1]!)).toMatch(/animation-fill-mode:both/);
    expect(reducedMotionDeclarationsFor(bootItems[1]!)).toMatch(/animation-name:none/);

    const plainItems = within(plain.getByLabelText("Plain")).getAllByRole("listitem");
    /* Without bootIn the lines must be plainly present: an animation with no delay
     * still hides them for a frame, and a stuck fill-mode hides them forever. */
    expect(plainItems[1]!.style.animationDelay).toBe("");
    expect(declarationsFor(plainItems[1]!)).not.toMatch(/animation-fill-mode/);

    booting.unmount();
    plain.unmount();
  });

  it("draws the caret only when asked, and never as a line of the transcript", () => {
    const withCaret = render(() => <TerminalLog aria-label="Live" lines={BOOT} showCaret />);
    const withoutCaret = render(() => <TerminalLog aria-label="Done" lines={BOOT} />);

    const log = withCaret.getByLabelText("Live");
    /* The caret is a mark waiting for input: it must not add a fourth entry to a
     * three-line transcript for a reader. */
    expect(within(log).getAllByRole("listitem")).toHaveLength(3);
    const caretItem = log.lastElementChild as HTMLElement;
    expect(caretItem).toHaveAttribute("aria-hidden", "true");
    const caret = caretItem.querySelector<HTMLElement>("span")!;
    expect(declarationsFor(caret)).toMatch(/animation-duration:1\.1s/);
    expect(declarationsFor(caret)).toMatch(/animation-timing-function:step-end/);
    expect(reducedMotionDeclarationsFor(caret)).toMatch(/animation-name:none/);

    expect(withoutCaret.getByLabelText("Done").querySelector('[aria-hidden="true"]')).toBeNull();

    withCaret.unmount();
    withoutCaret.unmount();
  });
});
