/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { Content, InlineAlert } from "../src";

function root(): HTMLDivElement {
  return screen.getByTestId("inline-alert-root") as HTMLDivElement;
}

describe("InlineAlert (viviana-ui)", () => {
  // Pinned S2 InlineAlert.tsx spreads `filterDOMProps(props)` with no options and
  // then writes `role="alert"`: id and data attributes reach the root, while a
  // caller role, label or live-region attribute does not (#640).
  it("keeps the alert role and drops a caller role, label and live region", () => {
    render(() => (
      <InlineAlert
        id="backup-notice"
        data-testid="inline-alert-root"
        data-kind="backup"
        role="status"
        aria-label="Backup"
        aria-live="polite"
      >
        <Content>Backup saved.</Content>
      </InlineAlert>
    ));

    expect(screen.getByRole("alert")).toBe(root());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(root()).not.toHaveAttribute("aria-label");
    expect(root()).not.toHaveAttribute("aria-live");
    expect(root()).toHaveAttribute("id", "backup-notice");
    expect(root()).toHaveAttribute("data-kind", "backup");
  });
});
