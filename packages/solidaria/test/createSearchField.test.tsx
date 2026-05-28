/**
 * Tests for createSearchField hook.
 * Ported from @react-aria/searchfield useSearchField.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createSearchField } from "../src/searchfield/createSearchField";
import { createSearchFieldState } from "@proyecto-viviana/solid-stately";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// Test component that uses createSearchField
function TestSearchField(props: {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  validationBehavior?: "aria" | "native";
  "aria-label"?: string;
  label?: string;
  type?: string;
  name?: string;
  form?: string;
  placeholder?: string;
  enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  excludeFromTabOrder?: boolean;
  onKeyDown?: (e: KeyboardEvent) => void;
}) {
  let inputRef: HTMLInputElement | null = null;

  const state = createSearchFieldState({
    defaultValue: props.defaultValue ?? "",
    value: props.value,
    onChange: props.onChange,
  });

  const { labelProps, inputProps, clearButtonProps } = createSearchField(
    () => ({
      "aria-label": props["aria-label"],
      label: props.label,
      placeholder: props.placeholder,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isRequired: props.isRequired,
      validationBehavior: props.validationBehavior,
      type: props.type,
      name: props.name,
      form: props.form,
      enterKeyHint: props.enterKeyHint,
      excludeFromTabOrder: props.excludeFromTabOrder,
      onSubmit: props.onSubmit,
      onClear: props.onClear,
      onKeyDown: props.onKeyDown as any,
    }),
    state,
    () => inputRef,
  );

  // Extract value-related props and bind to state
  const { value: _, onChange: __, ...restInputProps } = inputProps;

  return (
    <div>
      {props.label && <label {...labelProps}>{props.label}</label>}
      <input
        ref={(el) => (inputRef = el)}
        {...restInputProps}
        value={state.value()}
        onInput={(e) => state.setValue(e.currentTarget.value)}
        data-testid="search-input"
      />
      <button {...clearButtonProps} data-testid="clear-button">
        Clear
      </button>
    </div>
  );
}

describe("createSearchField", () => {
  afterEach(() => {
    cleanup();
  });

  describe("accessibility", () => {
    it('should have type="search"', () => {
      render(() => <TestSearchField aria-label="Search" />);
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("type", "search");
    });

    it("should allow type override", () => {
      render(() => <TestSearchField aria-label="Search" type="text" />);
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("type", "text");
    });

    it("should default required state to native validation", () => {
      render(() => <TestSearchField aria-label="Search" isRequired />);
      const input = screen.getByTestId("search-input");
      expect(input).toBeRequired();
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("should support aria validation behavior", () => {
      render(() => <TestSearchField aria-label="Search" isRequired validationBehavior="aria" />);
      const input = screen.getByTestId("search-input");
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should forward form DOM props and focus exclusion", () => {
      render(() => (
        <TestSearchField
          aria-label="Search"
          name="query"
          form="searchForm"
          enterKeyHint="search"
          excludeFromTabOrder
        />
      ));
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("name", "query");
      expect(input).toHaveAttribute("form", "searchForm");
      expect(input).toHaveAttribute("enterkeyhint", "search");
      expect(input).toHaveAttribute("tabindex", "-1");
    });

    it("should support aria-label", () => {
      render(() => <TestSearchField aria-label="Search products" />);
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("aria-label", "Search products");
    });

    it("should support visible label", () => {
      render(() => <TestSearchField label="Search products" />);
      expect(screen.getByText("Search products")).toBeInTheDocument();
    });

    it("clear button should have aria-label", () => {
      render(() => <TestSearchField aria-label="Search" />);
      const clearButton = screen.getByTestId("clear-button");
      expect(clearButton).toHaveAttribute("aria-label", "Clear search");
    });

    it("clear button should not be tabbable", () => {
      render(() => <TestSearchField aria-label="Search" />);
      const clearButton = screen.getByTestId("clear-button");
      expect(clearButton).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("uncontrolled mode", () => {
    it("should use defaultValue", () => {
      render(() => <TestSearchField aria-label="Search" defaultValue="initial query" />);
      const input = screen.getByTestId("search-input") as HTMLInputElement;
      expect(input.value).toBe("initial query");
    });

    it("should update value on input", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSearchField aria-label="Search" onChange={onChange} />);

      const input = screen.getByTestId("search-input");
      await user.type(input, "test");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", () => {
      render(() => <TestSearchField aria-label="Search" value="controlled" />);
      const input = screen.getByTestId("search-input") as HTMLInputElement;
      expect(input.value).toBe("controlled");
    });
  });

  describe("keyboard behavior", () => {
    it("should call onSubmit on Enter", async () => {
      const user = setupUser();
      const onSubmit = vi.fn();
      render(() => (
        <TestSearchField aria-label="Search" defaultValue="query" onSubmit={onSubmit} />
      ));

      const input = screen.getByTestId("search-input");
      input.focus();
      await user.keyboard("{Enter}");

      expect(onSubmit).toHaveBeenCalledWith("query");
    });

    it("should not call onSubmit on Enter if not provided", async () => {
      const user = setupUser();
      render(() => <TestSearchField aria-label="Search" defaultValue="query" />);

      const input = screen.getByTestId("search-input");
      input.focus();

      // Should not throw
      await user.keyboard("{Enter}");
    });

    it("should clear value and call onClear on Escape when value exists", async () => {
      const user = setupUser();
      const onClear = vi.fn();
      render(() => <TestSearchField aria-label="Search" defaultValue="query" onClear={onClear} />);

      const input = screen.getByTestId("search-input") as HTMLInputElement;
      input.focus();
      await user.keyboard("{Escape}");

      expect(onClear).toHaveBeenCalled();
      expect(input.value).toBe("");
    });

    it("should not call onClear on Escape when value is empty", async () => {
      const user = setupUser();
      const onClear = vi.fn();
      render(() => <TestSearchField aria-label="Search" defaultValue="" onClear={onClear} />);

      const input = screen.getByTestId("search-input");
      input.focus();
      await user.keyboard("{Escape}");

      expect(onClear).not.toHaveBeenCalled();
    });

    it("should not have onKeyDown behavior when disabled", async () => {
      const user = setupUser();
      const onSubmit = vi.fn();
      const onClear = vi.fn();
      render(() => (
        <TestSearchField
          aria-label="Search"
          defaultValue="query"
          isDisabled
          onSubmit={onSubmit}
          onClear={onClear}
        />
      ));

      const input = screen.getByTestId("search-input");
      input.focus();
      await user.keyboard("{Enter}");
      await user.keyboard("{Escape}");

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onClear).not.toHaveBeenCalled();
    });

    it("should call user onKeyDown handlers in addition to built-in behavior", async () => {
      const user = setupUser();
      const onSubmit = vi.fn();
      const onKeyDown = vi.fn();
      render(() => (
        <TestSearchField
          aria-label="Search"
          defaultValue="query"
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
        />
      ));

      const input = screen.getByTestId("search-input");
      input.focus();
      await user.keyboard("{Enter}");

      expect(onSubmit).toHaveBeenCalledWith("query");
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe("clear button", () => {
    it("should clear value and focus input on click", async () => {
      const user = setupUser();
      const onClear = vi.fn();
      render(() => <TestSearchField aria-label="Search" defaultValue="query" onClear={onClear} />);

      const input = screen.getByTestId("search-input") as HTMLInputElement;
      const clearButton = screen.getByTestId("clear-button");

      await user.click(clearButton);

      expect(onClear).toHaveBeenCalled();
      expect(input.value).toBe("");
      expect(document.activeElement).toBe(input);
    });

    it("should prevent default on mousedown to prevent focus loss", () => {
      render(() => <TestSearchField aria-label="Search" defaultValue="query" />);

      const clearButton = screen.getByTestId("clear-button");
      const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      clearButton.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should be disabled when search field is disabled", () => {
      render(() => <TestSearchField aria-label="Search" isDisabled />);

      const clearButton = screen.getByTestId("clear-button");
      expect(clearButton).toBeDisabled();
    });

    it("should be disabled when search field is readonly", () => {
      render(() => <TestSearchField aria-label="Search" isReadOnly />);

      const clearButton = screen.getByTestId("clear-button");
      expect(clearButton).toBeDisabled();
    });
  });

  describe("placeholder", () => {
    it("should support placeholder text", () => {
      render(() => <TestSearchField aria-label="Search" placeholder="Search..." />);
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("placeholder", "Search...");
    });
  });

  describe("disabled state", () => {
    it("should be disabled when isDisabled is true", () => {
      render(() => <TestSearchField aria-label="Search" isDisabled />);
      const input = screen.getByTestId("search-input");
      expect(input).toBeDisabled();
    });
  });

  describe("readonly state", () => {
    it("should be readonly when isReadOnly is true", () => {
      render(() => <TestSearchField aria-label="Search" isReadOnly />);
      const input = screen.getByTestId("search-input");
      expect(input).toHaveAttribute("readonly");
    });
  });
});

describe("createSearchField edge cases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should handle rapid clear and type", async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(() => <TestSearchField aria-label="Search" onChange={onChange} />);

    const input = screen.getByTestId("search-input");
    const clearButton = screen.getByTestId("clear-button");

    await user.type(input, "test");
    await user.click(clearButton);
    await user.type(input, "new");

    expect(onChange).toHaveBeenCalled();
  });

  it("should handle no inputRef gracefully", () => {
    function TestSearchFieldNoRef(props: { "aria-label"?: string }) {
      const state = createSearchFieldState({ defaultValue: "" });

      const { inputProps } = createSearchField(
        () => ({ "aria-label": props["aria-label"] }),
        state,
        () => null, // No ref
      );

      return <input {...inputProps} data-testid="search-input" />;
    }

    render(() => <TestSearchFieldNoRef aria-label="Search" />);
    const input = screen.getByTestId("search-input");
    expect(input).toBeInTheDocument();
  });
});
