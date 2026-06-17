/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Content, ContextualHelp, Form, Heading, SearchField, SearchFieldContext } from "../src";

describe("SearchField (solid-spectrum)", () => {
  describe("basic rendering", () => {
    it("renders search input with label", () => {
      render(() => <SearchField label="Search" defaultValue="" />);
      expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
    });

    it("renders search input with aria-label", () => {
      render(() => <SearchField aria-label="Search items" />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("wraps the field shell in a group, matching the S2 FieldGroup", () => {
      // S2's SearchField renders its field shell as RAC <Group> (role="group")
      // around the icon, input, and clear button. The searchbox lives inside it.
      render(() => <SearchField aria-label="Search" defaultValue="x" />);
      const group = screen.getByRole("group");
      expect(group).toContainElement(screen.getByRole("searchbox"));
      expect(group).toContainElement(screen.getByRole("button"));
    });

    it("renders with default empty value", () => {
      render(() => <SearchField aria-label="Search" />);
      const input = screen.getByRole("searchbox") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("supports defaultValue", () => {
      render(() => <SearchField aria-label="Search" defaultValue="hello" />);
      const input = screen.getByRole("searchbox") as HTMLInputElement;
      expect(input.value).toBe("hello");
    });
  });

  describe("search icon", () => {
    it("renders search icon by default", () => {
      const { container } = render(() => <SearchField aria-label="Search" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders the S2 search icon consistently", () => {
      const { container } = render(() => <SearchField aria-label="Search" />);
      const searchIcon = container.querySelector('div[slot="icon"] svg');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe("clear button", () => {
    it("shows clear button when there is a value", () => {
      render(() => <SearchField aria-label="Search" defaultValue="test" />);
      const clearButton = screen.getByRole("button");
      expect(clearButton).toBeInTheDocument();
    });

    it("clears value when clear button is clicked", () => {
      const onChangeSpy = vi.fn();
      render(() => <SearchField aria-label="Search" defaultValue="test" onChange={onChangeSpy} />);
      const input = screen.getByRole("searchbox");
      const clearButton = screen.getByRole("button");
      fireEvent.click(clearButton);
      expect(onChangeSpy).toHaveBeenCalledWith("");
      expect(input).toHaveValue("");
    });

    it("hides clear button when read-only", () => {
      render(() => <SearchField aria-label="Search" defaultValue="test" isReadOnly />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("sizes", () => {
    it("renders with default md size", () => {
      render(() => <SearchField aria-label="Search" />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("renders with sm size", () => {
      render(() => <SearchField aria-label="Search" size="sm" />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("renders with lg size", () => {
      render(() => <SearchField aria-label="Search" size="lg" />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders with default outline variant", () => {
      render(() => <SearchField aria-label="Search" />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("renders with filled variant", () => {
      render(() => <SearchField aria-label="Search" variant="filled" />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("disables the input when isDisabled is true", () => {
      render(() => <SearchField aria-label="Search" isDisabled />);
      const input = screen.getByRole("searchbox");
      expect(input).toBeDisabled();
    });
  });

  describe("label and description", () => {
    it("renders label text", () => {
      render(() => <SearchField label="Search items" />);
      expect(screen.getByText("Search items")).toBeInTheDocument();
    });

    it("renders description text", () => {
      render(() => <SearchField aria-label="Search" description="Type to search" />);
      expect(screen.getByText("Type to search")).toBeInTheDocument();
    });

    it("shows error message when invalid", () => {
      render(() => (
        <SearchField aria-label="Search" isInvalid errorMessage="Search term required" />
      ));
      expect(screen.getByText("Search term required")).toBeInTheDocument();
    });

    it("shows required indicator with label", () => {
      const { container } = render(() => <SearchField label="Search" isRequired />);
      const requiredIcon = container.querySelector("label svg[aria-hidden='true']");
      expect(requiredIcon).toBeInTheDocument();
    });

    it("supports S2 label placement, required text, and contextual help", () => {
      const { container } = render(() => (
        <SearchField
          label="Search"
          labelPosition="side"
          labelAlign="end"
          necessityIndicator="label"
          isRequired
          contextualHelp={
            <ContextualHelp>
              <Heading>Search syntax</Heading>
              <Content>Use project names, owners, or status keywords.</Content>
            </ContextualHelp>
          }
        />
      ));
      expect(screen.getByText("(required)")).toBeInTheDocument();
      expect(container.querySelector('[data-slot="contextualHelp"]')).toBeInTheDocument();
      expect(screen.getByRole("searchbox", { name: /Search/ })).toBeInTheDocument();
    });
  });

  describe("validation and form props", () => {
    it("uses native validation for required fields by default", () => {
      render(() => <SearchField label="Search" isRequired />);
      const input = screen.getByRole("searchbox");
      expect(input).toBeRequired();
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("uses aria required state when validationBehavior is aria", () => {
      render(() => <SearchField label="Search" isRequired validationBehavior="aria" />);
      const input = screen.getByRole("searchbox");
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("inherits field props from Form", () => {
      render(() => (
        <Form
          size="XL"
          labelPosition="side"
          labelAlign="end"
          necessityIndicator="label"
          isRequired
          validationBehavior="aria"
        >
          <SearchField label="Search" />
        </Form>
      ));
      const input = screen.getByRole("searchbox", { name: /Search/ });
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
      expect(screen.getByText("(required)")).toBeInTheDocument();
    });

    it("forwards form, name, type, and enterKeyHint", () => {
      render(() => (
        <SearchField
          label="Search"
          type="text"
          name="projectSearch"
          form="projectSearchForm"
          enterKeyHint="search"
        />
      ));
      const input = screen.getByRole("textbox", { name: "Search" });
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("name", "projectSearch");
      expect(input).toHaveAttribute("form", "projectSearchForm");
      expect(input).toHaveAttribute("enterkeyhint", "search");
    });

    it("merges public SearchFieldContext props", () => {
      render(() => (
        <SearchFieldContext.Provider
          value={{ "aria-label": "Context search", defaultValue: "context value", size: "XL" }}
        >
          <SearchField />
        </SearchFieldContext.Provider>
      ));
      expect(screen.getByRole("searchbox", { name: "Context search" })).toHaveValue(
        "context value",
      );
    });
  });

  describe("onChange", () => {
    it("calls onChange when input value changes", () => {
      const onChangeSpy = vi.fn();
      render(() => <SearchField aria-label="Search" onChange={onChangeSpy} />);
      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "test" } });
      expect(onChangeSpy).toHaveBeenCalledWith("test");
    });
  });

  describe("onSubmit", () => {
    it("calls onSubmit when form is submitted", () => {
      const onSubmitSpy = vi.fn();
      render(() => <SearchField aria-label="Search" defaultValue="test" onSubmit={onSubmitSpy} />);
      const input = screen.getByRole("searchbox");
      fireEvent.keyDown(input, { key: "Enter" });
      expect(onSubmitSpy).toHaveBeenCalledWith("test");
    });
  });
});
