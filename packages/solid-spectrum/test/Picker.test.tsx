/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createSignal } from "solid-js";
import { useVirtualizerContext } from "@proyecto-viviana/solidaria-components";
import { LOADER_ROW_HEIGHTS } from "../src/combobox";
import { Picker, PickerItem } from "../src/picker";
import { Button } from "../src/button";
import { Popover, PopoverTrigger } from "../src/popover";
import { style } from "../src/style";

interface SectionItem {
  href: string;
  label: string;
}

const sections: SectionItem[] = [
  { href: "#page-title", label: "Accordion" },
  { href: "#api", label: "API" },
];

describe("Picker (solid-spectrum)", () => {
  it("uses getKey for generated options from object-backed items", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        onSelectionChange={onSelectionChange}
      />
    ));

    await user.click(screen.getByRole("option", { name: "API" }));

    expect(onSelectionChange).toHaveBeenCalledWith("#api");
  });

  it("mirrors the selected option's full content (icon + label) in the trigger", () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#api"
      >
        {(item) => (
          <PickerItem id={item.href} item={item} textValue={item.label}>
            <svg slot="icon" data-testid={`icon-${item.href}`} aria-hidden="true" />
            <span slot="label">{item.label}</span>
          </PickerItem>
        )}
      </Picker>
    ));

    const button = screen.getByRole("button");
    // The trigger shows the label text of the selected option...
    expect(button).toHaveTextContent("API");
    // ...and, faithfully to upstream S2 `SelectValue`, the option's icon slot —
    // the whole rendered node is mirrored, not just its text.
    const triggerIcon = button.querySelector('[slot="icon"]');
    expect(triggerIcon).not.toBeNull();
    expect(triggerIcon).toHaveAttribute("data-testid", "icon-#api");
    // Only the selected option's icon is mirrored (no stray duplicate).
    expect(button.querySelectorAll('[slot="icon"]').length).toBe(1);
  });

  it("updates direct reactive item children in the option and the trigger value", () => {
    // `<PickerItem>{label()}</PickerItem>` compiles to a `children` getter
    // returning the current string. An untracked setup-time read would freeze
    // the first value in both the option row and the mirrored trigger value.
    const [label, setLabel] = createSignal("Accordion");
    const { container } = render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={[sections[0]!]}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
      >
        {(item) => <PickerItem id={item.href}>{label()}</PickerItem>}
      </Picker>
    ));

    const option = screen.getByRole("option");
    // While the popover is open the trigger is aria-hidden from the AX tree
    // (ariaHideOutside), so locate it by its listbox popup attribute.
    const button = container.querySelector('button[aria-haspopup="listbox"]');
    expect(button).not.toBeNull();
    expect(option.querySelector('[data-rsp-slot="text"]')).toHaveTextContent("Accordion");
    expect(button).toHaveTextContent("Accordion");
    setLabel("Accordion group");
    expect(option.querySelector('[data-rsp-slot="text"]')).toHaveTextContent("Accordion group");
    expect(button).toHaveTextContent("Accordion group");
  });

  it("supports multiple selection with selectedKeys/defaultSelectedKeys/onSelectionChangeKeys", async () => {
    const user = setupUser();
    const onSelectionChangeKeys = vi.fn();
    const { unmount } = render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        selectionMode="multiple"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKeys={["#page-title"]}
        onSelectionChangeKeys={onSelectionChangeKeys}
      />
    ));

    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");

    await user.click(screen.getByRole("option", { name: "API" }));

    expect(onSelectionChangeKeys).toHaveBeenLastCalledWith(new Set(["#page-title", "#api"]));

    unmount();

    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        selectionMode="multiple"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        defaultSelectedKeys={["#page-title", "#api"]}
        renderValue={(items) => <span>{items.map((item) => item.label).join(" + ")}</span>}
      />
    ));

    expect(screen.getByRole("button")).toHaveTextContent("Accordion + API");
  });

  it("renders label help, contextual help, and custom selected value content", () => {
    render(() => (
      <Picker<SectionItem>
        label="Docs section"
        description="Pick a docs anchor"
        contextualHelp={<button type="button">Section help</button>}
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#api"
        renderValue={(items) => <span data-testid="picker-value">{items[0]?.label} section</span>}
      />
    ));

    // Upstream `useSelect` folds the selected value ahead of the field label in the
    // trigger name (`aria-labelledby=[valueId, labelId]`). Here the custom renderValue
    // is "API section" and the label is "Docs section", so the accessible name is the
    // concatenation "API section Docs section".
    const button = screen.getByRole("button", { name: "API section Docs section" });
    const description = screen.getByText("Pick a docs anchor");
    const contextualHelp = document.querySelector('[data-slot="contextualHelp"]');

    expect(button).toHaveTextContent("API section");
    expect(button.getAttribute("aria-describedby")?.split(" ")).toContain(description.id);
    expect(contextualHelp).toContainElement(screen.getByRole("button", { name: "Section help" }));
  });

  it("renders description as span[slot=description] and wires trigger aria-describedby", async () => {
    render(() => (
      <Picker<SectionItem>
        label="Docs section"
        description="Pick a docs anchor"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    const description = screen.getByText("Pick a docs anchor");
    expect(description.tagName).toBe("SPAN");
    expect(description).toHaveAttribute("slot", "description");
    expect(description.tagName).not.toBe("P");

    const button = screen.getByRole("button");
    await waitFor(() => {
      expect(button.getAttribute("aria-describedby")?.split(" ")).toContain(description.id);
    });
  });

  it("renders error as span[slot=errorMessage] without role=alert", async () => {
    render(() => (
      <Picker<SectionItem>
        label="Docs section"
        description="Pick a docs anchor"
        errorMessage="Required"
        isInvalid
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    expect(screen.queryByText("Pick a docs anchor")).not.toBeInTheDocument();
    const error = screen.getByText("Required");
    expect(error.tagName).toBe("SPAN");
    expect(error).toHaveAttribute("slot", "errorMessage");
    expect(error).not.toHaveAttribute("role", "alert");

    const button = screen.getByRole("button");
    await waitFor(() => {
      expect(button.getAttribute("aria-describedby")?.split(" ")).toContain(error.id);
    });
  });

  // RAC HiddenSelect (≤300 items) submits through the hidden <select> itself so
  // browser autofill works; there is no parallel <input type="hidden">
  // (react-aria/src/select/HiddenSelect.tsx; RAC Select.test.js "should support
  // form prop" queries `[name=select]`).
  it("submits the selected key through the named hidden select and external forms", () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        name="section"
        form="docs-form"
        defaultSelectedKey="#api"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    const named = document.querySelectorAll('[name="section"]');
    expect(named).toHaveLength(1);
    const select = named[0] as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAttribute("form", "docs-form");
    expect(select).toHaveValue("#api");
  });

  it("keeps the named hidden select in sync after the selected value changes", async () => {
    const user = setupUser();
    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        name="plan"
        defaultSelectedKey="#api"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    const select = document.querySelector('select[name="plan"]') as HTMLSelectElement;
    expect(select).toHaveValue("#api");

    await user.click(screen.getByRole("option", { name: "Accordion" }));
    expect(select).toHaveValue("#page-title");
  });

  it("natively disables the trigger when isDisabled", () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        isDisabled
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    const trigger = screen.getByRole("button", { hidden: true });
    expect(trigger).toBeDisabled();
    expect(trigger).not.toHaveAttribute("aria-disabled");
  });

  it("submits multiple selected values as FormData entries of the hidden select", () => {
    render(() => (
      <form data-testid="form">
        <Picker<SectionItem>
          aria-label="Docs section"
          selectionMode="multiple"
          name="section"
          defaultSelectedKeys={["#page-title", "#api"]}
          items={sections}
          getKey={(item) => item.href}
          getTextValue={(item) => item.label}
        />
      </form>
    ));

    const select = document.querySelector('select[name="section"]') as HTMLSelectElement;
    expect(select).toHaveAttribute("multiple");
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).getAll("section")).toEqual([
      "#page-title",
      "#api",
    ]);
  });

  it("uses native required validation only for native validationBehavior", () => {
    const { unmount } = render(() => (
      <Picker<SectionItem>
        label="Docs section"
        name="section"
        isRequired
        validationBehavior="aria"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    expect(document.querySelector('select[name="section"]')).not.toBeRequired();
    unmount();

    render(() => (
      <Picker<SectionItem>
        label="Docs section"
        name="section"
        isRequired
        validationBehavior="native"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      />
    ));

    expect(document.querySelector('select[name="section"]')).toBeRequired();
  });

  it("renders trigger and load-more progress states", () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        loadingState="loadingMore"
        onLoadMore={vi.fn()}
      />
    ));

    expect(screen.getByRole("progressbar", { name: "Loading more…" })).toBeInTheDocument();
  });

  it("keeps the load-more sentinel active without showing loading UI while idle", () => {
    const onLoadMore = vi.fn();

    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        loadingState="idle"
        onLoadMore={onLoadMore}
      >
        {(item) => <PickerItem id={item.href}>{item.label}</PickerItem>}
      </Picker>
    ));

    expect(screen.queryByRole("progressbar", { name: "Loading…" })).not.toBeInTheDocument();
    expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Accordion",
      "API",
    ]);
  });

  it("does not render a Load more option when loadingState is loading", () => {
    render(() => (
      <Picker<SectionItem>
        aria-label="Docs section"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
        loadingState="loading"
        onLoadMore={vi.fn()}
      />
    ));

    expect(screen.queryByText("Load more")).not.toBeInTheDocument();
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Accordion",
      "API",
    ]);
  });
});

function mockVirtualizerGeometry(): void {
  class TestResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
    constructor(_callback: ResizeObserverCallback) {}
  }
  vi.stubGlobal("ResizeObserver", TestResizeObserver);
  const rect = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 200,
    right: 200,
    width: 200,
    height: 200,
    toJSON() {
      return this;
    },
  };
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(rect as DOMRect);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(200);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(200);
}

function LoaderHeightProbe() {
  const ctx = useVirtualizerContext<{ loaderHeight?: number }>();
  return (
    <span data-testid="loader-height" hidden aria-hidden="true">
      {String(ctx?.layoutOptions?.loaderHeight ?? "")}
    </span>
  );
}

describe("Picker listbox virtualization (solid-spectrum)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("publishes aria-posinset and aria-setsize on every option when virtualized", () => {
    mockVirtualizerGeometry();
    render(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        defaultOpen
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
      >
        {(item) => <PickerItem id={item.href}>{item.label}</PickerItem>}
      </Picker>
    ));

    const options = screen
      .getAllByRole("option")
      .filter((option) => option.getAttribute("aria-disabled") !== "true");
    expect(options).toHaveLength(sections.length);
    for (const [index, option] of options.entries()) {
      expect(option).toHaveAttribute("aria-posinset", String(index + 1));
      expect(option).toHaveAttribute("aria-setsize", String(sections.length));
    }
  });

  it("sizes the loader row from LOADER_ROW_HEIGHTS for S and XL", () => {
    mockVirtualizerGeometry();

    for (const size of ["S", "XL"] as const) {
      const { unmount } = render(() => (
        <Picker<SectionItem>
          aria-label="Docs section"
          size={size}
          defaultOpen
          items={sections}
          getKey={(item) => item.href}
          getTextValue={(item) => item.label}
          loadingState="loadingMore"
          onLoadMore={vi.fn()}
        >
          {(item) => (
            <PickerItem id={item.href}>
              {item.label}
              <LoaderHeightProbe />
            </PickerItem>
          )}
        </Picker>
      ));

      expect(screen.getByRole("progressbar", { name: "Loading more…" })).toBeInTheDocument();
      const loader = screen
        .getByRole("progressbar", { name: "Loading more…" })
        .closest('[role="option"]');
      expect(loader).not.toBeNull();

      const probes = screen.getAllByTestId("loader-height");
      expect(probes.length).toBeGreaterThan(0);
      for (const probe of probes) {
        expect(probe).toHaveTextContent(String(LOADER_ROW_HEIGHTS[size].medium));
      }
      unmount();
    }
  });

  it("composes the S2 Popover surface, including entering motion, matching a bare Popover", async () => {
    const previousCssTransition = (globalThis as { CSSTransition?: unknown }).CSSTransition;
    if (typeof CSSTransition === "undefined") {
      (globalThis as { CSSTransition?: unknown }).CSSTransition = class CSSTransition {};
    }
    const previous = Object.getOwnPropertyDescriptor(Element.prototype, "getAnimations");
    Object.defineProperty(Element.prototype, "getAnimations", {
      configurable: true,
      writable: true,
      value: () => [{ finished: new Promise<void>(() => {}) }] as unknown as Animation[],
    });
    const popoverMotion = style<{
      isEntering?: boolean;
      isExiting?: boolean;
      placement?: "top" | "bottom" | "left" | "right";
    }>({
      opacity: { isEntering: 0, isExiting: 0 },
      translateY: {
        placement: {
          top: { isEntering: 4, isExiting: 4 },
          bottom: { isEntering: -4, isExiting: -4 },
        },
      },
      translateX: {
        placement: {
          left: { isEntering: 4, isExiting: 4 },
          right: { isEntering: -4, isExiting: -4 },
        },
      },
      transition: "[opacity, translate]",
      transitionDuration: 200,
      transitionTimingFunction: { isExiting: "in" },
      pointerEvents: { isExiting: "none" },
    });
    const classTokens = (className: string) => className.split(/\s+/).filter(Boolean);
    const motionContract = (className: string) =>
      classTokens(className).filter((token) => !token.startsWith("-macro-dynamic-"));

    try {
      const enteringMotion = popoverMotion({
        isEntering: true,
        isExiting: false,
        placement: "bottom",
      });
      const settledMotion = popoverMotion({
        isEntering: false,
        isExiting: false,
        placement: "bottom",
      });
      expect(enteringMotion).not.toBe(settledMotion);
      const enteringContract = motionContract(enteringMotion);
      expect(enteringContract.length).toBeGreaterThan(0);

      const { unmount: unmountPicker } = render(() => (
        <Picker<SectionItem>
          aria-label="Table of contents"
          defaultOpen
          items={sections}
          getKey={(item) => item.href}
          getTextValue={(item) => item.label}
        />
      ));
      const pickerOverlay = screen.getByRole("listbox").closest("[data-placement]") as HTMLElement;
      expect(pickerOverlay).toHaveAttribute("data-entering");
      await waitFor(() => expect(pickerOverlay.getAttribute("data-placement")).toBeTruthy());
      const pickerTokens = classTokens(pickerOverlay.className);
      expect(pickerTokens).toEqual(expect.arrayContaining(enteringContract));
      unmountPicker();

      const user = setupUser();
      render(() => (
        <PopoverTrigger>
          <Button>Open</Button>
          <Popover hideArrow>
            <p>Bare popover</p>
          </Popover>
        </PopoverTrigger>
      ));
      await user.click(screen.getByRole("button", { name: "Open" }));
      const bareOverlay = screen.getByRole("dialog");
      expect(bareOverlay).toHaveAttribute("data-entering");
      const bareTokens = classTokens(bareOverlay.className);
      expect(bareTokens).toEqual(expect.arrayContaining(enteringContract));
      expect(pickerTokens).toEqual(bareTokens);
    } finally {
      if (previous) {
        Object.defineProperty(Element.prototype, "getAnimations", previous);
      } else {
        delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
      }
      if (previousCssTransition === undefined) {
        delete (globalThis as { CSSTransition?: unknown }).CSSTransition;
      }
    }
  });
});
