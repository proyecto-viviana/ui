/**
 * createDrop virtual-drop description.
 * Ported from @react-aria/dnd useDrop + useVirtualDrop.
 */

import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { flush } from "solid-js";
import type { LocalizedStringFormatter } from "@internationalized/string";
import { I18nProvider } from "../src/i18n";
import { createDrop } from "../src/dnd/createDrop";
import { beginDragging } from "../src/dnd/DragManager";
import { setInteractionModality } from "../src/interactions/createInteractionModality";
import { clearDescriptionNodes } from "../src/utils/createDescription";

const DROP_DESCRIPTION = "Pulse Intro para soltar. Pulse Escape para cancelar el arrastre.";

function describedByText(element: Element | null): string {
  const ids = element?.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
  return ids.map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
}

function DropHarness(props: { hasDropButton: boolean }) {
  const drop = createDrop(() => ({ hasDropButton: props.hasDropButton }));
  // Zero-arg spreads match DropZone: the compiler passes the function through,
  // and the runtime re-reads it when the description id appears.
  const buttonProps = () => drop.dropButtonProps;
  const targetProps = () => drop.dropProps;

  return (
    <>
      <div {...targetProps()} data-testid="target" />
      <button {...buttonProps()} data-testid="button" />
    </>
  );
}

function startDrag(element: HTMLElement): void {
  beginDragging(
    {
      element,
      items: [{ "text/plain": "item" }],
      allowedDropOperations: ["move"],
    },
    { format: (key: string) => key } as unknown as LocalizedStringFormatter,
  );
  flush();
}

async function endDrag(element: HTMLElement): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  element.remove();
}

describe("createDrop", () => {
  let dragElement: HTMLElement | undefined;

  afterEach(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    dragElement?.remove();
    dragElement = undefined;
    cleanup();
    clearDescriptionNodes();
  });

  it("describes the drop button from the drag catalog while a drag is in progress", async () => {
    // useVirtualDrop describes the button only during a drag session.
    // es-ES proves the catalog, not the English sentence the en-US row happens to use.
    setInteractionModality("keyboard");
    const { getByTestId } = render(() => (
      <I18nProvider locale="es-ES">
        <DropHarness hasDropButton />
      </I18nProvider>
    ));
    const button = getByTestId("button");
    const target = getByTestId("target");
    expect(button).toHaveAttribute("aria-label", "Drop");
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(target).not.toHaveAttribute("aria-describedby");

    const element = document.createElement("div");
    document.body.appendChild(element);
    dragElement = element;
    try {
      startDrag(element);
      expect(describedByText(button)).toBe(DROP_DESCRIPTION);
      expect(target).not.toHaveAttribute("aria-describedby");
      expect(button).toHaveAttribute("aria-label", "Drop");
    } finally {
      await endDrag(element);
      dragElement = undefined;
    }
  });

  it("describes the drop target when there is no drop button", async () => {
    setInteractionModality("keyboard");
    const { getByTestId } = render(() => (
      <I18nProvider locale="es-ES">
        <DropHarness hasDropButton={false} />
      </I18nProvider>
    ));
    const button = getByTestId("button");
    const target = getByTestId("target");
    expect(button).toHaveAttribute("aria-label", "Drop");
    expect(button).not.toHaveAttribute("aria-describedby");
    expect(target).not.toHaveAttribute("aria-describedby");

    const element = document.createElement("div");
    document.body.appendChild(element);
    dragElement = element;
    try {
      startDrag(element);
      expect(describedByText(target)).toBe(DROP_DESCRIPTION);
      expect(button).not.toHaveAttribute("aria-describedby");
      expect(button).toHaveAttribute("aria-label", "Drop");
    } finally {
      await endDrag(element);
      dragElement = undefined;
    }
  });
});
