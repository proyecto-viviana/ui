/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { type JSX } from "solid-js";
import {
  Button,
  ButtonGroup,
  Content,
  Heading,
  IllustratedMessage,
  IllustratedMessageContext,
  createIllustration,
} from "../src";

const TestIllustration = createIllustration(
  (props: JSX.SvgSVGAttributes<SVGSVGElement> & { size?: "S" | "M" | "L" }) => {
    const { size, ...svgProps } = props;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        data-received-size={size}
        {...svgProps}
      >
        <path d="M8 12h32v24H8z" fill="var(--iconPrimary, #222)" />
      </svg>
    );
  },
);

function root(): HTMLDivElement {
  return screen.getByTestId("message-root") as HTMLDivElement;
}

describe("IllustratedMessage (solid-spectrum)", () => {
  it("renders the S2 docs composition with generated child slot styles", () => {
    render(() => (
      <IllustratedMessage
        data-testid="message-root"
        id="empty-state"
        role="status"
        aria-label="Asset empty state"
        aria-describedby="empty-state-description"
        aria-details="empty-state-details"
        size="L"
        orientation="horizontal"
      >
        <TestIllustration slot="illustration" data-testid="message-illustration" />
        <Heading level={2} data-testid="message-heading">
          Create your first asset
        </Heading>
        <Content data-testid="message-content">Upload or import a file to begin.</Content>
        <span id="empty-state-description" hidden>
          Illustrated empty-state guidance.
        </span>
        <span id="empty-state-details" hidden>
          The comparison route covers illustration, heading, content, and actions.
        </span>
        <ButtonGroup data-testid="message-actions">
          <Button variant="secondary">Import</Button>
          <Button variant="accent">Upload</Button>
        </ButtonGroup>
      </IllustratedMessage>
    ));

    expect(root().tagName).toBe("DIV");
    expect(root()).toHaveAttribute("id", "empty-state");
    expect(root()).not.toHaveAttribute("role");
    expect(root()).not.toHaveAttribute("aria-label");
    expect(root()).not.toHaveAttribute("aria-describedby");
    expect(root()).not.toHaveAttribute("aria-details");
    expect(root().className).not.toBe("");

    const illustration = screen.getByTestId("message-illustration");
    expect(illustration).toHaveAttribute("data-slot", "illustration");
    expect(illustration).toHaveAttribute("aria-hidden", "true");
    expect(illustration).not.toHaveAttribute("size");
    expect(illustration).toHaveAttribute("data-received-size", "L");
    expect(illustration.className.baseVal).not.toBe("");

    const heading = screen.getByTestId("message-heading");
    expect(heading.tagName).toBe("H2");
    expect(heading.className).not.toBe("");
    expect(screen.getByTestId("message-content").className).not.toBe("");
    expect(screen.getByTestId("message-actions").className).not.toBe("");
    expect(screen.getByRole("button", { name: "Import" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
  });

  it("supports S2 context, slots, unsafe escape hatches, refs, and local overrides", () => {
    let contextRef: HTMLDivElement | undefined;
    let localRef: HTMLDivElement | undefined;

    render(() => (
      <IllustratedMessageContext.Provider
        value={{
          slots: {
            empty: {
              id: "context-message-root",
              size: "L",
              orientation: "horizontal",
              UNSAFE_className: "context-message",
              UNSAFE_style: { margin: "4px" },
              ref: (element) => (contextRef = element),
            },
          },
        }}
      >
        <IllustratedMessage
          slot="empty"
          data-testid="message-root"
          id="local-message-root"
          size="S"
          aria-label="Local empty state"
          UNSAFE_className="local-message"
          UNSAFE_style={{ margin: "8px" }}
          ref={(element) => (localRef = element)}
        >
          <TestIllustration slot="illustration" data-testid="message-illustration" />
        </IllustratedMessage>
      </IllustratedMessageContext.Provider>
    ));

    expect(root()).toHaveAttribute("id", "local-message-root");
    expect(root()).not.toHaveAttribute("aria-label");
    expect(root()).toHaveClass("context-message");
    expect(root()).toHaveClass("local-message");
    expect(root()).toHaveStyle({ margin: "8px" });
    expect(root()).not.toHaveAttribute("slot");
    expect(contextRef).toBe(root());
    expect(localRef).toBe(root());

    const illustration = screen.getByTestId("message-illustration");
    // Upstream maps both S and M IllustratedMessage illustrations to M.
    expect(illustration).toHaveAttribute("data-received-size", "M");
    expect(illustration.className.baseVal).not.toBe("");
  });

  it("inherits DropZone target context and filters arbitrary DOM event props", () => {
    const onClick = vi.fn();

    render(() => (
      <>
        <IllustratedMessageContext.Provider
          value={{ isInDropZone: true, isDropTarget: true, size: "L" }}
        >
          <IllustratedMessage data-testid="message-root" onClick={onClick}>
            <TestIllustration slot="illustration" data-testid="message-illustration" />
          </IllustratedMessage>
        </IllustratedMessageContext.Provider>
        <IllustratedMessage data-testid="baseline-message-root" size="L">
          <TestIllustration slot="illustration" data-testid="baseline-message-illustration" />
        </IllustratedMessage>
      </>
    ));

    const illustration = screen.getByTestId("message-illustration");
    expect(illustration.className.baseVal).not.toBe("");
    expect(illustration.className.baseVal).not.toBe(
      screen.getByTestId("baseline-message-illustration").className.baseVal,
    );

    fireEvent.click(root());
    expect(onClick).not.toHaveBeenCalled();
  });
});
