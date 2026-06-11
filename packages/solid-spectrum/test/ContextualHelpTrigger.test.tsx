/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createPointerEvent } from "@proyecto-viviana/solidaria-test-utils";
import { ContextualHelp, ContextualHelpContext } from "../src/contextualhelp";
import { ContextualHelpTrigger } from "../src/menu/ContextualHelpTrigger";
import { Content, Footer, Heading } from "../src/text";

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

    const trigger = screen.getByRole("button", { name: "Help" });
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
      expect(screen.getByRole("dialog", { name: "Help" })).toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: "Information", hidden: true })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Information" })).toBeInTheDocument();
    });
  });

  it("reacts to controlled open state changes", async () => {
    const ControlledContextualHelp = () => {
      const [isOpen, setOpen] = createSignal(false);

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open externally
          </button>
          <ContextualHelp isOpen={isOpen()} onOpenChange={setOpen}>
            Controlled help content
          </ContextualHelp>
        </>
      );
    };

    render(() => <ControlledContextualHelp />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open externally" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Help" })).toBeInTheDocument();
    });
    expect(screen.getByText("Controlled help content")).toBeInTheDocument();
  });

  it("keeps the legacy content alias while rendering as a popover dialog", async () => {
    render(() => <ContextualHelp content="Alias help content" triggerLabel="Why unavailable?" />);

    const trigger = screen.getByRole("button", { name: "Why unavailable? Help" });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Why unavailable? Help" })).toBeInTheDocument();
    });
    expect(screen.getByText("Alias help content")).toBeInTheDocument();
  });

  it("styles Heading, Content, and Footer children using the S2 contextual help slots", async () => {
    render(() => (
      <ContextualHelp isOpen>
        <Heading>Permission required</Heading>
        <Content>Your admin must grant permission.</Content>
        <Footer>Learn more about segments</Footer>
      </ContextualHelp>
    ));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Help" })).toBeInTheDocument();
    });
    const heading = screen.getByRole("heading", { name: "Permission required", level: 2 });
    expect(heading.id).toBeTruthy();
    expect(heading.className).toBeTruthy();
    expect(screen.getByText("Your admin must grant permission.").className).toBeTruthy();
    expect(screen.getByText("Learn more about segments").className).toBeTruthy();
  });

  it("accepts ContextualHelpContext trigger props and refs", async () => {
    let triggerRef: HTMLButtonElement | undefined;
    render(() => (
      <ContextualHelpContext.Provider
        value={{
          id: "field-help",
          "aria-labelledby": "field-label field-help",
          size: "S",
          ref: (element) => {
            triggerRef = element;
          },
        }}
      >
        <ContextualHelp isOpen>
          <Heading>Context from field label</Heading>
          <Content>Contextual help content</Content>
        </ContextualHelp>
      </ContextualHelpContext.Provider>
    ));

    const trigger = document.getElementById("field-help");
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("id", "field-help");
    expect(trigger).toHaveAttribute("aria-labelledby", "field-label field-help");
    expect(triggerRef).toBe(trigger);
  });
});
