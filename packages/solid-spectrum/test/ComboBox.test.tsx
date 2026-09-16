/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { render, screen, fireEvent, waitFor, cleanup } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { useVirtualizerContext } from "@proyecto-viviana/solidaria-components";
import {
  ComboBox,
  ComboBoxContext,
  ComboBoxOption,
  Form,
  Header,
  Heading,
  Text,
  type ComboBoxProps,
} from "../src";
import { LOADER_ROW_HEIGHTS } from "../src/combobox";
import { SearchAutocomplete } from "../src/autocomplete";
import { Button } from "../src/button";
import { Popover, PopoverTrigger } from "../src/popover";
import { style } from "../src/style";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

const items = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Banana" },
];

type Fruit = (typeof items)[number];

function FruitComboBox(props: Partial<ComboBoxProps<Fruit>>) {
  return (
    <ComboBox<Fruit>
      label="Fruit"
      items={items}
      getKey={(item) => item.id}
      getTextValue={(item) => item.name}
      {...props}
    >
      {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
    </ComboBox>
  );
}

function mockGetAnimations(impl: () => Animation[]): () => void {
  const previousCssTransition = (globalThis as { CSSTransition?: unknown }).CSSTransition;
  if (typeof CSSTransition === "undefined") {
    (globalThis as { CSSTransition?: unknown }).CSSTransition = class CSSTransition {};
  }
  const previous = Object.getOwnPropertyDescriptor(Element.prototype, "getAnimations");
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    writable: true,
    value: impl,
  });
  return () => {
    if (previous) {
      Object.defineProperty(Element.prototype, "getAnimations", previous);
    } else {
      delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
    }
    if (previousCssTransition === undefined) {
      delete (globalThis as { CSSTransition?: unknown }).CSSTransition;
    }
  };
}

const popoverMotion = style<{
  isEntering?: boolean;
  isExiting?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
}>({
  opacity: {
    isEntering: 0,
    isExiting: 0,
  },
  translateY: {
    placement: {
      top: {
        isEntering: 4,
        isExiting: 4,
      },
      bottom: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  translateX: {
    placement: {
      left: {
        isEntering: 4,
        isExiting: 4,
      },
      right: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  transition: "[opacity, translate]",
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: "in",
  },
  pointerEvents: {
    isExiting: "none",
  },
});

function classTokens(className: string): string[] {
  return className.split(/\s+/).filter(Boolean);
}

function motionContract(className: string): string[] {
  return classTokens(className).filter((token) => !token.startsWith("-macro-dynamic-"));
}

function overlayFrom(role: "listbox" | "menu" | "dialog"): HTMLElement {
  const node = screen.getByRole(role);
  return (node.closest("[data-placement]") as HTMLElement) ?? node;
}

describe("ComboBox (solid-spectrum)", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });
  it("associates visible label with combobox input", () => {
    render(() => <FruitComboBox />);

    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("renders no-results empty state inside the listbox when items are empty", async () => {
    render(() => <FruitComboBox items={[]} defaultOpen />);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toHaveAttribute("data-empty");
    });
    expect(screen.getByRole("option")).toHaveTextContent("No results");
  });

  it("renders table.loading empty text when loadingState is loading", async () => {
    render(() => <FruitComboBox items={[]} loadingState="loading" defaultOpen />);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toHaveAttribute("data-empty");
    });
    expect(screen.getByRole("option")).toHaveTextContent("Loading…");
  });

  it("renders load-more progress when loadingState is loadingMore", async () => {
    render(() => (
      <FruitComboBox loadingState="loadingMore" onLoadMore={vi.fn()} defaultOpen />
    ));

    await waitFor(() => {
      expect(screen.getByRole("progressbar", { name: "Loading more…" })).toBeInTheDocument();
    });
  });

  it("shows the field spinner after 500ms when loadingState is loading", async () => {
    vi.useFakeTimers();
    render(() => <FruitComboBox loadingState="loading" />);

    expect(screen.queryByRole("progressbar", { name: "Loading…" })).not.toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(500);
    expect(screen.getByRole("progressbar", { name: "Loading…" })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("provides S2 listbox header, heading, and description slot contexts", async () => {
    render(() => (
      <ComboBox<Fruit>
        label="Fruit"
        items={items}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
        defaultOpen
      >
        {(item) => (
          <ComboBoxOption id={item.id} textValue={item.name}>
            {item.name}
            {item.id === "1" ? (
              <>
                <Header data-testid="fruits-header">
                  <Heading level={3}>Fruits</Heading>
                </Header>
                <Text slot="description">Seasonal</Text>
              </>
            ) : null}
          </ComboBoxOption>
        )}
      </ComboBox>
    ));

    await waitFor(() => {
      expect(screen.getByTestId("fruits-header")).toBeInTheDocument();
    });

    const header = screen.getByTestId("fruits-header");
    const heading = header.querySelector("h3");
    const description = screen.getByText("Seasonal");

    expect(header.className).toContain("-macro-dynamic");
    expect(heading).toHaveAttribute("role", "presentation");
    expect(heading).toHaveTextContent("Fruits");
    expect(heading?.className).toContain("-macro-static");
    expect(heading?.className).not.toContain("text-2xl");
    expect(description).toHaveAttribute("slot", "description");
    expect(description.className).toContain("-macro-dynamic");
  });

  it("links description text via aria-describedby", async () => {
    render(() => <FruitComboBox description="Pick one item" />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const description = screen.getByText("Pick one item");
    expect(description.tagName).toBe("SPAN");
    expect(description).toHaveAttribute("slot", "description");

    await waitFor(() => {
      const describedBy = input.getAttribute("aria-describedby") ?? "";
      expect(describedBy).toContain(description.id);
    });
  });

  it("links error text and omits hidden description ids when invalid", async () => {
    render(() => (
      <FruitComboBox description="Pick one item" errorMessage="Selection is required" isInvalid />
    ));

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const error = screen.getByText("Selection is required");

    expect(screen.queryByText("Pick one item")).not.toBeInTheDocument();
    expect(error.tagName).toBe("SPAN");
    expect(error).toHaveAttribute("slot", "errorMessage");
    expect(error).not.toHaveAttribute("role", "alert");
    await waitFor(() => {
      const describedBy = input.getAttribute("aria-describedby") ?? "";
      expect(describedBy).toContain(error.id);
    });
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("emits data-focus-within on the field group when the input is focused, not data-focused", async () => {
    render(() => <FruitComboBox />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const group = input.closest('[role="presentation"]');
    expect(group).toBeTruthy();
    expect(group).not.toHaveAttribute("data-focused");

    fireEvent.focus(input);
    await waitFor(() => {
      expect(group).toHaveAttribute("data-focus-within", "true");
    });
    expect(group).not.toHaveAttribute("data-focused");
  });

  it("does not mark the field group focus-visible after pointer open then keyboard select", async () => {
    const user = setupUser();
    render(() => <FruitComboBox defaultSelectedKey="1" />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const group = input.closest('[role="presentation"]');
    expect(group).toBeTruthy();

    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
    expect(group).not.toHaveAttribute("data-focus-visible");

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
    expect(group).not.toHaveAttribute("data-focus-visible");
  });

  it("marks the field group focus-visible after keyboard focus", async () => {
    const user = setupUser();
    render(() => (
      <>
        <button type="button">before</button>
        <FruitComboBox />
      </>
    ));

    screen.getByRole("button", { name: "before" }).focus();
    await user.tab();

    const input = screen.getByRole("combobox", { name: "Fruit" });
    expect(document.activeElement).toBe(input);
    const group = input.closest('[role="presentation"]');
    expect(group).toHaveAttribute("data-focus-visible", "true");
  });

  it("opens the menu on pointer focus when menuTrigger is focus", async () => {
    const user = setupUser();
    render(() => <FruitComboBox menuTrigger="focus" />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    expect(input).toHaveAttribute("aria-expanded", "false");

    await user.click(input);

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "true");
    });
    expect(document.activeElement).toBe(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(items.length);
  });

  it("opens the menu on Tab focus when menuTrigger is focus", async () => {
    const user = setupUser();
    render(() => (
      <>
        <button type="button">before</button>
        <FruitComboBox menuTrigger="focus" />
      </>
    ));

    const input = screen.getByRole("combobox", { name: "Fruit" });
    screen.getByRole("button", { name: "before" }).focus();
    expect(input).toHaveAttribute("aria-expanded", "false");

    await user.tab();

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "true");
    });
    expect(document.activeElement).toBe(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(items.length);
  });

  it("opens on focus with controlled selectedKey and inputValue when menuTrigger is focus", async () => {
    const user = setupUser();
    render(() => <FruitComboBox menuTrigger="focus" selectedKey="1" inputValue="Apple" />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    expect(input).toHaveAttribute("aria-expanded", "false");

    await user.click(input);

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "true");
    });
    expect(document.activeElement).toBe(input);
    expect(screen.getAllByRole("option")).toHaveLength(items.length);
  });

  it("closes the menu when Tab leaves the input with menuTrigger focus", async () => {
    const user = setupUser();
    render(() => (
      <>
        <FruitComboBox menuTrigger="focus" />
        <button type="button">after</button>
      </>
    ));

    const input = screen.getByRole("combobox", { name: "Fruit" });
    await user.click(input);
    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "true");
    });

    await user.tab();

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "false");
    });
    expect(screen.getByRole("button", { name: "after" })).toHaveFocus();
  });

  it("does not synthesize aria-label on the input when a visible label is present", () => {
    render(() => <FruitComboBox />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    expect(input).not.toHaveAttribute("aria-label");
  });

  it("submits selected key by default when name is provided", () => {
    render(() => <FruitComboBox name="fruit" defaultSelectedKey="1" />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const hiddenInput = document.querySelector('input[type="hidden"][name="fruit"]');

    expect(input).not.toHaveAttribute("name");
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveValue("1");
  });

  it("uses text submission when allowsCustomValue is enabled", () => {
    render(() => (
      <FruitComboBox
        name="fruit"
        formValue="key"
        allowsCustomValue
        defaultInputValue="Dragonfruit"
      />
    ));

    const input = screen.getByRole("combobox", { name: "Fruit" });
    const hiddenInput = document.querySelector('input[type="hidden"][name="fruit"]');

    expect(input).toHaveAttribute("name", "fruit");
    expect(input).toHaveValue("Dragonfruit");
    expect(hiddenInput).not.toBeInTheDocument();
  });

  it("inherits disabled and required state from Form", () => {
    render(() => (
      <Form isDisabled isRequired>
        <FruitComboBox />
      </Form>
    ));

    const input = screen.getByRole("combobox", { name: "Fruit" });

    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).not.toHaveAttribute("aria-required");
  });

  it("uses context props and root refs", () => {
    const ref: { current?: HTMLDivElement | null } = { current: null };

    render(() => (
      <ComboBoxContext.Provider
        value={{
          label: "Context fruit",
          isRequired: true,
          ref,
          UNSAFE_className: "from-context",
        }}
      >
        <ComboBox<Fruit>
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
        >
          {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
        </ComboBox>
      </ComboBoxContext.Provider>
    ));

    expect(screen.getByRole("combobox", { name: "Context fruit" })).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("from-context");
  });

  it("renders contextual help in the label row", () => {
    render(() => <FruitComboBox contextualHelp={<button type="button">Help</button>} />);

    // labelledby is label id + help id; dropping aria-labelledby collapses the name to "Help".
    expect(screen.getByRole("button", { name: "Fruit Help" })).toBeInTheDocument();
  });

  it("renders a prefix before the input and labels the input with it", () => {
    render(() => <FruitComboBox prefix={<span>$</span>} />);

    const input = screen.getByRole("combobox");
    const prefix = screen.getByText("$");
    const prefixContainer = prefix.closest("[id]") as HTMLElement;
    const labelledBy = (input.getAttribute("aria-labelledby") ?? "").split(" ").filter(Boolean);

    // The input is labelled by both the visible label and the prefix.
    expect(labelledBy).toContain(prefixContainer.id);
    const labelId = labelledBy.find((id) => id !== prefixContainer.id);
    expect(document.getElementById(labelId ?? "")?.textContent).toContain("Fruit");
    expect(
      prefixContainer.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("updates direct reactive option children while open", () => {
    // `<ComboBoxOption>{label()}</ComboBoxOption>` compiles to a `children`
    // getter returning the current string. An untracked setup-time read would
    // freeze the first value in the option label and its text slot.
    const [label, setLabel] = createSignal("Apple");
    render(() => (
      <ComboBox<Fruit>
        label="Fruit"
        defaultOpen
        items={[items[0]!]}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
      >
        {(item) => <ComboBoxOption id={item.id}>{label()}</ComboBoxOption>}
      </ComboBox>
    ));

    const option = screen.getByRole("option");
    expect(option).toHaveTextContent("Apple");
    expect(option.querySelector('[data-rsp-slot="text"]')).toHaveTextContent("Apple");
    setLabel("Apricot");
    expect(option).toHaveTextContent("Apricot");
    expect(option.querySelector('[data-rsp-slot="text"]')).toHaveTextContent("Apricot");
  });

  it("keeps option aria-labelledby resolved after keyboard End", async () => {
    const user = setupUser();
    render(() => <FruitComboBox />);

    const input = screen.getByRole("combobox", { name: "Fruit" });
    input.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const assertLabelledByResolves = () => {
      const options = screen.getAllByRole("option");
      expect(options.length).toBe(items.length);
      for (const option of options) {
        const labelledBy = option.getAttribute("aria-labelledby");
        expect(labelledBy).toBeTruthy();
        const target = document.getElementById(labelledBy!);
        expect(target).not.toBeNull();
        expect(target).toHaveAttribute("slot", "label");
      }
    };

    assertLabelledByResolves();
    await user.keyboard("{End}");
    assertLabelledByResolves();
  });

  it("does not treat a pointer-opened selected option as focus-visible", async () => {
    const user = setupUser();
    render(() => <FruitComboBox defaultSelectedKey="2" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const selected = screen.getByRole("option", { selected: true });
    expect(selected).toHaveTextContent("Banana");
    expect(selected).not.toHaveAttribute("data-focus-visible");
  });

  it("renders the selected option checkmark as a bare S2 ui-icon", async () => {
    const user = setupUser();
    render(() => <FruitComboBox defaultSelectedKey="2" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const selected = screen.getByRole("option", { selected: true });
    const svg = selected.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg).not.toHaveAttribute("focusable", "false");
    expect(svg).not.toHaveAttribute("role");
    expect((svg?.getAttribute("class") ?? "").length).toBeGreaterThan(0);
  });
});

describe("SearchAutocomplete (solid-spectrum)", () => {
  it("uses visible label as combobox accessible name", () => {
    render(() => <SearchAutocomplete label="Search fruit" items={items} />);

    expect(screen.getByRole("combobox", { name: "Search fruit" })).toBeInTheDocument();
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

describe("ComboBox listbox virtualization (solid-spectrum)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("publishes aria-posinset and aria-setsize on every option when virtualized", () => {
    mockVirtualizerGeometry();
    render(() => <FruitComboBox defaultOpen />);

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(items.length);
    for (const [index, option] of options.entries()) {
      expect(option).toHaveAttribute("aria-posinset", String(index + 1));
      expect(option).toHaveAttribute("aria-setsize", String(items.length));
    }
  });

  it("sizes the virtualizer loader from LOADER_ROW_HEIGHTS for S and XL", () => {
    mockVirtualizerGeometry();

    for (const size of ["S", "XL"] as const) {
      const { unmount } = render(() => (
        <ComboBox<Fruit>
          label="Fruit"
          size={size}
          defaultOpen
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
        >
          {(item) => (
            <ComboBoxOption id={item.id}>
              {item.name}
              <LoaderHeightProbe />
            </ComboBoxOption>
          )}
        </ComboBox>
      ));

      const probes = screen.getAllByTestId("loader-height");
      expect(probes.length).toBeGreaterThan(0);
      for (const probe of probes) {
        expect(probe).toHaveTextContent(String(LOADER_ROW_HEIGHTS[size].medium));
      }
      unmount();
    }
  });

  it("composes the S2 Popover surface, including entering motion, matching a bare Popover", async () => {
    let resolveCurrent!: () => void;
    const restore = mockGetAnimations(
      () =>
        [
          {
            finished: new Promise<void>((resolve) => {
              resolveCurrent = resolve;
            }),
          },
        ] as unknown as Animation[],
    );

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

      const { unmount: unmountCombo } = render(() => <FruitComboBox defaultOpen />);
      const comboOverlay = overlayFrom("listbox");
      expect(comboOverlay).toHaveAttribute("data-entering");
      await waitFor(() => expect(comboOverlay.getAttribute("data-placement")).toBeTruthy());
      const comboTokens = classTokens(comboOverlay.className);
      expect(comboTokens).toEqual(expect.arrayContaining(enteringContract));
      unmountCombo();

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
      expect(comboTokens).toEqual(bareTokens);
      void resolveCurrent;
    } finally {
      restore();
    }
  });
});
