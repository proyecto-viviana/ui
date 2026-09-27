/** @vitest-environment jsdom */
/**
 * The browser half of #545, which `ContextualHelpTrigger.ssr.test.tsx` cannot
 * reach. Compiled for the DOM, `const helpIcon = <svg…>` at module scope is ONE
 * element built once at module evaluation, and inserting one node in two places
 * moves it — the second trigger on a page took the first one's icon and the
 * first went blank. Compiled for the server the same binding is an `ssr()`
 * string, which can be emitted any number of times, so the SSR suite counts two
 * `<svg` either way. Only a DOM render can tell the two nodes apart.
 */
import { describe, expect, it } from "vite-plus/test";
import { render } from "@solidjs/testing-library";
import { ContextualHelpTrigger } from "../src/menu/ContextualHelpTrigger";
import { UnavailableMenuItemTrigger } from "../src/menu";

describe("ContextualHelpTrigger (viviana-ui)", () => {
  it("gives each trigger on a page its own icon node", () => {
    const { container } = render(() => (
      <div>
        <ContextualHelpTrigger title="First" content="one" />
        <ContextualHelpTrigger title="Second" content="two" />
      </div>
    ));

    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(2);
    expect(icons[0]).not.toBe(icons[1]);
  });

  it("gives each info-variant trigger its own icon node", () => {
    const { container } = render(() => (
      <div>
        <ContextualHelpTrigger variant="info" title="First" content="one" />
        <ContextualHelpTrigger variant="info" title="Second" content="two" />
      </div>
    ));

    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(2);
    expect(icons[0]).not.toBe(icons[1]);
  });
});

describe("UnavailableMenuItemTrigger (viviana-ui)", () => {
  it("renders single child directly when available", () => {
    const { container } = render(() => (
      <UnavailableMenuItemTrigger isUnavailable={false}>
        <div data-testid="item">Single Item</div>
      </UnavailableMenuItemTrigger>
    ));

    expect(container.querySelector('[data-testid="item"]')?.textContent).toBe("Single Item");
  });

  it("extracts first child from array when available", () => {
    const { container } = render(() => (
      <UnavailableMenuItemTrigger isUnavailable={false}>
        <div data-testid="item">First Item</div>
        <div data-testid="popover">Popover</div>
      </UnavailableMenuItemTrigger>
    ));

    expect(container.querySelector('[data-testid="item"]')?.textContent).toBe("First Item");
    expect(container.querySelector('[data-testid="popover"]')).toBeNull();
  });
});
