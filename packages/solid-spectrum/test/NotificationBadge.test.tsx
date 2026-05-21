/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import {
  NotificationBadge,
  NotificationBadgeContext,
  Provider,
  type NotificationBadgeProps,
} from "../src";

describe("NotificationBadge (solid-spectrum)", () => {
  it("renders the S2 value badge structure", () => {
    render(() => (
      <NotificationBadge value={7} id="activity-count" data-testid="badge" aria-label="Updates" />
    ));

    const badge = screen.getByRole("img", { name: "Updates" });
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveTextContent("7");
    expect(badge).toHaveAttribute("id", "activity-count");
    expect(badge).toHaveAttribute("data-testid", "badge");
    expect(badge.className).not.toBe("");
  });

  it("formats capped values and localized indicator-only labels", () => {
    render(() => (
      <Provider locale="es-ES">
        <NotificationBadge value={99} data-testid="ninety-nine" />
        <NotificationBadge value={100} data-testid="overflow" />
        <NotificationBadge data-testid="indicator" />
      </Provider>
    ));

    expect(screen.getByTestId("ninety-nine")).toHaveTextContent("99");
    expect(screen.getByTestId("overflow")).toHaveTextContent("99+");
    expect(screen.getByRole("img", { name: "Nueva actividad" })).toBe(
      screen.getByTestId("indicator"),
    );
  });

  it("throws for non-positive and non-integer values", () => {
    expect(() => render(() => <NotificationBadge value={0} />)).toThrow(
      "Value cannot be negative or zero",
    );
    expect(() => render(() => <NotificationBadge value={-1} />)).toThrow(
      "Value cannot be negative or zero",
    );
    expect(() => render(() => <NotificationBadge value={1.5} />)).toThrow(
      "Value must be a positive integer",
    );
  });

  it("merges context props, unsafe escape hatches, and refs", () => {
    let contextRef: HTMLSpanElement | undefined;
    let localRef: HTMLSpanElement | undefined;

    render(() => (
      <NotificationBadgeContext.Provider
        value={{
          value: 4,
          size: "XL",
          staticColor: "white",
          isDisabled: true,
          UNSAFE_className: "context-badge",
          UNSAFE_style: { color: "red", margin: "1px" },
          ref: (element) => (contextRef = element),
        }}
      >
        <NotificationBadge
          data-testid="context-badge"
          value={8}
          UNSAFE_className="local-badge"
          UNSAFE_style={{ margin: "2px" }}
          ref={(element) => (localRef = element)}
        />
      </NotificationBadgeContext.Provider>
    ));

    const badge = screen.getByTestId("context-badge") as HTMLSpanElement;
    expect(badge).toHaveTextContent("8");
    expect(badge).toHaveClass("context-badge");
    expect(badge).toHaveClass("local-badge");
    expect(badge.style.color).toBe("red");
    expect(badge.style.margin).toBe("2px");
    expect(contextRef).toBe(badge);
    expect(localRef).toBe(badge);
  });

  it("matches S2 DOM prop filtering on the root", () => {
    const onClick = vi.fn();
    const props = {
      value: 3,
      class: "legacy-class",
      style: { margin: "99px" },
      hidden: true,
      onClick,
      id: "notifications",
      "data-testid": "filtered-badge",
      "aria-label": "Notifications",
      "aria-labelledby": "notification-label",
      "aria-describedby": "notification-description",
      "aria-details": "notification-details",
    } as unknown as NotificationBadgeProps;

    render(() => <NotificationBadge {...props} />);

    const badge = screen.getByTestId("filtered-badge");
    fireEvent.click(badge);

    expect(badge).toHaveAttribute("id", "notifications");
    expect(badge).toHaveAttribute("aria-label", "Notifications");
    expect(badge).toHaveAttribute("aria-labelledby", "notification-label");
    expect(badge).toHaveAttribute("aria-describedby", "notification-description");
    expect(badge).toHaveAttribute("aria-details", "notification-details");
    expect(badge).not.toHaveAttribute("hidden");
    expect(badge).not.toHaveClass("legacy-class");
    expect(badge.style.margin).toBe("");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses role img only when an aria label is available", () => {
    render(() => (
      <>
        <NotificationBadge value={2} data-testid="value-only" />
        <NotificationBadge value={2} aria-labelledby="external-label" data-testid="labelledby" />
        <NotificationBadge value={2} aria-label="Mentions" data-testid="labelled" />
      </>
    ));

    expect(screen.getByTestId("value-only")).not.toHaveAttribute("role");
    expect(screen.getByTestId("labelledby")).toHaveAttribute("aria-labelledby", "external-label");
    expect(screen.getByTestId("labelledby")).not.toHaveAttribute("role");
    expect(screen.getByRole("img", { name: "Mentions" })).toBe(screen.getByTestId("labelled"));
  });
});
