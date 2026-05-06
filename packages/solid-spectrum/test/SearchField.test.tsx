/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { SearchField } from "../src/searchfield";

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
