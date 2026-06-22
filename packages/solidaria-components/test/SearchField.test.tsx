/**
 * SearchField tests - Port of React Aria's SearchField.test.tsx
 *
 * Tests for SearchField component functionality including:
 * - Rendering
 * - Value input and clearing
 * - Submit behavior
 * - Disabled/readonly states
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import {
  SearchField,
  SearchFieldLabel,
  SearchFieldInput,
  SearchFieldClearButton,
  SearchFieldContext,
} from "../src/SearchField";
import { FieldError } from "../src/FieldError";
import { Form } from "../src/Form";
import { Text } from "../src/Text";
import {
  setupUser,
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

// Helper component for testing - SearchField uses render props pattern
function TestSearchField(props: { fieldProps?: Partial<Parameters<typeof SearchField>[0]> }) {
  return (
    <SearchField aria-label="Test Search" {...props.fieldProps}>
      {() => (
        <>
          <SearchFieldInput />
          <SearchFieldClearButton>×</SearchFieldClearButton>
        </>
      )}
    </SearchField>
  );
}

describe("SearchField", () => {
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
      render(() => <TestSearchField />);

      const field = document.querySelector(".solidaria-SearchField");
      expect(field).toBeInTheDocument();
    });

    it("should render input with searchbox role", () => {
      render(() => <TestSearchField />);

      const input = screen.getByRole("searchbox");
      expect(input).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(() => (
        <SearchField aria-label="Search">
          {() => (
            <>
              <SearchFieldLabel>Search</SearchFieldLabel>
              <SearchFieldInput />
            </>
          )}
        </SearchField>
      ));

      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    it("links aria-describedby to a <Text slot=\"description\"> via TextContext slots", () => {
      // SearchField provides descriptionProps as a TextContext slot, so the
      // <Text slot="description"> picks up the id the input's aria-describedby
      // references — the faithful upstream wiring path.
      render(() => (
        <SearchField aria-label="Search" description="Help text">
          {() => (
            <>
              <SearchFieldInput />
              <Text slot="description">Help text</Text>
            </>
          )}
        </SearchField>
      ));

      const input = screen.getByRole("searchbox");
      const describedById = input.getAttribute("aria-describedby");
      expect(describedById).toBeTruthy();
      const description = document.getElementById(describedById!);
      expect(description).toHaveTextContent("Help text");
      expect(description).toHaveClass("solidaria-Text");
    });

    it("should render with custom class", () => {
      render(() => <TestSearchField fieldProps={{ class: "my-search-field" }} />);

      const field = document.querySelector(".my-search-field");
      expect(field).toBeInTheDocument();
    });

    it("should not render clear button when empty", () => {
      render(() => <TestSearchField />);

      // Clear button uses aria-label "Clear search"
      const clearButton = screen.queryByRole("button");
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  // ============================================
  // VALUE INPUT
  // ============================================

  describe("value input", () => {
    it("should display defaultValue", () => {
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello" }} />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveValue("hello");
    });

    it("should display controlled value", () => {
      render(() => <TestSearchField fieldProps={{ value: "world" }} />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveValue("world");
    });

    it("should fire onChange when typing", async () => {
      const onChange = vi.fn();
      render(() => <TestSearchField fieldProps={{ defaultValue: "", onChange }} />);

      const input = screen.getByRole("searchbox") as HTMLInputElement;
      // Use fireEvent.change for more reliable input event firing in jsdom
      fireEvent.change(input, { target: { value: "test" } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith("test");
      });
    });

    it("should update value on type", async () => {
      render(() => <TestSearchField fieldProps={{ defaultValue: "" }} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "test");

      expect(input).toHaveValue("test");
    });

    it("keeps the same input node focused after a text input event", async () => {
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello" }} />);
      const input = screen.getByRole("searchbox") as HTMLInputElement;

      input.focus();
      fireEvent.input(input, { target: { value: "hellox" } });
      await Promise.resolve();

      expect(input.isConnected).toBe(true);
      expect(screen.getByRole("searchbox")).toBe(input);
      expect(document.activeElement).toBe(input);
    });
  });

  // ============================================
  // CLEAR BUTTON
  // ============================================

  describe("clear button", () => {
    it("should show clear button when value is present", () => {
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello" }} />);

      const clearButton = screen.getByRole("button");
      expect(clearButton).toBeInTheDocument();
    });

    it("should clear value on clear button click", async () => {
      const onClear = vi.fn();
      const onChange = vi.fn();
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello", onClear, onChange }} />);

      const input = screen.getByRole("searchbox");
      const clearButton = screen.getByRole("button");
      await user.click(clearButton);

      // Verify the clear callback was called
      expect(onClear).toHaveBeenCalled();
      expect(input).toHaveValue("");
      // After clicking clear, the clear button should no longer be visible (since value is empty)
      await waitFor(() => {
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
      });
    });

    it("keeps focus on the same input node immediately after clear", async () => {
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello" }} />);
      const input = screen.getByRole("searchbox") as HTMLInputElement;
      const clearButton = screen.getByRole("button");

      input.focus();
      await user.click(clearButton);

      expect(input.isConnected).toBe(true);
      expect(screen.getByRole("searchbox")).toBe(input);
      expect(input).toHaveValue("");
      expect(document.activeElement).toBe(input);
    });

    it("should fire onClear callback", async () => {
      const onClear = vi.fn();
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello", onClear }} />);

      const clearButton = screen.getByRole("button");
      await user.click(clearButton);

      expect(onClear).toHaveBeenCalled();
    });

    it("should have aria-label on clear button", () => {
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello" }} />);

      const clearButton = screen.getByRole("button");
      expect(clearButton).toHaveAttribute("aria-label");
    });
  });

  // ============================================
  // SUBMIT BEHAVIOR
  // ============================================

  describe("submit behavior", () => {
    it("should fire onSubmit on Enter", async () => {
      const onSubmit = vi.fn();
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello", onSubmit }} />);

      const input = screen.getByRole("searchbox");
      input.focus();
      await user.keyboard("{Enter}");

      expect(onSubmit).toHaveBeenCalledWith("hello");
    });

    it("should forward onKeyDown to the input element", async () => {
      const onKeyDown = vi.fn();
      render(() => <TestSearchField fieldProps={{ onKeyDown }} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "a");

      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled", () => {
      render(() => <TestSearchField fieldProps={{ isDisabled: true }} />);

      const input = screen.getByRole("searchbox");
      expect(input).toBeDisabled();
    });

    it("should have data-disabled attribute on field", () => {
      render(() => <TestSearchField fieldProps={{ isDisabled: true }} />);

      const field = document.querySelector(".solidaria-SearchField");
      expect(field).toHaveAttribute("data-disabled");
    });

    it("should not allow typing when disabled", async () => {
      render(() => <TestSearchField fieldProps={{ isDisabled: true, defaultValue: "" }} />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "test");

      expect(input).toHaveValue("");
    });
  });

  // ============================================
  // READ ONLY STATE
  // ============================================

  describe("read only state", () => {
    it("should support isReadOnly", () => {
      render(() => <TestSearchField fieldProps={{ isReadOnly: true }} />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveAttribute("readonly");
    });

    it("should have data-readonly attribute on field", () => {
      render(() => <TestSearchField fieldProps={{ isReadOnly: true }} />);

      const field = document.querySelector(".solidaria-SearchField");
      expect(field).toHaveAttribute("data-readonly");
    });
  });

  // ============================================
  // REQUIRED STATE
  // ============================================

  describe("required state", () => {
    it("should support isRequired with native validation by default", () => {
      render(() => <TestSearchField fieldProps={{ isRequired: true }} />);

      const input = screen.getByRole("searchbox");
      expect(input).toBeRequired();
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("should support aria validation behavior", () => {
      render(() => (
        <TestSearchField fieldProps={{ isRequired: true, validationBehavior: "aria" }} />
      ));

      const input = screen.getByRole("searchbox");
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should inherit validation behavior from Form", () => {
      render(() => (
        <Form validationBehavior="aria">
          <TestSearchField fieldProps={{ isRequired: true }} />
        </Form>
      ));

      const input = screen.getByRole("searchbox");
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should have data-required attribute on field", () => {
      render(() => <TestSearchField fieldProps={{ isRequired: true }} />);

      const field = document.querySelector(".solidaria-SearchField");
      expect(field).toHaveAttribute("data-required");
    });
  });

  // ============================================
  // INVALID STATE
  // ============================================

  describe("invalid state", () => {
    it("should support isInvalid", () => {
      render(() => <TestSearchField fieldProps={{ isInvalid: true }} />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have data-invalid attribute on field", () => {
      render(() => <TestSearchField fieldProps={{ isInvalid: true }} />);

      const field = document.querySelector(".solidaria-SearchField");
      expect(field).toHaveAttribute("data-invalid");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have searchbox role on input", () => {
      render(() => <TestSearchField />);

      const input = screen.getByRole("searchbox");
      expect(input).toBeInTheDocument();
    });

    it("should have aria-label when provided", () => {
      render(() => <TestSearchField />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveAttribute("aria-label", "Test Search");
    });

    it("should have search type on input", () => {
      render(() => <TestSearchField />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveAttribute("type", "search");
    });

    it("should forward form and type props", () => {
      render(() => (
        <TestSearchField
          fieldProps={{
            type: "text",
            name: "query",
            form: "searchForm",
            enterKeyHint: "search",
          }}
        />
      ));

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("name", "query");
      expect(input).toHaveAttribute("form", "searchForm");
      expect(input).toHaveAttribute("enterkeyhint", "search");
    });

    it("should merge SearchFieldContext props", () => {
      render(() => (
        <SearchFieldContext.Provider
          value={{
            slots: {
              default: {
                "aria-label": "Context search",
                defaultValue: "from context",
              },
            },
          }}
        >
          <SearchField>{() => <SearchFieldInput />}</SearchField>
        </SearchFieldContext.Provider>
      ));

      const input = screen.getByRole("searchbox", { name: "Context search" });
      expect(input).toHaveValue("from context");
    });

    it("should provide FieldError context", () => {
      render(() => (
        <SearchField aria-label="Search" isInvalid errorMessage="Search term required">
          {() => (
            <>
              <SearchFieldInput />
              <FieldError />
            </>
          )}
        </SearchField>
      ));

      expect(screen.getByText("Search term required")).toBeInTheDocument();
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-empty when empty", () => {
      render(() => <TestSearchField />);

      const field = document.querySelector(".solidaria-SearchField");
      expect(field).toHaveAttribute("data-empty");
    });

    it("should not have data-empty when has value", () => {
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello" }} />);

      const field = document.querySelector(".solidaria-SearchField");
      expect(field).not.toHaveAttribute("data-empty");
    });
  });

  describe("a11y validation", () => {
    it("axe: empty state", async () => {
      const { container } = render(() => <TestSearchField />);
      await assertNoA11yViolations(container);
    });

    it("axe: with value (clear button visible)", async () => {
      const { container } = render(() => (
        <TestSearchField fieldProps={{ defaultValue: "query" }} />
      ));
      await assertNoA11yViolations(container);
    });

    it("axe: disabled", async () => {
      const { container } = render(() => <TestSearchField fieldProps={{ isDisabled: true }} />);
      await assertNoA11yViolations(container);
    });

    it("axe: invalid", async () => {
      const { container } = render(() => <TestSearchField fieldProps={{ isInvalid: true }} />);
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs", () => {
      render(() => <TestSearchField fieldProps={{ defaultValue: "hello" }} />);
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: data-testid forwards", () => {
      render(() => <TestSearchField fieldProps={{ "data-testid": "search" } as any} />);
      const field = document.querySelector(".solidaria-SearchField");
      expect(field).toHaveAttribute("data-testid", "search");
    });
  });
});
