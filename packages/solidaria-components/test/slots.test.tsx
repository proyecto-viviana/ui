import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { Button } from "../src/Button";
import { Icon } from "../src/Icon";
import { SlotProvider } from "../src/slots";
import { Text } from "../src/Text";

const slots = {
  default: { class: "slot-default", "data-rsp-slot": "label" },
  label: { class: "slot-label", "data-rsp-slot": "label" },
  description: { class: "slot-description", "data-rsp-slot": "description" },
  icon: { class: "slot-icon", "data-rsp-slot": "icon" },
  action: { class: "slot-action", "data-rsp-slot": "action" },
};

describe("SlotContext", () => {
  afterEach(() => {
    cleanup();
  });

  it("applies the slot class on the first client render", () => {
    const { container } = render(() => (
      <SlotProvider slots={slots}>
        <Text slot="label" class="custom">
          Name
        </Text>
      </SlotProvider>
    ));
    const span = container.querySelector("span");
    expect(span?.classList.contains("custom")).toBe(true);
    expect(span?.classList.contains("slot-label")).toBe(true);
    expect(span?.classList.contains("solidaria-Text")).toBe(false);
    expect(span?.getAttribute("data-rsp-slot")).toBe("label");
  });

  it("uses the default slot when the child has no slot name", () => {
    const { container } = render(() => (
      <SlotProvider slots={slots}>
        <Text>Name</Text>
      </SlotProvider>
    ));
    const span = container.querySelector("span");
    expect(span?.classList.contains("slot-default")).toBe(true);
    expect(span?.classList.contains("solidaria-Text")).toBe(true);
  });

  it("lets a child provider replace one slot and keep the rest", () => {
    const { container } = render(() => (
      <SlotProvider slots={slots}>
        <SlotProvider slots={{ label: { class: "slot-child", "data-rsp-slot": "label" } }}>
          <Text slot="label">Name</Text>
          <Text slot="description">Help</Text>
        </SlotProvider>
      </SlotProvider>
    ));
    const [label, description] = container.querySelectorAll("span");
    expect(label?.classList.contains("slot-child")).toBe(true);
    expect(label?.classList.contains("slot-label")).toBe(false);
    expect(description?.classList.contains("slot-description")).toBe(true);
  });

  it("does not give an unslotted icon or button the default label slot", () => {
    const { container } = render(() => (
      <SlotProvider slots={slots}>
        <Icon aria-label="Add" />
        <Button>Save</Button>
        <Icon slot="icon" aria-label="Add" />
        <Button slot="action">Save</Button>
      </SlotProvider>
    ));
    const [plainIcon, actionIcon] = container.querySelectorAll("span");
    const [plainButton, actionButton] = container.querySelectorAll("button");
    expect(plainIcon?.classList.contains("slot-default")).toBe(false);
    expect(plainIcon?.hasAttribute("data-rsp-slot")).toBe(false);
    expect(plainButton?.classList.contains("slot-default")).toBe(false);
    expect(plainButton?.hasAttribute("data-rsp-slot")).toBe(false);
    expect(actionIcon?.classList.contains("slot-icon")).toBe(true);
    expect(actionIcon?.getAttribute("data-rsp-slot")).toBe("icon");
    expect(actionButton?.classList.contains("slot-action")).toBe(true);
    expect(actionButton?.getAttribute("data-rsp-slot")).toBe("action");
  });

  it("leaves data-rsp-slot unset when no slot value supplies one", () => {
    const { container } = render(() => <Text>Name</Text>);
    expect(container.querySelector("span")?.hasAttribute("data-rsp-slot")).toBe(false);
  });
});
