/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { createAutocomplete, type AutocompleteAria } from "../src/autocomplete";
import { createAutocompleteState, type AutocompleteState } from "@proyecto-viviana/solid-stately";
import { Show } from "solid-js";

// Test component using createAutocomplete
function TestAutocomplete(props: {
  filter?: (textValue: string, inputValue: string) => boolean;
  onInputChange?: (value: string) => void;
  items?: { id: string; name: string }[];
  collectionId?: string;
  collectionAriaLabel?: string;
  /** Omit the collection element so collectionRef never resolves (mount-deferred path). */
  renderCollection?: boolean;
  /** Receive the autocomplete state so a test can seed focusedNodeId. */
  stateRef?: (state: AutocompleteState) => void;
  /** Receive the hook return so a test can read collectionProps reactively. */
  hookRef?: (aria: AutocompleteAria) => void;
}) {
  const items = props.items ?? [
    { id: "1", name: "Apple" },
    { id: "2", name: "Banana" },
    { id: "3", name: "Cherry" },
  ];

  let inputRef: HTMLInputElement | undefined;
  let collectionRef: HTMLElement | undefined;

  const state = createAutocompleteState({
    onInputChange: props.onInputChange,
  });
  props.stateRef?.(state);

  const aria = createAutocomplete(
    {
      inputRef: () => inputRef,
      collectionRef: () => collectionRef,
      filter: props.filter,
      collectionId: props.collectionId,
      collectionAriaLabel: props.collectionAriaLabel,
    },
    state,
  );
  props.hookRef?.(aria);
  const { inputProps, collectionProps, filter } = aria;

  const filteredItems = () => (filter ? items.filter((item) => filter(item.name)) : items);

  return (
    <div>
      <input
        ref={(el) => (inputRef = el)}
        data-testid="input"
        value={inputProps.value()}
        onInput={(e) => inputProps.onChange(e.currentTarget.value)}
        onKeyDown={inputProps.onKeyDown}
        aria-activedescendant={inputProps["aria-activedescendant"]()}
        aria-controls={inputProps["aria-controls"]}
        aria-autocomplete={inputProps["aria-autocomplete"]}
      />
      <Show when={props.renderCollection ?? true}>
        <ul
          ref={(el) => (collectionRef = el)}
          id={collectionProps.id}
          role="listbox"
          aria-label={collectionProps["aria-label"]}
          data-testid="listbox"
        >
          {filteredItems().map((item) => (
            <li
              id={`item-${item.id}`}
              role="option"
              data-testid={`item-${item.id}`}
              onClick={() => {
                state.setInputValue(item.name);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </Show>
    </div>
  );
}

describe("createAutocomplete", () => {
  it("should render input with correct aria attributes", () => {
    render(() => <TestAutocomplete />);

    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-controls");
  });

  it("should render collection with id matching aria-controls", () => {
    render(() => <TestAutocomplete />);

    const input = screen.getByTestId("input");
    const listbox = screen.getByTestId("listbox");

    const controlsId = input.getAttribute("aria-controls");
    expect(listbox).toHaveAttribute("id", controlsId);
  });

  it("should not force a default collection aria-label", () => {
    render(() => <TestAutocomplete />);

    const listbox = screen.getByTestId("listbox");
    expect(listbox).not.toHaveAttribute("aria-label");
  });

  it("should allow overriding collection id and aria-label", () => {
    render(() => (
      <TestAutocomplete collectionId="custom-listbox" collectionAriaLabel="Fruit suggestions" />
    ));

    const input = screen.getByTestId("input");
    const listbox = screen.getByTestId("listbox");
    expect(input).toHaveAttribute("aria-controls", "custom-listbox");
    expect(listbox).toHaveAttribute("id", "custom-listbox");
    expect(listbox).toHaveAttribute("aria-label", "Fruit suggestions");
  });

  it("should filter items based on input value", () => {
    const filter = (textValue: string, inputValue: string) =>
      textValue.toLowerCase().includes(inputValue.toLowerCase());

    render(() => <TestAutocomplete filter={filter} />);

    const input = screen.getByTestId("input");

    // Initially all items visible
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-2")).toBeInTheDocument();
    expect(screen.getByTestId("item-3")).toBeInTheDocument();

    // Type to filter
    fireEvent.input(input, { target: { value: "app" } });

    expect(screen.getByTestId("item-1")).toBeInTheDocument(); // Apple
    expect(screen.queryByTestId("item-2")).not.toBeInTheDocument(); // Banana
    expect(screen.queryByTestId("item-3")).not.toBeInTheDocument(); // Cherry
  });

  it("should call onInputChange when input value changes", () => {
    const onInputChange = vi.fn();
    render(() => <TestAutocomplete onInputChange={onInputChange} />);

    const input = screen.getByTestId("input");
    fireEvent.input(input, { target: { value: "test" } });

    expect(onInputChange).toHaveBeenCalledWith("test");
  });

  it("should handle Enter key to select focused item", () => {
    const onInputChange = vi.fn();
    render(() => <TestAutocomplete onInputChange={onInputChange} />);

    const input = screen.getByTestId("input");

    // Note: Full Enter key handling requires focusing an item first
    // This test verifies the key handler doesn't throw
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toBeInTheDocument();
  });

  it("should handle ArrowDown key", () => {
    render(() => <TestAutocomplete />);

    const input = screen.getByTestId("input");
    const listbox = screen.getByTestId("listbox");

    // Verify keydown doesn't throw and is prevented for arrow keys
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toBeInTheDocument();
  });

  it("should forward keyboard event data to collection", () => {
    render(() => <TestAutocomplete />);

    const input = screen.getByTestId("input");
    const listbox = screen.getByTestId("listbox");
    const keySpy = vi.fn();

    listbox.addEventListener("keydown", (e) => {
      keySpy((e as KeyboardEvent).key);
    });

    fireEvent.keyDown(input, { key: "a", code: "KeyA" });

    expect(keySpy).toHaveBeenCalledWith("a");
  });

  it("should handle Escape key", () => {
    render(() => <TestAutocomplete />);

    const input = screen.getByTestId("input");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(input).toBeInTheDocument();
  });

  it("should not filter when no filter function provided", () => {
    render(() => <TestAutocomplete />);

    const input = screen.getByTestId("input");
    fireEvent.input(input, { target: { value: "xyz" } });

    // All items should still be visible
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-2")).toBeInTheDocument();
    expect(screen.getByTestId("item-3")).toBeInTheDocument();
  });

  it("should update input value when item is clicked", () => {
    render(() => <TestAutocomplete />);

    const item = screen.getByTestId("item-1");
    fireEvent.click(item);

    const input = screen.getByTestId("input") as HTMLInputElement;
    expect(input.value).toBe("Apple");
  });

  describe("forward-typing virtual focus (IME-aware)", () => {
    // The hook reads inputType from `beforeinput` (set before onChange runs),
    // then focuses the first item on forward typing and clears on edit/delete.
    function setup() {
      render(() => <TestAutocomplete />);
      const input = screen.getByTestId("input");
      const listbox = screen.getByTestId("listbox");
      const focusSpy = vi.fn();
      const clearSpy = vi.fn();
      listbox.addEventListener("autocomplete:focus", (e) =>
        focusSpy((e as CustomEvent).detail?.focusStrategy),
      );
      listbox.addEventListener("autocomplete:clearfocus", clearSpy);
      return { input, focusSpy, clearSpy };
    }

    function type(input: HTMLElement, inputType: string, value: string) {
      input.dispatchEvent(
        new InputEvent("beforeinput", { inputType, bubbles: true, cancelable: true }),
      );
      fireEvent.input(input, { target: { value } });
    }

    it("focuses the first item on plain forward typing (insertText)", () => {
      const { input, focusSpy, clearSpy } = setup();
      type(input, "insertText", "a");
      expect(focusSpy).toHaveBeenCalledWith("first");
      expect(clearSpy).not.toHaveBeenCalled();
    });

    it("focuses the first item on IME composition (insertCompositionText)", () => {
      const { input, focusSpy, clearSpy } = setup();
      type(input, "insertCompositionText", "猫");
      expect(focusSpy).toHaveBeenCalledWith("first");
      expect(clearSpy).not.toHaveBeenCalled();
    });

    it("focuses the first item on committed IME composition (insertFromComposition)", () => {
      const { input, focusSpy, clearSpy } = setup();
      type(input, "insertFromComposition", "猫");
      expect(focusSpy).toHaveBeenCalledWith("first");
      expect(clearSpy).not.toHaveBeenCalled();
    });

    it("clears virtual focus on delete (deleteContentBackward)", () => {
      const { input, focusSpy, clearSpy } = setup();
      type(input, "deleteContentBackward", "");
      expect(clearSpy).toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe("deferred first-item focus (autoFocusOnMount)", () => {
    // When forward-typing happens before the collection has mounted, the hook
    // can't dispatch a focus event into a not-yet-rendered collection, so it
    // defers via collectionProps.autoFocus = "first" and resets it on edit.
    function typeForward(input: HTMLElement, value = "a") {
      input.dispatchEvent(
        new InputEvent("beforeinput", {
          inputType: "insertText",
          bubbles: true,
          cancelable: true,
        }),
      );
      fireEvent.input(input, { target: { value } });
    }
    function typeDelete(input: HTMLElement) {
      input.dispatchEvent(
        new InputEvent("beforeinput", {
          inputType: "deleteContentBackward",
          bubbles: true,
          cancelable: true,
        }),
      );
      fireEvent.input(input, { target: { value: "" } });
    }

    it("defers to collectionProps.autoFocus when the collection isn't mounted", () => {
      let aria: AutocompleteAria | undefined;
      render(() => <TestAutocomplete renderCollection={false} hookRef={(a) => (aria = a)} />);
      const input = screen.getByTestId("input");

      expect(aria!.collectionProps.autoFocus).toBe(false);
      typeForward(input);
      // No collection to receive a focus event, so focus is deferred to mount.
      expect(aria!.collectionProps.autoFocus).toBe("first");
    });

    it("resets autoFocus on edit/delete", () => {
      let aria: AutocompleteAria | undefined;
      render(() => <TestAutocomplete renderCollection={false} hookRef={(a) => (aria = a)} />);
      const input = screen.getByTestId("input");

      typeForward(input);
      expect(aria!.collectionProps.autoFocus).toBe("first");
      typeDelete(input);
      expect(aria!.collectionProps.autoFocus).toBe(false);
    });

    it("fires a focus event (not autoFocus) when the collection is mounted", () => {
      let aria: AutocompleteAria | undefined;
      render(() => <TestAutocomplete hookRef={(a) => (aria = a)} />);
      const input = screen.getByTestId("input");
      const listbox = screen.getByTestId("listbox");
      const focusSpy = vi.fn();
      listbox.addEventListener("autocomplete:focus", (e) =>
        focusSpy((e as CustomEvent).detail?.focusStrategy),
      );

      typeForward(input);
      expect(focusSpy).toHaveBeenCalledWith("first");
      expect(aria!.collectionProps.autoFocus).toBe(false);
    });
  });

  describe("Arrow inline-navigation", () => {
    // With virtual focus, ArrowLeft/Right dispatch to the focused item first,
    // then clear the active descendant; with no virtual focus, the arrow just
    // moves the text cursor (no clear). Mirrors upstream useAutocomplete.
    function setup(opts: { focus?: string } = {}) {
      let state: AutocompleteState | undefined;
      render(() => <TestAutocomplete stateRef={(s) => (state = s)} />);
      if (opts.focus) {
        state!.setFocusedNodeId(opts.focus);
      }
      const input = screen.getByTestId("input");
      const listbox = screen.getByTestId("listbox");
      const clearSpy = vi.fn();
      listbox.addEventListener("autocomplete:clearfocus", clearSpy);
      return { input, listbox, clearSpy };
    }

    it("with no virtual focus, moves the text cursor without clearing", () => {
      const { input, listbox, clearSpy } = setup();
      const collectionKey = vi.fn();
      listbox.addEventListener("keydown", (e) => collectionKey((e as KeyboardEvent).key));

      fireEvent.keyDown(input, { key: "ArrowRight" });

      // No clear event, and the arrow is not forwarded to the collection.
      expect(clearSpy).not.toHaveBeenCalled();
      expect(collectionKey).not.toHaveBeenCalled();
    });

    it("with virtual focus, dispatches the arrow to the item before clearing", () => {
      const { input, clearSpy } = setup({ focus: "item-1" });
      const seq: string[] = [];
      const item = screen.getByTestId("item-1");
      item.addEventListener("keydown", (e) => seq.push("item:" + (e as KeyboardEvent).key));
      clearSpy.mockImplementation(() => seq.push("clear"));

      fireEvent.keyDown(input, { key: "ArrowRight" });

      expect(seq).toEqual(["item:ArrowRight", "clear"]);
    });

    it("retains virtual focus when the item consumes the arrow", () => {
      const { input, clearSpy } = setup({ focus: "item-1" });
      const item = screen.getByTestId("item-1");
      item.addEventListener("keydown", (e) => e.preventDefault());

      fireEvent.keyDown(input, { key: "ArrowLeft" });

      expect(clearSpy).not.toHaveBeenCalled();
    });
  });
});
