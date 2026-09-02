/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { render, screen, fireEvent, waitFor, cleanup } from "@solidjs/testing-library";
import { useVirtualizerContext } from "@proyecto-viviana/solidaria-components";
import { ComboBox, ComboBoxContext, ComboBoxOption, Form, type ComboBoxProps } from "../src";
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
  afterEach(() => cleanup());
  it("associates visible label with combobox input", () => {
    render(() => <FruitComboBox />);

    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
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
    expect(input).toHaveAttribute("aria-required", "true");
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

    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
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
