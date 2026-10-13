/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { Content, InlineAlert } from "../src";

function root(): HTMLDivElement {
  return screen.getByTestId("inline-alert-root") as HTMLDivElement;
}

describe("InlineAlert (viviana-ui)", () => {
  // Like pinned S2, the root is an alert unless told otherwise, and the default
  // DOM filter passes id and data attributes but no label or live-region
  // attribute (#640).
  it("is an alert by default and drops a caller label and live region", () => {
    render(() => (
      <InlineAlert
        id="backup-notice"
        data-testid="inline-alert-root"
        data-kind="backup"
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

  // Beyond S2 (#650): a notice that must not interrupt.
  it("takes the status role and follows it when it changes", () => {
    const [role, setRole] = createSignal<"alert" | "status">("status");
    render(() => (
      <InlineAlert data-testid="inline-alert-root" role={role()}>
        <Content>Backup saved.</Content>
      </InlineAlert>
    ));

    expect(screen.getByRole("status")).toBe(root());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    setRole("alert");
    flush();

    expect(screen.getByRole("alert")).toBe(root());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
