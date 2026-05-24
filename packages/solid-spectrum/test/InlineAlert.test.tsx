/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Content, Heading, InlineAlert, InlineAlertContext } from "../src";

function root(): HTMLDivElement {
  return screen.getByTestId("inline-alert-root") as HTMLDivElement;
}

describe("InlineAlert (solid-spectrum)", () => {
  it("renders the S2 docs composition with icon and generated child styles", () => {
    render(() => (
      <InlineAlert
        data-testid="inline-alert-root"
        id="payment-alert"
        aria-label="Filtered alert label"
        aria-describedby="payment-alert-description"
        aria-details="payment-alert-details"
        variant="informative"
        fillStyle="subtleFill"
      >
        <Heading level={2} data-testid="inline-alert-heading">
          Payment Information
        </Heading>
        <Content data-testid="inline-alert-content">
          Enter your billing address, shipping address, and payment method to complete your
          purchase.
        </Content>
        <span id="payment-alert-description" hidden>
          Billing guidance.
        </span>
        <span id="payment-alert-details" hidden>
          The comparison route covers heading and content composition.
        </span>
      </InlineAlert>
    ));

    expect(root().tagName).toBe("DIV");
    expect(root()).toHaveAttribute("id", "payment-alert");
    expect(root()).toHaveAttribute("role", "alert");
    expect(root()).not.toHaveAttribute("aria-label");
    expect(root()).not.toHaveAttribute("aria-describedby");
    expect(root()).not.toHaveAttribute("aria-details");
    expect(root().className).not.toBe("");

    const icon = screen.getByRole("img", { name: "Information" });
    expect(icon).not.toHaveAttribute("data-slot");
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon.className.baseVal).not.toBe("");

    const heading = screen.getByTestId("inline-alert-heading");
    expect(heading.tagName).toBe("H2");
    expect(heading.className).not.toBe("");
    expect(screen.getByTestId("inline-alert-content").className).not.toBe("");
  });

  it("supports S2 context, slots, unsafe escape hatches, refs, and local overrides", () => {
    let contextRef: HTMLDivElement | undefined;
    let localRef: HTMLDivElement | undefined;

    render(() => (
      <InlineAlertContext.Provider
        value={{
          slots: {
            notice: {
              id: "context-alert",
              variant: "notice",
              fillStyle: "boldFill",
              autoFocus: true,
              UNSAFE_className: "context-alert",
              UNSAFE_style: { margin: "4px" },
              ref: (element) => (contextRef = element),
            },
          },
        }}
      >
        <InlineAlert
          slot="notice"
          data-testid="inline-alert-root"
          id="local-alert"
          variant="negative"
          fillStyle="border"
          UNSAFE_className="local-alert"
          UNSAFE_style={{ margin: "8px" }}
          ref={(element) => (localRef = element)}
        >
          <Heading>Payment Error</Heading>
          <Content>There was an error processing your request. Please try again.</Content>
        </InlineAlert>
      </InlineAlertContext.Provider>
    ));

    expect(root()).toHaveAttribute("id", "local-alert");
    expect(root()).toHaveAttribute("role", "alert");
    expect(root()).toHaveAttribute("tabindex", "-1");
    expect(root()).not.toHaveAttribute("slot");
    expect(root()).toHaveClass("context-alert");
    expect(root()).toHaveClass("local-alert");
    expect(root()).toHaveStyle({ margin: "8px" });
    expect(document.activeElement).toBe(root());
    expect(contextRef).toBe(root());
    expect(localRef).toBe(root());
    expect(screen.getByRole("img", { name: "Error" })).toBeInTheDocument();
  });

  it("renders neutral without an icon and filters arbitrary DOM event props", () => {
    const onClick = vi.fn();

    render(() => (
      <InlineAlert data-testid="inline-alert-root" onClick={onClick}>
        <Heading>Payment Information</Heading>
        <Content>Enter your billing address.</Content>
      </InlineAlert>
    ));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    fireEvent.click(root());
    expect(onClick).not.toHaveBeenCalled();
  });
});
