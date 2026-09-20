/**
 * @vitest-environment jsdom
 */
import { afterAll, beforeAll, describe, it, expect } from "vite-plus/test";
import { render } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { ButtonGroup } from "../src/buttongroup";

// jsdom measures every box as zero, so for this file `offsetLeft` and
// `offsetWidth` are read from `data-offset-left` and `data-offset-width`.
const measured = ["offsetLeft", "offsetWidth"] as const;
const originals = new Map<string, PropertyDescriptor | undefined>();

beforeAll(() => {
  for (const name of measured) {
    originals.set(name, Object.getOwnPropertyDescriptor(HTMLElement.prototype, name));
    Object.defineProperty(HTMLElement.prototype, name, {
      configurable: true,
      get(this: HTMLElement) {
        return Number(this.dataset[name] ?? 0);
      },
    });
  }
});

afterAll(() => {
  for (const name of measured) {
    const original = originals.get(name);
    if (original) {
      Object.defineProperty(HTMLElement.prototype, name, original);
    } else {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
    }
  }
});

/**
 * Let Solid commit, then let the two animation frames the group measures on
 * pass, so an assertion never races a measurement that is still pending.
 */
const settle = async () => {
  flush();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
};

/** The class a group of this size and alignment carries once it has overflowed. */
const verticalClass = () => {
  const { container, unmount } = render(() => (
    <ButtonGroup orientation="vertical">
      <button>Save</button>
    </ButtonGroup>
  ));
  const className = (container.firstElementChild as HTMLElement).className;
  unmount();
  return className;
};

describe("ButtonGroup overflow (solid-spectrum)", () => {
  it("re-measures when a child is added to a width-constrained group", async () => {
    const [extra, setExtra] = createSignal(false);
    const { container } = render(() => (
      <ButtonGroup data-offset-width="100">
        <button data-offset-left="0" data-offset-width="50">
          Save
        </button>
        <button data-offset-left="50" data-offset-width="40">
          Cancel
        </button>
        {extra() ? (
          <button data-offset-left="90" data-offset-width="50">
            Discard
          </button>
        ) : null}
      </ButtonGroup>
    ));
    const group = container.firstElementChild as HTMLElement;
    const overflowed = verticalClass();
    await settle();
    expect(group.className).not.toBe(overflowed);

    // The group's own border box never changes, so neither ResizeObserver
    // fires; only the added child says the row no longer fits.
    setExtra(true);
    await settle();
    expect(group.className).toBe(overflowed);
  });

  it("re-measures when a child is relabelled", async () => {
    const [label, setLabel] = createSignal("Ok");
    const [width, setWidth] = createSignal(40);
    const { container } = render(() => (
      <ButtonGroup data-offset-width="100">
        <button data-offset-left="0" data-offset-width="50">
          Save
        </button>
        <button data-offset-left="50" data-offset-width={width()}>
          {label()}
        </button>
      </ButtonGroup>
    ));
    const group = container.firstElementChild as HTMLElement;
    const overflowed = verticalClass();
    await settle();
    expect(group.className).not.toBe(overflowed);

    setLabel("Discard every change");
    setWidth(120);
    await settle();
    expect(group.className).toBe(overflowed);
  });
});
