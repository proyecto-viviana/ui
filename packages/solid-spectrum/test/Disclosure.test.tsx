/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { ActionButton } from "../src";
import {
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosureTitle,
  DisclosureTrigger,
  DisclosurePanel,
} from "../src/disclosure";

describe("Disclosure (solid-spectrum)", () => {
  it("toggles expanded state from trigger interaction", async () => {
    const user = setupUser();

    render(() => (
      <Disclosure>
        <DisclosureTrigger>What is Solid Spectrum?</DisclosureTrigger>
        <DisclosurePanel>A styled component layer over headless primitives.</DisclosurePanel>
      </Disclosure>
    ));

    const trigger = screen.getByRole("button", { name: "What is Solid Spectrum?" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps single-expand behavior in DisclosureGroup by default", async () => {
    const user = setupUser();

    render(() => (
      <DisclosureGroup>
        <Disclosure id="one">
          <DisclosureTrigger>Section One</DisclosureTrigger>
          <DisclosurePanel>One</DisclosurePanel>
        </Disclosure>
        <Disclosure id="two">
          <DisclosureTrigger>Section Two</DisclosureTrigger>
          <DisclosurePanel>Two</DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    ));

    const one = screen.getByRole("button", { name: "Section One" });
    const two = screen.getByRole("button", { name: "Section Two" });

    await user.click(one);
    expect(one).toHaveAttribute("aria-expanded", "true");

    await user.click(two);
    expect(two).toHaveAttribute("aria-expanded", "true");
    expect(one).toHaveAttribute("aria-expanded", "false");
  });

  it("renders the S2 title/header/panel structure with size and density axes", () => {
    render(() => (
      <Disclosure size="XL" density="spacious" isQuiet>
        <DisclosureTitle level={4}>Styled Trigger</DisclosureTitle>
        <DisclosurePanel>Styled Panel</DisclosurePanel>
      </Disclosure>
    ));

    const trigger = screen.getByRole("button", { name: "Styled Trigger" });
    const panel = screen.getByRole("group", { hidden: true });
    const heading = screen.getByRole("heading", { level: 4, name: "Styled Trigger" });

    expect(heading).toHaveAttribute("data-rsp-slot", "disclosure-title");
    expect(heading.closest('[data-rsp-slot="disclosure-header"]')).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-rsp-slot", "disclosure-trigger");
    expect(trigger).toHaveAttribute("data-size", "XL");
    expect(trigger).toHaveAttribute("data-density", "spacious");
    expect(trigger).toHaveAttribute("data-quiet", "true");
    const chevron = trigger.querySelector('[data-rsp-slot="disclosure-chevron"]');
    expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(chevron).toHaveAttribute("viewBox", "0 0 14 14");
    expect(chevron?.querySelector("path")).toHaveAttribute(
      "d",
      "M10.361 6.328 5.03.996a.954.954 0 0 0-1.343 0 .95.95 0 0 0 0 1.344L8.346 7l-4.66 4.66a.95.95 0 0 0 1.344 1.344l5.331-5.332a.95.95 0 0 0 0-1.344",
    );
    expect(panel).toHaveAttribute("data-rsp-slot", "disclosure-panel");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel).toHaveAttribute("hidden", "until-found");
    expect(panel.firstElementChild).toHaveAttribute("data-rsp-slot", "disclosure-panel-content");
  });

  it("keeps header actions outside the disclosure trigger", async () => {
    const user = setupUser();

    render(() => (
      <Disclosure size="XL" density="compact" defaultExpanded>
        <DisclosureHeader>
          <DisclosureTitle>Billing</DisclosureTitle>
          <ActionButton aria-label="More actions">More</ActionButton>
        </DisclosureHeader>
        <DisclosurePanel>Billing details</DisclosurePanel>
      </Disclosure>
    ));

    const trigger = screen.getByRole("button", { name: "Billing" });
    const action = screen.getByRole("button", { name: "More actions" });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).not.toContainElement(action);
    expect(action).not.toHaveAttribute("data-size");

    await user.click(action);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
