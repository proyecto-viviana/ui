/**
 * Select tests - Port of React Aria's Select.test.tsx
 *
 * Tests for Select component functionality including:
 * - Rendering
 * - Trigger behavior
 * - Selection
 * - Keyboard navigation
 * - Disabled states
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { createSignal, useContext } from "solid-js";
import h from "solid-js/h";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectListBox,
  SelectOption,
  SelectStateContext,
} from "../src/Select";
import { FieldError } from "../src/FieldError";
import { SelectionIndicator } from "../src/SelectionIndicator";
import type { Key } from "@proyecto-viviana/solid-stately";
import { setupUser, assertAriaIdIntegrity } from "@proyecto-viviana/solidaria-test-utils";

// Setup userEvent
const user = setupUser();

// Test data
interface TestItem {
  id: string;
  name: string;
}

const testItems: TestItem[] = [
  { id: "cat", name: "Cat" },
  { id: "dog", name: "Dog" },
  { id: "kangaroo", name: "Kangaroo" },
];

// Helper component for testing Select
function TestSelect(props: {
  selectProps?: Partial<Parameters<typeof Select<TestItem>>[0]>;
  items?: TestItem[];
}) {
  const items = props.items || testItems;
  return (
    <Select<TestItem>
      aria-label="Test Select"
      items={items}
      getKey={(item) => item.id}
      getTextValue={(item) => item.name}
      {...props.selectProps}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectListBox>
        {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
      </SelectListBox>
    </Select>
  );
}

describe("Select", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => <TestSelect />);

      const select = document.querySelector(".solidaria-Select");
      expect(select).toBeInTheDocument();
    });

    it("should render trigger with default class", () => {
      render(() => <TestSelect />);

      const trigger = screen.getByRole("button", { name: "Test Select" });
      expect(trigger).toHaveClass("solidaria-Select-trigger");
    });

    it("should render with custom class", () => {
      render(() => <TestSelect selectProps={{ class: "my-select" }} />);

      const select = document.querySelector(".my-select");
      expect(select).toBeInTheDocument();
    });

    it("should render placeholder when no selection", () => {
      render(() => <TestSelect />);

      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("should expose the trigger as a button with a listbox popup", () => {
      render(() => <TestSelect />);

      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    });

    it("should wire visible label via aria-labelledby", () => {
      render(() => (
        <Select<TestItem>
          label="Animals"
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      const trigger = screen.getByRole("button", { name: "Animals" });
      const label = screen.getByText("Animals");
      expect(trigger.getAttribute("aria-labelledby")).toContain(label.id);
    });

    it("should apply accessible labels to the trigger without duplicating them on the root", () => {
      render(() => <TestSelect />);

      const root = document.querySelector(".solidaria-Select");
      const trigger = screen.getByRole("button", { name: "Test Select" });
      expect(root).not.toHaveAttribute("aria-label");
      expect(root).not.toHaveAttribute("aria-labelledby");
      expect(trigger).toHaveAttribute("aria-label", "Test Select");
    });

    it("provides slots", async () => {
      render(() => <TestSelect selectProps={{ "data-testid": "select", "data-foo": "bar" }} />);

      const wrapper = screen.getByTestId("select");
      const trigger = screen.getByRole("button");
      expect(trigger).toHaveTextContent("Select an option");
      expect(wrapper).toHaveAttribute("data-foo", "bar");
      expect(trigger).toHaveClass("solidaria-Select-trigger");
      expect(screen.getByText("Select an option")).toHaveClass("solidaria-Select-value");

      await user.click(trigger);
      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveClass("solidaria-Select-listbox");
      expect(screen.getAllByRole("option")).toHaveLength(3);

      await user.click(screen.getByRole("option", { name: "Dog" }));
      expect(trigger).toHaveTextContent("Dog");
    });

    it("should support slot", () => {
      render(() => <TestSelect selectProps={{ slot: "test", "aria-label": "test" }} />);

      const trigger = screen.getByRole("button");
      expect(trigger.closest(".solidaria-Select")).toHaveAttribute("slot", "test");
      expect(trigger).toHaveAttribute("aria-label", "test");
    });

    it("should support custom render function", () => {
      render(() => (
        <TestSelect
          selectProps={{
            "data-testid": "select",
            render: (props) => <div {...props} data-custom="true" />,
          }}
        />
      ));

      expect(screen.getByTestId("select")).toHaveAttribute("data-custom", "true");
    });

    it("supports placeholder", () => {
      render(() => (
        <Select<TestItem>
          aria-label="Test Select"
          placeholder="Select an animal"
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));
      expect(screen.getByRole("button")).toHaveTextContent("Select an animal");
    });

    it("should support empty state", async () => {
      render(() => (
        <Select<TestItem>
          aria-label="Test Select"
          items={[]}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          allowsEmptyCollection
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectListBox renderEmptyState={() => "No results"}>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toHaveAttribute("data-empty", "true");
      expect(screen.getByRole("option")).toHaveTextContent("No results");
    });

    it("should render data- attributes only on the outer element", () => {
      render(() => <TestSelect selectProps={{ "data-testid": "select-test" }} />);
      const outerEl = screen.getAllByTestId("select-test");

      expect(outerEl).toHaveLength(1);
      expect(outerEl[0]).toHaveClass("solidaria-Select");
    });
  });

  // ============================================
  // TRIGGER BEHAVIOR
  // ============================================

  describe("trigger behavior", () => {
    it("should open listbox on trigger click", async () => {
      render(() => <TestSelect />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should focus the selected option when opening from trigger click", async () => {
      render(() => <TestSelect selectProps={{ defaultSelectedKey: "dog" }} />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const selectedOption = screen.getByRole("option", { name: "Dog" });
      expect(selectedOption).toHaveAttribute("data-focused");
    });

    it("should open listbox on Enter", async () => {
      render(() => <TestSelect />);

      const trigger = screen.getByRole("button");
      fireEvent.keyDown(trigger, { key: "Enter" });

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should open listbox on Space", async () => {
      render(() => <TestSelect />);

      const trigger = screen.getByRole("button");
      fireEvent.keyDown(trigger, { key: " " });

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should display selected value in trigger", async () => {
      render(() => <TestSelect selectProps={{ defaultSelectedKey: "cat" }} />);

      const trigger = screen.getByRole("button");
      expect(screen.getByRole("button")).toHaveTextContent("Cat");
    });

    it("should not render listbox initially", () => {
      render(() => <TestSelect />);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should support defaultOpen", () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should support autoFocus", () => {
      render(() => <TestSelect selectProps={{ autoFocus: true }} />);

      expect(document.activeElement).toBe(screen.getByRole("button"));
    });
  });

  // ============================================
  // SELECTION
  // ============================================

  describe("selection", () => {
    it("should select item on click", async () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      const options = screen.getAllByRole("option");
      await user.click(options[1]);

      // Check that the value is displayed in trigger
      const trigger = screen.getByRole("button");
      expect(trigger).toHaveTextContent("Dog");
    });

    it("should fire onSelectionChange", async () => {
      const onSelectionChange = vi.fn();
      render(() => <TestSelect selectProps={{ defaultOpen: true, onSelectionChange }} />);

      const options = screen.getAllByRole("option");
      await user.click(options[0]);

      expect(onSelectionChange).toHaveBeenCalledWith("cat");
    });

    it("should support controlled selectedKey", () => {
      render(() => <TestSelect selectProps={{ selectedKey: "dog" }} />);

      // The trigger should show the selected value
      const trigger = screen.getByRole("button");
      expect(trigger).toHaveTextContent("Dog");
    });

    it("should support defaultSelectedKey", () => {
      render(() => <TestSelect selectProps={{ defaultSelectedKey: "kangaroo" }} />);

      // The trigger should show the selected value
      const trigger = screen.getByRole("button");
      expect(trigger).toHaveTextContent("Kangaroo");
    });

    it("supports custom select value", () => {
      const items = [
        { id: 1, name: "Cat" },
        { id: 2, name: "Dog" },
      ];

      render(() => (
        <Select
          aria-label="Favorite Animal"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          defaultSelectedKey={1}
        >
          <SelectTrigger>
            <SelectValue>
              {({ selectedItem, selectedText }) => (
                <span>{selectedItem ? `${selectedItem.key} - ${selectedText}` : ""}</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      expect(screen.getByRole("button")).toHaveTextContent("1 - Cat");
    });

    it("updates SelectValue for controlled selection when composed with solid-js/h", async () => {
      function HSelectValueDemo() {
        const [selectedKey, setSelectedKey] = createSignal<Key | null>("dog");
        return h(
          "div",
          {},
          h(
            Select<TestItem>,
            {
              "aria-label": "Test Select",
              items: testItems,
              getKey: (item: TestItem) => item.id,
              getTextValue: (item: TestItem) => item.name,
              selectedKey,
              onSelectionChange: setSelectedKey,
            },
            [
              h(SelectTrigger, {}, h(SelectValue, { placeholder: "Select an option" })),
              h(SelectListBox<TestItem>, {}, (item: TestItem) =>
                h(SelectOption, { id: item.id }, item.name),
              ),
            ],
          ),
          h("button", { type: "button", onClick: () => setSelectedKey("cat") }, "Set Cat"),
        )();
      }

      render(() => h(HSelectValueDemo, {})());

      const trigger = screen.getByRole("button", { name: "Test Select" });
      expect(trigger).toHaveTextContent("Dog");

      await user.click(screen.getByRole("button", { name: "Set Cat" }));

      expect(screen.getByRole("button", { name: "Test Select" })).toHaveTextContent("Cat");
    });

    it("updates SelectValue for uncontrolled option selection when composed with solid-js/h", async () => {
      function HSelectValueDemo() {
        return h(
          Select<TestItem>,
          {
            "aria-label": "Test Select",
            items: testItems,
            getKey: (item: TestItem) => item.id,
            getTextValue: (item: TestItem) => item.name,
            defaultSelectedKey: "dog",
            onSelectionChange: (key: Key | null) => {
              document.body.dataset.hUncontrolledChangeKey = key == null ? "" : String(key);
            },
          },
          [
            h(SelectTrigger, {}, h(SelectValue, { placeholder: "Select an option" })),
            h(SelectListBox<TestItem>, {}, (item: TestItem) =>
              h(SelectOption, { id: item.id }, item.name),
            ),
          ],
        )();
      }

      render(() => h(HSelectValueDemo, {})());

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveTextContent("Dog");

      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Cat" }));

      expect(document.body.dataset.hUncontrolledChangeKey).toBe("cat");
      expect(screen.getByRole("button")).toHaveTextContent("Cat");
    });

    it("should support falsy (0) as a valid default value", async () => {
      const numberItems = Array.from({ length: 5 }, (_, id) => ({ id, name: String(id) }));
      render(() => (
        <Select
          aria-label="Pick a number"
          items={numberItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
        >
          <SelectTrigger>
            <SelectValue placeholder="pick a number" />
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("option", { name: "0" }));

      expect(screen.getByRole("button")).toHaveTextContent("0");
    });

    it("should close on selection", async () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      const options = screen.getAllByRole("option");
      await user.click(options[0]);

      // Listbox should be closed after selection
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should set aria-selected on selected item", async () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true, defaultSelectedKey: "cat" }} />);

      const options = screen.getAllByRole("option");
      const catOption = options.find((o) => o.textContent === "Cat");
      expect(catOption).toHaveAttribute("aria-selected", "true");
    });

    it("should set data-selected on selected item", async () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true, defaultSelectedKey: "cat" }} />);

      const options = screen.getAllByRole("option");
      const catOption = options.find((o) => o.textContent === "Cat");
      expect(catOption).toHaveAttribute("data-selected");
    });

    it("should support multiple selection", async () => {
      const onSelectionChangeKeys = vi.fn();
      render(() => (
        <TestSelect
          selectProps={{
            selectionMode: "multiple",
            defaultOpen: true,
            defaultSelectedKeys: ["cat"],
            onSelectionChangeKeys,
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog")!;
      await user.click(dogOption);

      expect(screen.getByRole("button")).toHaveTextContent("Cat and Dog");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(onSelectionChangeKeys).toHaveBeenCalled();
    });

    it("should support multiple selection form integration with many items", async () => {
      const manyItems = Array.from({ length: 320 }, (_, id) => ({ id, name: `item${id}` }));
      render(() => (
        <form data-testid="form" onSubmit={(event) => event.preventDefault()}>
          <Select
            data-testid="select"
            aria-label="Select"
            name="select"
            selectionMode="multiple"
            isRequired
            items={manyItems}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <FieldError />
            <SelectListBox>
              {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
            </SelectListBox>
          </Select>
          <button data-testid="submit" type="submit">
            Submit
          </button>
        </form>
      ));

      const trigger = screen.getByRole("button", { name: "Select" });
      expect(trigger).toHaveTextContent("Select an item");

      await user.click(screen.getByTestId("submit"));
      const input = document.querySelector("[name=select]") as HTMLSelectElement;
      input.dispatchEvent(new Event("invalid", { cancelable: true }));
      await waitFor(() =>
        expect(screen.getByText("Constraints not satisfied")).toBeInTheDocument(),
      );

      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "item0" }));
      await user.click(screen.getByRole("option", { name: "item1" }));
      await user.keyboard("{Escape}");

      expect(trigger).toHaveTextContent("item0 and item1");
      expect(new FormData(screen.getByTestId("form") as HTMLFormElement).getAll("select")).toEqual([
        "0",
        "1",
      ]);

      await user.click(screen.getByTestId("submit"));
      expect(screen.queryByText("Constraints not satisfied")).not.toBeInTheDocument();
    }, 10_000);

    it("should support controlled multi-selection", async () => {
      render(() => (
        <TestSelect
          selectProps={{
            selectionMode: "multiple",
            selectedKeys: ["dog", "kangaroo"],
            defaultOpen: true,
          }}
        />
      ));

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveTextContent("Dog and Kangaroo");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("aria-selected", "false");
      expect(options[1]).toHaveAttribute("aria-selected", "true");
      expect(options[2]).toHaveAttribute("aria-selected", "true");
    });

    it("supports custom select value with multi-selection", async () => {
      const items = [
        { id: 1, name: "Cat" },
        { id: 2, name: "Dog" },
      ];

      render(() => (
        <Select
          aria-label="Favorite Animal"
          selectionMode="multiple"
          defaultSelectedKeys={[1]}
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
        >
          <SelectTrigger>
            <SelectValue>
              {({ selectedItems }) =>
                selectedItems.length === 1
                  ? selectedItems[0]?.value?.name
                  : `${selectedItems.length} selected items`
              }
            </SelectValue>
          </SelectTrigger>
          <SelectListBox>
            {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
          </SelectListBox>
        </Select>
      ));

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveTextContent("Cat");

      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Dog" }));
      expect(trigger).toHaveTextContent("2 selected items");
    });

    it("should render SelectionIndicator only for selected option", async () => {
      render(() => (
        <Select<TestItem>
          aria-label="Test Select"
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          defaultOpen
          defaultSelectedKey="cat"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectListBox>
            {(item) => (
              <SelectOption id={item.id}>
                {() => (
                  <>
                    {item.name}
                    <SelectionIndicator>Selected</SelectionIndicator>
                  </>
                )}
              </SelectOption>
            )}
          </SelectListBox>
        </Select>
      ));

      expect(screen.getAllByText("Selected")).toHaveLength(1);
      await user.click(screen.getByRole("option", { name: "Dog" }));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should support render props", async () => {
      render(() => (
        <Select<TestItem>
          aria-label="Test Select"
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          defaultOpen
        >
          {({ isOpen }) => (
            <>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
                <span aria-hidden="true">{isOpen ? "close" : "open"}</span>
              </SelectTrigger>
              <SelectListBox>
                {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
              </SelectListBox>
            </>
          )}
        </Select>
      ));

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveTextContent("close");
    });

    it("should support extra children for use with the state", async () => {
      const onSelectionChange = vi.fn();

      function SelectClearButton() {
        const selectState = useContext(SelectStateContext);
        return (
          <button
            type="button"
            data-testid="clear"
            onClick={() => selectState?.setSelectedKey(null)}
          >
            Clear
          </button>
        );
      }

      render(() => (
        <>
          <input data-testid="before" />
          <Select<TestItem>
            aria-label="Test Select"
            items={testItems}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
            onSelectionChange={onSelectionChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectClearButton />
            <SelectListBox>
              {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
            </SelectListBox>
          </Select>
          <input data-testid="after" />
        </>
      ));

      await user.tab();
      await user.tab();
      const trigger = screen.getByRole("button", { name: "Test Select" });
      expect(document.activeElement).toBe(trigger);
      await user.tab();
      expect(document.activeElement).toBe(screen.getByTestId("clear"));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByTestId("after"));

      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Dog" }));
      expect(onSelectionChange).toHaveBeenLastCalledWith("dog");

      await user.click(screen.getByTestId("clear"));
      expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    });

    it("has a value immediately after rendering", () => {
      render(() => <TestSelect selectProps={{ defaultSelectedKey: "cat" }} />);
      expect(screen.getByRole("button")).toHaveTextContent("Cat");
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  describe("keyboard navigation", () => {
    it("should move focus with Arrow Down", async () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      await user.keyboard("{ArrowDown}");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("should move focus with Arrow Up", async () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      const listbox = screen.getByRole("listbox");
      listbox.focus();

      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowUp}");

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("data-focused");
    });

    it("should open and focus first on Arrow Down from trigger", async () => {
      render(() => <TestSelect />);

      await user.tab();
      await user.keyboard("{ArrowDown}");

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("select can select an option via keyboard", async () => {
      render(() => <TestSelect />);

      const trigger = screen.getByRole("button", { name: "Test Select" });
      expect(trigger).toHaveTextContent("Select an option");

      await user.tab();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");

      expect(trigger).toHaveTextContent("Dog");
      expect(trigger).not.toHaveAttribute("data-pressed");
    });

    it("can select an option via typeahead", async () => {
      const items = [
        { id: "act", name: "Australian Capital Territory" },
        { id: "nsw", name: "New South Wales" },
        { id: "nt", name: "Northern Territory" },
        { id: "qld", name: "Queensland" },
      ];
      render(() => <TestSelect items={items} />);

      const trigger = screen.getByRole("button");
      await user.tab();
      await user.keyboard("Northern Terr");

      expect(trigger).toHaveTextContent("Northern Territory");
      expect(trigger).not.toHaveAttribute("data-pressed");
    });

    it("shouldn't allow the user to open the select if there are no items", async () => {
      render(() => <TestSelect items={[]} />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

      fireEvent.keyDown(trigger, { key: "Enter" });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ============================================
  // DISABLED STATES
  // ============================================

  describe("disabled states", () => {
    it("should support disabledKeys", () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true, disabledKeys: ["dog"] }} />);

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog");
      expect(dogOption).toHaveAttribute("aria-disabled", "true");
    });

    it("should set data-disabled on disabled items", () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true, disabledKeys: ["dog"] }} />);

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog");
      expect(dogOption).toHaveAttribute("data-disabled");
    });

    it("should not select disabled items", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestSelect
          selectProps={{
            defaultOpen: true,
            disabledKeys: ["dog"],
            onSelectionChange,
          }}
        />
      ));

      const options = screen.getAllByRole("option");
      const dogOption = options.find((o) => o.textContent === "Dog")!;
      await user.click(dogOption);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("should support isDisabled on Select", () => {
      render(() => <TestSelect selectProps={{ isDisabled: true }} />);

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("data-disabled");
    });

    it("should mark all options disabled when select isDisabled", () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true, isDisabled: true }} />);

      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("aria-disabled", "true");
      for (const option of screen.getAllByRole("option")) {
        expect(option).toHaveAttribute("aria-disabled", "true");
      }
    });

    it("should not select options when select isDisabled", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestSelect
          selectProps={{
            defaultOpen: true,
            isDisabled: true,
            onSelectionChange,
          }}
        />
      ));

      await user.click(screen.getByRole("option", { name: "Cat" }));
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("should send disabled prop to the hidden field", () => {
      render(() => <TestSelect selectProps={{ name: "select", isDisabled: true }} />);

      expect(document.querySelector("[name=select]")).toBeDisabled();
    });
  });

  // ============================================
  // OPEN/CLOSE STATE
  // ============================================

  describe("open/close state", () => {
    it("should call onOpenChange when opening", async () => {
      const onOpenChange = vi.fn();
      render(() => <TestSelect selectProps={{ onOpenChange }} />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("should set data-open when open", async () => {
      render(() => <TestSelect />);

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      expect(trigger).toHaveAttribute("data-open");
    });

    it("should support controlled isOpen", () => {
      render(() => <TestSelect selectProps={{ isOpen: true }} />);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  // ============================================
  // FOCUS/HOVER STATE
  // ============================================

  describe("focus and hover state", () => {
    it("should set data-focused on trigger focus", async () => {
      render(() => <TestSelect />);

      await user.tab();

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("data-focused");
    });

    it("should set data-focus-visible on keyboard focus", async () => {
      render(() => <TestSelect />);

      await user.tab();

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("data-focus-visible");
    });

    it("should set data-hovered on hover", async () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      const options = screen.getAllByRole("option");
      await user.hover(options[0]);

      expect(options[0]).toHaveAttribute("data-hovered");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have listbox role on popup", () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should have option role on items", () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });

    it("does not emit dangling aria-describedby on simple options", () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      const options = screen.getAllByRole("option");
      expect(options[0]).not.toHaveAttribute("aria-describedby");
    });

    it("drops generated aria-labelledby for non-primitive option content", () => {
      render(() => (
        <Select<TestItem>
          aria-label="Test Select"
          items={testItems}
          getKey={(item) => item.id}
          getTextValue={(item) => item.name}
          defaultOpen
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectListBox>
            {(item) => (
              <SelectOption id={item.id} textValue={item.name}>
                <span>
                  <strong>{item.name}</strong>
                </span>
              </SelectOption>
            )}
          </SelectListBox>
        </Select>
      ));

      const options = screen.getAllByRole("option");
      expect(options[0]).not.toHaveAttribute("aria-labelledby");
    });

    it("should support form prop", () => {
      render(() => <TestSelect selectProps={{ name: "select", form: "test" }} />);
      expect(document.querySelector("[name=select]")).toHaveAttribute("form", "test");
    });

    it("should not submit if required and selectedKey is null", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

      function Test() {
        const [selectedKey, setSelectedKey] = createSignal<Key | null>(null);
        return (
          <form onSubmit={onSubmit}>
            <TestSelect
              selectProps={{
                isRequired: true,
                name: "select",
                selectedKey: selectedKey(),
                onSelectionChange: setSelectedKey,
              }}
            />
            <button data-testid="submit" type="submit">
              Submit
            </button>
            <button data-testid="clear" type="button" onClick={() => setSelectedKey(null)}>
              Reset
            </button>
          </form>
        );
      }

      render(() => <Test />);

      const trigger = screen.getByRole("button", { name: "Test Select" });
      const submit = screen.getByTestId("submit");
      const form = submit.closest("form") as HTMLFormElement;
      expect(trigger).toHaveTextContent("Select an option");

      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Cat" }));
      expect(trigger).toHaveTextContent("Cat");

      fireEvent.submit(form);
      expect(onSubmit).toHaveBeenCalledTimes(1);

      await user.click(screen.getByTestId("clear"));
      expect(trigger).toHaveTextContent("Select an option");

      expect(form.checkValidity()).toBe(false);
      await user.click(submit);
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect((document.querySelector("[name=select]") as HTMLSelectElement).value).toBe("");
    });

    it("supports validation errors", async () => {
      render(() => (
        <form data-testid="form">
          <Select<TestItem>
            data-testid="test-select"
            name="select"
            label="Favorite Animal"
            isRequired
            items={testItems}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <FieldError />
            <SelectListBox>
              {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
            </SelectListBox>
          </Select>
        </form>
      ));

      const select = screen.getByTestId("test-select");
      const trigger = screen.getByRole("button");
      const input = document.querySelector("[name=select]") as HTMLSelectElement;
      expect(input).toHaveAttribute("required");
      expect(trigger).not.toHaveAttribute("aria-describedby");
      expect(input.validity.valid).toBe(false);
      expect(select).not.toHaveAttribute("data-invalid");

      screen.getByTestId("form").checkValidity();
      input.dispatchEvent(new Event("invalid", { cancelable: true }));
      await waitFor(() => expect(trigger).toHaveAttribute("aria-describedby"));

      expect(document.getElementById(trigger.getAttribute("aria-describedby")!)).toHaveTextContent(
        "Constraints not satisfied",
      );
      expect(select).toHaveAttribute("data-invalid");
      expect(document.activeElement).toBe(trigger);

      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Cat" }));

      expect(trigger).not.toHaveAttribute("aria-describedby");
      expect(select).not.toHaveAttribute("data-invalid");
    });
  });

  // ============================================
  // A11Y RISK AREA: ARIA ID integrity
  // ============================================

  describe("a11y ARIA ID integrity", () => {
    it("trigger aria-controls resolves to listbox when open", async () => {
      render(() => <TestSelect selectProps={{ defaultOpen: true }} />);

      // Select trigger may render as button or combobox depending on state
      const trigger =
        document.querySelector(".solidaria-SelectTrigger") ||
        screen.queryByRole("button") ||
        screen.queryByRole("combobox");
      expect(trigger).toBeTruthy();

      const controlsId = trigger!.getAttribute("aria-controls");
      if (controlsId) {
        expect(document.getElementById(controlsId)).toBeTruthy();
      }

      assertAriaIdIntegrity(document.body);
    });

    it("no dangling ARIA IDs in closed state", () => {
      render(() => <TestSelect />);

      assertAriaIdIntegrity(document.body);
    });
  });
});
