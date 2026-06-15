/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from "vitest";
import { cleanup, render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { assertNoA11yViolations } from "@proyecto-viviana/solidaria-test-utils";
import {
  Accordion,
  AccordionContext,
  AccordionItem,
  AccordionItemHeader,
  AccordionItemPanel,
  AccordionItemTitle,
  ActionButton,
} from "../src";

describe("Accordion (solid-spectrum)", () => {
  afterEach(() => {
    cleanup();
  });

  it("exports the S2 context and renders the documented item structure", () => {
    const { container } = render(() => (
      <Accordion defaultExpandedKeys={["personal"]} size="L" density="spacious" isQuiet>
        <AccordionItem id="personal">
          <AccordionItemTitle level={3}>Personal Information</AccordionItemTitle>
          <AccordionItemPanel>Name fields</AccordionItemPanel>
        </AccordionItem>
        <AccordionItem id="billing">
          <AccordionItemTitle level={3}>Billing Address</AccordionItemTitle>
          <AccordionItemPanel>Billing fields</AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    ));

    const root = container.firstElementChild;
    const personalTrigger = screen.getByRole("button", { name: "Personal Information" });
    const billingTrigger = screen.getByRole("button", { name: "Billing Address" });
    const personalPanel = screen.getByText("Name fields").closest('[role="group"]');
    const billingPanel = screen.getByText("Billing fields").closest('[role="group"]');

    expect(AccordionContext).toBeDefined();
    expect(root).toHaveAttribute("data-rsp-component", "DisclosureGroup");
    expect(root).toHaveAttribute("data-size", "L");
    expect(root).toHaveAttribute("data-density", "spacious");
    expect(root).toHaveAttribute("data-quiet", "true");
    expect(personalTrigger).toHaveAttribute("aria-expanded", "true");
    expect(personalTrigger).toHaveAttribute("data-size", "L");
    expect(personalTrigger).toHaveAttribute("data-density", "spacious");
    expect(billingTrigger).toHaveAttribute("aria-expanded", "false");
    expect(personalPanel).toHaveAttribute("aria-hidden", "false");
    expect(billingPanel).toHaveAttribute("hidden", "until-found");
  });

  it("forwards explicit AccordionItemPanel roles through the public S2 wrapper", () => {
    render(() => (
      <Accordion defaultExpandedKeys={["region"]}>
        <AccordionItem id="region">
          <AccordionItemTitle>Regional details</AccordionItemTitle>
          <AccordionItemPanel role="region">Regional content</AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    ));

    const trigger = screen.getByRole("button", { name: "Regional details" });
    const panel = screen.getByRole("region");
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
  });

  it("supports multiple expansion and Set<Key> change payloads", async () => {
    const user = setupUser();
    const changes: string[][] = [];

    render(() => (
      <Accordion
        allowsMultipleExpanded
        onExpandedChange={(keys) => {
          changes.push([...keys].map(String).sort());
        }}
      >
        <AccordionItem id="one">
          <AccordionItemTitle>One</AccordionItemTitle>
          <AccordionItemPanel>One content</AccordionItemPanel>
        </AccordionItem>
        <AccordionItem id="two">
          <AccordionItemTitle>Two</AccordionItemTitle>
          <AccordionItemPanel>Two content</AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    ));

    const one = screen.getByRole("button", { name: "One" });
    const two = screen.getByRole("button", { name: "Two" });

    await user.click(one);
    await user.click(two);

    expect(one).toHaveAttribute("aria-expanded", "true");
    expect(two).toHaveAttribute("aria-expanded", "true");
    expect(changes).toEqual([["one"], ["one", "two"]]);
  });

  it("keeps trigger and panel ids unique across multiple accordion instances", () => {
    render(() => (
      <>
        <Accordion defaultExpandedKeys={["shared"]}>
          <AccordionItem id="shared">
            <AccordionItemTitle>Shared item</AccordionItemTitle>
            <AccordionItemPanel>First shared content</AccordionItemPanel>
          </AccordionItem>
        </Accordion>
        <Accordion defaultExpandedKeys={["shared"]}>
          <AccordionItem id="shared">
            <AccordionItemTitle>Shared item</AccordionItemTitle>
            <AccordionItemPanel>Second shared content</AccordionItemPanel>
          </AccordionItem>
        </Accordion>
      </>
    ));

    const triggers = screen.getAllByRole("button", { name: "Shared item" });
    const panels = [
      screen.getByText("First shared content").closest('[role="group"]'),
      screen.getByText("Second shared content").closest('[role="group"]'),
    ];
    const ids = [...triggers.map((trigger) => trigger.id), ...panels.map((panel) => panel?.id)];

    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);

    for (const [index, trigger] of triggers.entries()) {
      const panel = panels[index];
      expect(trigger).toHaveAttribute("aria-controls", panel?.id);
      expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    }
  });

  it("forwards refs through the public S2 Accordion wrappers", () => {
    let accordionRef: HTMLDivElement | undefined;
    let itemRef: HTMLDivElement | undefined;
    let headerRef: HTMLDivElement | undefined;
    let titleRef: HTMLHeadingElement | undefined;
    let panelRef: HTMLDivElement | undefined;

    render(() => (
      <Accordion defaultExpandedKeys={["profile"]} ref={(el) => (accordionRef = el)}>
        <AccordionItem id="profile" ref={(el) => (itemRef = el)}>
          <AccordionItemHeader ref={(el) => (headerRef = el)}>
            <AccordionItemTitle ref={(el) => (titleRef = el)}>Profile</AccordionItemTitle>
          </AccordionItemHeader>
          <AccordionItemPanel ref={(el) => (panelRef = el)}>Profile content</AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    ));

    const trigger = screen.getByRole("button", { name: "Profile" });
    const panel = screen.getByRole("group");

    expect(accordionRef).toHaveAttribute("data-rsp-component", "DisclosureGroup");
    expect(itemRef).toHaveAttribute("data-rsp-component", "Disclosure");
    expect(headerRef).toHaveAttribute("data-rsp-slot", "disclosure-header");
    expect(titleRef).toHaveAttribute("data-rsp-slot", "disclosure-title");
    expect(titleRef).toContainElement(trigger);
    expect(panelRef).toBe(panel);
    expect(panelRef).toHaveAttribute("data-rsp-slot", "disclosure-panel");
  });

  it("axe: documented S2 Accordion structure", async () => {
    const { container } = render(() => (
      <Accordion defaultExpandedKeys={["personal"]}>
        <AccordionItem id="personal">
          <AccordionItemTitle>Personal Information</AccordionItemTitle>
          <AccordionItemPanel>Name fields</AccordionItemPanel>
        </AccordionItem>
        <AccordionItem id="billing">
          <AccordionItemHeader>
            <AccordionItemTitle>Billing Address</AccordionItemTitle>
            <ActionButton aria-label="More billing actions">More</ActionButton>
          </AccordionItemHeader>
          <AccordionItemPanel>Billing fields</AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    ));

    await assertNoA11yViolations(container);
  });

  it("keeps AccordionItemHeader actions adjacent to, not inside, the title trigger", async () => {
    const user = setupUser();

    render(() => (
      <Accordion defaultExpandedKeys={["payment"]} size="XL" density="compact">
        <AccordionItem id="payment">
          <AccordionItemHeader>
            <AccordionItemTitle>Payment</AccordionItemTitle>
            <ActionButton aria-label="More actions">More</ActionButton>
          </AccordionItemHeader>
          <AccordionItemPanel>Payment details</AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    ));

    const trigger = screen.getByRole("button", { name: "Payment" });
    const action = screen.getByRole("button", { name: "More actions" });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).not.toContainElement(action);
    expect(action).not.toHaveAttribute("data-size");

    await user.click(action);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
