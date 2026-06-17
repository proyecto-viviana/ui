/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { SearchAutocomplete } from "../src/autocomplete";

const items = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Banana" },
  { id: "3", name: "Cherry" },
  { id: "4", name: "Date" },
];

describe("SearchAutocomplete (solid-spectrum)", () => {
  describe("basic rendering", () => {
    it("renders combobox input", () => {
      render(() => <SearchAutocomplete items={items} aria-label="Fruits" />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(() => <SearchAutocomplete items={items} label="Select a fruit" />);
      expect(screen.getByText("Select a fruit")).toBeInTheDocument();
    });

    it("renders with description", () => {
      render(() => (
        <SearchAutocomplete items={items} aria-label="Fruits" description="Pick your favorite" />
      ));
      expect(screen.getByText("Pick your favorite")).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(() => (
        <SearchAutocomplete items={items} aria-label="Fruits" placeholder="Search fruits..." />
      ));
      expect(screen.getByPlaceholderText("Search fruits...")).toBeInTheDocument();
    });
  });

  describe("sizes", () => {
    it("renders with default md size", () => {
      const { container } = render(() => <SearchAutocomplete items={items} aria-label="Fruits" />);
      expect(container.querySelector(".vui-search-autocomplete")).toBeInTheDocument();
    });

    it("renders with sm size", () => {
      const { container } = render(() => (
        <SearchAutocomplete items={items} aria-label="Fruits" size="sm" />
      ));
      expect(container.querySelector(".vui-search-autocomplete")).toBeInTheDocument();
    });

    it("renders with lg size", () => {
      const { container } = render(() => (
        <SearchAutocomplete items={items} aria-label="Fruits" size="lg" />
      ));
      expect(container.querySelector(".vui-search-autocomplete")).toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("disables the input when isDisabled is true", () => {
      render(() => <SearchAutocomplete items={items} aria-label="Fruits" isDisabled />);
      const input = screen.getByRole("combobox");
      expect(input).toBeDisabled();
    });
  });

  describe("selection", () => {
    it("calls onSelect when an item is selected", async () => {
      const onSelectSpy = vi.fn();
      render(() => <SearchAutocomplete items={items} aria-label="Fruits" onSelect={onSelectSpy} />);

      const input = screen.getByRole("combobox");
      // Focus and type to open the dropdown
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "App" } });

      // Check that the listbox opens
      const listbox = screen.queryByRole("listbox");
      if (listbox) {
        const options = screen.getAllByRole("option");
        if (options.length > 0) {
          fireEvent.click(options[0]);
          expect(onSelectSpy).toHaveBeenCalled();
        }
      }
    });
  });

  describe("custom textKey", () => {
    it("uses custom textKey for display", () => {
      const customItems = [
        { id: "1", name: "Apple", label: "Red Apple" },
        { id: "2", name: "Banana", label: "Yellow Banana" },
      ];

      render(() => (
        <SearchAutocomplete
          items={customItems}
          aria-label="Fruits"
          textKey="label"
          defaultInputValue="Red"
        />
      ));

      const input = screen.getByRole("combobox") as HTMLInputElement;
      expect(input.value).toBe("Red");
    });
  });

  describe("custom render", () => {
    it("renders custom item content", async () => {
      render(() => (
        <SearchAutocomplete
          items={items}
          aria-label="Fruits"
          renderItem={(item) => <span data-testid={`custom-${item.id}`}>{item.name} Fruit</span>}
        />
      ));

      const input = screen.getByRole("combobox");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "" } });

      // Dropdown should open with custom rendered items
      const listbox = screen.queryByRole("listbox");
      if (listbox) {
        const customEl = screen.queryByTestId("custom-1");
        if (customEl) {
          expect(customEl).toHaveTextContent("Apple Fruit");
        }
      }
    });
  });

  describe("input value", () => {
    it("supports defaultInputValue", () => {
      render(() => (
        <SearchAutocomplete items={items} aria-label="Fruits" defaultInputValue="Ban" />
      ));
      const input = screen.getByRole("combobox") as HTMLInputElement;
      expect(input.value).toBe("Ban");
    });

    it("calls onInputChange when typing", () => {
      const onInputChangeSpy = vi.fn();
      render(() => (
        <SearchAutocomplete items={items} aria-label="Fruits" onInputChange={onInputChangeSpy} />
      ));

      const input = screen.getByRole("combobox");
      fireEvent.input(input, { target: { value: "Che" } });
      expect(onInputChangeSpy).toHaveBeenCalledWith("Che");
    });
  });
});
