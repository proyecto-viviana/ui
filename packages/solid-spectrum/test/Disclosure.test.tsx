/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Disclosure, DisclosureGroup, DisclosureTrigger, DisclosurePanel } from "../src/disclosure";

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

  it("applies variant and size styling classes", () => {
    render(() => (
      <Disclosure variant="filled" size="sm">
        <DisclosureTrigger>Styled Trigger</DisclosureTrigger>
        <DisclosurePanel>Styled Panel</DisclosurePanel>
      </Disclosure>
    ));

    const trigger = screen.getByRole("button", { name: "Styled Trigger" });
    const panel = screen.getByRole("group", { hidden: true });

    expect(trigger).toHaveClass("px-3");
    expect(trigger).toHaveClass("py-2");
    expect(panel).toHaveClass("bg-bg-300/50");
  });
});
