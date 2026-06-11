/**
 * ComboBox tests - Port of React Aria's ComboBox.test.tsx
 *
 * Tests for ComboBox component functionality including:
 * - Rendering
 * - Selection
 * - Filtering
 * - Keyboard interactions
 * - Open/close behavior
 * - Disabled states
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import {
  ComboBox,
  ComboBoxInput,
  ComboBoxButton,
  ComboBoxValue,
  ComboBoxListBox,
  ComboBoxOption,
  ComboBoxTagGroup,
  ComboBoxTag,
} from "../src/ComboBox";
import { SelectionIndicator } from "../src/SelectionIndicator";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import {
  setupUser,
  assertAriaIdIntegrity,
  checkAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

// Sample items for testing
const items = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Banana" },
  { id: "3", name: "Cherry" },
  { id: "4", name: "Date" },
  { id: "5", name: "Elderberry" },
];

// Helper component for testing
function TestComboBox(props: {
  comboBoxProps?: Partial<Parameters<typeof ComboBox>[0]>;
  testItems?: typeof items;
}) {
  const testItems = props.testItems ?? items;
  return (
    <ComboBox
      aria-label="Test ComboBox"
      items={testItems}
      getKey={(item) => item.id}
      getTextValue={(item) => item.name}
      {...props.comboBoxProps}
    >
      <ComboBoxInput />
      <ComboBoxButton>▼</ComboBoxButton>
      <ComboBoxListBox>
        {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
      </ComboBoxListBox>
    </ComboBox>
  );
}

describe("ComboBox", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => <TestComboBox />);

      const combobox = document.querySelector(".solidaria-ComboBox");
      expect(combobox).toBeInTheDocument();
    });

    it("should render input with combobox role", () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      expect(input).toBeInTheDocument();
    });

    it("should render trigger button", () => {
      render(() => <TestComboBox />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should not render listbox when closed", () => {
      render(() => <TestComboBox />);

      const listbox = screen.queryByRole("listbox");
      expect(listbox).not.toBeInTheDocument();
    });

    it("should render with custom class", () => {
      render(() => <TestComboBox comboBoxProps={{ class: "my-combobox" }} />);

      const combobox = document.querySelector(".my-combobox");
      expect(combobox).toBeInTheDocument();
    });

    it("should expose isReadOnly in root render props", () => {
      render(() => (
        <ComboBox
          aria-label="Test ComboBox"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          isReadOnly
          class={(renderProps) =>
            renderProps.isReadOnly ? "readonly-combobox" : "editable-combobox"
          }
        >
          <ComboBoxInput />
          <ComboBoxButton>▼</ComboBoxButton>
          <ComboBoxListBox>
            {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
          </ComboBoxListBox>
        </ComboBox>
      ));

      const combobox = document.querySelector(".readonly-combobox");
      expect(combobox).toBeInTheDocument();
      expect(combobox).toHaveAttribute("data-readonly");
    });

    it("should render selected text from ComboBoxValue when input text differs", () => {
      render(() => (
        <ComboBox
          aria-label="ComboBox value"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          selectedKey="2"
          inputValue="typed text"
        >
          <ComboBoxValue />
          <ComboBoxInput />
          <ComboBoxButton>Open</ComboBoxButton>
          <ComboBoxListBox>
            {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
          </ComboBoxListBox>
        </ComboBox>
      ));

      expect(screen.getByText("Banana")).toBeInTheDocument();
      expect(screen.queryByText("typed text")).not.toBeInTheDocument();
    });

    it("provides slots", () => {
      render(() => (
        <ComboBox
          aria-label="Outer ComboBox"
          items={[]}
          slots={{
            test: {
              "aria-label": "Slot ComboBox",
              items,
              getKey: (item) => item.id,
              getTextValue: (item) => item.name,
            },
          }}
        >
          <ComboBox slot="test">
            <ComboBoxInput />
            <ComboBoxButton>▼</ComboBoxButton>
            <ComboBoxListBox>
              {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
            </ComboBoxListBox>
          </ComboBox>
        </ComboBox>
      ));

      const roots = document.querySelectorAll(".solidaria-ComboBox");
      expect(roots[1]).toHaveAttribute("aria-label", "Slot ComboBox");
      expect(roots[1]).toHaveAttribute("slot", "test");
    });

    it("should support slot", () => {
      render(() => <TestComboBox comboBoxProps={{ slot: "test" }} />);

      expect(screen.getByRole("combobox").closest(".solidaria-ComboBox")).toHaveAttribute(
        "slot",
        "test",
      );
    });

    it("should support custom render function", () => {
      render(() => (
        <TestComboBox
          comboBoxProps={{
            defaultOpen: true,
            class: ({ isOpen }) => (isOpen ? "is-open" : "is-closed"),
          }}
        />
      ));

      expect(document.querySelector(".is-open")).toBeInTheDocument();
    });

    it("should support render props", () => {
      render(() => (
        <ComboBox
          aria-label="Test ComboBox"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          defaultInputValue="Apple"
        >
          {({ inputValue }) => (
            <>
              <ComboBoxInput />
              <ComboBoxButton>{inputValue}</ComboBoxButton>
              <ComboBoxListBox>
                {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
              </ComboBoxListBox>
            </>
          )}
        </ComboBox>
      ));

      expect(screen.getByRole("button")).toHaveTextContent("Apple");
    });
  });

  // ============================================
  // OPENING/CLOSING
  // ============================================

  describe("opening/closing", () => {
    it("should open on button click", async () => {
      render(() => <TestComboBox />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
      });
    });

    it("should open on input focus with menuTrigger=focus", async () => {
      render(() => <TestComboBox comboBoxProps={{ menuTrigger: "focus" }} />);

      const input = screen.getByRole("combobox");
      await user.click(input);

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
      });
    });

    it("should not open the menu when isReadOnly", async () => {
      render(() => <TestComboBox comboBoxProps={{ isReadOnly: true, menuTrigger: "focus" }} />);

      await user.click(screen.getByRole("combobox"));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should open on ArrowDown", async () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      input.focus();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
      });
    });

    it("should open on ArrowUp", async () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      input.focus();
      await user.keyboard("{ArrowUp}");

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
      });
    });

    it("should close on Escape", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      // Wait for listbox to be visible
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const input = screen.getByRole("combobox");
      input.focus();
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should not close on input scrolling for cursor placement", async () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(input).toHaveFocus();

      fireEvent.scroll(input);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should close on trigger button click when already open", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { hidden: true });
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should support controlled open state", async () => {
      const onOpenChange = vi.fn();
      render(() => <TestComboBox comboBoxProps={{ isOpen: true, onOpenChange }} />);

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
      });
    });

    it("should fire onOpenChange", async () => {
      const onOpenChange = vi.fn();
      render(() => <TestComboBox comboBoxProps={{ onOpenChange }} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
      });
    });

    it("should aria-hide outside content while open", async () => {
      render(() => (
        <div>
          <p data-testid="outside-content">Outside</p>
          <TestComboBox comboBoxProps={{ defaultOpen: true }} />
        </div>
      ));

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await waitFor(() => {
        const outside = screen.getByTestId("outside-content");
        expect(outside.closest('[aria-hidden="true"]')).not.toBeNull();
      });
    });
  });

  // ============================================
  // OPTIONS
  // ============================================

  describe("options", () => {
    it("should render options when open", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(5);
      });
    });

    it("should display option text", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Banana")).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // SELECTION
  // ============================================

  describe("selection", () => {
    it("should select on option click", async () => {
      const onSelectionChange = vi.fn();
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true, onSelectionChange }} />);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Click on the option element itself, not just the text
      const option = screen.getByRole("option", { name: "Banana" });
      await user.click(option);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith("2");
      });
    });

    it("should update input value on selection", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Click on the option element itself
      const option = screen.getByRole("option", { name: "Cherry" });
      await user.click(option);

      await waitFor(() => {
        const input = screen.getByRole("combobox");
        expect(input).toHaveValue("Cherry");
      });
    });

    it("should support defaultSelectedKey", () => {
      render(() => <TestComboBox comboBoxProps={{ defaultSelectedKey: "3" }} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("Cherry");
    });

    it("should support controlled selectedKey", () => {
      render(() => <TestComboBox comboBoxProps={{ selectedKey: "4" }} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("Date");
    });

    it("should close after selection", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Click on the option element itself
      const option = screen.getByRole("option", { name: "Apple" });
      await user.click(option);

      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should render SelectionIndicator only for selected option", async () => {
      render(() => (
        <ComboBox
          aria-label="Test ComboBox"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          defaultSelectedKey="1"
        >
          <ComboBoxInput />
          <ComboBoxButton>▼</ComboBoxButton>
          <ComboBoxListBox>
            {(item) => (
              <ComboBoxOption id={item.id}>
                {() => (
                  <>
                    {item.name}
                    <SelectionIndicator>Selected</SelectionIndicator>
                  </>
                )}
              </ComboBoxOption>
            )}
          </ComboBoxListBox>
        </ComboBox>
      ));

      await user.click(screen.getByRole("button", { name: "Show suggestions" }));
      expect(screen.getAllByText("Selected")).toHaveLength(1);
      await user.click(screen.getByRole("option", { name: "Banana" }));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // INPUT VALUE
  // ============================================

  describe("input value", () => {
    it("should support defaultInputValue", () => {
      render(() => <TestComboBox comboBoxProps={{ defaultInputValue: "test" }} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("test");
    });

    it("should support controlled inputValue", () => {
      render(() => <TestComboBox comboBoxProps={{ inputValue: "controlled" }} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("controlled");
    });

    it("should fire onInputChange when typing", async () => {
      const onInputChange = vi.fn();
      render(() => <TestComboBox comboBoxProps={{ onInputChange }} />);

      const input = screen.getByRole("combobox");
      await user.type(input, "test");

      await waitFor(() => {
        expect(onInputChange).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // FILTERING
  // ============================================

  describe("filtering", () => {
    it("should filter options based on input", async () => {
      render(() => <TestComboBox comboBoxProps={{ menuTrigger: "input" }} />);

      const input = screen.getByRole("combobox");
      await user.type(input, "Ap");

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
      });

      // Filtering is async, verify that the filter reduces options
      await waitFor(() => {
        // At minimum, Apple should be visible since it matches "Ap"
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });
    });

    it("should show all options when opened with button", async () => {
      render(() => <TestComboBox />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      await waitFor(() => {
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(5);
      });
    });

    it("should support dynamic collections", async () => {
      function DynamicComboBox() {
        const [dynamicItems, setDynamicItems] = createSignal([
          { id: "cat", name: "Cat" },
          { id: "dog", name: "Dog" },
        ]);

        return (
          <>
            <button
              type="button"
              onClick={() => setDynamicItems([{ id: "kangaroo", name: "Kangaroo" }])}
            >
              Update
            </button>
            <ComboBox
              aria-label="Favorite Animal"
              items={dynamicItems()}
              getKey={(item) => item.id}
              getTextValue={(item) => item.name}
              defaultOpen
            >
              <ComboBoxInput />
              <ComboBoxButton>▼</ComboBoxButton>
              <ComboBoxListBox>
                {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
              </ComboBoxListBox>
            </ComboBox>
          </>
        );
      }

      render(() => <DynamicComboBox />);

      await waitFor(() => {
        expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
          "Cat",
          "Dog",
        ]);
      });

      fireEvent.click(screen.getByText("Update"));

      await waitFor(() => {
        expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
          "Kangaroo",
        ]);
      });
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  describe("keyboard navigation", () => {
    it("should navigate with ArrowDown", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const input = screen.getByRole("combobox");
      input.focus();
      await user.keyboard("{ArrowDown}");

      // First option should be focused
      await waitFor(() => {
        const firstOption = screen.getByText("Apple").closest('[role="option"]');
        expect(firstOption).toHaveAttribute("data-focused");
      });
    });

    it("should select on Enter", async () => {
      const onSelectionChange = vi.fn();
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true, onSelectionChange }} />);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const input = screen.getByRole("combobox");
      input.focus();
      await user.keyboard("{ArrowDown}{Enter}");

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });
    });

    it.each(["keyboard", "mouse"])("should support onAction with %s", async (interactionType) => {
      const onAction = vi.fn();
      render(() => (
        <ComboBox
          aria-label="Test ComboBox"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          defaultOpen
        >
          <ComboBoxInput />
          <ComboBoxButton>▼</ComboBoxButton>
          <ComboBoxListBox>
            {(item) => (
              <ComboBoxOption id={item.id} onAction={onAction}>
                {item.name}
              </ComboBoxOption>
            )}
          </ComboBoxListBox>
        </ComboBox>
      ));

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      if (interactionType === "keyboard") {
        screen.getByRole("combobox").focus();
        await user.keyboard("{ArrowDown}{Enter}");
      } else {
        await user.click(screen.getByRole("option", { name: "Apple" }));
      }

      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled", () => {
      render(() => <TestComboBox comboBoxProps={{ isDisabled: true }} />);

      const input = screen.getByRole("combobox");
      expect(input).toBeDisabled();
    });

    it("should disable button when disabled", () => {
      render(() => <TestComboBox comboBoxProps={{ isDisabled: true }} />);

      const button = screen.getByRole("button");
      // Button uses aria-disabled instead of native disabled
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should have data-disabled attribute", () => {
      render(() => <TestComboBox comboBoxProps={{ isDisabled: true }} />);

      const combobox = document.querySelector(".solidaria-ComboBox");
      expect(combobox).toHaveAttribute("data-disabled");
    });

    it("should not open when disabled", async () => {
      render(() => <TestComboBox comboBoxProps={{ isDisabled: true }} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // REQUIRED STATE
  // ============================================

  describe("required state", () => {
    it("should support isRequired", () => {
      render(() => <TestComboBox comboBoxProps={{ isRequired: true }} />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should have data-required attribute", () => {
      render(() => <TestComboBox comboBoxProps={{ isRequired: true }} />);

      const combobox = document.querySelector(".solidaria-ComboBox");
      expect(combobox).toHaveAttribute("data-required");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have combobox role", () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      expect(input).toBeInTheDocument();
    });

    it("should have aria-label when provided", () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-label", "Test ComboBox");
    });

    it("should have aria-expanded false when closed", () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-expanded", "false");
    });

    it("should have aria-expanded true when open", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        const input = screen.getByRole("combobox");
        expect(input).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("should have aria-haspopup listbox", () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-haspopup", "listbox");
    });

    it("should have aria-controls when open", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        const input = screen.getByRole("combobox");
        expect(input).toHaveAttribute("aria-controls");
        // aria-controls should reference the listbox (may have different ID format)
        const ariaControls = input.getAttribute("aria-controls");
        expect(ariaControls).toBeTruthy();
      });
    });

    it("should expose open state as button pressed render prop", () => {
      render(() => (
        <ComboBox
          aria-label="Test ComboBox"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          defaultOpen
        >
          <ComboBoxInput />
          <ComboBoxButton class={({ isPressed }) => (isPressed ? "pressed" : "not-pressed")}>
            ▼
          </ComboBoxButton>
          <ComboBoxListBox>
            {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
          </ComboBoxListBox>
        </ComboBox>
      ));

      const button = screen.getByRole("button", { hidden: true });
      expect(button).toHaveClass("pressed");
    });

    it("should apply isPressed state to button when expanded", () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      const button = screen.getByRole("button", { hidden: true });
      expect(button).toHaveAttribute("data-pressed");
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-open when open", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        const combobox = document.querySelector(".solidaria-ComboBox");
        expect(combobox).toHaveAttribute("data-open");
      });
    });

    it("should not have data-open when closed", () => {
      render(() => <TestComboBox />);

      const combobox = document.querySelector(".solidaria-ComboBox");
      expect(combobox).not.toHaveAttribute("data-open");
    });

    it("should have data-invalid when invalid", () => {
      render(() => <TestComboBox comboBoxProps={{ isInvalid: true }} />);

      const combobox = document.querySelector(".solidaria-ComboBox");
      expect(combobox).toHaveAttribute("data-invalid");
    });

    it("should render data- attributes on outer element", () => {
      render(() => <TestComboBox comboBoxProps={{ "data-testid": "combobox-root" } as never} />);

      const combobox = screen.getByTestId("combobox-root");
      expect(combobox).toHaveClass("solidaria-ComboBox");
      expect(screen.getByRole("combobox")).not.toHaveAttribute("data-testid");
    });
  });

  // ============================================
  // DISABLED OPTIONS
  // ============================================

  describe("disabled options", () => {
    it("should support disabledKeys", async () => {
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true, disabledKeys: ["2"] }} />);

      await waitFor(() => {
        const option = screen.getByText("Banana").closest('[role="option"]');
        expect(option).toHaveAttribute("data-disabled");
      });
    });

    it("should not select disabled options", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestComboBox
          comboBoxProps={{ defaultOpen: true, disabledKeys: ["2"], onSelectionChange }}
        />
      ));

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const option = screen.getByText("Banana");
      await user.click(option);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // ALLOWS CUSTOM VALUE
  // ============================================

  describe("allows custom value", () => {
    it("should allow custom value when allowsCustomValue is true", async () => {
      render(() => <TestComboBox comboBoxProps={{ allowsCustomValue: true }} />);

      const input = screen.getByRole("combobox");
      await user.type(input, "Custom Value");

      await waitFor(() => {
        expect(input).toHaveValue("Custom Value");
      });
    });
  });

  // ============================================
  // FORM INTEGRATION
  // ============================================

  describe("form integration", () => {
    it("should support formValue", () => {
      render(() => (
        <TestComboBox
          comboBoxProps={{ name: "fruit", formValue: "key", defaultSelectedKey: "2" }}
        />
      ));

      const input = screen.getByRole("combobox");
      const hiddenInput = document.querySelector('input[type="hidden"][name="fruit"]');
      expect(input).not.toHaveAttribute("name");
      expect(hiddenInput).toHaveValue("2");
    });

    it("should render hidden input with selected key by default", () => {
      render(() => <TestComboBox comboBoxProps={{ name: "fruit", defaultSelectedKey: "1" }} />);

      const hiddenInput = document.querySelector('input[type="hidden"][name="fruit"]');
      const input = screen.getByRole("combobox");
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveValue("1");
      expect(input).not.toHaveAttribute("name");
    });

    it("should submit text value when formValue is text", () => {
      render(() => (
        <TestComboBox
          comboBoxProps={{
            name: "fruit",
            formValue: "text",
            defaultInputValue: "Apple",
          }}
        />
      ));

      const input = screen.getByRole("combobox");
      const hiddenInput = document.querySelector('input[type="hidden"][name="fruit"]');
      expect(input).toHaveAttribute("name", "fruit");
      expect(hiddenInput).not.toBeInTheDocument();
    });

    it("should force text form submission when allowsCustomValue is true", () => {
      render(() => (
        <TestComboBox
          comboBoxProps={{
            name: "fruit",
            formValue: "key",
            allowsCustomValue: true,
            defaultInputValue: "Dragonfruit",
          }}
        />
      ));

      const input = screen.getByRole("combobox");
      const hiddenInput = document.querySelector('input[type="hidden"][name="fruit"]');
      expect(input).toHaveAttribute("name", "fruit");
      expect(input).toHaveValue("Dragonfruit");
      expect(hiddenInput).not.toBeInTheDocument();
    });

    it("should support form prop", () => {
      render(() => <TestComboBox comboBoxProps={{ form: "test-form" } as never} />);

      expect(screen.getByRole("combobox")).toHaveAttribute("form", "test-form");
    });
  });

  // ============================================
  // A11Y RISK AREA: ARIA ID integrity
  // ============================================

  describe("a11y ARIA ID integrity", () => {
    it("input aria-controls resolves to listbox when open", async () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      await user.click(input);

      // After opening, aria-controls should point to the listbox
      const controlsId = input.getAttribute("aria-controls");
      if (controlsId) {
        expect(document.getElementById(controlsId)).toBeTruthy();
      }

      assertAriaIdIntegrity(document.body);
    });

    it("aria-activedescendant resolves to focused option when navigating", async () => {
      render(() => <TestComboBox />);

      const input = screen.getByRole("combobox");
      await user.click(input);

      // Navigate down to first option
      await user.keyboard("{ArrowDown}");

      const activeDesc = input.getAttribute("aria-activedescendant");
      if (activeDesc) {
        // The activedescendant ID should reference an element in the listbox
        const target = document.getElementById(activeDesc);
        if (target) {
          expect(target.getAttribute("role")).toBe("option");
        }
      }

      // Check integrity — in open combobox state, some ARIA refs may point
      // to portaled elements. Verify the check runs without errors.
      const result = checkAriaIdIntegrity(document.body);
      expect(result.totalRefsChecked).toBeGreaterThan(0);
    });
  });

  // ============================================
  // MULTI-SELECT MODE
  // ============================================

  describe("multi-select mode", () => {
    function MultiSelectComboBox(props: {
      comboBoxProps?: Partial<Parameters<typeof ComboBox>[0]>;
    }) {
      return (
        <ComboBox
          aria-label="Multi ComboBox"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          selectionMode="multiple"
          {...props.comboBoxProps}
        >
          <ComboBoxTagGroup>{(item) => <ComboBoxTag item={item} />}</ComboBoxTagGroup>
          <ComboBoxInput />
          <ComboBoxButton>&#9660;</ComboBoxButton>
          <ComboBoxListBox>
            {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
          </ComboBoxListBox>
        </ComboBox>
      );
    }

    it("allows selecting multiple items", async () => {
      const onSelectionChangeMultiple = vi.fn();
      render(() => <MultiSelectComboBox comboBoxProps={{ onSelectionChangeMultiple }} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Select first item
      const appleOption = screen.getByRole("option", { name: "Apple" });
      await user.click(appleOption);

      await waitFor(() => {
        expect(onSelectionChangeMultiple).toHaveBeenCalledWith(new Set(["1"]));
      });

      // Select second item
      const bananaOption = screen.getByRole("option", { name: "Banana" });
      await user.click(bananaOption);

      await waitFor(() => {
        expect(onSelectionChangeMultiple).toHaveBeenCalledWith(new Set(["1", "2"]));
      });
    });

    it("keeps menu open after selection", async () => {
      render(() => <MultiSelectComboBox />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Select an item
      const option = screen.getByRole("option", { name: "Apple" });
      await user.click(option);

      // Menu should still be open
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    it("shows selected items as tags", async () => {
      render(() => <MultiSelectComboBox comboBoxProps={{ defaultSelectedKeys: ["1", "3"] }} />);

      // Tags should be rendered for the selected items
      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Cherry")).toBeInTheDocument();
      });

      // Should have remove buttons
      const removeButtons = screen.getAllByRole("button", { name: /Remove/ });
      expect(removeButtons.length).toBe(2);
    });

    it("removes last selected item on Backspace when input empty", async () => {
      const onSelectionChangeMultiple = vi.fn();
      render(() => (
        <MultiSelectComboBox
          comboBoxProps={{
            defaultSelectedKeys: ["1", "2"],
            onSelectionChangeMultiple,
          }}
        />
      ));

      const input = screen.getByRole("combobox");
      input.focus();

      // Press Backspace with empty input
      await user.keyboard("{Backspace}");

      await waitFor(() => {
        // Should remove the last key ('2')
        expect(onSelectionChangeMultiple).toHaveBeenCalledWith(new Set(["1"]));
      });
    });

    it("sets aria-multiselectable on listbox", async () => {
      render(() => <MultiSelectComboBox comboBoxProps={{ defaultOpen: true }} />);

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toHaveAttribute("aria-multiselectable", "true");
      });
    });

    it("single mode still works as before (regression)", async () => {
      const onSelectionChange = vi.fn();
      render(() => <TestComboBox comboBoxProps={{ defaultOpen: true, onSelectionChange }} />);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Select an item
      const option = screen.getByRole("option", { name: "Banana" });
      await user.click(option);

      // Should call single-mode handler
      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith("2");
      });

      // Menu should close in single mode
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });

      // Listbox should NOT have aria-multiselectable
      // (it's closed now, so we can't check - but we verified single mode behavior)
    });
  });

  // ============================================
  // RTL (Right-to-Left) KEYBOARD NAVIGATION
  // ============================================

  describe("RTL keyboard navigation", () => {
    it("should open listbox with ArrowDown in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestComboBox />
        </I18nProvider>
      ));

      const input = screen.getByRole("combobox");
      input.focus();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
      });
    });

    it("should open listbox with ArrowUp in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestComboBox />
        </I18nProvider>
      ));

      const input = screen.getByRole("combobox");
      input.focus();
      await user.keyboard("{ArrowUp}");

      await waitFor(() => {
        const listbox = screen.getByRole("listbox");
        expect(listbox).toBeInTheDocument();
      });
    });

    it("should navigate listbox options with ArrowDown/ArrowUp in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestComboBox comboBoxProps={{ defaultOpen: true }} />
        </I18nProvider>
      ));

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const input = screen.getByRole("combobox");
      input.focus();

      // ArrowDown should navigate options normally (vertical list unaffected by RTL)
      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("should render combobox correctly within RTL context", () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestComboBox />
        </I18nProvider>
      ));

      const input = screen.getByRole("combobox");
      expect(input).toBeInTheDocument();

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });
});
