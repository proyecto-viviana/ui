/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import {
  Autocomplete,
  AutocompleteContext,
  AutocompleteStateContext,
  AutocompleteCollectionContext,
  useAutocompleteInput,
  useAutocompleteState,
  useAutocompleteCollection,
} from "../src/Autocomplete";
import { ListBox, ListBoxOption } from "../src/ListBox";
import { SearchField, SearchFieldInput } from "../src/SearchField";
import { createFilter } from "@proyecto-viviana/solidaria";
import { For, Show, createSignal } from "solid-js";

// Simple test input component
function TestInput() {
  const ctx = useAutocompleteInput();
  if (!ctx) return <input data-testid="input" />;

  return (
    <input
      ref={ctx.inputRef}
      data-testid="input"
      value={ctx.inputProps.value()}
      onInput={(e) => ctx.inputProps.onChange(e.currentTarget.value)}
      onKeyDown={ctx.inputProps.onKeyDown}
      aria-activedescendant={ctx.inputProps["aria-activedescendant"]()}
      aria-controls={ctx.inputProps["aria-controls"]}
    />
  );
}

// Simple test list component
function TestList(props: { items: { id: string; name: string }[] }) {
  const ctx = useAutocompleteCollection();
  const state = useAutocompleteState();

  if (!ctx) {
    return (
      <ul data-testid="list">
        <For each={props.items}>
          {(item) => <li data-testid={`item-${item.id}`}>{item.name}</li>}
        </For>
      </ul>
    );
  }

  const filteredItems = () =>
    ctx.filter ? props.items.filter((item) => ctx.filter!(item.name)) : props.items;

  return (
    <ul
      ref={ctx.collectionRef}
      id={ctx.collectionProps.id}
      role="listbox"
      aria-label={ctx.collectionProps["aria-label"]}
      data-testid="list"
    >
      <For each={filteredItems()}>
        {(item) => (
          <li
            id={`item-${item.id}`}
            role="option"
            data-testid={`item-${item.id}`}
            onClick={() => state?.setInputValue(item.name)}
          >
            {item.name}
          </li>
        )}
      </For>
    </ul>
  );
}

describe("Autocomplete", () => {
  const testItems = [
    { id: "1", name: "Apple" },
    { id: "2", name: "Banana" },
    { id: "3", name: "Cherry" },
  ];

  it("renders children", () => {
    render(() => (
      <Autocomplete>
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect(screen.getByTestId("list")).toBeInTheDocument();
  });

  it("provides input context to children", () => {
    render(() => (
      <Autocomplete>
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("aria-controls");
  });

  it("provides collection context to children", () => {
    render(() => (
      <Autocomplete>
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    const list = screen.getByTestId("list");
    expect(list).toHaveAttribute("id");
    expect(list).toHaveAttribute("role", "listbox");
  });

  it("supports overriding collection id and aria-label", () => {
    render(() => (
      <Autocomplete collectionId="custom-listbox" collectionAriaLabel="Fruit suggestions">
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    const input = screen.getByTestId("input");
    const list = screen.getByTestId("list");
    expect(input).toHaveAttribute("aria-controls", "custom-listbox");
    expect(list).toHaveAttribute("id", "custom-listbox");
    expect(list).toHaveAttribute("aria-label", "Fruit suggestions");
  });

  it("filters items based on input value", () => {
    const filter = (textValue: string, inputValue: string) =>
      textValue.toLowerCase().includes(inputValue.toLowerCase());

    render(() => (
      <Autocomplete filter={filter}>
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    // Initially all items visible
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-2")).toBeInTheDocument();
    expect(screen.getByTestId("item-3")).toBeInTheDocument();

    // Type to filter
    const input = screen.getByTestId("input");
    fireEvent.input(input, { target: { value: "ban" } });

    expect(screen.queryByTestId("item-1")).not.toBeInTheDocument(); // Apple
    expect(screen.getByTestId("item-2")).toBeInTheDocument(); // Banana
    expect(screen.queryByTestId("item-3")).not.toBeInTheDocument(); // Cherry
  });

  it("calls onInputChange when input value changes", () => {
    const onInputChange = vi.fn();

    render(() => (
      <Autocomplete onInputChange={onInputChange}>
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    const input = screen.getByTestId("input");
    fireEvent.input(input, { target: { value: "test" } });

    expect(onInputChange).toHaveBeenCalledWith("test");
  });

  it("supports controlled input value", () => {
    render(() => (
      <Autocomplete inputValue="controlled">
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.value).toBe("controlled");
  });

  it("reacts to controlled input value changes", () => {
    let setValue: ((value: string) => void) | undefined;

    function ControlledAutocomplete() {
      const [value, _setValue] = createSignal("initial");
      setValue = _setValue;

      return (
        <Autocomplete inputValue={value()}>
          <TestInput />
          <TestList items={testItems} />
        </Autocomplete>
      );
    }

    render(() => <ControlledAutocomplete />);

    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.value).toBe("initial");
    setValue?.("updated");
    expect(input.value).toBe("updated");
  });

  it("supports default input value", () => {
    render(() => (
      <Autocomplete defaultInputValue="default">
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.value).toBe("default");
  });

  it("updates input value when item is clicked", () => {
    render(() => (
      <Autocomplete>
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    const item = screen.getByTestId("item-2");
    fireEvent.click(item);

    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.value).toBe("Banana");
  });

  it("connects input aria-controls to list id", () => {
    render(() => (
      <Autocomplete>
        <TestInput />
        <TestList items={testItems} />
      </Autocomplete>
    ));

    const input = screen.getByTestId("input");
    const list = screen.getByTestId("list");

    const controlsId = input.getAttribute("aria-controls");
    const listId = list.getAttribute("id");

    expect(controlsId).toBe(listId);
  });

  it("exposes useAutocompleteState hook", () => {
    function StateConsumer() {
      const state = useAutocompleteState();
      return <span data-testid="state">{state ? "has-state" : "no-state"}</span>;
    }

    render(() => (
      <Autocomplete>
        <StateConsumer />
      </Autocomplete>
    ));

    expect(screen.getByTestId("state")).toHaveTextContent("has-state");
  });

  it("returns null from hooks when used outside context", () => {
    function InputOutsideContext() {
      const ctx = useAutocompleteInput();
      return <span data-testid="result">{ctx ? "has-context" : "no-context"}</span>;
    }

    render(() => <InputOutsideContext />);
    expect(screen.getByTestId("result")).toHaveTextContent("no-context");
  });
});

// Comparison Autocomplete fruits — RAC contains() drops Cherry/Lemon on "a"
// and unmounts every option on "zzz". Stub TestList already filters; this is
// the real SearchField + ListBox path (#288).
const fruitItems = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "cherry", label: "Cherry" },
  { id: "grape", label: "Grape" },
  { id: "lemon", label: "Lemon" },
  { id: "mango", label: "Mango" },
  { id: "orange", label: "Orange" },
  { id: "peach", label: "Peach" },
];

function FruitAutocomplete() {
  const filter = createFilter({ sensitivity: "base" });
  return (
    <Autocomplete filter={(textValue, inputValue) => filter().contains(textValue, inputValue)}>
      <SearchField aria-label="Search fruits">{() => <SearchFieldInput />}</SearchField>
      <ListBox
        aria-label="Fruits"
        items={fruitItems}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
      >
        {(item) => (
          <ListBoxOption id={item.id} textValue={item.label}>
            {item.label}
          </ListBoxOption>
        )}
      </ListBox>
    </Autocomplete>
  );
}

describe("Autocomplete SearchField + ListBox", () => {
  it("unmounts options that fail the contains filter as the user types", () => {
    render(() => <FruitAutocomplete />);

    expect(screen.getAllByRole("option")).toHaveLength(8);

    fireEvent.input(screen.getByRole("searchbox"), { target: { value: "a" } });

    const afterA = screen.getAllByRole("option").map((option) => option.textContent);
    expect(afterA).toEqual(["Apple", "Banana", "Grape", "Mango", "Orange", "Peach"]);
    expect(screen.queryByRole("option", { name: "Cherry" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Lemon" })).not.toBeInTheDocument();

    fireEvent.input(screen.getByRole("searchbox"), { target: { value: "zzz" } });

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByRole("listbox")).toHaveAttribute("data-empty");
  });

  // RAC AriaAutocompleteTests assert autoCorrect/spellCheck/enterkeyhint on the
  // searchbox; live RAC also sets autocomplete=off. createAutocomplete already
  // returns all four; SearchFieldInput must last-win them over SearchField's
  // undefined getters (#289). ARIA already matches — fail if any native attr
  // is omitted while aria-autocomplete/aria-controls still pass.
  it("sets autocomplete autocorrect spellcheck and enterkeyhint on the searchbox", () => {
    render(() => <FruitAutocomplete />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-controls");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
    expect(input).toHaveAttribute("enterkeyhint", "go");

    fireEvent.input(input, { target: { value: "a" } });

    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
    expect(input).toHaveAttribute("enterkeyhint", "go");
  });
});
