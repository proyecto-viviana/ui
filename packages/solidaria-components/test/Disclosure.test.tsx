/**
 * Disclosure tests - Port of React Aria's Disclosure.test.tsx
 *
 * Tests for Disclosure and DisclosureGroup (Accordion) functionality including:
 * - Basic expand/collapse behavior
 * - Keyboard interactions
 * - ARIA attributes
 * - Disabled states
 * - Accordion (DisclosureGroup) behavior
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { Disclosure, DisclosureTrigger, DisclosurePanel, DisclosureGroup } from "../src/Disclosure";
import { firePointerClick, setupUser } from "@proyecto-viviana/solidaria-test-utils";

// User event instance - created per test
let user: ReturnType<typeof setupUser>;

describe("Disclosure", () => {
  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // BASIC BEHAVIOR
  // ============================================

  describe("basic behavior", () => {
    it("should render collapsed by default", () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      const panel = screen.getByRole("group", { hidden: true });
      expect(panel).toHaveAttribute("hidden", "until-found");
      expect(panel).toHaveAttribute("aria-hidden", "true");
    });

    it("should expand on trigger click", async () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      firePointerClick(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const panel = screen.getByRole("group");
      expect(panel).not.toHaveAttribute("hidden");
      expect(panel).toHaveAttribute("aria-hidden", "false");
    });

    it("should collapse on trigger click when expanded", async () => {
      render(() => (
        <Disclosure defaultExpanded>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      firePointerClick(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("should support defaultExpanded", () => {
      render(() => (
        <Disclosure defaultExpanded>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      const panel = screen.getByRole("group");
      expect(panel).not.toHaveAttribute("hidden");
    });

    it("should support controlled isExpanded", async () => {
      const onExpandedChange = vi.fn();

      render(() => (
        <Disclosure isExpanded={false} onExpandedChange={onExpandedChange}>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      await user.click(trigger);

      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });

    it("should fire onExpandedChange callback", async () => {
      const onExpandedChange = vi.fn();

      render(() => (
        <Disclosure onExpandedChange={onExpandedChange}>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      await user.click(trigger);

      expect(onExpandedChange).toHaveBeenCalledWith(true);

      await user.click(trigger);
      expect(onExpandedChange).toHaveBeenCalledWith(false);
    });
  });

  // ============================================
  // KEYBOARD INTERACTIONS
  // ============================================

  describe("keyboard interactions", () => {
    it("should expand on Enter key", async () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      trigger.focus();
      await user.keyboard("{Enter}");

      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("should expand on Space key", async () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      trigger.focus();
      await user.keyboard(" ");

      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("should toggle on repeated key presses", async () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      trigger.focus();

      await user.keyboard("{Enter}");
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      await user.keyboard("{Enter}");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have button role on trigger", () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      expect(trigger).toBeInTheDocument();
    });

    it("should have aria-expanded on trigger", () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      expect(trigger).toHaveAttribute("aria-expanded");
    });

    it("should have aria-controls linking trigger to panel", () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      const panel = screen.getByRole("group", { hidden: true });

      expect(trigger).toHaveAttribute("aria-controls", panel.id);
    });

    it("should default the panel role to group", () => {
      render(() => (
        <Disclosure defaultExpanded>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const panel = screen.getByRole("group");
      expect(panel).toBeInTheDocument();
    });

    it("should have aria-labelledby on panel linking to trigger", () => {
      render(() => (
        <Disclosure defaultExpanded>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      const panel = screen.getByRole("group");

      expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    });

    it("should support overriding the panel role", () => {
      render(() => (
        <Disclosure defaultExpanded>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel role="region">Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("should pass labelable ARIA props to the panel", () => {
      render(() => (
        <Disclosure defaultExpanded>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel aria-label="Details panel">Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const panel = screen.getByRole("group");
      expect(panel).toHaveAttribute("aria-label", "Details panel");
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled on Disclosure", () => {
      render(() => (
        <Disclosure isDisabled>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      expect(trigger).toBeDisabled();
    });

    it("should not expand when disabled", async () => {
      render(() => (
        <Disclosure isDisabled>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const trigger = screen.getByRole("button", { name: "Show more" });
      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("should have data-disabled attribute when disabled", () => {
      render(() => (
        <Disclosure isDisabled>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const disclosure = document.querySelector(".solidaria-Disclosure");
      expect(disclosure).toHaveAttribute("data-disabled");
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-expanded when expanded", async () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      const disclosure = document.querySelector(".solidaria-Disclosure");
      expect(disclosure).not.toHaveAttribute("data-expanded");

      const trigger = screen.getByRole("button", { name: "Show more" });
      await user.click(trigger);

      expect(disclosure).toHaveAttribute("data-expanded");
    });

    it("should have default class on components", () => {
      render(() => (
        <Disclosure>
          <DisclosureTrigger>Show more</DisclosureTrigger>
          <DisclosurePanel>Hidden content</DisclosurePanel>
        </Disclosure>
      ));

      expect(document.querySelector(".solidaria-Disclosure")).toBeInTheDocument();
      expect(document.querySelector(".solidaria-DisclosurePanel")).toBeInTheDocument();
    });
  });

  // ============================================
  // DISCLOSURE GROUP (ACCORDION)
  // ============================================

  describe("DisclosureGroup (Accordion)", () => {
    it("should render group with multiple disclosures", () => {
      render(() => (
        <DisclosureGroup>
          <Disclosure id="item1">
            <DisclosureTrigger>Item 1</DisclosureTrigger>
            <DisclosurePanel>Content 1</DisclosurePanel>
          </Disclosure>
          <Disclosure id="item2">
            <DisclosureTrigger>Item 2</DisclosureTrigger>
            <DisclosurePanel>Content 2</DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      ));

      expect(screen.getByRole("button", { name: "Item 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Item 2" })).toBeInTheDocument();
    });

    it("should allow only one expanded by default (accordion behavior)", async () => {
      render(() => (
        <DisclosureGroup>
          <Disclosure id="item1">
            <DisclosureTrigger>Item 1</DisclosureTrigger>
            <DisclosurePanel>Content 1</DisclosurePanel>
          </Disclosure>
          <Disclosure id="item2">
            <DisclosureTrigger>Item 2</DisclosureTrigger>
            <DisclosurePanel>Content 2</DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      ));

      const trigger1 = screen.getByRole("button", { name: "Item 1" });
      const trigger2 = screen.getByRole("button", { name: "Item 2" });

      // Expand first item
      await user.click(trigger1);
      expect(trigger1).toHaveAttribute("aria-expanded", "true");
      expect(trigger2).toHaveAttribute("aria-expanded", "false");

      // Expand second item - first should collapse
      await user.click(trigger2);
      expect(trigger1).toHaveAttribute("aria-expanded", "false");
      expect(trigger2).toHaveAttribute("aria-expanded", "true");
    });

    it("should support allowsMultipleExpanded", async () => {
      render(() => (
        <DisclosureGroup allowsMultipleExpanded>
          <Disclosure id="item1">
            <DisclosureTrigger>Item 1</DisclosureTrigger>
            <DisclosurePanel>Content 1</DisclosurePanel>
          </Disclosure>
          <Disclosure id="item2">
            <DisclosureTrigger>Item 2</DisclosureTrigger>
            <DisclosurePanel>Content 2</DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      ));

      const trigger1 = screen.getByRole("button", { name: "Item 1" });
      const trigger2 = screen.getByRole("button", { name: "Item 2" });

      // Expand both items
      await user.click(trigger1);
      await user.click(trigger2);

      expect(trigger1).toHaveAttribute("aria-expanded", "true");
      expect(trigger2).toHaveAttribute("aria-expanded", "true");
    });

    it("should support defaultExpandedKeys", () => {
      render(() => (
        <DisclosureGroup defaultExpandedKeys={["item2"]}>
          <Disclosure id="item1">
            <DisclosureTrigger>Item 1</DisclosureTrigger>
            <DisclosurePanel>Content 1</DisclosurePanel>
          </Disclosure>
          <Disclosure id="item2">
            <DisclosureTrigger>Item 2</DisclosureTrigger>
            <DisclosurePanel>Content 2</DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      ));

      const trigger1 = screen.getByRole("button", { name: "Item 1" });
      const trigger2 = screen.getByRole("button", { name: "Item 2" });

      expect(trigger1).toHaveAttribute("aria-expanded", "false");
      expect(trigger2).toHaveAttribute("aria-expanded", "true");
    });

    it("should support controlled expandedKeys", async () => {
      const onExpandedChange = vi.fn();

      render(() => (
        <DisclosureGroup expandedKeys={["item1"]} onExpandedChange={onExpandedChange}>
          <Disclosure id="item1">
            <DisclosureTrigger>Item 1</DisclosureTrigger>
            <DisclosurePanel>Content 1</DisclosurePanel>
          </Disclosure>
          <Disclosure id="item2">
            <DisclosureTrigger>Item 2</DisclosureTrigger>
            <DisclosurePanel>Content 2</DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      ));

      const trigger1 = screen.getByRole("button", { name: "Item 1" });
      expect(trigger1).toHaveAttribute("aria-expanded", "true");

      const trigger2 = screen.getByRole("button", { name: "Item 2" });
      await user.click(trigger2);

      expect(onExpandedChange).toHaveBeenCalled();
    });

    it("should disable all items when group is disabled", () => {
      render(() => (
        <DisclosureGroup isDisabled>
          <Disclosure id="item1">
            <DisclosureTrigger>Item 1</DisclosureTrigger>
            <DisclosurePanel>Content 1</DisclosurePanel>
          </Disclosure>
          <Disclosure id="item2">
            <DisclosureTrigger>Item 2</DisclosureTrigger>
            <DisclosurePanel>Content 2</DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      ));

      const trigger1 = screen.getByRole("button", { name: "Item 1" });
      const trigger2 = screen.getByRole("button", { name: "Item 2" });

      expect(trigger1).toBeDisabled();
      expect(trigger2).toBeDisabled();
    });

    it("should react to isDisabled changes on DisclosureGroup", async () => {
      const [isDisabled, setIsDisabled] = createSignal(false);

      render(() => (
        <>
          <button data-testid="toggle-disabled" onClick={() => setIsDisabled((prev) => !prev)}>
            Toggle disabled
          </button>
          <DisclosureGroup isDisabled={isDisabled()}>
            <Disclosure id="item1">
              <DisclosureTrigger>Item 1</DisclosureTrigger>
              <DisclosurePanel>Content 1</DisclosurePanel>
            </Disclosure>
            <Disclosure id="item2">
              <DisclosureTrigger>Item 2</DisclosureTrigger>
              <DisclosurePanel>Content 2</DisclosurePanel>
            </Disclosure>
          </DisclosureGroup>
        </>
      ));

      const trigger1 = screen.getByRole("button", { name: "Item 1" });
      const toggle = screen.getByTestId("toggle-disabled");

      expect(trigger1).not.toBeDisabled();

      await user.click(toggle);
      await waitFor(() => {
        expect(trigger1).toBeDisabled();
      });
    });

    it("should have default class on group", () => {
      render(() => (
        <DisclosureGroup>
          <Disclosure id="item1">
            <DisclosureTrigger>Item 1</DisclosureTrigger>
            <DisclosurePanel>Content 1</DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      ));

      expect(document.querySelector(".solidaria-DisclosureGroup")).toBeInTheDocument();
    });
  });
});
